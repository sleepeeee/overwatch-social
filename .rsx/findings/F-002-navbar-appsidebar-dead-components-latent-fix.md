---
id: F-002
title: "Navbar.tsx / AppSidebar.tsx 皆未掛載（dead components）：唯一 live 登入入口是 page.tsx mock 按鈕"
status: confirmed
change: auth-fix-and-developer-role
date: 2026-06-01
references_to: [REF-003]
referenced_by: []
supporting_refs: [REF-003]
---

## 結論 / 數據

- **發現方式**：design.md Stage 2 假設修正階段，對 `src/` 全目錄 grep `AppSidebar` 與 `Navbar` import。
- **具體數據**：`Navbar.tsx` 的 Google OAuth 實作（`signInWithOAuth`、`signOut`、`onAuthStateChange`）完整正確，但**未被任何 page / layout import**。`AppSidebar.tsx` 亦未掛載。唯一 live 登入入口為 `page.tsx` 的 `handleGoogleLogin` — 此函數原為 `alert()` mock。
- **決策影響**：
  1. **Task 1 優先**（phase A 核心）：修 `page.tsx` 是唯一可立即帶來 live 效果的修復。
  2. **Task 2 降為 latent 修復**：AppSidebar 修復正確但無 live 觸發路徑；spec Scenario 2 無法機械驗收（false-green 風險）。
  3. **跳過項目記錄**：propose_checklist.md 跳過項目表補記「spec Scenario 2（sidebar 登出）live 驗收 — AppSidebar 未掛載」。
  4. **驗收策略**：Scenario 2 通過條件明確定義為「該元件被掛載且在 router context 下可觸發」，未掛載前記為 latent，不假裝勾選。

**量化**：grep 命中 0 筆（import Navbar/AppSidebar in page/*.tsx 或 layout.tsx）。

## 與既有 REF 一致或矛盾

- **一致 REF-003**：REF-003 記錄了 `signInWithOAuth` 的正確用法，`Navbar.tsx:36-44` 是同專案內的落地證據（in-tree reference）。本發現說明此正確實作雖存在但「懸空」，未接入任何 live 頁面，屬架構疏漏而非技術錯誤。
- **補充先前 F-001 的隱含假設**：F-001 的三輪 Codex 審查期間，驗收基準假設登入流程 live 可觸發；本 Finding 揭示這個假設在 `google-oauth-supabase-auth` change 完成時實際上是錯的（page.tsx 始終是 alert mock）。

## 對後續影響

1. **掛載決策懸而未決（pivot debt 標記）**：AppSidebar 與 Navbar 的掛載順序、UI 整合方式，在 auth-fix-and-developer-role 中明確設為 Non-Goal（不掛載）。未來 change 若要整合 Sidebar / Navbar，需以本 Finding 為前置。
2. **驗收框架**：任何涉及 AppSidebar 或 Navbar 的 spec scenario 在這兩個元件掛載前，一律應在 tasks.md 標為「latent，待掛載後驗」，避免 false-green 勾選。
3. **dead component 清查建議**：apply 完成後建議對 `src/components/` 做全目錄 dead import scan，確認是否有其他未掛載元件。
