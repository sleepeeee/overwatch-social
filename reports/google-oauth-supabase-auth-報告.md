# 歸檔報告：google-oauth-supabase-auth

> 封存日期：2026-06-01 | Change 路徑：`openspec/changes/archive/2026-05-31-google-oauth-supabase-auth/`

---

## 30 秒速覽

**做了什麼**：將 OW Social 從「localStorage 假資料」升級為「Supabase 真實資料庫 + Google OAuth 登入」。

**最重要的一個決定**：廣場（/browse）的名片遮蔽從「前端 JS 遮蔽」改為「PostgreSQL view 層遮蔽」。這個改動堵住了 anon key 直接查 profiles 表繞過前端遮蔽的安全漏洞（Codex 在 §6.5 審查中發現，三輪才通過）。

**現在使用者體驗**：右上角「Google 登入」→ 選 Google 帳號 → 回到「個人名片設定」→ 可儲存名片到雲端。

**下一步**：Vercel 部署（已有 plan）、production 禁用 mock fallback。

---

## 完整版

### A. 動機

OWPlayerCard TypeScript 型別已穩定、三個消費點（profile/browse/OWCard）一致，現在是定資料庫 schema 的最佳時機。延後會讓每個新功能都對 schema 有假設，愈來愈難改。

### B. 實作項目

| 類別 | 內容 |
|---|---|
| 新增檔案 | supabase/client.ts、server.ts、middleware.ts、auth/callback/route.ts、actions/profile.ts、migrations/001_profiles.sql |
| 修改檔案 | Navbar.tsx（登入/登出）、profile/page.tsx（localStorage→Supabase）、browse/page.tsx（Mock→public_profiles） |
| Supabase 設定 | profiles 表 + 3 條 RLS policy + public_profiles view + updated_at trigger |
| Google OAuth | Google Cloud Console OAuth Client + Supabase Google Provider 啟用 |

### C. 關鍵設計決策（ADR-01）

**DB 層隱私遮蔽 via `public_profiles` view**

- 問題：is_tag_visible=false 的遮蔽只在前端做，anon key 直接查資料庫仍能讀到真實 battle_tag 和 social_channels
- 決策：建立 PostgreSQL view，在 DB 層將 is_tag_visible=false 的 battle_tag 替換為 '隱藏#xxxx'，social_channels 完全不在 view 中
- 效果：前端遮蔽只是顯示層，DB view 是真正的安全邊界

### D. Codex 審查歷程

| 時刻 | 評分 | 結果 |
|---|---|---|
| §6.1 why-now | 7/10 | PROCEED（主要為內部排序成熟） |
| §6.5 第 1 輪 | 6/10 | FAIL（Critical：public SELECT 隱私洞） |
| §6.5 第 2 輪 | 6/10 | FAIL（design.md 未更新，與 spec 衝突） |
| §6.5 第 3 輪 | 8/10 | PASS（artifacts 全對齊，Critical 確認關閉） |
| §6.7 APPLY | 8/10 | PASS（open redirect 充分，getClaims 正確） |

### E. 踩坑記錄

1. **Blizzard CDN 防盜鏈**：本地開發圖片正常，部署後 Referer 不是暴雪域名會 403。解法：加 `referrerPolicy="no-referrer"`（朋友的 PR 後來換成 CloudFront CDN，問題消失）
2. **SQL Editor 貼上問題**：Supabase SQL Editor 的 CodeMirror 無法用 clipboard API，最後用 computer.type 逐字輸入解決
3. **tasks.md 未勾選**：實作完成後忘記更新 tasks.md，archive 前需補勾

### F. 遺留後續建議

1. **production mock fallback 禁用**：browse 頁在 Supabase 空資料/error 時不應 fallback 到假資料，建議加 `NODE_ENV !== 'development'` guard
2. **public_profiles view security_invoker**：確認 view 是否需要 `security_invoker = true` 確保 RLS 生效
3. **open redirect 自動化測試**：補充 `%2f%2fevil.com`、`javascript:` 等測試案例

### G. 封存驗證

- [x] `openspec/changes/archive/2026-05-31-google-oauth-supabase-auth/` 已建立
- [x] `openspec/specs/auth/spec.md` + `openspec/specs/profiles/spec.md` 已套用 delta
- [x] `.rsx/findings/F-001-profiles-public-select-critical-fix.md` 已建立
- [x] `.rsx/decisions/ADR-01-db-layer-privacy-masking-via-view.md` 已建立
- [x] crossref 雙向對稱 PASS
- [x] git commit + push 完成
