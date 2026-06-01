# Design: developer-console-backend

## Context

專案技術棧：Next.js 16 App Router + TypeScript + Supabase + `@supabase/ssr`。

相關既有基礎：
- REF-004 RLS 模式（`auth.jwt() -> 'app_metadata' ->> 'role'`）— 直接適用於 hero_alignments 寫入 policy
- REF-002 Server Action 模式（`createServerClient` + `await cookies()`）— 適用於 `getHeroAlignments()`
- REF-005 app_metadata 角色系統 — developer 角色已設定（`developer_whitelist` trigger）
- `src/app/actions/developer.ts` 的 `ensureDeveloper()` 守門函式 — 可直接複用
- `src/components/OWCard.tsx` 已有 `customAlignments` prop：`customAlignments?.[heroId] || HERO_ALIGNMENTS[heroId] || DEFAULT_ALIGNMENT`

## Decisions

### D1 — hero_alignments 表 Schema

```sql
CREATE TABLE IF NOT EXISTS public.hero_alignments (
  hero_id TEXT PRIMARY KEY,
  scale NUMERIC(4,2) NOT NULL DEFAULT 1.80,
  translate_x INTEGER NOT NULL DEFAULT 0,
  translate_y INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

欄位對應 `AlignmentConfig` interface（`scale` / `translateX`→`translate_x` / `translateY`→`translate_y`）。DB 欄位用 snake_case（Supabase 慣例）。

**Rationale**：REF-004 的 profiles 表模式直接複用。`hero_id` 對應 `HEROES_CONFIG[i].id`（英文小寫連字號，如 `"ana"`）。

---

### D2 — RLS Policies

```sql
ALTER TABLE public.hero_alignments ENABLE ROW LEVEL SECURITY;

-- 公開讀（前端渲染名片需要，任何人可查）
CREATE POLICY "Public read hero_alignments"
  ON public.hero_alignments FOR SELECT USING (true);

-- 僅 developer 可寫（insert/update/delete）
CREATE POLICY "Developer write hero_alignments"
  ON public.hero_alignments FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');
```

**Rationale**（Gemini Major 明確回應）：使用 `auth.jwt() -> 'app_metadata'` 而非 `user_metadata`，因 `app_metadata` 不可由使用者客戶端偽造（REF-005）。`FOR ALL` 覆蓋 INSERT/UPDATE/DELETE。

---

### D3 — saveHeroAlignments 改 Supabase upsert

**現況**：`fs.writeFileSync(filePath, content)` → Vercel 靜默失敗。

**修改**（`src/app/actions/saveAlignment.ts`）：

```ts
// 移除 import fs, path
// 保留 ensureDeveloper()

const supabase = await createClient();
const entries = Object.entries(alignments).map(([hero_id, cfg]) => ({
  hero_id,
  scale: parseFloat(cfg.scale.toFixed(2)),
  translate_x: cfg.translateX,
  translate_y: cfg.translateY,
  updated_at: new Date().toISOString(),
}));

const { error } = await supabase
  .from("hero_alignments")
  .upsert(entries, { onConflict: "hero_id" });

if (error) {
  console.error("Failed to save hero alignments:", error.message);
  return { success: false, error: error.message };
}
return { success: true };
```

**Error boundary**（Gemini Major 回應）：不再靜默吃掉錯誤——Server Action 回傳 `{ success: false, error }` 並 console.error，AdjusterClientPage 的 `saveStatus` state 會顯示 error 狀態給開發者。

---

### D4 — getHeroAlignments() Server Action（新建）

存放：`src/app/actions/alignment.ts`（從 saveAlignment.ts 拆出讀取邏輯）。

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { HERO_ALIGNMENTS, DEFAULT_ALIGNMENT, AlignmentConfig } from "@/data/heroAlignments";

export async function getHeroAlignments(): Promise<Record<string, AlignmentConfig>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_alignments")
      .select("hero_id, scale, translate_x, translate_y");

    if (error) {
      console.error("[getHeroAlignments] DB error, using static fallback:", error.message);
      return { ...HERO_ALIGNMENTS };
    }
    if (!data || data.length === 0) {
      return { ...HERO_ALIGNMENTS }; // DB 未 seed 或空表，fallback 靜態
    }

    const result: Record<string, AlignmentConfig> = { ...HERO_ALIGNMENTS }; // 先用靜態資料
    data.forEach(row => {
      result[row.hero_id] = {
        scale: parseFloat(row.scale),
        translateX: row.translate_x,
        translateY: row.translate_y,
      };
    });
    return result;
  } catch (err) {
    console.error("[getHeroAlignments] unexpected error, using static fallback:", err);
    return { ...HERO_ALIGNMENTS }; // 任何錯誤都 fallback（intentional，不破壞頁面）
  }
}
```

