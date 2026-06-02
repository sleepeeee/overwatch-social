const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const COMMIT_MARKER = "--CAPTURE-COMMIT--";
const DEFAULT_LEFT_LABEL = "Shadowmaster6g";
const DEFAULT_RIGHT_LABEL = "sleepeeee";
const DEFAULT_LEFT_GITHUB_URL = "https://github.com/Shadowmaster6g";
const DEFAULT_RIGHT_GITHUB_URL = "https://github.com/sleepeeee";
const DEFAULT_TARGET_REPOSITORY_URL = "https://github.com/sleepeeee/overwatch-social";
const DEFAULT_SETTINGS_PATH = path.join(process.cwd(), "data", "developer-capture-settings.json");

function splitAuthors(value) {
  return (value || "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function getRepositoryOwnerSide() {
  return process.env.CAPTURE_TARGET_REPOSITORY_OWNER === "left" ? "left" : "right";
}

async function readCaptureDisplaySettings() {
  const fallback = {
    leftLabel: process.env.CAPTURE_LEFT_NAME || DEFAULT_LEFT_LABEL,
    rightLabel: process.env.CAPTURE_RIGHT_NAME || DEFAULT_RIGHT_LABEL,
    targetRepositoryOwnerSide: getRepositoryOwnerSide(),
  };

  try {
    const content = await fs.readFile(path.resolve(process.env.CAPTURE_SETTINGS_PATH || DEFAULT_SETTINGS_PATH), "utf8");
    const parsed = JSON.parse(content);
    return {
      leftLabel: typeof parsed.leftLabel === "string" && parsed.leftLabel.trim() ? parsed.leftLabel.trim() : fallback.leftLabel,
      rightLabel: typeof parsed.rightLabel === "string" && parsed.rightLabel.trim() ? parsed.rightLabel.trim() : fallback.rightLabel,
      targetRepositoryOwnerSide: parsed.targetRepositoryOwnerSide === "left" ? "left" : parsed.targetRepositoryOwnerSide === "right" ? "right" : fallback.targetRepositoryOwnerSide,
    };
  } catch {
    return fallback;
  }
}

async function getConfig() {
  const displaySettings = await readCaptureDisplaySettings();
  const repositoryPath = path.resolve(process.env.CAPTURE_REPO_PATH || process.cwd());
  const statePath = path.resolve(
    process.env.CAPTURE_STATE_PATH || path.join(process.cwd(), "data", "developer-capture-state.json")
  );

  return {
    repositoryPath,
    statePath,
    players: [
      {
        side: "left",
        label: displaySettings.leftLabel,
        githubUrl: process.env.CAPTURE_LEFT_GITHUB_URL || DEFAULT_LEFT_GITHUB_URL,
        authors: splitAuthors(process.env.CAPTURE_LEFT_AUTHORS || "Shadowmaster6g"),
      },
      {
        side: "right",
        label: displaySettings.rightLabel,
        githubUrl: process.env.CAPTURE_RIGHT_GITHUB_URL || DEFAULT_RIGHT_GITHUB_URL,
        authors: splitAuthors(process.env.CAPTURE_RIGHT_AUTHORS || "sleepeeee"),
      },
    ],
    targetRepositoryUrl: process.env.CAPTURE_TARGET_REPOSITORY_URL || DEFAULT_TARGET_REPOSITORY_URL,
    targetRepositoryOwnerSide: displaySettings.targetRepositoryOwnerSide,
  };
}

function getTaipeiDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getTaipeiDayStart(now = new Date()) {
  return new Date(`${getTaipeiDate(now)}T00:00:00+08:00`);
}

function parseGitLogNumstat(output) {
  const commits = [];
  let current = null;

  output.split(/\r?\n/).forEach(line => {
    if (line.startsWith(COMMIT_MARKER)) {
      const [authorName = "", authorEmail = ""] = line.slice(COMMIT_MARKER.length).split("\u0000");
      current = { authorName, authorEmail, additions: 0, deletions: 0 };
      commits.push(current);
      return;
    }

    if (!current || !line.trim()) return;

    const [rawAdditions, rawDeletions] = line.split(/\s+/, 3);
    const additions = Number(rawAdditions);
    const deletions = Number(rawDeletions);
    if (!Number.isFinite(additions) || !Number.isFinite(deletions)) return;

    current.additions += additions;
    current.deletions += deletions;
  });

  return commits;
}

function aggregateAuthorStats(commits) {
  const stats = new Map();

  commits.forEach(commit => {
    const key = `${commit.authorName.toLowerCase()}\u0000${commit.authorEmail.toLowerCase()}`;
    const current = stats.get(key) || {
      name: commit.authorName,
      email: commit.authorEmail,
      commits: 0,
      additions: 0,
      deletions: 0,
    };

    current.commits += 1;
    current.additions += commit.additions;
    current.deletions += commit.deletions;
    stats.set(key, current);
  });

  return [...stats.values()];
}

function calculateScore(commits, additions, deletions) {
  return Number((commits * 10 + additions * 0.2 + deletions * 0.1).toFixed(2));
}

function calculatePercents(leftScore, rightScore) {
  const total = leftScore + rightScore;
  if (total <= 0) return [50, 50];
  const leftPercent = Math.round((leftScore / total) * 100);
  return [leftPercent, 100 - leftPercent];
}

async function readTodayGitAuthorStats(repositoryPath, now = new Date()) {
  const { stdout } = await execFileAsync("git", [
    "-C",
    repositoryPath,
    "log",
    `--since=${getTaipeiDayStart(now).toISOString()}`,
    "--pretty=format:--CAPTURE-COMMIT--%an%x00%ae",
    "--numstat",
  ], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10,
  });

  return aggregateAuthorStats(parseGitLogNumstat(stdout));
}

