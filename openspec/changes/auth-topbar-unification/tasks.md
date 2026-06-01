# Tasks: auth-topbar-unification

## Task 1 — 建立 TopBar.tsx 元件

**驗收條件**：`src/components/TopBar.tsx` 存在，符合 REQ-01 ~ REQ-03

步驟：
- [ ] 建立 `src/components/TopBar.tsx`
- [ ] 從 `page.tsx` 複製 TopBar 相關 state（user, loginPending）和 handlers（handleGoogleLogin, handleLogout）
- [ ] `handleLogout` 改為 `router.push('/')` 而非 `router.refresh()`
- [ ] 複製右上角 JSX（含 Moon logo 左側 + 右側登入/登出 UI）
- [ ] `export default function TopBar()`

---

## Task 2 — 更新 page.tsx 使用 TopBar

**驗收條件**：page.tsx 右上角 UI 與 Task 1 抽取前視覺一致，REQ-04

步驟：
- [ ] `import TopBar from "@/components/TopBar"`
- [ ] 移除 page.tsx 內的 user state、loginPending state、兩個 handlers
- [ ] 移除 useEffect 的 onAuthStateChange 訂閱（若已移到 TopBar）
- [ ] 移除右上角 TopBar JSX div（改成 `<TopBar />`）
- [ ] 保留 handleLogout 給頁面本身若有用到（若無則完全移除）

---

## Task 3 — 更新 browse/page.tsx

**驗收條件**：REQ-04、REQ-05

步驟：
- [ ] `import TopBar from "@/components/TopBar"`
- [ ] 在頁面最頂部（`<div className="max-w-6xl...">` 內第一行）加入 `<TopBar />`
- [ ] 移除「登入狀態模擬」整個 div（line 62-73）
- [ ] 移除 `onClick={() => setIsLoggedIn(!isLoggedIn)}` setter
- [ ] 保留 `isLoggedIn` state 及其 Supabase 初始化邏輯（用於傳給子元件）
- [ ] 確認 `isLoggedIn` 仍傳入 OverwatchSquare（若有使用）

---

## Task 4 — 更新 profile/page.tsx

**驗收條件**：REQ-04、REQ-06、REQ-07、REQ-08、REQ-09

步驟：
- [ ] `import TopBar from "@/components/TopBar"`
- [ ] `user` 初始值改為 `null`（移除 mock user object）
- [ ] `authLoading` 初始值改為 `true`
- [ ] `getUser()` callback：移除 `data.user || { mock... }` fallback，改為 `const activeUser = data.user ?? null`；若 null 就是 null
- [ ] `onAuthStateChange` callback：同樣移除 mock fallback
- [ ] 移除「極致多合一入口網已啟用」badge div（在 hub section 標題旁）
- [ ] 在 hub section 頂部加入 `<TopBar />`（或整個頁面最頂部）
- [ ] 確認 LoginModal `show={isMounted && !authLoading && !user}` 邏輯正確

---

## Task 5 — 端到端驗證

**驗收條件**：所有 REQ 通過

步驟：
- [ ] `npm run dev` 啟動開發伺服器
- [ ] 驗證首頁 `/`：未登入顯示 Google 登入按鈕 ✓
- [ ] 驗證名片廣場 `/browse`：右上角有 TopBar，無模擬開關 ✓
- [ ] 驗證個人名片 `/profile`（未登入直接訪問）：LoginModal 正確顯示 ✓
- [ ] 驗證個人名片 `/profile`（已登入後訪問）：LoginModal 不顯示，頁面正常 ✓
- [ ] 驗證填寫名片資料後按儲存：資料存入 Supabase ✓
- [ ] 驗證三頁 TopBar 視覺完全一致 ✓
- [ ] `npm run build` 無 TypeScript 錯誤 ✓
