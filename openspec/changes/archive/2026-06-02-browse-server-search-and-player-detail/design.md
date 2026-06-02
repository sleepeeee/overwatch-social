# Design: browse-server-search-and-player-detail

## Context

Next.js 15 App Router + Supabase。`OverwatchSquare` 是 Client Component。`/player/[id]` 是新的 Server Component（讀 public_profiles）。

## Goals

- G1: 搜尋在 DB 層執行
- G2: Load More 分頁，不一次全撈
- G3: 點擊玩家卡片可到詳細頁
- G4: 詳細頁顯示完整公開資訊，登入後顯示聯絡方式

## Non-Goals

- 不做 URL-based pagination（MVP 不需要）
- 不做全文搜尋（FTS）— ilike 已足夠
- 不做玩家編輯功能（詳細頁只讀）

---

## D1 — Server-side 搜尋策略

**可 ilike 的欄位**（來自 `public_profiles` view）：
- `battle_tag`（text）
- `message`（text）
- `mbti`（text）

**不能 ilike 的**：
- `selected_heroes`（text[]）— 英雄 **名稱** 需查 HEROES_CONFIG（client-only），保留 client-side 補充過濾

**搜尋實作**：

```typescript
let query = supabase
  .from("public_profiles")
  .select("*")
  .eq("is_tag_visible", true)
  .order("updated_at", { ascending: false })
  .limit(PAGE_SIZE);

// role/server/mic 篩選加在 query 上
if (selectedRole !== "全部") {
  // selected_heroes 是 array，不能在 DB 層輕易過濾 role
  // 保留 client-side role filter
}

if (searchQuery.trim()) {
  query = query.or(
    `battle_tag.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%,mbti.ilike.%${searchQuery}%`
  );
}
```

英雄名稱搜尋和 role 過濾繼續在 client-side（對已載入的 20 筆做進一步過濾）。這是可接受的折衷，因為英雄名稱本來就是少量資料。

## D2 — Load More 分頁

```typescript
const PAGE_SIZE = 20;
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(false);

// 搜尋改變時：重置 offset，重新 fetch
// Load More：offset += PAGE_SIZE，append 到 players

// 判斷是否還有更多：
// 選項 A：fetch 結果筆數 === PAGE_SIZE（簡單但不準確）
// 選項 B：另外做一次 count query（準確但多一個 request）
```

**選擇 A**（MVP）：如果回傳 20 筆，就顯示「載入更多」；少於 20 筆則隱藏。偶爾可能多顯示一次按鈕（最後一批剛好 20 筆時），點了會得到 0 筆，按鈕消失。可接受。

**Debounce**：`searchQuery` 改變時 300ms debounce，防止每個按鍵都打 API。

## D3 — `/player/[id]` 詳細頁

**路由**：`src/app/player/[id]/page.tsx`（Server Component）

**資料來源**：
- 基本資訊（公開）：`public_profiles` view（`user_id = id`）
- 聯絡方式（需登入）：`profiles` 表（`user_id = id`，受 RLS 保護）

**畫面結構**：
```
← 返回廣場

[英雄立繪區]  [基本資訊]
              BattleTag / 伺服器 / MBTI
              標籤 chips
              留言
              語言 / 麥克風

[聯絡方式] - 未登入顯示「登入後查看」
              Discord / Steam 等（若已設定）
```

**404 處理**：找不到玩家或 `is_tag_visible = false` → 顯示「玩家不存在或已將名片設為私密」。

## D4 — OWCard 點擊跳轉

**修正（Gemini M2）**：使用 `<Link>` 而非 `div+onClick`，支援中鍵/Cmd+Click 開新 tab：

```tsx
import Link from "next/link";

<Link href={`/player/${player.user_id}`} className="cursor-pointer block">
  <OWCard cardData={player} ... />
</Link>
```

複製按鈕加 `e.stopPropagation()` 防止觸發 Link 跳轉。

## D5 — social_channels 顯示（Gemini C1 修正）

**問題**：`profiles` 表 RLS policy `profiles select own` 只允許讀自己的 row，所以 user A 在詳細頁看不到 user B 的 social_channels。

**修法**：把 `social_channels` 加進 `public_profiles` view（新增 `007_public_profiles_social.sql` migration）：

```sql
-- 只對 is_tag_visible=true 的玩家公開 social_channels
-- 更新 public_profiles view，加入 social_channels 欄位
create or replace view public_profiles as
  select
    user_id, server,
    case when is_tag_visible then battle_tag else '隱藏#xxxx' end as battle_tag,
    is_tag_visible, selected_heroes, tags, message, languages, mic_status, mbti, updated_at,
    social_channels   -- ← 新增（is_tag_visible=false 的玩家已在 view 中被排除）
  from profiles
  where is_tag_visible = true;  -- ← 加 WHERE 條件，只有公開才進 view
```

**邏輯**：`is_tag_visible = true` 代表玩家同意出現在廣場並被找到，因此公開 `social_channels` 是合理的。原本 view 是過濾出所有玩家（含 is_tag_visible=false），現在改為只含 is_tag_visible=true 的玩家，並加入 social_channels。

**注意**：現有 `grant select on public_profiles to anon, authenticated;` 已足夠，不需額外 GRANT。

## D6 — SEO（Gemini M3）

`/player/[id]` 加 `generateMetadata()`：

```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  // 同樣讀 public_profiles，只取 battle_tag
  const player = await getPlayerById(params.id);
  if (!player) return { title: "玩家不存在 | OW Social" };
  return {
    title: `${player.battle_tag} | OW Social`,
    description: player.message || "查看這位特工的遊戲名片",
  };
}
```

## D7 — AbortController（Gemini M1）

搜尋時加 abort 機制防止 race condition：

```typescript
const abortRef = useRef<AbortController | null>(null);

const loadPlayers = async (searchQ: string, offsetVal: number) => {
  abortRef.current?.abort();
  abortRef.current = new AbortController();
  // 注意：Supabase JS v2 的 .select() 不直接支援 AbortSignal
  // 改用 stale check：request ID 機制
  const requestId = Date.now();
  latestRequestRef.current = requestId;
  const result = await supabase...;
  if (latestRequestRef.current !== requestId) return; // 丟棄舊請求結果
};
```

---

## 實際時間估算

| Task | 預估 |
|---|---|
| OverwatchSquare 搜尋 + Load More | 30 min |
| /player/[id] 頁面 | 30 min |
| OWCard onClick | 10 min |
| Build 驗證 | 10 min |
| **合計** | **~80 min** |

Wall-clock < 1.5 hr，不觸發強制 Smoke Test（but 建議先確認 build 正常）。

---

## Rationale 表

| 決策 | 選擇 | 依據 |
|---|---|---|
| 搜尋欄位 | battle_tag + message + mbti ilike | REF-008 可用欄位分析 |
| 英雄 role 過濾 | 保留 client-side | 需 HEROES_CONFIG lookup，無法簡單在 DB 層做 |
| 分頁策略 | Load More（offset）| URL state 複雜度不值得 MVP 投入 |
| 分頁計數 | 回傳筆數判斷 | 避免額外 count query（MVP） |
| 詳細頁架構 | Server Component | 讀 DB，SEO 友善，不需 auth hook |
| OWCard 改動 | wrapper onClick，不動 OWCard | 最小侵入，不影響 profile 頁預覽 |
