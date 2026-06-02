## Context

本專案 `/browse` 交友廣場包含了 Hero 區、LFG section、Feed section、Hero Codex、Profile dashboard、Modal、Filter bar 等完整的前端功能模組。我們將在不觸碰其核心邏輯與資料流的前提下，僅透過 CSS / Class 名稱的替換，將其視覺風格換裝（Re-theme）為莫蘭迪灰暖沙背景搭配薄膜微光玻璃擬態。

## Goals / Non-Goals

**Goals:**
- 以莫蘭迪暖沙色調與高透玻璃擬態美化交友廣場的主頁排版。
- 統一交友卡片（OWCard）與其他子元件的外皮，使其支援 Hover 微光反射與 0.5px 光學干涉效果邊框。
- 美化過濾欄（搜尋輸入框、分區按鈕組）與 Modal，提升焦點 (Focus) 及懸停 (Hover) 的視覺通透感。

**Non-Goals:**
- **絕對不修改或增加**任何應用功能邏輯、路由或資料存取層。
- **不生成任何新的圖片資源**以完全節省 tokens 消耗與加載時間。
- 不修改後端 API 與 Supabase 資料庫欄位。

## Decisions

### 決定一：全域 CSS 沙灰微光主題變數定義 (CSS Variable Injection)
- **作法**：在 `src/app/globals.css` 中，針對廣場頁面注入一組輕量、高相容性的視覺 Theme tokens。
- **理由**：相較於在每個元件中硬編碼 (Hardcode) 色彩，定義語意化的全域變數可以最大化保持程式碼的簡潔，避免混亂並節省 token 消耗。

### 決定二：交友卡片（OWCard）與 Hero Codex 卡槽採用薄膜微光玻璃擬態
- **作法**：套用帶有大圓角（`rounded-[32px]`）與柔和陰影的 `.glass-panel`，在卡片 Hover 時以純 CSS 漸變觸發 `border-color: rgba(245, 212, 107, 0.8)` 及多重柔和發光陰影。
- **理由**：利用純 CSS 陰影與半透明邊框，以最少代碼模擬出半導體薄膜干涉的光學虹彩質感，低調卻精緻。

### 決定三：過濾欄（Filter Bar）與輸入框的 Soft UI 換裝
- **作法**：將搜尋欄背景改為極淡的沙灰半透明覆蓋，Focus 時套用與卡片同款的朝陽金黃發光環，按鈕部分在點擊時套用內凹軟陰影 (Soft inset shadow)。
- **理由**：消除了傳統輸入框的生硬邊框，使表單與大廳的和紙與雲霧背景融為一體。

## Risks / Trade-offs

- **[Risk]**: 在低階行動裝置或舊版瀏覽器上，大量使用 `backdrop-filter: blur()` 可能造成滾動卡頓。
- **[Mitigation]**: 嚴格控制背景模糊範圍與半徑在 12px 以內，且僅在卡片本體套用，避免對整個容器進行多重模糊渲染。
