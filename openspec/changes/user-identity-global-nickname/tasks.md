---
change: user-identity-global-nickname
artifact: tasks
---

# Tasks: user-identity-global-nickname

## Task 1 — 環境確認 + 現有 migration 清點
- [x] 確認現有 migrations（最新為 015_restore_social_channels_view.sql）
- [x] 確認 user_profiles 表尚未存在
- [x] 確認 public_profiles view 現有欄位（含 social_channels）
- [x] 確認 next 可用 migration 號碼 = 016

驗收：✅ 完成 — migration 從 016 開始

---

## Task 2 — Migration 016：user_profiles 表 + 遷移
- [x] 建立 `supabase/migrations/016_user_profiles.sql`
  - user_profiles (user_id PK, nickname TEXT, created_at, updated_at)
  - RLS：public read；本人 INSERT/UPDATE
  - 遷移 INSERT（DISTINCT ON + ORDER BY updated_at DESC）
  - ON CONFLICT DO NOTHING（冪等）
- [ ] ⚠️ 待手動：在 Supabase Dashboard SQL Editor 執行 migration 016

驗收：待用戶執行 SQL 後確認

---

## Task 3 — Migration 017：public_profiles view 更新
- [x] 建立 `supabase/migrations/017_public_profiles_with_nickname.sql`
  - DROP + CREATE VIEW public_profiles
  - LEFT JOIN user_profiles up ON up.user_id = p.user_id
  - SELECT 段加 up.nickname
- [ ] ⚠️ 待手動：在 Supabase Dashboard SQL Editor 執行 migration 017（在 016 之後）

驗收：待執行後確認

---

## Task 4 — Server Actions 新增
- [x] 建立 `src/app/actions/userProfile.ts`
  - getMyUserProfile()、saveNickname()、getAdminUserList()、getAdminUserCards()
  - UserProfileRow、AdminUserListItem、AdminUserCard 介面
- [x] TypeScript build 無型別錯誤

驗收：✅ TypeScript 無錯誤，build 13/13 通過

---

## Task 5 — Profile Hub UI 更新
- [x] `src/app/profile/page.tsx`
  - import 改為 getMyUserProfile + saveNickname
  - user useEffect 改呼叫 getMyUserProfile() 取 nickname
  - handleSaveHub 改呼叫 saveNickname()
  - label 改為「暱稱（全站顯示名稱）」+ ID 顯示

驗收：✅ Build 通過

---

## Task 6 — Dev Console 第一層重設計
- [x] 新建 `src/app/developer/components/UserListSection.tsx`
  - 呼叫 getAdminUserList()、500ms debounce 搜尋
  - 每行：暱稱 + user_id（完整，可 select-all）+ game badge + 展開按鈕
- [x] DeveloperConsoleClient.tsx 引入 UserListSection
  - 移除 RLS gate、移除舊 table、引入新元件

驗收：✅ Build 通過

---

## Task 7 — Dev Console 第二層展開詳情
- [x] 新建 `src/app/developer/components/UserCardDetail.tsx`
  - 展開時呼叫 getAdminUserCards(userId)（lazy load）
  - 顯示：battle_tag、server、heroes、tags、message、mic、updated_at
  - 無卡：「此用戶尚未建立任何角色卡」

驗收：✅ Build 通過

---

## Task 8 — 驗收整合記錄
- [x] TypeScript 無型別錯誤（tsc --noEmit 無輸出）
- [x] Next.js build 13/13 通過
- [x] [DOC] CLAUDE.md 資料庫結構段已加入 user_profiles 表說明 + migrations 更新
- [ ] ⚠️ 待 Supabase migrations 016+017 執行後，需在瀏覽器驗收：
  - Profile Hub 儲存 nickname → DB user_profiles row 存在
  - Dev console users tab 顯示暱稱 + ID + game badge
  - 搜尋暱稱過濾正確
  - 展開後角色卡詳情正確顯示

驗收：Build 通過；待手動 SQL 執行後做瀏覽器整合驗收
