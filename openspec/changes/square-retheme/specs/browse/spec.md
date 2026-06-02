## ADDED Requirements

### Requirement: 廣場整體換皮視覺 (Square Re-themed Interface)
交友廣場頁面 (BrowsePage) **SHALL** 統一採用莫蘭迪沙灰暖調的視覺風格。星盤 (CelestialAstrolabe)、搜尋欄與遊戲切換分頁 (gameTabs) 的外觀 **MUST** 與背景和紙與微光玻璃擬態高度融合，且所有按鈕及輸入框的 Focus 狀態 **MUST** 有平滑淡入的發光環效果。

#### Scenario: 廣場主題換皮渲染
- **WHEN** 使用者訪問 `/browse` 時
- **THEN** 系統渲染帶有 soft-ui 沙灰質感的搜尋輸入框、毛玻璃背景層與柔和旋轉的 CelestialAstrolabe，且排版結構與原頁面完全一致
