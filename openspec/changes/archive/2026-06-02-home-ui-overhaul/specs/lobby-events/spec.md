## ADDED Requirements

### Requirement: Lobby Join Event List
系統 SHALL 支援「玩家揪團行事曆」清單展示，不得使用寫死的舊頭像圖片。

#### Scenario: Display active gaming groups
- **WHEN** 使用者瀏覽首頁右側 LobbyEvents 元件
- **THEN** 系統以簡約手帳待辦清單風格展示本週的玩家揪團活動，列出日期、活動標題、目前人數上限與加入按鈕

### Requirement: Interactive Group Join
使用者 SHALL 可以透過點擊「一鍵加入」來參與特定揪團活動。

#### Scenario: Successful join request
- **WHEN** 使用者點擊特定揪團活動的「加入」按鈕
- **THEN** 系統發送加入申請並更新該活動的當前參與人數
