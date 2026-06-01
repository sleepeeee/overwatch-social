# Design: auth-ux-login-gate

## Context

專案技術棧：Next.js 16 App Router + TypeScript + Supabase Auth (`@supabase/ssr`) + Tailwind CSS v4 + 莫蘭迪暖灰沙色系主題。

現有 auth 相關基礎：
- `src/lib/supabase/client.ts`：`createBrowserClient`（Client Components 用）
- `src/hooks/useDevMode.ts`：`onAuthStateChange` 單一來源的 hook 模式（REF-006 hydration 安全）
- `src/app/page.tsx:44`：`handleGoogleLogin` 的 `signInWithOAuth` 實作（可直接複用）
- `src/components/OWCard.tsx`：已有 `isLoggedIn` prop + `copiedTagError` state

## Goals / Non-Goals

**Goals**：
1. 首頁右上角登出按鈕（一體視覺）
2. `/profile` 未登入 overlay（不做 redirect）
3. OWCard 互動 → LoginModal 彈窗

**Non-Goals**：見 proposal.md

---

## Decisions

### D1 — 登出按鈕位置與視覺設計

**決策**：在 `page.tsx` 登入後區塊，`[我的名片]` Link 右側並排加 `[登出]` 按鈕。

**樣式原則**（REF-006 / 現有 page.tsx 模式）：
```tsx
// 現有「我的名片」按鈕樣式（line 88-95）
className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[#82b7cc]/30 
           bg-white/40 text-[9px] font-bold tracking-widest uppercase text-[#5d4037] 
           hover:bg-white transition-all duration-300"

// 登出按鈕：同圓角、同高度，但用 ghost 風格（邊框 /20 alpha 稍低）區分「破壞性行為」
className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[#8c7c6c]/20 
           bg-white/20 text-[9px] font-bold tracking-widest uppercase text-[#8c7c6c]/70 
           hover:bg-[#8c7c6c]/8 hover:text-[#5d4037] transition-all duration-300"
```

**handleLogout**（Gemini Major 修正）：
```tsx
const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.refresh();  // 強制 Next.js RSC re-fetch，防止未來加入 Server Component 時 session cache 不同步
};
```
需 `import { useRouter } from "next/navigation"` + `const router = useRouter()`。

**Rationale 表**：
| 技術選擇 | Prior work | 理由 |
|---|---|---|
| `signOut()` via browser client | REF-002 client 分層 | 登出在 Client Component，用 browser client |
| `onAuthStateChange` + `router.refresh()` | `useDevMode.ts` 既有模式 + Gemini Major | client state 由 onAuthStateChange 同步；`router.refresh()` 另外強制 RSC cache 刷新，防未來加入 Server Component 時 session 不同步 |
| Ghost 視覺區分登出 | UX 最佳實踐 | 登出屬破壞性操作，視覺稍弱於「我的名片」主 CTA |

---

### D2 — `/profile` 未登入 Overlay

**決策**：不做 redirect；頁面仍渲染但中央蓋 overlay，含登入 CTA。

**User state source**：`profile/page.tsx` 已在 `useEffect` 裡同時呼叫 `supabase.auth.getUser()` 和 `onAuthStateChange`，`user` 完全來自 client-side（pure Client Component）。

**Critical fix — `authLoading` guard**（Codex C1 / Gemini C2）：

`isMounted && !user` 條件不足——session 解析期間 `user` 暫為 `null`，已登入使用者也會短暫看到 overlay。正確條件加入 `authLoading` 旗標：

```tsx
// 狀態聲明
const [user, setUser] = useState<User | null>(null);
const [isMounted, setIsMounted] = useState(false);
const [authLoading, setAuthLoading] = useState(true);  // ← 新增

// getUser() resolve 後關閉
supabase.auth.getUser().then(async ({ data }) => {
  setUser(data.user);
  setAuthLoading(false);  // ← 新增
  ...
});

// onAuthStateChange 也關閉
supabase.auth.onAuthStateChange(async (_event, session) => {
  setUser(session?.user ?? null);
  setAuthLoading(false);  // ← 新增
  ...
});

// overlay 條件
<LoginModal
  show={isMounted && !authLoading && !user}
  closable={false}
/>
```

