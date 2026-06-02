---
id: userprofile-auth-metadata-sync
type: design
---

# Design: userprofile-auth-metadata-sync

## Context

OW Social 使用 Google OAuth（PKCE）登入，Supabase Auth 在 `user.user_metadata` 中自動填充 `full_name` 和 `avatar_url`。`AuthContext.tsx` 已是全域 auth 狀態單一來源（ADR-03），但目前只提供 `{ user, authLoading }`，未提供 `UserProfile`（顯示名稱/頭像）。

`profile/page.tsx` 的 `userProfile` state 以 localStorage 作為初始化來源，導致 cache 清除後歸零，且無法反映 Google 帳戶名稱。

## Goals

- G1：`display_name` 和 `avatar_url` 在 Google 登入後自動填充（無需手動設定）
- G2：清除 localStorage 後 `display_name` 仍存在（來自 Auth metadata）
- G3：`UserProfile` 型別從 `types/card.ts` 移至 `types/auth.ts`（型別定位正確）
- G4：`profile/page.tsx` 透過 `useAuth().userProfile` 消費（首次種子）；其他頁面未來可按需加入

## Non-Goals

- NG1：不將 `display_name` 或 `bio` 存入 Supabase `profiles` 表（下一個 change 才做）
- NG2：不改變 `display_name` 的儲存行為（localStorage.setItem 保留，只改讀取來源）
- NG3：不修改 `OWPlayerCard.battle_tag` — 兩者是不同概念（Google 名稱 ≠ BattleTag）

## 架構決策

### D1：userProfile 放進 AuthContext 還是獨立 hook？

**選項 A（採用）**：加入 `AuthContext`，擴充 `AuthContextType`

```typescript
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  userProfile: UserProfile | null;  // 新增
}
```

理由：
- `user.user_metadata` 從 `getUser()` / `onAuthStateChange` 取得（同一來源）
- 不需要再訂閱一次 auth 事件（避免重複訂閱）
- 下游已有 `useAuth()`，加 `userProfile` 不改 hook 介面

**選項 B（拒絕）**：獨立 `useUserProfile()` hook

- 問題：需再次訂閱 auth 事件，產生重複訂閱；或依賴 context，繞一圈等同 A

### D2：userProfile 衍生邏輯

```typescript
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
```

**兩條路徑均需更新**（`getUser().then` + `onAuthStateChange`），與 `setUser` 同步執行。

### D3：profile/page.tsx 初始化邏輯與優先序

**優先序**（明確定義，避免歧義）：
1. **localStorage 存在** → 使用 localStorage（用戶手動修改優先）
2. **localStorage 不存在** → 使用 `authUserProfile`（Auth metadata 作為 seed）

**修改後**（per-user localStorage key，消除多帳號污染）：
```typescript
const { userProfile: authUserProfile } = useAuth();

useEffect(() => {
  if (!authUserProfile) return;
  const key = `user_profile_hub_${authUserProfile.id}`;  // per-user key
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // id 檢查：確保快取是此用戶的（防 stale key 污染）
      if (parsed?.id === authUserProfile.id) {
        setUserProfile(parsed);   // 手動修改優先
        return;
      }
    } catch {
      localStorage.removeItem(key);  // 損壞快取清除
    }
  }
  setUserProfile(authUserProfile);  // 無有效快取 → Auth metadata seed
}, [authUserProfile]);  // 依賴整個 object：換用戶 + metadata 更新均觸發
```

**理由**：
- per-user key（`user_profile_hub_${userId}`）：不同帳號不互相污染（M1 修正）
- localStorage 優先：用戶手動改名後重整仍保留（手動修改 ≠ Auth metadata 覆蓋）
- Auth metadata 作為「首次種子」：清除 localStorage 後自動恢復 Google 名稱
- 現有 `localStorage.setItem("user_profile_hub", ...)` 的 key 同步改為 per-user key

### D4：UserProfile 型別遷移

```typescript
// src/types/auth.ts（新建）
export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
}

// src/types/card.ts（修改）
export type { UserProfile } from "@/types/auth";
// 移除原本的 UserProfile interface 定義
```

只有兩個 import 位置（`profile/page.tsx`、`mockPlayers.ts`），不需改動 import 路徑。

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解 |
|---|---|---|
| `user_metadata` key 不穩定（`full_name` vs `name`）| Low | fallback 鏈：`full_name ?? name ?? email.split("@")[0]` |
| `authLoading` 期間 `userProfile` 為 null | Low | `useEffect([authUserProfile?.id])` 在 user 存在後才更新 state |
| `localStorage` 衝突（user 手動改名後 Auth 同步覆蓋）| Low | 本 change NG2：改名持久化是下一個 change 的工作 |
| Google 頭像 URL CORS（html-to-image） | Info | 只影響未來導出圖片，本 change 不觸發 |

## Rationale 表

| 選擇 | 依據 |
|---|---|
| userProfile in AuthContext | ADR-03（AuthContext 是唯一 auth 狀態源）|
| `user_metadata.full_name ?? name ?? email prefix` fallback 鏈 | REF-013（user_metadata key 不穩定性）|
| 不加 DB 表 | NG1：本 change 只解決初始化問題，持久化是下一個 change |
| re-export pattern for UserProfile | 向後相容：不需改動所有 import 位置 |
