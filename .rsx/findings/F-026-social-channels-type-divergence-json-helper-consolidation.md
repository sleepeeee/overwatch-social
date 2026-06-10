---
id: F-026
type: finding
title: "social_channels 在 view（遮罩布林）與 base table（帳號字串）生成型別皆為 Json，tsc 無法防護語意分歧——以單一 helper 收斂為型別謊言集中管理通則"
status: confirmed
confidence: high
change: adopt-supabase-generated-types
date: 2026-06-11
references_to: [F-025, REF-025, REF-024, ADR-25, ADR-24]
referenced_by: [F-025, REF-025, ADR-25]
supporting_refs: [REF-025, F-025]
---

## 結論 / 數據

C2（adopt-supabase-generated-types）執行 `createClient<Database>` 泛型注入後發現：

```ts
// public_profiles view（C1 遮罩後）的 social_channels
// 生產 DB 實際值：{"discord": true}
type ViewRow['social_channels'] = Json  // Supabase 對所有 jsonb 一律標 Json

// profiles base table 的 social_channels
// 生產 DB 實際值：{"discord": "akira#1234"}
type TableRow['social_channels'] = Json  // 同上，無法區分
```

**量化影響**：
- `social_channels` 是 C2 範圍內**唯一**生成型別無法機械式移除 `as` 的欄位
- 原有 `as Record<string,string>` 在廣場 view row 是**型別謊言**（view 實際為布林值，非字串）
- tsc 0 errors 無法幫你抓「廣場顯示了真帳號」這種隱私回歸，需要 runtime smoke 兜底
- 生成型別把所有 jsonb 欄位標為 `Json`（= `string | number | boolean | null | {[k]:Json} | Json[]`），
  無論 value 是布林還是字串皆相同，編譯期完全無法區分

**驗收數據**（C2 apply 後）：
- `npx tsc --noEmit`：0 errors
- `npm run build`：Compiled successfully，16/16 static pages
- social_channels 廣場顯示：型別護欄 + C1 遮罩資料 + OWCard truthiness 三重確認通過
  （視覺 e2e 待 team lead/user 手動確認）

## 與既有 REF/Finding 一致或矛盾

**承接 [[F-025]]**（C1 social_channels 遮罩布林 finding）：

F-025 確立了 DB 邊界的正確性（view = 遮罩布林，base table = 真帳號）。
本 Finding 進一步發現：即使 DB 邊界正確，**TS 層仍有型別謊言問題**——
生成型別無法區分布林與字串，需要在 row→card 轉換層額外處理。

F-025 的問題是「DB 邊界的安全設計」（C1 解決）；
本 Finding 的問題是「TS 型別系統的局限性」（C2 以 helper 處置）。
兩者互補，各自獨立。

**符合 [[REF-025]]**（social_channels 型別分歧前置分析）：

REF-025 於 PROPOSE 階段已預測「`social_channels` 是 C2 唯一不能機械式移除 as 的欄位」。
本 Finding 確認此預測準確，並記錄 apply 後的處置方案與結果。

**補充 [[ADR-24]]**（definer view + 遮罩設計）：

ADR-24 確保 DB 邊界隱私正確；但 TS 層的 Json 型別是 Supabase 生成型別的結構性限制，
與 definer/invoker 選擇無關。即使 ADR-24 換方案，`social_channels` 的 Json 問題仍存在。

## 對後續影響

**通則：jsonb 欄位的「型別謊言集中管理」模式**

當 jsonb 欄位在不同查詢來源有語意不同的值（如 view 遮罩 vs base table 原始），
且生成型別均為 `Json` 時，推薦以下模式：

```ts
// 單點斷言 helper（src/lib/<domain>.ts）
export function toSocialChannels(
  raw: Json | null
): OWPlayerCard['social_channels'] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  // 型別謊言集中在此：view 值（boolean）與 table 值（string）均走此函式
  // OWCard 消費端只需 key 存在性（if (social_channels.discord)）
  // → boolean true 與 string "akira#1234" 均視為 truthy，行為相容
  return raw as OWPlayerCard['social_channels'];
}
```

**應用原則**：
1. **一個 jsonb 欄位 → 最多一個 helper**（不在 rowToCard 散落多處 `as`）
2. **helper 加文件化註解**說明「為何需要此斷言」（語意分歧來源）
3. **不靠 tsc 防護隱私回歸**：jsonb → Json 的邊界需保留 runtime smoke 驗證計畫
4. **OWPlayerCard anti-corruption layer 優先**：改 helper 而非改 OWPlayerCard domain 型別
   （避免改動擴散至 UI 元件）

**Migration 審查 checklist 新增項**（承接 F-025 通則）：

- 若 migration 改變 jsonb 欄位的值語意（如 view 遮罩、加欄位），
  須同步更新對應 helper 並重跑 `npx tsc --noEmit`
- 生成型別 `database.ts` 在 migration 套用後需重新生成（`mcp__supabase__generate_typescript_types`）

**follow-up**：
- `toSocialChannels` 可進一步拆為具名版本（`viewSocialChannels` / `tableSocialChannels`），
  明確區分遮罩布林 vs 真帳號語意（見 [[ADR-25]] follow-up 項目 2，優先度低）
- 長期解：`social_channels` 拆到獨立 `profile_contacts` 表（見 [[ADR-24]] follow-up），
  view 不再含此欄位，型別分歧問題自然消除
