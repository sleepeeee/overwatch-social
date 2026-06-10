## 1. 全站 Canonical URL 實作

- [x] 1.1 於 [layout.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/layout.tsx) 中，為 metadata 新增 alternates.canonical 設定，其 URL 預設為 production 域名。

## 2. 頁面重構與 Metadata / JSON-LD 優化

- [x] 2.1 將 [page.tsx (root)](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx) 移至 `src/app/HomeClient.tsx`。
- [x] 2.2 建立 Server Component 首頁 [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx)，在其中注入 `WebSite` JSON-LD 結構化資料，並載入 `<HomeClient />`。
- [x] 2.3 將 [browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx) 移至 `src/app/browse/BrowseClient.tsx`。
- [x] 2.4 建立 Server Component 廣場頁面 [browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx)，匯出靜態的 `Metadata`，並載入 `<BrowseClient />`。
- [x] 2.5 將 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 移至 `src/app/profile/ProfileClient.tsx`。
- [x] 2.6 建立 Server Component 工作室頁面 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx)，匯出靜態的 `Metadata`，並載入 `<ProfileClient />`。
- [x] 2.7 修改 [player/[id]/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/player/[id]/page.tsx) 中的 `generateMetadata` 函式，將標題後綴從 `OW Social` 替換為 `After Midnight`。

## 3. 測試與驗證

- [x] 3.1 啟動開發伺服器驗證網頁的路由與各頁面 UI / state 是否能正常交互。
- [x] 3.2 檢視瀏覽器產生的 HTML 源碼，確保 Canonical 連結、獨立的 Title & Description、首頁 JSON-LD 均正確呈現在 DOM 中。
- [x] 3.3 執行 `npm run build` 確認整個 Next.js 專案無編譯與 TypeScript 型別錯誤。
