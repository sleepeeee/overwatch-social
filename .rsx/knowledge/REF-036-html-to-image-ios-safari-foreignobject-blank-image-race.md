---
id: REF-036
type: github
title: html-to-image 在 iOS/Safari 的 foreignObject 圖片載入競態（blank image）
url: https://github.com/bubkoo/html-to-image/issues/361
status: active
references_to: [REF-037]
referenced_by: [REF-037, F-030, ADR-28]
---

# html-to-image 在 iOS/Safari 的 foreignObject 圖片載入競態

## 機制

`html-to-image`（與前身 `dom-to-image`）的 `toPng`/`toBlob` 流程：
DOM → 序列化成 SVG `<foreignObject>` → 畫到 `<canvas>` → 匯出 PNG。

**問題**：資源（圖片、字型）在 SVG `<foreignObject>` 內**不保證在 canvas 擷取前載入完成**。瀏覽器把序列化後的 SVG 當成獨立文件，原文件已 decode 的圖在此重新解析時可能來不及就緒，Safari 直接渲染成空白。

## 症狀特徵（與本專案 bug 完全吻合）

- **間歇性**：同一張卡片有時有圖、有時空白（race condition）
- **first-call failure**：第一次呼叫常缺圖，第二次才正常（cache 未暖）
- **平台差異**：Chrome 幾乎不出問題；iOS/Safari 是最弱目標（官方 baseline Safari 16）
- 診斷指標：擷取當下若某 `<img>` 的 `naturalWidth === 0` → 該圖沒 decode 完 → 空白

## 已知有效修法（社群驗證）

1. **雙呼叫暖機**：`await document.fonts.ready` → `await toPng(node)`（第一次暖 cache，丟棄）→ 第二次 `toPng` 才是真正擷取。對 first-call/間歇問題最有效。
2. **擷取前確保每張圖 decode 完成**：逐一檢查 `img.complete === true && img.naturalWidth > 0`，並 `await img.decode().catch(()=>{})`；**不可對未載完的圖直接跳過**。
3. **預轉 data URL**：同源圖用 `canvas.drawImage` 提取為 base64 inline，繞過 foreignObject 內的網路 fetch（但前提同樣是圖必須先 decode 完）。
4. 避免 cross-origin 與 SVG 來源圖（Safari 不支援 foreignObject 內 SVG img / 跨域圖）。

## 本專案對應

- 匯出邏輯：`src/lib/cardImageExport.ts`（`createCardImageDataUrl` / `exportCardImage`）
- 立繪：`src/components/OWCard.tsx:238` `<img src="/images/heroes/busts/{id}.png">`（同源，3 張）
- **缺陷點**：`preloadImagesAsDataUrls` 對 `!img.complete || naturalWidth===0` 的圖 **early-return 跳過**（cardImageExport.ts:57），被跳過的圖交回 foreignObject → mobile 隨機空白；且當前版本**已無雙呼叫暖機**（早期 commit f22202d 曾加入，後續重構移除 → 疑似 regression）。
- 既往修補嘗試：f22202d（雙呼叫暖機）、6e186a0（預 fetch data URL）、c004d8f（viewport 內渲染）、40eb096（加等待 1.5s+5s）——治標未根治間歇性。

## 來源

- bubkoo/html-to-image #361「Image is not showing in some cases iOS, Safari」
- bubkoo/html-to-image #461 / #488 / #348（Safari blank / download 缺圖）
- tsayen/dom-to-image #343「missing on first render Safari iOS」
- DEV「KaTeX + html-to-image Outputs a Blank White Image」（雙呼叫暖機 pattern）
