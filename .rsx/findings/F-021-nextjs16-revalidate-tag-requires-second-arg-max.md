---
id: F-021
type: finding
title: Next.js 16.2.6 revalidateTag 需傳第二參數 "max"，傳一個參數會 TypeScript 型別錯誤
status: confirmed
confidence: high
references_to: []
referenced_by: [ADR-18]
---

## 結論 / 數據

Next.js 16.2.6 的 `revalidateTag` 函式簽名為：

```typescript
revalidateTag(tag: string, profile: "edge" | "max"): void
```

第二個參數 `profile` 為必填。傳入單一參數會出現：
```
TypeScript error: Expected 2 arguments, but got 1.
```

**正確用法**：
```typescript
revalidateTag("public-profiles", "max")
```

**發現方式**：初版實作使用 `revalidateTag("public-profiles")`，`npm run build` 失敗，從 runtime 源碼（`node.revalidateTag.toString()`）確認第二參數存在。commit b26c7d2 修復。

**N = 1**（本專案驗證，Next.js 16.2.6 / Node.js environment）。

## 與既有 REF / Finding 一致或矛盾

無直接相關的既有 Finding。此為 Next.js 16.x 特定 API 變更，與 14.x/15.x 的單參數 `revalidateTag` 不同，屬版本升級陷阱。

## 對後續影響

1. 本專案所有 `revalidateTag` 呼叫均應傳兩個參數（tag + "max"）
2. 若未來升級 Next.js 版本，需確認此 API 簽名是否再次變更
3. `revalidatePath` 同樣需驗證是否有類似的版本差異（目前本專案未使用）
