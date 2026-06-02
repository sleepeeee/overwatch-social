---
id: ADR-09
title: "SSR 安全初始化模式：deterministic default + useEffect 讀 localStorage（vs 條件式 window guard）"
status: Accepted
change: capture-hud-full-reimplementation
date: 2026-06-03
references_to: [REF-006, F-009]
referenced_by: [F-009]
---

## 決策

所有含 localStorage 讀取的 Next.js Client Component，`useState` 初始值一律填入語意合理的 deterministic 常數（例如 `useState(true)` 表示 darkMode 預設深色），localStorage 讀取移至 `useEffect(() => { ... }, [])` 中執行，不在 `useState` initializer 或 render 路徑中使用 `typeof window !== "undefined"` 條件判斷。

```typescript
// 本 change 的實作範例（CaptureHudAdjusterClient.tsx）
const [darkMode, setDarkMode]     = useState(true);
const [leftName, setLeftName]     = useState("你方");
const [rightName, setRightName]   = useState("朋友");
const [repoOwner, setRepoOwner]   = useState<"left" | "right">("left");
const [leftPercent, setLeftPercent] = useState(68);

useEffect(() => {
  const ln = localStorage.getItem("outpost_leftName");
  const rn = localStorage.getItem("outpost_rightName");
  const ro = localStorage.getItem("outpost_repoOwner") as "left" | "right" | null;
  const pct = localStorage.getItem("outpost_percent");
  if (ln) setLeftName(ln);
  if (rn) setRightName(rn);
  if (ro) setRepoOwner(ro);
  if (pct !== null) setLeftPercent(parseInt(pct, 10));
  if (ln || pct) setPreset("custom");
}, []);
```

## 背景

Next.js App Router 對 Client Component 執行 SSR（Server-Side Rendering）預渲染，此時 `localStorage`、`window`、`document` 等 Browser API 不存在。SSR 與 CSR 渲染輸出不一致會觸發 React Hydration Mismatch，輕則 console warning，重則 UI 閃動或 error boundary 觸發。

CaptureHudAdjusterClient.tsx 的 HUD 狀態（名稱、佔領比例、倉庫所有者、自訂 preset）均儲存於 localStorage，需在 mount 後讀取。

## 被拒絕的方案

| 方案 | 拒絕理由 |
|---|---|
| `typeof window !== "undefined" ? localStorage.getItem(...) : defaultValue` 在 useState initializer | SSR 回傳 defaultValue，CSR 若讀到不同值會造成 Hydration Mismatch；條件式遍佈各 state 宣告，可讀性差 |
| `useLayoutEffect` 讀 localStorage | `useLayoutEffect` 在 SSR 環境下不執行（React 會輸出 warning），效果等同 useEffect，但語意更強（同步執行），非必要不用 |
| `"use client"` 搭配 `next/dynamic` 包裝（dynamic import with `{ ssr: false }`）| 增加元件邊界複雜度；頁面初始渲染出現空殼 flash（沒有 skeleton）；本場景不需要，過度設計 |
| 直接在 Server Component 傳初始 localStorage 值（props drilling）| localStorage 為 client-side 儲存，Server 無法存取；需透過 cookie 橋接才能讀到，增加複雜度且非本 change 範疇 |

## 影響

- **TypeScript 嚴格模式相容**：所有 state 型別由初始值 infer 得出，無需 `string | null` 混合型別處理 null 的複雜度；useEffect 內的 localStorage 讀取結果型別一致，只需 null guard（`if (ln) setLeftName(ln)`）。
- **跨元件一致性**：`CaptureHudAdjusterClient.tsx`、`profile/page.tsx`（per-user localStorage key，ADR-06）均已採用此模式，確立為本專案 localStorage 初始化標準。
- **FOUC 考量**：SSR 輸出 deterministic 預設值，CSR mount 後更新為用戶儲存值，可能出現短暫視覺更新（例如名稱從「你方」閃現為用戶設定值）。此為 localStorage-based 個人化的已知限制，可接受（不影響功能正確性；若需消除可改用 cookie 或 Server-side session，為後續升級路徑）。
- **與 ADR-06 的組合**：per-user localStorage key（`user_profile_hub_${userId}`）同樣遵守本 ADR 的時序規則（在 useEffect 中讀取）。
