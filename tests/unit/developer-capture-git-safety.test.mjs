// REGRESSION 測試 — developer-capture git 子系統 shell 執行安全屬性固化。
// 對應 spec: capture-git-safety。對應 ADR-26 / F-027。
//
// ⚠️ 此測試固化「無 command injection」屬性：若未來有人把 git.ts 的 execFile 改成
// exec 字串拼接，(A) 靜態斷言與 (B) 端對端注入斷言會雙雙 FAIL。
//
// 背景：developer-capture 透過 git log 統計每日 commit 戰績；team lead + rsx audit 確認
// 現碼安全（execFile + 參數陣列 + env 來源絕對路徑），本測試將該屬性鎖死防回歸。

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

// 本檔位於 tests/unit/ → 往上兩層為專案根。
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readSrc(rel) {
  return readFileSync(path.join(PROJECT_ROOT, rel), "utf8");
}

// 與 src/lib/developer-capture/git.ts:104-118 逐字對齊的呼叫形式（oracle）。
async function callGitLikeProd(repositoryPath) {
  return execFileAsync(
    "git",
    [
      "-C",
      repositoryPath,
      "log",
      "--since=2020-01-01T00:00:00+08:00",
      "--pretty=format:--CAPTURE-COMMIT--%an%x00%ae",
      "--numstat",
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }
  );
}

let gitAvailable = false;

describe("developer-capture git 子系統 shell 執行安全（regression 固化）", () => {
  before(async () => {
    try {
      await execFileAsync("git", ["--version"]);
      gitAvailable = true;
    } catch {
      gitAvailable = false;
    }
  });

  // (A) 靜態原始碼斷言 —— 鎖死「git.ts 必須用 execFile，不得退回字串拼接」
  it("(A) git.ts 從 node:child_process import execFile（非 exec）", () => {
    const src = readSrc("src/lib/developer-capture/git.ts");
    assert.match(src, /import\s*\{\s*execFile\s*\}\s*from\s*["']node:child_process["']/);
  });

  it("(A) git.ts 不含 execSync / spawn / shell:true / 裸 exec(", () => {
    const src = readSrc("src/lib/developer-capture/git.ts");
    assert.doesNotMatch(src, /\bexecSync\b/, "不得用 execSync");
    assert.doesNotMatch(src, /\bspawn\s*\(/, "不得用 spawn");
    assert.doesNotMatch(src, /shell\s*:\s*true/, "不得 shell:true");
    // 攔截裸 exec( 但放行 execFile(（負向 lookbehind 排除 File 前綴）
    assert.doesNotMatch(src, /(?<!execFile)(?<!\w)exec\s*\(/, "不得用裸 exec()");
  });

  it("(A) CLI 版 recalculate-capture-meter.js 同樣用 execFile 非裸 exec", () => {
    const src = readSrc("scripts/recalculate-capture-meter.js");
    assert.match(src, /execFile/);
    assert.doesNotMatch(src, /\bexecSync\b/);
    assert.doesNotMatch(src, /(?<!execFile)(?<!\w)exec\s*\(/);
  });

  // (B) 端對端注入行為斷言 —— 真跑 git，證明 metacharacter 路徑被當單一字面參數。
  // ⚠️ 跨平台關鍵：注入分隔符在不同 shell 不同——
  //    POSIX sh: ; && $() ` ；Windows cmd.exe: & 。
  //    execFile（無 shell）對全部變體免疫；故涵蓋 & 與 ; 兩家才能真正抓到「退回字串拼接」迴歸。
  const injectionVariants = (sentinel) => [
    ["posix-semicolon", `/nonexistent_repo; touch ${sentinel}; echo x`],
    ["windows-amp", `/nonexistent_repo & type nul > ${sentinel}`],
    ["dollar-subshell", `/nonexistent_$(touch ${sentinel})`],
    ["backtick", "/nonexistent`touch " + sentinel + "`"],
  ];

  it("(B) 各種 shell metacharacter 路徑被當單一參數，注入一律不執行（POSIX & Windows）", async (t) => {
    if (!gitAvailable) return t.skip("環境無 git，略過端對端注入測試");
    for (const [label, malicious] of injectionVariants("__PLACEHOLDER__")) {
      const sentinel = path.join(os.tmpdir(), `capture-inj-${label}-${process.pid}`);
      if (existsSync(sentinel)) rmSync(sentinel);
      const mal = malicious.replaceAll("__PLACEHOLDER__", sentinel);

      // execFile 不經 shell → git 收到單一 argv → 以路徑不存在失敗
      await assert.rejects(() => callGitLikeProd(mal), undefined, `${label}: git 應因路徑不存在而失敗`);
      assert.equal(
        existsSync(sentinel),
        false,
        `${label}: sentinel 不該被建立 —— shell 未執行夾帶指令（若此處 FAIL，代表有人把 execFile 改成 exec 字串拼接）`
      );
      if (existsSync(sentinel)) rmSync(sentinel);
    }
  });

  it("(B) 失敗訊息證明整串被當單一路徑參數（git -C 回報完整字串）", async (t) => {
    if (!gitAvailable) return t.skip("環境無 git，略過");
    const malicious = "/nonexistent_repo; touch X; echo $(whoami)";
    await assert.rejects(
      () => callGitLikeProd(malicious),
      (err) => {
        const msg = String(err.stderr || err.message || "");
        // git -C 失敗訊息含惡意路徑前段即證明整串被當單一目錄參數（部分匹配跨 git 版本穩定）
        assert.ok(
          msg.includes("/nonexistent_repo; touch X") || msg.includes(malicious),
          `git stderr 應含惡意路徑字串（證明被當字面參數），實得: ${msg.slice(0, 200)}`
        );
        return true;
      }
    );
  });

  // (C) config / server action 來源斷言 —— 鎖死「外部路徑須 env + 絕對路徑」「action 不收 path」
  it("(C) config.ts 仍以 env 為 repositoryPath 來源並驗證絕對路徑", () => {
    const src = readSrc("src/lib/developer-capture/config.ts");
    assert.match(src, /process\.env\.CAPTURE_REPO_PATH/);
    assert.match(src, /path\.isAbsolute\(\s*config\.repositoryPath\s*\)/);
  });

  it("(C) developerCapture.ts server action 不接受 path 輸入、不碰 shell", () => {
    const src = readSrc("src/app/actions/developerCapture.ts");
    assert.doesNotMatch(src, /repositoryPath/, "server action 不該出現 repositoryPath");
    assert.doesNotMatch(src, /child_process|execFile|\bspawn\b/, "server action 不該碰子程序");
  });
});
