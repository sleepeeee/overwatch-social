# Tasks: browse-quality-fixes

## Task 1 — 改寫 ValorantSquare.tsx

**驗收條件**：無假玩家卡片，顯示「敬請期待」畫面

- [ ] 移除 MOCK_VAL_PLAYERS 陣列
- [ ] 移除假玩家卡片 .map() 渲染
- [ ] 新增 coming-soon UI（icon + 標題 + 說明 + Clock badge）
- [ ] 保留 "use client" + 必要 import

---

## Task 2 — 改寫 LoLSquare.tsx

**驗收條件**：同 Task 1（LoL 版本）

- [ ] 移除 MOCK_LOL_PLAYERS 陣列
- [ ] 移除假玩家卡片 .map() 渲染
- [ ] 新增 coming-soon UI（Crown icon）
- [ ] 保留 "use client" + 必要 import

---

## Task 3 — 刪除 Dead Code

**驗收條件**：兩個文件從 repo 移除，CLAUDE.md 更新

- [ ] `rm src/components/Navbar.tsx`
- [ ] `rm src/components/morning-sketch/AppSidebar.tsx`
- [ ] 更新 CLAUDE.md「已知 Dead Code」段落，移除這兩條記錄

---

## Task 4 — OverwatchSquare.tsx 加 mock 提示條

**驗收條件**：空資料時顯示橘黃提示條，真實資料時隱藏

- [ ] 加入 `isShowingMockData` useState（預設 false）
- [ ] `loadPlayers()` 真實資料分支：`setIsShowingMockData(false)`
- [ ] `loadPlayers()` fallback 分支：`setIsShowingMockData(true)`
- [ ] 在篩選 ribbon 上方加入提示條 JSX（條件顯示）

---

## Task 5 — 重構 useDevMode.ts

**驗收條件**：移除獨立 onAuthStateChange，改用 useAuth()

- [ ] `import { useAuth } from "@/context/AuthContext"`
- [ ] 移除 `useState<DevModeState>` 和整個 `useEffect`（含 subscription cleanup）
- [ ] 移除 `createClient` import（若不再使用）
- [ ] 新的函數體：isDev 分支 + useAuth() 讀取 user

---

## Task 6 — Build 驗證 + 推送

- [ ] `npm run build` 無 TypeScript 錯誤
- [ ] 開啟 /browse 確認 VAL/LoL tab 顯示 coming-soon
- [ ] 確認 OW 廣場有真實資料時不顯示橘黃條（測試名片已在 DB）
- [ ] `git commit && git push`
