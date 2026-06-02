# Design - 開發者控制台體驗優化與功能解耦 (dev-console-ux-refinement)

## Context
本變更旨在改善開發者控制台（Admin Panel）的使用者體驗與名詞架構，主要包含權限、佈局、滑鼠左鍵鎖定、半導體術語以及功能的解耦。

## Goals
* 解決開發環境下點開「英雄立繪對準工具」彈回首頁的問題。
* 修復全域 `DevModeBanner` 發光條在首頁及後台的視線遮擋。
* 在開發者後台解鎖滑鼠選取與複製文字。
* 將後台所有半導體術語改為直觀、好懂的軟體控制台名詞。
* 將標籤管理抽離到獨立路由 `/developer/tags-manager`，並由後台工具箱卡片透過新分頁開啟。

## Decisions

### 1. 權限豁免一致性
在 `src/app/developer/adjuster/page.tsx` 中加入 `process.env.NODE_ENV === "development"` 的判斷：
```tsx
const isDev = process.env.NODE_ENV === "development";
if (!isDev && user?.app_metadata?.role !== "developer") {
  redirect("/");
}
```
這與主後台 `/developer` 的權限行為保持一致，避免本地開發時被強制重導向回首頁。

### 2. DevModeBanner 遮擋修復
將 `src/components/DevModeBanner.tsx` 的容器樣式從 `fixed top-0 left-0 right-0 z-[100]` 改為 `relative z-[100] w-full`。
* **原因**：`fixed` 會讓 element 不佔用空間而蓋在頂部，覆蓋了原本在最上方的 Header 造成遮擋。改為 `relative` 後，它將正常佔用文檔流高度，將下方的 Header 與內容往下推，在所有頁面（包含首頁）都可保持正常排版不擋視線。

### 3. 滑鼠左鍵鎖定解鎖
在 `DeveloperConsoleClient.tsx`、`AdjusterClientPage.tsx`、`HomepageAlignerClient.tsx` 及全新的 `TagsManagerClient.tsx` 的初始化 React Effect 中：
```tsx
useEffect(() => {
  document.body.style.userSelect = "text";
  document.body.style.webkitUserSelect = "text";
  return () => {
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
  };
}, []);
```
此方法能在元件掛載時動態豁免全站 `user-select: none` 的 CSS 限制，並在離開頁面時自動回復。

### 4. 工具箱整合與標籤管理解耦
* **新路由**：在 `src/app/developer/tags-manager` 下建立 `page.tsx` (伺服器端權限驗證與資料預載) 與 `TagsManagerClient.tsx` (Client 端標籤新增/刪除面板)。
* **新視窗開啟**：在 `DeveloperConsoleClient.tsx` 的後台工具箱中提供三個工具的卡片：
  - 英雄立繪對準工具 (`/developer/adjuster`)
  - 首頁內容調校工具 (`/developer/homepage-aligner`)
  - 特色標籤管理工具 (`/developer/tags-manager`)
  所有按鈕皆加上 `target="_blank" rel="noopener noreferrer"` 以新視窗/新分頁開啟。

### 5. 半導體術語替換
全面將 UI 與日誌中類似「製程、APC、Closed Loop」的半導體工程名詞替換為「工具、調校、即時預覽、主控台」等。
- APC Aligner -> 英雄立繪對準工具
- Homepage APC Aligner -> 首頁內容調校工具
- Process Live Monitor -> 即時排版預覽
- Closed Loop Calibration -> 元件精密位置微調
- Closed Loop Process Control -> 開發者主控台
