---
id: ADR-27
title: 全站語意色 token 地基 + 休眠態主題基礎建設（vs 即時上線多主題）
status: Accepted
change: add-standalone-theme-style
date: 2026-06-12
references_to: [F-028, F-029]
referenced_by: []
---

## 決策

1. **語意 token 而非逐色對映**：全站使用者面向顏色收斂為 25 個語意 token（文字 6 階 / 表面 3 / 邊框 2 / 狀態 4×底-soft-deep / accent）+ 4 個品牌光暈變數；值取 Tailwind v4 theme.css 精確 oklch 保證 behavior-preserving。拒絕 `purple-400 → --purple-400` 式搬家——只有語意層才能表達「換主題時紫變橘」。
2. **三層覆蓋**：Tailwind utility（@theme inline alias）+ CSS class 層（glass/glow/brand，color-mix 處理透明度）+ 全域基底（body/scrollbar/selection 吃 `--background` 等）。
3. **主題基礎建設保留但休眠**：ThemeContext 白名單機制 + localStorage 持久化上線；ThemeSwitcher 元件完成但不掛載（使用者裁示外觀凍結）。新主題上線 = 加 theme class + 白名單名稱 + 一行掛載。
4. **三套原型主題否決移除**：完整設計保留於 git 歷史；亮底主題的 token-only 極限誠實記錄為 F-029 negative result（暗→亮跨極性需元件級 on-surface 紀律，事後映射有長尾）。

## 理由

- 「重新設計整套風格」的真正瓶頸是 token 覆蓋完備性（F-028：實測 1,562 處硬碼、使用者面向 419 處），不是設計能力；地基一次補齊後每套新主題編寫成本 ≈ 90 個變數
- 外觀凍結需求與基礎建設投資不衝突：回歸驗證證明 token 化對現有視覺零影響（0.002%）
- 開發者後台（~1,100 處）豁免：內部工具不值得遷移成本

## 後果

- 新元件用色必須走語意 token utility（規範已入 CLAUDE.md「主題 Token 系統」章節）
- 未來亮色主題需先做 white/black 系 class 全量語意化（~250 處）+ chip 對比審查（F-029）
- FOUC 升級路徑（cookie 方案）以 TODO(theme-FOUC) 錨定於 ThemeContext
