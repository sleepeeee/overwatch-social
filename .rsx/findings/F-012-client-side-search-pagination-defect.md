---
id: F-012
type: finding
title: Client-side search 在有 LIMIT 的分頁查詢上是設計缺陷，必須改為 server-side ilike
status: confirmed
confidence: high
references_to: [REF-005, REF-006, ADR-12]
referenced_by: [ADR-12, ADR-14]
supporting_refs: [REF-005, REF-006]
---

## 結論 / 數據

`developer-console-enhancements` change 的 §6.7 Gemini 初審（4/10）識別出一個架構級設計缺陷（Critical C1）：
原設計在 Client Component 收到 `getAllProfilesForDeveloper()` 回傳的全部 100 筆資料後，
在 client-side 做 `battle_tag.toLowerCase().includes(search.toLowerCase())` 過濾。

當查詢使用 `.range(0, 99)` 限制回傳筆數時，client-side search 只能搜尋這 100 筆子集，
若目標 profile 在第 101 筆之後，搜尋結果為假性「找不到」。

修正後設計（commit 2201118）：
- `getAllProfilesForDeveloper(search?: string)` 接受 search 參數
- Server Action 內部使用 `.ilike("battle_tag", \`%${search}%\`)` 在 DB 層過濾
- Client Component 在搜尋框 `onChange` 時呼叫 Server Action（搭配 `useTransition` 避免 UI freeze）
- 搜尋結果範圍：全表（受 RLS developer policy 保護）

量化影響：
- 修正前：搜尋結果最多 100 筆，假陰性率隨資料成長線性增加
- 修正後：每次搜尋均為 DB 全表 ilike 掃描，結果完整
- §6.7 評分：初審 4/10 → 修正 Critical 後 6.5/10（PASS with fixes）

## 與既有 REF 一致或矛盾

REF-005（開發者後台功能空白清單）第 2 項「用戶管理：無法查看/搜尋具體用戶」，
本 Finding 記錄了補齊該功能空白時必須採用 server-side search 的設計要求。

REF-006（Supabase RLS developer policy 模式）定義了 profiles 表的開發者讀取 policy，
server-side ilike 搜尋依賴此 policy 才能跨用戶掃描，兩者設計互為前提。

## 對後續影響

1. **通用架構原則**：任何含 `LIMIT`/`RANGE` 的 Supabase 查詢，若需要搜尋過濾，
   必須在 Server Action 層使用 `.ilike()` 或 `.textSearch()`，禁止在 Client Component 做 array filter。

2. **瀏覽廣場潛在同類問題**：`browse/page.tsx` 的 `OverwatchSquare` 若有未來搜尋需求，
   應直接套用此模式，不走 client-side filter 捷徑。

3. **`useTransition` 配合 Server Action 搜尋**：搜尋框 onChange 觸發 Server Action 時，
   必須搭配 `useTransition`（`startTransition(() => action())`）避免 React Concurrent Mode 下 UI 凍結。
   此為 Next.js Server Action 搜尋的標準模式。
