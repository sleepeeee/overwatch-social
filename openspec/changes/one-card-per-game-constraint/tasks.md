# Tasks: one-card-per-game-constraint

## Task 1 — 建立 Migration 014

- [ ] 在 `supabase/migrations/` 新建 `014_one_card_per_game.sql`
- [ ] 內容依 spec.md File 1（加 id PK、UNIQUE constraint、user_id index）
- [ ] 用 Supabase MCP `apply_migration` 執行（不開瀏覽器）
- [ ] 驗收：`list_tables` 確認 `profiles` 有 `id` 欄位；`execute_sql` 確認 constraint 存在

## Task 2 — 修改 profile.ts Server Actions

- [ ] `getMyProfile`：加 `game = 'overwatch'` 參數，query 加 `.eq("game", game)`
- [ ] `saveProfile`：upsert payload 加 `game: card.game ?? 'overwatch'`，加 `onConflict: "user_id,game"`
- [ ] `saveDisplayName`：upsert payload 加 `game: 'overwatch'`，加 `onConflict: "user_id,game"`

## Task 3 — 修改 profile/page.tsx 呼叫點

- [ ] `getMyProfile()` 改為 `getMyProfile("overwatch")`（約 L178）

## Task 4 — 本地驗證

- [ ] `npm run build` 無 TypeScript 錯誤
- [ ] 開發環境登入，儲存名片，確認 profiles 行數不增加
- [ ] 檢查 DB：`SELECT COUNT(*) FROM profiles WHERE user_id = '<your-uid>'` = 1

## Task 5 — 提交推送

- [ ] commit + push → Vercel auto-deploy
- [ ] 正式環境驗證：`/profile` 儲存名片正常
