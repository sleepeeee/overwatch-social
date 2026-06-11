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
- [ ] 2.2 驗證：切換既有任一主題 class（手動加 html class）時 shadcn 元件區塊無配色撕裂

## Phase 3 — Developer 預覽通道

- [ ] 3.1 ThemeContext 解除硬鎖：setTheme 接受白名單主題（白名單 = 既有 5 + 新 3）；新增 `theme-style` localStorage 持久化
- [ ] 3.2 StylePicker 接上 useDevMode() gating：掛 layout 層右下浮動入口、僅 developer 渲染；選單列出全部可用主題
- [ ] 3.3 FOUC 已知限制註解（`TODO(theme-FOUC)`）+ 一般用戶隔離驗證（anon / 一般帳號看不到入口、恆 original-baseline）

## Phase 4 — 三套新主題設計（frontend-design skill，每套含設計審查 checkpoint）

- [ ] 4.1 `theme-neon-esports`：skill 設計 pass（DERIV-REF-035 prompt 約束 + REF-031 參數方向）→ 寫入 globals.css → 4 頁截圖 → **使用者驗收 checkpoint**
- [ ] 4.2 `theme-minimal-magazine`：同上流程（白底大留白方向）→ **使用者驗收 checkpoint**
- [ ] 4.3 `theme-retro-arcade`：同上流程（8-bit 調色盤 + pixel display 字體）→ **使用者驗收 checkpoint**；若 token-only 表達不出像素感 → 依詮釋框架記 negative result，不硬塞元件級 hack
- [ ] 4.4 三套主題 WCAG AA 對比抽查（主文字 ≥ 4.5:1）

## Phase 5 — 收尾

- [ ] 5.1 npm run build 通過 + playwright E2E 既有測試不紅
- [ ] 5.2 更新專案 CLAUDE.md（ThemeContext 描述：解鎖 + developer gating + FOUC 已知限制）
- [ ] 5.3 §6.7 Codex 實作審查（apply 完成後）
