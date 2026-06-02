---
id: userprofile-auth-metadata-sync
type: tasks
---

# Tasks: userprofile-auth-metadata-sync

## Task 1 — 建立 `src/types/auth.ts`

- [ ] 建立 `src/types/auth.ts`，內容：
```typescript
export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
}
```
- [ ] 驗收：`ls src/types/auth.ts` 存在

## Task 2 — 修改 `src/types/card.ts`（移除定義、加 re-export）

- [ ] 移除 `types/card.ts` 內的 `UserProfile` interface 定義（約 6 行）
- [ ] 在 `types/card.ts` 新增：`export type { UserProfile } from "@/types/auth";`
- [ ] 驗收：`rg "interface UserProfile" src/types/card.ts` 無命中
- [ ] 驗收：`rg "UserProfile" src/types/card.ts` 有 re-export 一行

## Task 3 — 修改 `src/context/AuthContext.tsx`（加 userProfile）

- [ ] import `UserProfile` from `@/types/auth`
- [ ] 在 `AuthContextType` 加入 `userProfile: UserProfile | null`
- [ ] 建立 `deriveUserProfile(user)` helper（inline 或獨立 function）：
  ```typescript
  function deriveUserProfile(user: User | null): UserProfile | null {
    if (!user) return null;
    return {
      id: user.id,
      display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "特工",
      avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "/images/avatars/avatar_female_elegant_square.png",
    };
  }
  ```
- [ ] 加入 `const [userProfile, setUserProfile] = useState<UserProfile | null>(null)`
- [ ] 在 `getUser().then` 路徑加：`setUserProfile(deriveUserProfile(data.user ?? null))`
- [ ] 在 `onAuthStateChange` 路徑加：`setUserProfile(deriveUserProfile(session?.user ?? null))`
- [ ] 在 `AuthContext.Provider value` 加入 `userProfile`
- [ ] 驗收：`npx tsc --noEmit` 無 error

## Task 4 — 修改 `src/app/profile/page.tsx`（改源，per-user localStorage）

- [ ] `const { user, authLoading, userProfile: authUserProfile } = useAuth()`
- [ ] 定義 per-user localStorage key：
  ```typescript
  const profileKey = authUserProfile ? `user_profile_hub_${authUserProfile.id}` : null;
  ```
- [ ] 找到 `useEffect` 中讀取 localStorage 的邏輯（原 `localStorage.getItem("user_profile_hub")`）
- [ ] 替換為（per-user key + localStorage 優先）：
  ```typescript
  useEffect(() => {
    if (!authUserProfile) return;
    const key = `user_profile_hub_${authUserProfile.id}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.id === authUserProfile.id) {
          setUserProfile(parsed);  // 此用戶的有效快取 → 手動修改優先
          return;
        }
      } catch {
        localStorage.removeItem(key);  // 損壞快取清除
      }
    }
    setUserProfile(authUserProfile);  // 無有效快取 → Auth seed
  }, [authUserProfile]);
  ```
- [ ] 將現有 `localStorage.setItem("user_profile_hub", ...)` 的 key 改為 per-user key：`user_profile_hub_${user?.id}`
- [ ] 驗收：`rg '"user_profile_hub"' src/app/profile/page.tsx` 無舊 hardcoded key（全改為 per-user key）
- [ ] 驗收：`rg "user_profile_hub_" src/app/profile/page.tsx` 有命中（per-user key 存在）

## Task 5 — TypeScript + 整合驗收

- [ ] `npx tsc --noEmit` 無 error
- [ ] 登入後訪問 `/profile`，確認暱稱欄位顯示 Google 帳戶名稱（非「愛喝奶茶」）
- [ ] 登出後訪問 `/profile`，確認 LoginModal 正常出現
- [ ] 確認 `mockPlayers.ts` 的 `import { UserProfile }` 仍正常編譯（re-export 路徑）
