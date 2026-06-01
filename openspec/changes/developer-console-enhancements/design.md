# Design: developer-console-enhancements

## Context

Next.js 15 App Router，`/developer` 是 Server Component，有 server-side auth guard。`DeveloperConsoleClient.tsx` 是 Client Component，接收 server props。

現有 `getSystemStats()` 示範了 developer-scoped Supabase query 的正確模式（使用 `ensureDeveloper()`）。本 change 延伸這個模式。

## Goals

- G1: Overview tab 顯示英雄流行度 Top 5
- G2: 新 Tab 4（用戶管理）列出所有名片基本資訊
- G3: 客戶端搜尋 + 分頁
- G4: social_channels 不傳給 client（隱私保護）

## Non-Goals

- 不實作 server-side 搜尋（數據量小，client-side 足夠）
- 不實作編輯/刪除用戶名片
- 不實作 Feature Flags
- 不實作系統公告

---

## D1 — RLS Policy 語法

Supabase v2 在 RLS 中存取 app_metadata 的正確方式：

```sql
(auth.jwt() -> 'app_metadata' ->> 'role') = 'developer'
```

此語法在 Supabase PostgreSQL 環境已驗證（REF-006）。`auth.jwt()` 回傳當前請求的 JWT JSON，`-> 'app_metadata'` 取 JSONB 子物件，`->> 'role'` 取文字值。

**Policy 設計（OR 邏輯）**：
```sql
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'developer'
  OR (SELECT auth.uid()) = user_id
)
```
一般用戶：只能讀自己 → `auth.uid() = user_id` ✓  
開發者：可讀任意 → 第一條件 ✓

## D2 — Hero Stats：JS 聚合 vs RPC

| 方案 | 優點 | 缺點 |
|---|---|---|
| **A. JS 聚合（選擇）** | 實作簡單，不需新增 DB function | 資料量大時效能差 |
| B. DB RPC UNNEST | 效能好，單次查詢 | 需新增 SQL function，複雜度高 |

**選擇 A**：MVP 階段用戶數 < 1000，JS 聚合完全夠用。資料量達 10,000+ 時再遷移到 RPC。

**聚合邏輯**（Server Component 中執行）：
```typescript
// 取所有 selected_heroes 陣列，展平，計數
const heroCount = new Map<string, number>();
profiles.forEach(p => {
  (p.selected_heroes || []).forEach(heroId => {
    heroCount.set(heroId, (heroCount.get(heroId) || 0) + 1);
  });
});
const top5 = [...heroCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([heroId, count]) => ({ heroId, count }));
```

## D3 — Users Tab：On-demand Loading（Gemini C2 修正）

Gemini 指出將大量 rows 作為 Server Component props 傳遞會序列化進 RSC payload，造成初始 TTFB 惡化和 hydration 卡頓。

**修正架構**：Users tab 採 **client-side on-demand fetch**，點擊 tab 時才觸發：

```typescript
// DeveloperConsoleClient.tsx 中
const [usersData, setUsersData] = useState<ProfileRow[] | null>(null);
const [usersLoading, setUsersLoading] = useState(false);

const handleTabClick = async (tab: string) => {
  setActiveTab(tab as TabType);
  if (tab === "users" && !usersData) {
    setUsersLoading(true);
    const res = await fetch("/api/developer/users");  // 或直接 Server Action
    const json = await res.json();
    setUsersData(json.data);
    setUsersLoading(false);
  }
};
```

**具體實作**：建立 `getAllProfilesForDeveloper()` Server Action，由 Client Component 直接 call（Server Actions 可從 Client Components 呼叫）。

```typescript
// 點擊 users tab 時
const data = await getAllProfilesForDeveloper();
setUsersData(data);
```

**好處**：
- Overview tab 完全不受影響（不等 user list query）
- Users tab 資料只在需要時載入
- Server Action 繼承 `ensureDeveloper()` 守門，安全性不變

**Server-side pagination 留給 future change**（當 totalProfiles > 500 時）。

## D4 — social_channels 過濾

Server action `getAllProfilesForDeveloper()` 在 SELECT 中明確排除 `social_channels`：
```typescript
const { data } = await supabase
  .from("profiles")
  .select("user_id, battle_tag, is_tag_visible, selected_heroes, updated_at")
  .range(0, 99);
```

`social_channels` 不在 select 列表，因此不會傳到 client。

## D5 — 修正後 Props interface（最小化 server props）

Users tab 改為 on-demand，`allProfiles` 不再作為 server props 傳遞：

```typescript
interface DeveloperConsoleClientProps {
  initialWhitelist: Array<{ email: string; created_at: string }>
  currentUserEmail: string
  totalProfiles?: number
  completedProfiles?: number
  statsError?: string
  heroStats?: Array<{ heroId: string; count: number }>  // 新增（輕量）
  // allProfiles 移除，改由 client on-demand fetch
}
```

`heroStats` 在 Server Component 中只需查 `selected_heroes` 欄位（不含其他資料），序列化成本低。

---

## 實際時間估算

| Task | 預估 |
|---|---|
| DB migration | 5 min |
| Server actions | 15 min |
| page.tsx 更新 | 10 min |
| DeveloperConsoleClient UI | 30 min |
| Build verify | 10 min |
| **合計** | **~70 min** |

Wall-clock 略超 1 hr，依 §3.3 需先跑 smoke test（只確認 DB migration 不 breaking）。

---

## Rationale 表

| 決策 | 選擇 | 依據 |
|---|---|---|
| RLS policy 語法 | `auth.jwt() -> 'app_metadata' ->> 'role'` | REF-006 已驗證 |
| Hero stats 聚合 | JS 聚合（MVP）| D2 |
| Pagination | Client-side（MVP，最多 100 筆）| D3 妥協方案 |
| social_channels | 不 select，不傳 client | D4 |
