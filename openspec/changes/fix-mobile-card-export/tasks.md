# Tasks — fix-mobile-card-export

## 實作

- [x] **1. 環境/基線校準**：`npm run build` 取得綠燈基線；確認 `cardImageExport.ts` 當前行為（單次擷取 + preload early-return）與 `ShareCardClient` 僅用 `createCardImageDataUrl`。
- [x] **2. 修 `preloadImagesAsDataUrls`（D1，Bug 1）**：移除未載入圖的 early-return；對未 `complete` 的圖 `await` load（timeout 上限）+ `decode()`，確認 `naturalWidth>0` 後再 `drawImage` 轉 data URL。
- [x] **3. 恢復雙呼叫暖機（D2，Bug 1）**：`createCardImageDataUrl` 與 `exportCardImage` 於正式擷取前 `await document.fonts.ready` + 跑一次 `toPng`/`toBlob` 暖機丟棄。
- [x] **4. share 頁接「儲存到相簿」（D3，Bug 2）**：`ShareCardClient` 背景產圖時保留 `File` state；新增「儲存到相簿」按鈕（file 就緒前 disabled），點擊直接 `navigator.share({files:[file], title:""})`；`AbortError` 視為正常；非 `AbortError` fallback。
- [x] **5. 長按備援 + 文案（D4，Bug 2）**：保留長按 data URL 圖片儲存 + 下載 fallback；文案調整（iOS 僅出現存檔案時的引導）。
- [x] **6. 驗證**：`npx tsc --noEmit` 0 errors；`npm run build` 綠燈；現有 e2e 不退化。

## 守門（§6.7）

- [ ] **7. 實機驗證（人工，MANDATORY）**：iPhone + iPad，至少 2 個 iOS 版本，連續 3 次匯出——(a) 3 張立繪皆完整；(b) iOS 出現「儲存影像」可進相簿（iOS16 regression 版本以長按備援覆蓋並記錄）。
- [x] **8. §6.7 守門**：Codex L1 審查完成 → NEEDS-REVISION（1 Major + 2 Minor，皆功能缺陷類）→ 全數修復 → build 重綠燈。詳見：
    - M1（功能缺陷）：產圖 effect 漏 auth 依賴；修法 = 等 authLoading + dep 加 user/authLoading（ShareCardClient.tsx:51）
    - m1（UX）：mount probe canShare 偵測 false negative；修法 = 改用真實 cardFile 即時 canShare（ShareCardClient.tsx:42, 76）
    - m2（cleanup）：copy timer 無 unmount cleanup；修法 = useRef + cleanup effect（ShareCardClient.tsx:78-86, 110-118）
