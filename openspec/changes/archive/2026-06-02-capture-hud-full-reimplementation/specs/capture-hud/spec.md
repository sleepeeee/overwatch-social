---
id: capture-hud-full-reimplementation/capture-hud
type: spec
delta: replace
---

# Spec: capture-hud — 完整 HUD 調整器移植

## ADDED Requirements

### Requirement: 6 preset 切換完整可用
系統 SHALL 提供 6 個 preset 按鈕，各自正確設定 UI 狀態。

#### Scenario: 「你方壓制」preset
- WHEN 使用者點擊「你方壓制」
- THEN HUD 顯示左方佔領 68%，右方 32%
- AND 左方邊框與節點顯示 cyan (#00f0ff) 色調

#### Scenario: 「未設作者」preset
- WHEN 使用者點擊「未設作者」
- THEN HUD 顯示 no_author 狀態（非 ready 狀態）
- AND 動態滑桿區塊隱藏

#### Scenario: 「資料缺失」preset
- WHEN 使用者點擊「資料缺失」
- THEN HUD 顯示 error 狀態
- AND 頁面出現 FORCE_RETRY_STATION_SYNC 按鈕

### Requirement: 動態滑桿即時更新
系統 SHALL 提供 range input 即時調整左方佔領比率，HUD 即時反映。

#### Scenario: 拖動滑桿
- WHEN 使用者拖動 range input
- THEN HUD 進度條、百分比標籤、節點位置均即時更新
- AND preset 自動切換為 "custom"

### Requirement: 陣營設定儲存
系統 SHALL 允許修改陣營名稱、倉庫所有者，並持久化至 localStorage 和 Server Action。

#### Scenario: 儲存配置
- WHEN 使用者輸入名稱並點擊「儲存配置」
- THEN localStorage 更新（leftName, rightName, repoOwner, percent）
- AND saveCaptureDisplayNames() Server Action 被呼叫
- AND Toast 通知顯示「已成功儲存」

#### Scenario: 重設預設
- WHEN 使用者點擊「重設預設」
- THEN localStorage 所有 outpost_* keys 被清除
- AND 名稱重設為「你方」/「朋友」，percent 重設為 68

### Requirement: HUD 卡片 3 狀態正確渲染
系統 SHALL 依照 status 渲染對應的 HUD 狀態內容。

#### Scenario: ready 狀態渲染
- WHEN status === "ready"
- THEN 顯示玩家名稱、PTS 分數、佔領進度條、旋轉 radar knob、Stats grid
- AND Stats grid 的比例條依真實 commits/additions/deletions 比率計算（非 50/50 hardcode）

#### Scenario: no_author 狀態渲染
- WHEN status === "no_author"
- THEN 顯示 WARN_NO_GIT_AUTHOR_DETECTED 標題
- AND 顯示含 git config 指令的代碼區塊（可全選複製）

#### Scenario: error 狀態渲染
- WHEN status === "error"
- THEN 顯示 SYS_DAEMON_READ_FAIL 標題
- AND 顯示 FORCE_RETRY_STATION_SYNC 按鈕
- AND 點擊按鈕後 preset 切換為 "winning"

### Requirement: 4 個 Tab 面板完整實作
系統 SHALL 提供 4 個 tab（manual/exporter/spec/code），各自完整渲染。

#### Scenario: 手冊 Tab 預設選中
- WHEN 頁面首次載入
- THEN activeTab 預設為 "manual"（部署與使用手冊）

#### Scenario: 手冊 Tab 內容完整
- WHEN 切換到「部署與使用手冊」tab
- THEN 顯示遊戲角色對照、自動化流程圖、部署步驟
- AND 顯示 GIT_HOOK_SCRIPT 代碼區塊
- AND 「複製代碼」按鈕可複製完整腳本到剪貼簿

#### Scenario: 資源下載 Tab 功能完整
- WHEN 切換到「資源下載」tab
- THEN 顯示「下載整合版 HTML」按鈕（可下載含當前設定的 HTML 檔案）
- AND 顯示 4 個 SVG 素材下載按鈕（控制雷達指針 / 倉庫所有權徽章 / 警告引導盾牌 / Git提交節點）

#### Scenario: 向量代碼 Tab 含複製按鈕
- WHEN 切換到「向量代碼」tab
- THEN 顯示 4 個 SVG 原始碼代碼區塊
- AND 各自有「複製」按鈕可複製 SVG 代碼

### Requirement: 深色/淺色模式切換
系統 SHALL 提供深色/淺色模式切換，切換後 HUD 視覺即時反映。

#### Scenario: 深色模式切換
- WHEN 使用者點擊模式切換按鈕
- THEN document.documentElement 的 class 在 dark/light 之間切換
- AND HUD 卡片背景、文字顏色即時轉換

### Requirement: Toast 通知系統
操作反饋 SHALL 透過短暫 Toast 通知顯示（3 秒後自動消失）。

#### Scenario: 複製代碼後顯示 Toast
- WHEN 使用者點擊任一「複製」按鈕
- THEN 畫面右下角顯示綠色 Toast 通知（「已複製到剪貼簿！」）
- AND 3 秒後自動消失
