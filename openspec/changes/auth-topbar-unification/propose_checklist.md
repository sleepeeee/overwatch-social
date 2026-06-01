# Propose Checklist: auth-topbar-unification

**日期**：2026-06-02  
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** 既有問題識別：REF-002（mock user bug）、REF-003（模擬開關）
- [x] **0.2** 弱點重要性：影響真實用戶登入後無法存資料（P0 功能 bug）
- [x] **0.3** Why now：平台已部署 Vercel，真實用戶即將使用
- [ ] **0.4** [SKIP] `codex_dispatch.py --moment-id 6.1`：此為純前端 bug 修復，無研究假設需驗證；`codex_dispatch.py` 的 Stage0 template 設計用於學術/算法 why-now 分析，不適用本 change。見跳過記錄表。
- [x] **0.5** 先例缺口定位：最近鄰 = REF-001（page.tsx TopBar 基準）；本 change 空白 = REF-001 的 pattern 尚未套用到 browse 和 profile 頁
- [x] **0.6** blast-radius scan：不觸發（此 change 不涉及 SOP / schema / shared scripts）

## §2.2 Stage 1 — 情報蒐集

- [x] **1.1** 技術選擇列舉：D1（TopBar 元件策略）、D2（mock user 修復）、D3（logout redirect）、D4（browse isLoggedIn 策略）
- [x] **1.2** 並行分析（codebase L1 掃描，主代理 inline）
- [x] **1.3** ≥ 3 REF 建立：REF-001, REF-002, REF-003 ✓
- [x] **1.4** crossref 填寫：REF-002/REF-003 references_to REF-001 ✓
- [x] **1.5** L1 → L2 順序：L1 codebase 掃描 → 無需 L2 外部搜尋（純 codebase 問題）
- [x] **1.6** 搜到即建 REF：已完成

## §2.3 Stage 2 — 假設修正

- [x] **2.1** 假設確認：mock user 是根本原因，無需 reframe
- [x] **2.2** 目標確認：「修復 auth 守門 + 統一 TopBar UI」，不是「驗證假設」
- [x] **2.3** Negative result：不適用（工程修復，無 negative result 概念）
- [x] **2.4** 詮釋框架：所有 REQ 通過 = change 成功；LoginModal 在未登入時觸發 = 核心驗收
- [x] **2.5** novelty claim：此 change 無 novelty claim（純 bug 修復）；不適用可偽證性審查

## §2.4 Stage 3 — 設計起草

- [x] **3.1** proposal.md ✓
- [x] **3.2** design.md ✓（含 D1-D4 決策 + Risks/Trade-offs）
- [x] **3.3** spec.md ✓（REQ-01~09，含 Scenario + WHEN/THEN）
- [x] **3.4** tasks.md ✓（Task 1-5 分階段）
- [x] **3.5** Dataset Card：不觸發（無 training/CNN/model/dataset 觸發詞）
- [x] **3.6** 詮釋框架：寫入 design.md
- [x] **3.7** 具體數字：authLoading 初始值 true/false 均有 §D2 說明依據
- [x] **3.8** rationale 表：design.md 末尾 ✓

## §2.5 Stage 4 — 多面向自審

選用 audit：
- [x] `assumption_evidence_audit`（inline）：假設「移除 mock user 即可修復 LoginModal」→ 驗證：LoginModal show 條件 `isMounted && !authLoading && !user`，三個條件均需為 true。移除 mock + authLoading 初始 true → 邏輯完整 ✓
- [x] `method_completeness_audit`（inline）：有無漏掉的頁面？檢查 FloatingDock 的 navItems → `/`、`/browse`、`/profile` 三個。均已覆蓋 ✓。developer 路由 `/developer` 不在 FloatingDock，不需統一 TopBar。
- [ ] **Codex 路徑 audit**：[SKIP] 見跳過記錄表

**Stage 4 整合疑慮**：
- M1（輕微）：TopBar 自帶 user state，若頁面本身也有 user state 會有兩個 Supabase 訂閱。→ Task 2 需注意 page.tsx 移除舊 user state。
- M2（輕微）：profile 頁 authLoading 邏輯需仔細驗證閃爍行為。→ Task 4 明確記錄初始值 true。

## §2.6 Stage 5 — 補搜強化

- [x] **5.1** 補搜：Stage 4 無嚴重缺口，不需補搜
- [x] **5.2** 反例：無強假設，不需反例
- [x] **5.3** 弱證據強化：所有依據均來自 codebase 直接分析，不需外部來源
- [x] **5.4** 補搜 REF：不需要

## §2.7 Stage 6 — 第二意見

- [ ] **6.1** [SKIP] Codex / Gemini adversarial_review：見跳過記錄表
- [x] **6.2** 嚴重疑慮：M1/M2（已在 tasks 中處理）
- [x] **6.3** 評估通過：此為 bug 修復，設計直接，主代理自評 8/10
- [x] **6.4** 修正記錄：authLoading 初始值 true（避免閃爍）已加入 spec + tasks

## §2.8 Stage 7 — Validate

- [x] **7.1** artifacts 結構完整（proposal / design / spec / tasks）
- [x] **7.2** spec / design / tasks 一致性確認：Task 4 authLoading 初始 true 對應 spec REQ-09 ✓
- [x] **7.3** 第一個 task（Task 1）是獨立可驗收的最小單元 ✓
- [x] **7.4** wall-clock < 1 hr，不觸發 Smoke Test
- [x] **7.5** delta scope 確認：4 個文件變更（TopBar.tsx 新增 + 3 個頁面修改）

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| §2.1 0.4 Stage0 Codex dispatch | 此 change 為純前端 auth bug 修復，無研究假設；`stage0_why_now` template 設計用於學術/算法 why-now 分析，對工程 bug fix 不適用 | 低：動機已清楚記錄，非研究不確定性 | 如需正式記錄，可事後跑 codex_review_audit 針對 tasks 品質審查 |
| §2.5 Stage4 Codex 路徑 audit | 同上；change 範圍清晰（4 個文件），無算法或架構不確定性 | 低：inline self-audit 已覆蓋主要疑慮 M1/M2 | apply 完成後可跑 `/rsx:verify` 確認 |
| §2.7 Stage6 Codex/Gemini adversarial | 同上 | 低 | 同上 |
