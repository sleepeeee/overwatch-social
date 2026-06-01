## 1. Server Actions 與資料設定更新

- [x] 1.1 於 `src/app/actions/homepage.ts` 新增 `uploadAnnouncementIcon`，支援將二進位圖片寫入本機 `public/uploads/` 資料夾，並回傳圖片 URL
- [x] 1.2 擴展 `src/data/announcements.json` 加入 `custom_icon_url` 與 `alignments` 欄位預設值以符合對準規格

## 2. 首頁動態調校樣式渲染

- [x] 2.1 修改 `src/components/morning-sketch/LotusWelcomeWidget.tsx`，使圖標、標題、內文與按鈕組能動態讀取調校參數並套用 X/Y 平移、縮放與字型大小 inline styles
- [x] 2.2 於 `LotusWelcomeWidget.tsx` 中新增條件渲染，若配置了 `custom_icon_url` 則顯示 `<img>` 圖標以取代蓮花 SVG

## 3. APC Tools 首頁精密調校儀整合

- [x] 3.1 修改 `src/app/developer/DeveloperConsoleClient.tsx`，在「高階製程工具 (APC Tools)」分頁中加入「首頁內容精密調校儀 (Homepage APC Aligner)」入口卡片與子面板狀態切換
- [x] 3.2 於該子面板中實作公告 01-04 選擇按鈕切換，以及自訂圖片上傳與 X/Y 軸平移、Scale、FontSize 精密調校微調按鈕表單

## 4. 驗證與品質控制

- [x] 4.1 測試在 APC Tools 中點選首頁對準儀，成功切換公告、上傳自訂圖標圖片並手動微調 X/Y 偏移量，確認首頁視覺對齊效果完美
- [x] 4.2 執行 TypeScript 類型檢查與修改檔案的 ESLint 檢查確保無 Error 或 Warning
