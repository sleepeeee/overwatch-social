---
id: F-029
title: 亮底主題（minimal-magazine）token-only 覆蓋不全——部分文字隱形，使用者裁示保留為已知限制
status: active
references_to: [F-028]
referenced_by: []
change: add-standalone-theme-style
date: 2026-06-12
---

## 發現

依 design.md 預定義詮釋框架記錄的**部分 negative result**：暗底站台翻轉為亮底主題時，token-only + CSS utility 適配層（text-white/border-white 重映射）仍覆蓋不全。使用者驗收回饋「很多字都看不到」——推定殘留來源：

1. 元件內 text-white/xx 帶透明度變體、`text-zinc-50/95` 之外的非掃描範圍亮色 class
2. 彩色 chip 上的亮字（亮底下 chip 底色變淡後對比崩壞）
3. inline style / SVG 內嵌亮色（掃描範圍外）
4. 豁免元件（HomeCaptureHud 等）自帶暗底設計假設

## 影響決策

- 使用者裁示：**保留現狀不修**，主題仍可切換（developer 預覽用）
- 結論修正：「token-only 多主題」對**同明暗極性**的主題（暗→暗）成立且品質高（neon-esports 驗收通過）；**跨極性**（暗→亮）需要元件級的對比語意自覺（如 `on-surface` token 紀律）才能完整，單靠事後映射有長尾
- 未來若要正式推出亮主題：需把 white/black 系 class 全量遷移為語意 token（est. ~250 處）+ 彩色 chip 對比審查

## 引用場景

add-standalone-theme-style tasks 4.2；未來「亮色主題正式化」change 的前置依據。
