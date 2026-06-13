# share Specification

## Purpose
TBD - created by archiving change share-page-completion. Update Purpose after archive.
## Requirements
### Requirement: getPublicProfile Server Action
系統 SHALL 在 `src/app/actions/profile.ts` 提供 `getPublicProfile(userId)` Server Action，查 `public_profiles` view 回傳 `OWPlayerCard`（social_channels 為空）。

#### Scenario: 存在玩家回傳資料
- WHEN `getPublicProfile("valid-user-id")` 被呼叫
- THEN 回傳 `OWPlayerCard` 物件，含 battle_tag / selected_heroes / tags 等
- AND `social_channels` 為 `{}`（不暴露聯絡方式）

#### Scenario: 不存在玩家回傳 null
- WHEN `getPublicProfile("non-existent-id")` 被呼叫
- THEN 回傳 `null`

#### Scenario: anon 可呼叫
- WHEN 未登入狀態下訪問 `/share/{id}`（Server Component 呼叫 getPublicProfile）
- THEN 頁面正常渲染（public_profiles view 允許 anon 讀取）

### Requirement: share 頁面 generateMetadata
`/share/[id]` 頁面 SHALL 為 Server Component，提供 `generateMetadata`，包含 og:title、og:description、og:image。

#### Scenario: 正常玩家的 og meta
- WHEN 社群平台 crawler 訪問 `/share/{id}`（valid userId）
- THEN og:title 為「{battle_tag} 的 OW 名片 | OW Social」
- AND og:description 為玩家 message（或 tags join，或預設文字）
- AND og:image 為第一位英雄頭像的絕對 URL（`${NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/{heroId}.png`）

#### Scenario: 不存在玩家的 og meta
- WHEN crawler 訪問不存在的 `/share/{id}`
- THEN title 為「找不到名片 | OW Social」

#### Scenario: og:image 絕對 URL
- WHEN `NEXT_PUBLIC_SITE_URL` 設定為 `https://overwatch-social.vercel.app`
- THEN og:image URL 包含完整 domain（例如 `https://overwatch-social.vercel.app/images/heroes/avatars/ana.png`）
- AND 在部署後，curl 請求 `/share/{id}` 的 HTML 中可查到含 domain 的 og:image meta tag

#### Scenario: NEXT_PUBLIC_SITE_URL 未設定時 og:image 省略
- WHEN `NEXT_PUBLIC_SITE_URL` 未設定（undefined 或空字串）
- THEN generateMetadata 的 og:image 欄位省略（不設定壞連結）
- AND 生產環境（Vercel）MUST 設定此 env var

### Requirement: share 頁面顯示真實名片
`/share/[id]` 頁面 SHALL 顯示真實玩家名片（非 mock 資料），由 Server Component 取得後傳給 ShareCardClient。

#### Scenario: 訪問真實玩家 share 連結
- WHEN 訪問 `/share/{valid-userId}`
- THEN 頁面顯示該玩家的 battle_tag / 英雄 / 標籤
- AND 不顯示「愛喝奶茶#3342」等 mock 預設值

#### Scenario: 導出圖片功能保留
- WHEN 使用者點擊「保存此卡片為圖片」
- THEN 可下載包含名片內容的 PNG 圖片

#### Scenario: social_channels = {} 型別相容性
- WHEN `getPublicProfile` 回傳 `social_channels: {}`
- THEN `OWCard` 元件接受 empty object（`social_channels` 預設值為 `{}`）
- AND TypeScript 編譯無 error（`OWCard` 的 `social_channels` 欄位允許空物件）

### Requirement: layout.tsx 全站 og meta
`layout.tsx` SHALL 包含全站 openGraph 預設設定（siteName / locale / type / 預設圖片）。

#### Scenario: 全站 og:site_name 存在
- WHEN 任一頁面被分享（無個別 generateMetadata 覆蓋）
- THEN og:site_name 為「OW Social」
- AND og:locale 為「zh_TW」

### Requirement: player/[id] 加 og:image 和分享按鈕
`/player/{id}` 頁面 SHALL 在 `generateMetadata` 中包含 og:image，並在 UI 中顯示「分享名片」連結按鈕。

