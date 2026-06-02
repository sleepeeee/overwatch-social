# 歸檔報告：userprofile-auth-metadata-sync

**歸檔日期**：2026-06-03  
**Change**：`openspec/changes/archive/2026-06-02-userprofile-auth-metadata-sync/`

---

## 30 秒速覽

| 項目 | 內容 |
|---|---|
| **解決了什麼** | 登入後 profile 頁顯示硬編碼「愛喝奶茶」而非 Google 帳號名稱；清除 localStorage 後名稱歸零 |
| **核心修改** | AuthContext 加 `userProfile` state（從 user_metadata 衍生）；profile/page.tsx 改用 Auth seed + per-user localStorage key |
| **重要發現** | 舊 `user_profile_hub` key 無 user 隔離——跨帳號切換會拿到前一個用戶的暱稱（F-006） |
| **下一步** | 目前 `display_name` 修改仍存 localStorage（非持久化到 DB），未來 change 可補 Supabase `user_metadata` upsert |

---

## 完整版

### A. 問題背景

`profile/page.tsx` 的 `UserProfile`（`display_name`、`avatar_url`）從 `localStorage.getItem("user_profile_hub")` 初始化，導致：
1. Google OAuth 的 `user.user_metadata.full_name` 被完全忽略
2. 清除 localStorage 後名稱歸零（顯示「愛喝奶茶」hardcode）
3. 固定 key 無用戶隔離——帳號 A 手動改名後，帳號 B 登入看到 A 的暱稱

### B. 架構決策（ADR-06）

| 決策 | 選擇 |
|---|---|
| userProfile 位置 | 放進 AuthContext（不獨立 hook）：避免重複訂閱 auth 事件 |
| localStorage key | per-user：`user_profile_hub_${user.id}` |
| 優先序 | localStorage 有效快取 → 優先（用戶手動修改保留）；無快取 → Auth metadata seed |
| 防崩保護 | JSON.parse 含 try/catch + id 驗證 + 損壞快取自動清除 |

### C. §6.5/§6.7 記錄

- §6.5：Codex 連續 3 輪 5-6/10（Gemini 9/10）→ §6.3 Option C
- §6.7：Codex 6/10 (c) 程序性（tasks.md 未勾），Gemini 9/10 PASS → lean archiving rule 適用

### D. 型別架構清理

`UserProfile` 從 `types/card.ts`（放錯位置）移至 `types/auth.ts`（語意正確），`card.ts` 改為 re-export（向後相容，無 import 路徑變更）。

### E. 待辦

`display_name` 的儲存仍依賴 localStorage，跨設備不同步。下一個 change 可考慮將用戶修改後的 `display_name` upsert 到 Supabase Auth `user_metadata`，實現真正跨裝置持久化。
