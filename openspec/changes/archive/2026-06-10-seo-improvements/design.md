## Context

目前 After Midnight 網站的頁面如 [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx) (首頁)、[browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx)、[profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 均因為使用了 `"use client"` 指令（以支援 React state、Hooks、Supabase login 以及各式客戶端動畫），因此無法直接匯出 Next.js Metadata。這導致多數頁面共享同一個 layout 上的預設標題與描述，對搜尋引擎最佳化（SEO）極為不利。

此外，個人名片展示路由 [player/[id]/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/player/[id]/page.tsx) 作為動態路由頁面，目前仍在使用舊品牌 "OW Social" 作為標題後綴，需要統一升級為新品牌 "After Midnight"。

## Goals / Non-Goals

**Goals:**
- 支援全站 Canonical URL，避免重複路徑分散 SEO 權重。
- 實現首頁、廣場、個人工作室、動態個人卡片頁面的獨立 Metadata，提升搜尋曝光率與品質。
- 在首頁注入符合 schema.org 規範的 WebSite JSON-LD 結構化資料。
- 保持原有的客戶端互動與狀態邏輯，確保使用者體驗與 RLS 安全性無損。

**Non-Goals:**
- 不變更資料庫 Table 結構與 Supabase 邏輯。
- 不開發後台自訂 SEO 設定的功能。

## Decisions

### 1. 拆分 Client Component 為「Server 容器 + Client 元件」結構
* **決策**：將原有的 [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx) 改名為 `HomeClient.tsx`、[browse/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/browse/page.tsx) 改名為 `BrowseClient.tsx`，以及 [profile/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/profile/page.tsx) 改名為 `ProfileClient.tsx`。接著在原路由位置建立新的 `page.tsx` 作為 Server Component 容器。
* **理由**：Next.js App Router 限制在標有 `"use client"` 的元件中不能匯出 `Metadata`。使用「Server 容器 + Client 元件」架構，讓我們可以在 Server 容器中直接 `export const metadata`（或者是 `generateMetadata`），同時在其中渲染 Client 元件，完美相容了 SEO 與豐富的前端客戶端互動需求。
* **替代方案**：
  * *直接移除 "use client"*：可行性為零，因為頁面高度依賴 Supabase 登入狀態（`useAuth()`）、React Hooks（`useState`、`useEffect`）以及動畫庫。

### 2. 於 Server 容器首頁注入 JSON-LD
* **決策**：在重構後的 `src/app/page.tsx` (Server Component) 中直接載入並渲染 WebSite JSON-LD。
* **理由**：在 Server 端直接將 `<script type="application/ld+json">` 渲染進 HTML 首頁，能確保搜尋爬蟲在不執行 JavaScript 的情況下，第一時間抓取並解讀出網站的結構化欄位資訊。

### 3. 動態路由頁面的品牌後綴更新
* **決策**：直接修改 [player/[id]/page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/player/[id]/page.tsx) 的 `generateMetadata` 函式，將 title 的品牌後綴從 `OW Social` 修改為 `After Midnight`。
* **理由**：此頁面已是 Server Component 且已實作 `generateMetadata`，修改極其單純且低風險。

## Risks / Trade-offs

* **元件重新命名與路徑匯入錯誤**
  * *風險*：檔案移動可能導致 webpack HMR 編譯錯誤或 typescript 找不到 module。
  * *對策*：保持原本的程式碼，僅做「檔案改名與移動」，並在變更後執行 `npm run build` 來驗證型別與編譯無誤。
* **重覆網址 canonical URL 設定不當**
  * *風險*：若網域設定錯誤，可能導致搜尋權重被引導至無效頁面。
  * *對策*：統一使用環境變數 `NEXT_PUBLIC_SITE_URL` 作為 canonical base，若未設定則 fallback 至生產環境網域 `"https://aftermidnight-gg.vercel.app"`。
