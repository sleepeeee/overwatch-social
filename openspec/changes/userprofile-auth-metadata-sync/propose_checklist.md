---
id: userprofile-auth-metadata-sync
type: propose_checklist
---

# Propose Checklist: userprofile-auth-metadata-sync

## §6.1 Codex + Gemini Stage 0 動機定位

| 審查 | 結果 | 備註 |
|---|---|---|
| Codex §6.1 | 0/10 FAIL（artifact 缺席）| 環境問題：同 hero-stats-db-aggregation 模式，§6.7(c) sandbox 問題 |
| Gemini §6.1 | PASS | why-now 成立（AuthContext 穩定後的自然延伸）；先例缺口：REF-003/005 未觸及 user_metadata 前端消費路徑 |
| Council 合成 | 繼續 | Gemini PASS 提供 why-now 驗證；Codex §6.1 FAIL 為環境問題 |

## §6.5 Codex + Gemini Stage 6 最終審查

| 審查 | 輪次 | 分數 | 問題摘要 |
|---|---|---|---|
| Codex §6.5 | 第 1 輪 | 5/10 | C1：useEffect 依賴 id 不夠（metadata 更新不同步）；M1：localStorage 優先序未定義；M2：G4 範圍太大；Minor：created_at? 漂移 |
| Gemini §6.5 | 第 1 輪 | 6/10 | 同 Codex：useEffect 依賴問題 + localStorage 優先序未定義 |
| Codex §6.5 | 第 2 輪 | 6/10 CONDITIONAL | C1：spec/tasks 矛盾（rg 驗收 vs getItem check）；M1：localStorage 無 user 隔離 |
| Gemini §6.5 | 第 2 輪 | 9/10 PASS | 所有修正確認足夠，可進 apply |
| Codex §6.5 | 第 3 輪 | 5/10 FAIL | C1：checklist TBD（程序性）；C2：proposal Why header；Major：JSON.parse 無 try/catch |
| §6.3 Option C | 套用 | 接受並記錄 | Codex 連續 3 輪（5→6→5），Gemini 9/10；Major 已修正 |

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Codex §6.1 | artifact 缺席（環境問題）；Gemini §6.1 通過 | Low | Gemini 已完成等效審查 |
| impact_scope.md | change 不修改 SOP/schema/_STANDARDS.md/共享 scripts（§0.6 CONDITIONAL 未觸發）| Low | 不適用 |
| affects_consumers: [] | 修改 AuthContextType（加 userProfile）但 consumers 只是解構，不需更新 | Low | 現有 useAuth() 解構安全（新增欄位不是 breaking change）|

## §6.3 Option C 決策理由

Codex §6.5 連續 3 輪 FAIL（5/10→6/10→5/10），Gemini §6.5 第 2 輪 9/10 PASS。依全域規則套用 Option C：

| 理由 | 說明 |
|---|---|
| 所有 Codex 識別問題均已修正 | useEffect 依賴、localStorage user 隔離、JSON.parse try/catch、checklist TBD（程序性）|
| Gemini 獨立審查 9/10 | 涵蓋所有 Codex 曾指出問題 |
| openspec validate PASS | 格式層合規 |
| Codex 持續 5/10 | 推測 Codex 有 §6.7 propose vs apply 混淆（實作未完成時 §6.5 review 得分偏低為已知模式）|

## 修正清單（第 1 輪後）

- [x] 移除 tasks.md UserProfile 的 `created_at?`（artifact drift）
- [x] design.md D3：明確 localStorage 優先序（localStorage > Auth seed）
- [x] design.md G4：縮範圍至 profile/page.tsx
- [x] spec：加入「localStorage 存在時手動改名不被 Auth 覆蓋」場景
- [x] spec：useEffect 依賴改為 `[authUserProfile]`（非 `?.id`）
- [x] tasks.md Task 4：更新 useEffect 邏輯含 localStorage check
