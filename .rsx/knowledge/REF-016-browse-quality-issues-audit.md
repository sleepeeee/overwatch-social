---
id: REF-016
type: docs
title: Browse 廣場 7 大品質問題完整審計（2026-06-02）
url: n/a
status: active
references_to: [REF-001, REF-003, F-012]
referenced_by: [F-013, ADR-13, F-014, ADR-14, F-017]
---

## 問題清單

### P0 — 立即必修

**問題 4：Mock 資料靜悄悄頂替真實資料**
- 位置：`OverwatchSquare.tsx:99`
- 症狀：Supabase 失敗或空資料時，`setPlayers(MOCK_PLAYERS)` 靜默執行，無任何 UI 告知
- 影響：用戶不知道看的是假人，誤以為找到靈魂拍檔

**問題 3：搜尋全撈無分頁**
- 位置：`OverwatchSquare.tsx:76-104`（`loadPlayers`），`line 117-146`（`filteredPlayers`）
- 症狀：`select("*")` 無 limit，一次撈全部到 client 做 substring match
- 影響：100+ 玩家後延遲明顯，1000+ 玩家時風扇起飛

### P1 — 近期修

**問題 1：VAL/LoL 假卡片無明確標示**
- 位置：`ValorantSquare.tsx:29-65`、`LoLSquare.tsx:29-65`
- 症狀：MOCK_VAL_PLAYERS / MOCK_LOL_PLAYERS 以完整玩家卡片渲染，只在標題區有小 badge「即將開放」，卡片本身看不出是假的
- 影響：用戶誤以為找到了真實特戰英豪/LoL 玩家

**問題 6：Auth 訂閱多頭馬車**
- 位置：`useDevMode.ts:29`（獨立 onAuthStateChange）vs `AuthContext.tsx:24`（全域）
- 症狀：useDevMode 還在用獨立訂閱，Navbar.tsx (dead code) 也有獨立訂閱
- 修法：useDevMode 改為 `const { user } = useAuth(); return { isDeveloper: user?.app_metadata?.role === 'developer' }`

### P1 — Dead Code

**問題 2：Navbar.tsx + AppSidebar.tsx**
- 這兩個元件沒有被任何頁面 import（grep 確認）
- 包含完整登入/登出邏輯但永遠不執行
- CLAUDE.md 已記錄為「已知 Dead Code」但從未清除

### P2 — 功能缺口

**問題 5：卡片點了沒反應**
- 位置：`browse/page.tsx:281-305`（OWCard 無 onClick wrapper）
- `src/app/player/[id]/` 不存在
- CLAUDE.md 開發計畫 #7 記錄為「待做」
- 需要新建 `/player/[id]` page + OWCard 加 onClick

### P3 — 測試覆蓋

**問題 7：零測試**
- `tests/e2e/home-responsive.spec.ts`：2 個測試（首頁元素可見性、手機不橫向爆版）
- 無登入流程測試、無廣場搜尋測試、無名片編輯測試
- playwright.config.ts 框架完整，缺的是測試案例

## 建議的 Change 範疇

建議以兩個獨立 change 處理：

**Change A（browse-quality-fixes）**：修問題 1、2、4、6
- 估計：2-3 小時，零 DB 變更，零 API 變更
- 純 UI/架構清理

**Change B（browse-server-search-and-player-detail）**：修問題 3、5
- 需要新增 `/player/[id]` 路由 + server-side search
- 估計：4-6 小時，有 Supabase query 變更
- 依賴 Change A 完成後進行

**Change C（e2e-test-coverage）**：修問題 7
- 獨立進行，不依賴 A/B
