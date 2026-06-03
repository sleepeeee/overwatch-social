---
id: F-013
type: finding
title: DevModeBanner 必須置於 AuthProvider 內部：Server Component layout.tsx 直接渲染會跳出 Context 邊界
status: confirmed
confidence: high
references_to: [REF-016, ADR-11, ADR-13]
referenced_by: [ADR-13]
supporting_refs: [ADR-11]
---

## 結論 / 數據

`browse-quality-fixes` change 將 `DevModeBanner` 從 `layout.tsx`（Server Component 直接渲染）移入
`AuthContext.tsx`（AuthProvider render 內部），此移動是**架構必要性**而非風格偏好。

根本原因：`DevModeBanner` 消費 `useAuth()` hook，而 `useAuth()` 讀取 `AuthContext`。
React Context 只在對應 Provider 的元件樹範圍內有效。
`layout.tsx` 雖然 import 了 `AuthProvider` 並將子節點包裹其中，
但**直接在 layout.tsx 層呼叫 `useDevMode()`（或任何消費 `useAuth()` 的 hook）會在 Provider 掛載前執行**，
造成「useAuth() called outside of AuthProvider」執行期錯誤。

量化影響：
- 移動前：`DevModeBanner` 在 layout.tsx 試圖消費 AuthContext → 執行期 throw
- 移動後：`DevModeBanner` 置於 `AuthProvider` render return 內 → Context 可見，正常消費
- `useDevMode()` 依賴 `useAuth()` 取得 `user`，再判斷 `user?.app_metadata?.role === 'developer'`
- 此移動同時解決 REF-016 問題 6（useDevMode 獨立 auth 訂閱移除），useDevMode 現在只消費 Context

驗證方式：
- `browse-quality-fixes` commit `1a8f8e4` 實作後 Gemini §6.7 通過（8.5/10，無 Critical/Major）

## 與既有 REF 一致或矛盾

與 ADR-11（AuthContext at layout 層）**一致**：ADR-11 建立了 AuthProvider 包裹 main/footer/FloatingDock 的架構。
本 Finding 補充了一個具體的「元件必須在 Provider 內渲染」的邊界案例，
強化了 ADR-11 中「useAuth() 在 Provider 外拋錯的設計讓誤用在開發期立即可見」的設計意圖。

REF-016 問題 6 指出 `useDevMode.ts:29` 有獨立 `onAuthStateChange` 訂閱，
本 Finding 記錄了消除該訂閱的正確路徑（改消費 AuthContext）並說明為何位置必須在 Provider 內。

## 對後續影響

1. **未來凡是需要消費 auth state 的全域 UI 元件**（如通知橫幅、角色徽章、會員狀態列），
   必須置於 `AuthProvider` render 樹內部，而非直接在 `layout.tsx` 的 JSX 序列中渲染。

2. **layout.tsx 的責任邊界**：layout.tsx（Server Component）只負責「結構與 Provider 掛載」，
   不應直接渲染任何消費 Client Context 的元件。消費層元件應置於對應 Provider 的 render return 內。

3. **`useDevMode` 簡化模式**：`useDevMode()` 現在的正確實作為
   `const { user } = useAuth(); return { isDeveloper: user?.app_metadata?.role === 'developer' }`，
   不再需要維護獨立訂閱或 state，此模式應作為後續類似 hook 的範本。
