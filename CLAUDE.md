# OW Social - 鬥陣特工交友平台

## 專案總覽
鬥陣特工（Overwatch 2）主題的玩家個人名片 / 交友平台，未來擴展為多遊戲社群大廳。
玩家可建立含英雄、段位、角色偏好的個人名片，並在廣場上瀏覽、認識其他玩家。
- 生產網址：https://overwatch-social.vercel.app
- Supabase Project ID：`cxoncanfveqtfofcqyqe`

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
├── page.tsx                      # 首頁（含登入/登出按鈕、user state）
├── layout.tsx                    # 全域 Layout（FloatingDock + DevModeBanner）
├── browse/page.tsx               # 名片交友廣場（呼叫各 Square 子元件）
├── profile/page.tsx              # 個人名片設定（LoginModal overlay 守門）
├── developer/
│   ├── page.tsx                  # 開發者後台（server-side developer role 守門）
│   ├── DeveloperConsoleClient.tsx # 後台 UI（白名單管理、系統統計）
│   └── adjuster/                 # 英雄立繪對準儀（developer-only）
│       ├── page.tsx
│       └── AdjusterClientPage.tsx
├── auth/
│   ├── callback/route.ts         # Google OAuth callback（PKCE code exchange）
│   └── error/page.tsx            # OAuth 失敗錯誤頁
└── actions/
    ├── profile.ts                # getMyProfile / saveProfile（含伺服器端輸入驗證）
    ├── developer.ts              # 開發者 actions（白名單管理、系統統計）
    ├── alignment.ts              # getHeroAlignments（DB 讀 + 靜態 fallback）
    └── saveAlignment.ts          # saveHeroAlignments（Supabase upsert）

src/components/
├── LoginModal.tsx                # 通用登入彈窗（closable/title/description props）
├── DevModeBanner.tsx             # 開發者模式橫幅（app_metadata.role=developer）
├── OWCard.tsx                    # 名片元件（隱私遮蔽、onLoginRequired callback）
├── HeroCardBackground.tsx        # 英雄卡背景主題
├── InteractiveAvatar.tsx         # 互動頭像元件
├── square/                       # 遊戲廣場子元件（Shadowmaster6g 開發）
│   ├── OverwatchSquare.tsx       # 鬥陣特工廣場（含 is_tag_visible DB 過濾）
│   ├── LoLSquare.tsx             # 英雄聯盟廣場
│   └── ValorantSquare.tsx        # 特戰英豪廣場
├── morning-sketch/               # 朝陽全息視覺元件群（Shadowmaster6g 開發）
│   ├── FloatingDock.tsx          # 全局懸浮導覽
│   ├── AppSidebar.tsx            # 側邊欄（含 signOut，未掛載）
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
└── server.ts                     # createServerClient + cookies()（Server）

src/middleware.ts                  # Session token 刷新（不做 route protection）
src/types/card.ts                  # OWPlayerCard TypeScript 型別
supabase/migrations/
├── 001_profiles.sql               # profiles 表 + RLS + public_profiles view
├── 002_developer_whitelist.sql    # developer_whitelist 表 + 自動角色 Trigger
└── 003_hero_alignments.sql        # hero_alignments 表 + RLS + 51 筆 seed
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
- /developer、/developer/adjuster：Server Component redirect("/")
- /profile：Client Component LoginModal overlay（authLoading guard）
- OWCard 互動：onLoginRequired callback → 父層開啟 LoginModal
- Server Actions：各自含 auth check（ensureDeveloper() / getClaims()）

## 資料庫結構

### profiles 表
用戶名片（battle_tag、英雄、標籤等）。RLS：本人讀寫。
public_profiles view：公開可查，DB 層已過濾 is_tag_visible=false 的資料。

### developer_whitelist 表
開發者 email 白名單。Trigger on_auth_user_role_sync：登入時自動同步 app_metadata.role=developer。

### hero_alignments 表
英雄立繪對準參數（scale/translate_x/translate_y）。公開讀；developer 可寫。

## 重要設計決策（ADR）
- ADR-01：DB view 隱私遮蔽（vs 前端）
- ADR-02：app_metadata developer 角色（vs env 白名單）
- ADR-03：LoginModal 共用元件
- ADR-04：hero_alignments DB read + static fallback
- ADR-05：TopBar 統一 Client Component（auth-topbar-unification）→ .rsx/decisions/ADR-02
- ADR-06：AuthContext at layout + useAuth hook（auth-context-refactor）→ .rsx/decisions/ADR-03

## 已知 Dead Code（程式碼正確但未掛載）
- src/components/Navbar.tsx：有完整登入/登出，未掛載
- src/components/morning-sketch/AppSidebar.tsx：有 signOut，未掛載

## 下一步開發計畫
1. 完成 串接 Supabase
2. 完成 Google OAuth 登入
3. 完成 登入/登出 UX（LoginModal、profile overlay）
4. 完成 開發者身分組 + 後台
5. 完成 英雄對準儀改存 Supabase DB
6. 完成 多遊戲廣場架構（OverwatchSquare / LoLSquare / ValorantSquare）
7. 待做 玩家詳細頁面：/player/[id] 查看完整資料
8. 待做 搜尋後端化：搜尋邏輯移至 Supabase query
9. 待做 名片收藏 / Favorites
10. 待做 多遊戲廣場資料接入：LoL / Valorant 接真實後端

## 協作規範
- Commit message 中文，動詞開頭（新增、修正、重構、更新）
- 主要開發 main branch，功能分支用 feature/功能名稱
- 溝通語言：繁體中文
<!-- rsx:awareness:begin v=0.10.0 -->

## rsx 工作流程規範

詳見 rsx skill 的 sop/RSX_SOP.md：
- ~/.claude/skills/rsx/sop/RSX_SOP.md（Claude Code）
- ~/.codex/skills/rsx/sop/RSX_SOP.md（Codex）
- ~/.gemini/skills/rsx/sop/RSX_SOP.md（Gemini）

新對話載入順序：1. 本檔 → 2. .rsx/notes/latest.md → 3. RSX_SOP.md §0-§6

## rsx 知識點
- REF 知識點放 .rsx/knowledge/，schema 見 .rsx/_STANDARDS.md
- ADR 放 .rsx/decisions/，Finding 放 .rsx/findings/

## rsx 工作流程
| 階段 | 入口 |
|---|---|
| init | /rsx:init（已完成）|
| explore | /rsx:explore |
| propose | /rsx:propose |
| apply | /rsx:apply |
| archive | /rsx:archive |
<!-- rsx:awareness:end -->
