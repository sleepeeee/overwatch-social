# 前端裝備使用手冊

> 定位：這份文件是 OW Social 前端新手村工具圖鑑。每個工具都像一件裝備，幫你檢查畫面、找錯誤、避免改壞網站。

## 裝備總覽

| 裝備 | 遊戲比喻 | 用途 |
|---|---|---|
| Playwright | 自動巡圖斥候 | 自動打開網站，檢查桌機與手機畫面 |
| Lighthouse | 戰鬥結算面板 | 檢查效能、SEO、無障礙與網站品質 |
| Vercel Analytics | 玩家足跡雷達 | 看玩家實際拜訪頁面 |
| Vercel Speed Insights | 延遲偵測器 | 追蹤真實玩家載入速度 |
| Storybook | UI 訓練場 | 單獨練習按鈕、卡片、表單等元件 |
| Storybook a11y | 無障礙掃描器 | 檢查按鈕、顏色對比、標籤是否友善 |

## 常用指令

| 任務 | 指令 | 成功畫面 |
|---|---|---|
| 啟動網站 | `npm run dev` | 終端機出現 `http://127.0.0.1:3000` |
| 型別檢查 | `npx tsc --noEmit` | 沒有紅字錯誤 |
| ESLint 檢查 | `npm run lint` | 沒有錯誤清單 |
| 建置檢查 | `npm run build` | 出現 Next.js build 成功訊息 |
| 自動畫面測試 | `npm run test:e2e` | Playwright 顯示測試通過 |
| Lighthouse | `npm run lighthouse` | Chrome 開啟網站品質報告 |
| Storybook | `npm run storybook` | 瀏覽器打開 `http://127.0.0.1:6006` |

## 新手防錯雷達

- 執行 Playwright 前，如果 3000 port 已有網站，測試會直接使用現有網站。
- `npm run lighthouse` 前要先開 `npm run dev`，不然它找不到本機網站。
- Storybook 是元件訓練場，不是正式網站；畫面比較像裝備展示間是正常的。
- 看到 `npm audit` 的中等風險時，不要直接按 `--force`。那像強制換裝，可能讓其他裝備壞掉。
- 手機爆版最常見來源是 `whitespace-nowrap`、固定寬度、過大的 `padding`、絕對定位裝飾。

## 回朔方式

本次優化前已建立 Git 備份分支：

```powershell
git switch backup/before-frontend-tooling-and-home-optimization-2026-06-02
```

如果只想比對目前分支和備份分支差異：

```powershell
git diff backup/before-frontend-tooling-and-home-optimization-2026-06-02...feature/web-overhaul
```
