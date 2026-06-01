## ADDED Requirements

### Requirement: 全站紙張顆粒質感疊加 (Paper-like Texture Overlay)
系統 **SHALL** 在全站的最上層疊加一個微米級的 SVG 噪點濾鏡，以模擬實體手工紙張的溫潤質感，且此噪點濾鏡的不透明度 **MUST** 控制在 0.015 以內，以確保不干擾畫面的整體清晰度。

#### Scenario: 噪點紙質全域覆蓋與超低干擾
- **WHEN** 使用者載入 OW Social 的任何頁面時
- **THEN** 系統透過 `body::before` 以 fixed 定位與 pointer-events-none 方式疊加 SVG data URI 噪點圖案，且不透明度小於或等於 0.015

---

### Requirement: 有機溫潤玻璃擬態面板與軟陰影 (Organic Glassmorphism Cards with Soft Shadows)
系統所有的玻璃面板卡片（`.glass-panel`）**SHALL** 具備不小於 32px 的大圓角（或不對稱有機手繪大圓角），背景模糊度（backdrop blur）**MUST** 達到 32px 以上，且 **MUST** 採用多重低飽和物理軟陰影與頂部內嵌高光，以展現高質感的空氣懸浮感。

#### Scenario: 溫潤大圓角與多層陰影漂浮效果
- **WHEN** 使用者將游標滑過 `.glass-panel` 卡片時
- **THEN** 系統平滑地將背景半透明白提升至 0.55，邊框不透明度提升至 0.8，卡片微升 2px，並套用多重擴散低飽和軟陰影，圓角平滑維持在 32px 及以上

---

### Requirement: 背景雲霧裝飾流線與禪意同心圓 (Zen Ornaments and Misty Background Layers)
系統底層 **SHALL** 置入一個專門的藝術裝飾層（`ArtOrnament`），其中 **MUST** 包含 3 個帶有極慢呼吸動畫及 120px 以上大模糊度的低飽和雲霧斑塊，且 **SHALL** 包含至少 2 條安靜的貝茲流體裝飾曲線與 1 組禪意同心圓虛線。所有背景色彩 **MUST** 嚴格沿用當前色系，不作任何變更。

#### Scenario: 禪意流體與原站色系完美共存
- **WHEN** 系統渲染背景裝飾層時
- **THEN** 3 個背景雲霧斑塊直接抓取當前的莫蘭迪暖灰沙色系（如 `--theme-accent-rgb` 與 `--theme-highlight-rgb`），以 `0.12 ~ 0.2` 的超低不透明度在大背景中以極慢速的呼吸動畫漂流，而貝茲裝飾曲線的不透明度控制在 0.09 以下
