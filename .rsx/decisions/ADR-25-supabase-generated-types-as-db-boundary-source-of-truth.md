---
id: ADR-25
title: "採用 Supabase 生成型別作為 DB 邊界事實來源 + 保留 OWPlayerCard 作 anti-corruption layer"
status: Accepted
change: adopt-supabase-generated-types
date: 2026-06-11
references_to: [REF-024, REF-025, REF-026, F-026, ADR-24, ADR-01]
referenced_by: [F-026]
---

## 決策

1. `src/types/database.ts`（Supabase 生成型別）作為所有 DB 查詢回傳值的**邊界型別事實來源**；
   `createClient<Database>` 泛型注入至 `server.ts` / `client.ts`，全 codebase 的 `.from().select()` 自動帶型別。
2. **保留 `OWPlayerCard`（手寫 domain 型別）作 anti-corruption layer**，不以生成型別取代；
   row→card 轉換仍在 Server Action 層（`browse.ts` / `profile.ts`）完成。
3. `social_channels` 的 `Json → OWPlayerCard['social_channels']` 邊界轉換收斂於
   `src/lib/socialChannels.ts` 的 `toSocialChannels()` helper（單點斷言）。
4. `PLACEHOLDER_BATTLE_TAG` 常數抽至 `src/types/card.ts`，消除 `developer.ts` + `developer/page.tsx`
   重複的魔術字串 `"愛喝奶茶#3342"`。

## 背景

C2（adopt-supabase-generated-types）在 C1（harden-supabase-security）完成後啟動。
C1 已在 DB 邊界做了正確的安全設計（[[ADR-24]] definer view + 遮罩），但 TS 層仍有 44 個手動 `as` 斷言：
- `browse.ts` 14 個、`profile.ts` 14 個、`homepage.ts` 6 個、`developer.ts` 5 個、其餘周邊 5 個
- 這些斷言讓拼字錯誤、欄位改名在編譯期靜默，需要生成型別來消除。

## 考量選項

### 方案 1（採用）：生成型別 + 保留 OWPlayerCard

```
DB schema → Supabase gen types → Database['public']['Tables/Views'][...]['Row']
  ↓
row→card 轉換層（browse.ts / profile.ts）
  ↓
OWPlayerCard（hand-crafted domain type）→ UI 元件
```

- 生成型別承擔「DB 邊界正確性」（欄位名/nullable/型別）
- OWPlayerCard 承擔「app domain 語意」（card_id 衍生、mic_status union、server 正規化等）
- 兩層職責清晰，互不越界

**優點**：
- 編譯期欄位名保護（`.eq('server', x)` 的 `server` 拼錯會報錯）
- OWPlayerCard 不受 DB schema 漂移污染（ADR 語意穩定）
- anti-corruption layer 保護 UI 元件免受 DB 型別細節滲透

### 方案 2（否決）：以生成型別完全取代 OWPlayerCard

- 讓 UI 元件直接消費 `Database['public']['Views']['public_profiles']['Row']`
- 問題：DB jsonb 欄位（social_channels/alignments/selected_heroes）均為 `Json`，
  UI 需大量 runtime narrowing；view vs table 型別分歧（`social_channels` 遮罩 vs 真帳號）
  直接在 UI 層處理增加複雜度；未來 DB schema 變更直接衝擊 UI 元件。

## 生成型別 vs 手寫 domain 型別的分界原則

| 職責 | 由誰承擔 | 理由 |
|---|---|---|
| 欄位存在性驗證（拼字）| 生成型別（Database Row）| DB schema 是真相來源 |
| nullable 保護（? 欄位）| 生成型別（Database Row）| 反映 DB NOT NULL 設計 |
| jsonb 內部結構（Json→domain）| 轉換層 helper | tsc 無法推斷 jsonb 內容；需 runtime narrowing |
| domain 語意（mic_status union）| OWPlayerCard + 轉換層 narrowing | DB 存 string，app domain 是 enum |
| 衍生欄位（card_id = user_id）| OWPlayerCard + 轉換層 | 非 DB 欄位，純 domain 建構 |
| server 正規化（asia/kr/jp→canonical）| Server Action 層 | DB 值已是 canonical，但 OWPlayerCard 保護消費端 |

