---
id: ADR-28
type: decision
title: 自適應 pixelRatio fallback（vs 純 ratio=2 / 純 ratio=1）為 mobile 名片匯出策略
status: accepted
change: fix-mobile-card-export
date: 2026-06-13
references_to: [REF-036, REF-037, F-030]
referenced_by: []
---

## 決策

`createCardImageFile`（html-to-image `toBlob` 出 PNG）採**兩階段自適應 pixelRatio**：

1. **先試 `pixelRatio=2`**（高品質，retina 設備銳利）
2. **若 blob size < 80KB（漏圖 signal）→ 退 `pixelRatio=1` 重做一次**
3. 兩次都失敗才 throw error

否決三個替代方案：

- ❌ **固定 `pixelRatio=1`**：所有設備一律低品質，犧牲 iPad Pro / retina iPhone 銳利度
- ❌ **固定 `pixelRatio=2`**：iOS Safari 在 3 hero img + foreignObject + 卡片裝飾下，memory/paint budget 受限環境會把第三張漏掉（F-030 實機驗證）
- ❌ **離屏 canvas 純合成繞 foreignObject**（Codex 對抗式審查建議方案 1）：工程量最大、要重寫 hero 構圖；可作為未來「fallback 仍失敗」的最終方案，不在本 change 範圍

## Why

### 為什麼自適應勝過固定值

- **成功 case 無代價**：ratio=2 過關 → 直接出，跟固定 ratio=2 行為相同
- **失敗 case 自動降階**：ratio=2 漏圖 → 自動 ratio=1 救回（且失敗偵測完全自動，不依賴使用者重整或裝置嗅探）
- **跨裝置 portable**：不需要 UA-sniffing 或 device class 判斷；blob size 是裝置中立的客觀指標

### 80KB threshold 由來

3 張 hero PNG embed 為 base64 dataURL + OWCard 卡片裝飾（背景漸層、tags、message 區）+ 字體 → 完整輸出 normally ≥ 80KB。pixelRatio=2 漏第三張時 blob size 顯著小於此（實機觀察）。80KB 留 safety margin 避免極簡卡片誤判（無 hero 純文字卡可能也接近此值，但本 change 範圍內所有卡片至少 1 hero）。

未來若卡片設計改動導致 threshold 失準（例如出現純文字卡），需重校 threshold 或改用更精確 signal（e.g. `naturalWidth` after-export 比對）。

### 為什麼不沿 Codex 建議走「離屏 canvas 純合成」

- 工程量大：要重寫 hero strip 構圖、字體層、裝飾層
- 跟 design.md D1+D2 範圍偏離過遠
- pixelRatio fallback 是最小增量且驗證已通過實機；保留離屏 canvas 為**下一輪 fallback 失敗時的升級路徑**

## Consequences

### 正面

- iPhone Safari 第三張立繪空白 bug 解（F-030 實機驗證）
- 程式碼增量極小（< 20 行）
- 不影響桌機 / 其他 mobile 瀏覽器行為
- 不需 UA-sniffing 維護

### 負面

- iOS Safari 大張 hero 設備上，使用者**不會察覺**圖片被降階到 ratio=1（PNG 較 ratio=2 略糊）。可選：用 toast 告知「已自動降階」，但 UX 噪音較大，本 change 不做
- 失敗偵測有兩次 `toBlob` 串行成本（~ 500ms-1s mobile）；產圖在背景非阻斷互動，使用者感知小
- 80KB threshold 為 magic number，未來卡片設計大改要校準（已記入 F-030「未來校準路徑」）

## 與其他決策的關係

- 承接 REF-036 提到的 race 假設，但 F-030 對抗式審查推翻 race 為唯一根因（補上 memory budget 真根因）
- 沿用 REF-037 的「預產 File 命中 transient activation」策略
- 跟 ADR-09（SSR 安全初始化）方法論呼應：客觀指標 > 裝置嗅探
