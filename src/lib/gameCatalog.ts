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

// 遊戲開放旗標（單一事實來源）：名片編輯器只對 true 的遊戲開放，
// 其餘在工作室顯示 COMING SOON。未來第二款遊戲實作完成時改 true 即可。
export const GAME_AVAILABILITY: Record<GameId, boolean> = {
  overwatch: true,
  valorant: false,
  lol: false,
};

export const OVERWATCH_SERVER_OPTIONS: ServerOption[] = [
  // 防呆雷達：value 是存進資料庫的代號，請不要改成中文顯示文字。
  { value: "asia", label: "Asia Server", labelEn: "Asia Server" },
  { value: "america", label: "America Server", labelEn: "America Server" },
  { value: "europe", label: "Europe Server", labelEn: "Europe Server" },
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
  return OVERWATCH_SERVER_OPTIONS.find((option) => option.value === server)?.label ?? "Asia Server";
}

export function getOverwatchServerLabelEn(value: string | null | undefined): string {
  const server = normalizeOverwatchServer(value);
  return OVERWATCH_SERVER_OPTIONS.find((option) => option.value === server)?.labelEn ?? "Asia Server";
}