SSR → client 首 render：`authLoading=true` → overlay 不顯示（兩端一致 → 無 hydration mismatch，REF-006）。  
Auth 解析完成後：`authLoading=false`，`!user` 才顯示 overlay → 已登入用戶永遠不見 overlay。

**已知限制**（Flash）：`authLoading=true` 期間頁面主體仍可見約 100-500ms（取決於網路），這是 client-only auth guard 的固有限制。profile 欄位不含高度敏感資料（無 social_channels、無真實姓名），可接受；若未來欄位升高敏感度，需改為 Next.js middleware 守門。

**D2 的 overlay 元件**：直接使用 A3 建立的 `<LoginModal>` 元件（`closable={false}` variant），不自行實作 overlay markup。

---

### D3 — LoginModal 元件設計

**決策**：新建獨立的 `LoginModal.tsx`，掛在 `browse/page.tsx` 和 `profile/page.tsx`。

**元件介面（收斂版）**：
```tsx
interface LoginModalProps {
  show: boolean;
  onClose?: () => void;   // optional：closable=false 時不傳
  closable?: boolean;     // 預設 true；profile overlay 用 false
}
```

**SSR 安全**：元件不需要 `loading` guard——`show` 由父層控制，父層在 `isMounted === false` 或 `authLoading === true` 時傳 `show={false}`，元件收到 `show=false` → return null，SSR 和 client 首 render 皆不渲染（REF-006）。

**實作結構**：
```tsx
"use client";
export default function LoginModal({ show, onClose }: LoginModalProps) {
  const [loginPending, setLoginPending] = useState(false);
  
  if (!show) return null;  // 不用 loading guard，show 由父層控制（無 SSR 渲染）
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal 卡片 */}
      <div className="relative glass-panel p-6 max-w-xs w-full space-y-4">
        <button onClick={onClose} className="absolute top-3 right-3 ..."><X size={14}/></button>
        <h3>登入後才能使用此功能</h3>
        <p>...</p>
        <button onClick={handleLogin} disabled={loginPending}>
          <Google icon /> 使用 Google 登入
        </button>
      </div>
    </div>
  );
}
```

**Rationale**：LoginModal 不需 `loading` hydration guard，因為它是客戶端狀態驅動（`show` prop），不會在 SSR 渲染——兩端都不渲染，無 mismatch 風險（REF-006 caveat：此情境不適用 loading guard）。

---

### D4 — OWCard `onLoginRequired` callback

**決策**：新增 optional prop，按照 Karpathy §3 外科手術原則只改必要的兩行。

```tsx
// 現況（OWCard.tsx:56-60）
if (!isLoggedIn) {
  setCopiedTagError(true);
  setTimeout(() => setCopiedTagError(false), 2000);
  return;
}

// 修改後（保留 copiedTagError 作為視覺輔助，同時觸發 modal）
if (!isLoggedIn) {
  onLoginRequired?.();
  return;
}
```

`copiedTagError` 的紅字提示可選擇移除（OWCard 收到 callback 就表示 browse page 會開 modal，modal 已足夠引導）。設計決策：**移除 copiedTagError 提示**，以 modal 取代，避免雙重提示混淆。

---

## Risks / Trade-offs

| 風險 | 影響 | 緩解 |
|---|---|---|
| `/profile` overlay 與現有 `position: relative` 容器衝突 | overlay 可能被 parent 裁切 | 改用 `fixed` 定位（全螢幕蓋）取代 `absolute` |
| LoginModal 的 Google login 後，callback redirect 回 browse page 而非停在 modal | 登入成功後 browse page 重整，OWCard 狀態重置 | 可接受：用戶登入成功後看到更新的廣場是正常 UX |
| FloatingDock 未加登出 | 非首頁的其他頁面（browse、profile 登入後）無登出 | 本 change Non-goal；後續可獨立處理 |
| DevModeBanner 位於 layout.tsx 頂部，overlay `fixed inset-0` 可能覆蓋 banner | developer 用戶看不到 DEV MODE banner | 不影響：developer 用戶通常在 /profile 時已登入，overlay 不會出現 |

## Open Questions

- LoginModal 的 `redirectTo` 應指向當前頁面（`window.location.href`）還是固定 `/auth/callback`？→ 用 `/auth/callback`（Supabase allowed list 已有，不需再加新 URL）
