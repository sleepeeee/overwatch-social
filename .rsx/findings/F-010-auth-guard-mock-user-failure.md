---
id: F-010
type: finding
title: mock user 初始值造成 LoginModal auth 守門完全失效
status: confirmed
confidence: high
references_to: [REF-002, REF-003, ADR-10-topbar-as-shared-client-component]
referenced_by: [ADR-11]
supporting_refs: [REF-001, REF-002, REF-003]
---

## 結論 / 數據

`profile/page.tsx` 的 `user` state 初始值設為 mock user object（而非 `null`），搭配 `authLoading` 初始值 `false`，導致 LoginModal 的顯示條件 `show={isMounted && !authLoading && !user}` 在頁面 mount 後立即為 `false`，守門**完全失效**。

量化影響：
- 三處 mock fallback（useState、getUser callback、onAuthStateChange callback）任一存在即造成失效
- 未登入用戶可直接訪問 /profile 並操作所有 client 端 UI
- `saveProfile()` server action 雖正確拒絕未登入請求，但 client 端無感知，造成靜默失敗

同類問題同時存在於 `browse/page.tsx`：「登入狀態模擬」開關（手動切換 isLoggedIn）讓任何用戶可繞過名片詳細內容限制。

## 與既有 REF 一致或矛盾

與 REF-001（page.tsx TopBar Pattern）一致：page.tsx 的正確實作用 `useState<User | null>(null)` 作基準，兩個問題頁面偏離了此基準。

REF-002 詳細記錄 profile/page.tsx 的三處 bug 位置（line 71-76、97-103、132-138）。
REF-003 記錄 browse/page.tsx 的模擬開關（line 62-73）。

兩者根本原因相同：開發時期的測試 scaffold 未在上線前清除。

## 對後續影響

1. **已修復**（commit e211813 + 0a1a8c1）：三處 mock fallback 已移除，authLoading 初始值改為 `true`，守門現已正常運作。

2. **架構 debt（待後續 change 處理）**：
   - 三個頁面各自維護獨立 `onAuthStateChange` 訂閱，每次路由切換均重建訂閱
   - TopBar.tsx 雖統一了 UI 層，但 auth state 仍分散在各頁面
   - 建議 change `auth-context-refactor`：移至 layout 層 AuthContext，消除重複訂閱

3. **預防機制建議**：`user` 初始值應由 linting 規則或 code review checklist 強制為 `null`，避免 mock scaffold 殘留。
