## 1. Git 隔離預覽與環境準備

- [x] 1.1 執行 `git status` 與 `git stash` 暫存當前分支未提交的工作，確保開發安全性
- [x] 1.2 建立並切換至全新的預覽分支 `feature/calm-art-ui-preview`

## 2. 全局樣式、紙質噪點與玻璃 Tokens 實作

- [x] 2.1 修改 `src/app/globals.css`，註冊不對稱大圓角、多重軟陰影與高光內陰影 Tokens
- [x] 2.2 在 `globals.css` 的 `body::before` 中疊加超輕量內聯 SVG 噪點濾鏡，透明度設定為 0.015，實現全站實體紙張質感
- [x] 2.3 在 `globals.css` 中設定 3 個大模糊度（120px 以上）、低飽和度（0.12 - 0.2）呼吸斑塊動畫，保留並融合原有的 Style A/B/AB 主題色系

## 3. 背景藝術裝飾層與佈局置入

- [x] 3.1 新建背景藝術裝飾元件 `src/components/morning-sketch/ArtOrnament.tsx`
- [x] 3.2 在 `ArtOrnament.tsx` 中 Inline 渲染低飽和貝茲流動線條（不透明度小於 0.09）與禪意同心圓虛線裝飾
- [x] 3.3 修改 `src/app/layout.tsx`，在 `body` 最底部渲染 `ArtOrnament`，確保全站裝飾層渲染且位於內容底層（z-0）

## 4. 首頁 Hero 區塊與進度環手繪重構

- [x] 4.1 修改 `src/app/page.tsx`，移除 Hero 區塊的座標偏光懸停與全息旋轉雷達，改為「禪意水滴同心圓與動態微瀾」裝飾
- [x] 4.2 重構 `page.tsx` 中 Tasks Overview 的環狀進度條為手繪筆刷水彩圓弧
- [x] 4.3 優化最新特工名片列表中的標籤貼紙效果與邊框不透明度，使其更為溫柔安靜

## 5. 導航列水滴互動與預覽啟動

- [x] 5.1 修改 `src/components/morning-sketch/FloatingDock.tsx`，移除 macOS 魚眼縮放，換成極為溫順的「水滴膨脹與水彩暈染」hover 互動
- [x] 5.2 執行 `npm run dev` 啟動 Next.js 本地開發伺服器，讓使用者直接在瀏覽器操作、測試並確認效果
