# OW Social - 鬥陣特工交友平台

## 專案總覽
鬥陣特工（Overwatch 2）主題的玩家個人名片 / 交友平台，未來擴展為多遊戲社群大廳。
玩家可建立含英雄、段位、角色偏好的個人名片，並在廣場上瀏覽、認識其他玩家。
- 生產網址：https://overwatch-social.vercel.app
- Supabase Project ID：`cxoncanfveqtfofcqyqe`

## 統一溝通詞彙表 (Project Glossary)

為了在溝通時更為直覺高效，我們制定了以下統一的代號對照表。在後續的 Prompt 中，您可以直接使用 **AI 溝現代號 (Alias)** 來指稱特定頁面與元件：

### 📌 主要頁面 (Pages)

| 中文名稱 | AI 溝現代號 (Alias) | 實體檔案路徑 | 路由 (Route) | 功能簡述 |
| :--- | :--- | :--- | :--- | :--- |
| **首頁頁面** | `home` | `src/app/page.tsx` | `/` | 登入前的Landing Page、朝陽全息視覺主頁 |
| **鬥陣特攻廣場** | `ow lobby` | `src/app/browse/page.tsx` | `/browse` | 玩家名片交友廣場，讀取公用檔案清單 |
| **個人檔案頁面** | `profile` | `src/app/profile/page.tsx` | `/profile` | 玩家個人名片編輯與特工檔案設定 |
| **玩家詳細頁** | `player detail` | `src/app/player/[id]/page.tsx` | `/player/[id]` | 單一玩家的公開名片詳細頁（未登入可看基本資料） |
| **開發者後台** | `dev console` | `src/app/developer/page.tsx` | `/developer` | 提供給 Admin/開發者的參數管理後台 |
| **標籤管理器** | `tags manager` | `src/app/developer/tags-manager/` | `/developer/tags-manager` | 特色標籤系統管理（developer-only）|
| **首頁調校儀** | `homepage aligner` | `src/app/developer/homepage-aligner/` | `/developer/homepage-aligner` | 首頁公告內容精密調校（developer-only）|
| **認證跳轉頁** | `auth` | `src/app/auth/` | `/auth/*` | Google OAuth 的 Callback 與錯誤處理頁面 |

### 🧩 核心 UI 元件 (Key Components)

| 中文名稱 | AI 溝現代號 (Alias) | 實體檔案路徑 | 功能簡述 |
| :--- | :--- | :--- | :--- |
| **鬥陣特攻卡片** | `ow card` | `src/components/OWCard.tsx` | 手帳風格的玩家名片主元件（含隱私遮蔽） |
| **鬥陣特攻大廳區塊**| `ow square` | `src/components/square/OverwatchSquare.tsx` | 包裹於大廳內、鬥陣特攻專用的名片渲染器 |
| **特工名片背景** | `card bg` | `src/components/HeroCardBackground.tsx` | 用於名片元件內，渲染特定英雄特色背景 |
| **頂部導覽列** | `top bar` | `src/components/TopBar.tsx` | 三頁統一的登入/登出 TopBar（使用 useAuth()）|
| **懸浮導覽列** | `floating dock` | `src/components/morning-sketch/FloatingDock.tsx` | 底部圓潤磨砂玻璃懸浮導覽列（首頁/廣場/個人） |
| **精選特工展示區** | `featured artists` | `src/components/morning-sketch/FeaturedArtists.tsx`| 大廳下方的精選藝術家/特工展示區塊 |
| **互動式頭像** | `interactive avatar` | `src/components/InteractiveAvatar.tsx` | 懸停時會顯示動態效果或狀態的玩家頭像 |
| **風雅樣式選擇器** | `style picker` | `src/components/morning-sketch/StylePicker.tsx` | 調整整體視覺風格、色彩補償的樣式面板 |

## 環境啟動
```bash
cd "D:/Overwatch專案/overwatch-social"
npm run dev      # 開發伺服器 → http://localhost:3000
npm run build    # 正式打包
```

## 技術棧
- **框架**：Next.js 16 (App Router) + TypeScript
- **樣式**：Tailwind CSS v4 + shadcn/ui
- **後端**：Supabase（Auth + PostgreSQL）
- **部署**：Vercel（auto-deploy from main）
- **認證**：Google OAuth（Supabase Auth，PKCE flow）

## 目前程式碼結構

