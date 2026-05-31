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
- **框架**：Next.js 15 (App Router) + TypeScript
- **樣式**：Tailwind CSS v4 + shadcn/ui
- **預計後端**：Supabase（尚未串接，目前用靜態假資料）
- **部署**：Vercel（尚未設定）

## 目前頁面結構
```
src/app/
├── page.tsx          # 首頁（Landing page）
├── browse/page.tsx   # 瀏覽玩家列表
├── profile/page.tsx  # 建立/編輯個人檔案
└── layout.tsx        # 全域 Layout（含 Navbar）

src/components/
├── Navbar.tsx        # 導覽列
└── ui/               # shadcn/ui 元件
```

## 下一步開發計畫
1. **串接 Supabase**：建立 users 資料表，實作真實的儲存/讀取
2. **使用者登入**：加入 Supabase Auth（Email / Google 登入）
3. **玩家詳細頁面**：點擊卡片後進入 `/player/[id]` 頁面
4. **搜尋與篩選**：讓 browse 頁的搜尋和角色篩選真正運作

## 協作規範
- Commit message 用中文，動詞開頭（新增、修正、更新）
- 主要開發在 main branch，功能分支用 `feature/功能名稱`
- 溝通語言：繁體中文
