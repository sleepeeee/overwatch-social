# Change Proposal: brand-logo-upgrade

## Summary
本提案旨在升級網站左上角的品牌標識（Logo）組件，將其替換為全新的 "AFTER MIDNIGHT" 品牌視覺元件，並加入可點擊切換明亮/夜間模式的微交互功能，且品牌文字僅作為展示用途（非連結）。

## Proposed Changes

### 1. 樣式系統配置 (Tailwind v4 Colors)
*   **檔案**：[src/app/globals.css](file:///D:/AI/overwatch/overwatch-social/src/app/globals.css)
*   **修改**：在 `@theme inline` 區塊中，擴展定義 `--color-morandi-blue: #93A2B5` 與 `--color-morandi-sand: #D4C5A9`，確保新 Logo 的動態邊框與圖示能正確渲染。

### 2. 品牌標識與明暗切換實作
*   **檔案**：[src/components/TopBar.tsx](file:///D:/AI/overwatch/overwatch-social/src/components/TopBar.tsx)
*   **修改**：
    *   **狀態管理**：引入 `isDark` state，並在 `useEffect` 中與 `document.documentElement` 的 `.dark` 類名進行同步。
    *   **切換函式**：實作 `toggleTheme`，點擊月亮圖標時在 `html` 標籤上 toggle `dark` class，並將使用者的偏好儲存至 `localStorage` 的 `theme` 欄位中，確保持久化。
    *   **Logo 按鈕**：左側圓形月亮圖標改為 `<button type="button" onClick={toggleTheme}>`，具備微浮起動效與主題切換。
    *   **品牌文字**：右側 `AFTER MIDNIGHT` 與 `GAME ALLY HUB` 改為普通 `div` 展示，**不使用 Link 連結**。

## Checkpoint & Safety
*   已成功建立修改前的本地存檔點分支：`checkpoint/brand-logo-upgrade-base`
