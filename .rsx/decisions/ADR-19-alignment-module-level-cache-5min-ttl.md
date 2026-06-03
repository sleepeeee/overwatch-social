---
id: ADR-19
title: 英雄對準參數採 module-level 物件 cache + 5 分鐘 TTL
status: Accepted
date: 2026-06-04
references_to: []
referenced_by: []
---

## 背景

`getHeroAlignments()` Server Action 每次 Component mount 都打一次 DB，讀取幾乎不會改變的英雄立繪對準參數（51 位英雄的 scale/translate_x/translate_y）。此資料唯有 developer 用後台調整時才會更新，但快取完全缺失。

## 決策

建立 `src/app/actions/alignmentCache.ts`，使用 module-level 物件 cache：

```typescript
let cache: { data: AlignmentConfig; expires: number } | null = null
const TTL_MS = 5 * 60 * 1000  // 5 分鐘

export function getCachedAlignments(): AlignmentConfig | null { ... }
export function setCachedAlignments(data: AlignmentConfig): void { ... }
export function clearAlignmentCache(): void { cache = null }
```

`getHeroAlignments` 先讀 cache，miss 才打 DB，並在 `saveHeroAlignments` 成功後呼叫 `clearAlignmentCache()`。

## 替代方案評估

| 方案 | 評估 | 捨棄理由 |
|---|---|---|
| `unstable_cache` | Next.js 官方快取 | 對此場景過重；alignment 資料不需 tag 失效粒度；module cache 已足夠 |
| React cache() | Request-level dedup | TTL 太短（每 request 重置）；alignment 跨多個 Component 掛載需要 session-level cache |
| module-level cache（選定）| 簡單、可控 | Node.js serverless warm instance 內有效；5 分鐘 TTL 對準資料已足夠新鮮 |
| 靜態 fallback only | 永遠用 heroAlignments.ts | 失去 developer 調整後即時生效的能力 |

## 理由

- alignment 資料特性：幾乎靜態（developer 偶爾調整），51 筆固定記錄
- module-level cache 在 serverless warm instance 有效，實際效果良好
- 5 分鐘 TTL：developer 調整後最多等 5 分鐘生效（或直接重啟 server），可接受
- `clearAlignmentCache()` 在 saveHeroAlignments 成功後呼叫，確保 developer 存檔後立即看到結果

## 已知限制

- module-level cache 在 serverless cold start 時重置（每個新 instance 第一次仍打 DB）
- 多個 serverless instance 並存時，各 instance 有獨立的 cache（不共享）
- 以上限制對低頻更新的 alignment 資料影響可忽略

## 影響範圍

- 新增：`src/app/actions/alignmentCache.ts`
- 修改：`src/app/actions/alignment.ts`（cache 讀寫）
- 修改：`src/app/actions/saveAlignment.ts`（成功後 clearAlignmentCache）
