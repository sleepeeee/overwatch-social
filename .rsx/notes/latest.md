# 最近進度（rsx 工作日誌）

> 每次工作結束時更新。新對話從這裡恢復 context。
> Zone A（狀態快照）整段覆寫；Zone B（工作日誌）追加，由新到舊。
> 詳見 RSX_SOP.md §4.6（D.1 ~ D.4）。

---

<!-- ZONE_A_START -->
> **Zone A 最後更新：2026-06-11（C2 + C3 ARCHIVE 準備完成，待主代理分別執行 openspec archive）**

## 現在在做什麼

團隊模式（Agent 多代理協作）按 rsx 流程推進三個 DB/安全 change，全部完成：
- **C1 `harden-supabase-security`** ✅ 全流程完成並 archive（migration 021 部署生產、ADR-24/F-024/F-025、commit、merge main）。
- **C2 `adopt-supabase-generated-types`** ✅ APPLY + ARCHIVE 完成（tasks 全勾、ADR-25/F-026 建立、crossref 回填、Gate PASS）；待主代理執行 `openspec archive adopt-supabase-generated-types`。
- **C3 `audit-developer-capture-injection`** ✅ APPLY + ARCHIVE 完成（tasks 全勾、ADR-26/F-027/REF-027 建立、crossref 回填、Gate PASS）；待主代理執行 `openspec archive audit-developer-capture-injection`。

## 進行中的 Changes（未 archive）

（無。C2 + C3 Pre-archive Gate 均 PASS，等待主代理 openspec archive 指令後即完成）

## 待 Propose Changes（依優先度）

| 優先 | Change | 複雜度 | 核心問題 |
|---|---|---|---|
| #1 P1 | `favorites-collections` | M | 廣場無收藏功能，留存路徑斷裂 |
| #2 P1 | `vercel-github-webhook-hud` | M | 生產環境 HUD 顯示假 commit stats |

## 近期歸檔紀錄

| Change | 時間 | 備註 |
|---|---|---|
| adopt-supabase-generated-types | 2026-06-11 | Supabase 生成型別 + createClient<Database> 泛型注入；toSocialChannels helper 收斂；移除約 20 個多餘 as 斷言；PLACEHOLDER_BATTLE_TAG 常數化；tsc 0 errors + 16/16 build；ADR-25/F-026；分支 feature/backend-generated-types |
| harden-supabase-security | 2026-06-11 | Supabase 安全邊界硬化 migration 021；遮罩 social_channels PII（修 migration 015 回退 F-014）；developer_whitelist RLS 修復（P1）；function search_path + bucket listing；ADR-24/F-024/F-025 |
| normalize-profiles-and-server-canonical | 2026-06-11 | OW server canonical 雙層防線 + user_profiles 補齊 + 孤兒卡軟下架；ADR-23；migration 019/020；**事後補記**（原走 PR #3 未走 rsx）|
| seo-improvements | 2026-06-10 | 全站 canonical + 各頁 Metadata + 首頁 JSON-LD |
| user-identity-global-nickname | 2026-06-10 | 全站暱稱層 + Dev Console 用戶視圖；F-023/ADR-22/REF-022/REF-023；migration 016/017 |
| brand-logo-upgrade | 2026-06-10 | AFTER MIDNIGHT 品牌 Logo 升級 + 明暗切換 |
| restore-profile-languages | 2026-06-10 | 個人檔案語言設定還原 |
| add-generic-tags | 2026-06-10 | 通用標籤系統 |
| theme-share-page-refresh | 2026-06-10 | 分享頁星空主題刷新 |
| restore-final-html-visual-parity | 2026-06-06 | 還原最終 HTML 視覺一致性 |
| modularize-browse-game-directories | 2026-06-06 | 廣場多遊戲目錄模組化 |
| fix-adversarial-audit-issues | 2026-06-06 | 對抗式審查問題修復 |
| backend-infra-improvements | 2026-06-04 | view + browse cache + alignment cache；F-020/F-021/ADR-18/19/20 |
| one-card-per-game-constraint | 2026-06-04 | profiles 代理鍵 PK + UNIQUE(user_id,game)；F-022/ADR-21 |

> 完整歸檔史見 `openspec/changes/archive/`（截至 2026-06-11 共 48 個 change）。
<!-- ZONE_A_END -->

---

## Zone B — 工作日誌（追加，由新到舊）

### 2026-06-11 audit-developer-capture-injection (C3) — ARCHIVE 準備完成（rsx-archiver sub-agent）

