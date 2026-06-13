---
change_name: fix-mobile-card-export
diff_fingerprint: ca0c752d59387768
scan_agent: claude-opus-4-7
scanned_at: 2026-06-13
scan_scope: 6
scanned_files:
  - src/lib/cardImageExport.ts
  - src/app/share/[id]/ShareCardClient.tsx
  - .rsx/knowledge/REF-036-html-to-image-ios-safari-foreignobject-blank-image-race.md
  - .rsx/knowledge/REF-037-ios-safari-save-image-to-photos-vs-files-limits.md
  - openspec/changes/fix-mobile-card-export/proposal.md
  - openspec/changes/fix-mobile-card-export/design.md
  - openspec/changes/fix-mobile-card-export/tasks.md
  - openspec/changes/fix-mobile-card-export/specs/share/spec.md
---

# 語意文件掃描帳本 — fix-mobile-card-export

## 概念變更摘要（Stage A 用）

本 change 修兩個 mobile 名片匯出 bug，無新增 capability、無 contract 改變：

- **內部實作改動**：`preloadImagesAsDataUrls` 改 fetch+FileReader 繞 `<img>` race；`createCardImageFile` 加 pixelRatio 自適應 fallback（2 → 80KB threshold → 1）
- **UI 行為增量**：share 頁多一顆「儲存到相簿」按鈕（mobile + `canShare(files)` 偵測為 true 才顯示）；長按備援保留；文案條件化

## Stage A — 概念篩

對全 inventory 6 份 living-doc（排除 `.rsx/decisions/` / `.rsx/findings/` 自己歸檔的、`.rsx/knowledge/` REF 自己歸檔的、`_recovered/` 歷史 audit、`playwright-report/` / `test-results/` 機器產出、`openspec/changes/clarify-platform-safety-boundaries/` 不相關 change、`.claude|.codex|.gemini` agent registry 鏡像）做概念篩。

| 文件 | 描述本 change 改變的概念？ | 標籤 |
|---|---|---|
| `openspec/specs/share/spec.md` | ✓ 描述 share capability，含「Scenario: 導出圖片功能保留」 | candidate |
| `CLAUDE.md` | △ 列 share 頁路由與 ShareCardClient/cardImageExport 名稱，但無「儲存到相簿」/「navigator.share」/「pixelRatio」概念 | unrelated |
| `README.md` | ✗ 無相關 token | unrelated |
| `PRODUCT.md` | ✗ 無相關 token | unrelated |
| `DESIGN.md` | ✗ 無相關 token | unrelated |
| `AGENTS.md` | ✗ AI agent 協作規範文件 | unrelated |
| `docs/image-blur-diagnostic.md` | ✗ SEO + 圖片模糊診斷，跟本次 export 路徑無關 | unrelated |
| `_recovered/codex_reviews/share-page-completion__*.md` | ✗ 歷史 audit 快照，凍結不更新 | unrelated |
| `HANDOFF_TO_FRIEND_AI.md` / `BRANCH_REVIEW.md` | ✗ 跨 session 交接 / branch 審查紀錄 | unrelated |
| `docs/{developer-capture-meter,frontend-toolkit-manual,google-report-form-*,homepage-copy-review,morning_sketch_lobby_redesign}.md` | ✗ 領域不同 | unrelated |
| `playwright-report/data/*.md` + `test-results/*/error-context.md` | ✗ 測試報告快照 | unrelated |

`changelog.md` / `CHANGELOG.md`：專案無此檔，**N/A**（不適用「預設 to-update」規則）。

候選 = 1（`openspec/specs/share/spec.md`）。

## Stage B — 候選全文細讀

### `openspec/specs/share/spec.md`

讀取對應 `Scenario: 導出圖片功能保留`（line 53-55）：

> WHEN 使用者點擊「保存此卡片為圖片」
> THEN 可下載包含名片內容的 PNG 圖片

**verdict: reviewed_no_change**

理由：
1. 本 change 沒打破既有契約 — 「可下載 PNG 圖片」在桌機仍走 `downloadBlob` 路徑、在 mobile 仍可下載（從 navigator.share 對話框選「儲存到檔案」也是下載 PNG）
2. 「儲存到相簿」是新增**並存路徑**，沒取代既有 scenario；屬實作層擴展不是 capability 變更
3. spec 用詞「保存此卡片為圖片」涵蓋兩種 mobile saving 行為（檔案 / 相簿）
4. 後續若要把「mobile 可一鍵存相簿」升為正式契約，可單獨開 change 加 scenario；本 hotfix 不夾帶 spec 改動

## 結果

- **scan_scope**: 6（Stage A 實際考慮的 6 份候選 + 周邊 living-doc）
- **候選**: 1
- **to-update**: 0
- **reviewed_no_change**: 1

## findings

| doc | relation | verdict | note |
|---|---|---|---|
| `openspec/specs/share/spec.md` | share capability spec | reviewed_no_change | 概念：「保存名片為圖片」契約不變，mobile 多 navigator.share 路徑為實作層擴展非契約變更。行為：桌機仍 downloadBlob、mobile 既可下載也可一鍵存相簿，兩者皆滿足「可下載 PNG」。範例：Scenario 53-55 既有腳本仍可通過實機驗證。假設：若未來把「mobile 一鍵存相簿」升級為正式契約承諾，需另開 change 加 scenario，本 hotfix 不夾帶 spec delta。 |
| `CLAUDE.md` | 專案 SSOT 列 share 頁路由 | reviewed_no_change | 概念：CLAUDE.md 此處只列路由與檔名做導航索引，未描述匯出流程概念。行為：本 change 不改 ShareCardClient 入口路由 / 元件名稱。範例：CLAUDE.md 表格列 `share/[id]` 路由不變。假設：若未來加 mobile-specific docs section 才需更新 CLAUDE.md。 |
| `README.md` | 專案簡介 | unrelated | 無相關概念 |
| `PRODUCT.md` | 產品定位 | unrelated | 無相關概念 |
| `DESIGN.md` | 設計指引 | unrelated | 無相關概念 |
| `AGENTS.md` | AI 協作規範 | unrelated | 無相關概念 |
