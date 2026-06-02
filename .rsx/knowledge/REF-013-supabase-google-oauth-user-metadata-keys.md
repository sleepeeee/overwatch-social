---
id: REF-013
type: docs
title: Supabase Google OAuth user_metadata 欄位結構（full_name / avatar_url / picture）
url: https://supabase.com/docs/guides/auth/social-login/auth-google
status: active
version: "Supabase Auth 2026 + Google OAuth 2.0"
last_updated: 2026-06-03
official: true
references_to: [REF-003, REF-005]
referenced_by: [F-006, ADR-06]
---

## 摘要

Google OAuth 登入後，Supabase Auth 的 `user.user_metadata` 包含 Google 帳戶的基本資訊。在 `supabase.auth.getUser()` 或 `onAuthStateChange` 回傳的 `User` 物件中可取得這些欄位。

## user_metadata 欄位結構

```json
{
  "full_name": "使用者顯示名稱",          // Google 帳戶姓名
  "name": "使用者顯示名稱",               // 與 full_name 相同（備用）
  "email": "user@gmail.com",
  "email_verified": true,
  "avatar_url": "https://lh3.googleusercontent.com/...",  // Google 頭像 URL
  "picture": "https://lh3.googleusercontent.com/...",     // 與 avatar_url 相同（備用）
  "sub": "google-uid",
  "provider_id": "google-uid",
  "iss": "https://accounts.google.com"
}
```

**注意**：`full_name` 和 `name` 通常都存在，但取決於 Supabase 版本和 Google 設定。建議用 fallback 鏈：
```typescript
user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "特工"
```

同理，頭像：
```typescript
user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "/images/avatars/avatar_female_elegant_square.png"
```

## user_metadata vs app_metadata

| 欄位 | 來源 | 使用者可否修改 | 用途 |
|---|---|---|---|
| `user_metadata` | Google Identity Provider | ✅ 可（需 `updateUser()`）| 顯示名稱、頭像等個人資料 |
| `app_metadata` | Supabase Admin / service role | ❌ 不可 | 角色控制（developer role）|

## 開發環境注意

`AuthContext.tsx` 的 dev mock user 已包含 `user_metadata.full_name` 和 `user_metadata.avatar_url`，因此 `userProfile` 衍生邏輯在 dev 環境可正常運作。

## 對本專案的啟示

- `profile/page.tsx` 的 `userProfile.display_name` 應優先從 `user.user_metadata.full_name` 讀取，而非 localStorage
- Google 頭像 URL（`lh3.googleusercontent.com`）可能在 `html-to-image.toPng` 中觸發 CORS，需注意
- 用戶修改的 `display_name` 若要跨 session 保存，需存到 `profiles` 表或 `user_metadata`（本 change 範疇不包含）

## 引用場景

- `userprofile-auth-metadata-sync` change 的 AuthContext 修改依據
- profile/page.tsx 的初始化邏輯設計