- **已完成**：tasks.md Task 1-5 全部勾選（測試新增、runner 擴充、全綠驗收、Gemini §6.5 審查、ARCHIVE 前置）；建 ADR-26（execFile + 參數陣列 + env 絕對路徑 shell 執行安全準則，含 Gemini 3 個 footnote N1/N2/N3）；建 F-027（audit-confirms-safe → characterization test 固化 pattern + 跨平台注入分隔符教訓 + 無測試覆蓋的安全寫法等同未受保護原則）；建 REF-027（Node.js child_process execFile vs exec shell 解析機制）；三路雙向 crossref 回填（ADR-26 ↔ F-027 ↔ REF-027）；Pre-archive Gate FAIL=0；latest.md Zone A 覆寫 + Zone B 追加
- **§6.7 說明**：§6.5 第二意見由 Gemini 完成（PASS，M1/M2 已修補）；Codex 今日額度滿依雙臂規範降級記錄；12/12 test pass + build 全綠 + Gemini PASS，文件化跳過 Codex §6.7 重跑；lean archiving 適用（Task 5 為純 ARCHIVE 補勾選，Task 1-4 為實質工作）
- **卡關**：無
- **下次優先**：主代理依序執行 `openspec archive adopt-supabase-generated-types`（C2）、`openspec archive audit-developer-capture-injection`（C3）；之後 `favorites-collections` propose

### 2026-06-11 adopt-supabase-generated-types — ARCHIVE 準備完成（rsx-archiver sub-agent）

