# OW Social - 鬥陣特工交友平台

## 專案總覽
鬥陣特工主題的玩家個人資料 / 交友平台。
玩家可以建立含英雄、段位、角色偏好的個人檔案，並瀏覽、認識其他玩家。

## 環境啟動
```bash
cd "D:/Overwatch專案/overwatch-social"
npm run dev      # 開發伺服器，訪問 http://localhost:3000
npm run build    # 正式打包
```

## 技術棧
- **框架**：Next.js 16 (App Router) + TypeScript
- **樣式**：Tailwind CSS v4 + shadcn/ui
- **後端**：Supabase（Auth + PostgreSQL）已串接，Project ID：`cxoncanfveqtfofcqyqe`
- **部署**：Vercel ✅ 已部署 → https://overwatch-social.vercel.app
- **認證**：Google OAuth（透過 Supabase Auth）

## 目前程式碼結構
```
src/app/
├── page.tsx                  # 首頁（Landing page）
├── browse/page.tsx           # 名片交友廣場（讀 Supabase public_profiles view）
├── profile/page.tsx          # 個人名片設定（登入後讀寫 Supabase）
├── layout.tsx                # 全域 Layout（含 FloatingDock）
├── auth/
│   ├── callback/route.ts     # Google OAuth callback（含 open redirect 防護）
│   └── error/page.tsx        # OAuth 失敗錯誤頁
└── actions/profile.ts        # Server Actions：getMyProfile / saveProfile

src/components/
├── Navbar.tsx                # 導覽列（含 Google 登入/登出）
├── OWCard.tsx                # 名片元件（手帳風，含隱私遮蔽）
├── morning-sketch/           # 朝陽全息視覺元件群（Shadowmaster6g 開發）
│   ├── FloatingDock.tsx      # 全局懸浮導覽
│   ├── AppSidebar.tsx        # 側邊欄
│   ├── FeaturedArtists.tsx   # 精選特工展示
│   ├── MorningSketchBanner.tsx
│   ├── LotusWelcomeWidget.tsx
│   ├── StylePicker.tsx
│   └── FluidClipPath.tsx
└── ui/                       # shadcn/ui 元件

src/lib/supabase/
├── client.ts                 # createBrowserClient（Client Components）
└── server.ts                 # createServerClient + await cookies()（Server）

src/middleware.ts              # Session token 自動刷新
src/types/card.ts             # OWPlayerCard TypeScript 型別
src/data/mockPlayers.ts       # 51 位英雄設定 + Mock 玩家資料（冷啟動 fallback）
```

## 下一步開發計畫
1. ✅ ~~串接 Supabase~~（已完成）
2. ✅ ~~使用者登入（Google OAuth）~~（已完成）
3. **玩家詳細頁面**：點擊名片後進入 `/player/[id]` 頁面查看完整資料
4. **搜尋與篩選後端化**：目前前端篩選已有，但搜尋邏輯全在 client 端，未來可移到 Supabase query
5. **名片收藏 / Favorites**：讓使用者收藏喜歡的玩家名片

## 協作規範
- Commit message 用中文，動詞開頭（新增、修正、更新）
- 主要開發在 main branch，功能分支用 `feature/功能名稱`
- 溝通語言：繁體中文
<!-- rsx:awareness:begin v=0.10.0 -->

## rsx 工作流程規範

詳見 rsx skill 的 `sop/RSX_SOP.md`（任一全域路徑皆可，視當下使用的 AI agent）：

- `~/.claude/skills/rsx/sop/RSX_SOP.md`（Claude Code）
- `~/.codex/skills/rsx/sop/RSX_SOP.md`（Codex）
- `~/.gemini/skills/rsx/sop/RSX_SOP.md`（Gemini）

新對話載入順序：
1. 本檔
2. `.rsx/notes/latest.md`（若有）
3. RSX_SOP.md §0-§6 主幹

## rsx 知識點

- REF 知識點放 `.rsx/knowledge/`，schema 見 `.rsx/_STANDARDS.md`
- ADR 放 `.rsx/decisions/`
- Finding 放 `.rsx/findings/`

## rsx 工作流程

| 階段 | 入口 |
|---|---|
| init | `/rsx:init`（已完成）|
| explore | `/rsx:explore` 或依 RSX_SOP §1 |
| propose | `/rsx:propose`（內部呼叫 `/opsx:propose`）|
| apply | `/rsx:apply`（內部呼叫 `/opsx:apply`）|
| archive | `/rsx:archive`（內部呼叫 `/opsx:archive`）|
<!-- rsx:awareness:end -->
