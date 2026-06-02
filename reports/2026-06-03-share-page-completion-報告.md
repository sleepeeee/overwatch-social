# 歸檔報告：share-page-completion

**歸檔日期**：2026-06-03  
**Change**：`openspec/changes/archive/2026-06-02-share-page-completion/`

---

## 30 秒速覽

| 項目 | 內容 |
|---|---|
| **解決了什麼** | 朋友 Shadowmaster6g 加入的名片分享功能只有 UI，但分享連結無社群預覽卡（mock 資料、無 og meta）|
| **核心修改** | share 頁改為 Server Component + generateMetadata + 真實 Supabase 資料；layout.tsx 補全站 og meta；player/[id] 加 og:image 和分享按鈕 |
| **重要設計** | og:image 使用 `?? ""` 防禦（env var 未設時省略，不產生 `undefined/images/...` 壞連結）|
| **待辦** | 部署後用 `curl https://overwatch-social.vercel.app/share/{id}` 確認 og:image 含 domain；確認 Vercel `NEXT_PUBLIC_SITE_URL` 已設定 |

---

## 完整版

### A. 問題背景

朋友的 `visual/browse-dual-style-lab` 分支 merge 了分享功能 UI，但 `/share/[id]/page.tsx` 是 Client Component，用 mock 資料。分享到 Discord/LINE 不顯示預覽卡，而且沒有分享入口按鈕。

### B. 架構決策（ADR-07）

**Server Component 包 Client Component**：
- `page.tsx`：Server Component，`generateMetadata` 取玩家名片資料生成 og:title/description/image
- `ShareCardClient.tsx`：Client Component，承接 html-to-image 導出（需要 DOM 操作）
- 衝突解決：generateMetadata 只能在 Server 端，html-to-image 只能在 Client 端，拆分解決

### C. og:image 設計（F-007）

og:image 必須是絕對 URL（含 domain），相對路徑在社群平台 crawler 無效。設計：
- 生產環境（Vercel）：`${NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/{heroId}.png`
- env var 未設時：省略 og:image（不設為空字串或 undefined 前綴的壞連結）
- 現有 51 張英雄頭像作為 og:image 素材（無需額外 CDN）

### D. getPublicProfile

新增 `getPublicProfile(userId)` Server Action，查 `public_profiles` view（anon 可讀）。`social_channels = {}` 是正確設計——view 本身不含此欄（ADR-08/F-005/migration 008 已確立）。

### E. §6.5/§6.7 決策

- §6.5：Codex 3 輪均 6/10（不可解：production og 驗收需要部署），Gemini 7/10 PASS → §6.3 Option C
- §6.7：Codex 8/10 + Gemini 7/10，兩方 PASS

### F. 待辦（使用者需確認）

1. **Vercel env var**：確認 `NEXT_PUBLIC_SITE_URL=https://overwatch-social.vercel.app` 已設定
2. **部署後驗證**：`curl https://overwatch-social.vercel.app/share/{userId}` 確認 `<meta property="og:image" content="https://..."/>` 含完整 domain
