# Proposal: auth-fix-and-developer-role

## Why

`google-oauth-supabase-auth` change 完成了正確的 OAuth 基礎建設（`Navbar.tsx` 內的 `signInWithOAuth` + `auth.signOut` + `auth/callback/route.ts` PKCE 換 session），但留下兩處**從未接上真實流程的開發期 mock**：

- `src/app/page.tsx:33` — `handleGoogleLogin = () => alert("實作測試：跳轉至 Google 授權登入流程！")`
- `src/components/morning-sketch/AppSidebar.tsx:24` — `handleLogout = () => alert("實作測試：登出系統！")`

**缺口錨定**：最近鄰 prior work = REF-003（Supabase Google OAuth PKCE flow）。REF-003 已定義 `signInWithOAuth` + callback 的正確設計，且 `Navbar.tsx` 已是該設計的可運作落地；缺口純粹在於首頁與側邊欄這兩個入口從未從 mock 切換到 REF-003 的真實實作。這不是「方法未知」，而是「已知方法未被一致套用」的實作漏洞。

**[Stage 5 補搜更正 — 掛載拓撲]** 對 codebase 的掃描（grep `AppSidebar` / `Navbar` / `FloatingDock` 全 src）發現實際渲染拓撲與直覺不同：
- `layout.tsx` 全域只掛載 `FloatingDock`，而 `FloatingDock` **不含任何登入/登出 UI**。
- `Navbar.tsx`（正確實作）與 `AppSidebar.tsx`（登出 mock）**都未被任何 page/layout import 掛載**（dead-mounted）。
- 因此使用者**目前唯一可見的登入入口** = `page.tsx` 首頁右上角那顆 alert mock 按鈕。

修正後的影響分級：**修 `page.tsx`（Task 1）是真正阻斷級的修復**（live 入口）；**修 `AppSidebar`（Task 2）是一致性修復，但該元件未掛載，無 live 觸發路徑**——故 Task 2 須誠實標為「latent 修復」，且 spec Scenario 2 的可測前提是「該元件被掛載」。這項發現直接改變了驗收策略（見 tasks.md Task 2 與 design.md 風險表）。

**Why now**：
- (賦能) 無新外部技術觸發 — 誠實降級為**內部排序**：登入是平台所有後續功能（profile 讀寫、收藏、玩家詳細頁）的前置依賴，此 mock 讓首頁與側邊欄的登入/登出入口對使用者**完全不可用**，屬阻斷級缺陷。
- (時機) 現在做而非更早：OAuth 基礎建設剛在前一個 change 落地，相關 client 分層（REF-002）與 callback（REF-003）context 仍新鮮，修復成本最低。
- (時機) 現在做而非更晚：新需求「開發者身分組」需要一個**可運作的登入態**作為前提才能讀 `app_metadata`；先修登入再加角色，依賴順序正確。

同時引入使用者要求的**兩層身分**：
1. **一般使用者**（所有 Google 登入者）：標準功能。
2. **開發者群組**（特定 email：用戶本人 + 朋友）：開發者模式（debug banner、測試功能面板）。

角色機制採 REF-005 的 `app_metadata`（JWT 內建、使用者無法偽造）。

**[Stage 6 §6.5 對抗審查 — scope 切分 gate]** Codex 對抗審查指出「mock 修復」與「developer role」綁同一 change 屬潛在 scope creep（role 需 Supabase admin 手動操作 + JWT caveat + 全域 layout UI，風險面遠大於兩個 alert）。本 change 採以下 **dependency gate** 回應，而非硬綁：
- **Phase A（Task 0-2）= auth mock 修復**：不依賴任何 Dashboard 手動作業，可獨立完成並 ship；阻斷級缺陷優先解除。
- **Phase B（Task 3-7）= developer role**：依賴 Phase A 的可運作登入態 + Supabase Dashboard 手動設定。Phase B 卡關（如 Dashboard 設定未完成）**不得阻塞 Phase A 的 ship**。

兩 Phase 同 change 是因共享 auth context 與 REF 依據，但驗收上互不阻塞。

## What Changes

- **修復 `page.tsx` 首頁登入按鈕**：`handleGoogleLogin` 改用 `supabase.auth.signInWithOAuth`（與 `Navbar.tsx` 一致，含 `redirectTo` 指向 `/auth/callback`）。
- **修復 `AppSidebar.tsx` 登出按鈕**：`handleLogout` 改用 `supabase.auth.signOut` + `router.refresh()`（與 `Navbar.tsx` 一致）。
- **新增 `src/hooks/useDevMode.ts`**：讀取 `user?.app_metadata?.role === 'developer'`，回傳 `{ isDeveloper, loading }`。
- **新增 `DevModeBanner` 元件**並接入 `layout.tsx`：僅當 `isDeveloper === true` 時渲染。
- **Supabase Dashboard 設定**：對指定開發者 email 設 `raw_app_meta_data = {"role":"developer"}`（文件化步驟，非程式碼變更）。

## Impact

- **受影響的 spec**：新增 `auth` capability（登入/登出/角色顯示行為）。
- **受影響的程式碼**：`src/app/page.tsx`、`src/components/morning-sketch/AppSidebar.tsx`、`src/app/layout.tsx`、新增 `src/hooks/useDevMode.ts` 與 `src/components/DevModeBanner.tsx`。
- **使用者可見影響**：首頁與側邊欄的登入/登出按鈕從「彈 alert」變成真正運作；開發者登入後可見 dev mode banner。
- **無破壞性變更**：`Navbar.tsx` 既有正確實作不動；`app_metadata` 對未設定角色的使用者回傳 `undefined`，banner 自然不顯示，向後相容。

## Non-Goals

- 不實作開發者專屬 RLS table（REF-005 方案 B Auth Hook 過度複雜，本 change 排除）。
- 不實作 email 環境變數白名單（REF-005 方案 C — 需重部署才能增減開發者、email 進 client bundle；本 change 排除，理由見 design.md D3）。
- 不重構 `Navbar.tsx`（既有實作正確，依 Karpathy §3 外科手術原則不動）。
- 不實作 debug overlay 的具體測試功能內容（本 change 只建 banner 容器與條件渲染骨架；具體 dev 工具留待後續 change）。