## createClient<Database> 泛型注入策略

泛型注入**一次性**改 `server.ts` / `client.ts` 兩處，全 codebase 免修改自動帶型別：

```ts
// server.ts
import type { Database } from "@/types/database";
createServerClient<Database>(url, key, { cookies: { ... } })

// client.ts
createBrowserClient<Database>(url, key)
```

注入後 `.from('profiles').select('*')` 的 data 自動推為
`Tables<'profiles'>['Row'][]`，無需逐查詢添加型別。

## social_channels 邊界處理（與 [[REF-025]] / [[F-026]] 的關係）

`social_channels` 是**唯一**在 view（遮罩布林）與 base table（帳號字串）語意不同的欄位。
生成型別兩處均為 `Json`（Supabase jsonb 一律 `Json`），tsc 無法區分。

設計決策：
- `toSocialChannels(raw: Json | null): OWPlayerCard['social_channels']` 作為**唯一斷言點**
- browse.ts rowToCard 與廣場 client 元件均走此 helper（取代 `as Record<string,string>`）
- player/[id]/page.tsx（base table 真帳號）：helper 的字串分支處理，語意正確
- **型別謊言集中管理**：`toSocialChannels` 是系統內唯一知道「view 是布林、table 是字串」的位置

## homepage.ts 的 `as unknown as Json` 邊界

`getAnnouncements` 在送入 DB 前需把 `Partial<AlignmentConfig>` 轉為 `Json`。
由於 `AlignmentConfig`（手寫型別）不可直接指派給 `Json`（Supabase union），
`as unknown as Json` 是合理的邊界轉換（domain→DB 方向），已在程式碼加入文件化註解。

## 與 ADR-01 / ADR-24 的關係

- [[ADR-01]]（DB 層 view 隱私遮蔽）：本 ADR 採用生成型別不影響 ADR-01 的遮蔽設計；
  生成型別誠實反映 C1 後的生產 DB（social_channels 為 `Json`），無需另做 DB 修改。
- [[ADR-24]]（definer view + 遮罩）：C2 純 TS 層；不動 DB 邊界；ADR-24 決策不受影響。
- **生產 DB vs migration drift**：`database.ts` 反映生產 DB（C1 遮罩版），
  repo migration 015/017 仍是未遮罩版。此 drift 已知、非 C2 範圍；
  database.ts 頂部有文件化說明（`// Generated from production DB post migration 021`）。

## follow-up 登記（來自 Gemini §6.5 NICE-TO-HAVE）

1. **profile.ts `getPublicProfile` 與 `browse.ts` `rowToCard` view-row→OWPlayerCard 轉換重複**：
   可抽取共用 helper（如 `viewRowToCard(row: ViewRow): OWPlayerCard`），
   消除兩處 Server Action 的重複轉換邏輯。列為後續 refactor change 候選。

2. **`toSocialChannels` 具名分裂（可選）**：
   可進一步拆為 `viewSocialChannels(raw: Json)` / `tableSocialChannels(raw: Json)`，
   明確區分遮罩布林 vs 真帳號語意。目前單一 helper 已收斂，此項優先度低。

## 相關 REF / Finding / ADR

- [[REF-024]]：Supabase 生成型別 Database generic + createClient 泛型注入（核心技術參考）
- [[REF-025]]：social_channels view vs base table 型別分歧（toSocialChannels helper 設計依據）
- [[REF-026]]：getSystemStats 魔術字串審計（PLACEHOLDER_BATTLE_TAG 方案 A 依據）
- [[F-026]]：social_channels 型別分歧 + helper 收斂通則（本 change 核心 finding）
- [[ADR-24]]：C1 的 DB 邊界設計（definer view + 遮罩；本 ADR 在 TS 層延伸）
- [[ADR-01]]：DB 層 view 隱私遮蔽決策（生成型別忠實反映其結果）
