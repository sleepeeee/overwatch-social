> 事後補記：以下任務於 PR #3 + migration 020 已全部完成，勾選反映既成事實。

## 1. 資料正規化（migration 019）

- [x] 1.1 補齊 user_profiles：從仍存在 auth.users 的名片 INSERT（取最新 display_name 為 nickname），`ON CONFLICT DO NOTHING`
- [x] 1.2 OW server 存量清洗：UPDATE 舊顯示字串 → canonical（`asia`/`america`/`europe`），帶冪等 WHERE
- [x] 1.3 孤兒卡軟下架：user_id 不在 auth.users 者設 `is_tag_visible = false`（不永久刪除）

## 2. DB 上鎖（migration 020）

- [x] 2.1 加條件式 CHECK 約束 `profiles_overwatch_server_valid`（只限 overwatch，為多遊戲預留）

## 3. 應用層正規化

- [x] 3.1 新增 `src/lib/gameCatalog.ts`（含 `normalizeOverwatchServer()`）
- [x] 3.2 新增 `src/lib/userProfileIdentity.ts`
- [x] 3.3 profile / browse / developer / userProfile actions 改走正規化
- [x] 3.4 OWCard / OverwatchSquare / mockPlayers / types/card 配合更新

## 4. 驗證

- [x] 4.1 `npm run build` 通過（TypeScript 0 errors，16/16 static pages）
- [x] 4.2 正式 DB 複查：5/5 overwatch 名片 server 全 canonical、CHECK 約束生效

## 5. rsx 記錄回補

- [x] 5.1 建立 ADR-23（雙層防線 + 條件式 CHECK + 孤兒卡軟下架）
- [x] 5.2 建立本 change archive
- [x] 5.3 更新 `.rsx/notes/latest.md`（Zone A 覆寫 + Zone B 追加）
