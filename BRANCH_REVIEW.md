# Branch Review：`visual/browse-dual-style-lab`

> **給朋友 Agent 的修復指南**
> 審查時間：2026-06-07
> 審查對象：`origin/visual/browse-dual-style-lab` vs `origin/main`
> 產生方式：sleep 委派 AI agent 執行多角度 code review

---

## 優先層級說明

| 層級 | 意義 |
|------|------|
| 🔴 P0 — 封鎖 | merge 前**必須修**，否則生產環境直接壞掉 |
| 🟠 P1 — 視覺缺失 | 功能不完整，使用者能感知到，應於 merge 前修 |
| 🟡 P2 — 架構衝突 | 需要 sleep 確認方向後再動，**不要自行決定** |
| 🔵 P3 — 技術債 | 可 merge 後另開 PR 清理 |

---

## 🔴 P0：封鎖問題（必修）

### BUG-01：localhost dev script 混入生產碼

**檔案**：`src/app/layout.tsx`，第 59–61 行

**現況**：
```tsx
{/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
```

**影響**：部署至 Vercel 後，每個訪客的瀏覽器都會對 `localhost:8400` 發出 HTTP 請求，必然失敗（`ERR_CONNECTION_REFUSED`），Console 充滿錯誤，部分瀏覽器因 Mixed Content 政策進一步攔截。

**修法**：直接刪除這 3 行（含注解），不需保留：
```tsx
// 刪掉以下三行：
{/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
```

---

### BUG-02：next/font 字型載入被替換成無效 stub

**檔案**：`src/app/layout.tsx`，第 11–12 行

**現況**：
```tsx
const geistSans = { variable: "--font-geist-sans" };
const notoSansTC = { variable: "--font-noto-sans-tc" };
```

**問題根因**：`next/font/google` 的 `Geist()` / `Noto_Sans_TC()` 呼叫會在 `<html>` 上掛載一個隨機 class（如 `__variable_abc123`），同時在 `<style>` 注入 `.__variable_abc123 { --font-geist-sans: 'Geist', ... }` 規則。改成純 JS object 後，`<html className="--font-geist-sans --font-noto-sans-tc antialiased">` 只加了字串當 class，不對應任何 CSS 規則，字型 variable 永遠不被 inject。

雖然 `globals.css :root` 有 fallback 字串定義，但 next/font 的字型預載、子集優化（subsetting）完全失效，網路較慢時所有文字閃爍顯示系統字型（FOUT）。

**修法**：恢復原始 next/font 載入方式：
```tsx
import { Geist, Noto_Sans_TC } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
```

---

## 🟠 P1：視覺缺失（應修）

### BUG-03：`starry-midnight` 主題的 OWCard 沒有對應分支

**檔案**：`src/components/OWCard.tsx`，第 139–290 行

**現況**：OWCard 有三個主題分支：
- 第 139 行：`if (theme === "soft-midnight-lounge")`
- 第 186 行：`if (theme === "paper-card-social")`
- 第 236 行：`if (theme === "cyber-matchmaking-hub")`
- 第 290+ 行：預設（original-baseline 水彩暖色）

`ThemeContext.tsx` 定義了 5 個主題，但 `starry-midnight` 沒有對應 OWCard render 分支，切到此主題時卡片顯示 original-baseline 的暖棕水彩風格，與 `starry-midnight` 的黑底霓虹設計完全衝突。

**修法**：在 `if (theme === "cyber-matchmaking-hub") { ... }` 的結尾 `}` 之後、`return (` 之前，插入 `starry-midnight` 的專屬分支。參考 `globals.css` 中 `.theme-starry-midnight` 的設計語言：
- 背景：`#08080f`（近純黑）
- 主色：`#00f0ff`（青色）
- 邊框：`#ff007f`（品紅）
- 字型：等寬字型（`var(--font-geist-mono)`）
- 風格：賽博霓虹，sharp corners（`border-radius: 0`）

---

### BUG-04：`starry-midnight` 主題的 FloatingDock 沒有對應分支

**檔案**：`src/components/morning-sketch/FloatingDock.tsx`，第 27–37 行

**現況**：
```tsx
let dockClass = "... bg-white/25 ... border-white/40 ..."; // 預設白色磨砂玻璃
if (theme === "soft-midnight-lounge") { dockClass = "..."; }
else if (theme === "paper-card-social") { dockClass = "..."; }
else if (theme === "cyber-matchmaking-hub") { dockClass = "..."; }
// ← starry-midnight 落到預設白色 Dock
```

**影響**：`starry-midnight` 背景是 `#000000` 純黑，白色磨砂玻璃 Dock 雖然可見，但 morandi 藍色的 active 指示器（`#82b7cc`）與主題的青色（`#00f0ff`）/ 品紅（`#ff007f`）嚴重衝突。

**修法**：在 `else if (theme === "cyber-matchmaking-hub")` 後加：
```tsx
} else if (theme === "starry-midnight") {
  dockClass = "relative px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-none flex items-center gap-4 sm:gap-6 bg-[#08080f]/95 border border-[#ff007f] shadow-[0_0_20px_rgba(255,0,127,0.2)] h-[48px] sm:h-[58px] transition-all duration-300";
}
```
同時，第 50–63 行的 item active 樣式也需要加 `starry-midnight` 的霓虹色處理。

---

### BUG-05：`starry-midnight` 主題的 ArtOrnament 沒有底層裝飾

**檔案**：`src/components/morning-sketch/ArtOrnament.tsx`，第 12 行附近

**現況**：ArtOrnament 只有 original-baseline / soft-midnight-lounge / paper-card-social / cyber-matchmaking-hub 四個分支。

