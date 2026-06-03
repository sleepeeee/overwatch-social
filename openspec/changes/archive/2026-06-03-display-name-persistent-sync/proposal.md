## Why

`display_name` 只存 localStorage（key `user_profile_hub_${userId}`），換裝置或清快取後消失。Supabase `profiles` 表無此欄位，`saveProfile()` 也未處理暱稱欄位，導致用戶設定的暱稱無法跨裝置持久化。

## What Changes

- 新增 Supabase migration `012_add_display_name.sql`：`profiles` 表加 `display_name TEXT`
- 新增 Server Actions：`saveDisplayName(name)` / `getMyDisplayName()`
- `profile/page.tsx` 的 `handleSaveHub()` 改為 async 雙寫（localStorage + Supabase），加錯誤處理
- user 載入 useEffect 加 `getMyDisplayName()` 從 DB 同步最新值

## Capabilities

### New Capabilities

- `display-name-persistence`：用戶在 /profile 設定的暱稱持久化至 Supabase，跨裝置登入可恢復

### Modified Capabilities

- `profile-hub-save`：handleSaveHub 從純 localStorage 改為 localStorage + Supabase 雙寫

## Impact

- **新增**：`supabase/migrations/012_add_display_name.sql`
- **修改**：`src/app/actions/profile.ts`（新增兩個 Server Action）
- **修改**：`src/app/profile/page.tsx`（handleSaveHub async + user useEffect 補 DB sync）
- **Supabase**：profiles 表新增 `display_name TEXT` 欄位
