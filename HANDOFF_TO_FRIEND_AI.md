# 交接文件：玩家資料與遊戲名片正規化

## 任務狀態

請接手部署與驗證這個分支：

```text
feature/normalize-user-profile-and-game-cards
```

朋友主倉庫分支已推送：

```text
https://github.com/sleepeeee/overwatch-social/tree/feature/normalize-user-profile-and-game-cards
```

PR 建立連結：

```text
https://github.com/sleepeeee/overwatch-social/pull/new/feature/normalize-user-profile-and-game-cards
```

Commit：

```text
f2aca65 修正玩家資料與遊戲名片正規化
```

## 這次改了什麼

本次任務目標是整理 Supabase 裡「玩家帳號資料」與「遊戲名片資料」的分工。

資料模型定位如下：

```text
auth.users
  = Supabase 真正登入帳號名冊

user_profiles
  = 網站玩家本體資料

profiles
  = 目前保留原表名，但語意上是遊戲名片資料表

public_profiles
  = 廣場公開展示用 view
```

這次不是刪資料重做，而是先把現有架構整理乾淨。

## 主要行為變更

### 1. 登入後自動建立 user_profiles

登入 callback 成功後會呼叫 server helper，確保目前登入玩家有一筆 `user_profiles`。

若已存在 `user_profiles`，不會用 Google metadata 覆蓋原本 nickname。

相關檔案：

```text
src/app/auth/callback/route.ts
src/lib/userProfileIdentity.ts
src/app/actions/userProfile.ts
```

### 2. 儲存 OW 名片前也會補 user_profiles

`saveProfile()` 會先確保登入玩家存在於 `user_profiles`，再 upsert 名片。

相關檔案：

```text
src/app/actions/profile.ts
```

### 3. OW server 改成 canonical 值

資料庫只存：

```text
asia
america
europe
```

UI 顯示時才轉成：

```text
亞洲伺服器
美洲伺服器
歐洲伺服器
```

相關檔案：

```text
src/lib/gameCatalog.ts
src/app/actions/browse.ts
src/components/square/OverwatchSquare.tsx
src/components/OWCard.tsx
src/app/profile/page.tsx
src/data/mockPlayers.ts
```

### 4. 後台統計分開

開發者後台現在會分開顯示：

```text
玩家帳號資料 = user_profiles
遊戲名片資料 = profiles
```

這是為了避免再把「玩家人數」和「名片張數」混在一起看。

相關檔案：

```text
src/app/developer/page.tsx
src/app/developer/DeveloperConsoleClient.tsx
src/app/actions/developer.ts
```

## 必須套用的 Supabase migration

請套用：

```text
supabase/migrations/019_normalize_user_profiles_and_card_servers.sql
```

這份 migration 做三件事：

1. 從仍存在於 `auth.users` 的名片持有人補齊 `user_profiles`
2. 將舊 server 字串轉成 canonical 值
3. 找不到 `auth.users` 的孤兒卡先下架，不永久刪除

孤兒卡處理方式：

```sql
UPDATE profiles
SET is_tag_visible = false
WHERE profiles.user_id 不存在於 auth.users
```

注意：這不是 DELETE，不會永久刪除資料。

## 部署前建議檢查

請先確認 migration 執行環境是正式 Supabase 專案，不要套錯專案。

套 migration 前可以先查：

```sql
select count(*) from user_profiles;
select count(*) from profiles;
select server, count(*) from profiles group by server order by server;
```

套 migration 後再查：

```sql
select count(*) from user_profiles;
select count(*) from profiles;
select server, count(*) from profiles group by server order by server;
select user_id, battle_tag, is_tag_visible
from profiles
where user_id not in (select id from auth.users);
```

預期結果：

```text
profiles 不會被刪除
server 應逐步統一為 asia / america / europe
找不到 auth.users 的卡片會 is_tag_visible = false
```

## 部署後請驗證

### 驗證 1：新玩家登入

操作：

```text
用一個新的 Google 帳號登入網站
```

預期：

```text
auth.users 有該帳號
user_profiles 也自動新增該 user_id
```

### 驗證 2：儲存 OW 名片

操作：

```text
到 /profile
建立或修改 OW 名片
選亞洲伺服器
儲存
```

預期：

```text
profiles.game = overwatch
profiles.server = asia
同一個 user_id + overwatch 只會有一張卡
```

### 驗證 3：廣場篩選

操作：

```text
到 /browse
切 Overwatch
篩選亞洲伺服器
```

預期：

```text
查詢使用 server = asia
畫面顯示亞洲伺服器
玩家卡仍正常出現
```

### 驗證 4：開發者後台

操作：

```text
到 /developer
查看 Overview
```

預期：

```text
玩家帳號資料顯示 user_profiles 數量
遊戲名片資料顯示 profiles 數量
兩者可以不同，這是正常狀態
```

## 已在本機跑過的檢查

已通過：

```text
npx tsc --noEmit
npm run build
```

`npm run lint` 未通過，但錯誤是專案既有 lint 問題，主要在：

```text
src/app/developer/capture-hud/CaptureHudAdjusterClient.tsx
src/components/LoginModal.tsx
src/components/morning-sketch/*
src/app/profile/page.tsx 既有 no-explicit-any / no-unescaped-entities
src/components/OWCard.tsx 既有 no-unescaped-entities
```

這些不是本次資料模型改動造成。

## 注意事項

請不要直接把 `profiles` 刪掉或改名成 `player_cards`。

目前策略是：

```text
短期：
profiles 保留，但定義成遊戲名片資料表

後續：
再規劃 player_cards view 或正式 rename
```

也請不要直接刪除孤兒卡。這次 migration 只會先下架：

```text
is_tag_visible = false
```

如果確認那些 user_id 真的不再需要，再另外開一個資料清理 change 處理永久刪除。

