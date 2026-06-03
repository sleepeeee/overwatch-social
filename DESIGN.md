---
name: OW Social
description: 泛遊戲玩家社群平台的 Morning Sketch 禪意手繪美學設計系統
colors:
  primary: "#82b7cc"
  accent-sand: "#8c7c6c"
  highlight-yellow: "#f5d46b"
  neutral-bg-warm: "#fcf9f2"
  neutral-bg-cool: "#f4f8fa"
  ink-dark: "#3e2723"
  ink-text: "#5d4037"
  border-soft: "rgba(140, 124, 108, 0.12)"
typography:
  display:
    fontFamily: "var(--font-noto-sans-tc), sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "var(--font-noto-sans-tc), sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-mono), monospace"
    fontSize: "0.75rem"
    fontWeight: 700
rounded:
  card: "32px"
  button: "18px"
  tab: "1.1rem"
spacing:
  gap-sm: "8px"
  gap-md: "16px"
  gap-lg: "24px"
components:
  button-calm:
    backgroundColor: "rgba(130, 183, 204, 0.25)"
    textColor: "#384d54"
    rounded: "{rounded.button}"
    padding: "8px 20px"
  card-glass:
    backgroundColor: "rgba(255, 255, 255, 0.42)"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: OW Social

## 1. Overview

**Creative North Star: "The Editorial Tea House" (深夜玩家茶館)**

這是一套為「泛遊戲玩家交友平台」量身定制的視覺系統。本系統徹底拋棄了主流電競社群高壓、熱血、富有攻擊性的冷酷霓虹或金屬齒輪感，轉而使用日系禪意手繪（Morning Sketch）的美學風格。它像一間深夜裡靜謐溫和的茶館，提供給疲憊的玩家一個平靜、真誠、有人情味且低壓力的陪伴空間。

本視覺系統嚴格遵循 **「Product-first, Brand-enhanced」** 的設計哲學：介面的卡片、表單、過濾面板等核心功能佈局必須清晰、好滑、好讀且便於掃讀，不可因追求美感而犧牲可用性。在此前提下，以低飽和配色、微弱紙張噪點、手寫虛線貼紙以及流體水彩暈染進行視覺氛圍的柔化與點綴。

**Key Characteristics:**
*   **平靜低壓力**：全站維持莫蘭迪低飽和度色調，絕無刺眼的純黑或高飽和螢光色。
*   **手作呼吸感**：以不對稱有機圓角、手繪波浪分隔線與點格底紋賦予介面溫潤的人情味。
*   **輕盈掃讀性**：毛玻璃背景需維持良好的透明度與飽和度平衡，確保桌機與手機雙端在快速滑動時字體依然清晰可辨。

---

## 2. Colors

全站色彩以莫蘭迪低飽和度配色為主，使用 data-style (A / B / AB) 三種主題配置，並嚴格維持柔和的情感基調。

### Primary
*   **晨風藍 (Morning Mist Blue)** (`#82b7cc` / oklch(74.4% 0.088 220)): 象徵清晨的霧氣，用於主要點綴色、活動狀態邊框與強調型徽章。

### Secondary
*   **莫蘭迪沙棕 (Morandi Sand)** (`#8c7c6c` / oklch(56.7% 0.034 70)): 象徵大地與紙質溫度，用於次要裝飾、邊框線條與暗色標籤。
*   **秋鵝黃 (Goose Yellow)** (`#f5d46b` / oklch(86.1% 0.126 90)): 用於高亮強調、水彩背景色斑混色。

### Neutral
*   **深夜墨棕 (Night Ink)** (`#3e2723` / oklch(26.1% 0.05 19)): 系統最暗色，僅用於活動狀態標籤文字或標題點綴。
*   **暖棕字體 (Warm Wood)** (`#5d4037` / oklch(37.4% 0.046 25)): Canonical 的正文與標題字體色，取代生硬的純黑。
*   **和紙暖白 (Paper Warm)** (`#fcf9f2` / oklch(98.5% 0.009 85)): Style A 的主要背景色基底。
*   **晨霧冷白 (Mist Cool)** (`#f4f8fa` / oklch(98% 0.007 210)): Style B 的主要背景色基底。

### Named Rules
**The Rarity Rule (稀有原則).** 晨風藍與鵝黃等高亮色在單一畫面中佔比不得超過 10%。它們的存在是為了引導視線與標註重點，而非將介面塗得花哨。

---

## 3. Typography

**Display Font:** Noto Sans TC (`var(--font-noto-sans-tc)`)
**Body Font:** Noto Sans TC (`var(--font-noto-sans-tc)`)
**Label/Mono Font:** Geist Mono (`var(--font-geist-mono)`)

本系統使用統一的字型家族搭配字重與色彩對比，營造出如同傳統編輯刊物（Editorial Layout）般精緻且清晰的字體層級。

