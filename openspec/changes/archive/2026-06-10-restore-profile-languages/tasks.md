## 1. 匯入與狀態邏輯 (Imports & State Logic)

- [x] 1.1 在 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 頂部從 `@/data/mockPlayers` 匯入 `LANGUAGE_OPTIONS`
- [x] 1.2 在 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 中新增 `handleToggleLanguage` 狀態切換處理函式，串聯 `setCard` 更新狀態並實裝最多選擇 3 個的限制

## 2. UI 整合與測試 (UI Integration & Testing)

- [x] 2.1 修改 [src/app/profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 中的玩家基礎設定區塊（SECTION 1），將原本 MBTI 特質單一欄位改為雙欄 Grid，並於右側加入溝通語言複選膠囊按鈕組與計數器 UI
- [x] 2.2 在本機測試點選語言時，UI 是否即時變更按鈕樣式且正確統計個數
- [x] 2.3 測試當點選已滿 3 個並嘗試點選第 4 個語言時，系統是否會顯示錯誤訊息：「溝通語言最多只能選擇三個喔，以維護卡片完美視覺！」
- [x] 2.4 測試點擊儲存名片並成功發布後，重新整理編輯頁面與前往分享頁、廣場，確保名片上的語言已正確寫入資料庫並被正常讀取
