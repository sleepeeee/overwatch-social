# propose_checklist — fix-oauth-redirect-preserve-origin

## Tier 判定

**L1 lean 分支**（decision_tree Trigger T）：

- 單一主題（OAuth 登入完成後跳轉行為），影響 5 檔（1 new + 4 edit，其中 4 個 edit 是同類修改：呼叫新 helper）。
- 方向已於 EXPLORE 階段與使用者拍板（latest.md 待補；使用者於主對話確認「接進 propose/apply」）。
- spec 影響為 `auth-ux` capability 新增 1 Requirement + 修改 1 Scenario 範例片段，非架構級。
- → 走 lean 分支：proposal + design + tasks + 最小 delta；跳過 Stages 0-6 與 §6.1/§6.5 council；§2.8 validate 仍執行；守門 = apply 後單輪 §6.7。

## 缺口錨定（Stage 0.5 等價，lean 仍保留）

- 最近鄰錨點 = 程式碼層面既有設計：`src/app/auth/callback/route.ts` 的 `safeRedirectPath(next, origin)` 已預留 `?next=` 通道並含完整安全防護；既有 `auth-ux/spec.md` 已定義 LoginModal 登入 Scenario。
- 具體空白 = 全站 4 個 `signInWithOAuth` 呼叫端皆未配合寫入 `next`，使既有通道從未啟用；既有 spec Scenario 第 47 行範例片段未要求寫入 next（共同造成「合規但無效」狀態）。
- 缺口無外部技術知識空白，故未建 REF（與 fix-mobile-card-export 不同：那次有 html-to-image + iOS Safari 平台行為要查證）。

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險評估 | 補救方案 |
|---|---|---|---|
| Stage 0 §6.1 Codex‖Gemini council | L1-skip：bug 修復、方向已拍板、scope 5 檔（4 個同類）| 低（根因為程式碼路徑層級可直接驗證：grep 全站 `signInWithOAuth` 4 個入口 + 讀 callback 邏輯）| apply 後 §6.7 單輪守門 |
| Stage 1 explorer dispatch | L1-skip：純程式碼路徑診斷，無外部技術知識需求；EXPLORE 已在主對話完成全站掃描 | 低 | — |
| Stage 2 假設修正 / novelty claim | L1-skip：bug 修復非新研究 | 低 | — |
| Stage 4 多面向 audit | L1-skip：< 50 行變更（1 new file ~30 行 + 4 edits ~5 行/處）、非架構級 | 低 | §6.7 守門涵蓋 |
| Stage 5 補搜強化 | L1-skip：無 Stage 4 audit 故無補搜目標 | 低 | — |
| Stage 6 §6.5 adversarial council | L1-skip：scope 小、方向已拍板 | 低 | §6.7 守門涵蓋 |
| min_refs_per_propose=3（本 change 引 0 REF） | L1-skip：bug 修復為程式碼路徑診斷，缺口錨定指向專案內部 file:line（callback 已有設計、4 入口未配合），無外部知識空白 | 低 | 若 Supabase 白名單 prefix-match 假設於 task 5 staging 驗證失敗，則需補建 REF（Supabase Auth redirect URL 行為）|

## 7.6 Doc Impact Scan

- `affects_consumers: []`（純前端行為修正，無消費端文件）
- ripgrep 兜底（搜尋詞 `signInWithOAuth` / `auth/callback`）：命中限 src/ 內部與 openspec/specs/auth-ux/spec.md，後者已由本 change spec delta 涵蓋 MODIFIED Scenario；無其他文件級消費者

## 守門

- apply 完成後：§6.7 單輪 Codex 實作審查（讀 4 個 edits + 新 helper + spec delta，檢查是否符合 proposal/design/spec/tasks）
- 實機驗證：tasks 5.1-5.4 + 7.2 行動裝置實機 flow（行動裝置實機可由 user 親跑）

## §6.7 對抗式守門結果（apply 完成後填）

**Verdict**: PROCEED
**Score**: 8 / 10
**Dispatch**: 派 `codex:codex-rescue` background；agent 回報「仍在讀檔」但 output file 0 bytes，判定 transport 故障 → 走 §6.8 TRANSPORT-DEGRADED 自審路徑（本 change 首次降級，未觸連續上限）。

**前綴**: `[TRANSPORT-DEGRADED: codex]`
**已讀 artifact 清單**（12 檔，≥ 核心 4 檔）：
- 4 openspec artifacts (proposal / design / spec / tasks)
- propose_checklist.md
- 5 程式碼變更 (googleLogin.ts / LoginModal.tsx / HomeClient.tsx / ProfileClient.tsx / AuthShelvedButtons.tsx)
- callback route.ts（相依但未動）
- google-login-build-next.test.mjs（測試 4/4 pass）

**Critical issues**: 無

**Minor issues**:
- M1. unsafe prefix `/auth`、`/developer`（無斜線）理論盲區但路由結構不可達；範圍外
- M2. callback route.ts:8 與 searchParams.get 形成 double decode，罕見 case 對 literal `%` 路徑出錯；本 change 不動 callback，建議開 finding 追蹤
- M3. design.md D2 Supabase prefix-match 宣稱待 task 5 staging 實測驗證；建議補「待實測；失敗 fallback wildcard」一句
- M4. helper SSR fallback `origin=""` 理論無效 URL；4 個入口皆 client event handler 不可達，範圍外

**結論**：5 維度全項通過、無 critical、minor 皆範圍外或可延後。PROCEED 進 archive。

## L1-skip 簡記

| Stage / Moment | 處置 |
|---|---|
| Stage -1 tier | L1（5 檔、單一主題、user 已拍板、spec 文件級）|
| Stage 0 §6.1 | L1-skip |
| Stage 1 explorer | L1-skip |
| Stage 2-5 | L1-skip |
| Stage 6 §6.5 | L1-skip |
| Stage 7 validate | 必跑（下方） |
| §6.7 守門 | apply 後單輪 |
