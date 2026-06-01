# OW Social — 鬥陣特工交友平台

> **正式版** → https://overwatch-social.vercel.app

鬥陣特工（Overwatch 2）主題的玩家個人名片與交友平台。建立你的特工名片，展示本命英雄、段位與聯絡方式，在廣場上找到心態成熟的靈魂拍檔。

## 功能

- 🎮 **個人名片**：選英雄（最多 3 位）、設定段位、標籤、留言、MBTI、通訊管道
- 🌸 **交友廣場**：瀏覽全部公開名片，依伺服器/定位/語音過濾
- 🔑 **Google 登入**：一鍵登入，登入後才可複製 UID 或儲存名片
- 🛡️ **隱私保護**：可設定隱藏 BattleTag，廣場顯示遮蔽版本

## 快速開始

```bash
# 安裝依賴
npm install

# 開發伺服器
npm run dev
# → http://localhost:3000

# 正式打包
npm run build
```

### 環境變數（.env.local）
```env
NEXT_PUBLIC_SUPABASE_URL=https://cxoncanfveqtfofcqyqe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 技術棧

| 項目 | 技術 |
|---|---|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 樣式 | Tailwind CSS v4 + shadcn/ui |
| 後端 | Supabase（PostgreSQL + Auth + RLS）|
| 認證 | Google OAuth（PKCE flow）|
| 部署 | Vercel |

## 專案結構

```
src/
├── app/           # Next.js App Router 頁面與 Server Actions
├── components/    # UI 元件（OWCard、LoginModal、DevModeBanner 等）
├── hooks/         # useDevMode（developer role 判斷）
├── data/          # 英雄設定、對準參數（靜態 fallback）
├── types/         # TypeScript 型別定義
└── lib/supabase/  # Supabase client/server 初始化

supabase/migrations/
├── 001_profiles.sql           # 名片資料表 + RLS
├── 002_developer_whitelist.sql # 開發者白名單 + 自動 Trigger
└── 003_hero_alignments.sql    # 英雄立繪對準參數表
```

## 開發者身分

特定 email 可取得開發者身分，存取後台與立繪對準儀：

```sql
INSERT INTO developer_whitelist (email) VALUES ('your@email.com');
```

## 協作

- Commit message 中文，動詞開頭
- 主要開發在 `main`，功能用 `feature/功能名稱`
- 技術問題用繁體中文討論
