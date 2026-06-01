# Spec Delta: developer-console

## ADDED Requirements

### Requirement: 對準儀參數必須在生產環境可持久化

`saveHeroAlignments` Server Action SHALL 在 Vercel 生產環境（read-only filesystem）成功儲存英雄對準參數，並回傳可查驗的成功/失敗狀態。

#### Scenario: 對準儀在生產環境儲存參數

- **WHEN** 開發者在對準儀調整完英雄參數並點擊儲存
- **THEN** 系統 SHALL 呼叫 Supabase `hero_alignments` 表的 upsert 操作
- **AND** 系統 SHALL 回傳 `{ success: true }` 於成功時
- **AND** 系統 SHALL 回傳 `{ success: false, error: string }` 於失敗時（不靜默吃掉錯誤）
- **AND** 系統 SHALL NOT 使用 `fs.writeFileSync` 或任何本地 filesystem 操作

#### Scenario: 對準儀儲存失敗時顯示錯誤

- **WHEN** Supabase upsert 操作失敗（網路錯誤、RLS 違規等）
- **THEN** AdjusterClientPage SHALL 顯示錯誤狀態（`saveStatus = "error"`）
- **AND** 系統 SHALL 在 console 記錄錯誤訊息（`console.error`）

---

### Requirement: 名片廣場和個人檔案頁面從 DB 讀取英雄對準參數

Browse 和 Profile 頁面 SHALL 優先使用 DB 中的 `hero_alignments` 資料，fallback 到靜態 `HERO_ALIGNMENTS`。

#### Scenario: 廣場頁面讀取英雄對準參數

- **WHEN** 使用者訪問名片廣場（`/browse`）
- **THEN** 頁面 SHALL 呼叫 `getHeroAlignments()` 取得對準參數
- **AND** 每張 OWCard SHALL 使用 DB 值（若存在）或靜態 fallback 渲染英雄立繪
- **AND** `getHeroAlignments()` 失敗時 SHALL 靜默 fallback 到靜態資料（不破壞頁面渲染）

---

### Requirement: 開發者後台 Overview 顯示真實統計數據

Overview tab SHALL 顯示來自 Supabase 資料庫的真實統計，不得使用硬編碼字串。

#### Scenario: 開發者訪問 Overview tab

- **WHEN** 已登入的開發者訪問 `/developer` 並選擇 Overview tab
- **THEN** 頁面 SHALL 顯示 `profiles` 表的真實筆數作為「用戶數」
- **AND** 頁面 SHALL NOT 顯示硬編碼的「正常連線中」+ Online badge
- **AND** 顯示的數字 SHALL 來自 `getSystemStats()` Server Action 的查詢結果

---

### Requirement: hero_alignments 表 RLS 符合安全規範

`hero_alignments` 表 SHALL 啟用 RLS，公開讀取，developer 角色可寫。

#### Scenario: 一般用戶讀取 hero_alignments

- **WHEN** 任何用戶（含 anon）執行 `SELECT` 查詢 `hero_alignments` 表
- **THEN** 查詢 SHALL 成功回傳資料（公開讀 policy）

#### Scenario: 非 developer 嘗試寫入 hero_alignments

- **WHEN** 非 developer 角色的用戶執行 `INSERT`/`UPDATE`/`DELETE` 操作
- **THEN** RLS policy SHALL 拒絕操作
- **AND** `saveHeroAlignments` 的 `ensureDeveloper()` guard SHALL 在 Server Action 層先行阻擋
