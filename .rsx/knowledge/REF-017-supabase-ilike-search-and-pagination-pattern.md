---
id: REF-017
type: docs
title: Supabase ilike 搜尋 + Load More 分頁模式
url: n/a
status: active
references_to: [REF-016, F-012]
referenced_by: [F-014, ADR-14]
---

## 問題

`OverwatchSquare.tsx` 的搜尋全在前端（client-side），一次撈所有 profiles 後在 `filteredPlayers` 做 substring match。這在資料量大時會造成：
- 全部資料一次傳到瀏覽器（頻寬浪費）
- 搜尋延遲（大量資料 O(n) filter）
- 搜尋結果不準（前端不能搜索 DB 層排除的欄位）

## Supabase ilike 搜尋模式

`public_profiles` view 可用文字欄位（`battle_tag`, `message`, `mbti`）支援 `.ilike()`：

```typescript
let query = supabase
  .from("public_profiles")
  .select("*")
  .eq("is_tag_visible", true)
  .order("updated_at", { ascending: false })
  .limit(20);

if (searchQuery.trim()) {
  query = query.or(
    `battle_tag.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%,mbti.ilike.%${searchQuery}%`
  );
}
```

**注意**：英雄名稱搜尋（HEROES_CONFIG lookup）無法在 DB 層做，需保留 client-side 補充過濾。

## Load More 分頁模式

使用 `range()` offset-based pagination（MVP 最簡單，不需 URL state）：

```typescript
const PAGE_SIZE = 20;

// 初次載入
query.range(0, PAGE_SIZE - 1);

// 載入更多（offset 累積）
const { data: more } = await supabase
  .from("public_profiles")
  .select("*")
  .eq("is_tag_visible", true)
  .range(players.length, players.length + PAGE_SIZE - 1);

setPlayers(prev => [...prev, ...more]);
```

**總筆數取法**：`select("*", { count: "exact", head: true })` 單獨取總數，決定是否顯示「載入更多」按鈕。

## 搜尋 + 分頁整合

搜尋字串改變時：
1. 重置 offset（回到第一頁）
2. 重新執行 server query
3. 更新 `players` state

**Debounce**：300ms（避免每個按鍵都打 API）。

## Player Detail Page 模式

`/player/[id]` 使用 Next.js App Router dynamic route：

```
src/app/player/[id]/page.tsx  ← Server Component
```

從 `public_profiles` 讀取單一玩家（`user_id = id`），social_channels 保持隱私（不在 view 中）。未登入可看基本資訊，登入後才顯示社群聯絡方式（從 `profiles` 表讀）。
