## Context

在目前的開發者控制台（`/developer`）中，微調功能散落在獨立 Tab 中，且缺乏針對首頁「站長隨筆手札」的精密定位（X/Y 偏移、縮放、字型大小）與自訂圖片圖標功能。本設計旨在於「高階製程工具 (APC Tools)」分頁內，新增子工具「首頁內容精密調校儀」，並實現完整的參數持久化與前端 inline styles 動態渲染。

## Goals / Non-Goals

**Goals:**
- 將首頁對準與編輯功能整合至「高階製程工具 (APC Tools)」底下，做為子面板。
- 支援 Segmented Buttons 選擇按鈕，一鍵切換要調校的公告 (01-04)。
- 提供針對圖標、標題、內文與按鈕組的 X 軸與 Y 軸平移（translate），圖標縮放比例，以及標題與內文的字體大小精密微調表單。
- 支援上傳自定義 PNG/JPG 圖標圖片，並能一鍵清除還原為預設蓮花 SVG。
- 首頁元件動態套用調校後的樣式。

**Non-Goals:**
- 不改變原本公告切換的狀態機與時間邏輯。
- 不改變專案中其他英雄立繪對準儀（APC Aligner）的運作。

## Decisions

### 1. 歸類與子分頁路由切換
- 在 `DeveloperConsoleClient.tsx` 中新增子狀態：
  ```typescript
  const [activeApcTool, setActiveApcTool] = useState<"none" | "homepage">("none");
  ```
- 當 `activeTab === "tools" && activeApcTool === "homepage"` 時，渲染首頁對準面板，並在頂部繪製 `◀ 返回 APC 工具列表` 鈕以將狀態切回 `"none"`。

### 2. 擴展公告 JSON 結構 (`announcements.json`)
- 為每一筆公告新增 `custom_icon_url` (預設為空字串) 與 `alignments` 物件，包含：
  `icon_x` (0), `icon_y` (0), `icon_scale` (100), `title_font_size` (18), `title_x` (0), `title_y` (0), `message_font_size` (13), `message_x` (0), `message_y` (0), `buttons_x` (0), `buttons_y` (0)。

### 3. 自定義圖片上傳 Action (`src/app/actions/homepage.ts`)
- 實作 `uploadAnnouncementIcon(num: string, formData: FormData)`：
  - 從 `formData` 中提取檔案，轉換為 Buffer。
  - 將其寫入實體資料夾 `public/uploads/announcement_icon_${num}${ext}`。
  - 返回圖片 URL（例如 `/uploads/announcement_icon_01.png`）。

### 4. 前端 inline styles 動態套用
- **圖標**：`<div style={{ transform: `translate(${current.alignments?.icon_x || 0}px, ${current.alignments?.icon_y || 0}px) scale(${(current.alignments?.icon_scale || 100) / 100})` }}>`。有自定義 URL 則渲染 `<img>`，否則渲染 `<svg>`。
- **標題**：`<h4 style={{ fontSize: `${current.alignments?.title_font_size || 18}px`, transform: `translate(${current.alignments?.title_x || 0}px, ${current.alignments?.title_y || 0}px)` }}>`。
- **內文**：`<p style={{ fontSize: `${current.alignments?.message_font_size || 13}px`, transform: `translate(${current.alignments?.message_x || 0}px, ${current.alignments?.message_y || 0}px)` }}>`。
- **按鈕組**：`<div style={{ transform: `translate(${current.alignments?.buttons_x || 0}px, ${current.alignments?.buttons_y || 0}px)` }}>`。

## Risks / Trade-offs

- **[Risk] 使用者輸入極端參數導致版面嚴重跑位** → **[Mitigation]** 在後台 UI 中設定合理的數值限制，例如：字型大小限 `10px - 28px`，X/Y 偏移限 `-50px - 50px`，縮放比限 `50% - 150%`，以防版面全毀。
