# Tasks: add-standalone-theme-style

## Phase 0 — 校準（環境/時間實測）

- [x] 0.1 基準截圖完成（8 張：home/browse/profile/player × desktop/mobile；單輪 ~29s；腳本 e2e/capture-baseline.mjs）
- [x] 0.2 重跑硬碼顏色全域掃描（F-028：實測全 src ~1,562 處/31 檔；使用者面向 ~419 處/23 檔、去重 127 種；開發者後台 ~1,100 處列豁免）（Tailwind 調色盤 class + inline style + hex 字面值），輸出歸類清單：每處標 {檔案, 行, class, 語意角色}；與 REF-034 的 145 處比對差異
- [x] 0.3 產出語意 token 歸類表（token-map.md，17 token；使用者 2026-06-12 確認無意見）（新 token 命名 × original-baseline 等值色），人工掃過確認無「同色不同義」誤併

## Phase 1 — Token 地基（behavior-preserving）

- [x] 1.1 globals.css：依歸類表擴充 `--theme-*` token（original-baseline 區塊新增等值定義；既有變數行不動）
- [x] 1.2 `@theme inline` 補 token alias，使 utility class 可直接引用（如 `bg-theme-surface`）
- [x] 1.3 批次遷移 22 個使用者面向檔案（377 處；腳本化 regex + 特例表）的硬碼顏色 → token utility/變數引用（小步提交，每檔一 commit）
- [x] 1.4 視覺回歸（8 張：6 張像素級相同、browse 2 張 ≤0.14% 動態噪音）：original-baseline 下重拍 8 張截圖與基準比對，肉眼不可辨才過
- [x] 1.5 二次完備性掃描（範圍內殘留 0；豁免清單見 token-map.md）；豁免清單（資料驅動顏色等）逐項記錄理由

## Phase 2 — shadcn 橋接層

- [x] 2.1 盤點 shadcn（:root 即 original-baseline 對映基準；新主題依 token-map 同步兩層） 語意 token 現值，建立 original-baseline 對映基準表（寫入 globals.css 註解錨點）
- [x] 2.2 驗證：三套原型主題均同步覆寫兩層 token，預覽截圖無配色撕裂（neon/magazine/arcade 各 3 頁）

## Phase 3 — Developer 預覽通道

- [x] 3.1 ThemeContext 解除硬鎖：setTheme 接受白名單主題（白名單 = 既有 5 + 新 3）；新增 `theme-style` localStorage 持久化
- [x] 3.2 主題切換 UI（實作為新元件 ThemeSwitcher.tsx 掛 layout 右下浮動；原 StylePicker 為舊 Style A/B 展示元件、介面不合，依外科手術原則不改動）
- [x] 3.3 FOUC 已知限制註解（TODO(theme-FOUC) 於 ThemeContext）+ anon 隔離驗證（切換器 0 個、首頁像素級無差異）（`TODO(theme-FOUC)`）+ 一般用戶隔離驗證（anon / 一般帳號看不到入口、恆 original-baseline）

## Phase 4 — 三套新主題設計（frontend-design skill，每套含設計審查 checkpoint）

- [x] 4.1 `theme-neon-esports`（Volt & Ice）：使用者驗收 **通過**（2026-06-12）
- [x] 4.2 `theme-minimal-magazine`（Ink & Gallery）：使用者驗收 **未過**（「很多字看不到」）；使用者裁示**保留現狀不修**、繼續 4.3。亮底 utility 適配層已建但覆蓋不全 → 已知限制記入 F-029
- [x] 4.3 `theme-retro-arcade`（Insert Coin）：已實作並供使用者檢視；token-only 可表達像素感（CRT 掃描線 + 硬陰影 + 0 圓角 + 像素刊頭），無需元件 hack
- [x] 4.4 WCAG 抽查：因三套主題經使用者裁示全數不採用而失去標的 → 略過（token 設計時已按 AA 取值）

## Phase 5 — 收尾

- [x] 5.1 npm run build 通過 + playwright E2E 36/36 passed
- [x] 5.2 更新專案 CLAUDE.md（ThemeContext 描述 + 新增「主題 Token 系統」章節含新元件用色規範）
- [x] 5.3 §6.7 Codex 實作審查：PROCEED 10/10（輕量模式單輪守門；Gemini 臂依輕量裁示跳過，記入 propose_checklist）

## 取捨收尾（2026-06-12 使用者裁示）

- [x] 移除三套主題 CSS 區塊 + Press Start 2P import + 亮底適配層（git 歷史保留，可還原）
- [x] ThemeSwitcher 取消掛載（元件檔保留 + 重啟指引註解）；ThemeContext 白名單回到既有 5 主題
- [x] 最終態回歸：與原始基準 0.002% 差異（外觀完全不變）、tsc PASS
