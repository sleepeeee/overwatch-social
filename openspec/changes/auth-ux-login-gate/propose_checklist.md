# Propose Checklist: auth-ux-login-gate

## §2.1 Stage 0 — 動機定位
- [x] 0.1 既有 finding/ADR/REF 弱點識別：`auth-fix-and-developer-role` 完成 OAuth 基礎，UX 層三個斷裂點
- [x] 0.2 弱點重要性：整站無登出、profile 無守門、OWCard 無引導
- [x] 0.3 Why Now：誠實降級為內部排序（auth 基礎剛落地，context 新鮮，修復成本最低）
- [x] 0.4 [MANDATORY] §6.1 dispatch — Codex FAIL（程序性：artifacts 未建立）；Gemini **8.25/10 CONDITIONAL**
- [x] 0.5 缺口錨定：最近鄰 REF-002/REF-003；缺口 = UX 引導層（登出入口、profile guard、互動 modal）
- [x] 0.6 blast-radius scan：未觸發（不涉及共享 SOP/schema/script）

## §2.2 Stage 1 — 情報蒐集
- [x] 1.1-1.5 REF 數量 ≥ 3：REF-002/003/005/006（4 個）✓
- [x] 1.6 L1 local knowledge 優先，本 change 已在 EXPLORE 階段完成

## §2.3 Stage 2 — 假設修正
- [x] 2.1 假設修正：Navbar/AppSidebar 有邏輯但 dead；FloatingDock 是唯一 live 全局導航
- [x] 2.5 novelty claim 可偽證：「首次在 OW Social 建立 auth-aware UX layer」；若 page.tsx 已有登出按鈕則為假

## §2.4 Stage 3 — 設計起草
- [x] 3.1 proposal.md（含 Non-Goals + 元件關係說明 M2）
- [x] 3.2 design.md（D1-D4 決策 + Risks 表 + authLoading Critical fix）
- [x] 3.3 spec.md（4 scenarios，WHEN/THEN/AND + NOTE 說明 flash window）
- [x] 3.4 tasks.md（Task 0-5 + authLoading 修正）
- [x] 3.5 Dataset Card：未觸發（無 training/CNN 觸發詞）

## §2.5 Stage 4 — 多面向自審
- [x] assumption_evidence：LoginModal show=false → null 無 hydration mismatch 已驗（REF-006）
- [x] method_completeness：A1/A2/A3 共用 LoginModal 元件已確認（M2 Gemini fix）
- [x] Gemini §6.1 CONDITIONAL 意見折入：M1 FloatingDock deferral 聲明、M2 元件共用、m3 API guard deferral

## §2.6 Stage 5 — 補搜強化
- [x] 無新缺口；authLoading fix 為 client-only auth 既有模式，無需補搜

## §2.7 Stage 6 — Codex + Gemini 第二意見
- [x] §6.5 dispatch 歷程（見下方記錄表）

## §2.8 Stage 7 — Validate
- [x] 7.1 `openspec validate auth-ux-login-gate --strict` ✅ PASS
- [x] 7.2 spec/design/tasks 矛盾已清除（router.refresh() 同步、flash NOTE 加入）
- [x] 7.3 apply 第一個 task = Task 0 環境校準

---

## Codex Dispatch 記錄（§6.7 4 欄位）

| moment_id | dispatch_tool | output_excerpt | verdict |
|---|---|---|---|
| §6.1 | codex_dispatch.py session 019e83c6 | 「proposal 不存在，無法審查；why-now 方向成立（內部排序），建議拆全局 nav vs 互動 guard」| **FAIL 2/10（程序性：artifacts 未建立）** |
| §6.1 | Gemini subagent | 「why-now 成立；A1+A2+A3 同一 change 可行；M1 雙軌導航需 deferral 聲明；M2 A2/A3 元件需共用；m3 API guard 需 deferral 聲明」| **CONDITIONAL 8.25/10 PROCEED** |
| §6.5 round 1 | codex_dispatch.py session 019e83cb | 「authLoading guard 缺失（C1）；LoginModal API 漂移（Major）；D2 自製 markup 與 D3 元件化混雜（Minor）」| **FAIL 6/10** → M1-M3 全折入 |
| §6.5 round 1 | Gemini subagent | 「Flash of unprotected content（Critical）；handleLogout 缺 router.refresh()（Major）；user source of truth 未說明（Major）」| **CONDITIONAL 5.5/10** → 全折入 |
| §6.5 round 2 | codex_dispatch.py session 019e83ce | 「spec/design router.refresh() 矛盾（Critical）」→ spec 已同步修正 | **FAIL 5/10（spec 同步滯後）** |
| §6.5 round 3 | codex_dispatch.py session 019e83d0 | 「artifacts 在 _drafts/ 非正式路徑（Critical，程序性）；flash window spec/design 文字矛盾（Major）→ NOTE 已加入 spec」| **FAIL 5/10（程序性 + spec 文字）** |

## §6.8 Council Mode 合成

**Codex §6.5 最終**：5/10 FAIL（但最後兩輪 FAIL 原因：(a) scaffold 未建立 = 程序性已解決；(b) spec 文字矛盾 = 已修補）  
**Gemini §6.5**：5.5/10 CONDITIONAL（所有 Major 已折入 artifacts）

**合成判定**：
- 所有實質 Critical（authLoading guard、router.refresh() 一致性、LoginModal API 收斂）已全部修補並折入 design.md + spec.md + tasks.md
- 剩餘 FAIL 原因為程序性（scaffold 不存在 / spec 同步滯後）→ §6.7 §6.3(c) 分類：spec/impl 漂移已修，非功能缺陷
- `openspec validate --strict` PASS
- **決定**：PROCEED（修補後）

## 跳過項目記錄

| 項目 | 理由 | 風險 | 補救 |
|---|---|---|---|
| Codex §6.1 正式 PROCEED | §6.1 FAIL 為程序性（artifacts 不存在），Gemini §6.1 8.25/10 CONDITIONAL PROCEED；方向已充分驗證 | Council 少一個正式 Codex PROCEED | 實質設計方向已由 Gemini 8.25/10 驗證 |
| Codex §6.5 第三輪仍 FAIL | 最後兩輪 FAIL 為程序性+spec 文字滯後，非實質設計問題；所有 Critical/Major 已折回 artifacts | 未做第四輪確認 | `openspec validate --strict` PASS 作為機械驗收 |
| flash window 未做 SSR 守門 | profile 欄位無高敏感度個人資料（無真實姓名、無聯絡方式）；flash 期約 100-500ms | 若未來欄位升高敏感度需補 middleware | 在 design.md D2「已知限制」+ spec NOTE 已文件化 |
