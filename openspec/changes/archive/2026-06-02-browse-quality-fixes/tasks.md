# Tasks: browse-quality-fixes

## Task 1 — 刪除 Dead Code

**驗收條件**：兩個文件從 repo 移除，CLAUDE.md 更新

- [x] `rm src/components/Navbar.tsx`
- [x] `rm src/components/morning-sketch/AppSidebar.tsx`
- [x] 更新 CLAUDE.md「已知 Dead Code」段落，移除這兩條記錄

---

## Task 2 — OverwatchSquare.tsx 加 mock 提示條

**驗收條件**：空資料時顯示橘黃提示條，真實資料時隱藏

- [x] 加入 `isShowingMockData` useState（預設 false）
- [x] `loadPlayers()` 真實資料分支：`setIsShowingMockData(false)`
- [x] `loadPlayers()` fallback 分支：`setIsShowingMockData(true)`
- [x] 在篩選 ribbon 上方加入提示條 JSX（條件顯示）

---

## Task 3 — 重構 useDevMode.ts

**驗收條件**：移除獨立 onAuthStateChange，改用 useAuth()

- [x] `import { useAuth } from "@/context/AuthContext"`
- [x] 移除 `useState<DevModeState>` 和整個 `useEffect`（含 subscription cleanup）
- [x] 移除 `createClient` import（若不再使用）
- [x] 新的函數體：isDev 分支 + useAuth() 讀取 user

---

## Task 4 — Build 驗證 + 推送

- [x] `npm run build` 無 TypeScript 錯誤
- [x] 開啟 /browse 確認 VAL/LoL tab 顯示 coming-soon
- [x] 確認 OW 廣場有真實資料時不顯示橘黃條（測試名片已在 DB）
- [x] `git commit && git push`
