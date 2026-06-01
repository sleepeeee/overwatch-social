---
id: ADR-03
title: "LoginModal 採共用元件（vs 各頁面自製 overlay）"
status: Accepted
change: auth-ux-login-gate
date: 2026-06-01
references_to: [REF-002, REF-006, F-003]
referenced_by: [F-003]
---

## 決策

抽取 `src/components/LoginModal.tsx` 作為全站共用的登入提示彈窗元件，而非在每個需要 auth gate 的頁面（`profile`、`browse`）各自撰寫 inline overlay 邏輯。

元件介面：
```tsx
<LoginModal
  show={isMounted && !authLoading && !user}
  closable={false}
  title="..."
  description="..."
/>
```

`show=false` 時回傳 `null`（不掛載 DOM），`role="dialog" aria-modal` 提供 a11y 支援，`closable` prop 控制是否允許關閉。

## 考量選項

| 選項 | 優點 | 缺點 |
|---|---|---|
| **共用 LoginModal 元件（採用）** | 文案/樣式/guard 邏輯集中一處；新頁面只需傳 show prop；a11y 修補一次全站生效 | 元件需要足夠通用的 props 設計 |
| 各頁面 inline overlay | 實作快速、可客製化 | 邏輯散落多處；authLoading guard 容易被某頁遺漏（本 change 的根因）；a11y 修補需逐頁重做 |
| 全域 auth context + portal | 最集中 | 過度工程（MVP 階段只有 2 個 gate 點）|

## 理由

1. **根因防護**：F-003 揭示 `authLoading` guard 缺失是 auth flash 的根因；共用元件強制所有消費方透過 `show={isMounted && !authLoading && !user}` 統一傳入，不可能忘記任一 guard。
2. **a11y 集中**：`role="dialog" aria-modal` 與 focus trap 需求只需在 LoginModal 一個元件裡實作，而非每個頁面各自處理（Codex §6.7 C3 條目）。
3. **頁面情境文案**：`title`/`description` props 允許各頁面傳入不同情境文案（profile 頁：「登入後才能建立名片」；browse 頁：通用登入提示），同時共用底層邏輯。
4. **prop-driven guard**：`show=false → null` 的設計使元件在 SSR 時安全，不依賴 DOM API，與 REF-006 hydration guard 原則一致。

## 影響與約束

- 新增任何需要 auth gate 的頁面，**必須**使用 `LoginModal` 而非自製 overlay。
- `closable=false` 用於強制 gate（profile、browse 未登入）；`closable=true` 預留給軟提示場景（未來擴充）。
- focus trap 實作為 backlog 項目（Codex C3 條目），目前版本僅有 `role="dialog" aria-modal`；待補完整 focus management（`useEffect + keydown listener`）。
- `show` prop 的三元 guard（`isMounted && !authLoading && !user`）是此元件的**標準使用方式**，消費方不得簡化為只傳 `!user`。

## 相關 REF / Finding

- REF-002：auth state async 機制（authLoading guard 的理論依據）
- REF-006：hydration guard 模式（isMounted guard 的理論依據）
- F-003：authLoading 缺失根因 → 觸發共用元件的 show prop 設計標準
