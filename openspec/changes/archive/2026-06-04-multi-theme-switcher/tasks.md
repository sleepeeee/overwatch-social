## 1. CSS Theme Setup

- [x] 1.1 在 globals.css 中為「藍莓優格 (theme-blueberry)」、「森系香草 (theme-botanics)」、「極簡畫廊 (theme-nordic)」與「瑞士現代 (theme-swiss)」定義動態 CSS 主題語義變數。
- [x] 1.2 在 globals.css 的 `@theme` 宣告中鏈結這些動態變數（如 `--bg-main`、`--text-main`、`--color-accent`、`--shadow-card` 等）。
- [x] 1.3 確保 CSS 主題架構具備高度擴充性，支援未來直接在 CSS 中追加新 class 來新增配色主題。

## 2. Theme Context & Persistence

- [x] 2.1 實作或升級主題管理機制，整合 `localStorage` 用於讀取與儲存選擇的主題名稱。
- [x] 2.2 加入 `mounted` 狀態生命週期檢查，確保僅在客戶端 Mount 完成後才更新 `document.documentElement.classList`，防範 Hydration Mismatch 報錯。

## 3. TopBar UI Component Refactoring

- [x] 3.1 使用 `/impeccable craft` 將 TopBar.tsx 的月亮按鈕重構為可展開的主題面板。
- [x] 3.2 實作四種初始明亮主題（藍莓優格、森系香草、極簡畫廊、瑞士現代）的單選選項，以及夜間版切換按鈕。
- [x] 3.3 將頁面與主要元件中 hardcode 的舊禪意/莫蘭迪色系替換為 globals.css 宣告的動態語義變數，使其隨主題無縫變更。

## 4. Verification & Polish

- [x] 4.1 在瀏覽器上點擊切換四個不同主題，實測色彩、卡片紙片投影與邊框質感是否如預期切換。
- [x] 4.2 驗證重新整理網頁時，`localStorage` 狀態正確讀取且頁面在初次渲染時無嚴重的色彩閃動。