### Hierarchy
*   **Display / Title** (Bold (700), 1.75rem, Line-height 1.2, Color: `#5d4037`): 用於主頁大標題、玩家姓名展示。
*   **Headline** (Semi-Bold (600), 1.15rem, Line-height 1.3, Color: `#5d4037`): 用於版塊卡片標題。
*   **Body** (Regular (400), 0.95rem, Line-height 1.6, Color: `#5d4037`): 用於玩家個人留言、名片說明文字。單行長度建議控制在 65–75ch 以利於長時間閱讀。
*   **Label** (Bold (700), 0.75rem, Line-height 1.1, Color: `#6e655b`): 用於卡片上方輔助標籤、按鈕標題。
*   **Mono** (Medium (500), 0.75rem, Line-height 1, Color: `#6e655b`): 用於 BattleTag、代碼與系統參數。

### Named Rules
**The Deep Ink Rule (深墨原則).** 嚴禁在任何文字上使用純黑色 (`#000` 或 `#111`)。所有字體必須使用溫潤的深木棕色 (`#5d4037`) 或深夜墨棕 (`#3e2723`)，以帶出紙張手稿的「人情味」。

---

## 4. Elevation

本系統不依賴大範圍或深黑色的投影。層級的區分完全通過**毛玻璃的模糊遮罩（Backdrop Blur）**、**淡色彩的層疊（Tonal Layering）**以及**精緻的 L 型裁切定位線（Wafer Marks）**來達成。

### Shadow Vocabulary
*   **禪意微光 (Breeze Glow)** (`box-shadow: 0 8px 30px rgba(140, 124, 108, 0.025)`): 用於毛玻璃卡片的靜止狀態，帶來極微弱的懸浮感。
*   **水彩浮力 (Watercolor Lift)** (`box-shadow: 0 25px 60px -15px rgba(130, 183, 204, 0.07)`): 用於 Hover 時的卡片，模擬水彩在紙上微微浮起的邊界感。

### Named Rules
**The Flat-at-Rest Rule (靜止扁平原則).** 介面所有卡片與按鈕在靜止狀態下皆應保持平整，投影應稀薄至近乎隱形。只有在滑鼠 Hover、焦點選中或視窗彈出時，投影才會作為狀態反饋浮現。

---

## 5. Components

### Buttons
*   **Shape:** 溫和的圓角（18px）。
*   **水彩主按鈕 (Calm Button)**: 背景色為 `rgba(130, 183, 204, 0.25)`，文字 `#384d54`，邊框為淡藍色。Hover 時背景加深至 `0.38`，並伴隨 `translateY(-1px) scale(1.02)` 的微過渡。
*   **科技微動態按鈕**: 具有全息反射掃光 (`linear-gradient`) 效果，僅用於開發者後台或強調功能。

### Cards / Containers
*   **手繪毛玻璃面板 (Glass Panel)**:
    *   **質感**：背景 `rgba(255, 255, 255, 0.42)`，模糊度 `blur(32px)`，邊框淡白 `rgba(255, 255, 255, 0.55)`。
    *   **圓角**：支援 32px 大圓角，或有機不對稱圓角 (`organic-corners`: 38px 28px 42px 34px) 營造黏土手作感。
*   **藝術家手稿畫框 (Morning Sketch Card)**:
    *   採用紙白色底 (`#fefcf8`)，並於四個角落放置晶圓定位 L 線 (`wafer-mark`) 裝飾。

### Tabs / Navigation
*   **廣場篩選標籤 (Browse Tab)**:
    *   採用 `1.1rem` 圓角，靜止時背景為 `rgba(255, 255, 255, 0.48)`。
    *   選中時為 `browse-tab-active`，底色改為淡黃/藍漸變，文字變為最深的 `#3e2723`。

### Tags / Chips
*   **手寫虛線貼紙 (Pastel Sticker Tag)**:
    *   底色為超低飽和度的粉藍/粉粉/粉綠 (`rgba(130, 183, 204, 0.18)` 等)。
    *   帶有 `1px dashed` 虛線邊框，呈現手作貼紙質感。

---

## 6. Do's and Don'ts

### Do:
*   **Do** 保持 WCAG AA 的文字對比度（≥ 4.5:1）。在毛玻璃背景上，若字體因背景暈染而難以辨識，必須調深字體色。
*   **Do** 確保手機版的卡片與標籤輕量化。在小螢幕（`< 640px`）下，自動將 blur 調低至 `18px`，並取消背景漂浮動畫以優化效能。
*   **Do** 保持現有的版塊結構與功能，僅在 border、shadow、bg 與 hover transition 上做打磨。

### Don't:
*   **Don't** 使用任何 Overwatch 專屬橘藍黑配色、金屬硬邊框或科幻 HUD 特效。
*   **Don't** 使用純黑色 (`#000` 或 `#111`) 作為背景或文字。
*   **Don't** 使用高飽和度螢光色或常見的紫色 AI SaaS 漸層。
*   **Don't** 引入大於 1px 的單邊裝飾粗條（如 `border-left-4` 警告條）。這會破壞 Morning Sketch 的柔和調性。
*   **Don't** 破壞現有 Layout、新增分頁或移除現有版塊；本專案是 Product-first 的交友平台，絕不可改成單純展示的 landing page。
