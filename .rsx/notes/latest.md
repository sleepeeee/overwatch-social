# 最近進度（rsx 工作日誌）

> 每次工作結束時更新。新對話從這裡恢復 context。
> Zone A（狀態快照）整段覆寫；Zone B（工作日誌）追加，由新到舊。
> 詳見 RSX_SOP.md §4.6（D.1 ~ D.4）。

---

<!-- ZONE_A_START -->
> **Zone A 最後更新：2026-06-03**

## 現在在做什麼

`hero-stats-db-aggregation` ARCHIVE 前置完成（Pre-archive Gate PASS、F-005/ADR-05 已建）。等待主代理執行 `openspec archive hero-stats-db-aggregation`。

## 進行中的 Changes（未 archive）

| Change | 狀態 | 備註 |
|---|---|---|
| hero-stats-db-aggregation | Gate PASS，等待 archive | F-005/ADR-05 已建；雙向 crossref 回填完成 |

## 待 Propose Changes

（無）

## 近期歸檔紀錄

| Change | 時間 | 備註 |
|---|---|---|
| developer-console-backend | 2026-06-02 | 對準儀改存 Supabase DB + 後台真實統計；F-004、ADR-04 已建 |
| auth-ux-login-gate | 2026-06-01 | 登出按鈕+LoginModal+Profile overlay；F-003、ADR-03 已建 |
| auth-fix-and-developer-role | 2026-06-01 | 登入修復+developer mode；F-002、ADR-02 已建 |
| google-oauth-supabase-auth | 2026-06-01 | OAuth 基礎建設；ADR-01、F-001 已建 |
<!-- ZONE_A_END -->

---

## Zone B — 工作日誌（追加，由新到舊）

### 2026-06-03 hero-stats-db-aggregation — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate 最終 PASS（修復 crossref 對稱 FAIL + 狀態檔同步 FAIL）；建 F-005（LIMIT 500 + JS 端聚合缺陷確認，修復後全量統計驗收 commit a7c8573）；建 ADR-05（SQL function SECURITY DEFINER + LATERAL unnest vs Server Action 端聚合決策）；雙向 crossref 回填（REF-004 referenced_by 加 REF-010/REF-011；REF-005 referenced_by 加 REF-011；REF-010 referenced_by 加 REF-012/F-005/ADR-05；REF-011 referenced_by 加 REF-012/F-005/ADR-05；REF-012 referenced_by 加 F-005）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive hero-stats-db-aggregation`

### 2026-06-02 developer-console-backend — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate 全 PASS；建 F-004（Vercel serverless 唯讀 filesystem 導致 fs.writeFileSync 靜默失敗，修復改走 Supabase upsert）；建 ADR-04（hero_alignments DB read + static fallback 架構決策）；雙向 crossref 回填（REF-004 referenced_by 加入 F-004、ADR-04；F-004 references_to REF-004 + ADR-04；ADR-04 references_to REF-004 + F-004）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive developer-console-backend`

### 2026-06-01 auth-ux-login-gate — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate 全 PASS；建 F-003（authLoading guard 缺失根因：isLoggedIn 初始 false 造成 LoginModal 閃現）；建 ADR-03（LoginModal 共用元件 vs 各頁自製 overlay 決策）；雙向 crossref 回填（REF-002/REF-006 referenced_by 更新；ADR-02 references_to 補 REF-006 遺漏修正；F-003 referenced_by 加 ADR-03）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive auth-ux-login-gate`

<!-- pre-check-log-start -->
### [Step 0 pre-check] 登入保護 + auth guard + permission-based UI (2026-06-01)
Tier: grep
命中：5 筆（REF-002, REF-003, REF-004, REF-005, REF-006）
使用者選擇：(b) 先讀本地材料（直接做 codebase 分析，不需外部搜尋）
<!-- pre-check-log-end -->



### 2026-06-01 auth-fix-and-developer-role — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate 全 PASS；建 F-002（Navbar/AppSidebar dead component 未掛載）；建 ADR-02（app_metadata vs 六方案開發者身分組決策）；雙向 crossref 回填（REF-002/003/004/005 referenced_by 更新）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive auth-fix-and-developer-role`

<!-- pre-check-log-start -->
### [Step 0 pre-check] 登入功能修復 + 角色分群 developer mode (2026-06-01)
Tier: grep
命中：3 筆（REF-002, REF-003, REF-004）— 涵蓋登入基礎架構，但不含角色分群/developer mode
使用者選擇：(c) 兩者都做
額外發現：page.tsx + AppSidebar.tsx 存在 alert() 假實作，Navbar.tsx 才有真正的 OAuth 實作
<!-- pre-check-log-end -->



### 2026-06-01 auth-fix-and-developer-role — EXPLORE 完成

- **已完成**：Step 0 pre-check（3 筆命中：REF-002/003/004）；瀏覽器實測確認登入 bug（page.tsx + AppSidebar.tsx alert() 假實作）；L2 外部搜尋 Supabase RBAC 方案；建立 REF-005（app_metadata 角色系統）；REF-002/REF-004 referenced_by 回填
- **發現**：page.tsx:33 `handleGoogleLogin = alert()` + AppSidebar.tsx:24 `handleLogout = alert()` 是兩個遺留 mock，Navbar.tsx 的實作才是正確的
- **卡關**：無
- **下次優先**：執行 `/rsx:propose auth-fix-and-developer-role`

### 2026-06-01 google-oauth-supabase-auth — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate 全 PASS；建 F-001（profiles 安全漏洞三輪審查）；建 ADR-01（DB 層 view 隱私遮蔽決策）；雙向 crossref 回填（REF-002/003/004 referenced_by 更新）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive google-oauth-supabase-auth`

### 2026-05-31 project initialized

- **已完成**：跑 `/rsx:init` 建立 `.rsx/` 骨架 + 部署 latest.md template
- **卡關**：無
- **下次優先**：執行 `/rsx:explore <主題>` 開始第一個 change（探索 + 建 REF）

<!--
工作日誌使用提示：
- 每次重要工作結束（如完成 explore / propose / apply / archive 任一階段）就追加新條目於本檔頂端（Zone B 緊接此說明區下方）
- 每條格式固定：### YYYY-MM-DD <change-name 或 任務描述>
- 三段：已完成 / 卡關 / 下次優先（任一無內容則寫「無」）
- 超過 30 天的舊條目自動歸檔到 notes/archive/YYYY-MM.md（跑 `python packs/rsx/scripts/maintain.py rotate-zone-b --apply`）
-->
