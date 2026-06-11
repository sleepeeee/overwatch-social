# propose_checklist — add-standalone-theme-style

## 模式聲明

使用者於 2026-06-12 明確指示「把後面運行的流程改成輕量模式」→ Stage 4 之後的守門降級執行，全部記入下方跳過表。Stage 0-3 已完整執行。

> **重建備註**：本 change 全部 artifacts 於 2026-06-12 propose 完成後曾因跨 session 檔案回捲遺失，由主代理自 context 完整重建（內容與原版一致；REF-032~035 以濃縮版重建）。

## §6.1 真實 dispatch 記錄

| 欄位 | 內容 |
|---|---|
| moment_id | 6.1 |
| dispatch_tool | `codex:codex-rescue` + `gemini:gemini-rescue` subagent 並行（background）|
| output_excerpt | Codex：「VERDICT: FAIL 6/10 — C1 動機強度不足（需具體說明現在卡住什麼）、C2 why-now 外部觸發不足（beta 推廣需轉化為可量化時間節點）、m1 缺口錨定語氣稍滿、m2 FOUC 跳過需邊界條款、三套主題需設計審查 checkpoint」。Gemini（後到，2026-06-12 記錄）：「VERDICT: PROCEED 8/10 — 動機成立、why-now 誠實、缺口錨定具體。C1 scope 膨脹：建議一套主題先行驗證再追加其餘兩套；m1 留 TODO(theme-FOUC) 標記」|
| verdict | Codex FAIL → **C1/C2/m1/m2 + checkpoint 全部已修入 proposal.md**（具體卡點案例段、why-now 時間錨點 2026-06-11 beta 評估、FOUC 邊界條款、每套主題使用者驗收 checkpoint）。重審輪因輕量模式跳過（見跳過表）|

## Stage 1 情報蒐集

REF-028~035 共 8 筆（≥ min_refs_per_propose=3），crossref 對稱，§1.3 EXPLORE council CONSENSUS PASS（round 1 雙 FAIL → 補搜 → round 2 雙 PASS）。Stage 1 無新增搜尋需求。

## 跳過項目記錄表（§2.X）

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Step 1.5 Claim 前置檢查 | `.rsx/claims/` 為空目錄 | 無 | 無需 |
| §6.1 修正後重審輪 | 使用者明確指示輕量模式；Codex 全部 C/m 項已逐項修入 proposal | 低——修正項皆為文字論證強化，非技術方案變更 | §6.7 apply 後審查會重看動機與實作一致性 |
| §6.1 Gemini verdict 等待 | 後到結果已記錄：PROCEED 8/10 | 低 | Gemini C1（一套先行）實質已由 tasks 4.1→4.2→4.3 逐套驗收 checkpoint 結構滿足（4.1 neon-esports 先行、驗收過才進下一套）；m1 → 實作時 FOUC 註解用 `TODO(theme-FOUC)` 標記（tasks 3.3）|
| Stage 4 多面向自審（3 audits）| 使用者明確指示輕量模式 | 中——assumption/method/confounder 視角未獨立審；但 §6.1 Codex 已覆蓋動機與 scope 風險、EXPLORE council 兩輪已覆蓋方法完整性 | apply 階段 §6.7 單輪 Codex 實作審查為唯一守門（tasks.md 5.3）|
| Stage 5 補搜強化 | 無 Stage 4 audit 產出缺口清單 | 低——EXPLORE 已兩輪 council 驗證覆蓋度 | 如 apply 中遇知識缺口，隨用隨補 REF |
| Stage 6 §6.5 adversarial council | 使用者明確指示輕量模式 | 中——無 propose 級對抗審查評分 | §6.7 apply 完成審查升格為必跑單輪守門；發現 spec 級問題回頭修 artifacts |
| Stage 7.4 smoke test | 無 wall-clock > 1 hr 實驗 | 無 | 無需 |
| 7.6 Doc Impact Scan（srsx 機械層）| 輕量模式；affects_consumers 僅 1 項（CLAUDE.md）已人工確認 | 低 | tasks.md 5.2 已含 CLAUDE.md 更新 task |
| Dataset Card | 未觸發（無 training/CNN/model；弱觸發詞 < 2）| 無 | 無需 |

## Stage 0 缺口錨定（0.5，修正語氣版）

最近鄰 prior work = globals.css 既有 5 套主題 class（已做：卡片/輸入框/按鈕層變數覆蓋）與 REF-015 HUD 設計稿移植模式（已做：單元件級視覺規格移植）；本 change 針對的、**尚未被前案覆蓋的範圍** = 全站 token 完備化（145 處硬碼點）+ 雙 token 體系橋接 + 角色 gating 主題預覽。錨定 REF：REF-032、REF-033、REF-034。
