---
id: F-030
type: finding
title: mobile 名片立繪空白真根因——iOS Safari foreignObject 在 pixelRatio:2 + 多 hero img memory budget 漏圖；對抗式審查推翻單一 race 假設
status: confirmed
references_to: [REF-036, REF-037]
referenced_by: [ADR-28]
change: fix-mobile-card-export
date: 2026-06-13
---

## 發現

### 初始假設（被推翻）

design.md D1+D2 設計時把 mobile 立繪空白歸因於**單純 html-to-image 序列化 foreignObject 時 image decode race**（REF-036），修法 = 預先把 `<img>` 轉成 dataURL 繞 race。

第一輪 fix（canvas drawImage）+ 第二輪 fix（fetch + FileReader 完全繞過 `<img>` load timing）實機**仍未解**第三張霧子立繪空白。使用者觀察：「點前往保存與分享進去後，第一秒霧子立繪是有的，讀取結束後反而消失」——強烈 signal 指向**產出 PNG 端**而非 live OWCard。

### 對抗式審查找到真根因

Codex 對抗式審查（Q5）：把 src 改 dataURL 不保證安全，**`pixelRatio:2` 讓輸出 surface 直接放大，iOS Safari foreignObject rasterization 的 memory/paint budget 在三張 hero PNG + 卡片裝飾 + 字體下會炸**，第三欄被吃掉。修法只是把 race 推前，沒避開那條脆弱路徑。

實機驗證：把 `pixelRatio` 退到 1 第三張立繪恢復正常——確認 memory budget 假設。

### 為什麼第三張穩定壞、前兩張穩定好

iOS Safari foreignObject 序列化按順序 rasterize，前兩張耗掉 memory budget 後第三張就空。三欄等寬 flex layout 沒有 kiriko-only CSS 分支（OWCard.tsx:213-258 三欄 markup 相同），確認問題不在 CSS。

### pixelRatio fallback 設計

採「先試 ratio=2，blob size < 80KB 視為漏圖 signal 退 ratio=1 重做」自適應策略：

- 80KB threshold 由來：3 張 hero PNG 完整輸出 normally ≥ 80KB（PNG 含三張立繪 dataURL embed 後 base64 化 + html-to-image SVG wrap 後最低估算）；ratio=2 漏第三張時 blob size 顯著小於此。
- 失敗 case：兩次都失敗（極罕見）→ throw error，UI overlay 卡 loading；user 可重整。
- 為什麼不直接固定 ratio=1：降階保底但犧牲高解析設備（iPad Pro / retina）品質。fallback 模式對成功 case 無代價（ratio=2 過關直接出），對失敗 case 自動降階。

## 對抗式審查方法論教訓

1. **「使用者觀察」遠勝「規格推理」**：「第一秒在、讀取後消失」這句話定位產出端 vs live render，比任何 timeline 推測精準。R&D bug fix 流程**第一輪實機反饋必須帶具體 signal**（截圖、時序描述），不能只「修好了/沒修好」。
2. **修法成本與根因深度不成比例**：D1+D2 兩輪改了 5 個 commit 都沒中，pixelRatio 一行 fallback 中。**對抗式審查必須質疑核心假設**而非只 fix 表層 bug（Codex 第一輪 §6.7 確認語氣可被誤導；第二輪 prompt 顯式要求「預設立場：修法有缺陷」才挖到真根因）。
3. **DIAG 面板放錯位置浪費三輪**：DIAG 包在 `{cardData && ...}` 條件分支內，cardData null 時 DIAG 整個不 mount。觀測性元素應放最外層、條件最寬。

## 其他次要修補（對齊 §6.7 第一輪審查）

- `useEffect` deps **不可放 `user`**：auth rehydrate 時整套 export 重跑，後者覆蓋前者預熱結果。改成等 `authLoading=false` 才產圖，user 在那時已 resolved。
- `canShare` 偵測必須用**真實 cardFile** 而非 mount 時用空 probe File 探測——後者可能 false negative 把按鈕永久 hide。
- `setCopySuccess` timer 須 unmount cleanup。

## Vercel 部署層意外發現（非程式碼根因，但 block 驗證）

兩個 deployment 層 issue 各浪費一輪驗證循環，必須記入避免下次再撞：

1. **Vercel Deployment Protection** 對 Hobby plan 預設開啟 Standard Protection——preview deployment 需 Vercel SSO 才能訪問。使用者沒登入 SSO → Vercel 自動 fallback redirect 回 production URL。表面看「進不去 preview」實則「永遠在 prod」。**Debug session 第一步永遠驗 `curl preview-url` 回的是真網站 HTML 還是 Vercel auth 頁**。
2. **Supabase OAuth Redirect URLs allowlist** 沒含 preview URL → OAuth callback 後 Supabase 把人 fallback 到 Site URL（主站）。修法 = 加 `https://*.vercel.app/auth/callback` wildcard 一勞永逸。

## 本專案對應

- 修改：`src/lib/cardImageExport.ts`（`createCardImageFile` 加 pixelRatio fallback；`preloadImagesAsDataUrls` 改 fetch+FileReader）
- 修改：`src/app/share/[id]/ShareCardClient.tsx`（背景預產 File + 「儲存到相簿」按鈕 + auth dep 修正 + canShare 真實 file 偵測 + timer cleanup）
- PR：https://github.com/sleepeeee/overwatch-social/pull/22

## 來源

- 使用者實機觀察「第一秒在、讀取後消失」（2026-06-13 session）
- Codex 對抗式審查 Q5 + Q1（推翻 race-only 假設）
- 實機驗證：pixelRatio 退 1 → 霧子立繪恢復正常
