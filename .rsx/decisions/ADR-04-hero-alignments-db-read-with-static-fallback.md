---
id: ADR-04
title: "hero_alignments 採 DB read + static fallback（vs 純 DB / 純 static）"
status: Accepted
change: developer-console-backend
date: 2026-06-02
references_to: [REF-004, F-004]
referenced_by: [F-004]
---

## 決策

`getHeroAlignments(userId)` Server Action 採「DB read 優先，無資料時 fallback 至 `mockPlayers.ts` 靜態預設值」的兩階段讀取策略。

實作：
1. 以 `supabase.from('hero_alignments').select(...).eq('user_id', userId)` 查詢 `hero_alignments` 表。
2. 若查詢無結果（新用戶尚未設定），回傳 `mockPlayers.ts` 的英雄預設排列（51 筆 seed 的對應值）。
3. `saveHeroAlignments(userId, alignments)` 以 upsert 寫入，配合 `revalidatePath('/profile')` 刷新 Next.js cache。

## 考量選項

| 選項 | 優點 | 缺點 |
|---|---|---|
| **DB read + static fallback（採用）** | 新用戶立即有初始資料體驗；seed 51 筆確保廣場有內容；DB 為 source of truth | fallback 邏輯需維護（若 mockPlayers 更新需同步考量）|
| 純 DB（無 fallback） | 邏輯單純 | 新用戶首次進入時無英雄排列顯示，體驗空白；廣場冷啟動需等真實用戶資料累積 |
| 純 static（不用 DB） | 零 DB 讀取成本 | 個人化資料無法持久化（即 F-004 描述的根本問題）；Vercel 靜默失敗 |
| Redis / KV 快取層 | 高讀取效能 | MVP 階段過度工程；增加依賴與維護負擔 |

## 理由

1. **修復 F-004 根因**：`fs.writeFileSync` 的靜默失敗問題（F-004）要求所有持久化必須走 Supabase DB；DB read 是此修復的必然結果。
2. **漸進式體驗**：新用戶首次訪問 profile 頁時，若 DB 無紀錄，展示靜態預設值（與 `mockPlayers.ts` 的 seed 資料語意一致），避免空白畫面；用戶修改後即寫入 DB，下次讀取以 DB 值優先。
3. **RLS 安全邊界**：`hero_alignments` 表啟用 RLS（`auth.uid() = user_id` policy），確保寫入路徑只能操作自己的資料（REF-004 一致）；`getHeroAlignments` 透過 authenticated client 讀取，developer profiles policy 讓開發者可讀取所有資料（後台統計需求）。
4. **Seed 一致性**：migration 003 的 51 筆 seed 以 `mockPlayers.ts` 的英雄資料為基礎填入，確保 fallback 值與 DB seed 在語意上一致，新用戶看到的「預設狀態」與廣場展示的 seed 資料視覺一致。

## 影響與約束

- `getHeroAlignments` 的 fallback 分支會隨 `mockPlayers.ts` 的靜態資料演化而變；若未來英雄池更新（新英雄加入），需同步更新 fallback 邏輯與 migration seed。
- **developer profiles policy**：`hero_alignments` 表建有「developers 可 SELECT 所有 row」的 RLS policy，以支援後台 `getSystemStats()` 統計；一般用戶仍只能讀寫自己的 row。
- `revalidatePath('/profile')` 在 upsert 後強制 ISR 刷新，確保 profile 頁面反映最新的 alignments；`/browse` 頁面的刷新頻率依 Vercel ISR revalidation 週期（目前預設 60 秒），可接受。
- B1（後台統計）的 `getSystemStats()` 真實計數查詢依賴此 RLS policy 設計，兩者需同步維護。

## 相關 REF / Finding

- REF-004：RLS policy 設計（hero_alignments 表的授權模型依據）
- F-004：Vercel serverless 唯讀 filesystem 根因 → 直接觸發本 ADR 的 DB 讀取方案
