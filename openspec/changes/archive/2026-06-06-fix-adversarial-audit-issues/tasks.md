## 1. 全域背景與粒子優化

- [x] 1.1 修改 `src/app/layout.tsx` 中的行內 `style`：將 `background` 簡寫拆分為 `backgroundColor` 與 `backgroundImage`，同時載入全域常駐的 `<CosmicParticlesBackground />`
- [x] 1.2 修改 `src/app/globals.css`：補齊載入完整的 Google Fonts 連結，並在 `@layer base` 中加上全域的 `::selection` 文字選取高亮背景色
- [x] 1.3 移除 `src/app/page.tsx` 與 `src/app/profile/page.tsx` 中重複渲染的 `<CosmicParticlesBackground />` 宣告，避免重疊與效能浪費

## 2. 導航欄與 Logo 細節還原

- [x] 2.1 修改 `src/components/TopBar.tsx`：將其改為 `header` 元素並套用 `sticky top-0 z-50 glass-panel border-b border-white/[0.04] h-20` 固定磨砂效果，並調整內部容器約束
- [x] 2.2 修改 `src/components/CosmicParticlesBackground.tsx` 中的 `CosmicFullLogo`：還原 SVG 中北極星星芒 (`main-star`)、`glowPulse`/`rotateStar` 動畫，補齊第二軌道行星及 `scale(0.92)` 縮放容器

## 3. 首頁快速登入對接

- [x] 3.1 修改 `src/app/page.tsx`：將「全域身份工作室」卡片外層的 `<Link href="/profile">` 移除，改為透過 JS 卡片點擊觸發 `router.push("/profile")` 導航
- [x] 3.2 在工作室卡片底部內嵌 Google 登入按鈕 `Continue with Google`（未登入）或已同步狀態標籤（已登入），並在 Google 登入按鈕上加上 `e.stopPropagation()` 阻止事件冒泡

## 4. 個人檔案工作室水合與功能解禁

- [x] 4.1 修改 `src/app/profile/page.tsx`：引入 `mounted` 狀態。當 `!mounted` 時渲染 Loading 或空 skeleton，在 `useEffect` 將 `mounted` 設為 true 後載入主控台或鎖定分支，以防 Hydration mismatch 錯誤
- [x] 4.2 解禁《特戰英豪》與《英雄聯盟》名片編輯功能，允許切換編輯，並整合與編輯中遊戲種類動態聯動的色彩配色（OW: amber, Val: rose, LoL: blue）
- [x] 4.3 重構常用立繪插槽邏輯，使玩家選擇英雄時依序填入 3 插槽，並支援插槽右上角 `✕` 按鈕單獨移出特定插槽英雄且不打亂其他插槽順序
