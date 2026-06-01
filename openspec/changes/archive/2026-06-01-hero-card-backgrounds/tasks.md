## 1. 基礎數據與類型定義 (Foundation)

- [x] 1.1 在 `src/types/card.ts` 中擴充定義並寫入 `HeroBackgroundConfig` 的 TypeScript 類型。
- [x] 1.2 建立 `src/data/heroBackgrounds.ts`，並寫入 51 位特工的主要配色、智慧定位幾何配方與通用定位兜底主題。

## 2. 背景組件開發 (Component Development)

- [x] 2.1 建立獨立的 `src/components/HeroCardBackground.tsx` 元件，實作線性漸層、徑向光暈、幾何形狀與科技網格的 5 層立體堆疊渲染。
- [x] 2.2 在 `HeroCardBackground` 中為幾何裝飾元素加入 Hover 懸浮微互動（平滑縮放與平移過渡效果）。

## 3. 卡片整合與名字對比度適配 (Integration & Contrast Adaptation)

- [x] 3.1 修改 `src/components/OWCard.tsx`：將原本共用的統一背景替換為三個獨立卡槽的 `<HeroCardBackground>` 元件。
- [x] 3.2 實作名字標籤（Hero Name Badge）配色與對比度自動適配機制，依據背景的主題深淺色調動態適配字體與細邊框配色。
- [x] 3.3 調校去背立繪圖片的 `drop-shadow` 陰影立體感與 `z-index` 階層，使立繪邊緣與背景光暈精密融合，並通過完整渲染。
