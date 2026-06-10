---
id: REF-024
type: docs
title: Supabase 生成型別（Database generic）：gen types + createClient<Database> 端到端型別
url: https://supabase.com/docs/guides/api/rest/generating-types
status: active
version: "supabase-js 2.106.2 / @supabase/ssr 0.10.3"
last_updated: 2026-06-11
official: true
references_to: []
referenced_by: []
---

## 探索動機（Stage 1）

C2（adopt-supabase-generated-types）要消除跨資料邊界的手動型別斷言。
核心技術選擇：用 Supabase 官方生成的 `Database` 型別 + `createClient<Database>` 泛型，
讓 `.from('profiles').select()` 在編譯期帶出真實欄位型別，多數 `as` 斷言可移除。

## 生成方式（兩條路徑）

### 路徑 A：MCP（本專案首選，無需 CLI/登入）

```
mcp__supabase__generate_typescript_types   # 直接對 project cxoncanfveqtfofcqyqe 生成
```

輸出寫入 `src/types/database.ts`（命名見 design.md）。

### 路徑 B：CLI（fallback）

```bash
npx supabase gen types typescript --project-id cxoncanfveqtfofcqyqe --schema public > src/types/database.ts
```

> 兩條路徑都讀**生產 DB 的當前 schema**，而非 repo 的 migration 檔。
> 這對 C2 至關重要：見 §「生產 DB vs migration drift」。

## Database 型別的結構

```ts
export type Database = {
  public: {
    Tables: {
      profiles: { Row: {...}; Insert: {...}; Update: {...} };
      user_profiles: { Row; Insert; Update };
      developer_whitelist: { Row; Insert; Update };
      announcements: { Row; Insert; Update };
      game_special_tags: { Row; Insert; Update };
      hero_alignments: { Row; Insert; Update };
    };
    Views: {
      public_profiles: { Row: {...} };   // view 只有 Row，無 Insert/Update
    };
    Functions: {
      get_hero_stats: { Args: {...}; Returns: {...}[] };
    };
  };
}
```

## 型別存取模式

| 目標 | 存取式 |
|---|---|
| base table row | `Database['public']['Tables']['profiles']['Row']` |
| view row | `Database['public']['Views']['public_profiles']['Row']` |
| upsert/insert payload | `Database['public']['Tables']['profiles']['Insert']` |
| 簡寫（生成檔自帶）| `Tables<'profiles'>` / `TablesInsert<'profiles'>` |

**Row vs Insert vs Update 差異**：
- **Row**：SELECT 回傳結構（含所有欄位，nullable 反映 NOT NULL）。
- **Insert**：generated 欄位（如 `gen_random_uuid()` 的 id、`now()` 的 created_at）為可選；nullable 欄位可選。
- **Update**：所有欄位變可選。

## createClient<Database> 泛型注入

```ts
// server.ts
import type { Database } from "@/types/database";
createServerClient<Database>(url, key, { cookies: {...} })

// client.ts
createBrowserClient<Database>(url, key)
```

注入後：
- `.from('profiles').select('*')` 的 `data` 自動推為 `Tables<'profiles'>['Row'][]`
- `.select('user_id, battle_tag')` 只投影選定欄位（型別也只含這些）
- `.eq('server', x)` 的欄位名拼錯 → **編譯期報錯**（這正是 C2 要的價值）

## 對 C2 的關鍵啟示

1. **泛型注入是一次性投資**：改 `server.ts`/`client.ts` 兩處，全 codebase 的查詢自動帶型別。
2. **生成型別是 DB 真實 schema，不是 app domain 型別**：`OWPlayerCard`（手寫）保留；row→card 轉換時用 `Row` 型別取代 `Record<string,unknown>`。
3. **view 與 table 的同名欄位型別可能不同**（social_channels：見 REF-025）。

## 生產 DB vs migration drift（C2 重大注意）

`gen types` 讀生產 DB 即時 schema。本專案 C1（harden-supabase-security）已把
`public_profiles.social_channels` 改為遮罩布林並 apply 到生產 DB，但
**repo 的 `supabase/migrations/` 尚無對應 migration 檔**（015/017 仍是未遮罩版本）。

→ 生成型別會誠實反映生產 DB（遮罩布林），這正確；但會與 repo migration 檔不一致。
→ C2 不負責補 migration；但 design.md 須標註此 drift，避免後人誤判生成型別「錯了」。

## 相關 REF / Finding / ADR

- REF-025：social_channels view vs base table 型別分歧（C2 最大風險點）
- REF-002：Supabase SSR Next.js App Router（createClient 既有用法）
- ADR-01：DB 層 view 隱私遮蔽（C1 遮罩 social_channels 的設計根源）