- **已完成**：tasks.md task 0→8 全部勾選；建 ADR-25（生成型別 + OWPlayerCard anti-corruption layer 邊界決策）；建 F-026（social_channels Json 型別分歧 + toSocialChannels helper 收斂通則）；雙向 crossref 回填（REF-024/025/026 referenced_by 加 ADR-25/F-026；F-025 referenced_by 加 F-026；ADR-24/ADR-01 referenced_by 加 ADR-25）；Pre-archive Gate FAIL=0 WARN=0；latest.md Zone A 覆寫 + Zone B 追加
- **§6.7 說明**：§6.5 第二意見由 Gemini 完成（PASS），Codex 今日額度滿依雙臂規範降級；tsc 0 errors + build 全綠 + Gemini PASS，文件化跳過 Codex §6.7 重跑；lean archiving 規則適用（Task 7.5 驗收整合為補勾選，未執行新實質工作）
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive adopt-supabase-generated-types`；之後 C3 `audit-developer-capture-injection` propose

### 2026-06-11 adopt-supabase-generated-types — PROPOSE 完成（orchestrator sub-agent）

- **背景**：C2，消除 44 個跨資料邊界手動 `as` 斷言（grep 實測：browse 14/profile 14/homepage 6/developer 5/userProfile 3/alignment 2），改用 Supabase 生成型別 + `createClient<Database>` 泛型
- **已完成**：4 artifacts（proposal/design/spec/tasks）+ REF-024（Database generic）/REF-025（social_channels view vs table 型別分歧）/REF-026（getSystemStats 魔術字串審計）；`openspec validate --strict` PASS
- **核心設計決策**：保留 OWPlayerCard 作 anti-corruption layer（不被生成型別取代）；social_channels 型別分歧收斂於單一 helper；魔術字串抽 PLACEHOLDER_BATTLE_TAG 常數（方案 A，行為不變）；無 DB schema 變更
- **最大風險（已標記）**：social_channels view（C1 遮罩布林）vs base table（帳號字串）生成型別皆為 Json，tsc 無法防隱私回歸 → 需 runtime smoke，不能只靠 build；生產 DB vs repo migration drift（C1 遮罩 migration 未落地 repo，015/017 仍未遮罩版）
- **跳過項目**：Stage 1 explorer 委派（F-039 sub-agent 無法 spawn Agent，改主代理直接 inline 探索）；Stage 6 Codex §6.5（同因，prompt 備於 design.md，待 team lead 並行發起，**未捏造評分**）；型別生成指令（無 Supabase MCP，待 team lead 跑 mcp__supabase__generate_typescript_types）
- **卡關**：無（artifacts 完整；待 team lead 執行型別生成 + Codex review + APPLY）
- **下次優先**：team lead 並行發起 design.md 內 Codex prompt；通過後 APPLY（tasks.md task 0→8）
### 2026-06-11 harden-supabase-security — APPLY + ARCHIVE 完成

- **已完成**：migration 021 APPLY 完成（DB gate 全綠）；建 ADR-24（public_profiles 維持 SECURITY DEFINER + 投影遮罩 PII，否決 security_invoker；承接並修正 ADR-01 backlog）；建 F-024（developer_whitelist RLS enabled 0 policy 靜默空 P1 根因 + 修復通則）；建 F-025（migration 015 把 social_channels 補回 anon view 回退 F-014，view 補回私人欄位前必須遮罩 PII 通則）；雙向 crossref 回填（ADR-01 / F-014 / ADR-14 / REF-004 / REF-005 / REF-011 的 referenced_by 加入 ADR-24 / F-024 / F-025）；Pre-archive Gate FAIL=0；latest.md 已更新
- **§6.7 說明**：Codex PROPOSE 階段 §6.5 已審（M1 決策依據）；今日額度滿無法重跑，DB gate 全綠 + 既有審查文件化跳過；Gate 視為 PASS-with-documented-skip
- **卡關**：無（等主代理執行 openspec archive）
- **已 archive**：`2026-06-10-harden-supabase-security`；commit + merge main 完成；後續 change 候選：social-channels-separate-table（拆 profile_contacts 表）

### 2026-06-11 環境健診 + normalize-profiles-and-server-canonical 補記

- **背景**：上個 session 因工具輸出串流污染（注入假內容）結束，本 session 重新驗證環境並回補脫軌的 rsx 記錄
- **環境健診**：sentinel 包夾驗證乾淨；git 與 origin/main 同步；Supabase MCP 正常；`npm run build` exit 0（Compiled 52s + TypeScript 0 errors + 16/16 static pages，推翻上個 session 的 0/1 矛盾——確認為污染造成）
- **DB 複查**：profiles=5 / user_profiles=6；5/5 overwatch 名片 server 全為 `asia`（canonical）；CHECK 約束 `profiles_overwatch_server_valid` 已生效；migration 019/020 已套正式 DB
- **rsx 健檢**：推翻交接疑點——rsx 流程非常健康（22 ADR / 23 REF / 23 finding / 48 archive）。抽查 ADR-21 vs 實際 DB schema 一字不差（代理鍵 PK + composite unique 都在）。唯一真實斷檔：latest.md Zone A 停在 6/04 + PR #3 normalize（migration 019）+ migration 020 未走 rsx
- **決策**：使用者選「回歸 rsx + 輕量例外」
- **已完成補記**：建 ADR-23（OW server 雙層防線 + 條件式 CHECK + 孤兒卡軟下架）；建 change archive `2026-06-11-normalize-profiles-and-server-canonical`（proposal/design/tasks/spec）；latest.md Zone A 覆寫 + Zone B 追加
- **卡關**：無
- **下次優先**：§A task 5（eslint --fix）、task 6（npm audit）、task 7（建新功能分支，先問分支類型與功能名）；§B task 8（建 project-medic 跨專案維護 skill，先給設計草案）

### 2026-06-04 user-identity-global-nickname — APPLY + ARCHIVE

- **已完成**：Migration 016（user_profiles 表 + RLS + 遷移 INSERT）+ Migration 017（public_profiles view + nickname）；Server Actions（userProfile.ts）；Profile Hub nickname input 改讀寫 user_profiles；Dev Console users tab 兩層視圖（UserListSection + UserCardDetail）；TypeScript 0 errors；build 13/13 PASS；F-023 / ADR-22 / REF-022 / REF-023 建立；crossref 回填；git commit 66cfbf3；push 完成（Vercel 自動部署）
- **卡關**：Supabase migration 016/017 需手動執行（Supabase MCP 已斷線）
- **下次優先**：在 Supabase Dashboard SQL Editor 依序執行 migration 016 → 017；驗收整合測試（Profile Hub + Dev Console users tab）

### 2026-06-04 user-identity-global-nickname — PROPOSE 完成

- **已完成**：4 artifacts（proposal/design/spec/tasks）+ REF-022/023 建立 + propose_checklist.md（FAIL=0 WARN=0，3 個 Codex dispatch 跳過記錄）；Stage 0-7 全部執行；Zone A 更新
- **跳過項目**：Codex §6.1/§6.5 + openspec validate CLI（環境不可用，主代理自審替代，評分 7.5/10）
- **卡關**：無
- **下次優先**：進入 APPLY，執行 Task 1-8（Task 2/3 需 Supabase Dashboard 手動執行 SQL）

### 2026-06-04 user-identity-global-nickname — EXPLORE 完成

- **已完成**：Step 0 pre-check（命中 2 筆部分相關：ADR-16/F-016，無直接命中）；inline 探索分析現有架構 vs 需求 gap；整理 9 個設計盲點清單；設計決策與使用者確認完畢（ID=user_id UUID、nickname 可選可改、未設顯示 ID、dev console 二層 UI）；Zone A 更新
- **確認的設計**：user_id UUID = 永久 ID；nickname = 選填 display name（不唯一）；現有用戶遷移以最後更新角色卡 display_name 為基準；Dev console 第一層 nickname+ID+遊戲清單 → 第二層各卡詳情
- **卡關**：無
- **下次優先**：執行 `/rsx:propose user-identity-global-nickname`

### 2026-06-04 backend-infra-improvements — ARCHIVE

- **已完成**：4 項後端改進（display_name 進 view + browse 60s cache + alignment 5min module cache + profiles.game 欄位）；新建 F-020（browse authLoading guard 5s 延遲根因）/F-021（Next.js 16.2.6 revalidateTag 需第二參數 "max"）/ADR-18（browse cache 策略）/ADR-19（alignment module-level cache）/ADR-20（profiles.game early schema preparation）；雙向 crossref 回填（F-003 referenced_by 補 F-020；F-021 referenced_by 補 ADR-18）；Pre-archive Gate FAIL=0 WARN=2（skip 記錄）；openspec archive 完成
- **卡關**：Supabase migration 013 需用戶手動執行（無自動化途徑）
- **下次優先**：在 Supabase Dashboard SQL Editor 執行 migration 013（`supabase/migrations/013_display_name_game_public.sql`）

### 2026-06-03 homepage-hud-removal-3col-layout — ARCHIVE

- **已完成**：F-019（HomeCaptureHud Vercel 假資料根因）、ADR-17（三欄等高 + 暫時移除 HUD 決策）；crossref 回填（F-004 referenced_by 補 F-019）；Pre-archive Gate FAIL=0 WARN=1（Zone B 補寫，非 blocking）；openspec archive 完成
- **卡關**：無
- **下次優先**：Change #5 `vercel-github-webhook-hud`（接通 Supabase 資料源後重新掛載 HUD）

### 2026-06-03 三個 S-change 補建文件（Finding / ADR / crossref）

- **已完成**：
  - F-016（display_name localStorage-only 缺陷根因 + 雙寫修復確認）
  - F-017（VAL/LoL 假卡片外觀信任度風險 + banner 修復）
  - F-018（og:image NEXT_PUBLIC_SITE_URL 靜默失效 + fallback 修復）
  - ADR-16（display_name 雙寫策略決策）
  - crossref 回填：REF-013 / REF-014 / REF-016 / F-007 的 referenced_by 補上新 F/ADR
  - Supabase migration 012 在 Dashboard SQL Editor 手動執行（Success）
  - handleSaveHub async error handling 修補（d92b443）
- **卡關**：三個 change 未走 rsx:propose → rsx:apply → rsx:archive 正式流程（直接實作）；文件為事後補建
- **下次優先**：若需歸檔，補跑 Pre-archive Gate 並建立 openspec change record

### 2026-06-03 capture-hud-full-reimplementation — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate PASS；建 F-008（TS template literal 中 Bash 變數 `\${}` 轉義規則）；建 F-009（SSR 安全初始化 deterministic default + useEffect 模式）；建 ADR-08（HTML 原始設計稿作為 canonical 移植規格決策）；建 ADR-09（SSR 安全初始化模式架構決策）；雙向 crossref 回填：REF-015 referenced_by 加 F-008/ADR-08；REF-006 referenced_by 加 F-009/ADR-09；ADR-08 referenced_by 加 F-008；ADR-09 referenced_by 加 F-009；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive capture-hud-full-reimplementation`

