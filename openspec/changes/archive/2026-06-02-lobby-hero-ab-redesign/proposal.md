## Why

目前首頁右上角 TopBar 的「我的名片」功能與底部 Floating Dock 的「個人檔案」重複，造成介面冗餘。同時，缺乏一個安全且直覺的「開發者後台」快捷入口。
此外，名片大廳的 Hero 區塊（標題與搜尋部分）需要進行視覺與排版上的重新設計以提升整體 Morning Sketch 手稿質感。為了方便驗收與確認最終風格，需要同時實作 A（雙欄雜誌）與 B（置中卡片）兩套版面並提供臨時的切換按鈕，供使用者確認後再移除該按鈕。

## What Changes

- **移除重複入口**：自右上角 TopBar 中刪除「我的名片」連結。
- **動態開發者後台入口**：在 TopBar 中判斷當前使用者是否已登入 Google，且具備 `developer` 權限（經後端資料庫角色同步）。若是，則顯示指向 `/developer` 的「開發者後台」按鈕；否則僅顯示「登出」。
- **Hero 區塊 A/B 版面實作**：
  - **Layout A (雙欄雜誌)**：左側文字標題與引言，右側搜尋欄與分區 Pill 按鈕。
  - **Layout B (置中卡片)**：整幅帶有磨砂紙感背景與精細邊框的置中卡片，內含標題、引言、搜尋與分區按鈕。
- **臨時 A/B 切換按鈕**：在首頁提供一個微型、浮動的 A/B 測試切換按鈕（例如右下角），點擊可立即在 Layout A 與 Layout B 之間切換。
- **後續清理規劃**：當使用者完成驗收並確認最終版本後，將移除 A/B 切換邏輯與臨時按鈕，僅保留所選的 Layout。

## Capabilities

### New Capabilities
<!-- 無新增獨立 Capability，皆為現有 Capability 之擴展與優化 -->

### Modified Capabilities
- `auth`: 在 TopBar 重構權限入口，依據 `isDeveloper` 動態控制開發者後台按鈕的顯示。
- `browse`: 重新設計大廳 Hero 區塊，並導入 A/B Layout 狀態切換器。

## Impact

- `src/components/TopBar.tsx`：移除舊有連結，引入 `useDevMode` 以動態顯示開發者後台按鈕。
- `src/app/browse/page.tsx`：實作 Layout A 與 Layout B 條件渲染，以及浮動的臨時 A/B 切換按鈕。
- 專案樣式（CSS）：新增 layout A/B 所需的微調樣式（符合 Morning Sketch 風格）。
