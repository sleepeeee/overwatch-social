# Propose Checklist: auth-context-refactor

**日期**：2026-06-02
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** 既有弱點識別：ADR-02（架構 debt）、F-001（auth state 分散）
- [x] **0.2** 重要性：3-4 個並行訂閱、路由切換重建、auth loading 不一致
- [x] **0.3** Why now：auth-topbar-unification 已上線提供乾淨基線；Gemini §6.7 明確要求（Major）；ADR-02 正式要求此 change
- [ ] **0.4** [SKIP] `codex_dispatch.py`：純前端架構重構，與上次相同理由（見跳過記錄表）
- [x] **0.5** 先例缺口：最近鄰 REF-001 + ADR-02；gap = AuthContext 在 App Router 的實作（REF-004 補上）
- [x] **0.6** blast-radius scan：不觸發（無 SOP/schema 變更）

## §2.2 Stage 1 — 情報蒐集

- [x] **1.1** 技術選擇：D1（AuthProvider 位置）、D2（Context 形狀）、D3（profile 載入改法）、D4（browse 簡化）、D5（TopBar 簡化）、D6（LoginModal 條件）
- [x] **1.2** 並行分析（codebase L1 掃描）
- [x] **1.3** ≥ 3 REF：REF-001, REF-004, F-001, ADR-02 ✓（4 個）
- [x] **1.4** crossref：REF-004 references_to REF-001/ADR-02 ✓
- [x] **1.5** L1 → L2：L1 codebase + REF-004（純 codebase 問題，無需 L2）
- [x] **1.6** 搜到即建 REF：REF-004 已建

## §2.3 Stage 2 — 假設修正

- [x] **2.1** 關鍵假設確認：「layout.tsx（Server Component）可以 render Client Component AuthProvider」→ REF-004 確認 ✓
- [x] **2.2** 目標確認：「架構重構，消除多重訂閱」
- [x] **2.3** Negative result：不適用
- [x] **2.4** 詮釋框架：所有 REQ 通過 + build 無錯誤 = change 成功
- [x] **2.5** novelty claim：無（架構遷移，無新意主張）

## §2.4 Stage 3 — 設計起草

- [x] **3.1** proposal.md ✓
- [x] **3.2** design.md ✓（含 D1-D6 + rationale 表）
- [x] **3.3** spec.md ✓（REQ-01~08）
- [x] **3.4** tasks.md ✓（Task 1-6）
- [x] **3.5** Dataset Card：不觸發
- [x] **3.6** 詮釋框架：design.md ✓
- [x] **3.7** 具體數字：1 個訂閱（有 REF-004 先例支持）
- [x] **3.8** rationale 表：design.md 末尾 ✓

## §2.5 Stage 4 — 多面向自審（inline）

- [x] `assumption_evidence_audit`：關鍵假設「Server Component 可 render Client AuthProvider」→ REF-004 確認，Next.js 官方支援 ✓
- [x] `method_completeness_audit`：有無漏掉的元件？FloatingDock（layout 層，不需要 auth）、DevModeBanner（Server Component，不需要 auth）、developer/page.tsx（Server-side redirect，不用 Context）→ 均不需要修改 ✓

**Stage 4 疑慮**：
- M1（輕微）：profile 頁的 isMounted 骨架屏需謹慎替換—原本依賴 isMounted=true 觸發，現在改為 authLoading=false 觸發，需確認骨架屏出現時機不變
- M2（輕微）：profile 資料載入 useEffect 依賴 `user?.id`，若 AuthProvider 初始化期間 user 從 null → User 變化兩次（getUser 先，onAuthStateChange 後），需確認只觸發一次 getMyProfile()
- [ ] **Codex 路徑 audit**：[SKIP]（見跳過記錄表）

## §2.6 Stage 5 — 補搜強化

- [x] **5.1** M1/M2 已在 tasks 中明確處理
- [x] **5.2~5.4** 無強假設需反例；REF-004 已記錄足夠依據

## §2.7 Stage 6 — 第二意見

- [ ] **6.1** [SKIP] Codex dispatch：見跳過記錄表
- [x] **6.1** Gemini adversarial review：已派（結果整合後補填）
- [x] **6.3** 主代理自評：8/10（架構清晰，REF-004 完整支撐，疑慮 M1/M2 已在 tasks 處理）

## §2.8 Stage 7 — Validate

- [x] **7.1** 4 artifacts 完整
- [x] **7.2** spec/design/tasks 一致性：Task 4 isMounted 移除 ↔ REQ-08 ✓；LoginModal 條件 ↔ REQ-06 ✓
- [x] **7.3** Task 1（AuthContext）是最小可驗收單元 ✓
- [x] **7.4** wall-clock < 1 hr，不觸發 Smoke Test
- [x] **7.5** delta scope：1 新檔 + 4 修改

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| §2.1 0.4 Stage0 Codex | 純前端架構重構，無研究假設；同 auth-topbar-unification 的 skip 理由 | 低 | apply 完成後跑 /rsx:verify |
| §2.5 Stage4 Codex 路徑 | 同上 | 低 | 同上 |
| §2.7 Stage6 Codex | 同上 | 低；Gemini 為主審 | 同上 |
