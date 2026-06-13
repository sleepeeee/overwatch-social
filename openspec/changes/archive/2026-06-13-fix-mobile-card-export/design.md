# 設計 — fix-mobile-card-export

## Context

名片圖片匯出鏈：`ShareCardClient`（呼叫端）→ `cardImageExport.ts`（`createCardImageDataUrl` 產預覽 data URL / `exportCardImage` 產 File 並分享/下載）→ `html-to-image` `toPng`/`toBlob`。立繪為同源 `<img src="/images/heroes/busts/{id}.png">`（OWCard.tsx:238），每張卡最多 3 張。

## Goals

- 行動裝置匯出圖片中 3 張立繪穩定不空白（消除 decode race）。
- iOS 提供「存入相簿」的可行路徑（非只能存檔案）。

## Non-Goals

- 不解決 iOS16 navigator.share「Save to Photos」消失的平台 regression。
- 不重寫匯出套件或改 SSR/Server Component 邊界。

## Decisions

### D1 — `preloadImagesAsDataUrls` 不跳過未載入圖（REF-036）

**問題**：現行 `if (!img.complete || img.naturalWidth === 0) return;` 對未 decode 圖直接跳過，交回 foreignObject → mobile 空白。

**決策**：移除 early-return skip。對每張 `<img>`：若未 `complete`，先 `await` 其 `load`（含 timeout 上限，避免單張壞圖卡死）；再 `await img.decode().catch(()=>{})`；確認 `naturalWidth>0` 後才 `canvas.drawImage` 轉 data URL。轉檔失敗（CORS 等）才保留原 src。

### D2 — 恢復雙呼叫暖機（REF-036）

**決策**：`createCardImageDataUrl` 與 `exportCardImage` 在真正擷取前，先 `await document.fonts.ready` 並跑一次 `toPng`/`toBlob`（丟棄結果）暖 cache，第二次才取用。承接已被重構移除的 commit `f22202d` 修法。

### D3 — iOS 存相簿走 navigator.share，預產 File 解 transient activation（REF-037）

**問題**：`navigator.share` 必須在使用者手勢同步鏈內呼叫；若點擊後才 await 產圖，activation 過期 → `NotAllowedError` → 掉回存檔案。

**決策**：`ShareCardClient` 在背景產圖時**同時保留 `File` 物件**（state）。「儲存到相簿」按鈕在 file 就緒前 disabled；點擊時直接 `navigator.share({ files:[file], title:'' })`（既有 file，無 await 產圖），命中 transient activation。`title:''` 避免 iOS 當成純文字分享而吞掉 file。share 不支援 / 失敗（非 AbortError）時 fallback 到既有長按 data URL + 下載。

### D4 — 長按備援保留

**決策**：保留現行「顯示產出圖片供長按儲存」+ 文案，作為 navigator.share 不可用（桌機 / iOS16 regression / 非 Safari）時的備援，不移除。

## Risks / Trade-offs

| 風險 | 緩解 |
|---|---|
| iOS16 navigator.share「Save to Photos」消失 | 平台限制不可控；保留長按備援 + 文案提示（D4）|
| 雙呼叫暖機使行動裝置產圖變慢（多一次擷取）| share 頁已有 loading overlay；產圖在背景非阻斷互動 |
| 單張立繪壞圖（404）阻塞 await load | load 等待設 timeout 上限（沿用現行 5s 模式）+ `onError` 已 fallback silhouette.png |
| transient activation 仍可能因 file 未就緒而失效 | 按鈕在 file 就緒前 disabled，確保點擊時 file 已存在 |

## 預先定義詮釋框架

- 修法成功判準：iPhone + iPad 多版本 iOS 實機，連續 3 次匯出，3 張立繪皆完整（Bug 1 解）；iOS 出現「儲存影像」可進相簿（Bug 2 解，iOS16 regression 版本除外，以長按備援覆蓋）。
- 若實機仍間歇空白 → 假設 D1+D2 不足，升級為「擷取前對 foreignObject 內圖片逐張驗證重試」或改用 canvas 直接合成（負面結果亦記入 Finding）。
