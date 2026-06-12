import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const APPLY_FLAG = "--apply";
const DEFAULT_GAME = "overwatch";
const TAGS_PER_CARD = 3;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function normalizeTagName(tagName) {
  return tagName.trim().replace(/^#+/, "");
}

function stablePickTags(tags, seed, count) {
  return [...tags]
    .map((tag) => {
      const hash = createHash("sha256").update(`${seed}:${tag}`).digest("hex");
      return { tag, sortKey: hash };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(0, count)
    .map((item) => item.tag);
}

function formatTags(tags) {
  return tags.length > 0 ? tags.map((tag) => `#${tag}`).join(", ") : "(空)";
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "..", ".env.local"));
loadEnvFile(resolve(process.cwd(), "..", ".env"));

const shouldApply = process.argv.includes(APPLY_FLAG);
const game = process.argv.find((arg) => arg.startsWith("--game="))?.split("=")[1] ?? DEFAULT_GAME;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  const missing = [
    !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
    !serviceKey ? "SUPABASE_SECRET_KEY 或 SUPABASE_SERVICE_ROLE_KEY" : "",
  ].filter(Boolean);
  console.error(`缺少 ${missing.join("、")}，無法執行標籤修復。`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: tagRows, error: tagError } = await supabase
  .from("game_special_tags")
  .select("tag_name")
  .eq("game_id", game)
  .order("created_at", { ascending: false });

if (tagError) {
  console.error(`讀取有效標籤失敗：${tagError.message}`);
  process.exit(1);
}

const validTags = [...new Set((tagRows ?? []).map((row) => normalizeTagName(row.tag_name)).filter(Boolean))];

if (validTags.length === 0) {
  console.error(`遊戲 ${game} 沒有可用標籤，中止修復，避免清空卡片標籤。`);
  process.exit(1);
}

const { data: publicRows, error: publicError } = await supabase
  .from("public_profiles")
  .select("user_id, battle_tag, tags, game, updated_at")
  .eq("game", game)
  .order("updated_at", { ascending: false });

if (publicError) {
  console.error(`讀取目前展示館卡片失敗：${publicError.message}`);
  process.exit(1);
}

const cards = (publicRows ?? []).filter((row) => row.user_id);

console.log(`模式：${shouldApply ? "APPLY" : "DRY-RUN"}`);
console.log(`遊戲：${game}`);
console.log(`有效標籤：${formatTags(validTags)}`);
console.log(`目前展示館卡片數：${cards.length}`);

if (cards.length === 0) {
  console.log("沒有需要處理的目前展示館卡片。");
  process.exit(0);
}

const plans = cards.map((card) => {
  const seed = `${card.user_id}:${card.battle_tag ?? ""}:${card.updated_at ?? ""}`;
  return {
    userId: card.user_id,
    battleTag: card.battle_tag ?? "(未命名)",
    oldTags: Array.isArray(card.tags) ? card.tags.map(normalizeTagName).filter(Boolean) : [],
    newTags: stablePickTags(validTags, seed, Math.min(TAGS_PER_CARD, validTags.length)),
  };
});

for (const plan of plans) {
  console.log(`- ${plan.battleTag} (${plan.userId})`);
  console.log(`  原標籤：${formatTags(plan.oldTags)}`);
  console.log(`  新標籤：${formatTags(plan.newTags)}`);
}

if (!shouldApply) {
  console.log(`DRY-RUN 完成；確認範圍無誤後執行：node scripts/repair-current-directory-tags.mjs ${APPLY_FLAG}`);
  process.exit(0);
}

for (const plan of plans) {
  const { error } = await supabase
    .from("profiles")
    .update({ tags: plan.newTags })
    .eq("user_id", plan.userId)
    .eq("game", game);

  if (error) {
    console.error(`更新 ${plan.battleTag} (${plan.userId}) 失敗：${error.message}`);
    process.exit(1);
  }
}

console.log(`已更新 ${plans.length} 張目前展示館卡片。`);
