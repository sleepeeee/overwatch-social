# Spec: auth-topbar-unification

## REQ-01 — TopBar 元件存在且可複用

**Scenario**: TopBar 元件建立
- WHEN `src/components/TopBar.tsx` 存在
- THEN 它是 `"use client"` Client Component
- AND 它接受無 prop（自行管理 user state）
- AND 它匯出 `export default function TopBar()`

## REQ-02 — 未登入時顯示 Google 登入按鈕

**Scenario**: 未登入訪問任一頁面
- WHEN user state 為 null（未登入）
- THEN TopBar 右側顯示 Google 登入按鈕
- AND 按鈕樣式與 page.tsx 現有設計一致（白底/毛玻璃）
- AND 點擊後呼叫 `supabase.auth.signInWithOAuth({ provider: 'google' })`
- AND redirectTo 為 `${window.location.origin}/auth/callback`

## REQ-03 — 已登入時顯示「我的名片」和「登出」

**Scenario**: 已登入訪問任一頁面
- WHEN user state 不為 null
- THEN TopBar 右側顯示「我的名片」連結（→ /profile）
- AND 顯示「登出」按鈕
- AND 點擊登出後：呼叫 signOut() + router.push('/')

## REQ-04 — 三個頁面都有 TopBar

**Scenario**: 訪問首頁 / 名片廣場 / 個人名片
- WHEN 訪問 `/`、`/browse`、`/profile` 任一路由
- THEN 頁面右上角有 TopBar
- AND TopBar UI 三頁完全一致

## REQ-05 — 名片廣場無登入模擬開關

**Scenario**: 訪問 /browse
- WHEN 訪問名片廣場
- THEN 頁面上不存在「登入狀態模擬」字樣
- AND 不存在手動切換 isLoggedIn 的按鈕
- AND isLoggedIn 狀態只從 Supabase auth 讀取

## REQ-06 — 個人名片頁無廢棄 badge

**Scenario**: 訪問 /profile
- WHEN 訪問個人名片頁
- THEN 頁面上不存在「極致多合一入口網已啟用」文字

## REQ-07 — 未登入時 /profile 顯示 LoginModal

**Scenario**: 未登入直接訪問 /profile
- WHEN 訪問 /profile 且 Supabase 確認未登入（user = null）
- THEN 顯示 LoginModal（`closable={false}`）
- AND LoginModal 標題為「登入後才能使用主控台」
- AND 頁面內容在 LoginModal 後面不可操作

**Scenario**: authLoading 期間不閃爍
- WHEN 頁面 hydration 期間 getUser() 尚未回傳
- THEN LoginModal 不顯示（`authLoading = true` 時 show 為 false）
- AND getUser() 回傳後才評估 user 狀態

## REQ-08 — 已登入時 /profile 正常使用

**Scenario**: 已登入訪問 /profile
- WHEN 用戶已通過 Google OAuth 登入
- THEN 不顯示 LoginModal
- AND 可正常填寫並儲存名片
- AND saveProfile() 使用真實 user id 寫入 Supabase

## REQ-09 — authLoading 初始值

**Scenario**: profile 頁 hydration
- WHEN 元件 mount 後尚未收到 getUser() 回傳
- THEN `authLoading` 為 `true`
- AND `isMounted` 為 `true`（setIsMounted 在 useEffect 第一步設定）
- AND LoginModal `show = true && !true && !user = false`（不顯示）
