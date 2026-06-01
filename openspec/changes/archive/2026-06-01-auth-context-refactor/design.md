# Design: auth-context-refactor

## Context

Next.js 15 App Router 混合 Server/Client Component 架構。`layout.tsx` 是 Server Component，但可以 render Client Component（AuthProvider）。Supabase auth 需要 Client-side hooks。

## Goals

- G1: 整個 app 只有一個 onAuthStateChange 訂閱
- G2: auth state 成為全域單一來源
- G3: 各頁面/元件用 `useAuth()` 消費 auth state，不自行訂閱

## Non-Goals

- 不修改 Google OAuth 登入流程（handleGoogleLogin 留在 TopBar）
- 不修改 signOut 呼叫方式（TopBar 直接呼叫 supabase.auth.signOut()）
- 不修改資料庫 schema
- 不改動 developer 路由的 auth 邏輯（server-side redirect，不使用 Context）

---

## D1 — AuthProvider 位置：layout.tsx 包裹 vs 獨立 wrapper

| 方案 | 優點 | 缺點 |
|---|---|---|
| **A. layout.tsx 直接 import AuthProvider（選擇）** | 最簡，Server Component 可 render Client Component | 無缺點 |
| B. 建獨立 `Providers.tsx` wrapper | 可組合多個 Provider | 多一層元件，此專案目前不需要 |

**選擇 A**：layout.tsx 直接 import AuthProvider。

## D2 — AuthContext 形狀

```typescript
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
}
```

**為何不把 signOut / handleGoogleLogin 放進 Context**：
- signOut 後的 redirect（`router.push('/')`）是 UI 邏輯，屬於 TopBar
- handleGoogleLogin 涉及 loginPending 狀態（按鈕 loading），屬於 TopBar
- Context 只負責「當前 user 是誰」的狀態，不負責 action

## D3 — profile/page.tsx 簡化

移除：
- `const [user, setUser] = useState<User | null>(null)`
- `const [authLoading, setAuthLoading] = useState(true)`
- `supabase.auth.getUser()` 呼叫（改由 AuthProvider 統一初始化）
- `onAuthStateChange` 訂閱（改由 AuthProvider 統一管理）
- `cancelled` ref

保留（不變）：
- profile 資料載入邏輯（getMyProfile）→ 改用 `useEffect` 依賴 `user` 變化觸發

**重要**：profile 資料載入從「訂閱時 load」改為「user state 變化時 load」：

```typescript
const { user, authLoading } = useAuth();

useEffect(() => {
  if (!user) return;
  // load profile data
  getMyProfile().then(profile => { ... });
}, [user?.id]); // 依賴 user.id，user 變化時重載
```

## D4 — browse/page.tsx 簡化

移除：
- `const [isLoggedIn, setIsLoggedIn] = useState(false)`
- `supabase.auth.getUser()` 呼叫
- `onAuthStateChange` 訂閱

改為：
```typescript
const { user } = useAuth();
const isLoggedIn = !!user;
```

## D5 — TopBar.tsx 簡化

移除：
- `const [user, setUser] = useState<User | null>(null)`
- `useEffect` 的 onAuthStateChange 訂閱

改為：
```typescript
const { user } = useAuth();
```

保留（不變）：
- `loginPending` state（本地 UI 狀態）
- `handleGoogleLogin`（OAuth redirect，本地 action）
- `handleLogout`（呼叫 supabase.auth.signOut() + router.push('/')）

## D6 — LoginModal 條件更新

profile 頁原來：`show={isMounted && !authLoading && !user}`

改為：`show={!authLoading && !user}`

因為 `authLoading` 由 AuthProvider 統一管理，在 AuthProvider 尚未初始化前（loading=true）不會顯示 LoginModal。`isMounted` guard 已不需要（AuthProvider 在 layout 層就已掛載，各頁面 mount 時 auth state 已可用）。

---

## 實際時間估算

| Task | 預估 |
|---|---|
| 建立 AuthContext.tsx | 10 min |
| 更新 layout.tsx | 5 min |
| 更新 TopBar.tsx | 5 min |
| 更新 profile/page.tsx | 15 min |
| 更新 browse/page.tsx | 5 min |
| 驗證 build + e2e | 10 min |
| **合計** | **~50 min** |

Wall-clock < 1 hr，不觸發 §3.3 Smoke Test。

---

## Rationale 表

| 決策 | 選擇 | 依據 |
|---|---|---|
| AuthProvider 位置 | layout.tsx 直接 import | REF-004 確認 Server→Client render 可行 |
| Context 形狀 | { user, authLoading } only | 只需 state，action 留在元件 |
| profile 資料載入 | 依賴 user.id useEffect | 替換 onAuthStateChange 觸發，語義等價 |
| signOut 位置 | 留在 TopBar | TopBar 負責 UI action + redirect |
| isMounted 移除 | 移除 | AuthProvider 統一管理 loading，不再需要 |
