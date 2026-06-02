# 🎨 Morning Sketch 招募大廳 (單欄直覺流) 重構方案

本提案由 `DesignCompanion` 與 `Antigravity` 協同設計，基於 `D:\pic\WEB` 中主體設計素材進行完美融合，並採用由上而下（Top-Down）的單欄直覺流動線。

---

## 一、 解構大箱子：垂直介電隔離層 (Planar Dielectric Layers)

為了維持由上至下的自然操作流（Search -> Tabs -> Filters -> Cards），同時擺脫「單一笨重大面板」的視覺疲勞，我們將大面板完全拆解為**四個獨立懸浮的 Liquid Glass 層級**，層與層之間保留寬鬆的呼吸空間：

1. **標題展示層 (Hero Deck - 無背板):**
   * 標題與引言直接漂浮在最底層的「晨霧紙紋」上。不加任何玻璃背板，使其呈現手稿本首頁的輕盈感。
   * 背景點綴手繪荷花水印，視覺重心極其純淨。

2. **太空艙搜尋層 (Capsule Search Box - 獨立層 1):**
   * 寬度限制在最舒適的 `max-w-2xl`，居中懸浮。
   * 採用高透光 Liquid Glass 面板，搭配極寬鬆的投影與 2px 的白光折射邊框。

3. **分區藥丸滑動軌道 (Game Tab Track - 獨立層 2):**
   * 遊戲分頁 Tabs 擺脫包裝盒，以獨立藥丸（Pills）的形式一字排開，居中或靠左對齊。
   * 啟動切換時，藥丸在橫向軌道上滑動，保持空間的輕快感。

4. **懸浮篩選絲帶 (Floating Filter Ribbon - 獨立層 3):**
   * 篩選條件被收納進一個橫向展開的超清透絲帶中。這條絲帶與搜尋層、分區層完全物理分離，中間有 `space-y-4` 的空隙，形成強烈的**介電質隔離（Dielectric Isolation）**，視覺上極其清爽。

5. **手稿名片星雲 (Card Nebula Grid - 獨立層 4):**
   * 藝術家風格的 `OWCard` 網格，背景自然鋪設點狀格線（`.cyber-dots`）。

---

## 二、 常用定位「黏土按鈕」在篩選絲帶中的整理 (Filter Ribbon Layout)

在單欄的篩選絲帶中，為保持界面的整潔，我們採用**橫向對稱排列（Horizontal Grouping）**：

* **左翼 (1/4 寬度):** 遊玩伺服器下拉選單（`Server Dropdown`）。
* **中腹 (2/4 寬度):** 常用定位按鈕組。這 4 個有機黏土按鈕以 `gap-1.5` 緊密且有機地排列在中央，形成視覺的「控制門極 (Control Gate)」。
* **右翼 (1/4 寬度):** 語音狀態下拉選單（`Mic Dropdown`） + 圓角重置按鈕。

### 黏土按鈕在絲帶中的 CSS 排版細節：
每個按鈕在絲帶中保持高度一致性，但在選中時會展現不同的**黏土變形（Organic Deformation）**與**水彩漸層亮斑**，防止排版死板：

```tsx
// 常用定位按鈕圓角配置
const roleRadii = {
  "全部": "16px 12px 14px 18px",
  "坦克": "12px 16px 15px 13px",
  "輸出": "15px 13px 16px 12px",
  "支援": "13px 15px 12px 16px"
};
```

---

## 三、 單欄直覺流 ASCII 佈局設計圖

