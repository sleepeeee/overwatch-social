# share Specification

## ADDED Requirements

### Requirement: 行動裝置名片圖片匯出立繪完整性

名片圖片匯出（`src/lib/cardImageExport.ts`）SHALL 確保所有英雄立繪 `<img>` 在 `html-to-image` 擷取前已完成載入與 decode，使行動裝置（iOS/Safari）匯出圖片不出現立繪空白。

#### Scenario: 立繪未載入完成時不被跳過

- **WHEN** `preloadImagesAsDataUrls` 處理一張尚未 `complete` 或 `naturalWidth === 0` 的立繪 `<img>`
- **THEN** 系統 SHALL 先等待該圖 `load`（含 timeout 上限）並 `decode()` 後再轉為 data URL
- **AND** SHALL NOT 直接跳過（early-return）該圖

#### Scenario: 擷取前雙呼叫暖機

- **WHEN** `createCardImageDataUrl` 或 `exportCardImage` 進行圖片擷取
- **THEN** 系統 SHALL 先 `await document.fonts.ready`
- **AND** SHALL 先執行一次 `toPng`/`toBlob` 暖機（結果丟棄）再進行第二次正式擷取

#### Scenario: 行動裝置三張立繪完整

- **WHEN** 在行動裝置匯出一張含 3 位英雄的名片
- **THEN** 產出 PNG 中 3 張立繪皆 SHALL 完整呈現（非空白）

### Requirement: iOS 名片圖片可存入相簿

share 頁（`src/app/share/[id]/ShareCardClient.tsx`）SHALL 在支援的裝置上提供透過 `navigator.share({ files })` 將名片圖片存入系統相簿的路徑，並在不支援時提供備援。

#### Scenario: iOS 提供存入相簿入口

- **WHEN** 使用者在支援 Web Share file 的行動裝置開啟 share 頁並圖片已產生
- **THEN** 頁面 SHALL 提供「儲存到相簿」操作，點擊時呼叫 `navigator.share({ files: [file], title: "" })`
- **AND** 該 `File` SHALL 為預先在背景產好的物件（按鈕在 file 就緒前 disabled），使分享呼叫位於使用者手勢的 transient activation 內

#### Scenario: 分享取消不視為錯誤

- **WHEN** 使用者在系統分享單中取消（`AbortError`）
- **THEN** 系統 SHALL 視為正常結束，不顯示錯誤

#### Scenario: 不支援 Web Share 時的備援

- **WHEN** 裝置不支援 `navigator.share`/`canShare({files})`，或分享因非 `AbortError` 失敗
- **THEN** 系統 SHALL 保留長按產出圖片儲存 + 下載 fallback
- **AND** 頁面 SHALL 保留文案提示（如 iOS 僅出現存檔案，可於檔案 app 再加入照片）
