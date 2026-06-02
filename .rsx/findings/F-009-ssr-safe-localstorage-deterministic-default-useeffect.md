---
id: F-009
title: "SSR 安全初始化：deterministic default + useEffect 讀 localStorage 模式（Hydration Mismatch 防護）"
status: confirmed
change: capture-hud-full-reimplementation
date: 2026-06-03
references_to: [REF-006, ADR-09]
referenced_by: [ADR-08, ADR-09]
supporting_refs: [REF-006]
---

## 結論 / 數據

- **根因**：Next.js App Router 中，Client Component 在 Server 端也會執行一次（SSR），此時 `localStorage` 不存在（ReferenceError）。若 `useState` 初始值使用 `typeof window !== "undefined" ? localStorage.getItem(...) : null` 這類條件判斷，或在 `useState` initializer 中直接讀 `localStorage`，SSR 與 CSR 渲染結果不同，導致 React Hydration Mismatch warning 或 error。
- **量化驗證**：`CaptureHudAdjusterClient.tsx` 以 deterministic 常數值作為所有 `useState` 初始值（例如 `useState(true)` 代表 darkMode 預設深色、`useState("你方")` 代表左方名稱預設），mount 後再透過 `useEffect(() => { ... }, [])` 讀取 `localStorage` 並調用 setter。`npx tsc --noEmit` 無 error，TypeScript 嚴格模式下不需要任何 `typeof window` guard（N=1）。
- **模式摘要**：
  ```typescript
  // 正確（deterministic default）
  const [leftName, setLeftName] = useState("你方");   // SSR/CSR 一致
  const [darkMode, setDarkMode] = useState(true);     // SSR/CSR 一致
  
  useEffect(() => {                                   // client-only
    const ln = localStorage.getItem("outpost_leftName");
    if (ln) setLeftName(ln);
    // ...更多 localStorage 讀取
  }, []);
  
  // 錯誤（避免）
  const [leftName, setLeftName] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("outpost_leftName") ?? "你方"
      : "你方"
  );  // 可能 Hydration Mismatch
  ```
- **適用條件**：此模式在「Server 端預設值語意上合理」的場景天然有效。若預設值不明確（例如「用戶上次選的顏色，無快取時無預設」），則需搭配 `[hasMounted, setHasMounted]` 模式延遲渲染，或於 `useEffect` 後再 render 對應 UI。

## 與既有 REF 一致或矛盾

與 **REF-006**（Next.js Client Component Hydration 條件式 Dev UI）方向一致：REF-006 記錄了 `"use client"` 指令與 conditional dev UI 的正確做法。本 Finding 為 REF-006 在 localStorage 初始化場景的具體應用，提供了更明確的「deterministic default + useEffect」模式表述。與 ADR-06 的 per-user localStorage key 規則正交（ADR-06 管 key 命名，本 Finding 管初始化時序）。

## 對後續影響

- **所有含 localStorage 讀取的 Client Component**：應在 `useState` 初始值填入具語意的常數，把 localStorage 讀取移入 `useEffect(() => { ... }, [])`。
- **HUD 設定類元件**：`outpost_leftName`、`outpost_rightName`、`outpost_repoOwner`、`outpost_percent` 四個 localStorage key 均以此模式管理，已確認無 Hydration 問題。
- **與 ADR-06 的組合**：per-user localStorage key（`user_profile_hub_${userId}`）同樣應遵守此模式，在 `useEffect` 中讀取，不得在 `useState` initializer 中直接讀取。
