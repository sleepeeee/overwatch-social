# 2026-06-02-developer-console-enhancements 歸檔報告

> 日期：2026-06-02
> Change：`developer-console-enhancements`
> Finding：F-003（status: confirmed）
> §6.7 審查：Gemini 兩輪（4/10 → 修正 → 6.5/10 → 修正 → PASS）
> 報告產生方式：/rsx:archive Step 6 自動生成

---

## Layer 1 — 30 秒速覽

**一句話結論**：開發者後台從「只有 2 個數字和白名單」升級為「可看英雄流行度統計 + 管理所有用戶名片」，同時修正了一個重要的設計教訓：帶 LIMIT 的查詢絕對不能配 client-side 搜尋。

### 數字速查表

| 指標 | 數值 | 白話意義 |
|---|---|---|
| 新增功能 | 2 個 | 英雄 Top 5 統計 + 用戶管理 Tab |
| 新增 DB policy | 1 個 | developer 可跨 profiles 查詢 |
| 新增 Server Actions | 2 個 | getAllProfilesForDeveloper + getHeroStats |
| Gemini 審查輪數 | 2 輪 | 第一輪 4/10，修正後第二輪 6.5/10 |
| Build 錯誤 | 0 個 | TypeScript 通過 |

### 決策速查

- ❌ 被關掉的路：client-side search on limited data（F-003 教訓）
- ❌ 被關掉的路：server props 傳全部 profiles（Initial TTFB 問題）
- ✅ 被確認的路：on-demand Server Action（點 tab 才 fetch）→ ADR-04
- ➡️ 下一步建議：考慮 `getHeroStats()` 遷移到 DB RPC + `unstable_cache`（M1 known limitation）

---

## Layer 2 — 完整報告

### A. 為什麼做這個

**前因**：EXPLORE 發現開發者後台（REF-005）有 5 個功能空白，最重要的是「看不到任何用戶資訊」和「系統概覽只有 2 個數字」。

**這次要回答的問題**：如何在不破壞現有 RLS 安全機制的前提下，讓開發者能查看用戶 profiles？

**為什麼重要**：平台上線後，了解「誰在用、用什麼英雄」是最基本的運營需求。沒有這個，開發者等於盲飛。

### B. 白話版方法

整個實作分三層：

1. **資料庫層**（migration 004）：加一條「開發者可以讀所有 profile 的基本資訊，但不含私人聯絡方式」的規則
2. **後端層**（Server Actions）：兩個新功能：查用戶列表（可搜尋）+ 統計哪些英雄最受歡迎
3. **前端層**（DeveloperConsoleClient）：新 Tab 4「用戶管理」+ Overview 顯示英雄 Top 5

最關鍵的設計決策：用戶管理 Tab **不是頁面載入時就查**，而是**點擊 tab 才去查**（on-demand）。這樣開發者看 Overview 或白名單時，完全不需要等用戶列表載入。

### C. 結果翻譯

**Gemini 第一輪審查（4/10）** 發現了一個真正的設計缺陷：

我最初的設計是：一次取 100 筆用戶，然後在瀏覽器端過濾搜尋。問題是——如果系統有 500 個用戶，搜尋只會在最新 100 個人裡找，另外 400 個完全搜不到。

這就是 F-003 的核心發現：**有 LIMIT 的查詢配上 client-side 搜尋等於設計缺陷**。修復方案：搜尋字串傳給 Server Action，讓 Supabase 用 `ilike` 在資料庫層過濾。

**Gemini 第二輪審查（6.5/10）** 後又修了兩個問題：
- 加了 `useTransition` 防止快速點 tab 造成的 race condition
- 加了 try/catch 防止 Server Action 拋錯時畫面靜默失敗

### D. 決策地圖

```
核心問題：用戶列表怎麼載入？

方案 A：server props 預先載入
  → 每次頁面請求都要查用戶列表
  → 就算開發者只想改白名單也得等
  ❌ 放棄

方案 B：client-side fetch on mount
  → 頁面載入後立刻請求，也是等
  ❌ 放棄

方案 C（選擇）：on-demand Server Action
  → 點 "用戶管理" tab 才請求
  → Overview / 白名單完全不受影響
  → ADR-04 記錄此決策
  ✅ 採用
```

### E. 技術亮點

**Server Action from Client Component**：在 Next.js 15 App Router 中，Client Component 可以直接呼叫 Server Action（透過 import）。Server Action 執行在伺服器端，`ensureDeveloper()` 驗證也在伺服器端，完全安全。這是 developer tools 的正確架構：UI 在 client，業務邏輯和安全檢查在 server。

**RLS OR Policy 設計**：新 policy 用 `OR` 邏輯：
- 開發者：可讀所有 row
- 一般用戶：只能讀自己的 row（原有行為完全保留）

這種「擴展而非修改」的設計讓 migration 完全向後兼容。

### F. 流程復盤

**耗時估算**：
- Propose（含兩輪 Gemini）：45 分鐘
- Apply（含修正）：60 分鐘
- Archive：20 分鐘

**兩輪 Gemini 審查的代價**：Gemini 第一輪給 4/10 的最大功勞是發現「client-side search on LIMIT query」的設計缺陷（C1）。這個缺陷如果上線會造成用戶體驗問題，但不易被 TypeScript 或 build 工具發現。Gemini 的對抗式審查在這裡發揮了真正的價值。

**工作流教訓**：
- 搜尋 UI 如果查詢有 LIMIT，必須 server-side filter
- on-demand loading（click to load）比預先載入更適合 dev tools
- Server Actions 從 Client Component 呼叫是 Next.js 15 的正確模式

### G. 技術索引

| 類型 | ID / 路徑 |
|---|---|
| Finding | F-003（`.rsx/findings/F-003-client-side-search-pagination-defect.md`）|
| ADR | ADR-04（`.rsx/decisions/ADR-04-developer-user-management-on-demand-server-action.md`）|
| REF | REF-005, REF-006（`.rsx/knowledge/`）|
| OpenSpec change | `openspec/changes/archive/2026-06-01-developer-console-enhancements/` |
| DB Migration | `supabase/migrations/004_developer_profiles_policy.sql` |
| Commit | `2201118` → pushed main |
| 修改文件 | `developer.ts`、`developer/page.tsx`、`DeveloperConsoleClient.tsx` |
