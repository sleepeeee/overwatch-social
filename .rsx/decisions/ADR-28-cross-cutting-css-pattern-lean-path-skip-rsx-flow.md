---
id: ADR-28
title: "Cross-cutting CSS pattern 修補採跳 rsx 流程 + REF baseline 維護路徑（vs L1 lean change / L2 full rsx）"
status: Accepted
change: fix-global-text-overflow（PR #24, commit 12f4230）
date: 2026-06-13
references_to: [REF-038]
referenced_by: []
---

## 決策

**Cross-cutting CSS pattern 修補**（同根因跨 5+ 檔、純 className 變更、無架構決策）採用以下 lean 路徑，**不走** rsx 完整 propose/apply/archive 流程：

1. **EXPLORE 階段照走**：派 rsx-explorer 全站掃描 + 建 REF baseline knowledge point + §1.3 council Codex ‖ Gemini 覆蓋驗證
2. **PROPOSE/APPLY 階段跳過**：不建 `openspec/changes/<name>/` 目錄、不寫 proposal/design/spec/tasks 四 artifacts、不跑 §2.5 audit ≥3 個、不跑 §6.5/§6.7 council
3. **直接 commit**：開 `feature/fix-<topic>` 分支 → 按 REF baseline 修改 → commit message 引 REF + 列具體位置 → PR body 列風險清單對應前例 PR
4. **ARCHIVE 簡化**：建 ADR 記錄此次工作流選擇、補 REF crossref、更新 `latest.md`；不跑 `maintain.py Pre-archive Gate`、不跑 `openspec archive`

## 背景

OW Social 至 2026-06-13 已連續 3 次發生「cross-cutting CSS pattern 修補」工作：

| PR | 主題 | 檔案數 | 流程選擇 |
|---|---|---|---|
| PR #20 (`d27116c`) | 移除展示館卡片誤加的 `max-w-[340px]` | 1 | 跳流程 |
| PR #21 (`bc51844`) | 個性標籤過長換行溢出 | 3 | 跳流程 |
| **PR #24** (`12f4230`) | 全站長文字溢出（延伸 PR #21） | 5 | 跳流程 + 建 REF-038 |

三次都選跳 rsx 流程直接修，**形成事實上的 pattern**。本 ADR 將此 pattern 提升為明文決策，並補上 REF baseline 維護義務。

## Trigger 條件（全部滿足才適用）

1. ✅ **同根因 cross-cutting**：所有改動圍繞一個 CSS pattern（如 `min-w-0` flex child、`break-words` 長文字保護、`whitespace-nowrap` 防斷字）
2. ✅ **純 className 變更**：不動 component logic、不改 props 介面、不改 type
3. ✅ **無架構決策**：不引入新 utility、不改 design system 約定、不影響 SSR / hydration
4. ✅ **REF baseline 已建或可建**：技術內容可由單一 REF knowledge point 完整描述
5. ✅ **檔案數 ≥ 3**（已破 L1 lean change 硬上限，又不到 L2 full rsx 必要規模）

## Anti-trigger（任一命中必走正規流程）

- ❌ 改動跨 component 介面（props 變更、callback 新增）→ L2
- ❌ Type 變更（即使只是 union 加一個 string）→ L1 lean 或 L2
- ❌ 影響 SSR / hydration / 行為觸發時機 → L2
- ❌ 引入新 design token / 新 utility class 進入 design system → L2
- ❌ 跨 design / UX 決策（截斷 vs 換行 vs hover 顯示）有爭議且需多方對齊 → L2

## REF baseline 維護義務

選 lean 路徑的代價是「不寫 design.md」，所以**對應 REF knowledge point 必須代替 design.md 承擔技術文件責任**：

- REF body 必含 Tailwind utility 對照表 / 風險分類 / caveats（platform 支援邊界、視窗特定問題）
- §1.3 council 補強內容必回填 REF（不能只留在 PR description）
- 未來同類修補時可直接引 REF 而非重新調研

範例：REF-038 已含三類典型風險分類（A: flex child 缺 min-w-0、B: 容器限制但缺 overflow 宣告、C: block 元素長文字缺 break-words）+ iOS Safari 15.4+ 支援邊界 + shadcn Card 無內建保護等 caveats，足夠承擔 design.md 角色。

## 為何不選其他方案

| 方案 | 為何不選 |
|---|---|
| (a) L2 full rsx propose | 對「補 CSS class」是儀式成本：≥3 REF / §2.5 audit ≥3 個 / §6.5 + §6.7 council / openspec archive — 過載 |
| (b) L1 lean change | 硬上限「修改 ≤3 檔」已破（本次 5 檔）。SOP §2.0 升檔規則「猶豫 >1 分鐘即升」也命中。L1 lean 不適用 |
| (d) 完全不建 REF | 失去長期 baseline 文件化價值；下次再發生時還要重新調研 → 違反「寧多勿少」原則 |

## 風險與緩解

| 風險 | 緩解 |
|---|---|
| 跳過 §6.5/§6.7 council 可能漏掉設計問題 | EXPLORE 階段的 §1.3 council 已涵蓋（Codex ‖ Gemini 並行審查 REF baseline + 風險清單） |
| 沒有 OpenSpec change 目錄 → 未來查不到改動脈絡 | commit message + PR body 引 REF + 列具體位置；ADR 記錄工作流選擇；REF crossref 連到 PR commit hash |
| 連續用 lean 路徑可能讓真正需要 L2 的工作也偷懶跳流程 | Trigger 條件全部滿足才適用（5 條硬性）；Anti-trigger 任一命中強制 escalate |
| ADR 不會自動觸發 maintain.py gate | ADR 本身屬「軟性記錄」；gate 適用於 OpenSpec change，本 ADR 純粹記錄工作流決策不需 gate 守護 |

## 後續影響

- 未來遇到符合 5 條 Trigger 的 cross-cutting CSS 修補，可直接引本 ADR 跳流程
- REF-038 作為「文字溢出防護」baseline，未來新增同類問題（例：mobile-specific 溢出、新 viewport 約束）優先 update REF-038 而非建新 REF
- 累積 5+ 次跳流程的 PR 後可再回顧本 ADR 是否要 escalate 成 SOP 補丁（加入 RSX_SOP §2.0 作為 L0/L1/L2 之外的明文「lean-direct」檔）
