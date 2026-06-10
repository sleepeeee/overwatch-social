export const GAME_IDS = ["overwatch", "valorant", "lol"] as const;

export type GameId = (typeof GAME_IDS)[number];

export interface GameOption {
  value: GameId;
  label: string;
}

export interface ServerOption {
  value: string;
  label: string;
  labelEn: string;
}

export const GAME_OPTIONS: GameOption[] = [
  { value: "overwatch", label: "鬥陣特工" },
  { value: "valorant", label: "特戰英豪" },
  { value: "lol", label: "英雄聯盟" },
];

export const OVERWATCH_SERVER_OPTIONS: ServerOption[] = [
  // 防呆雷達：value 是存進資料庫的代號，請不要改成中文顯示文字。
  { value: "asia", label: "亞洲伺服器", labelEn: "Asia Server" },
  { value: "america", label: "美洲伺服器", labelEn: "America Server" },
  { value: "europe", label: "歐洲伺服器", labelEn: "Europe Server" },
];

const OVERWATCH_SERVER_ALIASES: Record<string, string> = {
  asia: "asia",
  "asia server": "asia",
  "亞洲 (asia)": "asia",
  "亞洲伺服器": "asia",
  "亞太伺服器": "asia",
  "亞太 (apac)": "asia",
  america: "america",
  "america server": "america",
  "美洲伺服器": "america",
  "北美 (na)": "america",
  europe: "europe",
  "europe server": "europe",
  "歐洲伺服器": "europe",
  "歐洲 (eu)": "europe",
};

export function normalizeGameId(value: string | null | undefined): GameId {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "valorant" || normalized === "lol") return normalized;
  return "overwatch";
}

export function normalizeOverwatchServer(value: string | null | undefined): string {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "asia";
  return OVERWATCH_SERVER_ALIASES[normalized] ?? "asia";
}

export function getOverwatchServerLabel(value: string | null | undefined): string {
  const server = normalizeOverwatchServer(value);
  return OVERWATCH_SERVER_OPTIONS.find((option) => option.value === server)?.label ?? "亞洲伺服器";
}
