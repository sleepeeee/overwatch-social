---
id: F-004
title: "Vercel serverless runtime 唯讀 filesystem 導致 Server Action fs.writeFileSync 靜默失敗"
status: confirmed
change: developer-console-backend
date: 2026-06-02
references_to: [REF-004, ADR-04]
referenced_by: [ADR-04, F-019]
supporting_refs: [REF-004]
---

## 結論 / 數據

- **根因**：`saveHeroAlignments` Server Action 原實作以 `fs.writeFileSync` 寫入本地路徑，在 Vercel serverless runtime 環境下 `/tmp` 以外路徑為唯讀，實際上資料從未持久化。每次 Cold Start 後資料全部消失，無任何顯式錯誤訊息拋出（靜默失敗）。
- **發現情境**：`developer-console-backend` change apply 過程中，§6.7 Council Mode（Codex 8/10 PROCEED / Gemini 6.5/10 CONDITIONAL）指出 BLOCK-1（fs.writeFileSync 生產環境存儲方案不可靠），觸發修復。
- **修復路徑**：移除 `fs.writeFileSync`，改以 Supabase upsert 寫入 `hero_alignments` 表 + `revalidatePath('/profile')` 刷新 cache。同時新建 `getHeroAlignments()` Server Action 從 DB 讀取，browse/profile page 接入 `customAlignments`。
- **量化影響**：migration 003 建立 `hero_alignments` 表，含 RLS + developer profiles policy + 51 筆 seed；修復後資料持久化驗證方式為 Supabase Dashboard 直查表內容。

## 與既有 REF 一致或矛盾

- **一致 REF-004**：REF-004 強調 RLS 是「公開 anon key 場景下唯一的授權邊界」；本 Finding 的修復方案以 Supabase DB 取代本地 filesystem，正是把資料存取移至 RLS 可控範圍，與 REF-004 的安全架構方向一致。
- **新增認知（REF-004 未覆蓋）**：REF-004 描述 RLS 設計，但未涵蓋 Vercel 的 filesystem 限制。本 Finding 補充了「在 Next.js Server Actions 中使用 Node.js fs 模組的部署陷阱」這個維度，與 ADR-04 共同構成完整的持久化決策參考。

## 對後續影響

1. **嚴格禁止規則**：任何 Next.js Server Action 中禁止使用 `fs.writeFileSync`、`fs.appendFileSync`、`fs.mkdirSync`（除非目標路徑明確為 `/tmp` 且理解其 ephemeral 性質）。所有需持久化的資料必須走 Supabase。
2. **同類誤用掃描**：若未來新增 Server Action，PR review 需主動 grep `fs.write` / `fs.append`；Vercel 靜默失敗不會在 CI 環節觸發告警。
3. **ADR-04 關聯**：`getHeroAlignments()` 的 DB read + static fallback 架構決策（資料不存在時 fallback 至 `mockPlayers.ts` 的靜態預設值）是本 Finding 修復方案的延伸，見 ADR-04。
