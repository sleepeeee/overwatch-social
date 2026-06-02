import assert from "node:assert/strict";
import { describe, it } from "node:test";
import captureMeter from "../../scripts/recalculate-capture-meter.js";

const {
  aggregateAuthorStats,
  buildPlayerStats,
  calculatePercents,
  calculateScore,
  parseGitLogNumstat,
} = captureMeter;

describe("開發者據點佔領結算", () => {
  it("解析 git log --numstat 並依作者聚合", () => {
    const output = [
      "--CAPTURE-COMMIT--Alice\u0000alice@example.com",
      "120\t30\tsrc/app.ts",
      "",
      "--CAPTURE-COMMIT--Bob\u0000bob@example.com",
      "60\t10\tsrc/page.tsx",
      "",
      "--CAPTURE-COMMIT--Alice\u0000alice@example.com",
      "4\t2\tsrc/card.tsx",
    ].join("\n");

    const commits = parseGitLogNumstat(output);
    const stats = aggregateAuthorStats(commits);

    assert.deepEqual(stats.find(stat => stat.email === "alice@example.com"), {
      name: "Alice",
      email: "alice@example.com",
      commits: 2,
      additions: 124,
      deletions: 32,
    });
    assert.deepEqual(stats.find(stat => stat.email === "bob@example.com"), {
      name: "Bob",
      email: "bob@example.com",
      commits: 1,
      additions: 60,
      deletions: 10,
    });
  });

  it("依預設公式計算 3 commits、+120、-30 為 57 分", () => {
    assert.equal(calculateScore(3, 120, 30), 57);
  });

  it("依分數比例計算 57 對 33 約為 63% 對 37%", () => {
    assert.deepEqual(calculatePercents(57, 33), [63, 37]);
  });

  it("雙方 0 分時回傳中立據點", () => {
    assert.deepEqual(calculatePercents(0, 0), [50, 50]);
  });

  it("依 author mapping 建立雙方戰報", () => {
    const config = {
      repositoryPath: "/repo",
      statePath: "/state.json",
      players: [
        { side: "left", label: "你方", authors: ["alice@example.com"] },
        { side: "right", label: "朋友", authors: ["bob@example.com"] },
      ],
    };
    const stats = [
      { name: "Alice", email: "alice@example.com", commits: 3, additions: 120, deletions: 30 },
      { name: "Bob", email: "bob@example.com", commits: 2, additions: 60, deletions: 10 },
    ];

    const [left, right] = buildPlayerStats(config, stats);

    assert.equal(left.score, 57);
    assert.equal(right.score, 33);
    assert.equal(left.percent, 63);
    assert.equal(right.percent, 37);
  });
});
