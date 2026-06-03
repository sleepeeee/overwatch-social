---
id: F-016
type: finding
title: display_name 僅存 localStorage：換裝置或清快取後消失，跨裝置 UX 斷裂
status: confirmed
confidence: high
references_to: [REF-013, ADR-16]
referenced_by: [ADR-16]
---

## 結論 / 數據

`userprofile-auth-metadata-sync` change 完成後，`display_name` 以 per-user localStorage key（`user_profile_hub_${userId}`）儲存在瀏覽器本地，Supabase `profiles` 表完全未紀錄此欄位。

根本原因：
- `handleSaveHub()` 在 `src/app/profile/page.tsx` 只呼叫 `localStorage.setItem()`，未呼叫任何 Server Action
- `profiles` 表（`001_profiles.sql`）無 `display_name` 欄位，`saveProfile()` 的 upsert 欄位清單也未包含
- `AuthContext.tsx` 的 `deriveUserProfile()` 只讀 `user.user_metadata.full_name`（Google OAuth metadata），不讀 DB

**影響場景**：
- 用戶在 A 瀏覽器設定 display_name → 換 B 瀏覽器登入同帳號 → display_name 回到 Google 帳號名（user_metadata）
- 手動清除 localStorage → display_name 消失
- 部分瀏覽器定期清除 localStorage → display_name 靜默重置

**修正**（commit 19ddd60 / d92b443）：
1. Migration `012_add_display_name.sql`：`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT`
2. 新增 `saveDisplayName(name: string)` Server Action → upsert 到 Supabase profiles
3. 新增 `getMyDisplayName()` Server Action → 從 DB 讀取
4. `handleSaveHub()` 改為 async，雙寫 localStorage + Supabase，失敗時顯示錯誤訊息
5. user 載入 useEffect 增加 `getMyDisplayName()` → 若 DB 有值則覆蓋 localStorage/auth 衍生值

## 與既有 REF 一致或矛盾

REF-013（Supabase Google OAuth user_metadata keys）指出：「用戶修改的 display_name 若要跨 session 保存，需存到 profiles 表或 user_metadata（本 change 範疇不包含）」。本 Finding 正是實作了 REF-013 預留的待做項目。

## 對後續影響

1. **雙寫策略**（見 ADR-16）：localStorage 作為快取（即時讀取），Supabase 為 single source of truth（跨裝置）
2. **開發模式限制**：dev mode 使用 mock-user-id（非真實 auth.users），`saveDisplayName()` 在本機 dev 環境會收到 Supabase 外鍵錯誤，這是預期行為，不影響生產環境
3. **AuthContext 未改動**：目前 AuthContext 的 `deriveUserProfile()` 仍從 user_metadata 衍生，DB 同步由 profile 頁自行 fetch，若未來需要全域即時 display_name，可考慮在 AuthContext mount 時同步查一次 profiles
