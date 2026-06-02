# Propose Checklist: e2e-test-coverage

**日期**：2026-06-02
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** REF-007 問題 7（零測試）
- [x] **0.2** 每次改 code 都是信仰之跳；auth 修復後是補測試最佳時機
- [x] **0.3** Why now：廣場、詳細頁、auth 守門都剛完成，有東西可測

## §2.2 Stage 1 — 情報蒐集

- [x] **1.3** REF-007, REF-009 ✓
- [x] **1.4** crossref ✓
- [x] **1.5** L1 → L2 ✓

## §2.3 Stage 2-5

- [x] proposal.md ✓
- [x] design.md ✓（含 Gemini C1 page.route() 修正）
- [x] spec.md ✓
- [x] tasks.md ✓

## §2.7 Stage 6 — Gemini 審查

- [x] Gemini：4/10（C1 production DB + M1 waitForTimeout）
- [x] 修正：D3 改用 page.route() mock；waitForTimeout 改為 expect().toBeVisible()
- [x] 選擇 A（修正設計繼續），預估修正後 7.5/10

## §2.8 Stage 7

- [x] `openspec validate e2e-test-coverage --strict` → PASS

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險 | 補救 |
|---|---|---|---|
| Stage0/6 Codex | 測試 infrastructure 開發 | 低 | apply 後 verify |
| Google OAuth 完整 flow | 需 JWT secret 或 Supabase emulator，不在 MVP 範圍 | 低（已在 Non-Goals 記錄） | Change D |