```
src/app/
├── page.tsx                      # 首頁（TopBar + 玩家卡輪播）
├── layout.tsx                    # 全域 Layout（AuthProvider + FloatingDock）
├── browse/page.tsx               # 名片交友廣場（authLoading spinner + Square 子元件）
├── profile/page.tsx              # 個人名片設定（LoginModal overlay 守門）
├── player/[id]/page.tsx          # 玩家詳細頁（Server Component，含 generateMetadata）
├── developer/
│   ├── page.tsx                  # 開發者後台（server-side developer role 守門）
│   ├── DeveloperConsoleClient.tsx # 後台 UI（白名單/統計/用戶管理/英雄流行度）
│   ├── adjuster/                 # 英雄立繪對準儀（developer-only）
│   ├── tags-manager/             # 特色標籤管理（developer-only）
│   └── homepage-aligner/         # 首頁公告調校儀（developer-only）
├── auth/
│   ├── callback/route.ts         # Google OAuth callback（PKCE code exchange）
│   └── error/page.tsx            # OAuth 失敗錯誤頁
└── actions/
    ├── profile.ts                # getMyProfile / saveProfile（getUser() 驗證）
    ├── developer.ts              # 開發者 actions（白名單管理、統計、用戶查詢）
    ├── homepage.ts               # 首頁公告 CRUD（Supabase announcements 表）
    ├── tags.ts                   # 特色標籤管理 actions
    ├── alignment.ts              # getHeroAlignments（DB 讀 + 靜態 fallback）
    └── saveAlignment.ts          # saveHeroAlignments（Supabase upsert）

src/context/
└── AuthContext.tsx                # 全域 AuthContext（getUser + onAuthStateChange 雙軌）

src/components/
├── TopBar.tsx                    # 統一頂部導覽（Google 登入/登出，三頁共用）
├── LoginModal.tsx                # 通用登入彈窗（closable/title/description props）
├── DevModeBanner.tsx             # 開發者模式橫幅（useAuth()，需在 AuthProvider 內）
├── OWCard.tsx                    # 名片元件（隱私遮蔽、onLoginRequired callback）
├── HeroCardBackground.tsx        # 英雄卡背景主題
├── InteractiveAvatar.tsx         # 互動頭像元件
├── square/                       # 遊戲廣場子元件
│   ├── OverwatchSquare.tsx       # 鬥陣特工廣場（server-side ilike 搜尋 + Load More）
│   ├── LoLSquare.tsx             # 英雄聯盟廣場（coming-soon 佔位）
│   └── ValorantSquare.tsx        # 特戰英豪廣場（coming-soon 佔位）
├── morning-sketch/               # 朝陽全息視覺元件群
│   ├── FloatingDock.tsx          # 全局懸浮導覽
│   ├── LotusWelcomeWidget.tsx    # 首頁公告展示元件（從 announcements 表讀取）
│   ├── LuckyAlly.tsx             # 每日幸友翻牌元件
│   ├── FeaturedArtists.tsx       # 精選特工 + 揪團活動展示
│   └── ...其他視覺元件
└── ui/                           # shadcn/ui 元件

src/hooks/
└── useDevMode.ts                 # 讀取 app_metadata.role（UI-only，非安全邊界）

src/data/
├── heroAlignments.ts             # 51 位英雄立繪對準參數（DB 的靜態 fallback）
├── heroBackgrounds.ts            # 英雄卡背景主題設定
└── mockPlayers.ts                # 英雄設定 + Mock 玩家資料（冷啟動 fallback）

src/lib/supabase/
├── client.ts                     # createBrowserClient（Client Components）
├── server.ts                     # createServerClient + cookies()（Server）

src/middleware.ts                  # Session token 刷新（不做 route protection）
src/types/card.ts                  # OWPlayerCard TypeScript 型別
src/types/homepage.ts              # AnnouncementItem / AlignmentConfig 型別
supabase/migrations/
├── 001_profiles.sql               # profiles 表 + RLS + public_profiles view
├── 002_developer_whitelist.sql    # developer_whitelist 表 + 自動角色 Trigger
├── 003_hero_alignments.sql        # hero_alignments 表 + RLS + 51 筆 seed
├── 004_developer_profiles_policy.sql # developer SELECT policy（跨用戶讀 profiles）
├── 005_announcements.sql          # announcements 表 + RLS + 4 筆 seed
├── 005_game_tags.sql              # game_tags 表（特色標籤系統）
├── 006_profiles_grant.sql         # GRANT SELECT/INSERT/UPDATE/DELETE → authenticated
├── 007_public_profiles_social.sql # public_profiles view 更新
└── 008_fix_social_channels_privacy.sql # RLS policy（authenticated 可讀 visible profiles）
```

## 認證與權限系統

