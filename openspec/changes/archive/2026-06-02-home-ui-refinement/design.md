## Context

為解決首頁中間看板重心塌陷、粉色卡片標籤溢出以及更新缺乏滑動動畫的體驗細節痛點，我們將重構 `LotusWelcomeWidget.tsx` 與 `src/app/page.tsx`，以進行 UI 精緻大重構。

## Goals / Non-Goals

**Goals:**
- 將中間看板 `LotusWelcomeWidget` 的內部垂直排版調整得更加緊實，消除塌陷垮掉感。
- 為卡片配置真實的使用者大頭貼圖片（相容於 `profile` 頁面大頭貼 URL）。
- 發言區高度縮小固定為 `h-[56px] min-h-[56px]`，且標籤 `game • hero` 移到名字下方防止撐爆溢出。
- 實作流暢絲滑的「左進右推」滑動更新動畫。

**Non-Goals:**
- 不改變專案的狀態管理與資料流方式。

## Decisions

### 1. 公告看板重心對齊 (中間)
- 改寫 `LotusWelcomeWidget.tsx` 的 Flex 佈局。
- 捨棄原本拉開間距的 `justify-between`，改為 **`justify-center gap-4`**。讓蓮花 SVG、當前公告、以及圓形控制項向中央靠攏，重心緊實。

### 2. 真實使用者大頭貼與標籤防溢出 (底段卡片)
- 名片左側改用 `img` 元件渲染大頭貼，不再使用圓形文字貼紙。預設為 `https://api.dicebear.com/7.x/lorelei/svg?seed=<name>` 日系手繪肖像。
- 將 `game • hero` 標籤縮小為 `text-[10px]` 並將其移到姓名下方，徹底避免姓名與標籤在同排的擠壓跑版。
- 調整發言區高度為 `h-[56px] min-h-[56px]`，tags 微調至 `text-[10.5px] px-2 py-0.5` 以釋放縱向空間。

### 3. 「左進右推」滑動更新動畫
- 在 CSS 或首頁全局加入 CSS Keyframes：
  ```css
  @keyframes slideInLeft {
    from {
      transform: translateX(-20px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  ```
- 當有新玩家名片上線時，最左邊的卡片在 React 渲染時會自動套用此動畫，產生絲滑的滑入位移效果。

## Risks / Trade-offs

- **風險**：頻繁替換名片可能會產生視覺雜亂。
- **緩解**：定時器間隔設定在 7 秒以上，位移動畫持續時間 0.6s，過渡非常溫和治癒。
