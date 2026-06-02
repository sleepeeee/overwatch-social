---
id: F-008
title: "TypeScript template literal 中 Bash 變數必須用 \\${} 轉義（GIT_HOOK_SCRIPT 案例）"
status: confirmed
change: capture-hud-full-reimplementation
date: 2026-06-03
references_to: [REF-015, ADR-08]
referenced_by: [ADR-08]
supporting_refs: [REF-015]
---

## 結論 / 數據

- **根因**：TypeScript（與 JavaScript）的 template literal（backtick string）以 `${...}` 語法作為插值符號。當 template literal 內含有 Bash 腳本，且 Bash 腳本使用 `$(...)` 命令替換或 `${VAR}` 變數展開時，若寫成 `${ ... }` 開頭形式，TypeScript compiler 會嘗試將其解析為 TS 插值表達式，導致型別錯誤（或語意錯誤）。
- **量化驗證**：`CaptureHudAdjusterClient.tsx` 中 860 行的 GIT_HOOK_SCRIPT 常數（`const GIT_HOOK_SCRIPT = \`...\``），其中 Bash 變數 `${RAW_LOGS}` 必須寫成 `\${RAW_LOGS}`；Bash heredoc 中的 `${raw_data}` 同樣需轉義。`npx tsc --noEmit` 驗證通過（N=1，TypeScript 層）。
- **具體規則**：
  | Bash 語法 | TS template literal 中寫法 |
  |---|---|
  | `$(command)` | `\$(command)` |
  | `${VARNAME}` | `\${VARNAME}` |
  | `$((expr))` | `\$((expr))` |
  | 普通 `$var`（無花括號）| `$var`（不需轉義，TS 不識別）|
- **驗證方法**：`npx tsc --noEmit` 無 error；代碼可見於 `CaptureHudAdjusterClient.tsx` 第 14 行（`RAW_LOGS=\$(git log ...)`）及第 22 行（`raw_data = """\${RAW_LOGS}"""`）。

## 與既有 REF 一致或矛盾

無直接相關的現有 REF 記錄此規則。REF-015 為 HTML 設計稿分析，描述了 GIT_HOOK_SCRIPT 的功能需求，但未涉及 TS 實作層的轉義問題。本 Finding 補充了從 HTML 設計稿移植到 TypeScript 元件時的一個非顯然技術陷阱。

## 對後續影響

- **任何需要在 TS/JS template literal 中內嵌 Bash 腳本的場景**（如 HUD 手冊面板、部署指令顯示、教學代碼區塊）：凡 Bash 使用 `${...}` 或 `$(...)` 形式，必須前置反斜線轉義。
- **未來 HUD 手冊更新**：若更新 GIT_HOOK_SCRIPT 內容，需維持此轉義規則，否則 TypeScript 編譯器將報錯。
- **複製按鈕功能驗收**：手冊 Tab 的「複製腳本」按鈕應驗證複製出來的文字中 `\$` 已正確還原為 `$`（template literal 執行後轉義字元消失），`navigator.clipboard.writeText(GIT_HOOK_SCRIPT)` 天然正確，因為 JS 在執行 template literal 時已將 `\${...}` 還原為 `${...}`。
