import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitAuthorStats, RawCommitStats } from "./types";

const execFileAsync = promisify(execFile);
const COMMIT_MARKER = "--CAPTURE-COMMIT--";

export function getTaipeiDayStart(now = new Date()): Date {
  const taipeiParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = taipeiParts.find(part => part.type === "year")?.value;
  const month = taipeiParts.find(part => part.type === "month")?.value;
  const day = taipeiParts.find(part => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("無法計算台北時區每日戰場開始時間。");
  }

  return new Date(`${year}-${month}-${day}T00:00:00+08:00`);
}

export function getTaipeiDateLabel(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseNumstatLine(line: string): { additions: number; deletions: number } | null {
  const [rawAdditions, rawDeletions] = line.split(/\s+/, 3);
  const additions = Number(rawAdditions);
  const deletions = Number(rawDeletions);

  if (!Number.isFinite(additions) || !Number.isFinite(deletions)) {
    return null;
  }

  return { additions, deletions };
}

export function parseGitLogNumstat(output: string): RawCommitStats[] {
  const commits: RawCommitStats[] = [];
  let current: RawCommitStats | null = null;

  output.split(/\r?\n/).forEach(line => {
    if (line.startsWith(COMMIT_MARKER)) {
      const [authorName = "", authorEmail = ""] = line
        .slice(COMMIT_MARKER.length)
        .split("\u0000");

      current = {
        authorName,
        authorEmail,
        additions: 0,
        deletions: 0,
      };
      commits.push(current);
      return;
    }

    if (!current || !line.trim()) return;

    const parsed = parseNumstatLine(line);
    if (!parsed) return;

    current.additions += parsed.additions;
    current.deletions += parsed.deletions;
  });

  return commits;
}

export function aggregateAuthorStats(commits: RawCommitStats[]): GitAuthorStats[] {
  const stats = new Map<string, GitAuthorStats>();

  commits.forEach(commit => {
    const key = `${commit.authorName.toLowerCase()}\u0000${commit.authorEmail.toLowerCase()}`;
    const current = stats.get(key) ?? {
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

export async function readTodayGitAuthorStats(repositoryPath: string, now = new Date()): Promise<GitAuthorStats[]> {
  const since = getTaipeiDayStart(now).toISOString();
  const { stdout } = await execFileAsync(
    "git",
    [
      "-C",
      repositoryPath,
      "log",
      `--since=${since}`,
      "--pretty=format:--CAPTURE-COMMIT--%an%x00%ae",
      "--numstat",
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10,
    }
  );

  return aggregateAuthorStats(parseGitLogNumstat(stdout));
}
