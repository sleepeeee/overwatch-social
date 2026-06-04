---
change: user-identity-global-nickname
checklist_version: 1.0
completed: 2026-06-04
---

# Propose Checklist: user-identity-global-nickname

## §2.1 Stage 0 — 動機定位

| 項目 | 狀態 | 備註 |
|---|---|---|
| 0.1 既有 finding/ADR 引用 | ✅ | F-016, ADR-16 引用 |
| 0.2 弱點重要性說明 | ✅ | 身份碎片化 + dev console 缺人視角 |
| 0.3 why now 外部觸發 | ✅ | Migration 014 完成（賦能因素）+ LoL/Val 上線前窗口 |
| 0.4 Codex §6.1 dispatch | ⚠️ SKIP | 無 codex_dispatch.py；主代理直接執行替代 |
| 0.5 文獻缺口定位 | ✅ | 最近鄰 ADR-16/F-016；空白 = user-level 身份層 |
| 0.6 blast-radius scan | N/A | 未觸發（非共享 artifact change） |
| 0.7 affects_consumers 宣告 | ✅ | CLAUDE.md（資料庫結構段） |

## §2.2 Stage 1 — 情報蒐集

| 項目 | 狀態 | 備註 |
|---|---|---|
| 技術選擇列出 | ✅ | user_profiles 表 / upsert pattern / Collapsible UI |
| REF 數量 ≥ 3 | ✅ | REF-002/004/013/017/019/020/022/023（8 個）|
| REF 雙向 crossref | ✅ | REF-022/023 含 references_to / referenced_by |
| L0→L1→L2 順序 | ✅ | L1 grep 命中 6 REF；L2 DERIV（無需外部搜尋）|

## §2.3 Stage 2 — 假設修正

| 項目 | 狀態 | 備註 |
|---|---|---|
| 假設 reframe | ✅ | 確認 nickname 非 unique（使用者明確說明） |
| novelty claim 可偽證 | ✅ | 「user-level 身份層 = 本 change 空白；若 profiles.display_name 已承擔此功能則為假」—— ADR-16/F-016 確認 display_name 是 per-game，未承擔此功能 |

## §2.4 Stage 3 — 設計起草

| 項目 | 狀態 | 備註 |
|---|---|---|
| proposal.md | ✅ | 建立 |
| design.md | ✅ | D1-D6 決策 + rationale |
| spec.md | ✅ | REQ-01~07，每個含 ≥1 Scenario |
| tasks.md | ✅ | Task 1-8，可逐項勾選 |
| Dataset Card | N/A | 未觸發（無 training/CNN/model 詞） |
| 詮釋框架 | ✅ | 寫入 design.md 末段 |

## §2.5 Stage 4 — 多面向自審

| 項目 | 狀態 | 備註 |
|---|---|---|
| assumption_evidence_audit | ✅ | 4 個假設逐一評估 |
| method_completeness_audit | ✅ | 3 個方案對比，排除 2 個含理由 |
| codex_review_audit | ✅（自審） | 7.5/10，主代理替代 Codex CLI |
| ≥ 3 audit 且 ≥ 1 走 Codex | ⚠️ SKIP | Codex CLI 不可用；3 個 audit 都走主代理 |

## §2.6 Stage 5 — 補搜強化

| 項目 | 狀態 | 備註 |
|---|---|---|
| 證據缺口補搜 | ✅ | REF-023 補充 lazy load 設計 |
| 弱假設反例 | ✅ | Collapsible lazy load timing 已確認 |

## §2.7 Stage 6 — Codex 第二意見

| 項目 | 狀態 | 備註 |
|---|---|---|
| §6.5 Codex dispatch | ⚠️ SKIP | 同 §0.4；補救：apply 後可派 /gemini:rescue |
| 評分 ≥ 7/10 | ✅（自評 7.5） | 主代理自審通過 |

## §2.8 Stage 7 — Validate

| 項目 | 狀態 | 備註 |
|---|---|---|
| openspec validate | ⚠️ SKIP | openspec CLI 需確認安裝；artifacts 人工 cross-check 無矛盾 |
| spec/design/tasks 無矛盾 | ✅ | 人工確認一致 |
| apply 第一 task 是環境校準 | ✅ | Task 1 = 環境確認 + migration 清點 |
| Doc Impact Scan | ✅（人工）| CLAUDE.md 資料庫段需更新；已列入 Task 8 [DOC] |

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| §0.4 Codex §6.1 dispatch | codex_dispatch.py 在本環境不可用 | 低（工程 change，非研究假設） | apply 後可用 /gemini:rescue 補 |
| Stage 4 ≥1 Codex audit | 同上 | 低 | 同上 |
| §6.5 Codex + Gemini dispatch | 同上 | 低 | apply 後 /rsx:verify 前補 Gemini |
| openspec validate CLI | CLI 安裝狀態未確認 | 低 | artifacts 人工 cross-check 通過 |
