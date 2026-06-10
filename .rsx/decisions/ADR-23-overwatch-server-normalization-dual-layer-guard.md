---
id: ADR-23
title: OW server 正規化採「應用層 normalize + DB 條件式 CHECK」雙層防線
change: normalize-profiles-and-server-canonical
status: Accepted
created: 2026-06-11
references_to: [ADR-21, ADR-20, REF-019]
referenced_by: []
---

## 背景

Overwatch 名片的 `server` 欄位歷史上存了多種顯示字串（`亞洲伺服器`、`亞太 (APAC)`、`Asia Server`、`asia`…），
同一個伺服器有 5+ 種寫法。這導致：

1. 廣場篩選、統計無法正確 GROUP BY
2. 未來多遊戲（Valorant / LoL）接入時，server 值域語義混亂
3. 應用層雖有 `normalizeOverwatchServer()`，但 DB 無防線，任何繞過應用層的寫入（直接 SQL、未來其他 client）都可能再次污染

需要決定：正規化只做一次資料清洗就好，還是要在 DB 層長期上鎖？

## 決策

採**雙層防線**：

1. **應用層**：`src/lib/gameCatalog.ts` 的 `normalizeOverwatchServer()` 在寫入前把任何顯示字串轉為 canonical 代號（`asia` / `america` / `europe`）。
2. **DB 層（migration 020）**：加 **條件式** CHECK 約束 `profiles_overwatch_server_valid`：
   ```sql
   CHECK (game <> 'overwatch' OR server IN ('asia', 'america', 'europe'))
   ```
   從源頭擋掉非 canonical 值，不再只依賴應用層把關。

前置清洗由 **migration 019** 完成（把存量資料的舊字串 UPDATE 成 canonical），確保 020 上鎖時不會因存量髒值而失敗。

附帶決策（migration 019 第 3 步）：**孤兒卡（user_id 已不存在於 auth.users）採軟下架**（`is_tag_visible = false`），**不永久刪除**——呼應全域「安全刪除走可還原路徑」原則，保留資料以備帳號復原。

## 方案評估

| 方案 | 優點 | 缺點 |
|---|---|---|
| 只做一次性資料清洗（無 CHECK）| 簡單 | 無長期防線，繞過應用層即再次污染 |
| **雙層（應用 normalize + 條件式 CHECK）** ✅ | 源頭上鎖、應用層仍提供友善轉換 | 須先清洗存量資料才能加約束 |
| 無條件 CHECK（`server IN (...)` 不分遊戲）| 寫法最短 | 會誤擋未來 Valorant/LoL 的不同值域 → 多遊戲時必炸 |

選**條件式 CHECK**（`game <> 'overwatch' OR ...`）的關鍵：OW 與其他遊戲的 server 值域不同（Valorant 有 `ap`/`na`/`eu`/`kr`…），條件式約束讓 OW 上鎖的同時，為多遊戲值域差異預留空間——這與 [[ADR-21]] 的「一人一遊戲一卡」、[[ADR-20]] 的 game 欄位早期準備一脈相承。

## 影響

- DB：profiles 新增 CHECK 約束 `profiles_overwatch_server_valid`（已於正式 DB 生效，5/5 筆 overwatch 名片 server 全為 canonical）
- 應用層：新增 `src/lib/gameCatalog.ts`、`src/lib/userProfileIdentity.ts`；profile/browse/developer actions 改走 normalize
- 未來多遊戲接入：各遊戲若需 server 值域約束，沿用條件式 CHECK pattern 追加，互不干擾

## 相關

- migration `019_normalize_user_profiles_and_card_servers.sql`（存量清洗 + user_profiles 補齊 + 孤兒卡軟下架）
- migration `020_overwatch_server_check_constraint.sql`（DB 上鎖）
- [[ADR-21]] profiles 代理鍵 + UNIQUE(user_id, game)
- [[ADR-20]] profiles game 欄位早期準備
- [[REF-019]] profiles schema 一人一遊戲一卡約束
