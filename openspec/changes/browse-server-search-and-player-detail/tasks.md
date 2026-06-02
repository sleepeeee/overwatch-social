# Tasks: browse-server-search-and-player-detail

## Task 1 — OverwatchSquare.tsx：server-side 搜尋 + Load More

**驗收**：搜尋時發送 Supabase request；顯示「載入更多」按鈕

- [ ] 新增 `PAGE_SIZE = 20` 常數
- [ ] 新增 `offset` state（初始 0）、`hasMore` state
- [ ] 新增 `debouncedSearch` ref（300ms debounce）
- [ ] 改寫 `loadPlayers()`：接受 `(searchQ: string, offsetVal: number)` 參數
  - 加入 `.limit(PAGE_SIZE)` + `.range(offsetVal, offsetVal + PAGE_SIZE - 1)`
  - 加入 `if (searchQ.trim()) query = query.or('battle_tag.ilike.%${searchQ}%,...')`
  - append 模式（offset > 0 時用 `setPlayers(prev => [...prev, ...newData])`）
  - `setHasMore(newData.length === PAGE_SIZE)`
- [ ] `searchQuery` 改變時：debounce → `setOffset(0); loadPlayers(searchQ, 0)`
- [ ] 加入「載入更多」按鈕（`hasMore && !isLoading` 時顯示）
- [ ] 保留 client-side role/server/mic 篩選（對已載入的資料過濾）

---

## Task 2 — 新建 `/player/[id]` 詳細頁

**驗收**：`/player/xxx` 能顯示玩家公開資料；不存在時顯示 not found

- [ ] 建立 `src/app/player/[id]/page.tsx`（Server Component）
- [ ] 從 `public_profiles` 讀取 `user_id = id` 的資料
- [ ] 若無資料 → render "玩家不存在或已將名片設為私密"
- [ ] 顯示：英雄立繪（使用現有英雄圖片路徑）、BattleTag（visible 時顯示）、標籤 chips、留言、伺服器、MBTI、語言、mic
- [ ] 聯絡方式：檢查登入狀態，未登入顯示「登入後查看」
  - 從 `profiles` 表讀取 `social_channels`（受 RLS 保護，未登入會返回 null）
- [ ] 頁面頂部加「← 返回廣場」按鈕（`Link href="/browse"`）
- [ ] 套用現有莫蘭迪主題樣式（glass-panel / 現有 CSS class）

---

## Task 3 — Browse 點擊跳轉（使用 Link）

**驗收**：點擊卡片可到詳細頁；中鍵可開新 tab

- [ ] 在 `OverwatchSquare.tsx` 用 `<Link href="/player/${player.user_id}">` 包裹 OWCard
- [ ] 加 `cursor-pointer block` class
- [ ] OWCard 內複製按鈕加 `e.stopPropagation()`

## Task 3.5 — DB Migration：public_profiles view 加 social_channels

**驗收**：已登入用戶在詳細頁能看到社群聯絡方式

- [ ] 建立 `supabase/migrations/007_public_profiles_social.sql`
  - 更新 `public_profiles` view：加入 `social_channels` 欄位 + WHERE `is_tag_visible = true`
- [ ] 在 Supabase Dashboard SQL Editor 執行（更新 view）

---

## Task 4 — Build 驗證 + 推送

- [ ] `npm run build` 無 TypeScript 錯誤
- [ ] 確認 `/player/[id]` 路由存在於 build output
- [ ] 實際到廣場點一張卡片，確認跳到詳細頁
- [ ] `git commit && git push`
