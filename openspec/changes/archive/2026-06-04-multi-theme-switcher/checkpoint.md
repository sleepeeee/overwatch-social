# 開發存檔點 (Checkpoint) — 2026-06-04 06:03

此文件為 `multi-theme-switcher` 多主題切換器重構工作的臨時存檔點，供明日開發無縫接軌。

---

## 📌 當前任務進度

1. **已完成任務**：
   - 實作了四種明亮主題（藍莓、香草、畫廊、瑞士）及暗色模式的 CSS 變數定義，與 Tailwind v4 `@theme` 鏈結。
   - 重構 [TopBar.tsx](file:///D:/AI/overwatch/overwatch-social/src/components/TopBar.tsx) 為 Dropdown 面板主題切換器，具備 `localStorage` 狀態儲存與 Next.js `mounted` 生命週期防 Hydration Mismatch 閃動保護。
   - 移除 `next/font/google` 離線 build 失敗問題，改為 CSS 聲明靜態字型變數，**已成功通過 `npm run build` 全站打包測試**。
   - 將 [OWCard.tsx](file:///D:/AI/overwatch/overwatch-social/src/components/OWCard.tsx) 與 [page.tsx](file:///D:/AI/overwatch/overwatch-social/src/app/page.tsx) 中的硬編碼莫蘭迪色碼變數化，支援隨主題切換。

2. **探索與設計決策**：
   - 發現卡片切換時「看起來還是同一個網站」的單調感，主因是全站大背景被外層硬編碼的 `data-style="A"` 覆蓋，且 `.glass-panel` 與 `.organic-corners` 中的圓角、邊框、材質與陰影皆為寫死值。
   - 已完成 **[Impeccable 視覺主題重構提案](file:///C:/Users/a1214/.gemini/antigravity-cli/brain/6deca4fb-f2c3-4186-aaf5-94f7d91f41ea/visual_theme_proposal.md)**，計畫將這四個卡片屬性改為變數控制，以在切換主題時呈現截然不同的骨架（例如瑞士現代的直角粗黑線包浩斯風格，對比森系香草的浮雕手帳風）。

---

## 📝 明日待辦清單 (To-Do List)

- [x] **1. 結束 Explore 模式**：回到任務實作狀態。
- [x] **2. 修改 globals.css**：
  - 將 `.glass-panel` 與 `.organic-corners` 中的 `border-radius`, `border`, `background`, `box-shadow` 改為讀取 `--glass-*` 與 `--shadow-card-val` 變數。
  - 在四個主題 class (`.theme-*`) 中覆寫對應變數（特別是瑞士現代要設定直角 `0px` 與超粗黑邊框 `3px solid #111111`，森系香草保留不規則手作圓角與實色紙張感）。
- [x] **3. 修正 page.tsx 與 layout.tsx**：
  - 移除 `data-style="A"`，改由 `theme-*` class 全面接管。
  - 調整 Hero Banner 卡片的 `Badge` 與文字配色為 dynamic variables。
- [x] **4. 啟動伺服器驗證**：
  - 執行 `npm run dev` 啟動 `http://127.0.0.1:3000` 讓使用者實際點擊檢查驚艷的視覺變形效果！

---

## ⚡ 明日重啟指令

明日對話時，請輸入以下指令：
```bash
/openspec-apply-change multi-theme-switcher
# 並提醒 AI 讀取本存檔點：D:\AI\overwatch\openspec\changes\multi-theme-switcher\checkpoint.md
```
