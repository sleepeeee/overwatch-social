## ADDED Requirements

### Requirement: TopBar 開發者後台按鈕與權限控制
TopBar 元件 SHALL 根據使用者的 Google 登入狀態及開發者權限，動態顯示入口按鈕。原本的「我的名片」按鈕 SHALL 移除，改由「開發者後台」按鈕取代，且只有經後端資料庫白名單同步後擁有 `developer` 角色的使用者才能看見該按鈕。

#### Scenario: 開發者登入後在 TopBar 顯示開發者後台按鈕
- **WHEN** 使用者已登入，且 `useDevMode()` 回傳之 `isDeveloper` 為 `true`
- **THEN** TopBar SHALL 顯示「開發者後台」按鈕，指向 `/developer`
- **AND** 系統 SHALL NOT 顯示「我的名片」按鈕

#### Scenario: 一般使用者登入後在 TopBar 不顯示開發者後台與我的名片按鈕
- **WHEN** 使用者已登入，且 `useDevMode()` 回傳之 `isDeveloper` 為 `false`
- **THEN** TopBar SHALL NOT 顯示「開發者後台」按鈕
- **AND** 系統 SHALL NOT 顯示「我的名片」按鈕，僅顯示「登出」按鈕
