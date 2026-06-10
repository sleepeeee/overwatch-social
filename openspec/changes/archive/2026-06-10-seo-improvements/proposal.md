## Why

當前網站已由原先的 "OW Social"（專屬 Overwatch 社群）轉型為 "After Midnight"（泛遊戲深夜玩家社群），需要全面升級網站的搜尋引擎最佳化（SEO）表現，確保搜尋引擎（如 Googlebot）能正確抓取、理解品牌重組後的內容，並防止重複網址權重分散。

## What Changes

- **全站 layout 調整**：在 [layout.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/layout.tsx) 中加入全站 canonical URL 設定。
- **首頁結構重構**：將首頁 [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx) 由單一 Client Component 重構為「Server Component 容器 + Client Component 內容」的架構，並在 Server 端注入 `WebSite` JSON-LD 結構化資料。
- **廣場與個人工作室重構**：將 [browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx) 與 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 由單一 Client Component 拆分為「Server Component 容器 + Client Component 內容」，以容許在此兩個頁面獨立匯出靜態的 `Metadata`（設定專屬的 title 與 description）。
- **個人卡片頁面更新**：修改 [player/[id]/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/player/[id]/page.tsx) 中的 dynamic metadata，將 title 後綴的舊品牌 `OW Social` 更新為新品牌 `After Midnight`。

## Capabilities

### New Capabilities
- `seo-improvements`: 提供搜尋引擎最佳化能力，包括全站 Canonical URL 設定、各頁面獨立的靜態/動態 Metadata，以及首頁結構化資料 JSON-LD。

### Modified Capabilities
<!-- 無 spec 級別的修改 -->

## Impact

- 影響檔案：
  - [layout.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/layout.tsx)
  - [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx)
  - [browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx)
  - [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx)
  - [player/[id]/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/player/[id]/page.tsx)
- 新增檔案：
  - `src/app/HomeClient.tsx` (原首頁內容)
  - `src/app/browse/BrowseClient.tsx` (原廣場內容)
  - `src/app/profile/ProfileClient.tsx` (原個人設定內容)
- 不影響資料庫、Supabase 結構或 RLS 安全性原則。
