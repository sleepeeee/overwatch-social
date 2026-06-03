---
id: ADR-18
title: 廣場查詢採 unstable_cache + revalidateTag("max") 作為快取策略
status: Accepted
date: 2026-06-04
references_to: [F-021]
referenced_by: []
---

## 背景

廣場（`browse/page.tsx`）每次載入都呼叫 `getPublicProfiles` Server Action，直接打 Supabase DB。在 F-020 修復 authLoading guard 後，Server Action 往返延遲成為主要瓶頸（~1-2s）。先前嘗試過 `unstable_cache` 但因 cache stale 問題移除。

## 決策

使用 `unstable_cache` 包裝 `getPublicProfiles`：

```typescript
export const getPublicProfiles = unstable_cache(
  async (game, search, limit, offset) => { /* ... DB query */ },
  ["public-profiles"],
  { tags: ["public-profiles"], revalidate: 60 }
)
```

在 `saveProfile` 和 `saveDisplayName` 成功後呼叫 `revalidateTag("public-profiles", "max")` 立即使快取失效。

## 替代方案評估

| 方案 | 評估 | 捨棄理由 |
|---|---|---|
| `revalidatePath` | 只失效 Full Route Cache | 對 Client Component / Server Action cache 無效；廣場是動態渲染，不走 Full Route Cache |
| 純 TTL 無手動失效 | 最多 60s 舊資料 | 用戶存檔後刷頁看到舊資料，體驗差 |
| 無快取（現狀） | 每次打 DB | 延遲 ~1-2s，廣場無回應感強 |
| `unstable_cache` + `revalidateTag("max")` | 選定方案 | 60s TTL 保護 DB；存檔立即失效保持新鮮度 |

## 理由

- `unstable_cache` 是 Next.js App Router 官方提供的 Server Action / Server Component 快取機制
- `revalidateTag` 手動失效確保「用戶存檔立即在廣場看到更新」的 UX 一致性
- 60s TTL 作為保護層，即使失效邏輯漏掉某條路徑，最多 60s 後自動刷新

## 技術注意事項

`revalidateTag` 在 Next.js 16.2.6 需傳第二參數 `"max"`（見 F-021）。

## 影響範圍

- 修改：`src/app/actions/browse.ts`（`unstable_cache` 包裝）
- 修改：`src/app/actions/profile.ts`（`revalidateTag` 呼叫）

## 相關 ADR / Finding

- F-021：Next.js 16.2.6 `revalidateTag` 需要第二參數的具體陷阱
