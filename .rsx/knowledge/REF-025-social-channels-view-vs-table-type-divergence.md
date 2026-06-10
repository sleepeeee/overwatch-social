---
id: REF-025
type: docs
title: social_channels 型別分歧：public_profiles view（遮罩布林）vs profiles base table（帳號字串）
url: n/a
status: active
references_to: [REF-024]
referenced_by: [ADR-25, F-026]
---

> type=docs 但無單一外部 URL（衍生自本專案 migration + C1 變更分析）；url 填 n/a。
> 本 REF 為 SURV 性質（survey 現有 schema 真相），歸入 docs type 以符 config 白名單。

## 探索動機（Stage 1）

C2 要用生成型別取代 `as` 斷言。`social_channels` 是**唯一一個 view 與 base table 型別語意不同**的欄位，
若盲目套生成型別會踩到型別謊言。此 REF 釐清真相，作為 design.md 轉換規則的依據。

## 兩個來源的真實型別

| 來源 | 內容 | jsonb 範例 | 生成型別（推測）|
|---|---|---|---|
| `profiles.social_channels`（base table）| 原始帳號字串 | `{"discord":"user#1234"}` | `Json`（Supabase jsonb 一律 `Json`）|
| `public_profiles.social_channels`（view，C1 後）| 遮罩布林 | `{"discord":true}` | `Json` |

**關鍵**：Supabase 生成型別把所有 `jsonb` 欄位都標為 `Json`（= `string | number | boolean | null | {[k]:Json} | Json[]`）。
→ 生成型別**不會**自動區分「字串值」vs「布林值」——兩者都是 `Json`。
→ 因此 social_channels 仍需在 row→card 轉換層做**明確的型別收斂**，不能靠生成型別自動解決。

## 現有程式碼如何使用（grep 結果）

| 位置 | 用法 | C2 後處置 |
|---|---|---|
| `profile.ts:35` getMyProfile（base table）| `data.social_channels ?? {}`（已無 as）| Json → `OWPlayerCard['social_channels']`，需窄化 |
| `profile.ts:61` getPublicProfile（view）| 直接設 `{}`（不讀 view 的 social_channels）| 維持；view 遮罩布林對 app domain 無意義 |
| `browse.ts:21` rowToCard（view）| `row.social_channels as Record<string,string>` | **型別謊言**：view 是布林不是字串。改為布林友善型別 |
| `OverwatchSquare.tsx:58`（view，client）| `row.social_channels as Record<string,string>` | 同上 |
| `OWCard.tsx:329`（消費）| `Object.entries(social_channels).map(...isEnabled)` | 已當布林用（`isEnabled`）→ 消費端早已假設布林 |
| `player/[id]/page.tsx:65`（base table）| `as Record<string,string>` | base table 是真帳號，此處字串斷言**正確**，保留或收斂 |

## 核心洞察（影響 design 決策）

1. **消費端（OWCard）早已把廣場的 social_channels 當布林**（`isEnabled`）——
   證明 view 遮罩布林是現行真相，`browse.ts:21` 的 `as Record<string,string>` 是**錯的型別斷言**（謊報為字串）。
2. **OWPlayerCard.social_channels 型別目前是 `{discord?:string;...}`（字串值）**——
   這對 base table（profile 編輯）正確，但對 view（廣場顯示）語意錯位。
3. C2 **不應**為消除一個 as 而改 OWPlayerCard 的 domain 型別（karpathy 簡約）。
   → design 決策：保留 OWPlayerCard 字串型別；轉換層對 view social_channels 做 `coerceMaskedChannels()`
     （Json → `Record<string, boolean>` 或維持現有「布林值塞進 string slot」的既有相容行為）。
   → **最小改動原則**：若改型別會擴散到 OWCard/廣場多檔，則僅把 `as Record<string,string>` 換成
     基於 `Row['social_channels']`（Json）的安全 narrowing helper，不動 OWPlayerCard。

## 風險標記（給 APPLY + Codex review）

- ⚠️ 這是 C2 **唯一**不能機械式「移除 as」的欄位。需要 helper 函式收斂 Json。
- ⚠️ 生成型別把布林與字串都當 Json → tsc 不會幫你抓「廣場顯示了真帳號」這種安全回歸。
  社群圖示是否正確顯示（布林）需**保留現有行為**並由 APPLY 階段 smoke 驗證。

## 相關 REF / ADR

- REF-024：生成型別 Database generic（Json 型別來源）
- ADR-01：DB 層 view 隱私遮蔽（social_channels 遮罩設計根源）