### 登入流程
Google OAuth（PKCE）→ `auth/callback/route.ts` code exchange → 導向 `/profile`

### 身分層級
| 角色 | 取得方式 | 可用功能 |
|---|---|---|
| 未登入（anon）| — | 瀏覽廣場（UID 遮蔽）|
| 一般用戶（authenticated）| Google 登入 | 建立名片、複製 UID |
| 開發者（developer）| developer_whitelist Trigger 設 app_metadata.role | 以上 + 後台 + 對準儀 |

### Developer 設定方式
```sql
-- 方法一：加白名單（下次登入自動生效）
INSERT INTO developer_whitelist (email) VALUES ('email@example.com');
-- 方法二：已登入帳號直接設定
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data,'{}') || '{"role":"developer"}'
WHERE email = 'email@example.com';
```

### 守門架構
- /developer、/developer/adjuster、/developer/tags-manager、/developer/homepage-aligner：Server Component redirect("/")
- /profile：Client Component LoginModal overlay（show={!authLoading && !user}）
- OWCard 互動：onLoginRequired callback → 父層開啟 LoginModal
- Server Actions：各自含 auth check（ensureDeveloper() / getUser()）

## 資料庫結構

### profiles 表
用戶名片（battle_tag、英雄、標籤等）。RLS：本人讀寫；developer 可讀全部。
public_profiles view：公開可查（anon/authenticated），不含 social_channels。
social_channels 讀取：需登入，透過 authenticated RLS policy 直接查 profiles 表。

### developer_whitelist 表
開發者 email 白名單。Trigger on_auth_user_role_sync：登入時自動同步 app_metadata.role=developer。

### hero_alignments 表
英雄立繪對準參數（scale/translate_x/translate_y）。公開讀；developer 可寫。

### announcements 表
首頁公告（num、tag、title、color、message、custom_icon_url、alignments）。
公開讀；developer 可寫。LotusWelcomeWidget 讀取，developer/homepage-aligner 管理。

### game_tags 表
特色標籤系統（由 /developer/tags-manager 管理）。

## 重要設計決策（ADR）
- ADR-01：DB view 隱私遮蔽（vs 前端）
- ADR-02：app_metadata developer 角色（vs env 白名單）
- ADR-03：LoginModal 共用元件
- ADR-04：hero_alignments DB read + static fallback
- ADR-05：TopBar 統一 Client Component（auth-topbar-unification）→ .rsx/decisions/ADR-02-topbar-as-shared-client-component
- ADR-06：AuthContext at layout + useAuth hook（auth-context-refactor）→ .rsx/decisions/ADR-03-authcontext-at-layout-with-useauth-hook
- ADR-07：開發者用戶管理使用 on-demand Server Action（developer-console-enhancements）→ .rsx/decisions/ADR-04-developer-user-management-on-demand-server-action
- ADR-08：玩家詳細頁 social_channels 透過 authenticated 直接查 profiles 表（不放入 public view）→ .rsx/decisions/ADR-06-player-detail-social-channels-via-authenticated-direct-query
- ADR-09：AuthContext 同時使用 getUser() + onAuthStateChange（React 19 Strict Mode 修正）→ .rsx/decisions/ADR-07-authcontext-getuser-plus-onauthstatechange-dual-init

## 下一步開發計畫
1. 完成 串接 Supabase
2. 完成 Google OAuth 登入
3. 完成 登入/登出 UX（LoginModal、profile overlay）
4. 完成 開發者身分組 + 後台（含英雄流行度、用戶管理）
5. 完成 英雄對準儀改存 Supabase DB
6. 完成 多遊戲廣場架構（OverwatchSquare / LoLSquare / ValorantSquare）
7. 完成 玩家詳細頁面：/player/[id]（server-side ilike 搜尋 + 詳細頁）
8. 完成 搜尋後端化：OverwatchSquare 改用 Supabase ilike + Load More
9. 待做 名片收藏 / Favorites
10. 待做 多遊戲廣場資料接入：LoL / Valorant 接真實後端

## 協作規範
- Commit message 中文，動詞開頭（新增、修正、重構、更新）
- 主要開發在 main branch，功能分支用 `feature/功能名稱`
- 溝通語言：繁體中文

<!-- rsx:awareness:begin v=0.10.0 -->

## rsx 工作流程規範

詳見 rsx skill 的 `sop/RSX_SOP.md`（任一全域路徑皆可，視當下使用的 AI agent）：

- `~/.claude/skills/rsx/sop/RSX_SOP.md`（Claude Code）
- `~/.codex/skills/rsx/sop/RSX_SOP.md` (Codex)
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
