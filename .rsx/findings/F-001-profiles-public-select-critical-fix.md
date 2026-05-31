---
id: F-001
title: "profiles 整表公開 SELECT 安全漏洞：三輪 Codex 審查觸發 DB 層隱私重設計"
status: confirmed
change: google-oauth-supabase-auth
date: 2026-06-01
references_to: [REF-004, REF-003, REF-002]
referenced_by: []
supporting_refs: [REF-004]
---

## 結論 / 數據

- **§6.5 第 1 輪（6/10 FAIL）**：Critical — 初始設計在 `profiles` 表建立 `SELECT to anon using (true)` policy，anon key 可繞過前端遮蔽直接讀原始 `battle_tag` + `social_channels`。同一輪另有 3 個 Major（Next.js 16 middleware、open redirect、smoke 可重現性）。
- **§6.5 第 2 輪（6/10 FAIL）**：Critical 根因未完全修正——`design.md` 仍保留舊 public SELECT policy 描述，`task 1.4/6.1/6.2` 仍寫舊行為，artifacts 三份文件與 spec 不一致。
- **§6.5 第 3 輪（8/10 PROCEED）**：Critical 確認已關閉。profiles 無 public SELECT policy；`public_profiles` view 在 DB 層做條件遮蔽；open redirect 方案（URL decode → new URL parse → origin 比對）充分；artifacts 三份對齊。
- **§6.7 APPLY（8/10 PROCEED）**：實作驗收通過，無阻斷級漏洞。middleware 用 `getUser()` 刷新符合設計；`public_profiles` view 方向正確（建議後續驗 `security_invoker`）；mock fallback 建議 production 禁用。

**總輪次**：3 輪提案審查 + 1 輪實作審查，Codex 總介入 4 次，最終評分 8/10。

## 與既有 REF 一致或矛盾

- **一致 REF-004**：REF-004 caveat 明確指出「anon key 不直接開放整表；view 層保證 social_channels 不公開」，但初始 design.md 誤採 public SELECT policy，違反 REF-004 的核心安全意圖。最終實作回歸 REF-004 正確路徑。
- **一致 REF-003**：open redirect 防護方案（URL decode → `new URL(next, origin)` parse → origin 比對）在 §6.5 第 3 輪被確認充分，與 REF-003 的 PKCE callback route 要求相符。
- **一致 REF-002**：middleware 改用 `getUser()` 而非 `getClaims()` 刷新 session（§6.7 確認此選擇符合設計意圖）。

## 對後續影響

1. **ADR-01** 已確立「DB 層遮蔽優先」決策，未來任何新增公開欄位必須先評估是否需要 view-level 過濾，不得預設開放 profiles 整表。
2. **後續 backlog**：`public_profiles` view 應評估加 `WITH (security_invoker = true)` 以讓 view 繼承呼叫者 RLS context（§6.7 Codex 建議）。
3. **mock fallback**：`/browse` 的冷啟動 mock 資料應在 production 環境禁用（§6.7 Codex 建議），避免假資料混入廣場。
4. **spec/impl 一致性**：本 change 示範「§6.5 三輪審查發現 artifacts 不一致」會反覆阻斷到 PROCEED。後續 change 應在 propose 最終確認時做跨文件一致性 self-check 再送 Codex。
