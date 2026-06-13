---
id: REF-037
type: blog
title: iOS Safari 儲存圖片到「照片」vs「檔案」的限制與 navigator.share
url: https://developer.apple.com/forums/thread/729782
status: active
references_to: [REF-036]
referenced_by: [REF-036, F-030, ADR-28]
---

# iOS Safari 儲存圖片到「照片」vs「檔案」的限制

## 現象

使用者在 iPhone 上對網頁圖片操作後，圖片只能存到「**檔案**」app，**選單沒有「加入照片 / 儲存影像」**（無法直接進相簿）。

## 三個獨立根因（依入口而定）

### 1. 長按 data URL / blob 圖片 → 只給「儲存到檔案」
iOS Safari 對 **標準 http(s) 圖片**長按才會出現「儲存影像」→ 進相簿。
對 **`data:` URL 或 blob 來源**的 `<img>` 長按，常只給「加入檔案」「拷貝」，**不給「加入照片」**——Safari 不把它當成標準可存相簿的照片資源。
→ 這正是「產圖後顯示成 `<img src={dataUrl}>` 讓使用者長按」會踩到的坑。

### 2. navigator.share({files}) 才是進相簿的正解（但有限制）
Web Share API 傳 `File` 物件可喚起 iOS 系統分享單，出現「**儲存影像**」直接進相簿。比長按可靠。
**但限制**：
- **iOS 16 regression**（Apple 開發者論壇 thread 729782）：部分 iOS 16 版本分享單的「Save to Photos」消失，只剩「Save to Files」；iOS 15.7 正常。行為依 iOS 點版本而異，非完全可控。
- **transient activation**：`navigator.share` 必須在使用者手勢（點擊）的**同步鏈內**呼叫。若按鈕 handler 先 `await` 長時間產圖再 share，activation 已過期 → 拋 `NotAllowedError` → 失敗。
  → 修法：**預先在背景產好 `File`**，按鈕點下時直接 `share` 既有 file，不在點擊後才產圖。
- **File 要正確**：用 Blob + 正確 MIME（`image/png`）+ 正確副檔名建 `File`；傳 `title: ''`（空標題）可避免 iOS 把分享當成「純文字分享」而吞掉 file。

### 3. fallback：`<a download>` 在 iOS 也進檔案不進相簿
`<a download>` + `click()`（本專案 `downloadBlob`）在 iOS 同樣只進「檔案」app，且 iOS 對 `download` 屬性支援薄弱。非相簿解法。

## 本專案對應

- share 頁（`src/app/share/[id]/ShareCardClient.tsx`）目前**只**用 `createCardImageDataUrl` → 顯示成 `<img src={dataUrl}>` 讓使用者長按 → 命中根因 1（只進檔案）。
- `exportCardImage`（cardImageExport.ts:106，含 `navigator.share` files 路徑 = 根因 2 的正解）**已寫好但全 repo 無任何呼叫端**（dead code）。
- 修法方向：share 頁加「儲存到相簿」按鈕接 `exportCardImage`，並處理 transient activation（預產 file）+ `title:''`；同時給「長按圖片」備援 + 文案提示 iOS16 可能只剩存檔案。

## 來源

- Apple Developer Forums thread 729782「Safari Webshare API: Save to photos is missing in iOS 16」
- Apple Developer Forums thread 665812（navigator.share image on iOS 行為 / title 影響）
- SimplyMac / Gadget Hacks（長按只進 Files 的使用者繞法：Files → 長按 → Add to Photos）
