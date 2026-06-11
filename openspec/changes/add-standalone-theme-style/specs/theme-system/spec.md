# Spec Delta: add-standalone-theme-style

## ADDED Requirements

### Requirement: theme-token-foundation — 全站顏色 token 化（behavior-preserving）

系統 SHALL 將全站元件的硬碼 Tailwind 顏色 class 遷移為 `--theme-*` CSS 變數引用，且 original-baseline 主題啟用時的視覺與遷移前一致。

#### Scenario: original-baseline 視覺回歸
- WHEN 完成使用者面向範圍的硬碼顏色遷移（F-028 校準：~419 處 / 23 檔）並啟用 original-baseline 主題
- THEN 首頁、廣場、個人檔案、玩家詳細頁在 desktop 與 mobile 視口的截圖
- AND 與遷移前基準截圖比對為肉眼不可辨差異（允許抗鋸齒級誤差）

#### Scenario: 遷移完備性掃描
- WHEN 遷移完成後執行全域掃描（Tailwind 調色盤 class、inline style 色值、hex 字面值）
- THEN 使用者面向目標檔案（F-028 清單，23 檔）中不再存在表達主題視覺的硬碼顏色
- AND 刻意保留的例外（開發者後台頁全體、英雄職業徽章色等資料驅動顏色）逐項列入豁免清單並附理由

### Requirement: standalone-theme-presets — 三套並存新主題

系統 SHALL 在 globals.css 新增三套主題 class（`theme-neon-esports`、`theme-minimal-magazine`、`theme-retro-arcade`），僅新增、不修改既有任何主題 class 的定義。

#### Scenario: 新主題完整覆蓋
- WHEN developer 切換到任一新主題
- THEN 全站四大頁面的色彩、圓角、陰影、邊框風格隨 token 切換
- AND 不需要任何元件結構改動即可呈現該主題風格

#### Scenario: 既有主題不受影響
- WHEN 比對本 change 前後的 globals.css
- THEN original-baseline 與既有 4 套主題 class 的既有變數定義內容不變（允許為 token 擴充**新增**變數行，新增行在 original-baseline 中取遷移前的等值顏色）

#### Scenario: shadcn 層同步
- WHEN 任一新主題 class 啟用
- THEN shadcn 語意 token（--primary、--border 等）與 OW 自有 token 同步切換為該主題定義值
- AND 無任一 UI 區塊出現「shadcn 元件還是舊配色、自有元件已是新配色」的撕裂

### Requirement: developer-theme-preview — developer-only 主題切換預覽

系統 SHALL 僅對 developer 角色提供主題切換能力；一般用戶與未登入者一律取得 original-baseline。

#### Scenario: developer 切換
- WHEN developer 登入並開啟 StylePicker 選擇新主題
- THEN 當前瀏覽 session 即時套用所選主題
- AND 選擇透過 localStorage（`theme-style` key）在該瀏覽器持久化

#### Scenario: 一般用戶隔離
- WHEN 一般用戶（authenticated 非 developer）或 anon 瀏覽任何頁面
- THEN 看不到任何主題切換入口
- AND 渲染主題恆為 original-baseline（即使手動寫入 localStorage `theme-style`，UI 也不提供入口；客製 localStorage 屬使用者自身瀏覽器行為，非安全邊界）

#### Scenario: developer 預覽 FOUC 已知限制
- WHEN developer 已選非預設主題並重新整理頁面
- THEN 允許出現短暫 original-baseline 閃現後套用所選主題（已知限制）
- AND 此限制與升級路徑（cookie 方案，REF-032）以 `TODO(theme-FOUC)` 註解記錄；若未來開放一般用戶切換，本 requirement 必須重新評估並補 FOUC 防護
