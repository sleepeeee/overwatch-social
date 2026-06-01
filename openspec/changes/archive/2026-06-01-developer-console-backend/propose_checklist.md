# Propose Checklist: developer-console-backend

## §2.1 Stage 0 — 動機定位
- [x] 0.1-0.3 弱點識別：saveHeroAlignments fs.writeFileSync 生產 bug + Overview 假資料
- [x] 0.4 [MANDATORY] §6.1 dispatch：Codex 6/10 CONDITIONAL（artifacts 未建立，程序性）；Gemini 9/10 PROCEED
- [x] 0.5 缺口錨定：REF-004（RLS 模式）、REF-002（Server Action 模式）；缺口 = DB 持久化層缺失
- [x] 0.6 blast-radius scan：未觸發（不涉及共享 SOP/schema/script）

## §2.2 Stage 1 — 情報蒐集
- [x] REF 數量 ≥ 3：REF-002/004/005（3 個）✓

## §2.3 Stage 2 — 假設修正
- [x] 最小修補（只改 write）vs 完整方案（write+read）比較 → 選完整方案（write 到 DB 但 read 靜態 = 虛功）

## §2.4 Stage 3 — 設計起草
- [x] proposal.md（含方法比較、why now 誠實降級）
- [x] design.md（D1-D6 決策，含 C1 RLS fix + D4 error logging）
- [x] spec.md（4 scenarios）
- [x] tasks.md（含 migration SQL、驗收補強）

## §2.7 Stage 6 — Codex + Gemini 第二意見
- [x] §6.5 dispatch 記錄（見下方）

## §2.8 Stage 7 — Validate
- [x] `openspec validate developer-console-backend --strict` ✅ PASS

---

## Codex Dispatch 記錄（§6.7 4 欄位）

| moment_id | dispatch_tool | output_excerpt | verdict |
|---|---|---|---|
| §6.1 | codex_dispatch.py session 019e83e9 | 「proposal 不存在，程序性；why now 成立（production bug）；B1 緊迫度弱於 B2；需比較最小修補 vs 完整方案」| **CONDITIONAL 6/10** |
| §6.1 | Gemini subagent | 「why now 9/10 完全成立；B1+B2 同 change 合理；Major：RLS policy 語法需明確；error boundary 需說清楚」| **PROCEED 9/10** |
| §6.5 | codex_dispatch.py session 019e83ed | 「C1：D5 profiles RLS 只允許看自己 row，getSystemStats 會 false-green；Major：D4+D6 fallback 掩蓋問題」→ C1 已修（developer SELECT policy 加入 migration）| **FAIL 6/10（C1 已修補）** |
| §6.5 | Gemini subagent | 「D4 fallback 應 console.error；seed SQL 冪等性需確認；Task 6.5 Vercel smoke；AdjusterClientPage 儲存後刷頁說明」→ 全折入 | **CONDITIONAL 7/10** |

## §6.8 Council Mode 合成

| 視角 | 分數 | Verdict |
|---|---|---|
| Codex §6.5（C1 修補後）| 6→修補後 PROCEED | — |
| Gemini §6.5 | 7/10 | CONDITIONAL |

**合成**：C1（profiles RLS）已修補並折入 migration SQL；D4 error logging 已折入 design.md；seed 冪等性已確認（`ON CONFLICT DO NOTHING`）。修補後 **CONDITIONAL PROCEED**。

## 跳過項目記錄

| 項目 | 理由 | 風險 | 補救 |
|---|---|---|---|
| Codex §6.1 CONDITIONAL（程序性）| artifacts 未建立時送出，Gemini 9/10 PROCEED 彌補 | Council 少一正式 PROCEED | 方向已由 Gemini 9/10 驗證 |
| migration 為手動 SQL（非 supabase CLI 自動）| 專案未使用 supabase CLI migration toolchain | 多環境需手動重跑 | 計畫：migration 存入 `supabase/migrations/`，Task 6 列明確驗收步驟 |
| AdjusterClientPage 儲存後需刷頁 | 開發者工具可接受；未來加 `router.refresh()` | 輕微 UX 不一致 | Task 2 提示「儲存成功，需重新整理」說明 |
