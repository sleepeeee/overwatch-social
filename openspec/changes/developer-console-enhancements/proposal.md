# Proposal: developer-console-enhancements

## Why

探索（REF-005）發現開發者後台的「系統概覽」只有 2 個數字、缺乏用戶管理能力，而「高階工具」tab 也只有一個對準儀入口。平台即將迎來真實用戶，管理工具的需求從「開發方便」升級為「運營必要」。

**Why Now**（外部觸發）：
- auth 系統已完整穩定（auth-topbar + auth-context 已封存）
- `getSystemStats()` 已建立 developer RLS 存取模式，可安全延伸
- 添加 developer SELECT policy 是純加法操作（additive）：不影響現有 RLS 行為，零破壞性
- 平台上線後，了解「誰在用、用什麼英雄」是最基本的運營需求

## What Changes

1. **DB Migration `004`**：新增 `profiles select developer` RLS policy，允許開發者讀取所有 profiles
2. **新增 Server Actions**：
   - `getAllProfilesForDeveloper()` — 分頁讀取所有用戶 profiles（不含 social_channels）
   - `getHeroStats()` — 從 profiles 聚合英雄選用次數
3. **Overview Tab 強化**：顯示英雄流行度 Top 5
4. **新 Tab 4 — 用戶管理**：列出所有玩家名片（BattleTag、英雄、可見性、更新時間）+ 搜尋 + 分頁

## Capabilities After Change

- 開發者可在後台看到哪 5 個英雄最受玩家喜愛
- 開發者可搜尋、瀏覽所有用戶的名片基本資訊
- 用戶的 `social_channels`（私人聯絡方式）在管理頁不顯示（保留隱私）
- 所有查詢仍需 developer role，RLS 雙重保護

## Impact

- **DB Migration**：`supabase/migrations/004_developer_profiles_policy.sql`（純加法）
- **Server Actions**：`src/app/actions/developer.ts` 新增 2 個 function
- **Server Component**：`src/app/developer/page.tsx` 新增 action 呼叫
- **Client Component**：`DeveloperConsoleClient.tsx` 新增 users tab + hero stats UI
- **破壞性**：零（現有 tab 行為不變）

## Related REFs

- REF-005: 開發者後台現有架構（功能空白清單）
- REF-006: Supabase RLS developer policy 模式
