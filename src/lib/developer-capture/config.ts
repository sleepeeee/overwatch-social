import path from "node:path";
import { readCaptureDisplaySettingsSync } from "./settings";
import type { CaptureConfig, CapturePlayerConfig } from "./types";

const DEFAULT_STATE_PATH = path.join(process.cwd(), "data", "developer-capture-state.json");
const DEFAULT_TARGET_REPOSITORY_URL = "https://github.com/sleepeeee/overwatch-social";

function splitAuthors(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function createPlayerConfig(side: "left" | "right", displaySettings: ReturnType<typeof readCaptureDisplaySettingsSync>): CapturePlayerConfig {
  const prefix = side === "left" ? "CAPTURE_LEFT" : "CAPTURE_RIGHT";
  const fallbackLabel = side === "left" ? "Shadowmaster6g" : "sleepeeee";
  const fallbackGithubUrl = side === "left" ? "https://github.com/Shadowmaster6g" : "https://github.com/sleepeeee";
  const fallbackAuthors = side === "left" ? "Shadowmaster6g" : "sleepeeee";
  const savedLabel = side === "left" ? displaySettings.leftLabel : displaySettings.rightLabel;

  return {
    side,
    label: savedLabel || process.env[`${prefix}_NAME`]?.trim() || fallbackLabel,
    githubUrl: process.env[`${prefix}_GITHUB_URL`]?.trim() || fallbackGithubUrl,
    authors: splitAuthors(process.env[`${prefix}_AUTHORS`] || fallbackAuthors),
  };
}

function assertSafeConfig(config: CaptureConfig): void {
  if (!path.isAbsolute(config.repositoryPath)) {
    throw new Error("CAPTURE_REPO_PATH 必須是絕對路徑，避免後端誤讀錯誤戰場。");
  }

  if (!path.isAbsolute(config.statePath)) {
    throw new Error("CAPTURE_STATE_PATH 必須是絕對路徑，避免狀態檔寫入未知位置。");
  }
}

function getRepositoryOwnerSide(): "left" | "right" {
  return process.env.CAPTURE_TARGET_REPOSITORY_OWNER === "left" ? "left" : "right";
}

export function getCaptureConfig(): CaptureConfig {
  const displaySettings = readCaptureDisplaySettingsSync({
    leftLabel: process.env.CAPTURE_LEFT_NAME?.trim() || "Shadowmaster6g",
    rightLabel: process.env.CAPTURE_RIGHT_NAME?.trim() || "sleepeeee",
    targetRepositoryOwnerSide: getRepositoryOwnerSide(),
  });

  const config: CaptureConfig = {
    repositoryPath: path.resolve(process.env.CAPTURE_REPO_PATH || process.cwd()),
    statePath: path.resolve(process.env.CAPTURE_STATE_PATH || DEFAULT_STATE_PATH),
    targetRepositoryUrl: process.env.CAPTURE_TARGET_REPOSITORY_URL?.trim() || DEFAULT_TARGET_REPOSITORY_URL,
    targetRepositoryOwnerSide: displaySettings.targetRepositoryOwnerSide,
    hudTheme: displaySettings.hudTheme,
    players: [createPlayerConfig("left", displaySettings), createPlayerConfig("right", displaySettings)],
  };

  assertSafeConfig(config);
  return config;
}

export function hasAuthorMapping(config: CaptureConfig): boolean {
  return config.players.every(player => player.authors.length > 0);
}
