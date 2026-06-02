import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import type { CaptureSide } from "./types";

export interface CaptureDisplaySettings {
  leftLabel: string;
  rightLabel: string;
  targetRepositoryOwnerSide: CaptureSide;
  updatedAt: string;
}

const DEFAULT_SETTINGS_PATH = path.join(process.cwd(), "data", "developer-capture-settings.json");
const SETTINGS_PATH = path.resolve(process.env.CAPTURE_SETTINGS_PATH || DEFAULT_SETTINGS_PATH);

const DEFAULT_DISPLAY_SETTINGS: Omit<CaptureDisplaySettings, "updatedAt"> = {
  leftLabel: "Shadowmaster6g",
  rightLabel: "sleepeeee",
  targetRepositoryOwnerSide: "right",
};

function normalizeLabel(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeOwnerSide(value: unknown): CaptureSide {
  return value === "left" ? "left" : "right";
}

function getFallbackDisplaySettings(
  fallback: Partial<Omit<CaptureDisplaySettings, "updatedAt">> = {}
): Omit<CaptureDisplaySettings, "updatedAt"> {
  return {
    leftLabel: normalizeLabel(fallback.leftLabel, DEFAULT_DISPLAY_SETTINGS.leftLabel),
    rightLabel: normalizeLabel(fallback.rightLabel, DEFAULT_DISPLAY_SETTINGS.rightLabel),
    targetRepositoryOwnerSide: normalizeOwnerSide(fallback.targetRepositoryOwnerSide),
  };
}

export function getDefaultCaptureDisplaySettings(): CaptureDisplaySettings {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_DISPLAY_SETTINGS,
    updatedAt: now,
  };
}

export function readCaptureDisplaySettingsSync(
  fallback: Partial<Omit<CaptureDisplaySettings, "updatedAt">> = {}
): CaptureDisplaySettings {
  const base = getFallbackDisplaySettings(fallback);

  try {
    const content = readFileSync(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(content) as Partial<CaptureDisplaySettings>;
    return {
      leftLabel: normalizeLabel(parsed.leftLabel, base.leftLabel),
      rightLabel: normalizeLabel(parsed.rightLabel, base.rightLabel),
      targetRepositoryOwnerSide: normalizeOwnerSide(parsed.targetRepositoryOwnerSide ?? base.targetRepositoryOwnerSide),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return {
      ...base,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function saveCaptureDisplaySettings(
  input: Omit<CaptureDisplaySettings, "updatedAt">
): Promise<CaptureDisplaySettings> {
  const settings: CaptureDisplaySettings = {
    leftLabel: normalizeLabel(input.leftLabel, DEFAULT_DISPLAY_SETTINGS.leftLabel),
    rightLabel: normalizeLabel(input.rightLabel, DEFAULT_DISPLAY_SETTINGS.rightLabel),
    targetRepositoryOwnerSide: normalizeOwnerSide(input.targetRepositoryOwnerSide),
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settings;
}

export async function saveCaptureDisplayLabels(input: {
  leftLabel: string;
  rightLabel: string;
}): Promise<CaptureDisplaySettings> {
  const current = readCaptureDisplaySettingsSync();

  return saveCaptureDisplaySettings({
    leftLabel: input.leftLabel,
    rightLabel: input.rightLabel,
    targetRepositoryOwnerSide: current.targetRepositoryOwnerSide,
  });
}
