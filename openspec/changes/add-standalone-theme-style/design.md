# Design: add-standalone-theme-style

## Context

globals.css 已有 `@theme inline` + 約 30 個 `--theme-*` 變數與 5 套主題 class，但：(a) ThemeContext 硬鎖 original-baseline；(b) 145 處硬碼顏色 class（11 檔）不受變數控制；(c) shadcn 語意 token 與 `--theme-*` 無對映規範。本 change 在**不動 original-baseline 既有定義與預設外觀**的前提下，補完 token 地基並新增三套可並存主題，開發者可預覽切換。

知識地基：REF-028（frontend-design skill）、REF-029（Tailwind v4 @theme）、REF-030（shadcn theming）、REF-031（gaming UI 趨勢）、REF-032（FOUC 四方案）、REF-033（token 橋接策略 A）、REF-034（145 處遷移策略）、DERIV-REF-035（skill prompt 約束模板）。

## Goals / Non-Goals

**Goals**
- G1：全站顏色 100% token 化；original-baseline 啟用時視覺與遷移前一致
- G2：新增三套主題 class（neon-esports / minimal-magazine / retro-arcade），與既有 5 套並存
- G3：developer 角色可在 UI 即時切換預覽；一般用戶與 anon 永遠 original-baseline
- G4：未來新增第 4、5 套主題時零遷移成本（只寫一個 class）

**Non-Goals**
- 不開放一般用戶切換主題（含切換 UI、偏好持久化、cookie/inline-script FOUC 防護）→ 留給後續 change
- 不改任何功能邏輯（Server Actions / Auth / DB / RLS 全不動）
- 不重寫版面結構（layout/間距骨架沿用；主題差異由 token 表達：色彩、字體、圓角、陰影、邊框、貼圖質感）
- 不動既有 5 套主題 class 的定義內容

## 假設修正（Stage 2）

- **原始假設**：「整站重設計 = 重寫元件」。情報後 reframe：現有 token 架構 + class 並存設計本來就支援多主題，真正缺的是 token 覆蓋完備性（145 處）與切換通道；重寫元件反而違反「原本的不改」的使用者約束。
- **目標性質**：這是「驗證 X 是否有用」型——驗證「純 token 層能否表達三種差異極大的風格」。**預定義詮釋框架**：
  - 三套主題經 developer 預覽驗收，視覺辨識度達標（不靠改版面）→ token-only 路線成立，未來主題擴充走同路
  - 若 retro-arcade（最依賴字體/質感的風格）無法靠 token 表達 → 記錄為 negative result（Finding），結論「token-only 有風格表達上限，像素風需元件級變體」，不硬塞
- **Novelty claim（可偽證）**：本 change 新意 = 本專案 prior work（既有 5 套主題 class、REF-015 HUD 移植）皆未做到「硬碼顏色全量遷移 + 雙 token 體系橋接 + 角色 gating 預覽」三者組合；此主張若既有 5 套主題 class 中任一套已能在不改元件的情況下覆蓋廣場/首頁/詳細頁的主視覺（可由切換後截圖證偽），則為假。

## 決策

### D1 — 遷移策略：語意 token 擴充 + 逐檔替換（採 REF-034 策略 A+C）
145 處硬碼顏色按**語意角色**歸類（背景/表面/主文字/次文字/accent/邊框/狀態色等），擴充 `--theme-*` token 集（估 +15~25 個新 token，最終數以實際歸類為準），元件 class 改為 Tailwind arbitrary value 或 `@theme inline` alias（讓 `bg-theme-surface` 這類 utility 直接吃變數）。**拒絕**逐色硬對映（`purple-400` → `--purple-400`）：那只是把硬碼搬家，無法表達「亮色主題把紫換成橘」的語意差異。

### D2 — behavior-preserving 驗證：截圖回歸
遷移前先存全站基準截圖（首頁/廣場/個人/玩家詳細 × desktop/mobile）；遷移後 original-baseline 下重拍比對。容差：肉眼不可辨（允許抗鋸齒級差異）。工具：playwright（專案已有 E2E 基建，REF-018）。

