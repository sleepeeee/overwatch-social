---
id: F-014
type: finding
title: Supabase public view 納入私人欄位 = 隱私洩漏；正確做法是 view 只放公開欄位，私人欄位透過 authenticated RLS + 直接表查詢
status: confirmed
confidence: high
references_to: [REF-016, REF-017, ADR-14]
referenced_by: [ADR-14, ADR-24, F-025]
supporting_refs: [REF-017]
---

## 結論 / 數據

`browse-server-search-and-player-detail` change 的 §6.7 Gemini 初審（4/10）識別出一個 Critical 隱私漏洞（C1）：

Migration 007 原始設計將 `social_channels`（Discord / Twitter / Line 等聯絡資訊）納入
`public_profiles` view，該 view 允許匿名（anon）角色讀取。
這意味任何人無需登入即可透過 Supabase REST API 直接查詢取得所有玩家的社群帳號。

**設計錯誤的根本原因**：
將「需要登入才可見」的欄位與「匿名可讀」的 view 同放一層，
誤以為前端的 conditional render（`if user` 才顯示）能替代資料庫層的存取控制。
前端條件渲染屬於 UI 層保護，API 層仍直接暴露，繞過方式只需一個 `curl`。

**修正（Migration 008）**：
1. DROP + 重建 `public_profiles` view，移除 `social_channels` 欄位
2. 新增 `authenticated read visible profiles` RLS policy：已登入用戶直接查 `profiles` 表取 `social_channels`
3. `/player/[id]` 頁面：未登入讀 `public_profiles` view（基本資訊）；登入後另查 `profiles` 表（取 `social_channels`）

量化影響：
- 修正前：`social_channels` 透過 public view 對 anon 角色完全可見，影響所有已填寫聯絡資訊的用戶
- 修正後：`social_channels` 僅 authenticated 角色可讀，需 Supabase JWT token 方可存取
- §6.7 評分：初審 4/10 → Critical C1 修正（Migration 008）→ 最終 PASS

## 與既有 REF 一致或矛盾

REF-017（Supabase ilike 搜尋 + Load More 模式）第「Player Detail Page 模式」段落已正確描述：
「social_channels 保持隱私（不在 view 中）。未登入可看基本資訊，登入後才顯示社群聯絡方式（從 profiles 表讀）。」
本 Finding 將該設計原則的**反面教材**（Migration 007 的錯誤實作）和**修正路徑**（Migration 008）具體記錄。

REF-016 問題 5（卡片點了沒反應 + `/player/[id]` 不存在）是本 change 的起點需求，
本 Finding 記錄了實作過程中識別並修正的隱私設計缺陷。

與 F-012（client-side search on LIMIT 設計缺陷）**類似模式**：
兩個 Finding 都揭示「在 UI/Client 層做安全控制，以為後端不需要對應保護」的反模式。

## 對後續影響

1. **Supabase view 設計原則**：任何 `public_profiles` 或類似面向匿名的 view，
   欄位白名單必須逐一確認「anon 角色是否應可讀」。
   凡是需要「登入後才可見」的欄位，一律不進 anon-readable view，
   改走 `authenticated` RLS policy + 直接表查詢。

2. **Two-query pattern for privacy tiers**：
   - 第一層（anon）：read from view（只含公開欄位）
   - 第二層（authenticated）：read from base table with RLS policy（含私人欄位）
   此雙層查詢模式是本 change 確立的標準做法，適用於所有需要「登入後解鎖更多資訊」的頁面。

3. **Migration 審查 checklist**：
   未來凡建立或修改 Supabase view，需檢查：
   - view 是否允許 anon 讀取？
   - view 欄位是否包含用戶聯絡資訊、私人設定或 app_metadata？
   - 若是，必須拆出 authenticated-only policy。
