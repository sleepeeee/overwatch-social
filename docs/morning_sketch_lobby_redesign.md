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
   
2. **晶圓干涉與光學同心圓線條 (Concentric Diffraction Rings)**：
   * **來源**：參考曝光光罩、衍射光柵與 Airy Disk 的圓弧紋理。
   * **應用**：利用細微 SVG 弧線，繪製同心圓衍射環與晶圓對準十字線，作為背景水印，增加視覺精度。
   
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

### 3. 左右側大面積幾何流體塊
* **設計意象**：在招募大廳左右兩側嵌入寬達 420px~450px 的有機幾何流體塊（Fluid Blobs），利用圓潤不規則的數學 Bezier 曲線模擬液態材料旋塗的重疊美感，超低不透明度（5%~8%）使其僅作為大面積底色暈染的幾何輪廓。
* **左側 SVG (暖沙流體塊 - `page.tsx`)**：
  ```tsx
  <svg 
    className="fixed left-[-120px] top-[15%] w-[420px] h-[420px] text-[#8c7c6c]/6 pointer-events-none z-0 fill-current animate-mist-a"
    viewBox="0 0 200 200"
  >
    <path d="M45,-60C58,-54,67,-40,73,-25C79,-9,82,7,78,22C74,38,62,53,48,63C33,73,17,77,0,77C-16,77,-33,72,-47,62C-61,52,-72,37,-76,21C-81,5,-79,-13,-72,-28C-65,-43,-53,-55,-40,-61C-26,-67,-13,-68,1,-69C15,-70,29,-71,45,-60Z" transform="translate(100 100)" />
  </svg>
  ```
* **右側 SVG (晴藍流體塊 - `page.tsx`)**：
  ```tsx
  <svg 
    className="fixed right-[-140px] bottom-[10%] w-[450px] h-[450px] text-[#82b7cc]/6 pointer-events-none z-0 fill-current animate-mist-b"
    viewBox="0 0 200 200"
  >
    <path d="M52,-73C65,-64,72,-47,75,-30C78,-13,77,4,72,19C67,34,58,47,45,56C32,65,16,70,-1,71C-18,72,-36,69,-50,60C-64,51,-74,36,-78,19C-82,2,-80,-17,-72,-32C-64,-47,-50,-58,-35,-66C-20,-74,-10,-79,5,-83C20,-87,39,-82,52,-73Z" transform="translate(100 100)" />
  </svg>
  ```

### 4. 晶圓光學干涉同心圓與對準線 (Airy Disk & Alignment Marks - `page.tsx`)
* **設計意象**：模擬雙折射偏光顯微鏡下薄膜產生的 Airy Disk 干涉條紋與曝光機對準標記，增強理工理學儀器的幾何精度美感。
* **SVG 水印程式碼**：
  ```tsx
  <svg 
    className="fixed right-[-60px] top-[8%] w-[420px] h-[420px] text-[#8c7c6c]/12 pointer-events-none z-0 select-none" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="0.5" 
    viewBox="0 0 400 400"
  >
    <circle cx="200" cy="200" r="50" strokeDasharray="2 3" />
    <circle cx="200" cy="200" r="90" />
    <circle cx="200" cy="200" r="130" strokeDasharray="4 4" />
    <circle cx="200" cy="200" r="170" />
    <circle cx="200" cy="200" r="215" strokeDasharray="1 5" />
    <circle cx="200" cy="200" r="260" />
    <line x1="200" y1="0" x2="200" y2="400" strokeDasharray="2 4" />
    <line x1="0" y1="200" x2="400" y2="200" strokeDasharray="2 4" />
    <path d="M 200 20 L 205 20 M 200 40 L 205 40 M 200 60 L 205 60 M 200 80 L 205 80" />
    <path d="M 200 320 L 205 320 M 200 340 L 205 340 M 200 360 L 205 360 M 200 380 L 205 380" />
  </svg>
  ```

### 5. 大型三維微光幾何玻璃球 (`globals.css` & `page.tsx`)
* **設計意象**：在視窗邊緣放置一至兩個直徑 100px~160px 的立體微光玻璃球。當背景的圓弧與格線穿過球體時，會產生折射偏折效果，立體感躍然紙上。
* **CSS 實作 (`globals.css`)**：
  ```css
  .macro-glass-sphere {
    border-radius: 50%;
    position: fixed;
    background: radial-gradient(circle at 30% 30%, 
      rgba(255, 255, 255, 0.92) 0%, 
      rgba(255, 255, 255, 0.15) 45%, 
      rgba(130, 183, 204, 0.05) 75%, 
      rgba(130, 183, 204, 0.18) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.7) !important;
    box-shadow: 
      inset -6px -6px 14px rgba(130, 183, 204, 0.18),
      inset 6px 6px 10px rgba(255, 255, 255, 0.95),
      0 25px 55px -15px rgba(140, 124, 108, 0.16) !important;
    backdrop-filter: blur(14px) saturate(110%);
    -webkit-backdrop-filter: blur(14px) saturate(110%);
    pointer-events: none;
    z-index: 5;
    transition: transform 0.8s ease-out;
  }
  ```
* **React 元件應用 (`page.tsx`)**：
  ```tsx
  <div className="macro-glass-sphere w-[160px] h-[160px] left-[-40px] bottom-[20%] opacity-90 animate-[float-mist-c_22s_infinite_ease-in-out]" />
  <div className="macro-glass-sphere w-[100px] h-[100px] right-[5%] top-[25%] opacity-85 animate-[float-mist-a_18s_infinite_ease-in-out]" />
  ```


