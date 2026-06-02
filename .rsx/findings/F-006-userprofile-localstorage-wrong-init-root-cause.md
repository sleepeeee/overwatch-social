---
id: F-006
title: "UserProfile localStorage 初始化缺陷：跨用戶共用 key 造成 display_name 錯誤顯示"
status: confirmed
change: userprofile-auth-metadata-sync
date: 2026-06-03
references_to: [REF-013, ADR-06]
referenced_by: [ADR-06]
supporting_refs: [REF-013]
---

## 結論 / 數據

- **根因**：`profile/page.tsx` 原始碼使用固定 key `user_profile_hub`（不含 user ID）儲存 UserProfile 到 localStorage，導致同裝置多帳號切換時，A 用戶的 `display_name` 被 B 用戶的快取覆蓋（反向亦然）。此外，初始化來源為 localStorage 而非 `user.user_metadata`，首次登入（無快取）時 `display_name` 顯示預設值 "愛喝奶茶" 而非 Google 帳號名稱。
- **量化影響**：
  - 跨用戶污染：同裝置 ≥ 2 個 Google 帳號切換登入時，`display_name` 以 100% 機率顯示錯誤用戶名稱。
  - 首次登入體驗：沒有快取的新用戶（或清除 localStorage 後），看到的是 hardcode 預設值而非自己的 Google 名稱。
- **修復路徑**：
  1. 在 `AuthContext.tsx` 新增 `deriveUserProfile(user)` 函式，從 `user.user_metadata` 衍生（fallback 鏈：`full_name` → `name` → email 前綴 → "特工"）。
  2. `AuthContext` 暴露 `userProfile: UserProfile | null` state，由 `getUser()` + `onAuthStateChange` 雙軌同步更新。
  3. `profile/page.tsx` 以 `authUserProfile.id` 為 localStorage key 後綴（`user_profile_hub_${authUserProfile.id}`），確保 per-user 快取隔離。
  4. Auth seed useEffect 優先讀 per-user localStorage 快取，無快取時 fallback 到 `authUserProfile`（來自 user_metadata）。
- **驗收**：`npx tsc --noEmit` 無 error；commit 33af736 完成。

## 與既有 REF 一致或矛盾

- 與 REF-013（user_metadata 欄位結構）完全一致：`full_name`/`name`/`avatar_url`/`picture` fallback 鏈設計正是 REF-013 記錄的推薦實踐。
- 無矛盾既有知識點。

## 對後續影響

- per-user localStorage key 模式（`<key_prefix>_${userId}`）應作為所有 Client-side user-scoped 快取的標準寫法，避免跨帳號污染。
- `AuthContext.userProfile` 作為單一事實來源，所有需要顯示用戶名稱/頭像的 Client Component 應優先消費 `useAuth().userProfile`，而非各自 fallback 到 localStorage 或 hardcode。
- 未來若需要將 `display_name` 持久化（跨 session + 跨裝置），需存到 `profiles` 表或 `user_metadata`（本 change 範疇不包含）。
