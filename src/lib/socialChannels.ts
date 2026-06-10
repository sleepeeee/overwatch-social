import type { Json } from "@/types/database";
import type { OWPlayerCard } from "@/types/card";

/**
 * Json → OWPlayerCard.social_channels 的邊界轉換（anti-corruption layer 入口）。
 *
 * social_channels 在不同來源型別不同、但生成型別皆為 jsonb（Json）：
 * - profiles base table：實際帳號字串，如 `{ discord: "akira#1234" }`
 * - public_profiles view（C1 / migration 021 起）：遮罩後的布林存在性，如 `{ discord: true }`
 *
 * 生成型別無法於型別層區分兩者；前端 OWCard 僅以 value 的 truthiness 判斷是否渲染
 * 平台圖示，故統一在此收斂 Json → domain 的單一斷言點，取代散落各處的 `as` 斷言
 * （見 ADR-24 / F-025）。
 */
export function toSocialChannels(
  raw: Json | null | undefined
): OWPlayerCard["social_channels"] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as OWPlayerCard["social_channels"];
}