function createNeutralState(config, status, message) {
  const now = new Date();
  return {
    date: getTaipeiDate(now),
    timezone: "Asia/Taipei",
    updatedAt: now.toISOString(),
    repositoryPath: config.repositoryPath,
    targetRepositoryUrl: config.targetRepositoryUrl,
    targetRepositoryOwnerSide: config.targetRepositoryOwnerSide,
    status,
    message,
    players: config.players.map(player => ({
      side: player.side,
      label: player.label,
      githubUrl: player.githubUrl,
      score: 0,
      percent: 50,
      commits: 0,
      additions: 0,
      deletions: 0,
    })),
  };
}

function buildPlayerStats(config, authorStats) {
  const statsByAuthor = new Map();
  authorStats.forEach(stat => {
    statsByAuthor.set(stat.name.toLowerCase(), stat);
    statsByAuthor.set(stat.email.toLowerCase(), stat);
  });

  const players = config.players.map(player => {
    const totals = player.authors.reduce((acc, author) => {
      const stat = statsByAuthor.get(author.toLowerCase());
      if (!stat) return acc;
      return {
        commits: acc.commits + stat.commits,
        additions: acc.additions + stat.additions,
        deletions: acc.deletions + stat.deletions,
      };
    }, { commits: 0, additions: 0, deletions: 0 });

    return {
      side: player.side,
      label: player.label,
      githubUrl: player.githubUrl,
      score: calculateScore(totals.commits, totals.additions, totals.deletions),
      percent: 50,
      commits: totals.commits,
      additions: totals.additions,
      deletions: totals.deletions,
    };
  });

  const [leftPercent, rightPercent] = calculatePercents(players[0].score, players[1].score);
  players[0].percent = leftPercent;
  players[1].percent = rightPercent;
  return players;
}

async function writeState(config, state) {
  await fs.mkdir(path.dirname(config.statePath), { recursive: true });
  await fs.writeFile(config.statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function main() {
  const config = await getConfig();
  if (config.players.some(player => player.authors.length === 0)) {
    const state = createNeutralState(config, "missing-config", "尚未設定 CAPTURE_LEFT_AUTHORS 與 CAPTURE_RIGHT_AUTHORS。");
    await writeState(config, state);
    console.log(`[capture-meter] ${state.message}`);
    return;
  }

  try {
    const authorStats = await readTodayGitAuthorStats(config.repositoryPath);
    const players = buildPlayerStats(config, authorStats);
    const totalScore = players[0].score + players[1].score;
    const now = new Date();
    const state = {
      date: getTaipeiDate(now),
      timezone: "Asia/Taipei",
      updatedAt: now.toISOString(),
      repositoryPath: config.repositoryPath,
      targetRepositoryUrl: config.targetRepositoryUrl,
      targetRepositoryOwnerSide: config.targetRepositoryOwnerSide,
      players,
      status: totalScore > 0 ? "ready" : "neutral",
      message: totalScore > 0 ? "據點戰報已更新。" : "今日尚無可計分提交，據點維持中立。",
    };

    await writeState(config, state);
    console.log(`[capture-meter] ${players[0].label} ${players[0].percent}% / ${players[1].percent}% ${players[1].label}`);
  } catch (error) {
    const state = createNeutralState(config, "git-error", error instanceof Error ? error.message : "Git 結算發生未知錯誤。");
    await writeState(config, state);
    console.error(`[capture-meter] ${state.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  aggregateAuthorStats,
  buildPlayerStats,
  calculatePercents,
  calculateScore,
  parseGitLogNumstat,
};
