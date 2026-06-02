# Proposal - 開發者控制台體驗優化與功能解耦 (dev-console-ux-refinement)

## Why
在目前版本中，開發者後台控制台存在數個影響開發與維護體驗的痛點：
1. **權限檢查過嚴**：本地開發時訪問「精密立繪對準補償儀」(`/developer/adjuster`) 會因缺少 `isDev` 豁免條件而直接被重定向彈回首頁。
2. **全域 Banner 擋視線**：全站常駐的「開發者模式提醒」(`DevModeBanner`) 採用 `fixed` 懸浮定位，且未佔據文檔流高度，導致首頁與後台的 Header/Navigation 內容被遮擋。
3. **左鍵選取被鎖定**：`globals.css` 中設定了全站 `user-select: none`，使得開發者無法在後台複製 BattleTag、Email 與系統日誌等關鍵資訊。
4. **功能名詞過於晦澀**：後台使用了大量半導體/先進製程名詞（如 APC Tools、補償儀、製程監控），不易於普通軟體維護。
5. **標籤管理需要解耦**：為了支持多遊戲標籤的彈性擴充與新分頁多工操作，需要將「標籤管理 (Tags)」從主後台抽離，移入獨立路由並以新分頁開啟。

## What Changes
* **修復重定向與 Banner**：
  * 修改 `src/app/developer/adjuster/page.tsx`，加入 `isDev` 開發環境權限豁免，使其與主後台行為一致。
  * 修改 `DevModeBanner.tsx`，移除 `fixed`，改為 `relative` 或 `sticky`，使其正常佔用頁面高度，避免全站首頁及後台被遮擋。
* **解鎖左鍵複製選取**：
  * 在 `DeveloperConsoleClient.tsx` 及各獨立工具頁面（對準儀、調校儀、標籤管理）中，使用 `useEffect` 在元件加載時將 `body` 的 `userSelect` 改為 `text`，並在卸載時還原。
* **去半導體名詞化（改用直觀文字）**：
  * 將控制台的「控制中心導覽」改為「後台功能導覽」、「高階製程工具」改為「後台工具箱 (Tools)」等。
* **標籤管理解耦至獨立路由**：
  * 建立新路由 `/developer/tags-manager`，將標籤管理 Tab 移動到此新頁面。
  * 主控制台工具箱加入「特色標籤管理工具」卡片，點擊後會在新視窗 (`target="_blank"`) 打開該工具。

## Impact
* **新增檔案**：
  * `src/app/developer/tags-manager/page.tsx`
  * `src/app/developer/tags-manager/TagsManagerClient.tsx`
* **修改檔案**：
  * `src/components/DevModeBanner.tsx`
  * `src/app/developer/adjuster/page.tsx`
  * `src/app/developer/DeveloperConsoleClient.tsx`
  * `src/app/profile/page.tsx` (標籤載入路由更新)
