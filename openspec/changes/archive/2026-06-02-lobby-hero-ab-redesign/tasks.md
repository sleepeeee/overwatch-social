## 1. TopBar 入口與權限重構

- [x] 1.1 修改 `src/components/TopBar.tsx` 以引入 `useDevMode` 判斷當前登入使用者的開發者權限。
- [x] 1.2 在 `src/components/TopBar.tsx` 中刪除指向 `/profile` 的「我的名片」按鈕。
- [x] 1.3 實作「開發者後台」按鈕條件渲染：僅在 `user` 存在且 `isDeveloper === true` 時顯示，其餘情況僅顯示「登出」按鈕或「使用 Google 登入」按鈕。

## 2. 大廳首頁 A/B 佈局與切換實作

- [x] 2.1 在 `src/app/browse/page.tsx` 中新增 A/B 佈局切換狀態 `activeLayout`，並透過 `useEffect` 結合 `localStorage` 進行初始化與持久化。
- [x] 2.2 實作 Layout A (雙欄雜誌) 的 UI 與響應式：左側為大廳標題與引言，右側為搜尋框與分區 Tab。
- [x] 2.3 實作 Layout B (置中紙感卡片) 的 UI 與響應式：將所有大廳標題、引言、搜尋與分區按鈕收納在一個帶有柔和水彩與莫蘭迪手稿感邊框的磨砂玻璃置中卡片中。
- [x] 2.4 實作懸浮「A/B 臨時切換」按鈕（固定定位在右下角 `fixed bottom-20 right-4 z-50`），點擊可立即在 Layout A 與 Layout B 間切換。

## 3. 測試與驗收

- [x] 3.1 驗證 TopBar 功能：
  - 當以普通帳戶登入時，TopBar 僅顯示「登出」按鈕，不顯示「我的名片」與「開發者後台」按鈕。
  - 當以開發者白名單帳戶登入時，TopBar 顯示「開發者後台」按鈕與「登出」按鈕。
- [x] 3.2 驗證 A/B 切換按鈕：
  - 點擊按鈕可正確平滑地切換大廳 Hero 區塊的排版。
  - 重新整理網頁後，大廳仍維持切換後的 Layout 狀態。
