## 1. DB Migration

- [x] 1.1 建立 supabase/migrations/013_display_name_game_public.sql（display_name + game 進 view；game 欄位 + 索引）
- [ ] 1.2 在 Supabase Dashboard SQL Editor 執行 migration（手動步驟，需用戶執行）
  - **Skip 理由**：無自動化途徑；Supabase Dashboard SQL Editor 需人工操作；已提供 SQL 檔案

## 2. Server Actions

- [x] 2.1 browse.ts：unstable_cache 包裝 getPublicProfiles（tag/revalidate 設定）
- [x] 2.2 profile.ts：saveProfile/saveDisplayName 加 revalidateTag("public-profiles", "max")
- [x] 2.3 alignmentCache.ts：module-level cache（getCachedAlignments/setCachedAlignments/clearAlignmentCache）
- [x] 2.4 alignment.ts：cache 讀寫整合
- [x] 2.5 saveAlignment.ts：成功後 clearAlignmentCache()

## 3. Type 與元件

- [x] 3.1 types/card.ts：OWPlayerCard 加 display_name?、game?
- [x] 3.2 browse.ts rowToCard 加 display_name、game 映射
- [x] 3.3 profile.ts getMyProfile/getPublicProfile 加映射
- [x] 3.4 OverwatchSquare.tsx toPlayerCard 加映射；getPublicProfiles 呼叫加 "overwatch"

## 4. 驗收

- [x] 4.1 TypeScript 型別檢查（npm run build 通過，zero type errors）
- [x] 4.2 Next.js build 通過（Vercel 自動部署成功）
- [ ] 4.3 Supabase SQL 執行後端對端驗證（需手動：在 Supabase Dashboard 執行 migration 013）
  - **Skip 理由**：依賴 1.2 手動步驟；build/type-check 為主要自動化驗收；DB 端驗證為後續用戶操作
