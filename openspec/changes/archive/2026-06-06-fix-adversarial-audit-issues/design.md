## Context

本專案「曜石暗夜星河」大主題移植後，發現了以下關鍵問題：
1. 全域背景失效變白：因為 `layout.tsx` 中行內簡寫 `background: "var(--theme-bg-gradient)"` 覆蓋了 CSS 設定的底色，使其成為透明背景。
2. 導航欄與 Logo 動態細節缺失：TopBar 沒有固定在頂部（無 `sticky`，無磨砂背景，無底邊框），且 `CosmicFullLogo` 遺漏了北極星星芒、雙軌道逆向旋轉行星，且在高解析度下易被裁切。
3. 首頁工作室卡片缺少 Google 登入按鈕：無法直接在首頁進行一鍵對接或查看已登入狀態。
4. 個人檔案工作室的 SSR 水合警告：未登入防線由 `!user` 判斷在 SSR 與客戶端首次渲染不一致，造成 React 的 Hydration mismatch 錯誤。
5. 遊戲檔案庫 Valorant 與 LoL 被禁用：玩家完全無法編輯自訂這兩款遊戲的名片。
6. 立繪插槽與配色硬編碼：常用英雄插槽選擇邏輯混亂，且標籤配色被強行寫死為 `amber`，無法與編輯中的遊戲進行聯動。

## Goals / Non-Goals

**Goals:**
- **修復全域背景與字型**：解決背景變白的問題，還原星塵粒子與高質感字型及選取高亮。
- **重構 Sticky 導航欄與 Logo**：還原 TopBar 固定磨砂效果，補齊 Logo SVG 動態星芒與行星軌道。
- **首頁整合登入狀態**：在首頁「工作室入口」卡片底部內嵌 Google 登入與狀態標籤。
- **消除水合錯誤**：使用 `mounted` 狀態解決 `profile/page.tsx` 的 Hydration 衝突。
- **完全啟用 Valorant 與 LoL 編輯器**：解禁這兩個遊戲名片的編輯，並實現與遊戲聯動的配色機制。
- **最佳化插槽邏輯與破圖防護**：改進立繪選擇邏輯，並添加破圖防護。

**Non-Goals:**
- 不對 Supabase 資料庫 schema 進行破壞性修改。
- 不開發與「曜石暗夜星河」無關的其他遊戲板塊。

## Decisions

### 1. 全域背景與粒子優化
* **方案**：將 `layout.tsx` 中的行內 `style` 改為 `backgroundColor: "#030206"` 與 `backgroundImage: "var(--theme-bg-gradient)"`，同時將 `<CosmicParticlesBackground />` 提升至 `layout.tsx` 進行全域常駐渲染，並移除 `page.tsx` 與 `profile/page.tsx` 中重複渲染的背景。
* **理由**：簡寫 `background` 會隱式重置背景色。分開寫能強制確保底色與漸層完美疊加。全域粒子背景可避免頁面跳轉時背景粒子重新載入與抖動，達到完美無縫體驗。

### 2. 導航欄 (TopBar) 的 Sticky 磨砂與 Logo 還原
* **方案**：
  * 重構 `TopBar.tsx`，使用 `header className="sticky top-0 z-50 glass-panel border-b border-white/[0.04] h-20"` 包裹，並將導航連結包在 `max-w-7xl mx-auto px-6 h-full flex items-center justify-between` 中。
  * 還原 `CosmicFullLogo` 的 SVG 設計，加入 `main-star` (北極星) 及其動態發光，以及逆向旋轉的雙軌道行星。
* **理由**：對齊原設計的置頂導航美學，消除下滑頁面時導航欄滾出視區的缺憾。

### 3. 首頁工作室卡片嵌入 Google 登入 (Event Propagation Control)
* **方案**：首頁「全域身份工作室」卡片內嵌 `Continue with Google` 按鈕。該按鈕使用 `e.stopPropagation()` 阻止點擊事件冒泡至卡片外層的 `<Link href="/profile">`。
* **理由**：既保留了卡片的點擊跳轉行為，又能讓未登入用戶原地點擊按鈕完成 OAuth 登入。

### 4. 使用 `mounted` 延遲水合分支判斷
* **方案**：在 `profile/page.tsx` 引入 `mounted` 狀態。在 `!mounted` 時渲染 Loading 或空骨架，待 `mounted` 為 true 之後，再依據 `user` 的登入與否載入 `🔒 鎖定防線` 或 `特工主控台`。
* **理由**：Next.js App Router 執行 SSR 時無法得知 client-side 的 Supabase 登入狀態，使用延遲水合可完全杜絕 React Hydration Mismatch。

### 5. 解禁 Valorant 與 LoL 編輯器並與配色聯動
* **方案**：
  * 在 `profile/page.tsx` 中移除 `COMING SOON` 的禁用遮罩，允許點選切換。
  * 引入與目前編輯遊戲相應的色彩變數：
    * `ow`: `bg-amber-500/20 text-amber-400 border-amber-500/40`
    * `val`: `bg-rose-500/20 text-rose-400 border-rose-500/40`
    * `lol`: `bg-blue-500/20 text-blue-400 border-blue-500/40`
  * 特色標籤與表單主色調應隨之動態改變。

### 6. 重構常用立繪三插槽邏輯
* **方案**：點選英雄時，依據目前 `selected_heroes` 的長度依序填入插槽。再次點選已選英雄時，將其移出，並允許透過預覽插槽右上角的 `✕` 按鈕單獨移除該位置的英雄。同時為立繪加上破圖防護與 fallback 背景。
* **理由**：避免當前的 Toggle 邏輯造成插槽順序混亂，提升特工檔案設定的易用性。

## Risks / Trade-offs

* **[Risk] 提升粒子背景至 layout.tsx 造成效能下降** → [Mitigation] 粒子背景內部已整合了 `prefers-reduced-motion` 檢測，若使用者在系統中開啟了減少動態效果，將自動關閉 Canvas 粒子重繪，以保障效能與無障礙體驗。
* **[Risk] 事件冒泡失效導致 Google 登入直接跳轉** → [Mitigation] 確保 `onGoogleLogin` 內部的 `e.stopPropagation()` 確實生效，並在 Localhost 的 Chrome/Firefox 上進行交叉驗證。