### 2026-06-03 share-page-completion — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate PASS；建 F-007（og:image 必須絕對 URL + NEXT_PUBLIC_SITE_URL env var 設計確認）；建 ADR-07（Server Component 包 Client Component 邊界：generateMetadata + html-to-image 共存設計）；雙向 crossref 回填（REF-014 referenced_by 加 F-007/ADR-07；F-007 references_to REF-014/ADR-07；ADR-07 references_to REF-014/F-007；F-007 referenced_by 加 ADR-07；ADR-07 referenced_by 加 F-007）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive share-page-completion`

### 2026-06-03 userprofile-auth-metadata-sync — ARCHIVE 前置（Gate + Finding/ADR）

- **已完成**：§Z Gate PASS；建 F-006（UserProfile localStorage 跨用戶 key 污染根因 + per-user key 修復確認）；建 ADR-06（per-user localStorage key + AuthContext.userProfile 事實來源決策）；雙向 crossref 回填（REF-013 referenced_by 加 F-006/ADR-06；F-006 referenced_by 加 ADR-06；ADR-06 referenced_by 加 F-006）；latest.md Zone A 更新
- **卡關**：無
- **下次優先**：主代理執行 `openspec archive userprofile-auth-metadata-sync`

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

<!-- pre-check-log-start -->
### [Step 0 pre-check] 專案目錄清理整理 (2026-06-03)
Tier: grep
命中：2 筆（REF-007 純UI/架構清理、REF-009 session structure）— 均為無關命中
使用者選擇：直接 inline 分析（無需外部搜尋，問題在本地目錄結構）

