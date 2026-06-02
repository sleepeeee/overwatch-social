# testing Specification

## Purpose
TBD - created by archiving change e2e-test-coverage. Update Purpose after archive.
## Requirements
### Requirement: Auth 守門 E2E 測試
系統 **SHALL** 有自動化測試驗證 `/profile` 頁面在未登入狀態下顯示 LoginModal。

#### Scenario: 未登入訪問 /profile
- **WHEN** 未認證使用者訪問 `/profile`
- **THEN** Playwright 測試 SHALL 確認 LoginModal 文字「登入後才能使用主控台」可見
- **AND** Google 登入按鈕可見

---

### Requirement: 廣場頁面 E2E 測試
系統 **SHALL** 有自動化測試驗證廣場頁面的核心 UI 元素。

#### Scenario: 廣場有三個遊戲 Tab
- **WHEN** 訪問 `/browse`
- **THEN** Playwright 測試 SHALL 確認 Overwatch、Valorant、LoL 三個 Tab 可見

#### Scenario: 搜尋欄可互動
- **WHEN** 在廣場搜尋欄輸入文字
- **THEN** Playwright 測試 SHALL 確認輸入值被正確設定

---

### Requirement: 玩家詳細頁 E2E 測試
系統 **SHALL** 有自動化測試驗證 `/player/[id]` 的基本行為。

#### Scenario: 真實玩家 ID 顯示 BattleTag
- **WHEN** 訪問測試玩家的詳細頁
- **THEN** Playwright 測試 SHALL 確認 BattleTag 可見

#### Scenario: 不存在的 ID 顯示 Not Found
- **WHEN** 訪問一個不存在的 user_id
- **THEN** Playwright 測試 SHALL 確認 not-found 訊息可見

