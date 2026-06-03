## 1. FeaturedArtists.tsx 修改

- [x] 1.1 移除 `import HomeCaptureHud from "@/components/morning-sketch/HomeCaptureHud"`
- [x] 1.2 outer div 改為 `flex flex-col h-full w-full`
- [x] 1.3 LOBBY EVENTS glass-panel 加 `flex-1`
- [x] 1.4 移除 `{!isStyleA && <HomeCaptureHud />}` 渲染段落

## 2. page.tsx 佈局重構

- [x] 2.1 移除外層 `lg:grid-cols-12 items-start` 容器及 `col-span-8` 內嵌結構
- [x] 2.2 改為 `space-y-8` 外層 + `grid grid-cols-1 md:grid-cols-3 gap-8` widget row
- [x] 2.3 LUCKY ALLY / LotusWelcomeWidget / FeaturedArtists 各佔一欄，同層等高
- [x] 2.4 最新在大廳 section 移至 widget row 下方（獨立 row）

## 3. 驗收

- [x] 3.1 TypeScript + build 驗證通過
- [x] 3.2 本機瀏覽器確認三欄等高（截圖驗證）
- [x] 3.3 首頁 HUD 消失，LOBBY EVENTS 面板與左側兩欄高度對齊
- [x] 3.4 最新在大廳玩家 section 仍正常顯示在 widget 下方
