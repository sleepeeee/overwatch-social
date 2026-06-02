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

