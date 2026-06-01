# Tasks: auth-context-refactor

## Task 1 — 建立 AuthContext.tsx

**驗收條件**：REQ-01, REQ-02

- [x] 建立 `src/context/AuthContext.tsx`（"use client"）
- [x] `AuthProvider` 包含 user state（null）、authLoading state（true）
- [x] `useEffect` 中：getUser() + onAuthStateChange（SIGNED_IN/SIGNED_OUT/INITIAL_SESSION 過濾）
- [x] getUser() 加 cancellation guard（cancelled ref）
- [x] cleanup：cancelled.current = true + unsubscribe
- [x] 匯出 `AuthProvider` 和 `useAuth`

---

## Task 2 — 更新 layout.tsx

**驗收條件**：REQ-01

- [x] `import { AuthProvider } from "@/context/AuthContext"`
- [x] 將 `<main>` + `<footer>` + `<FloatingDock />` 等內容包進 `<AuthProvider>`
- [x] 確認 DevModeBanner 在 AuthProvider 外部（它是 Server Component，不需要 auth）或內部均可

---

## Task 3 — 更新 TopBar.tsx

**驗收條件**：REQ-03

- [x] `import { useAuth } from "@/context/AuthContext"`
- [x] 移除 `useState<User | null>(null)`
- [x] 移除 `useEffect` 的 onAuthStateChange 訂閱
- [x] 移除對應 import（User type、createClient 若不再需要）
- [x] `const { user } = useAuth()`
- [x] handleGoogleLogin / handleLogout 邏輯不變

---

## Task 4 — 更新 profile/page.tsx

**驗收條件**：REQ-04, REQ-06, REQ-07, REQ-08

- [x] `import { useAuth } from "@/context/AuthContext"`
- [x] 移除 `const [user, setUser] = useState<User | null>(null)`
- [x] 移除 `const [authLoading, setAuthLoading] = useState(true)`
- [x] 移除 `const [isMounted, setIsMounted] = useState(false)`
- [x] 移除 useEffect 中的 `setIsMounted(true)`
- [x] 移除 `supabase.auth.getUser()` 完整 block
- [x] 移除 `supabase.auth.onAuthStateChange` 完整 block（含 listener cleanup）
- [x] 移除 cancelled ref
- [x] 移除對應 createClient import（若不再使用）
- [x] `const { user, authLoading } = useAuth()`
- [x] 新增 useEffect 依賴 `user?.id` 載入 profile 資料（替代原 getUser callback）
- [x] isMounted 骨架屏改為依賴 `authLoading` 判斷
- [x] LoginModal: `show={!authLoading && !user}`（移除 `isMounted &&`）

---

## Task 5 — 更新 browse/page.tsx

**驗收條件**：REQ-05, REQ-07

- [x] `import { useAuth } from "@/context/AuthContext"`
- [x] 移除 `const [isLoggedIn, setIsLoggedIn] = useState(false)`
- [x] 移除 `supabase.auth.getUser()` 及 `onAuthStateChange` 整個 Supabase 初始化 block
- [x] `const { user } = useAuth()`
- [x] `const isLoggedIn = !!user`
- [x] 移除 `isMounted` state（若有）
- [x] 確認 OverwatchSquare 等子元件仍收到 isLoggedIn prop

---

## Task 6 — 端到端驗證

**驗收條件**：所有 REQ

- [x] `npm run build` 無 TypeScript 錯誤
- [x] 確認首頁 `/`：TopBar 正確顯示登入狀態
- [x] 確認 `/browse`：isLoggedIn 來自 AuthProvider
- [x] 確認 `/profile`（未登入）：LoginModal 正確顯示
- [x] 確認 `/profile`（已登入）：正常操作，無 LoginModal
- [x] 確認 devtools 中只有一個 WebSocket 連線（Supabase realtime）
