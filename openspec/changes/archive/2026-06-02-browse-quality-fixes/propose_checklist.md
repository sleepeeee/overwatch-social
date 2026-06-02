# Propose Checklist: browse-quality-fixes

**日期**：2026-06-02
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** REF-007 識別 4 個品質問題（P0/P1）
- [x] **0.2** 重要性：假資料損害用戶信任，dead code 增加維護負擔
- [x] **0.3** Why now：測試名片已存入 DB，真假資料並存更清楚說明問題嚴重性
- [ ] **0.4** [SKIP] `codex_dispatch.py`：純 UI 清理，無研究假設
- [x] **0.5** 先例缺口：REF-007（審計）→ 本 change 針對空白 = 品質修復實作
- [x] **0.6** blast-radius：不觸發（無 SOP/schema 變更）

## §2.2 Stage 1 — 情報蒐集

- [x] **1.1** 技術選擇：D1（coming-soon UI）、D2（delete）、D3（mock indicator）、D4（useAuth）
- [x] **1.2** L1 分析（REF-007 完整覆蓋）
- [x] **1.3** ≥ 3 REF：REF-007, REF-001, REF-003 ✓
- [x] **1.4** crossref 填寫 ✓
- [x] **1.5** L1 優先，無需 L2
- [x] **1.6** REF-007 已建

## §2.3 Stage 2 — 假設修正

- [x] **2.1** 假設確認：grep 驗證 Navbar/AppSidebar 無 import ✓
- [x] **2.2** 目標：「誠實呈現」不是「隱藏功能路線圖」
- [x] **2.5** novelty claim：無

## §2.4 Stage 3 — 設計起草

- [x] **3.1** proposal.md ✓
- [x] **3.2** design.md ✓（D1-D4）
- [x] **3.3** spec.md ✓（2 REQ + Scenarios）
- [x] **3.4** tasks.md ✓（Task 1-6）
- [x] **3.5** Dataset Card：不觸發
- [x] **3.8** rationale 表：design.md ✓

## §2.5 Stage 4 — 多面向自審

- [x] `assumption_evidence_audit`：「Navbar/AppSidebar 無 import」→ grep 直接驗證 ✓
- [x] `method_completeness_audit`：有無漏掉的問題？問題 3/5/7 刻意不含（不同 change）✓
- [ ] Codex 路徑：[SKIP]

**疑慮（已在設計中處理）**：
- M1（Gemini）：移除假資料後孤兒 imports → Task 1/2 明確要求審查清除
- M2（Gemini）：`isShowingMockData` 初始值確認為 false → D3 設計明確
- Minor（Gemini）：useDevMode dev bypass 可選擇性改進 → 納入 Task 5 說明

## §2.6 Stage 5 — 補搜

- [x] 無新補搜需求

## §2.7 Stage 6 — 第二意見

- [x] Gemini 審查：**7.5/10**（PASS）
- [x] 2 Major 已在設計中處理（不需修改 spec）
- [x] Minor 已納入 Task 5 說明

## §2.8 Stage 7 — Validate

- [x] `openspec validate browse-quality-fixes --strict` → PASS
- [x] 4 artifacts 完整
- [x] spec/design/tasks 一致性確認
- [x] Task 1 最小可驗收單元 ✓

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險 | 補救 |
|---|---|---|---|
| §2.1 0.4 Stage0 Codex | 純 UI 清理，無研究假設 | 低 | apply 後 /rsx:verify |
| §2.5 Stage4 Codex 路徑 | 同上 | 低 | 同上 |
| §2.7 Stage6 Codex | 同上；Gemini 7.5/10 PASS | 低 | 同上 |
