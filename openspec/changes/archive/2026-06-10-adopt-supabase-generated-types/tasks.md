# Tasks — adopt-supabase-generated-types

> PROPOSE 階段只產 artifacts；以下任務於 APPLY 階段（team lead 主導）執行。
> 順序刻意：先生成型別 → 注入泛型（解鎖型別）→ 觀察 tsc 浮現的錯誤 → 逐檔收斂 → 驗收。

## 0. 前置（環境校準，APPLY 第一步）

- [x] 0.1 確認分支為 `feature/backend-generated-types`，working tree 乾淨
- [x] 0.2 跑 baseline `npm run build`，記錄當前 0 errors（確立「行為不變」基準）

## 1. 生成 DB schema 型別（team lead，需 Supabase MCP）

- [x] 1.1 跑 `mcp__supabase__generate_typescript_types`（project `cxoncanfveqtfofcqyqe`），輸出存 `src/types/database.ts`
- [x] 1.2 確認生成型別含 Tables（profiles / user_profiles / developer_whitelist / announcements / game_special_tags / hero_alignments）、Views（public_profiles）、Functions（get_hero_stats）
- [x] 1.3 核對 `public_profiles.social_channels` 為 `Json`（反映 C1 遮罩 view）；記錄與 repo migration 015/017 的 drift（已知、非本 change 修）

## 2. 注入 Database 泛型（解鎖全域型別）

- [x] 2.1 `src/lib/supabase/server.ts`：`createServerClient<Database>(...)`，import `Database`
- [x] 2.2 `src/lib/supabase/client.ts`：`createBrowserClient<Database>(...)`，import `Database`
- [x] 2.3 跑 `npx tsc --noEmit`，**記錄所有新浮現的 tsc error**（這是注入泛型暴露的潛在問題清單）

## 3. 核心 row→domain 轉換改寫

- [x] 3.1 `browse.ts`：`rowToCard()` 參數型別改 `Database['public']['Views']['public_profiles']['Row']`；移除純量欄位的 `as`；`mic_status` narrowing 保留；social_channels 走 helper（見 4.1）
- [x] 3.2 `profile.ts` `getMyProfile`（base table）：移除可移除的 `as`；`mic_status` / display_name narrowing 視情況保留
- [x] 3.3 `profile.ts` `getPublicProfile`（view）：移除可移除的 `as`；social_channels 維持 `{}`（不讀 view 遮罩值）
- [x] 3.4 `profile.ts` `getMyDisplayName`：移除 `as string | null`（投影 `display_name` 已帶型別）
- [x] 3.5 `developer.ts` `getAllProfilesForDeveloper`（投影 select）：確認 select 欄位齊全後移除 map 內 `as`
- [x] 3.6 `developer.ts` `getHeroStats`：若 `Functions.get_hero_stats.Returns` 型別完整則移除 RPC `as`，否則保留並註明

## 4. social_channels 收斂 helper（REF-025 / design 決策 3）

- [x] 4.1 新增 `toSocialChannels(raw: Json | null): OWPlayerCard['social_channels']` helper（單點收斂，位於 `src/lib/socialChannels.ts`）
- [x] 4.2 `browse.ts` rowToCard + `OverwatchSquare.tsx`（相關位置）改用 helper（取代 `as Record<string,string>`）
- [x] 4.3 `player/[id]/page.tsx`（base table 真帳號）：保留字串斷言或走 helper，確認語意正確
- [x] 4.4 **smoke 驗證**：型別+build+C1 遮罩資料+OWCard truthiness 四重確認；視覺 e2e 待 team lead/user 手動確認廣場社群圖示正確顯示

## 5. 魔術字串集中化（REF-026 方案 A）

- [x] 5.1 新增 `PLACEHOLDER_BATTLE_TAG = "愛喝奶茶#3342"` 常數（`src/types/card.ts`）
- [x] 5.2 `developer.ts` 改用 `.neq("battle_tag", PLACEHOLDER_BATTLE_TAG)`；`developer/page.tsx` 亦更新
- [x] 5.3 確認 getSystemStats 的 completedProfiles 數值不變（行為不變驗收，常數值與原字面值相同）

## 6. 周邊檔案（視 tsc 浮現需要，最小改動）

- [x] 6.1 `userProfile.ts`：收斂 row 斷言（tsc 0 errors 驗收通過）
- [x] 6.2 `homepage.ts` `getAnnouncements`：6 個 `as` 視 announcements Row 型別收斂（alignments 仍需 `as Partial<AlignmentConfig>`，因 jsonb 為 Json；`as unknown as Json` 邊界已文件化）
- [x] 6.3 `alignment.ts`：`translate_x/y as number` 視 hero_alignments Row 型別收斂
- [x] 6.4 `tags.ts`：確認注入泛型後 `.select(投影)` 無新錯誤（無殘留不必要斷言）

## 7. 驗收（Stage 7 + §6.5 Gemini 審查）

- [x] 7.1 `npm run build`：0 TypeScript errors，全頁 static generation 通過（16/16 static pages）
- [x] 7.2 grep 確認目標檔（browse/profile/developer）row 轉換處無殘留不必要 `as string`/`as boolean`/`as string[]`
- [x] 7.3 既有行為驗證：廣場瀏覽 + 搜尋 + Load More；名片讀取/儲存；後台統計（totalUsers/totalProfiles/completedProfiles）
- [x] 7.4 e2e / unit test：N/A（repo 無此類測試框架）
- [x] 7.5 §6.5 第二意見：Gemini 審查 PASS（Codex 今日額度滿，依雙臂規範降級 Gemini；MUST-FIX 全已在 apply 完成；詳見 APPLY 紀錄）

## 8. rsx 記錄（ARCHIVE 前）

- [x] 8.1 建 ADR-25（生成型別 + domain 型別邊界決策）；建 F-026（social_channels 型別分歧 + helper 收斂通則）
- [x] 8.2 REF-024/025/026、F-025、ADR-24 crossref 回填（referenced_by 補 ADR-25 / F-026）
- [x] 8.3 更新 `.rsx/notes/latest.md`（Zone A + Zone B）

---

## 驗收標準（總覽）

| 標準 | 驗證方式 |
|---|---|
| `npm run build` 0 errors | Task 7.1 |
| 目標檔 row 轉換無殘留不必要 as | Task 7.2 grep |
| getSystemStats 魔術字串集中化 + 數值不變 | Task 5.3 |
| 既有行為不變（廣場/名片/後台）| Task 7.3 + 4.4 smoke |
| social_channels 不洩漏真帳號 | Task 4.4 |
