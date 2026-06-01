# Tasks: auth-ux-login-gate

> 執行順序：Task 0 環境校準 → Task 1 LoginModal 元件 → Task 2 首頁登出 → Task 3 profile overlay → Task 4 browse OWCard 接 Modal → Task 5 整合測試

## 0. 環境校準

- [ ] 0.1 確認 dev server 可啟動（`npm run dev`），auth callback 流程正常（上一個 change 已驗證）
- [ ] 0.2 確認 TypeScript 無現有錯誤（`npx tsc --noEmit`）

## 1. 建立 `LoginModal` 元件（D3, REF-006）

- [ ] 1.1 建 `src/components/LoginModal.tsx`（`"use client"`）
  - Props（收斂版）：`{ show: boolean; onClose?: () => void; closable?: boolean }`
  - `show === false` → return null
  - Backdrop：`fixed inset-0 bg-black/20 backdrop-blur-sm`，`closable` 時點擊觸發 `onClose`
  - 卡片：`glass-panel` 樣式，含標題 / 說明 / Google 登入按鈕
  - 登入按鈕：複用 `signInWithOAuth` 邏輯 + `loginPending` guard（參考 page.tsx:44-57）
  - `redirectTo`：`window.location.origin + '/auth/callback'`（無 `?next=`）
- [ ] 1.2 TypeScript 確認無錯誤

## 2. 首頁右上角加登出按鈕（D1）

- [ ] 2.1 修改 `src/app/page.tsx` 登入後區塊（line 88-96）
  - 改為 `<div className="flex items-center gap-2">` 包住兩個元素
  - 保留「我的名片」Link（現有樣式不動）
  - 新增「登出」按鈕：ghost 風格（邊框 `/20`、文字 `/70`），加 `LogOut` icon（`lucide-react`）
- [ ] 2.2 實作 `handleLogout`：`await supabase.auth.signOut()` + `router.refresh()`（防 RSC cache 不同步）
- [ ] 2.3 加入 `import { LogOut } from "lucide-react"` + `import { useRouter } from "next/navigation"` + `const router = useRouter()`
- [ ] 2.4 瀏覽器驗證：登入後右上角出現並排按鈕，點登出後切回登入狀態

## 3. `/profile` 頁面未登入 Overlay（D2, 使用 LoginModal）

- [ ] 3.1 修改 `src/app/profile/page.tsx`
  - 加 `const [authLoading, setAuthLoading] = useState(true)` 新 state
  - `getUser().then()` 和 `onAuthStateChange` 兩處都加 `setAuthLoading(false)`（Critical fix）
  - 加 import `LoginModal`
  - 在頁面最外層 `<div>` 結束前加入：
    ```tsx
    <LoginModal 
      show={isMounted && !authLoading && !user}
      closable={false}
    />
    ```
  - 移除現有的靜態「請先登入 Google 帳號才能儲存名片！」錯誤提示文字（在 handleSave 裡，約 line 195-200）
- [ ] 3.2 瀏覽器驗證：未登入訪問 `/profile`，overlay 出現；已登入時 overlay 不出現

## 4. OWCard 接 `onLoginRequired`（D4）

- [ ] 4.1 修改 `src/components/OWCard.tsx`
  - `OWCardProps` 介面加 `onLoginRequired?: () => void`
  - `handleCopyTag` 中的未登入邏輯：移除 `setCopiedTagError(true)` + setTimeout，改為 `onLoginRequired?.()`
  - 移除 `copiedTagError` state 的相關 UI（約 line 175-179 的紅字 bubble）
- [ ] 4.2 修改 `src/app/browse/page.tsx`
  - 加 `showLoginModal` state（`useState(false)`）
  - 在 browse page render 末尾掛 `<LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />`
  - 每個 `<OWCard>` 加 `onLoginRequired={() => setShowLoginModal(true)}`
- [ ] 4.3 TypeScript 確認無錯誤
- [ ] 4.4 瀏覽器驗證：未登入點 OWCard 複製按鈕，Modal 彈出；點 × 關閉

## 5. 整合測試

- [ ] 5.1 登入流程：首頁點「使用 Google 登入」→ Google 授權 → callback → 回首頁右上角顯示「我的名片 + 登出」
- [ ] 5.2 登出流程：點「登出」→ 回未登入狀態（「使用 Google 登入」出現）
- [ ] 5.3 Profile overlay：未登入訪問 `/profile`，overlay 蓋住頁面；點 Google 登入觸發 OAuth
- [ ] 5.4 Browse LoginModal：未登入，點名片複製按鈕，Modal 彈出；點 × 關閉；點 Google 登入觸發 OAuth
- [ ] 5.5 TypeScript 全 pass：`npx tsc --noEmit`
