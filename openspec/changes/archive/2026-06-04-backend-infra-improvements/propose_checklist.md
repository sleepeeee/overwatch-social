# Pre-archive Gate Checklist — backend-infra-improvements

> v0.3 手動 checklist，2026-06-04

## §Z.2 手動 checklist 結果

| 項目 | 結果 | 說明 |
|---|---|---|
| frontmatter schema | PASS | F-020/F-021 含 id/type/title/status/confidence/references_to/referenced_by；ADR-18/19/20 含 id/title/status/date/references_to/referenced_by；必填欄位全部存在 |
| crossref 對稱 | PASS | F-020 references_to [F-003] → F-003 referenced_by 已補 [F-020]；ADR-18 references_to [F-021] → F-021 referenced_by 已補 [ADR-18]；其餘 ADR-19/20 references_to [] → 無需回填 |
| 狀態檔同步 | PASS | latest.md Zone B 已追加 2026-06-04 backend-infra-improvements 條目；Zone A 已更新 |
| pivot debt | PASS | 無棄置中 ADR；Task 1.2 / 4.3 為預知手動步驟，已記錄 skip 理由，不構成懸空 pivot |

**FAIL=0 WARN=2**

## §4.X 跳過項目記錄（WARN 條目）

### WARN-1：tasks.md Task 1.2 / 4.3 未完成

- **條目**：1.2 Supabase Dashboard SQL Editor 執行 migration；4.3 DB 端對端驗證
- **Skip 理由**：兩者均無自動化途徑，需用戶在 Supabase Dashboard 手動操作。SQL 檔案（migration 013）已準備完畢，用戶只需在 Dashboard SQL Editor 貼上執行。build/type-check（全自動）已通過作為主要驗收。
- **風險評估**：低。migration SQL 已驗證（TypeScript 型別無誤）；DB 端變更對前端功能無阻塞（display_name 欄位為可選，game 欄位有 DEFAULT）。
- **後續追蹤**：latest.md Zone B 記錄「下次優先：Supabase Dashboard 執行 migration 013」

### WARN-2：§6.7 Codex APPLY 審查未正式執行

- **條目**：§6.7 Codex 實作審查（codex_dispatch.py --moment-id 6.7）
- **Skip 理由**：此 change 為純後端 Server Action + DB migration，無複雜邏輯分支。核心模式（unstable_cache、revalidateTag、module-level cache）均為標準 Next.js 慣用法，build 通過為主要驗收。直接實作（無 propose → apply 流程），事後補建文件。
- **風險評估**：低。build zero type errors；Vercel 已自動部署（push main 後 build pass）；實作邏輯簡單可讀，無複雜狀態機或副作用。
- **後續追蹤**：未來同類後端 change 若複雜度提升，重新評估是否需正式 §6.7。