### D3 — shadcn 橋接：策略 A（REF-033）
每個主題 class 同時定義 shadcn 語意層（`--primary`、`--border` 等）與 OW 自有層；以 original-baseline 現值為對映基準表，寫入 globals.css 註解錨點，後續主題照表填值。

### D4 — Developer gating 位置：UI 層 gating + Context 解鎖
ThemeContext 移除硬鎖（`setTheme` 接受白名單內任意主題）；StylePicker 僅在 `useDevMode()` 為 developer 時渲染（掛 layout 層右下浮動入口，全站可預覽）。**不做** server-side gating：主題純視覺、無資料面，非安全邊界（與 useDevMode 既有定位一致）。一般用戶因無切換入口，state 永遠是預設值 original-baseline。
偏好持久化沿用既有 `theme-dark` localStorage 模式擴充 `theme-style` key，僅 developer 寫入。

### D5 — FOUC 處理範圍：維持現狀 + 已知限制記錄
預設主題 SSR 即為 original-baseline（`<html>` 靜態 class），一般用戶零 FOUC。developer 切非預設主題後重新整理會閃一下基準主題（useEffect 補 class 的已知行為，REF-032）——**接受**：受眾僅 developer、屬預覽工具品質等級。在 code 註解（`TODO(theme-FOUC)`）與 CLAUDE.md 標注此限制與升級路徑（cookie 方案）。

### D6 — 三套主題設計流程：frontend-design skill + DERIV-REF-035 約束
每套主題一個獨立設計 pass，prompt 約束：只輸出 token 值（不改元件結構）、沿用既有字級系統（retro-arcade 允許替換 display 字體但 body 字體須維持可讀性）、色彩對比至少 WCAG AA（4.5:1 主文字）。風格錨點：
- `theme-neon-esports`：深底 + cyan/magenta 霓虹 accent、發光邊框、飽和度比亮色高 10-20%（REF-031）
- `theme-minimal-magazine`：白底大留白、近黑文字、細線分隔、單一強調色
- `theme-retro-arcade`：8-bit 調色盤、像素感邊框/陰影、display 字體換 pixel 系（body 維持系統字體）

## Risks / Trade-offs

| 風險 | 等級 | 緩解 |
|---|---|---|
| 遷移改壞 original-baseline 外觀 | 高 | D2 截圖回歸；逐檔小步遷移、每檔比對 |
| retro-arcade 靠 token 表達不出像素感 | 中 | 預定義詮釋框架：允許 negative result，不硬塞元件級 hack |
| 語意歸類錯誤（同色不同義被併成同 token）| 中 | 歸類表先產出供人工掃一眼再動手；遷移 PR 拆小 |
| 145 處之外仍有漏網硬碼（inline style、SVG fill）| 中 | 遷移完成後二次全域掃描（含 `style=`、`fill=`、hex 字面值）|
| dark mode 維度與主題維度交互（`.dark` × theme class）| 中 | 遷移時凍結 isDark 行為不動；新主題自帶明暗定位（esports/arcade 恆暗、magazine 恆亮），首版不做 theme×dark 矩陣 |

## 數字依據（3.7）

- 「145 處 / 11 檔」：rsx-explorer grep 實測（REF-034）
- 「≈ 32 tokens / 主題」：REF-033 對 shadcn 層 + OW 自有層的盤點
- 「+15~25 新 token」：以現有 30 個 `--theme-*` 為基數，對 145 處按語意角色去重的粗估；apply Task 0 實測校準
- 截圖回歸頁面 × 視口 = 4 頁 × 2 視口 = 8 基準圖/主題態

## Rationale 表（技術選擇 ↔ prior work）

| 選擇 | 依據 REF |
|---|---|
| token-only 多主題（不重寫元件）| REF-029（@theme 多主題）、REF-030（shadcn theming）|
| 策略 A 雙層同步定義 | REF-033 |
| A+C 遷移法（語意 alias + 批次替換）| REF-034 |
| developer 預覽不做 FOUC 硬防護 | REF-032（四方案成本比較）|
| frontend-design skill + prompt 約束 | REF-028、DERIV-REF-035 |
| 霓虹電競風 token 參數方向 | REF-031 |

## Dataset Card

未觸發（無 training/CNN/model 強觸發詞；弱觸發詞僅 image 出現於截圖回歸語境，< 2 個）。
