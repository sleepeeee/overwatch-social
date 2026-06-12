## Why

> **事後補記（retroactive）**：此 change 的實作已透過 PR #3 與後續 commit 完成並 merge 至 main，本文件為回補 rsx 流程記錄，非事前提案。

Overwatch 名片的 `server` 欄位歷史上存了多種顯示字串（`亞洲伺服器`、`亞太 (APAC)`、`Asia Server`、`asia`…），同一伺服器 5+ 種寫法，導致廣場篩選/統計無法正確 GROUP BY，且未來多遊戲接入時值域語義混亂。同時部分玩家本體（user_profiles）缺漏、存在 user_id 已不在 auth.users 的孤兒卡。需要一次正規化 + DB 層長期上鎖。

## What Changes

- **migration 019（資料正規化）**：
  - 從仍存在於 auth.users 的名片補齊 `user_profiles`（取最新 display_name 為初始 nickname）
  - 將 OW `server` 舊顯示字串 UPDATE 為 canonical 代號（`asia`/`america`/`europe`），UPDATE 帶冪等 WHERE（值已 canonical 則跳過）
  - 孤兒卡（user_id 不在 auth.users）軟下架 `is_tag_visible = false`，**不永久刪除**
- **migration 020（DB 上鎖）**：加條件式 CHECK 約束 `profiles_overwatch_server_valid`（`game <> 'overwatch' OR server IN ('asia','america','europe')`）
- **應用層**：新增 `src/lib/gameCatalog.ts`（含 `normalizeOverwatchServer()`）、`src/lib/userProfileIdentity.ts`；profile / browse / developer / userProfile actions 與 OWCard / OverwatchSquare 改走正規化路徑

## Capabilities

### New Capabilities
- `profile-normalization`: 玩家本體與名片資料正規化能力——OW server canonical 值域（應用層 normalize + DB 條件式 CHECK 雙層防線）、user_profiles 補齊、孤兒卡軟下架。

## Impact

- 資料庫：profiles 新增 CHECK 約束 `profiles_overwatch_server_valid`；migration 019/020 已套用正式 DB
- 新增檔案：`src/lib/gameCatalog.ts`、`src/lib/userProfileIdentity.ts`、`supabase/migrations/019_*.sql`、`supabase/migrations/020_*.sql`
- 修改檔案：`src/app/actions/{browse,developer,profile,userProfile}.ts`、`src/app/auth/callback/route.ts`、`src/app/developer/{page,DeveloperConsoleClient}.tsx`、`src/app/profile/page.tsx`、`src/components/OWCard.tsx`、`src/components/square/OverwatchSquare.tsx`、`src/data/mockPlayers.ts`、`src/types/card.ts`
- ADR：ADR-23（雙層防線 + 條件式 CHECK + 孤兒卡軟下架）