#### Scenario: player 頁面有 og:image
- WHEN 分享 `/player/{id}` 連結
- THEN og:image 為該玩家第一位英雄頭像的絕對 URL

#### Scenario: 分享名片按鈕存在
- WHEN 訪問 `/player/{id}`
- THEN 頁面有「分享名片」Link，href 為 `/share/{id}`

### Requirement: Share Page Visual Overhaul
分享頁面（`ShareCardClient`）的背景、按鈕、提示泡泡與字體必須 (SHALL) 全面翻新，以符合最新的「曜石暗夜星塵（web-overhaul）」單主題視覺標準。

#### Scenario: Verify Share Page Aesthetics
- **WHEN** 使用者訪問分享頁面 `/share/{id}` 時
- **THEN** 頁面必須呈現全螢幕無縫大氣星空漸層（`ambient-space-glows`）背景，並移除舊版莫蘭迪漂浮球（`FluidClipPath`）。
- **AND** 「返回大廳」與「建立卡片」按鈕呈現暗色玻璃擬態風格。
- **AND** 「保存此卡片為圖片」按鈕套用曜石星河漸層極光紫配色。
- **AND** 右上角提示泡泡變更為極光紫配色，正下方說明文字變更為全站預設字體（`font-sans`）並套用 `text-zinc-400` 鋅灰色，不得殘留任何舊版莫蘭迪深褐色（`#3e2723`）或沙色（`#8c7c6c`）。

### Requirement: 行動裝置名片圖片匯出立繪完整性

名片圖片匯出（`src/lib/cardImageExport.ts`）SHALL 確保所有英雄立繪 `<img>` 在 `html-to-image` 擷取前已完成載入與 decode，使行動裝置（iOS/Safari）匯出圖片不出現立繪空白。

#### Scenario: 立繪未載入完成時不被跳過

- **WHEN** `preloadImagesAsDataUrls` 處理一張尚未 `complete` 或 `naturalWidth === 0` 的立繪 `<img>`
- **THEN** 系統 SHALL 先等待該圖 `load`（含 timeout 上限）並 `decode()` 後再轉為 data URL
- **AND** SHALL NOT 直接跳過（early-return）該圖

#### Scenario: 擷取前雙呼叫暖機

- **WHEN** `createCardImageDataUrl` 或 `exportCardImage` 進行圖片擷取
- **THEN** 系統 SHALL 先 `await document.fonts.ready`
- **AND** SHALL 先執行一次 `toPng`/`toBlob` 暖機（結果丟棄）再進行第二次正式擷取

#### Scenario: 行動裝置三張立繪完整

- **WHEN** 在行動裝置匯出一張含 3 位英雄的名片
- **THEN** 產出 PNG 中 3 張立繪皆 SHALL 完整呈現（非空白）

### Requirement: iOS 名片圖片可存入相簿

share 頁（`src/app/share/[id]/ShareCardClient.tsx`）SHALL 在支援的裝置上提供透過 `navigator.share({ files })` 將名片圖片存入系統相簿的路徑，並在不支援時提供備援。

#### Scenario: iOS 提供存入相簿入口

- **WHEN** 使用者在支援 Web Share file 的行動裝置開啟 share 頁並圖片已產生
- **THEN** 頁面 SHALL 提供「儲存到相簿」操作，點擊時呼叫 `navigator.share({ files: [file], title: "" })`
- **AND** 該 `File` SHALL 為預先在背景產好的物件（按鈕在 file 就緒前 disabled），使分享呼叫位於使用者手勢的 transient activation 內

#### Scenario: 分享取消不視為錯誤

- **WHEN** 使用者在系統分享單中取消（`AbortError`）
- **THEN** 系統 SHALL 視為正常結束，不顯示錯誤

#### Scenario: 不支援 Web Share 時的備援

- **WHEN** 裝置不支援 `navigator.share`/`canShare({files})`，或分享因非 `AbortError` 失敗
- **THEN** 系統 SHALL 保留長按產出圖片儲存 + 下載 fallback
- **AND** 頁面 SHALL 保留文案提示（如 iOS 僅出現存檔案，可於檔案 app 再加入照片）

