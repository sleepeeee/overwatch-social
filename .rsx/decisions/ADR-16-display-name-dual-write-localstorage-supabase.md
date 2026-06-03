---
id: ADR-16
title: display_name 雙寫策略：localStorage 快取 + Supabase profiles 為 single source of truth
status: Accepted
date: 2026-06-03
references_to: [F-016, REF-013]
referenced_by: [F-016]
---

## 背景

`userprofile-auth-metadata-sync` change 完成後，`display_name` 只存 localStorage，跨裝置消失（詳見 F-016）。

需要決策一個持久化策略：

| 方案 | 優點 | 缺點 |
|---|---|---|
| A. 純 Supabase（移除 localStorage） | single source of truth，無快取問題 | 每次讀取需網路請求，初始渲染有延遲 |
| B. 純 localStorage | 即時讀取，無網路依賴 | 跨裝置消失，清快取消失（現狀缺陷） |
| C. 雙寫（localStorage 快取 + Supabase 主） | 即時讀取 + 跨裝置同步 | 需維護一致性，複雜度略高 |
| D. 寫入 user_metadata（Google OAuth） | 原生跨裝置，不需額外 DB 欄位 | 需 Supabase Admin API（service role），安全邊界複雜 |

## 決策

採用 **方案 C（雙寫策略）**：

1. **儲存**：`handleSaveHub()` 同時寫 localStorage + 呼叫 `saveDisplayName()` Server Action upsert 到 `profiles.display_name`
2. **讀取優先序**：DB 值 > localStorage > auth.user_metadata（Google 帳號名）
3. **同步時機**：user 登入後（user 變化 useEffect），呼叫 `getMyDisplayName()` 從 DB 拉取最新值，若有則覆蓋 localStorage cache

```
寫入：handleSaveHub()
  → localStorage.setItem(key, JSON.stringify(userProfile))  // 快取（即時）
  → saveDisplayName(display_name)                           // 主資料（跨裝置）

讀取（登入後）：
  → 1. localStorage[key]        // 快取命中 → 即時顯示
  → 2. getMyDisplayName() DB    // 覆蓋快取（最新值）
  → 3. auth.user_metadata       // fallback（DB 無值時）
```

## 理由

| 考量 | 選擇依據 |
|---|---|
| UX 即時性 | localStorage 讓 display_name 在頁面載入時立即顯示，無等待感 |
| 跨裝置同步 | Supabase 確保換裝置登入後仍能取得用戶設定的暱稱 |
| 最小侵入性 | 不需改動 AuthContext 的初始化路徑，只在 profile 頁加 DB 查詢 |
| 安全邊界 | Server Action 有 `getUser()` 驗證，不可偽造其他用戶的 display_name |

## 取捨 / 已知 Debt

- **開發模式限制**：dev mode 的 mock-user-id 在 Supabase 無對應 profiles 行，`saveDisplayName()` 呼叫會靜默失敗（Supabase 外鍵錯誤），localStorage 寫入仍成功。生產環境不受影響。
- **一致性窗口**：若 A 裝置修改 display_name 後，B 裝置在下次 user useEffect 觸發前仍顯示舊值（localStorage cache），這個不一致窗口通常只有幾秒。
- **AuthContext 未更新**：`deriveUserProfile()` 仍從 user_metadata 衍生，不從 DB 讀。若想讓 display_name 在所有元件即時反映 DB 值，需改動 AuthContext（目前超出範圍）。

## 影響範圍

- 新增：`supabase/migrations/012_add_display_name.sql`（profiles 表加 display_name TEXT 欄位）
- 新增：`saveDisplayName()`、`getMyDisplayName()` Server Actions（`src/app/actions/profile.ts`）
- 修改：`src/app/profile/page.tsx`（handleSaveHub 改 async 雙寫 + 失敗錯誤顯示 + user useEffect 補 DB 同步）

## 相關 ADR / Finding / REF

- F-016：display_name localStorage-only 缺陷根因（本 ADR 的動機）
- REF-013：Supabase Google OAuth user_metadata keys（指出 display_name 跨 session 需存 DB）