問題摘要：
- 根目錄（D:\Overwatch專案\）有 Claude工作區/ + 雜散 html/md
- overwatch-social/ 內有 src_backup_default(440KB)、196KB log、28個 openspec archive、13份報告、_drafts 草稿、rsx-bak 備份
- .gitignore 未涵蓋 log/cache/test-results/playwright-report
<!-- pre-check-log-end -->

<!-- pre-check-log-start -->
### [Step 0 pre-check] 近期 change 分析 + 未來方向規劃 (2026-06-03)
Tier: grep
命中：3 筆（REF-013 display_name 跨裝置、REF-014 Vercel env、REF-016 browse 品質/假卡）
使用者選擇：(c) 兩者都做（本地材料 + 外部搜尋）
<!-- pre-check-log-end -->

<!-- pre-check-log-start -->
### [Step 0 pre-check] 全域暱稱 user identity dev console redesign (2026-06-04)
Tier: grep
命中：2 筆部分相關（ADR-16 display_name dual-write；F-016 display_name 缺陷）— 無直接命中「global nickname as ID」或「dev console user listing」
使用者選擇：(a) 繼續 inline 探索（無需外部搜尋，需求明確為架構設計）
待 propose change：user-identity-global-nickname + dev-console-user-listing
<!-- pre-check-log-end -->

<!-- pre-check-log-start -->
### [Step 0 pre-check] unique constraint user_id game one card per user (2026-06-04)
Tier: grep
命中：0 筆
使用者選擇：(a) 繼續外部搜尋（直接跳到 codebase 探索）
<!-- pre-check-log-end -->

<!-- archive-log-start -->
### [ARCHIVE] one-card-per-game-constraint (2026-06-04)
- Migration 014: profiles id UUID PK + UNIQUE(user_id,game)
- Finding: F-022（PK 換代理鍵零中斷）
- ADR: ADR-21（代理鍵 + 複合 unique 設計決策）
- Pre-archive Gate: PASS（FAIL=0, WARN=0）
- 歸檔路徑: openspec/changes/archive/2026-06-04-one-card-per-game-constraint/
<!-- archive-log-end -->

<!-- pre-check-log-start -->
### [Step 0 pre-check] UI 視覺重設計技能選型 (2026-06-12)
Tier: RAG
命中：5 筆（REF-023, REF-018, REF-006, REF-015, REF-003）但相似度皆 ≤ 0.20，與「設計 skill 選型」主題無直接相關 → 視同本地無命中（不視為錯誤態）
使用者選擇：(c) 自動（弱命中直接外部搜尋）
<!-- pre-check-log-end -->

### [§1.3 council 後續] 被排除 skill 描述確認（2026-06-12，主代理本地解決）
Codex 補搜項「actual skill descriptions for excluded candidates」已由 session skill registry 官方描述確認，文獻空白解除：
- **theme-factory**：「Toolkit for styling artifacts with a theme（slides/docs/reports/HTML landing pages）；10 套預設 theme + on-the-fly 生成」→ 確認為 artifact 換膚工具，不輸出可整合進 Next.js codebase 的程式碼。排除成立；但可作為「調色盤/字型靈感產生器」次要輔助。
- **canvas-design**：「Create beautiful visual art in .png/.pdf documents（poster/art/static piece）」→ 靜態視覺產出，與互動式 web UI 無關。排除成立。
- **web-artifacts-builder**：「creating elaborate multi-component claude.ai HTML artifacts」→ 綁定 claude.ai artifact 平台。排除成立。
結論：frontend-design 為唯一適合整站程式碼級重設計的 skill，排除推定升級為文件確認。

