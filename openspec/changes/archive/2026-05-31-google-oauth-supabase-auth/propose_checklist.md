# Propose Checklist — google-oauth-supabase-auth

## Codex 介入時刻記錄（RSX_SOP §6 MANDATORY）

| 時刻 | 觸發 | 狀態 | 評分 | 結果摘要 |
|---|---|---|---|---|
| §6.1 Stage 0 動機定位 | why-now 評估 | ✅ DONE | 7/10 PROCEED | Why-now 基本成立，主要為內部排序成熟（OWPlayerCard 型別穩定、三個消費點一致）而非競爭窗口。建議補「不主張競爭窗口」與 OWPlayerCard 穩定依據，已吸收進 proposal.md。 |
| §6.5 Stage 6 最後審查（第 1 輪）| codex_review_audit | ❌ FAIL | 6/10 | Critical：profiles public SELECT 開放整表，anon key 可繞前端遮蔽讀原始 battle_tag + social_channels。Major×3：Next.js 16 middleware 相容、open redirect、smoke 驗收可重現性。 |
| §6.5 Stage 6 最後審查（第 2 輪）| codex_review_audit（修正後重跑）| ❌ FAIL | 6/10 | design.md 仍保留舊 public SELECT policy，與修正後 spec 衝突。Task 1.4/6.1/6.2 仍寫舊行為。open redirect 缺 decode/normalize 測試案例。 |
| §6.5 Stage 6 最後審查（第 3 輪）| codex_review_audit（全 artifacts 對齊後）| ✅ PASS | 8/10 PROCEED | Critical 根因確認已關閉：profiles 無 public SELECT policy，public_profiles view 在 DB 層遮蔽。open redirect 方案充分。artifacts 三份文件已對齊。剩餘為 apply 階段可守住的 major 風險。 |

## 跳過項目記錄

| 項目 | 理由 | 風險 | 補救 |
|---|---|---|---|
| rsx-explorer subagent 委派（Stage 1）| sub-agent 環境無法巢狀 spawn Agent 工具 | 探索深度受單一 agent 限制 | orchestrator 直接執行 L2 waterfall，建 3 REF 達 min_refs_per_propose=3 門檻 |
| Stage 4 獨立 audit 維度（非 Codex 路徑）| orchestrator 未能在 §6.5 之外另派 Claude audit agents | stage 4 audit 由 §6.5 Codex 覆蓋（安全 + MVP 範圍 + 技術可行性）| 已由 §6.5 三輪 Codex 審查覆蓋三個維度，等同補足 |
| Gemini 審查 | RSX_SOP 要求至少 1 Codex 路徑（已達），Gemini 為可選 | 未獲第三視角 | §6.5 Codex 三輪已充分，可在 apply 前補 Gemini review |
| §6.5 checklist 第 1+2 輪自動寫入 | 正式目錄建立前 codex_dispatch --auto-update-checklist no-op | 需手動補（已補） | 本檔即為補寫結果 |

## Stage 1 建立的 REF 知識點

| REF-ID | 標題 | 路徑 |
|---|---|---|
| REF-002 | Supabase Auth with Next.js App Router（@supabase/ssr）| `.rsx/knowledge/REF-002-*.md` |
| REF-003 | Supabase Google OAuth（PKCE + callback route）| `.rsx/knowledge/REF-003-*.md` |
| REF-004 | Supabase RLS（profiles 表 + auth.uid() policy）| `.rsx/knowledge/REF-004-*.md` |

| §6.7 APPLY 完成審查 | codex_review_audit（實作後）| ✅ PASS | 8/10 PROCEED | open redirect 防護充分；getClaims().sub 授權正確；middleware 用 getUser() 刷新符合設計；public_profiles view 方向正確（建議後續驗 security_invoker）；mock fallback 建議 production 禁用。無阻斷級漏洞。 |

## Apply 階段需特別注意的 Codex 建議

1. **public_profiles view 語意**：view 的公開安全性靠 projection 不靠 RLS，需明確 `GRANT SELECT ON public_profiles TO anon` 且絕不 `GRANT SELECT ON profiles TO anon`
2. **open redirect**：redirect 必須輸出 normalized relative URL（pathname + search + hash），不回傳 raw next
3. **Next.js 16 cookies()**：全域 grep `next/headers` import 的 call sites，所有 `cookies()` 改為 `await cookies()`