**影響**：在 `/browse`、`/profile` 等非首頁路由下，`starry-midnight` 沒有任何底層裝飾元素，背景退化為單色漸層色塊，星空粒子效果完全消失（那些 DOM 節點只存在於 `page.tsx`）。

**修法**：ArtOrnament 加入 `starry-midnight` 分支，渲染星點粒子背景（參考 `page.tsx` 裡 `starry-bg-container` 的實作，抽出來共用）。

---

### BUG-06：`starry-midnight` 主題的 FeaturedArtists 沒有對應樣式

**檔案**：`src/components/morning-sketch/FeaturedArtists.tsx`，第 119 行附近

**現況**：cardClass / dateClass / badgeClass 都只有三個主題分支，`starry-midnight` 落到 else（original-baseline 米白暖色）。

**影響**：`bg-white/20 border-[#8c7c6c]/10 text-[#5d4037]` 的暖棕色卡片配在 `#000000` 純黑背景上，色彩割裂明顯。

**修法**：在三個 if-else 鏈的最後加入 `starry-midnight` 分支，使用深色背景 + 霓虹邊框配色。

---

## 🟡 P2：架構衝突（等 sleep 確認再動）

> ⚠️ 以下兩個問題涉及架構方向選擇，**不要自行修改**，先回報給 sleep 確認後再執行。

### CONFLICT-A：主題系統雙軌並存

**問題**：
- 舊系統：`<html data-style="A">` + `globals.css` 的 `[data-style="A"]` 選擇器
- 新系統：`ThemeContext` + `<html class="theme-original-baseline">`

`layout.tsx` 中 `data-style="A"` 已被移除，但 `globals.css` 仍有 `[data-style="A"]`、`[data-style="B"]`、`[data-style="AB"]` 選擇器，這些選擇器負責設定 `--theme-accent` 和 `--theme-accent-rgb`。移除後，`--theme-accent-rgb` 永遠不被設定，`.cyber-dots` 底紋失效，部分 box-shadow 顏色也受影響。

**需要 sleep 決定**：
- 選項 A：完全移除舊 `[data-style]` 選擇器，改由 ThemeContext class 系統接管
- 選項 B：要求保留 `data-style="A"` 在 `<html>` 上（舊選擇器繼續生效）

---

### CONFLICT-B：OWCard 預設版用 `text-foreground` 可能在 SSR 閃爍

**問題**：
```tsx
// OWCard.tsx 預設 return（original-baseline 主題）
<div className="theme-card ... text-foreground ...">
```

`ThemeProvider` 在 `useEffect` 才讀 localStorage 並套用主題 class，SSR 首次渲染時 `<html>` 上沒有任何 theme class，`text-foreground` 解析到 `:root` 的 `--foreground: oklch(0.145 0 0)`（近純黑）。original-baseline 的設計意圖是 `#2F3A55`（深海軍藍）。

**需要 sleep 決定**：
- 選項 A：接受短暫 FOUC（首次渲染顏色略深），維持現狀
- 選項 B：在 ThemeProvider 加 SSR 安全的初始 class 注入（`suppressHydrationWarning` + 同步讀取 script）

---

## 🔵 P3：技術債（可事後清理）

> 以下問題不阻擋 merge，但建議另開 PR 清理。

### DEBT-01：globals.css 有整塊重複宣告

- `html, body { user-select: none }` 區塊（含 vendor prefix）完整重複兩次
- `@media (max-width: 640px)` 區塊（含 body / glass-panel / organic-corners / art-mist）完整重複兩次
- 結果：修改行動端樣式只改第一份會被第二份蓋掉，難以 debug

### DEBT-02：`.browse-tab-active` 定義三次

`globals.css` 中 `.browse-tab-active` 出現在三處（基本定義 / `!important` 覆蓋區塊 / `[data-theme-expert]` 版本），新增主題時漏改任一份會靜默失效。

### DEBT-03：SVG blob CSS 變數重複定義

`--ms-a1-blob-blue` 等變數在 `:root` 內定義了兩次（第 ~124 行與第 ~708 行），前者完全被後者覆蓋，浪費約 5–8KB CSS bundle。

### DEBT-04：globals.css 有 50+ 個 `!important`

大量 `!important` 讓 dark mode 下主題 token 無法在正常 CSS 層級覆蓋，形成 `!important` 軍備競賽。建議逐步改用 CSS 層（`@layer`）控制優先級。

---

## 修復後驗收清單

Agent 修完後，請確認以下項目：

- [ ] BUG-01：`layout.tsx` 中已無 `localhost:8400` 字樣（`grep -n "localhost" src/app/layout.tsx` 應無結果）
- [ ] BUG-02：`layout.tsx` 恢復 `import { Geist, Noto_Sans_TC } from "next/font/google"` 並正確呼叫
- [ ] BUG-03：切換至 `starry-midnight` 主題，OWCard 渲染黑底霓虹風格（不是水彩暖色）
- [ ] BUG-04：切換至 `starry-midnight` 主題，FloatingDock 顯示深色背景（不是白色磨砂玻璃）
- [ ] BUG-05：在 `/browse` 頁面切換至 `starry-midnight`，背景有星空裝飾層
- [ ] BUG-06：切換至 `starry-midnight` 主題，FeaturedArtists 卡片使用深色霓虹配色
- [ ] CONFLICT-A / CONFLICT-B：已與 sleep 確認方向（不自行決定）

---

*此文件由 sleep 的 AI agent 根據 code review 自動產生，如有疑問請聯繫 sleep。*