### [APPLY 收尾] add-standalone-theme-style（2026-06-12）
**最終採用**：token 地基（377 處 + 品牌色 130+ 處變數化、回歸 0.002%）+ 主題基礎建設（ThemeContext 白名單/持久化、ThemeSwitcher 元件存在未掛載）。**否決**：三套原型主題（neon 驗收過但不採用；magazine 未過 F-029；arcade 一併不採用），CSS 已移除、git 歷史保留。
**驗證**：tsc PASS、build PASS、E2E 36/36、最終外觀與原始基準 0.002%。
**Finding**：F-028（掃描校準）、F-029（亮底 negative result）。CLAUDE.md 已更新（affects_consumers 對齊）。

<!-- pre-check-log-start -->
### [Step 0 pre-check] 文字超出框框/換行 全站防護 (2026-06-13)
Tier: RAG → grep fallback
RAG 命中：5 筆但相似度全 ≤ 0.29（REF-036/033/017/028/029），主題不相關，視同無命中（非錯誤態）
Grep 命中：.rsx/knowledge/ + findings/ + decisions/ 內無 REF/Finding 命中（21 個 .rsx/codex_runs/*.jsonl 屬 log 噪音、非實質命中）
git log 補充線索（不算 §1.0 命中，列為已知 baseline pattern）：
- bc51844（PR #21, 2026-06-13）標籤過長修法 — whitespace-nowrap + max-w-full，涵蓋 OWCard / ProfileClient 預覽卡 / 標籤按鈕 / Dev console UserCardDetail 四處
- d27116c 移除展示館卡片誤加的 max-w-[340px] 寬度限制
使用者選擇：依 §1.0「命中 = 0 不詢問直接進 §1.1」執行
任務 scope：「不只標籤，需要全面檢查」→ 派 rsx-explorer sub-agent 走 (A) context 隔離路徑
<!-- pre-check-log-end -->

### 2026-06-13 全站文字溢出 EXPLORE 完成（待主代理整合）

- **已完成**：派 rsx-explorer 全站掃描 12 個元件 + L2 外部搜尋 5 個來源；建 REF-038（type=technique，CJK 長文字溢出全站防護 pattern + Tailwind v4 utility 對照 + iOS Safari 15.4+ 支援邊界 + Gemini UX caveats）；§1.3 council Codex ‖ Gemini 並行完成
- **§1.3 council verdict**：SPLIT → 主代理裁決 **PASS-WITH-ADJUSTMENTS**
  - Codex (6/10)：NEEDS_MORE_SEARCH — 漏 3 個 dev console errorMsg 路徑、補 iOS Safari 15.4+ caveat、建議拆 ADR + 補 Card REF
  - Gemini (8/10) **TRANSPORT-DEGRADED**（agy oauth token 過期，agent 自己 fallback 審查）：PASS — 升 R-08/R-06 為 P0、補 320px/scrollbar/overflow-x:clip viewport 角度
  - 主代理裁決：搜尋角度兩邊補強都不是「方向錯誤」級別，不回 §1.1 補搜；直接整合進風險清單
- **最終風險清單**：7 個 P0（R-04 OWCard UID Box、R-08 LotusWelcomeWidget 公告、R-01/R-02/R-03 player/[id]、R-05 CosmicLivePreviewCard、R-06 UserCardDetail display_name）+ 2 個 P1（R-07 message、R-09 揪團）+ 5 個 P2（dev console 3 errorMsg、layout overflow-x:clip、TopBar/OWCard languages 已正確）
- **Exit Criteria**：(1) council ✅（SPLIT 已記錄）(2) REF 數 ❌（1/3 < min_refs_per_propose）(3) crossref ✅ (4) latest.md ✅
- **REF 數 gap 處置**：待 user 裁決 — (a) 補拆 REF-039 (iOS Safari docs) + REF-040 (shadcn Card 約定) 補到 3 個跑 L2 full rsx propose / (b) 視為 §2.0 L1 lean change 例外（單一 cross-cutting CSS pattern，跨檔但無架構決策）/ (c) 跳流程直接修
- **卡關**：無
- **下次優先**：等 user 選擇 (a)/(b)/(c) → 進 PROPOSE 或直接 apply
<!-- council-verdict-2026-06-13 -->
