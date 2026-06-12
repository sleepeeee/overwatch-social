---
affects_consumers: ["CLAUDE.md"]
deferred_consumers: []
related_claims: []
---

# Proposal: add-standalone-theme-style

> **最終採用結果（2026-06-12）**：採用 What Changes 第 1、2 項與第 4 項的機制層（解鎖 + 白名單 + 持久化）；第 3 項三套主題與第 4 項的 UI 入口（ThemeSwitcher 掛載）經完整實作與使用者驗收後**否決移除**（neon-esports 驗收通過但暫不採用；minimal-magazine 驗收未過，見 F-029；retro-arcade 使用者檢視後一併不採用）。外觀維持 original-baseline 完全不變。

## Why（含 reframe 後的假設）

OW Social 目前視覺被鎖死在單一主題：

1. **ThemeContext 硬鎖**（`src/context/ThemeContext.tsx`）：`setTheme()` 無條件覆寫回 `original-baseline`，既有的 5 套主題 class 形同死碼（REF-032 已定位根因與解鎖風險）。
2. **Token 覆蓋不完整**：全站有 **145 處硬碼 Tailwind 顏色 class、分布 11 個檔案**（REF-034 量化），即使解鎖切換，新主題也只能改到吃 `var(--theme-*)` 的局部，無法呈現「完全不一樣的風格」。
3. **雙 token 體系未橋接**：shadcn/ui 語意 token（`--primary` 等）與自有 `--theme-*` 並存但無對映規範（REF-033），新主題若只改一層會出現風格撕裂。

使用者需求（已拍板）：**單獨新增主題設定，原 original-baseline 完全不動**；先做開發者預覽；一次做三套風格（暗黑霓虹電競 / 亮色極簡雜誌 / 復古像素街機）；覆蓋整站全頁面。

**現在卡住什麼（具體案例）**：使用者（maintainer）2026-06-12 提出「重頭設計一套完全不一樣風格的介面」的明確需求——在當前架構下此需求**物理上不可達成**：即使寫好新主題 class，也只能改動約 30 個變數覆蓋的卡片/輸入框局部，11 個檔案 145 處硬碼顏色（含首頁視覺、FloatingDock、廣場）紋風不動，呈現出來只會是「半套換膚」。token 地基不補，任何新風格需求都會卡在同一面牆。

**Why now（賦能因素 + 時間錨點）**：(a) 賦能因素——EXPLORE 階段已完成完整知識地基（REF-028~035，§1.3 council CONSENSUS PASS）：frontend-design skill 選型確認、FOUC 四方案比較、token 橋接策略 A、145 處遷移點量化與遷移策略皆已就緒，此前並不具備；(b) 時間錨點——平台已於 2026-06-11 完成 beta 推廣前評估（project-beta-launch-readiness），推廣啟動在即，視覺差異化素材（多風格截圖/宣傳圖）直接依賴本 change 產出。無外部競爭窗口主張（誠實標注：核心驅動為賦能因素成熟 + 推廣時程，非市場事件）。

## What Changes

1. **Token 地基擴充（behavior-preserving）**：把 145 處硬碼顏色遷移為 `var(--theme-*)` 引用；original-baseline 主題 class 補上對應變數定義，使**預設外觀位元級不變**。
2. **shadcn 橋接層**：依 REF-033 策略 A，每個主題 class 同時定義 shadcn 語意層 + OW 自有層（≈ 32 tokens）。
3. **三套新主題 class**（只新增、不修改既有）：
   - `theme-neon-esports`（暗黑霓虹電競）
   - `theme-minimal-magazine`（亮色極簡雜誌）
   - `theme-retro-arcade`（復古像素街機）
   設計過程使用 frontend-design skill + DERIV-REF-035 的 prompt 約束模板；**每套主題各設一道使用者驗收 checkpoint**（截圖驗收通過才進下一套），控制三套並行的設計品質風險。
4. **Developer 預覽解鎖**：ThemeContext 解除硬鎖，但主題切換 UI（StylePicker）僅 developer 角色可見可用；一般用戶與未登入者永遠拿到 original-baseline。
5. **FOUC 範圍限定**：因預設主題不變、切換僅 developer 端內預覽，本 change 不引入 cookie/inline-script 級 FOUC 防護（REF-032 方案保留給未來「開放全用戶切換」的 change）。**邊界條款**：此決策僅在「developer-only 預覽」邊界內成立；一旦開放任何非 developer 受眾切換主題，必須重新評估並補 FOUC 防護（已寫入 spec scenario）。

## Capabilities

- `theme-token-foundation`：全站顏色 token 化（新主題可 100% 覆蓋視覺）
- `standalone-theme-presets`：三套可並存的新主題設定檔
- `developer-theme-preview`：developer-only 主題切換預覽

## Impact

- **不變**：一般用戶看到的整站外觀、所有功能邏輯（Server Actions / Auth / DB 不動）
- **變**：`globals.css`（+3 主題 class + token 擴充）、`ThemeContext.tsx`（解鎖 + 角色 gating）、11 個含硬碼顏色的元件檔（class → 變數引用）、StylePicker（developer gating + 掛載至 layout）
- **文件消費者**：專案 `CLAUDE.md`（ThemeContext「鎖定 original-baseline 單主題」描述需更新）
