# Propose Checklist: browse-server-search-and-player-detail

**日期**：2026-06-02
**執行者**：Claude Sonnet 4.6（主代理 inline）

---

## §2.1 Stage 0 — 動機定位

- [x] **0.1** REF-007 問題 3（前端搜尋）+ 問題 5（卡片無反應）
- [x] **0.2** 廣場有「瀏覽」但無「交友」；搜尋是假搜尋
- [x] **0.3** Why now：測試名片在 DB，GRANT 修復後可完整測試；這是社交功能的基礎
- [ ] **0.4** [SKIP] codex_dispatch：工程功能開發
- [x] **0.5** 先例缺口：REF-008（ilike + Load More 模式）補上
- [x] **0.6** blast-radius：新路由 + DB view 更新（additive）

## §2.2 Stage 1 — 情報蒐集

- [x] **1.3** REF-007, REF-008, F-003 ✓（3 個）
- [x] **1.4** crossref 填寫 ✓
- [x] **1.5** L1 → L2 ✓

## §2.3 Stage 2-5

- [x] proposal.md ✓
- [x] design.md ✓（D1-D7，含 Gemini 修正）
- [x] spec.md ✓
- [x] tasks.md ✓（Task 1-4 + 3.5）
- [x] Dataset Card：不觸發

## §2.7 Stage 6 — Gemini 審查

- [x] Gemini 初始：4/10（C1 + M1 + M2 + M3）
- [x] **修正後預估：7.5/10**
  - C1：design D5 加 migration 007，public_profiles view 加 social_channels
  - M1：design D7 加 stale request ID 機制
  - M2：design D4 改用 Link
  - M3：design D6 加 generateMetadata()
- [x] 選擇 A（修正後繼續）

## §2.8 Stage 7

- [x] `openspec validate browse-server-search-and-player-detail --strict` → PASS

---

## 跳過項目記錄表

| 項目 | 跳過理由 | 風險 | 補救 |
|---|---|---|---|
| §2.1 0.4 Stage0 Codex | 工程功能 | 低 | apply 後 /rsx:verify |
| §2.5 Stage4 Codex | 同上 | 低 | 同上 |
| §2.7 Stage6 Codex | 同上；Gemini 主審 | 低 | 同上 |

## §6.3 Gemini 4/10 → A 修正後繼續

所有問題均已納入 design D4-D7 + tasks 更新，無需縮範圍。
