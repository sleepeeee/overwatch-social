## ADDED Requirements

### Requirement: 大廳 Hero 區塊 A/B 測試佈局與切換
大廳首頁 (`/browse`) 的 Hero 區塊 SHALL 支援 A/B 兩套排版設計，並提供一個懸浮的臨時切換按鈕。
- **Layout A (雙欄雜誌)**：標題與引言靠左佔用一欄，搜尋框與分區按鈕居右佔用另一欄。
- **Layout B (置中卡片)**：以帶有圓角與紙感莫蘭迪外框的玻璃磨砂卡片置中收納所有標題、搜尋框與分區按鈕。

#### Scenario: 預設顯示 Layout A 佈局
- **WHEN** 使用者首次加載名片廣場頁面且 localStorage 無記錄偏好
- **THEN** 系統 SHALL 渲染 Layout A 雙欄雜誌佈局

#### Scenario: 點擊臨時切換按鈕切換 Layout
- **WHEN** 使用者點擊畫面右下角的「A/B 臨時切換」按鈕
- **THEN** 系統 SHALL 在 Layout A 與 Layout B 之間動態切換
- **AND** 系統 SHALL 將當前選擇（"A" 或 "B"）寫入 localStorage 以持久化該偏好

#### Scenario: 驗收完成移除切換按鈕 (後續規劃)
- **WHEN** 使用者進行程式碼提交驗收，確認最終選定之佈局後
- **THEN** 系統 SHALL 移除該 A/B 狀態機與臨時切換按鈕，僅保留選定的 Layout