**注意**：`getHeroAlignments()` 不需要 `ensureDeveloper()`，因為公開讀取——任何人可查（RLS `FOR SELECT USING (true)`）。

**Browse/profile 頁面接入**：

```ts
// browse/page.tsx（Client Component）：在 useEffect 裡呼叫
import { getHeroAlignments } from "@/app/actions/alignment";

const [heroAlignments, setHeroAlignments] = useState<Record<string, AlignmentConfig>>(HERO_ALIGNMENTS);

useEffect(() => {
  getHeroAlignments().then(setHeroAlignments);
  // ... 其他 effect 邏輯
}, []);

// 傳給 OWCard
<OWCard customAlignments={heroAlignments} ... />
```

**Fallback 行為明確聲明**（Gemini Minor 回應）：DB 查詢失敗 → 使用 `HERO_ALIGNMENTS` 靜態資料（intentional fallback，非意外靜默）。靜態資料為 initial seed，DB 資料為 override。

---

### D5 — getSystemStats() 與 Overview 真實統計（含 RLS fix）

**C1 Critical fix**（Codex §6.5）：`profiles` 表現有 RLS 只允許用戶看自己的 row（REF-004 / ADR-01）。直接 SELECT count 會只得到 1。

**解法**：在 `003_hero_alignments.sql` migration 裡，新增 developer-only SELECT policy：
```sql
CREATE POLICY "Developers can view all profiles for stats"
  ON profiles FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');
```

此 policy 與現有 authenticated-own 策略並存，developer 優先命中 developer policy 可看全部，普通用戶只見自己。

`src/app/actions/developer.ts` 新增：

```ts
export async function getSystemStats() {
  const supabase = await ensureDeveloper();

  // developer RLS policy 已在 migration 加入，可看全部 profiles
  const [{ count: totalProfiles }, { count: completedProfiles }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .not("battle_tag", "is", null)
  ]);

  return {
    totalProfiles: totalProfiles ?? 0,
    completedProfiles: completedProfiles ?? 0,
  };
}
```

**驗收補強**（Codex C1 要求）：Task 5.1 驗證時，`getSystemStats()` 回傳的 `totalProfiles` 必須與 SQL Editor 執行 `SELECT COUNT(*) FROM profiles;` 相等。

`DeveloperConsoleClient.tsx` Overview tab：
- 移除「正常連線中 + Online badge」硬編碼
- 顯示 `totalProfiles`（建立名片的用戶數）
- 改用真實數字取代假 badge

**注意**：`auth.users` 總數需要 service_role key，改以 `profiles` 表計數代替（有名片的用戶 ≈ 活躍用戶，語意合理）。

---

### D6 — Migration seed（51 筆現有資料）

`003_hero_alignments.sql` 末尾加 `INSERT ... ON CONFLICT DO NOTHING` 把現有 `heroAlignments.ts` 的 51 筆資料塞進去，避免冷啟動時 DB 為空 → fallback 顯示 DEFAULT_ALIGNMENT。

---

## Risks / Trade-offs

| 風險 | 影響 | 緩解 |
|---|---|---|
| Migration seed 51 筆資料量大，SQL 冗長 | 可讀性低 | 用 `INSERT INTO ... VALUES` 多行格式，有規律 |
| `hero_alignments` DB 讀取增加 RTT | 廣場初始載入略慢（額外一個 SELECT） | 查詢輕量（51 rows 無 JOIN），影響可忽略；fallback 即時 |
| `getHeroAlignments` 在每個 OWCard mount 都呼叫 | 重複查詢 | 在 browse/profile page 層呼叫一次，結果傳給所有 OWCard（不在元件內） |
| 對準儀 save 後，前端需重新 fetch 才反映新值 | 開發者儲存後需刷頁才看到變化 | AdjusterClientPage 的 `saveStatus` 加提示「儲存成功，刷新頁面以看到更新」 |
