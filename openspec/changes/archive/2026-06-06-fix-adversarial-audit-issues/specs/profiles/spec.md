## ADDED Requirements

### Requirement: 解禁特戰英豪與英雄聯盟名片自定義 (Enable Valorant and LoL Cards Customization)
系統 **SHALL** 允許玩家在個人檔案工作室（`profile/page.tsx`）中點選切換並編輯《特戰英豪 (Valorant)》與《英雄聯盟 (LoL)》名片，且名片之背景、特色標籤與表單主色調 **MUST** 與目前編輯之遊戲種類色彩進行動態聯動：
- 《鬥陣特攻 (OW)》：套用 `amber` 橘黃色調
- 《特戰英豪 (Val)》：套用 `rose` 紅色調
- 《英雄聯盟 (LoL)》：套用 `blue` 藍色調

#### Scenario: 玩家切換至特戰英豪名片進行編輯
- **WHEN** 玩家在主控台點擊編輯「特戰英豪名片」時
- **THEN** 系統進入編輯狀態，且名片表單與標籤配色自動切換為 `rose` 色系，並啟用相應之特色標籤

---

### Requirement: 常用立繪三插槽依序填入與自訂移除 (Hero Showcase Three Slots Sequencing & Removal)
在名片自訂編輯器中，當玩家點擊英雄立繪清單時，系統 **SHALL** 依據目前已選插槽數量「依序填入」空缺插槽（最多 3 個）。已選英雄再次點選 **SHALL** 將其移除，且每個插槽右上角 **MUST** 顯示 `✕` 按鈕，點擊 `✕` **SHALL** 僅清空該特定插槽（不打亂其他插槽內英雄）。立繪圖片 **SHALL** 具備破圖防護 fallback 背景，以防圖片路徑無效時顯示空白或破圖符號。

#### Scenario: 依序填入三個常用英雄
- **GIVEN** 玩家未選擇任何常用英雄，插槽 1, 2, 3 皆為空
- **WHEN** 玩家點選第一個英雄「安娜 (Ana)」，接著點選第二個英雄「源氏 (Genji)」
- **THEN** 安娜被放入插槽 1，源氏被放入插槽 2
- **WHEN** 玩家點選插槽 1 的右上角 `✕` 按鈕
- **THEN** 插槽 1 變為空，插槽 2 仍維持 Genji
