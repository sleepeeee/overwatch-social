---
id: ADR-07
title: "Server Component 包 Client Component 邊界：generateMetadata + html-to-image 共存設計"
status: Accepted
change: share-page-completion
date: 2026-06-03
references_to: [REF-014, F-007]
referenced_by: [F-007]
---

## 決策

`/share/[id]` 拆分為兩層：

```
page.tsx（Server Component）
  ├── generateMetadata()  ← 動態 og meta（用真實資料）
  └── <ShareCardClient cardData={...} />  ← Client Component
        ├── OWCard 渲染
        ├── html-to-image 下載
        └── useAuth() 登入狀態
```

`page.tsx` 無 `"use client"` directive，負責資料取得（`getPublicProfile`）與 meta 生成；`ShareCardClient.tsx` 帶 `"use client"`，負責所有 DOM/hook 邏輯。

## 背景

原始 `share/[id]/page.tsx` 為單一 Client Component（`"use client"` + mock 資料）。Next.js App Router 中，`generateMetadata` 只能在 Server Component 宣告；而 `html-to-image`（`dom-to-image-more`）需要 DOM API，只能在 Client Component 中執行。兩個需求互斥，必須拆層。

## 被拒絕的方案

| 方案 | 拒絕理由 |
|---|---|
| 維持 Client Component，用 `<head>` 手動注入 meta | `<head>` 注入在 App Router 已廢棄；社群爬蟲在 JS 執行前抓取，CSR 注入無效 |
| Route Handler 回傳靜態 meta HTML | 新增複雜度，需維護兩套路徑；Next.js 已有 generateMetadata 標準機制 |
| 全部改 Server Component，移除 html-to-image | 損失圖片下載功能，使用者體驗倒退 |

## 影響

- **跨多 task / change**：任何未來頁面若同時需要動態 og meta 與 Client 端 DOM 操作，應複用此拆分模式（Server wrapper + Client leaf）。
- **Props 邊界**：Server Component 傳遞給 Client Component 的 prop 必須是可序列化型別（`OWPlayerCard` 為純 object，符合條件）；不可傳 React Server Component 實例、函式、Class 實例。
- **TypeScript**：`cardData: OWPlayerCard | null` 需在 Client 端做 null guard（ShareCardClient.tsx 顯示「找不到名片」UI）。
- **social_channels 設計**：`getPublicProfile` 回傳 `social_channels: {}` 空物件（public_profiles view 不含此欄），符合 OWPlayerCard 型別定義（`Record<string, string>`）且不暴露隱私資料；Gemini §6.7 的 Major 評判為誤判，此為正確設計（參見 propose_checklist.md §6.7 §6.8 合成 PASS）。
