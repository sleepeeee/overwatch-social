# Proposal: browse-server-search-and-player-detail

## Why

目前廣場有兩個根本性的問題讓它稱不上「交友」平台：

1. **搜尋是假的**：搜尋欄位看起來很完整，但所有過濾都在瀏覽器端執行。Supabase 一次把全部 profiles 丟給前端，瀏覽器再過濾。10 個人沒感覺，1000 個人讓電腦風扇起飛，10000 個人讓頁面直接卡死。F-003 Finding 已記錄此問題。

2. **卡片點了沒反應**：整個廣場，找到喜歡的玩家，點下去——什麼都沒發生。這就像看了相親網站的照片，按下去卻顯示「此功能正在開發中」。平台有「廣場」但沒有「交友」。

**Why Now**：
- 測試名片（星辰指引者#8847）已存在 DB，可以真實測試 end-to-end 流程
- GRANT 修復後儲存功能正常，是時候讓玩家找到彼此
- server-side search 是這個平台規模化的前提

## What Changes

1. **OverwatchSquare.tsx**：搜尋邏輯移至 Supabase（`battle_tag` + `message` + `mbti` 用 `.ilike()`），加入 Load More 分頁（每頁 20 筆）
2. **新建 `src/app/player/[id]/page.tsx`**：玩家詳細頁，展示完整公開資料；登入後顯示社群聯絡方式
3. **OWCard / Browse**：卡片加上點擊導向 `/player/[id]`

## Capabilities After Change

- 搜尋在資料庫層執行，不管玩家有多少都不卡
- 點擊玩家卡片可以看到詳細資料（英雄、標籤、留言、伺服器、MBTI）
- 登入後可以看到聯絡方式（Discord 等）
- Load More 按鈕讓廣場可以瀏覽所有玩家而不一次全撈

## Impact

- **新建**：`src/app/player/[id]/page.tsx`（1 個新路由）
- **修改**：`OverwatchSquare.tsx`（搜尋 + 分頁）
- **修改**：`src/app/browse/page.tsx` 或 `OWCard.tsx`（加 onClick）
- **DB 變更**：無（使用現有 `public_profiles` view）
- **破壞性**：零

## Related REFs

- REF-007: 問題 3（前端搜尋）+ 問題 5（卡片無反應）
- REF-008: ilike + Load More 技術模式
- F-003: client-side search on LIMIT = 設計缺陷
