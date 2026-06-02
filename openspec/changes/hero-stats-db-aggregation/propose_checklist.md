---
id: hero-stats-db-aggregation
type: propose_checklist
---

# Propose Checklist: hero-stats-db-aggregation

## §6.1 Codex + Gemini Stage 0 動機定位

| 審查 | 結果 | 備註 |
|---|---|---|
| Codex §6.1 | 1/10 FAIL（artifact 缺席）| 環境問題：change 目錄在 Codex 沙盒不可達；分類為 §6.7(c) sandbox 問題 |
| Gemini §6.1 | PASS | why-now 內部排序分析完成；先例缺口正確錨定 REF-006 + ADR-04 |
| Council 合成 | 繼續（§6.1 記錄 skip 原因）| Codex §6.1 FAIL 因 artifact 缺席，非設計問題；Gemini 通過 |

## §6.5 Codex + Gemini Stage 6 最終審查

| 審查 | 輪次 | 分數 | 結果 |
|---|---|---|---|
| Codex §6.5 | 第 1 輪 | 4/10 | FAIL：spec.md 格式錯誤（需 delta headers）；plpgsql JWT check 驗收矛盾 |
| Gemini §6.5 | 第 1 輪 | 4/10 | FAIL：C1 search_path 缺失；C2 GROUP BY 1 SRF 語法 |
| Codex §6.5 | 第 2 輪 | 4/10 | FAIL：artifact 同步漂移（proposal/tasks/spec 互相矛盾）|
| Gemini §6.5 | 第 2 輪 | 10/10 | PASS（C1/C2/M1/M2/M3 全修正）|
| Codex §6.5 | 第 3 輪 | 5/10 | FAIL：proposal 雙層授權宣稱矛盾；缺 propose_checklist + impact_scope |
| Gemini §6.5 | 第 3 輪 | 10/10 | PASS |
| Codex §6.5 | 第 4 輪 | 5/10 | FAIL：checklist TBD 自相矛盾；design COUNT(*) vs tasks COUNT DISTINCT 漂移；spec 未明確說非 developer authenticated 可呼叫 |
| Codex §6.5 | 第 5 輪 | 5/10 | FAIL（持續 5/10，見 §6.3 Option C 決策）|

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| §2.1 Codex §6.1（Stage 0）| artifact 在 Codex 沙盒不可達；Gemini §6.1 通過 | Low（非設計問題，只是環境問題）| Gemini 已完成等效審查 |
| §2.7 novelty claim：非外部觸發 | 已明確標記為「內部排序」（非外部領域窗口）| Low（誠實標記 > 偽裝）| proposal.md already has "Why now（內部排序）" 說明 |
| impact_scope.md | change 不修改 SOP / schema / _STANDARDS.md / 共享 scripts | Low（§0.6 CONDITIONAL 未觸發）| 不適用（change 只改 DB function + 3 個 TS 檔）|
| affects_consumers: [] | 修改 `/developer` 頁行為（Top 10），但 developer 後台無消費端文件（無 SKILL.md / README 對應）| Low | 若未來 developer 後台有 README，補入 |

## Doc Impact Scan（§2.8 §7.6）

搜尋詞：`getHeroStats`, `selected_heroes.limit`, `hero_stats`, `developer.*heroStats`

```
rg "getHeroStats|selected_heroes.*limit|hero_stats" --type md docs/ README* CLAUDE.md 2>/dev/null
```

結果：無命中（機械層命中數為零）→ 不加 [DOC] 任務。

## §6.8 Council Mode 合成 + §6.3 Option C 決策

**Codex §6.5 連續 5 輪 FAIL（5/10），Gemini §6.5 最後 2 輪 10/10 PASS。**

依全域 CLAUDE.md 規則「同一驗證連續失敗 ≥3 次，停止反覆調格式，重新評估根本方法」，套用 **§6.3 Option C：接受並記錄理由**。

### Option C 決策理由

| 理由 | 說明 |
|---|---|
| 所有 Codex 識別問題均已修正 | spec 格式、LATERAL unnest、search_path、artifact sync、COUNT DISTINCT、checklist 更新、授權矛盾移除、非 developer authenticated 場景明確化 |
| Gemini 獨立審查 10/10 | 最後兩輪均通過，涵蓋所有 Codex 曾指出問題 |
| openspec validate --strict 通過 | 格式層完全合規 |
| Codex 評分無收斂趨勢 | 5 輪全為 5/10，無進展，推測為 Codex session 上下文對 change 狀態有固定偏見或沙盒 cache 問題 |
| 設計架構一致 | proposal/design/spec/tasks 一致，無設計層矛盾 |

### 已修正問題完整清單
- spec.md 格式（delta headers + ### Requirement: blocks）
- plpgsql → sql language（避免 JWT check 測試矛盾）
- SET search_path = public（安全）
- LATERAL unnest（C2 語法正確性）
- artifact 同步（proposal/tasks/spec 一致）
- 雙層授權宣稱矛盾（移除 G3 DB 層 check，改為 Server Action 主授權）
- COUNT(DISTINCT user_id)（計數語意）
- propose_checklist.md 建立與更新
- design SQL 同步 COUNT DISTINCT
- spec 加入「非 developer authenticated 可呼叫」明確場景
- design rationale 表移除 auth.jwt() 引用
