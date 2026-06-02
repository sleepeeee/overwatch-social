# 2026-06-02-browse-quality-fixes 歸檔報告

> 日期：2026-06-02
> Change：`browse-quality-fixes`
> Finding：F-004（status: confirmed）
> §6.7 審查：Gemini 8.5/10，PASS
> 報告產生方式：/rsx:archive Step 6 自動生成

---

## Layer 1 — 30 秒速覽

**一句話結論**：清除了 3 個讓開發者和用戶困惑的問題——刪掉兩個從來沒被掛上去的登入元件、讓廣場在顯示假資料時誠實告訴用戶、把開發者身分判斷統一到一個地方。

### 數字速查表

| 指標 | 數值 | 白話意義 |
|---|---|---|
| 刪除的 Dead Code | 2 個檔案（293 行）| Navbar + AppSidebar，永遠不會被執行的代碼 |
| 消除的 auth 訂閱 | 1 個 | useDevMode 不再自己訂閱 Supabase |
| 新增的透明度機制 | 1 個提示條 | 廣場顯示假資料時有橘黃色說明 |
| §6.7 Gemini 評分 | 8.5/10 | 無 Critical/Major，兩個 Minor 均可接受 |
| Build 錯誤 | 0 個 | TypeScript 乾淨通過 |

### 決策速查

- ❌ 被關掉的路：保留 Dead Code「以後可能用到」（293 行沒有意義的代碼）
- ✅ 被確認的路：AuthContext 是全域 auth 狀態的唯一來源，其他地方消費不重複訂閱
- ➡️ 下一步建議：browse-server-search-and-player-detail（server-side 搜尋 + 玩家詳細頁）

---

## Layer 2 — 完整報告

### A. 為什麼做這個

**前因**：一份嚴厲的批評信列出 7 個品質問題。本 change 處理其中 3 個可以今天修好的（問題 2/4/6）。

### B. 修了什麼

**問題 2（Dead Code）**：Navbar.tsx 和 AppSidebar.tsx 有完整的登入/登出邏輯，有精心的 CSS 樣式，有 JSX 結構，但從來沒有被任何頁面 import。這就是「替考古學家寫的代碼」。刪除。

**問題 4（Mock 資料靜悄悄）**：廣場的 OverwatchSquare 在 Supabase 失敗或沒資料時，默默換成假玩家資料，沒有任何告知。現在加了一個橘黃色提示條：「目前顯示的是示範資料，廣場尚無真實玩家名片。成為第一個建立名片的特工吧！」

**問題 6（Auth 三種流派）**：useDevMode 原本自己訂閱 Supabase `onAuthStateChange`，與已有的 AuthContext 並行。現在改成直接讀 `useAuth()`，全站 auth 訂閱統一為一個。

### C. 一個意外的 Bug

`useDevMode` 改用 `useAuth()` 後，`DevModeBanner` 在 build 時拋錯：`useAuth must be used inside <AuthProvider>`。

原因：`DevModeBanner` 在 `layout.tsx` 裡位於 `<AuthProvider>` 外面（舊的設計把它當成 Server Component 不需要 auth context）。修法：把 `DevModeBanner` 移到 `<AuthProvider>` 裡面。這個修正也建立了 F-004 Finding。

### D. 技術索引

| 類型 | ID / 路徑 |
|---|---|
| Finding | F-004（DevModeBanner 必須在 AuthProvider 內）|
| ADR | ADR-05（useDevMode 消費 AuthContext，不獨立訂閱）|
| Commit | `1a8f8e4` → pushed main |
| 刪除文件 | `Navbar.tsx`、`AppSidebar.tsx` |
| 修改文件 | `OverwatchSquare.tsx`、`useDevMode.ts`、`layout.tsx` |
