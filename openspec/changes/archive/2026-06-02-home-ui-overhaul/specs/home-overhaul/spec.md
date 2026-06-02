## ADDED Requirements

### Requirement: Layout Switch and Core Widgets
首頁 SHALL 進行板塊對調，將 LuckyAlly (原藍) 移至左側，將 Admin公告看板 (原紫) 移至中間。

#### Scenario: Swapped layout load
- **WHEN** 使用者載入首頁 `/`
- **THEN** 左側渲染 LuckyAlly 元件，中間渲染 Admin公告看板，右側渲染 LobbyEvents 元件

### Requirement: Admin Column MultiTab Switch
中間的 Admin公告看板 SHALL 保留 `01`、`02`、`03`、`04` 選項切換按鈕，點擊可切換不同的公告分頁。

#### Scenario: Click tabs to swap announcement content
- **WHEN** 使用者點擊圓形按鈕 `02` (更新日誌)
- **THEN** 公告卡片內容淡入切換為網站最新的改版日誌資訊

### Requirement: Gamer Flow River Carousel
底部的玩家河道 SHALL 同時渲染 `OverwatchSquare`、`ValorantSquare` 與 `LoLSquare` 名片，並支援橫向滾動。

#### Scenario: Scroll gamers list
- **WHEN** 使用者滾動底部玩家河道
- **THEN** 容器呈現 overflow-x 水平平滑滑動，卡片包含多個不同遊戲款式的玩家名片
