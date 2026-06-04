# Proposal: one-card-per-game-constraint

## 動機

`profiles` 表目前以 `user_id` 作為 PRIMARY KEY，每個用戶全域只有一行，
所有遊戲共用同一張卡。`game` 欄位（Migration 013 新增，預設 'overwatch'）
只是一個普通欄位，沒有任何 unique 約束保護。

現有問題：
1. VAL/LoL 廣場接入真實後端後，`saveProfile` 的 upsert 若不改 conflict target，
   第二遊戲的儲存會直接覆蓋第一遊戲的卡（靜默資料損毀）。
2. `getMyProfile().single()` 若 user 有多行會直接炸（Supabase 回 PGRST116 錯誤）。

## 目標

- DB 層：`UNIQUE(user_id, game)` 明確約束，每人每遊戲只有一張卡
- 應用層：`saveProfile` upsert 使用 `onConflict: "user_id,game"`
- 應用層：`getMyProfile(game)` 加 game filter，防止 multi-row 後 `.single()` 爆炸
- PK：引入代理鍵 `id UUID`，`user_id` 降為業務鍵

## 範疇

- **In scope**：Migration 014（schema 變更）、profile.ts actions、profile/page.tsx 傳參
- **Out of scope**：VAL/LoL 真實後端接入、profile 頁面 UI 多遊戲切換、廣場分頁資料接入
- **零 UI 變更**：OW 廣場、OWCard、player detail 頁不受影響

## 成功條件

1. 新 migration 套用後，現有 4 rows 資料完整保留
2. `saveProfile` 儲存 OW 卡後，再次儲存是 update（非 insert 新行）
3. `getMyProfile("overwatch")` 返回 OW 卡資料
4. DB 拒絕同一 user 對同一遊戲 insert 第二行

## 參考

- REF-019: profiles schema 遷移路徑
- REF-020: Supabase upsert onConflict 複合鍵
- REF-021: PostgreSQL PK 遷移安全步驟
