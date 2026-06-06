## Why

目前 `/browse` 外層與 `OverwatchSquare` 內層同時提供搜尋、伺服器與篩選控制，導致畫面重疊、欄位高度不一致，而且未來新增或修改 Valorant / League 專區時，容易被 Overwatch 專用規則綁住。

## What Changes

- 將玩家展示館外層改為只負責遊戲選擇與專區切換。
- 新增 `src/components/browse/overwatch/` 作為 OW 專區唯一修改入口。
- 將 OW 的搜尋、伺服器、定位、語音篩選移入 OW 專區。
- 將 OW 篩選面板改成曜石暗夜星河主題，移除舊紙張風按鈕與白底空狀態。
- 保留 Valorant / League 未來獨立專區入口，避免共用 OW 篩選器。
- 同步修正新版定版稿要求的 Logo / 背景動態、上排導覽與工作室守門顯示策略。

## Non-Goals

- 不把 OW 篩選器抽成所有遊戲共用的 `SharedFilters`。
- 不改 Supabase schema。
- 不破壞 `/developer` 後台。
- 不導入定版 HTML 裡的 Firebase。

## Impact

- 主要影響：
  - `src/app/browse/page.tsx`
  - `src/components/browse/overwatch/*`
  - `src/components/CosmicParticlesBackground.tsx`
  - `src/components/TopBar.tsx`
  - `src/app/layout.tsx`
  - `src/context/AuthContext.tsx`
  - `src/hooks/useDevMode.ts`
