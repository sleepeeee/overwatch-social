---
id: ADR-06
title: "per-user localStorage key + AuthContext.userProfile 作為 UserProfile 事實來源"
status: Accepted
change: userprofile-auth-metadata-sync
date: 2026-06-03
references_to: [REF-013, F-006]
referenced_by: [F-006]
---

## 決策

`profile/page.tsx` 的 `UserProfile` 初始化改為：AuthContext 從 `user.user_metadata` 衍生 `userProfile` 並向下傳遞，`profile/page.tsx` 的 Auth seed useEffect 以 `user_profile_hub_${authUserProfile.id}` 為 per-user localStorage key，優先讀取 key 快取，無快取時 fallback 到 `authUserProfile`（user_metadata 衍生值）。

實作：

```typescript
// AuthContext.tsx
function deriveUserProfile(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    id: user.id,
    display_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "特工",
    avatar_url:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      "/images/avatars/avatar_female_elegant_square.png",
  };
}

// profile/page.tsx — Auth seed useEffect
useEffect(() => {
  if (!authUserProfile) return;
  const key = `user_profile_hub_${authUserProfile.id}`;
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.id === authUserProfile.id) {
        setUserProfile(parsed);
        return;
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
  setUserProfile(authUserProfile);
}, [authUserProfile]);
```

## 考量選項

| 選項 | 說明 | 拒絕原因 |
|---|---|---|
| A（選定）| per-user localStorage key + AuthContext 衍生 | 快取隔離；首次登入顯示 Google 名稱；AuthContext 統一管理 |
| B | 全域 localStorage key（原有做法）| 跨帳號污染；首次登入預設值錯誤（F-006 根因） |
| C | 完全不用 localStorage，每次從 user_metadata 讀取 | 無法保留用戶在 Hub 修改的 display_name（頭像更換等編輯結果會在 refresh 後消失）|
| D | 存到 profiles 表（Supabase）| 需要後端 schema 變更；本 change 範疇外；可作未來升級路徑 |

## 理由

1. **隔離性**：user ID 作為 key 後綴確保不同帳號快取互不干擾，完全消除 F-006 的跨用戶污染缺陷。
2. **首次登入體驗**：無快取時 fallback 到 `authUserProfile`（user_metadata 衍生），新用戶或清除 localStorage 後立即看到自己的 Google 名稱，而非 hardcode 預設值。
3. **單一事實來源**：`AuthContext.userProfile` 統一由 `deriveUserProfile()` 管理，不再在各 Component 各自維護 user 資訊讀取邏輯。
4. **最小變更**：不需要 DB schema 變更，Local-only 快取保留用戶在 Hub 的編輯修改（頭像更換等），為選項 D（Supabase 持久化）留下升級路徑。

## 後續影響

- 所有 Client-side user-scoped localStorage 快取應採用 `<prefix>_${userId}` 命名慣例（見 F-006 後續影響）。
- 未來若需跨裝置同步 `display_name`，可擴充 `profiles` 表加 `display_name` 欄位，`saveProfile` Server Action 同時更新，`AuthContext` 改讀 DB 值。
- `AuthContext.userProfile` 介面已設計為可擴充（目前包含 `id`, `display_name`, `avatar_url`, `bio?`），未來可加入 `role` 等欄位。