```
┌────────────────────────────────────────────────────────────────────────┐
│  [TopBar] 頂部導覽列                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                       🎮 多遊戲玩家招募大廳                             │
│              保留熟悉的廣場節奏，換上晨霧紙感宇宙。                      │
│                                                                        │
│           ┌──────────────────────────────────────────────┐             │
│  [搜尋層]  │ 🔍 搜尋玩家 BattleTag、常用英雄、MBTI...     │             │
│           └──────────────────────────────────────────────┘             │
│                                                                        │
│               ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  [分區層]     │🥞 OW     │  │🎯 Val    │  │👑 LoL    │                 │
│               └──────────┘  └──────────┘  └──────────┘                 │
│                                                                        │
│  ┌─ [ 獨立懸浮篩選絲帶 / Floating Filter Ribbon ] ───────────────────┐  │
│  │                                                                  │  │
│  │ 伺服器:             常用定位:                 語音狀態:          │  │
│  │ ┌───────────┐  ┌──────┐┌──────┐┌──────┐┌──────┐  ┌───────────┐   │  │
│  │ │ 亞洲   [▼]│  │ 全部 ││ 🛡️ 坦││ ⚔️ 輸││ ➕ 支│  │ 開麥溝通[▼]│   │  │
│  │ └───────────┘  └──────┘└──────┘└──────┘└──────┘  └───────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─ [ 藝術家手稿名片網格 / Card Nebula Grid ] ────────────────────────┐  │
│  │                                                                  │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │  │
│  │  │ 👤 Player Card   │  │ 👤 Player Card   │  │ 👤 Player Card   │  │  │
│  │  │ (Handmade frame) │  │ (Handmade frame) │  │ (Handmade frame) │  │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 四、 核心組件樣式更新指南 (Tailwind Classes)

### 1. 獨立搜尋框外殼 (`page.tsx`)
```tsx
className="relative w-full max-w-2xl mx-auto bg-white/45 backdrop-blur-2xl border-2 border-white/70 rounded-full py-5 shadow-[0_15px_35px_-20px_rgba(140,124,108,0.15),inset_0_1.5px_2.5px_rgba(255,255,255,0.9)] focus-within:border-[#82b7cc]/60 transition-all duration-300"
```

### 2. 懸浮篩選絲帶外殼 (`OverwatchSquare.tsx`)
```tsx
className="w-full bg-white/40 backdrop-blur-3xl border-2 border-white/60 rounded-[28px] p-5 md:py-4 md:px-6 shadow-[0_18px_45px_-18px_rgba(140,124,108,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.85)] flex flex-col md:flex-row md:items-center justify-between gap-4"
```

### 3. 精製常用定位按鈕 (`OverwatchSquare.tsx`)
```tsx
// 在渲染定位按鈕時，利用動態 style 給予微幅不對稱圓角，並採用 Double Border 與彈性縮放：
className={`px-4 py-2.5 text-xs font-bold transition-all duration-500 hover:scale-[1.04] active:scale-[0.98] outline-1 outline-offset-[-3px] ${
  selectedRole === role
    ? "bg-gradient-to-br from-[#82b7cc]/22 to-[#f5d46b]/15 text-[#384d54] border-2 border-[#82b7cc]/45 outline-dashed outline-[#82b7cc]/30 shadow-[0_8px_20px_-8px_rgba(130,183,204,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.9)]"
    : "bg-white/45 text-[#8c7c6c] border border-[#8c7c6c]/20 outline-dashed outline-[#8c7c6c]/12 hover:bg-white/75"
}`}
style={{ borderRadius: roleRadii[role] }}
```

### 4. 卡片 (OWCard.tsx) 與 CSS 樣式
```css
/* 藝術家手稿卡片邊框樣式 */
.morning-sketch-card {
  border-radius: 38px 24px 42px 28px !important;
  background: rgba(253, 250, 243, 0.85) !important;
  border: 1.2px solid rgba(140, 124, 108, 0.16) !important;
  box-shadow: 
    0 20px 48px -20px rgba(140, 124, 108, 0.1),
    inset 0 1.5px 2px rgba(255, 255, 255, 0.9) !important;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.morning-sketch-card:hover {
  transform: translateY(-4px) scale(1.01) !important;
  border-color: rgba(130, 183, 204, 0.38) !important;
  box-shadow: 
    0 28px 60px -15px rgba(130, 183, 204, 0.18),
    0 4px 15px -4px rgba(130, 183, 204, 0.05),
    inset 0 1.5px 2px rgba(255, 255, 255, 0.95) !important;
}
```


---

## 五、 標頭視覺噪訊消除與垂直瀑布流重構

為了消除多餘的標記並回歸素描本手稿風，我們將對標頭進行以下優化：
1. **捨棄 Moon 標籤**：釋放縱向呼吸空間。
2. **捨棄 Gamepad2 數位圖標**：移除冰冷數位感，改用極簡文字與手繪漸變分界線。
3. **重構為垂直瀑布流**：取代原本強制的左右並排 grid，讓閱讀視線自然下落。

### 標頭結構草案：
```tsx
{/* 🌸 莫蘭迪紙感手稿標頭 - 垂直層級重構 */}
<div className="text-left space-y-2 relative z-10 animate-[fadeIn_0.5s_ease-out] pb-1 select-none">
  
  {/* 1. 極簡小副標 (Low-profile Subtitle) */}
  <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#8c7c6c]/60 flex items-center gap-1.5">
    <span>Lobby Directory</span>
    <span className="w-1.5 h-1.5 rounded-full bg-[#82b7cc]/40" />
    <span>名片廣場</span>
  </div>

  {/* 2. 精緻標題 (Elegant Typography without digital icons) */}
  <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#3e2723] leading-none pt-0.5">
    多遊戲玩家招募大廳
  </h1>

  {/* 3. 手稿感細線 (Fine-line Divider) */}
  <div className="w-12 h-[1px] bg-gradient-to-r from-[#8c7c6c]/25 to-transparent my-2" />

  {/* 4. 溫潤引言 (Warm Description) */}
  <p className="text-[#8c7c6c]/90 font-medium text-[12px] md:text-[13px] leading-relaxed max-w-xl">
    保留你熟悉的廣場節奏，換上晨霧紙感宇宙。搜尋今天想一起開局的夥伴，或自由瀏覽不同的遊戲分區。
  </p>
</div>
```

---

## 六、 風格美化方案：流體、霞紋與雙折射微光點綴

為了呼應 `D:\pic\WEB` 中的 Lotus/Morning Sketch 水彩手稿美學，我們引入三大高定美學元件，不干擾大廳主體內容，僅作為 Z-index 0~5 的底層與邊角水印裝飾。

### 1. 水彩層疊雙色流體 (`.watercolor-mist-bg`)
* **意象說明**：模擬水彩在宣紙上暈染擴散的效果，晴藍與晨曦金在角落交織，並藉由 keyframe 做微幅的飄逸呼吸動畫。
* **CSS 實作 (`globals.css`)**：
  ```css
  .watercolor-mist-bg {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 53% 47% 70% 30% / 40% 60% 40% 60%;
    background: radial-gradient(circle at 30% 30%, rgba(130, 183, 204, 0.07) 0%, transparent 60%),
                radial-gradient(circle at 70% 70%, rgba(245, 212, 107, 0.05) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }
  ```
* **HTML/JSX 應用**：
  ```tsx
  {/* 右上角流體 blob */}
  <div className="watercolor-mist-bg top-[-10%] right-[-10%] animate-mist-a" />
  {/* 左下角流體 blob */}
  <div className="watercolor-mist-bg bottom-[5%] left-[-15%] scale-125 animate-mist-b" />
  ```

### 2. 手稿星芒與日式霞紋 (`.kasumi-mist-line`)
* **意象說明**：中和直線網格的硬挺感，模擬毛筆劃過紙張產生的兩端拉絲細線，以及手繪的微光四角星。
* **星芒 SVG 組件 (`PencilStar.tsx`)**：
  ```tsx
  export function PencilStar({ className = "w-4 h-4" }: { className?: string }) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        className={`${className} text-[#8c7c6c]/45 animate-pulse`} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.2"
        style={{ animationDuration: "3s" }}
      >
        <path d="M12 2 C12 10 14 12 22 12 C14 12 12 14 12 22 C12 14 10 12 2 12 C10 12 12 10 12 2 Z" strokeLinecap="round" />
      </svg>
    );
  }
  ```
* **日式霞紋 CSS 實作 (`globals.css`)**：
  ```css
  .kasumi-mist-line {
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(140, 124, 108, 0.22) 15%, 
      rgba(140, 124, 108, 0.22) 85%, 
      transparent 100%
    );
    position: relative;
  }
  .kasumi-double-line::after {
    content: "";
    display: block;
    height: 1px;
    width: 60%;
    margin-top: 3px;
    margin-left: 20%;
    background: linear-gradient(90deg, transparent, rgba(140, 124, 108, 0.15), transparent);
  }
  ```

### 3. 雙折射微光氣泡 (`.glass-bubble-dot`)
* **意象說明**：偏光鏡下薄膜產生的介電微球，具有白色高光反射與柔和陰影，極具 3D 立體觸感。
* **CSS 實作 (`globals.css`)**：
  ```css
  .glass-bubble-dot {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.1) 60%, transparent 100%);
    border: 0.8px solid rgba(255, 255, 255, 0.6) !important;
    box-shadow: 
      inset -1px -1px 2px rgba(130, 183, 204, 0.15),
      0 6px 15px -4px rgba(140, 124, 108, 0.08);
    pointer-events: none;
    z-index: 5;
  }
  ```
* **應用場景**：可在篩選絲帶（Filter Ribbon）的右下角或 OWCard 卡片中隨機點綴，增強折射質感。

---

## 七、 外部免費 SVG 素材資源之整合規劃

為了讓界面的手繪感更為生動，我們計畫在後續實作中引入以下開源/免費向量 (SVG) 素材庫之裝飾性元素：

1. **手寫風塗鴉裝飾 (Handdrawn Doodles)**：
   * **來源**：使用 `SVG Doodles` 庫中的輕量手繪箭頭、強調波浪線、手撕紙張邊緣與圓圈符號。
   * **應用**：點綴於搜尋太空艙的輸入提示語兩側，或作為常用定位按鈕上方的「手繪標註圈線」。
   
2. **日系溫潤花草插圖 (Botanical Sketches)**：
   * **來源**：參考 `Girly Sozai` 與 `Vector Shelf` 的手稿風格，複製或引入手寫質感的「蓮花 (Lotus)」與「葉脈」細線 SVG。
   * **應用**：置於大廳左側與背景波浪交界處，與底紋融為一體，強化 Morning Sketch 主題。
   
3. **無損向量優勢 (Web Optimization)**：
   * 所有素材一律只使用純 SVG (代碼內嵌 `path` 或本地 SVG 靜態資源)，避免加載重型 PNG/JPG 導致的頁面跳動（Layout Shift）與效能降低。

---

## 八、 大面積主題氛圍美化方案 (Macro Visual Substrate Passivation)

為了響應使用者對於「大面積主題氛圍感」的期望，我們在微細點綴之外，進行全局的宏觀視覺重構：

### 1. 全局水彩渲染融合畫布 (`.macro-watercolor-canvas`)
* **設計意象**：在底層固定定位鋪設超大半徑的四色莫蘭迪徑向漸變，並以 `mix-blend-mode: multiply` 融合手工紙張的噪點，使整個網頁展現出自然墨水在宣紙上暈染擴散的大片手寫質感。
* **CSS 實作 (`globals.css`)**：
  ```css
  .macro-watercolor-canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -2;
    background-image: 
      radial-gradient(circle at -5% 5%, rgba(130, 183, 204, 0.16) 0%, transparent 55%),
      radial-gradient(circle at 105% 35%, rgba(245, 212, 107, 0.14) 0%, transparent 50%),
      radial-gradient(circle at 20% 90%, rgba(235, 220, 216, 0.22) 0%, transparent 65%),
      radial-gradient(circle at 80% -5%, rgba(140, 124, 108, 0.08) 0%, transparent 40%);
    opacity: 0.9;
    mix-blend-mode: multiply;
  }
  ```

### 2. 頂部大面積流體鏤空 Banner
* **設計意象**：利用 `clip-path: ellipse` 裁切出一個高達 420px 的半透明柔霧背板，在大廳頂部提供溫潤的大門感與視差深度。
* **React 元件應用 (`page.tsx`)**：
  ```tsx
  <div 
    className="absolute top-0 left-0 w-full h-[420px] pointer-events-none z-0 opacity-80"
    style={{
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(253, 250, 243, 0.3) 70%, transparent 100%)",
      clipPath: "ellipse(95% 65% at 50% 0%)",
      borderBottom: "1.5px solid rgba(255, 255, 255, 0.55)",
      backdropFilter: "blur(4px)"
    }}
  />
  ```

### 3. 左右側大面積手繪荷花插畫
* **設計意象**：在招募大廳兩側嵌入寬達 320px~350px 的極細線條手稿荷花，以 `fixed` 定位固定在視窗兩側，超低不透明度使其像紙張水印，使大廳兩側有如展開的手稿繪本。
* **左側 SVG (花苞莖桿 - `page.tsx`)**：
  ```tsx
  <svg 
    className="fixed left-[-80px] top-[15%] w-[320px] h-[650px] text-[#8c7c6c]/15 pointer-events-none z-0 select-none animate-[fadeIn_2s_ease-out]" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="0.8" 
    viewBox="0 0 100 200"
  >
    <path d="M 50 200 C 45 150, 55 100, 48 50" strokeDasharray="1.5 1.5" />
    <path d="M 48 50 C 32 40, 28 20, 48 10 C 68 20, 64 40, 48 50 Z" />
    <path d="M 48 50 C 38 45, 40 30, 48 22 C 56 30, 58 45, 48 50 Z" />
    <path d="M 48 52 C 44 48, 45 38, 48 30 C 51 38, 52 48, 48 52 Z" />
    <path d="M 50 120 C 15 110, 5 140, 28 160 C 45 171, 50 150, 50 120 Z" />
    <path d="M 28 160 C 23 150, 32 130, 50 120" />
    <path d="M 15 190 Q 25 185, 35 190" />
    <path d="M 65 195 Q 75 190, 85 195" />
  </svg>
  ```
* **右側 SVG (盛開蓮花 - `page.tsx`)**：
  ```tsx
  <svg 
    className="fixed right-[-90px] bottom-[5%] w-[350px] h-[650px] text-[#82b7cc]/12 pointer-events-none z-0 select-none animate-[fadeIn_2.2s_ease-out]" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="0.8" 
    viewBox="0 0 100 200"
  >
    <path d="M 50 200 C 55 140, 45 90, 52 40" strokeDasharray="1.5 1.5" />
    <path d="M 52 40 C 15 30, 25 5, 52 25 C 79 5, 89 30, 52 40 Z" />
    <path d="M 52 40 C 32 35, 38 18, 52 28 C 66 18, 72 35, 52 40 Z" />
    <path d="M 52 40 C 8 50, 22 70, 52 40 C 82 70, 96 50, 52 40 Z" />
    <path d="M 48 100 C 10 90, 5 130, 48 142 C 91 130, 86 90, 48 100 Z" />
    <path d="M 48 100 L 48 142" />
    <path d="M 48 120 C 28 115, 18 125, 12 110" />
    <path d="M 48 120 C 68 115, 78 125, 84 110" />
  </svg>
  ```


