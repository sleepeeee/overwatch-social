## Why

上一輪移植把 `C:\Users\a1214\Downloads\after_midnight (3).html` 當成風格參考，導致部分畫面被自由重寫、部分功能被收納但沒有接回畫面。使用者已明確指定該 HTML 是「定版稿」，不是 moodboard。這次變更要把 Next.js 網站調整為以定版 HTML 為唯一視覺來源，同時保留既有 Supabase 登入、資料儲存與開發者後台。

## What Changes

- 以 `after_midnight (3).html` 為 Home / Lobby / Studio 的視覺與互動基準。
- 修復被移除或收納的開發者入口：開發者登入後，最上方 `DEV MODE - 開發者模式` 本身即為 `/developer` 入口。
- 將開發者模式條從橘色警示改為符合「曜石暗夜星河」的深色星河提示條，保留提醒性但不破壞美感。
- 逐步校正首頁、展示館、工作室與全域樣式，避免再次自由發揮。
- 保留現站必要功能：Supabase Google 登入、登出、玩家資料讀寫、`/developer` 路由與權限判斷。

## Capabilities

### Modified Capabilities

- `art-ui-aesthetics`: 定版 HTML 成為唯一視覺驗收標準。
- `auth-ux`: 開發者模式條可直接進入 `/developer`，並保留登入狀態判斷。
- `profiles`: 工作室畫面與互動需逐步對齊定版 Studio，而不是只修補局部功能。

## Impact

- 影響檔案：
  - `src/components/DevModeBanner.tsx`
  - `src/components/TopBar.tsx`
  - `src/app/page.tsx`
  - `src/app/browse/page.tsx`
  - `src/app/profile/page.tsx`
  - `src/app/globals.css`
  - 相關前台元件與 OpenSpec 任務檔

## Non-Goals

- 不導入 HTML 裡的 Firebase；現站維持 Supabase。
- 不破壞 `/developer` 內部工具。
- 不重寫資料庫 schema。
- 不把定版 HTML 改成另一種風格。
