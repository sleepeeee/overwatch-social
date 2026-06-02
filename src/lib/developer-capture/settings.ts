import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import type { CaptureHudLayout, CaptureHudTheme, CaptureSide } from "./types";

export interface CaptureDisplaySettings {
  leftLabel: string;
  rightLabel: string;
  targetRepositoryOwnerSide: CaptureSide;
  hudTheme: CaptureHudTheme;
  hudLayout: CaptureHudLayout;
  updatedAt: string;
}

const DEFAULT_SETTINGS_PATH = path.join(process.cwd(), "data", "developer-capture-settings.json");
const SETTINGS_PATH = path.resolve(process.env.CAPTURE_SETTINGS_PATH || DEFAULT_SETTINGS_PATH);

const DEFAULT_DISPLAY_SETTINGS: Omit<CaptureDisplaySettings, "updatedAt"> = {
  leftLabel: "Shadowmaster6g",
  rightLabel: "sleepeeee",
  targetRepositoryOwnerSide: "right",
  hudTheme: {
    darkBackground: "#0b0f19",
    darkCard: "#111827",
    lightBackground: "#f8fafc",
    lightCard: "#ffffff",
    leftAccent: "#00f0ff",
    rightAccent: "#f97316",
  },
  hudLayout: {
    offsetX: 0,
    offsetY: 0,
    scale: 0.78,
  },
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

function normalizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : fallback;
}

function normalizeHudTheme(value: unknown, fallback: CaptureHudTheme): CaptureHudTheme {
  const input = typeof value === "object" && value !== null ? value as Partial<CaptureHudTheme> : {};

  return {
    darkBackground: normalizeColor(input.darkBackground, fallback.darkBackground),
    darkCard: normalizeColor(input.darkCard, fallback.darkCard),
    lightBackground: normalizeColor(input.lightBackground, fallback.lightBackground),
    lightCard: normalizeColor(input.lightCard, fallback.lightCard),
    leftAccent: normalizeColor(input.leftAccent, fallback.leftAccent),
    rightAccent: normalizeColor(input.rightAccent, fallback.rightAccent),
  };
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function normalizeHudLayout(value: unknown, fallback: CaptureHudLayout): CaptureHudLayout {
  const input = typeof value === "object" && value !== null ? value as Partial<CaptureHudLayout> : {};

  return {
    offsetX: Math.round(normalizeNumber(input.offsetX, fallback.offsetX, -160, 160)),
    offsetY: Math.round(normalizeNumber(input.offsetY, fallback.offsetY, -120, 120)),
    scale: Math.round(normalizeNumber(input.scale, fallback.scale, 0.6, 1.1) * 100) / 100,
  };
}

function getFallbackDisplaySettings(
  fallback: Partial<Omit<CaptureDisplaySettings, "updatedAt">> = {}
): Omit<CaptureDisplaySettings, "updatedAt"> {
  return {
    leftLabel: normalizeLabel(fallback.leftLabel, DEFAULT_DISPLAY_SETTINGS.leftLabel),
    rightLabel: normalizeLabel(fallback.rightLabel, DEFAULT_DISPLAY_SETTINGS.rightLabel),
    targetRepositoryOwnerSide: normalizeOwnerSide(fallback.targetRepositoryOwnerSide),
    hudTheme: normalizeHudTheme(fallback.hudTheme, DEFAULT_DISPLAY_SETTINGS.hudTheme),
    hudLayout: normalizeHudLayout(fallback.hudLayout, DEFAULT_DISPLAY_SETTINGS.hudLayout),
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
      hudTheme: normalizeHudTheme(parsed.hudTheme, base.hudTheme),
      hudLayout: normalizeHudLayout(parsed.hudLayout, base.hudLayout),
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
    hudTheme: normalizeHudTheme(input.hudTheme, DEFAULT_DISPLAY_SETTINGS.hudTheme),
    hudLayout: normalizeHudLayout(input.hudLayout, DEFAULT_DISPLAY_SETTINGS.hudLayout),
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
    hudTheme: current.hudTheme,
    hudLayout: current.hudLayout,
  });
}
