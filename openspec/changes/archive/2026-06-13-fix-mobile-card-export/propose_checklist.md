# propose_checklist — fix-mobile-card-export

## Tier 判定

**L1 lean 分支**（decision_tree Trigger T）：
- 單一主題（行動裝置名片匯出 bug 修復），影響 2 檔（`cardImageExport.ts`、`ShareCardClient.tsx`）≤ 3。
- 方向已於 EXPLORE 階段與使用者拍板（root cause + 修法，可查驗：latest.md 2026-06-13 條目 + REF-036/REF-037）。
- spec 影響為 `share` capability 新增可觀察行為（ADDED Requirements），非架構級。
- → 走 lean 分支：proposal + design + tasks + 最小 delta；跳過 Stages 0-6 與 §6.1/§6.5 council；§2.8 validate 仍執行；守門 = apply 後單輪 §6.7。

## 缺口錨定（Stage 0.5 等價，lean 仍保留）

- 最近鄰 prior work：REF-036（html-to-image foreignObject 競態）、REF-037（iOS 存照片 vs 檔案 + navigator.share）。
- 具體空白：兩份外部知識的修法尚未落實於本專案匯出鏈（preload early-return skip + 無雙呼叫暖機 + exportCardImage 為 dead code）。

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Stage 0 §6.1 Codex‖Gemini council | L1-skip：bug 修復、方向已拍板、scope 2 檔 | 低（根因已雙來源外部驗證 REF-036/037）| apply 後 §6.7 單輪守門 |
| Stage 1 explorer dispatch | L1-skip：EXPLORE 已建 REF-036/037（雙向 crossref），知識充足 | 低 | — |
| §2.X PROPOSE-time Semantic Advisory | 跳過：L1 lean，affects_consumers=[] 且 ripgrep 兜底 0 命中，無消費端文件需 advisory 諮詢；archive 階段已補語意層 doc_scan_ledger.md（reviewed_no_change）涵蓋契約檢視 | 低 | archive 階段 doc_scan_ledger.md 已執行 Stage A/B 概念篩 + 對抗式 reviewed_no_change |
| Stage 4 多面向 audit | L1-skip：< 50 行變更、非架構級 | 低 | §6.7 守門涵蓋 |
| Stage 6 §6.5 adversarial council | L1-skip：同上 | 低 | §6.7 守門涵蓋 |
| min_refs_per_propose=3（本 change 引 2 REF） | L1-skip：bug 修復非新研究，2 個高相關 REF（036/037）已完整錨定兩根因 | 低 | 如 apply 發現第三方向缺證據再補搜 |

## 7.6 Doc Impact Scan

- `affects_consumers: []`（純前端行為修復，無消費端文件）。
- ripgrep 兜底命中 0（無共享 artifact 文件引用 cardImageExport/ShareCardClient 行為契約）。

## 守門

- apply 完成後：§6.7 單輪 Codex 實作審查 + 實機驗證（tasks 7-8）。
