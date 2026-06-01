# Propose Checklist: developer-console-enhancements

**日期**：2026-06-02
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** 弱點識別：REF-005 列出 5 個功能空白（概覽數字少、無用戶管理、無英雄統計等）
- [x] **0.2** 重要性：平台上線後需要基本運營工具
- [x] **0.3** Why now：auth 系統穩定後的自然延伸；DB migration 為純加法；即將有真實用戶
- [ ] **0.4** [SKIP] `codex_dispatch.py`：純前端 + DB additive change，同前次 skip 理由
- [x] **0.5** 先例缺口：REF-005（功能空白）+ REF-006（RLS pattern）；gap = 用戶統計 + 管理 UI 實作
- [x] **0.6** blast-radius：profiles RLS 新增 SELECT policy 為 OR 邏輯（不修改現有 policy），一般用戶行為不受影響

## §2.2 Stage 1 — 情報蒐集

- [x] **1.1** 技術選擇：D1（RLS policy）、D2（hero stats 聚合）、D3（on-demand loading）、D4（欄位過濾）、D5（props 最小化）
- [x] **1.2** L1 + L2 codebase 分析
- [x] **1.3** ≥ 3 REF：REF-005, REF-006 ✓（2 個 + 現有 REF-001~004）
- [x] **1.4** crossref：REF-006 references_to REF-005 ✓
- [x] **1.5** L1 → L2 順序 ✓
- [x] **1.6** REF 搜到即建 ✓

## §2.3 Stage 2 — 假設修正

- [x] **2.1** 關鍵假設：`auth.jwt() -> 'app_metadata' ->> 'role'` 語法正確 → REF-006 驗證 ✓
- [x] **2.2** 目標：「運營管理能力 MVP」，不是「完整後台系統」
- [x] **2.3** Negative result：不適用
- [x] **2.4** 詮釋框架：build 通過 + hero stats 顯示 + users tab on-demand 載入 = change 成功
- [x] **2.5** novelty claim：無

## §2.4 Stage 3 — 設計起草

- [x] **3.1** proposal.md ✓
- [x] **3.2** design.md ✓（含 D1-D5，Gemini C2 修正後的 on-demand loading）
- [x] **3.3** spec.md ✓（3 REQ，含 Scenario）
- [x] **3.4** tasks.md ✓（Task 1-5）
- [x] **3.5** Dataset Card：不觸發
- [x] **3.6** 詮釋框架 ✓
- [x] **3.7** 具體數字：`LIMIT 100` 在 getAllProfilesForDeveloper 中，有設計依據（D3）
- [x] **3.8** rationale 表：design.md 末尾 ✓

## §2.5 Stage 4 — 多面向自審

- [x] `assumption_evidence_audit`：關鍵假設「RLS OR policy 不影響一般用戶」→ 邏輯驗證：OR 新增開發者條件，`auth.uid() = user_id` 仍保留，一般用戶行為不變 ✓
- [x] `method_completeness_audit`：有無漏掉的功能？Feature Flags、系統公告 → 刻意排除（Non-Goals）✓
- [ ] Codex 路徑：[SKIP]

**疑慮**：
- M1（輕微）：`getHeroStats()` 查所有 profiles.selected_heroes，資料量大時效能。已在設計文件記錄為 known limitation，未來可遷移到 DB RPC。
- M2（輕微）：selected_heroes null safety → 已在 Task 4 明確要求 `(p.selected_heroes ?? []).length`

## §2.6 Stage 5 — 補搜

- [x] M1/M2 疑慮已在 tasks 處理，無需補搜

## §2.7 Stage 6 — 第二意見

- [x] Gemini 審查已執行（後台派）
- [x] **Gemini 初始評分：4/10**（3 Critical）
- [x] **Critical 分析**：
  - C1（Data exposure）：已在 D4 處理（select 只取安全欄位）
  - C2（DOM exhaustion）：**已修正**→ users tab 改為 on-demand loading（D3 修訂）
  - C3（SQL syntax）：**誤判** → 我的 spec 已有正確 single quotes 語法
- [x] **修正後預估：7.5/10**（C1/C3 原本已正確，C2 修正後主要疑慮消除）
- [x] Major M1/M2：已在設計文件和 tasks 中記錄處理方式

## §2.8 Stage 7 — Validate

- [x] 4 artifacts 完整
- [x] spec/design/tasks 一致性：Task 4 on-demand loading ↔ design D3 ✓
- [x] Task 1（migration）是最小可驗收單元
- [ ] wall-clock 70 min，輕觸 §3.3 threshold（> 60 min），**Smoke test**：確認 migration 004 不破壞現有 getMyProfile() 和 getSystemStats()
- [x] delta scope：migration 1 個 + server actions 2 個 + page.tsx + DeveloperConsoleClient

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| §2.1 0.4 Stage0 Codex | 純前端 + DB additive change，無研究假設 | 低 | apply 後 /rsx:verify |
| §2.5 Stage4 Codex 路徑 | 同上 | 低 | 同上 |
| §2.7 Stage6 Codex | 同上，Gemini 為主審 | 低 | 同上 |

## §6.3 Gemini 評分 < 7 處置記錄

Gemini 初始評分 4/10。分析：
- C1（已有對策，非新問題）
- C2（有效建議，已修正設計）
- C3（誤判，SQL 語法已正確）

修正後評估 ≥ 7，選擇「**A. 修正設計繼續**」：D3 改為 on-demand loading，已更新 design.md + tasks.md。
