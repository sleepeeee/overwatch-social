---
change: user-identity-global-nickname
status: proposed
created: 2026-06-04
affects_consumers:
  - CLAUDE.md
related_refs:
  - REF-002
  - REF-004
  - REF-013
  - REF-017
  - REF-019
  - REF-020
  - REF-022
  - REF-023
related_claims: []
---

# Proposal: user-identity-global-nickname

## Why（動機）

現有架構中，用戶的「身份」是碎片化的：

- `profiles` 表以 `(user_id, game)` 為唯一單元——一個人有幾張卡，就有幾個身份碎片
- `display_name` 存於 per-game row，跨遊戲無共用的用戶識別名稱
- Dev console 無法以「人的視角」查看用戶（只能看 profiles row，看不出「這個人有幾張卡」）
- 未來 LoL/Valorant 卡上線後，用戶若要在三個遊戲都有名稱，需設定三次

**Why now**：Migration 014（2026-06-04）剛完成 `UNIQUE(user_id, game)` 重構，multi-game card 基礎穩定，現在是加 user-level 身份層的最佳窗口。LoL/Valorant 廣場尚在佔位，趁上線前設計好可避免之後 migration 成本加倍。

**先例缺口**：
- ADR-16（display_name dual-write）做了：確保 display_name 跨裝置同步
- F-016 做了：發現並修復 display_name 只存本地的缺陷
- 本 change 的新增空白：user-level 身份層（`user_profiles` 表）—— 上述兩個 prior work 皆未觸及「跨遊戲的人的識別單元」

## What Changes

1. 新建 `user_profiles` 資料表（`user_id` PK，`nickname` TEXT nullable）
2. 現有用戶遷移：以最後更新的角色卡 `display_name` 作為初始 nickname
3. Profile Hub 加入 nickname 編輯欄位（選填，可隨時改）
4. Dev console 第一層重設計：`nickname + user_id` + 擁有的遊戲卡清單
5. Dev console 第二層：點展開後顯示各遊戲角色卡詳細資訊
6. Dev console / browse 可用 nickname ilike 搜尋

## Capabilities（完成後能做到的）

- 每個 Google 帳號有一個平台層的唯一身份（user_id UUID = 永久 ID）
- nickname 可選填、可隨時修改（不強制唯一）
- 未設 nickname 時，所有顯示位置 fallback 到 user_id（或縮短版）
- 開發者後台可快速瀏覽「人 → 遊戲卡清單 → 卡詳情」三層視角
- 可用 nickname 搜尋用戶（dev console）

## Impact

- **DB**：新增 migration 015（`user_profiles` 表 + RLS + 遷移 INSERT）
- **Server Actions**：新增 `getMyUserProfile`、`saveNickname`、`getAdminUserList`、`searchUsersByNickname`
- **UI**：Profile Hub 加 nickname 欄位；Dev console 整體重構
- **View**：`public_profiles` view 加 JOIN `user_profiles` 含 `nickname` 欄位
- **不影響**：廣場名片卡顯示邏輯（暫不改 browse 頁，第二期再考慮）
