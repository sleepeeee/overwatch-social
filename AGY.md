# AGY.md — overwatch-social 專案特定指令

> 本文件為專案層級記憶，補充全域 AGY.md 未涵蓋的專案特定細節。

---

## 專案基本資訊

| 項目 | 內容 |
|---|---|
| 框架 | Next.js 15 (App Router) |
| 語言 | TypeScript |
| 資料庫 | Supabase (PostgreSQL + RLS) |
| 樣式 | Tailwind CSS |
| 部署 | Vercel |
| 主分支 | `feature/web-overhaul` |
| Remote | `https://github.com/Shadowmaster6g/overwatch-social.git` |

---

## 工作流程規則

### OpenSpec Archive 後自動推送

**規則**：每次執行 `/openspec-archive-change` 完成封存後，**必須立即執行 `git push`** 將變更推送至 remote，讓朋友（Shadowmaster6g）能同步取得最新內容。

```powershell
git push
```

> **Why**：專案為多人協作，封存後的 openspec 歸檔與 spec 同步需即時反映在 GitHub 上。

---

## 標準品質檢查流程

```powershell
# 提交前必跑
npx tsc --noEmit                         # TypeScript 型別檢查
npx eslint src/app/developer/...         # 只針對修改過的檔案執行 ESLint
```

> **注意**：`src_backup_default/` 已在 `eslint.config.mjs` 中排除，勿移除該設定。

---

## 關鍵檔案路徑

| 用途 | 路徑 |
|---|---|
| 公告資料 | `src/data/announcements.json` |
| 首頁調校 Server Actions | `src/app/actions/homepage.ts` |
| 開發者後台 Client | `src/app/developer/DeveloperConsoleClient.tsx` |
| 首頁公告 Widget | `src/components/morning-sketch/LotusWelcomeWidget.tsx` |
| 上傳圖標目錄 | `public/uploads/icons/` |

---

## 開發環境注意事項

- `NODE_ENV=development` 時，開發者後台會 bypass Supabase 角色驗證（方便本機開發）
- Dev server 啟動：`npm run dev`（已設定 `-H 127.0.0.1` 綁定本機）
- Hugging Face 模型快取：`D:\huggingface_cache`（非此專案使用）
