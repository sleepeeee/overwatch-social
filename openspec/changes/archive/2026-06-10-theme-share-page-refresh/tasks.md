## 1. 介面重構 (UI Refactoring)

- [x] 1.1 在 `ShareCardClient.tsx` 中移除 `<FluidClipPath />` 裝飾，並新增 `fixed inset-0 ambient-space-glows pointer-events-none z-0` 全螢幕無縫大氣漸層背景層。
- [x] 1.2 將「返回大廳廣場」按鈕的 Tailwind 樣式重構為暗色玻璃風格，並確保其具有適當的 Hover 效果。
- [x] 1.3 將右上角 `已成功載入特工分享名片` 提示泡泡改為極光紫（`bg-auroraMint/10 border-auroraMint/20 text-auroraMint`）配色。
- [x] 1.4 將「保存此卡片為圖片」按鈕改為漸層極光紫羅蘭色（`bg-gradient-to-r from-auroraTeal to-auroraMint text-white`），我也要建立卡片按鈕改為暗色玻璃效果（`border-white/10 hover:border-auroraMint/30 text-zinc-300 hover:text-white bg-white/[0.01] hover:bg-white/[0.03]`）。
- [x] 1.5 將下方 `💡 點擊名片上的...` 說明文字變更為符合星空主題的字體（`font-sans`）並套用 `text-zinc-400/80` 鋅灰色，徹底清除頁面中所有莫蘭迪舊顏色與字體殘留。

## 2. 視覺與功能驗證 (Verification)

- [ ] 2.1 訪問本機 `/share/{valid-id}` 頁面，確認整體視覺背景、按鈕、提示文字均與大廳廣場高度一致，且暗色主題對比度適中，字體清晰。
- [ ] 2.2 點擊「保存此卡片為圖片」按鈕，驗證下載 PNG 功能依然能正常導出卡片圖片。
