# 歸檔報告：capture-hud-full-reimplementation

**歸檔日期**：2026-06-03  
**Change**：`openspec/changes/archive/2026-06-02-capture-hud-full-reimplementation/`

---

## 30 秒速覽

| 項目 | 內容 |
|---|---|
| **解決了什麼** | 朋友用 Gemini 移植的 HUD 調整器缺少手冊 tab、動態比例條、no_author 說明、FORCE_RETRY 按鈕等 30-40% 功能 |
| **核心產出** | `CaptureHudAdjusterClient.tsx`（860 行）：以原始 HTML 設計稿為規格完整重建 |
| **重要發現** | F-008: TypeScript template literal 中 Bash 變數 `${}` 需逸出為 `\${}`；F-009: SSR 安全初始化必須用 deterministic default + useEffect |
| **下一步** | 可直接使用；`手冊` tab 已包含完整的 git hook 部署腳本，朋友可按照說明在 VPS 部署 |

---

## 完整版

### A. 功能清單（對比 HTML 原稿）

| 功能 | HTML 原稿 | 舊 Gemini 版 | 新實作 |
|---|---|---|---|
| Preset 切換 | 5 個 | 6 個（多 live）| 6 個 ✓ |
| 動態滑桿 | ✓ | ✓ | ✓ |
| 陣營設定 | ✓ | 部分 | ✓ |
| HUD 卡片 3 狀態 | ✓ | 部分 | ✓ |
| StatCard 動態比例條 | ✓ | ❌ 50/50 hardcode | ✓ |
| no_author 指令說明 | ✓ | ❌ 缺失 | ✓ |
| error FORCE_RETRY | ✓ | ❌ 缺失 | ✓ |
| **手冊 Tab** | ✓ | ❌ 完全缺失 | ✓ |
| 資源下載 Tab | ✓ | ✓ | ✓ |
| 規格 Tab | ✓ | ✓ | ✓ |
| 向量代碼 Tab | ✓ | ✓ | ✓ |
| git hook 腳本 + 複製 | ✓ | ❌ 缺失 | ✓ |

### B. 技術決策（ADR-08/09）

- **ADR-08**：HTML 設計稿作為移植規格的唯一準則（取代 Gemini 「大概移植」方式）
- **ADR-09**：SSR 安全初始化—— `useState("default")` + `useEffect` 讀 localStorage，不在 lazy initializer 讀 localStorage

### C. 踩坑記錄（F-008/09）

1. **GIT_HOOK_SCRIPT 逸出**：TypeScript backtick template literal 中，Bash 的 `$(command)` 和 `${VAR}` 必須寫成 `\$(command)` 和 `\${VAR}`，否則 TypeScript 編譯器視為 JS 插值並崩潰
2. **SSR localStorage**：Next.js SSR 階段 `window` 為 undefined，直接在 `useState(() => localStorage.getItem(...))` 會 `ReferenceError` 並造成 hydration mismatch

### D. §6.7 E2E 更新記錄

舊 E2E 測試（針對 Gemini 版）的文字在新 UI 不存在，更新為測試新 UI 的正確標識（§6.7 (b) spec/impl 漂移）。

### E. 限制與後續

- 目前 HUD 手冊 tab 描述的是「本地 VPS git hook」方案（與 Vercel 不兼容）；未來若需真正線上更新，需要 GitHub API + Supabase 後端（見之前的整合分析）
- CaptureHudAdjusterClient.tsx 為 860 行單一元件（Gemini Minor 建議拆分，非本次 spec 要求）
