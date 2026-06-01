# Propose Checklist: auth-fix-and-developer-role

## §2.1 Stage 0 — 動機定位
- [x] 0.1 既有 finding / ADR / REF 中的弱點被識別且引用（`page.tsx:33` + `AppSidebar.tsx:24` alert() mock）
- [x] 0.2 弱點為何重要：登入是所有後續功能前置依賴
- [x] 0.3 why now 誠實降級為「內部排序」（無外部技術觸發，登入是後續 profile/收藏/玩家詳細頁的前置依賴）
- [x] 0.4 [MANDATORY] §6.1 Codex 真派（8/10 PROCEED）
- [x] 0.5 缺口錨定：最近鄰 REF-003，缺口 = page.tsx/AppSidebar.tsx mock 未接上
- [x] 0.6 blast-radius scan：未觸發（不涉及共享 SOP/schema/script）

## §2.2 Stage 1 — 情報蒐集
- [x] 1.1 列出技術選擇（OAuth, signOut, app_metadata, useDevMode hook, DevModeBanner）
- [x] 1.2 各選擇有 REF 依據
- [x] 1.3 REF 數量 ≥ 3（REF-002/003/004/005/006 = 5 個）
- [x] 1.4 雙向 crossref 已回填
- [x] 1.5 L1 → L2 順序遵守
- [x] 1.6 搜到當下即建 REF（REF-005, REF-006 在 EXPLORE/Stage 5 建立）

## §2.3 Stage 2 — 假設修正
- [x] 2.1 原假設修正：`Navbar` 正確但 page.tsx + AppSidebar 仍 mock
- [x] 2.2 [補搜更正] grep 全 src 發現 `Navbar`/`AppSidebar` 皆未掛載，唯一 live 入口是 page.tsx mock
- [x] 2.3 N/A（無 negative result 更有價值的情境）
- [x] 2.4 預先定義詮釋框架：Phase A/B dependency gate
- [x] 2.5 novelty claim 可偽證：本 change 新意 = 首次讓 live 登入入口（page.tsx）接上真實 OAuth；此主張若 page.tsx alert() 已被替換為 signInWithOAuth 則為假

## §2.4 Stage 3 — 設計起草
- [x] 3.1 proposal.md（含 Phase A/B scope gate）
- [x] 3.2 design.md（含 D1-D5 決策 + 六方案角色比較 + Risks 表）
- [x] 3.3 specs/auth/spec.md（5 scenarios，WHEN/THEN/AND）
- [x] 3.4 tasks.md（Phase A Task 0-2 + Phase B Task 3-7）
- [x] 3.5 Dataset Card：未觸發（無 training/CNN/model/dataset/patch/image/preprocessing）
- [x] 3.6 預先詮釋框架：Phase A/B gate 寫入 design.md
- [x] 3.7 具體數字依據（Task 5 COALESCE 防 null）
- [x] 3.8 rationale 表（design.md D1-D5 各含技術選擇 ↔ REF 對照）

## §2.5 Stage 4 — 多面向自審（3 audits，≥1 Codex）
- [x] assumption_evidence_audit（Claude 路徑）：app_metadata 不可偽造假設審查
- [x] method_completeness_audit（**Codex 路徑 ✓**）：角色方案完整性，8/10 PROCEED
- [x] adversarial_review（**Codex 路徑 ✓**）：整體 proposal，6/10 CONDITIONAL → M1-M5 折回 artifacts

## §2.6 Stage 5 — 補搜強化
- [x] 5.1 Stage 4 缺口補搜（dev-mode UI hydration pattern）
- [x] 5.2 反例搜尋（user_metadata 明確排除）
- [x] 5.3 弱證據強化（六方案比較表）
- [x] 5.4 補搜資料建 REF-006 + 雙向引用

## §2.7 Stage 6 — Codex 第二意見
- [x] 6.1 **[MANDATORY] §6.5 Codex 真派：adversarial_review，CONDITIONAL 6/10**（M1-M5 已修補，修補後初步通過）
- [x] 6.2 Codex 嚴重疑慮（M1 false-green, M2 scope creep, M3 掛載拓撲, M4 六方案, M5 措辭）已全部修正
- [x] 6.3 修補後達門檻（原始 6/10 → 修補後 PROCEED）
- [ ] 6.4 可選：修補後再跑一次確認審查（時程允許）

## §2.8 Stage 7 — Validate + Apply 前
- [ ] 7.1 `openspec validate auth-fix-and-developer-role --strict`（待執行）
- [ ] 7.2 spec / design / tasks 矛盾檢查（人工確認通過）
- [x] 7.3 apply 第一個 task = Task 0 環境校準
- [x] 7.4 smoke test：N/A（無 wall-clock > 1hr 任務）
- [ ] 7.5 `openspec change show auth-fix-and-developer-role --json --deltas-only`（待執行）

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Gemini §6.1/§6.5 第二意見 | `gemini` CLI 不在 PATH，無 dispatch script | Council 少一視角，單一外部 reviewer | Codex 3 次真派已涵蓋多角度；可事後補 Gemini review |
| spec Scenario 2（sidebar 登出）live 驗收 | AppSidebar 未掛載（grep 全 src 確認），無 live 觸發路徑 | latent 修復無法機械驗收；勾選可能 false-green | apply Task 2.3 明確決策：掛載 or 記跳過表 |
| Codex §6.5 adversarial 原始 6/10 | M1-M5 已全部折回 artifacts，修補後達 PROCEED 門檻 | 未做第二次 Codex 確認審查（7.4 optional） | 可在 apply 前自行跑 `/rsx:codex` 確認 |

---

## Codex Dispatch 記錄（4 欄位）

| moment_id | dispatch_tool | output_excerpt | verdict |
|---|---|---|---|
| §6.1（why-now）| codex_dispatch.py session 019e825d | 「Why-now 基本成立，但屬內部排序而非領域窗口…登入是所有後續功能前置依賴…疑問：Dashboard 手動設定是否需驗收+回滾」| **PROCEED 8/10** |
| §6.5（method completeness）| codex_dispatch.py session 019e825f | 「完整性有遺漏。應補 P1 profiles.role+RLS、P2 Auth Hook、P3 IdP group mapping 的明確排除；app_metadata「不暴露」措辭需修正（登入者可讀，只是不可偽造）；user_metadata 排除充分」| **PROCEED 8/10** |
| §6.5（adversarial review）| codex_dispatch.py session 019e825f-alt | 「Critical: Dashboard app_metadata 設定有 false-green 洞口、缺 rollback/驗證；Major: mock 修復與 role 綁一起 scope creep，需 dependency gate；AppSidebar useRouter 假設未機械化」→ M1-M5 折回 artifacts | **CONDITIONAL 6/10（修補後 PROCEED）** |
| §6.1 Gemini | — | GEMINI_UNAVAILABLE（CLI 不在 PATH）| 軟降級，依 Codex 處置 |
