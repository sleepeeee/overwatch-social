## ADDED Requirements

### Requirement: Hero Card Background Render
系統必須根據所選英雄的定位 (Role) 與配色 (Colors) 動態渲染其專屬卡槽背景。該背景必須由線性漸層底色、氛圍徑向光暈、定位專屬幾何裝飾、以及淡雅科技網格四層堆疊組成。

#### Scenario: Render background based on hero selection
- **WHEN** 玩家常用英雄卡槽裝填了一位特定的英雄（例如 D.Va，定位為坦克，代表色為粉紅/天藍）
- **THEN** 系統動態載入其粉紅至天藍線性漸層底色、粉色氛圍光暈，以及坦克定位專屬的六角形防護罩幾何形狀

#### Scenario: Render fallback background for empty slots
- **WHEN** 玩家常用英雄卡槽未裝填任何英雄（空卡槽）
- **THEN** 系統展示具有微弱「空欄位」虛線框與亮星提示、無漸層與幾何的預設優雅背景

### Requirement: Hover Micro-Interaction
系統必須在滑鼠懸停於裝填了英雄的卡槽之上時，為其背景的幾何裝飾元素套用平滑的縮放與位移過渡動畫，以營造三維深度的懸浮呼吸感。

#### Scenario: Hover effect trigger
- **WHEN** 滑鼠移入（Hover）裝填了英雄的常用卡槽
- **THEN** 卡槽背景的幾何元素套用平滑的 `scale(1.05)` 或微幅平移，立繪的 `drop-shadow` 陰影立體感增強

### Requirement: Name Badge Contrast Adaptation
系統必須依據該英雄卡槽背景的主題深淺色調，自動適配名字標籤（Hero Name Badge）的背景色、文字色與邊框配色，以確保視覺清晰度與高水準對比度。

#### Scenario: Contrast adaptation for dark backgrounds
- **WHEN** 英雄卡槽背景屬於深色調主題（如源氏、奪命女）
- **THEN** 名字標籤採用高對比度、具備足夠清晰度的淺色字體與亮色細邊框

#### Scenario: Contrast adaptation for light backgrounds
- **WHEN** 英雄卡槽背景屬於淺色調主題（如慈悲、D.Va）
- **THEN** 名字標籤採用柔和深色字體與對比邊框
