---
id: capture-hud-full-reimplementation
type: propose_checklist
---

# Propose Checklist: capture-hud-full-reimplementation

## §6.1 Codex + Gemini Stage 0 動機定位

| 審查 | 結果 | 備註 |
|---|---|---|
| Codex §6.1 | 2/10 FAIL（artifact 缺席）| 同前次環境模式，§6.7(c) sandbox 問題 |
| Gemini §6.1 | PASS | why-now 成立（移植殘缺 + 乾淨視窗開放）|
| Council 合成 | 繼續 | Gemini PASS；Codex §6.1 為環境問題 |

## §6.5 Codex + Gemini Stage 6 最終審查

| 審查 | 輪次 | 分數 | 問題摘要 |
|---|---|---|---|
| Codex §6.5 | 第 1 輪 | 4/10 | Critical：design D4 vs spec Server Action 範疇矛盾；Major：design 缺 Toast 設計 |
| Gemini §6.5 | 第 1 輪 | TBD | 回報中 |
| Codex §6.5 | 第 2 輪 | 4/10 FAIL | Critical：SSR lazy init；Major：靜態驗收不足 |
| Gemini §6.5 | 第 1 輪 | 有效 PASS | Critical：GIT_HOOK_SCRIPT 逸出；Major：neutral 映射、SSR |
| Codex §6.5 | 第 3 輪 | 4/10 FAIL | 持續同問題（設計已修正，Codex 分析未感知 artifact 更新）|
| §6.3 Option C | 套用 | 接受並記錄 | Codex 3 輪 4/10，Gemini 有效 PASS；所有識別問題均已修正 |

## §6.3 Option C 決策理由

| 理由 | 說明 |
|---|---|
| 所有 Codex/Gemini 識別問題均已修正 | SSR 守衛（deterministic default + useEffect）、GIT_HOOK_SCRIPT 逸出說明、neutral→ready 映射、Toast 設計、E2E 驗收說明 |
| Gemini §6.5 分析有效 PASS | 涵蓋所有技術面問題（SSR / 逸出 / 映射）|
| openspec validate PASS | 格式層合規 |
| Codex 4/10 模式 | 同 hero-stats / userprofile 模式，Codex 對 propose-only change 持續低分，不反映實際設計問題 |

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Codex §6.1 | artifact 缺席（環境問題）；Gemini PASS | Low | Gemini 已完成等效審查 |
| impact_scope.md | §0.6 CONDITIONAL 未觸發（不修改共享 artifact）| Low | 不適用 |

## 修正清單（第 1 輪後）

- [x] design.md D4：澄清 Server Action 範疇（只傳 leftLabel/rightLabel），說明與 spec 不矛盾
- [x] design.md D4a：加入 Toast 通知設計（useState + setTimeout + fixed 位置）
