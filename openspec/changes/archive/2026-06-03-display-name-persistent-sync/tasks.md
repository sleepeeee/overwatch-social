## 1. DB Migration

- [x] 1.1 建立 `supabase/migrations/012_add_display_name.sql`（ALTER TABLE profiles ADD COLUMN display_name TEXT）
- [x] 1.2 在 Supabase Dashboard SQL Editor 執行 migration（Success. No rows returned 確認）

## 2. Server Actions

- [x] 2.1 新增 `saveDisplayName(name: string)` Server Action（帶輸入驗證 + getUser 守門）
- [x] 2.2 新增 `getMyDisplayName()` Server Action（讀取 profiles.display_name）

## 3. Profile Page 修改

- [x] 3.1 `handleSaveHub()` 改為 async，雙寫 localStorage + saveDisplayName()
- [x] 3.2 加 error handling：saveDisplayName 失敗時 setErrorMsg 顯示錯誤
- [x] 3.3 user 載入 useEffect 補 getMyDisplayName()，若有值則覆蓋本地 state + localStorage

## 4. 驗收

- [x] 4.1 TypeScript 型別檢查（tsc --noEmit 零錯誤）
- [x] 4.2 Next.js build 通過（npm run build 零錯誤）
- [ ] 4.3 生產環境端對端驗證（用真實 Google 帳號：改暱稱 → 儲存 → 清 localStorage → 刷新 → 確認從 DB 恢復）
