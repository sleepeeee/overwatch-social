import { promises as fs } from "node:fs";
import path from "node:path";
import { getCaptureConfig, hasAuthorMapping } from "./config";
import { readCaptureDisplaySettingsSync } from "./settings";
import { getTaipeiDateLabel, readTodayGitAuthorStats } from "./git";
import { buildPlayerStats } from "./scoring";
import type { CaptureConfig, CaptureState } from "./types";

function createNeutralState(
  config: CaptureConfig,
  status: CaptureState["status"],
  message: string
): CaptureState {
  const now = new Date();
  return {
    date: getTaipeiDateLabel(now),
    timezone: "Asia/Taipei",
    updatedAt: now.toISOString(),
    repositoryPath: config.repositoryPath,
    targetRepositoryUrl: config.targetRepositoryUrl,
    targetRepositoryOwnerSide: config.targetRepositoryOwnerSide,
    hudTheme: config.hudTheme,
    hudLayout: config.hudLayout,
    status,
    message,
    players: [
      {
        side: "left",
        label: config.players[0].label,
        githubUrl: config.players[0].githubUrl,
        score: 0,
        percent: 50,
        commits: 0,
        additions: 0,
        deletions: 0,
      },
      {
        side: "right",
        label: config.players[1].label,
        githubUrl: config.players[1].githubUrl,
        score: 0,
        percent: 50,
        commits: 0,
        additions: 0,
        deletions: 0,
      },
    ],
  };
}

export async function readCaptureState(): Promise<CaptureState> {
  const config = getCaptureConfig();
  const displaySettings = readCaptureDisplaySettingsSync({
    leftLabel: config.players[0].label,
    rightLabel: config.players[1].label,
    targetRepositoryOwnerSide: config.targetRepositoryOwnerSide,
  });

  try {
    const content = await fs.readFile(config.statePath, "utf8");
    const state = JSON.parse(content) as CaptureState;
    return {
      ...state,
      targetRepositoryUrl: state.targetRepositoryUrl || config.targetRepositoryUrl,
    targetRepositoryOwnerSide: displaySettings.targetRepositoryOwnerSide || state.targetRepositoryOwnerSide || config.targetRepositoryOwnerSide,
    hudTheme: displaySettings.hudTheme,
    hudLayout: displaySettings.hudLayout,
    players: [
        {
          ...state.players[0],
          label: displaySettings.leftLabel || state.players[0].label || config.players[0].label,
          githubUrl: state.players[0].githubUrl || config.players[0].githubUrl,
        },
        {
          ...state.players[1],
          label: displaySettings.rightLabel || state.players[1].label || config.players[1].label,
          githubUrl: state.players[1].githubUrl || config.players[1].githubUrl,
        },
      ],
    };
  } catch {
    const fallbackState = createNeutralState(config, "neutral", "尚未產生據點戰報，請先執行後端重算。");
    return {
      ...fallbackState,
      targetRepositoryOwnerSide: displaySettings.targetRepositoryOwnerSide,
      hudTheme: displaySettings.hudTheme,
      hudLayout: displaySettings.hudLayout,
      players: [
        {
          ...fallbackState.players[0],
          label: displaySettings.leftLabel,
        },
        {
          ...fallbackState.players[1],
          label: displaySettings.rightLabel,
        },
      ],
    };
  }
}

export async function writeCaptureState(state: CaptureState, config = getCaptureConfig()): Promise<void> {
  await fs.mkdir(path.dirname(config.statePath), { recursive: true });
  await fs.writeFile(config.statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function recalculateCaptureState(now = new Date()): Promise<CaptureState> {
  const config = getCaptureConfig();

  if (!hasAuthorMapping(config)) {
    const state = createNeutralState(config, "missing-config", "尚未設定 CAPTURE_LEFT_AUTHORS 與 CAPTURE_RIGHT_AUTHORS。");
    await writeCaptureState(state, config);
    return state;
  }

  try {
    const authorStats = await readTodayGitAuthorStats(config.repositoryPath, now);
    const players = buildPlayerStats(config, authorStats);
    const totalScore = players[0].score + players[1].score;
    const state: CaptureState = {
      date: getTaipeiDateLabel(now),
      timezone: "Asia/Taipei",
      updatedAt: now.toISOString(),
      repositoryPath: config.repositoryPath,
      targetRepositoryUrl: config.targetRepositoryUrl,
      targetRepositoryOwnerSide: config.targetRepositoryOwnerSide,
      hudTheme: config.hudTheme,
      hudLayout: config.hudLayout,
      players,
      status: totalScore > 0 ? "ready" : "neutral",
      message: totalScore > 0 ? "據點戰報已更新。" : "今日尚無可計分提交，據點維持中立。",
    };

    await writeCaptureState(state, config);
    return state;
  } catch (error) {
    const state = createNeutralState(
      config,
      "git-error",
      error instanceof Error ? error.message : "Git 結算發生未知錯誤。"
    );
    await writeCaptureState(state, config);
    return state;
  }
}
