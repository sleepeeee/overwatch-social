# Tasks: developer-console-enhancements

## Task 1 — DB Migration 004

**驗收條件**：developer SELECT policy 存在，一般用戶仍只能讀自己

步驟：
- [ ] 建立 `supabase/migrations/004_developer_profiles_policy.sql`
- [ ] 內容：`CREATE POLICY "profiles select developer" ON profiles FOR SELECT TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer' OR (SELECT auth.uid()) = user_id)`
- [ ] Smoke test：確認現有 `getSystemStats()` 和 `getMyProfile()` 仍正常（不破壞）

---

## Task 2 — Server Actions

**驗收條件**：兩個新 action 可正確呼叫，developer 守門正常

步驟：
- [ ] 在 `src/app/actions/developer.ts` 新增 `getAllProfilesForDeveloper()`
  - 使用 `ensureDeveloper()` 守門
  - SELECT `user_id, battle_tag, is_tag_visible, selected_heroes, updated_at`（不含 social_channels）
  - `.range(0, 99)`（最多 100 筆）
  - 回傳 `{ success: boolean, data?: ProfileRow[], error?: string }`
- [ ] 在 `src/app/actions/developer.ts` 新增 `getHeroStats(profiles)`
  - 純函數：接收 ProfileRow[] → 展平 selected_heroes → 計數 → 排序 → 回傳 Top 5
  - 或在 `page.tsx` Server Component 中 inline 聚合（視複雜度決定）

---

## Task 3 — 更新 developer/page.tsx

**驗收條件**：heroStats 輕量查詢，不傳 allProfiles 作為 props

步驟：
- [ ] 呼叫 `getHeroStats()` 取得 heroStats（只查 selected_heroes 欄位）
- [ ] 將 `heroStats` 傳給 `DeveloperConsoleClient`
- [ ] **不傳 allProfiles**（users tab on-demand，從 client 呼叫）
- [ ] 若 getHeroStats 失敗，傳空陣列（graceful degradation）

---

## Task 4 — 更新 DeveloperConsoleClient.tsx

**驗收條件**：Overview 顯示 heroStats，新 users tab on-demand 載入正常

步驟：
- [ ] 更新 `DeveloperConsoleClientProps` interface：加入 `heroStats?`（移除 allProfiles）
- [ ] `activeTab` 型別加入 `"users"` 選項
- [ ] 加入 users tab 的 on-demand state：`usersData`, `usersLoading`, `usersError`
- [ ] 左側 Sidebar 加入「用戶管理 (Users)」按鈕（Users icon）
- [ ] tab click handler：點擊 users tab 時呼叫 `getAllProfilesForDeveloper()` server action
- [ ] Overview tab 末尾加入「英雄流行度 Top 5」區塊（排名 + heroId + 選用次數）
- [ ] 新增 Tab 4 UI（users tab）：
  - 載入中 spinner
  - 搜尋框（client-side filter by battle_tag）
  - 表格：BattleTag、英雄數、可見性（✓/✗）、更新時間
  - 空狀態處理（無 profiles 時的提示）
  - 確認 selected_heroes null safety（`(p.selected_heroes ?? []).length`）

---

## Task 5 — Build 驗證

**驗收條件**：`npm run build` 無 TypeScript 錯誤

步驟：
- [ ] `npm run build` 通過
- [ ] TypeScript strict 無錯誤
- [ ] 確認 migration 004 SQL 語法正確（可 dry-run 或人工審閱）
