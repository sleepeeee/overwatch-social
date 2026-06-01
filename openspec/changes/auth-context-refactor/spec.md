# Spec: auth-context-refactor

## REQ-01 — AuthProvider 存在且包裹所有頁面

**Scenario**: AuthContext 元件存在
- WHEN `src/context/AuthContext.tsx` 存在
- THEN 它匯出 `AuthProvider` 和 `useAuth`
- AND `AuthProvider` 是 `"use client"` Client Component
- AND `useAuth()` 回傳 `{ user: User | null, authLoading: boolean }`

**Scenario**: AuthProvider 在 layout
- WHEN `src/app/layout.tsx` render
- THEN `<AuthProvider>` 包裹所有 `{children}`
- AND DevModeBanner、ArtOrnament、FloatingDock 也在 AuthProvider 內（或在外，取決於是否需要 auth）

## REQ-02 — 全域單一 onAuthStateChange 訂閱

**Scenario**: app 執行中的訂閱數量
- WHEN 用戶訪問任何一個頁面
- THEN 整個 app 只有一個 Supabase onAuthStateChange 訂閱（在 AuthProvider）
- AND TopBar、profile、browse 頁面不各自建立 auth subscription

## REQ-03 — TopBar 使用 useAuth()

**Scenario**: TopBar auth state 來源
- WHEN TopBar 元件 render
- THEN 它呼叫 `useAuth()` 取得 user state
- AND TopBar 不建立 onAuthStateChange 訂閱
- AND TopBar 的 handleGoogleLogin / handleLogout 邏輯不變

## REQ-04 — profile/page.tsx 使用 useAuth()

**Scenario**: profile 頁 auth state 來源
- WHEN /profile 頁面 render
- THEN 它呼叫 `useAuth()` 取得 user 和 authLoading
- AND 不有 local onAuthStateChange 訂閱
- AND 不有 local getUser() 呼叫（由 AuthProvider 統一初始化）
- AND profile 資料載入邏輯依賴 user.id useEffect 觸發

## REQ-05 — browse/page.tsx 使用 useAuth()

**Scenario**: browse 頁登入狀態來源
- WHEN /browse 頁面 render
- THEN `isLoggedIn = !!user`，user 來自 `useAuth()`
- AND 不有 local Supabase auth subscription

## REQ-06 — LoginModal 條件正確

**Scenario**: profile 頁未登入時
- WHEN /profile 頁面 render 且 AuthProvider 確認未登入
- THEN LoginModal `show={!authLoading && !user}` 顯示
- AND isMounted guard 已移除（不再需要）

**Scenario**: AuthProvider 初始化期間
- WHEN 頁面 mount 且 getUser() 尚未回傳
- THEN `authLoading = true` → LoginModal 不顯示（show = false）

## REQ-07 — auth state 跨頁面一致

**Scenario**: 用戶在首頁登入後切換頁面
- WHEN 用戶在 / 登入後導向 /browse 或 /profile
- THEN 所有頁面的 TopBar 立即顯示「已登入」狀態（來自同一 AuthProvider）
- AND 無需重新訂閱或重新查詢

## REQ-08 — isMounted 移除

**Scenario**: profile 頁面 loading 狀態
- WHEN /profile 頁面 render
- THEN 頁面不使用 `isMounted` state
- AND 骨架屏（loading spinner）改為依賴 `authLoading` 控制
