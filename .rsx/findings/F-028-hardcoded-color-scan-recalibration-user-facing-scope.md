---
id: F-028
title: 硬碼顏色實測規模為估算 10 倍，但使用者面向去重後僅 127 種 → 遷移範圍限縮至使用者面向檔案
status: active
references_to: [REF-034]
referenced_by: [ADR-27]
change: add-standalone-theme-style
date: 2026-06-12
---

## 發現

apply Phase 0.2 全域掃描（完整 Tailwind 調色盤 × 12 種屬性前綴）實測：

| 範圍 | 出現次數 | 檔案數 | 去重 class 值 |
|---|---|---|---|
| 全 src | ~1,562 | 31 | — |
| 開發者後台頁（capture-hud/DeveloperConsole/adjuster 等）| ~1,100 | 8 | — |
| **使用者面向檔案**（首頁/廣場/個人/玩家詳細/分享/共用元件）| **~419** | **23** | **127** |

REF-034 原估「145 處 / 11 檔」為低估（explorer 當時 grep 的屬性前綴與調色盤名單較窄）。

頻率分布高度集中：`text-zinc-100~600` 文字層級佔 165 處、rose/amber/blue 狀態色系約 60 處 → 語意歸類後預估 15~25 個 token 即可覆蓋，與 design.md D1 原估一致。

## 影響決策

1. **遷移範圍限縮至使用者面向檔案**（~419 處 / 23 檔）：開發者後台是內部工具，不需吃主題；spec 驗收場景本來就只列四大頁面。後台 ~1,100 處列入豁免清單（理由：developer-only 內部工具，主題預覽的目的是看使用者頁面）。
2. 「+15~25 新 token」估算維持有效（127 種去重值高度可歸類）。
3. 工作量估算上修：原 30 分鐘 regex 批次 → 預估 2-4 小時（23 檔逐檔遷移 + 視覺回歸）。

## 引用場景

add-standalone-theme-style design.md 數字依據校準、spec 完備性掃描豁免清單、tasks Phase 1 範圍。
