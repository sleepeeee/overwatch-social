---
affects_consumers: []
---

# 修復行動裝置名片圖片匯出（立繪空白 + iOS 無法存相簿）

## Why

兩個使用者實機反饋的 bug，定位於 EXPLORE 階段（REF-036 / REF-037）：

- **Bug 1（立繪空白，間歇性）**：手機保存名片圖片時英雄立繪空白，平板有時正常有時空白。根因 = `html-to-image` 在 iOS/Safari 把 DOM 序列化成 SVG `<foreignObject>` 時，圖片不保證在 canvas 擷取前 decode 完成（REF-036 race condition）。當前 `cardImageExport.ts` 的 `preloadImagesAsDataUrls` 對「尚未載入完成」的立繪 **early-return 跳過**（cardImageExport.ts:57），跳過的圖交回 foreignObject → mobile 隨機空白；且早期 commit `f22202d` 的「雙呼叫暖機」在後續重構被移除（regression），目前只呼叫一次擷取。
- **Bug 2（iPhone 存到「檔案」非「照片」）**：share 頁產圖後顯示成 `<img src={dataUrl}>` 讓使用者長按；iOS Safari 長按 `data:` URL 圖片只給「儲存到檔案」、不給「加入照片」（REF-037）。能正確進相簿的 `exportCardImage`（`navigator.share({files})` 路徑）**已寫好但全 repo 無呼叫端（dead code）**。

### 缺口錨定

- 最近鄰 prior work = **REF-036**（html-to-image foreignObject 圖片載入競態，含雙呼叫暖機修法）、**REF-037**（iOS 存照片 vs 檔案限制 + navigator.share 三眉角）。
- 本 change 針對的具體空白 = 把兩份外部知識落實到本專案匯出鏈：REF-036 揭示的「不可 early-return 跳過未載圖 + 須雙呼叫暖機」、REF-037 揭示的「iOS 需 navigator.share 預產 file + transient activation」，皆**尚未實作於 cardImageExport.ts / ShareCardClient.tsx**。

## What Changes

- **修 `src/lib/cardImageExport.ts`**：
  - `preloadImagesAsDataUrls` 不再對未載入圖 early-return；改為先確保每張 `<img>` `complete && naturalWidth>0`（必要時 await load + `decode()`）再 `drawImage` 轉 data URL。
  - 恢復雙呼叫暖機：`await document.fonts.ready` → 第一次 `toPng`/`toBlob`（暖 cache，丟棄）→ 第二次才是真正擷取。
- **修 `src/app/share/[id]/ShareCardClient.tsx`**：
  - 接上 `exportCardImage`（`navigator.share({files})`）作「儲存到相簿」入口；預先在背景產好 `File` 物件，按鈕點擊時直接 share 既有 file（解 iOS transient activation）；傳 `title: ''`。
  - 保留長按 data URL 圖片 + 文案作為 fallback（navigator.share 不支援 / iOS16 regression 時）。

## Non-Goals

- 不改 OG meta / Server Component 架構 / DB / 權限模型。
- 不保證 iOS 16「Save to Photos 從分享單消失」regression 完全解除（平台限制，僅以長按備援 + 文案緩解）。
- 不改英雄立繪圖檔本身或來源路徑。

## Impact

- 受影響 capability：`share`
- 受影響檔案：`src/lib/cardImageExport.ts`、`src/app/share/[id]/ShareCardClient.tsx`
- 知識點：REF-036、REF-037
- 純前端行為修復，無 migration、無後端變更
