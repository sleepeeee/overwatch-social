# Tasks — adopt-supabase-generated-types

> PROPOSE 階段只產 artifacts；以下任務於 APPLY 階段（team lead 主導）執行。
> 順序刻意：先生成型別 → 注入泛型（解鎖型別）→ 觀察 tsc 浮現的錯誤 → 逐檔收斂 → 驗收。

## 0. 前置（環境校準，APPLY 第一步）

- [ ] 0.1 確認分支為 `feature/backend-generated-types`，working tree 乾淨
- [ ] 0.2 跑 baseline `npm run build`，記錄當前 0 errors（確立「行為不變」基準）

## 1. 生成 DB schema 型別（team lead，需 Supabase MCP）

- [ ] 1.1 跑 `mcp__supabase__generate_typescript_types`（project `cxoncanfveqtfofcqyqe`），輸出存 `src/types/database.ts`
- [ ] 1.2 確認生成型別含 Tables（profiles / user_profiles / developer_whitelist / announcements / game_special_tags / hero_alignments）、Views（public_profiles）、Functions（get_hero_stats）
- [ ] 1.3 核對 `public_profiles.social_channels` 為 `Json`（反映 C1 遮罩 view）；記錄與 repo migration 015/017 的 drift（已知、非本 change 修）

## 2. 注入 Database 泛型（解鎖全域型別）

- [ ] 2.1 `src/lib/supabase/server.ts`：`createServerClient<Database>(...)`，import `Database`
- [ ] 2.2 `src/lib/supabase/client.ts`：`createBrowserClient<Database>(...)`，import `Database`
- [ ] 2.3 跑 `npx tsc --noEmit`，**記錄所有新浮現的 tsc error**（這是注入泛型暴露的潛在問題清單）

## 3. 核心 row→domain 轉換改寫

- [ ] 3.1 `browse.ts`：`rowToCard()` 參數型別改 `Database['public']['Views']['public_profiles']['Row']`；移除純量欄位的 `as`；`mic_status` narrowing 保留；social_channels 走 helper（見 4.1）
- [ ] 3.2 `profile.ts` `getMyProfile`（base table）：移除可移除的 `as`；`mic_status` / display_name narrowing 視情況保留
- [ ] 3.3 `profile.ts` `getPublicProfile`（view）：移除可移除的 `as`；social_channels 維持 `{}`（不讀 view 遮罩值）
- [ ] 3.4 `profile.ts` `getMyDisplayName`：移除 `as string | null`（投影 `display_name` 已帶型別）
- [ ] 3.5 `developer.ts` `getAllProfilesForDeveloper`（投影 select）：確認 select 欄位齊全後移除 map 內 `as`
- [ ] 3.6 `developer.ts` `getHeroStats`：若 `Functions.get_hero_stats.Returns` 型別完整則移除 RPC `as`，否則保留並註明

## 4. social_channels 收斂 helper（REF-025 / design 決策 3）

- [ ] 4.1 新增 `coerceSocialChannels(raw: Json | null | undefined): OWPlayerCard['social_channels']` helper（單點收斂）
- [ ] 4.2 `browse.ts` rowToCard + `OverwatchSquare.tsx:58` 改用 helper（取代 `as Record<string,string>`）
- [ ] 4.3 `player/[id]/page.tsx:65`（base table 真帳號）：保留字串斷言或走 helper，確認語意正確
- [ ] 4.4 **smoke 驗證**：廣場名片社群圖示（Discord/Threads/RC/game_voice）仍正確顯示；公開 view 不洩漏真實帳號

## 5. 魔術字串集中化（REF-026 方案 A）

- [ ] 5.1 新增 `PLACEHOLDER_BATTLE_TAG = "愛喝奶茶#3342"` 常數（`src/lib/constants.ts` 或 card.ts 旁）
- [ ] 5.2 `developer.ts:191` 改用 `.neq("battle_tag", PLACEHOLDER_BATTLE_TAG)`
- [ ] 5.3 確認 getSystemStats 的 completedProfiles 數值不變（行為不變驗收）

## 6. 周邊檔案（視 tsc 浮現需要，最小改動）

- [ ] 6.1 `userProfile.ts`：`getMyUserProfile` 的 `data as UserProfileRow`、`getAdminUserList` 的 row 斷言視情況收斂
- [ ] 6.2 `homepage.ts` `getAnnouncements`：6 個 `as` 視 announcements Row 型別收斂（alignments 仍需 `as Partial<AlignmentConfig>`，因 jsonb 為 Json）
- [ ] 6.3 `alignment.ts`：`translate_x/y as number` 視 hero_alignments Row 型別收斂
- [ ] 6.4 `tags.ts`：確認注入泛型後 `.select(投影)` 無新錯誤（本檔本無 row 斷言問題，多為 query builder）

## 7. 驗收（Stage 7 + Codex §6.7）

- [ ] 7.1 `npm run build`：0 TypeScript errors，全頁 static generation 通過
- [ ] 7.2 grep 確認目標檔（browse/profile/developer）row 轉換處無殘留不必要 `as string`/`as boolean`/`as string[]`
- [ ] 7.3 既有行為驗證：廣場瀏覽 + 搜尋 + Load More；名片讀取/儲存；後台統計（totalUsers/totalProfiles/completedProfiles）
- [ ] 7.4 若有 e2e（`npm run test:e2e`）/ unit（`npm run test:unit`）則通過
- [ ] 7.5 MANDATORY §6.7 Codex review（APPLY 完成後，team lead 並行發起）

## 8. rsx 記錄（ARCHIVE 前）

- [ ] 8.1 視需要建 ADR（生成型別 + domain 型別邊界決策）/ Finding（若 tsc 浮現真 bug）
- [ ] 8.2 REF-024/025/026 crossref 回填（referenced_by 補本 change 的 ADR/Finding）
- [ ] 8.3 更新 `.rsx/notes/latest.md`（Zone A + Zone B）

---

## 驗收標準（總覽）

| 標準 | 驗證方式 |
|---|---|
| `npm run build` 0 errors | Task 7.1 |
| 目標檔 row 轉換無殘留不必要 as | Task 7.2 grep |
| getSystemStats 魔術字串集中化 + 數值不變 | Task 5.3 |
| 既有行為不變（廣場/名片/後台）| Task 7.3 + 4.4 smoke |
| social_channels 不洩漏真帳號 | Task 4.4 |
