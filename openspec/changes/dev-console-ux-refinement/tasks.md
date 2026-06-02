## 1. 權限與全域 Banner 佈局修復

- [x] 1.1 修改 `src/app/developer/adjuster/page.tsx`：加入本地開發 `isDev` 權限豁免條件，防止開發環境下被重定向回首頁。
- [x] 1.2 修改 `src/components/DevModeBanner.tsx`：將 `fixed` 樣式替換為 `relative z-[100] w-full`，使其正常佔用高度而不遮擋首頁及後台的 Header。

## 2. 後台左鍵選取鎖定解鎖

- [x] 2.1 修改 `src/app/developer/DeveloperConsoleClient.tsx`：加入 `useEffect` 在元件掛載時將 `body.style.userSelect` 設為 `text`，並在 unmount 時還原。
- [x] 2.2 修改 `src/app/developer/adjuster/AdjusterClientPage.tsx`：加入同樣的 `useEffect` 鎖定解除邏輯。
- [x] 2.3 修改 `src/app/developer/homepage-aligner/HomepageAlignerClient.tsx`：加入同樣的 `useEffect` 鎖定解除邏輯。

## 3. 標籤管理工具獨立解耦

- [x] 3.1 建立 `src/app/developer/tags-manager/page.tsx`：負責標籤管理獨立頁面的伺服器端權限驗證 (具備 `isDev` 豁免) 與預載特色標籤資料。
- [x] 3.2 建立 `src/app/developer/tags-manager/TagsManagerClient.tsx`：移入原本的特色標籤新增/刪除 UI 與 API 串接邏輯，並加入 `useEffect` 左鍵解鎖。

## 4. 控制台文字去半導體化與工具箱整合

- [x] 4.1 修改 `src/app/developer/DeveloperConsoleClient.tsx`：
  - 移除「標籤管理 (Tags)」Tab，將其邏輯完全抽離。
  - 將所有半導體術語（如：APC、高階製程、控制中心、監控等）替換為直觀的軟體控制台文字。
  - 工具箱（原高階製程工具）內整合「立繪對準工具」、「首頁調校工具」與新「特色標籤管理工具」三張卡片。
  - 三張工具卡片的啟動按鈕皆加上 `target="_blank" rel="noopener noreferrer"` 以新視窗分頁開啟。

## 5. 整合與驗證

- [x] 5.1 驗證立繪對準工具：確認在開發環境訪問 `/developer/adjuster` 不會被 redirect 到首頁。
- [x] 5.2 驗證選取與 Banner 佈局：確認後台文字皆可左鍵選取與複製，且全站 Header 均不再被 Dev Mode Banner 覆蓋。
- [x] 5.3 驗證標籤獨立工具頁面：確認可於工具箱正常點擊開啟新分頁，且新增與物理刪除功能運作正常。
