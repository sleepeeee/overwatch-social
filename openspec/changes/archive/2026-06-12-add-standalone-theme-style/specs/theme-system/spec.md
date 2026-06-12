# Spec Delta: add-standalone-theme-style

> **採用範圍備註（2026-06-12 使用者裁示）**：本 change 原規劃三個 capability；最終採用「token 地基 + 主題基礎建設（無 UI 入口）」。三套原型主題（neon-esports / minimal-magazine / retro-arcade）與切換器 UI 經實作、驗收後**否決移除**——設計、截圖與 CSS 完整保留於 git 歷史（commit da0f032 等）與 archive 記錄，重啟成本約一行掛載 + 還原 theme class。詳見 F-029（亮底 negative result）與 notes。

## ADDED Requirements

### Requirement: theme-token-foundation — 全站顏色 token 化（behavior-preserving）

系統 SHALL 將全站使用者面向元件的硬碼 Tailwind 顏色 class 遷移為 `--theme-*` CSS 變數引用，且 original-baseline 主題啟用時的視覺與遷移前一致。

#### Scenario: original-baseline 視覺回歸
- WHEN 完成使用者面向範圍的硬碼顏色遷移（F-028 校準：377 處 / 22 檔 + 品牌色變數化 130+ 處 + CSS class 層）並啟用 original-baseline 主題
- THEN 首頁、廣場、個人檔案、玩家詳細頁在 desktop 與 mobile 視口的截圖
- AND 與遷移前基準截圖比對為肉眼不可辨差異（實測 >10 差異像素 ≤ 0.14%，多數頁面 0.000%）

#### Scenario: 遷移完備性掃描
- WHEN 遷移完成後執行全域掃描（Tailwind 調色盤 class）
- THEN 使用者面向目標檔案中不再存在表達主題視覺的硬碼調色盤 class
- AND 刻意保留的例外（開發者後台頁全體、HUD 獨立視覺系統、資料驅動顏色）逐項列入豁免清單（token-map.md）並附理由

### Requirement: theme-infrastructure — 主題切換基礎建設（無 UI 入口）

系統 SHALL 提供主題切換的底層機制（白名單驗證、class 切換、localStorage 持久化），但目前不提供任何使用者可見的切換入口；全體訪客一律取得 original-baseline。

#### Scenario: 預設外觀不變
- WHEN 任何身分（anon / 一般用戶 / developer）瀏覽任何頁面
- THEN 渲染主題恆為 original-baseline
- AND 頁面上不存在任何主題切換入口（ThemeSwitcher 元件存在於 codebase 但未掛載）

#### Scenario: 機制可重啟
- WHEN 未來要上線新主題
- THEN 流程為：globals.css 新增 theme class → ThemeContext 白名單加名稱 → layout 掛回 ThemeSwitcher
- AND 無需再做任何顏色遷移（token 地基已完備）

#### Scenario: 白名單防護
- WHEN ThemeContext.setTheme 收到白名單外的值
- THEN 靜默忽略、主題維持不變
