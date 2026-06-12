## 設計重點

### 1. 雙層防線（核心決策，見 ADR-23）

| 層 | 機制 | 職責 |
|---|---|---|
| 應用層 | `normalizeOverwatchServer()`（`src/lib/gameCatalog.ts`）| 寫入前把任意顯示字串轉 canonical，提供友善容錯 |
| DB 層 | CHECK `profiles_overwatch_server_valid`（migration 020）| 源頭硬擋非 canonical 值，防繞過應用層的寫入 |

### 2. 條件式 CHECK 為多遊戲預留

```sql
CHECK (game <> 'overwatch' OR server IN ('asia', 'america', 'europe'))
```

只約束 `game = 'overwatch'` 的列。Valorant / LoL 的 server 值域不同（如 `ap`/`na`/`eu`/`kr`），未來各自追加同形條件式約束即可，互不干擾。

### 3. 套用順序（前置依賴）

migration 019 必須先於 020：019 把存量髒值洗成 canonical，020 才能成功加 CHECK（否則既有髒值會讓 ALTER TABLE 失敗）。

### 4. 冪等 UPDATE

019 的 server UPDATE 帶 `WHERE server <> <normalized>`，重跑不會重複寫入、不影響已 canonical 的列。

### 5. 孤兒卡軟下架 vs 永久刪除

找不到 auth.users 對應的孤兒卡，採 `is_tag_visible = false` 軟下架而非 DELETE——保留資料以備帳號復原，呼應全域「安全刪除走可還原路徑」原則。

## 驗證（事後實證，2026-06-11）

- 正式 DB：5/5 筆 overwatch 名片 server 全為 `asia`（canonical），無髒值
- CHECK 約束 `profiles_overwatch_server_valid` 已生效（pg_constraint 確認）
- `npm run build`：Compiled successfully + TypeScript 0 errors + 16/16 static pages
