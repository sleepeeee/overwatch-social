# Tasks: developer-console-backend

> **執行順序**：先跑 migration（Task 0-1）→ 再改 Server Actions（Task 2-3）→ 再改前端（Task 4-5）→ 整合測試（Task 6）
>
> B1（Overview 統計）和 B2（對準儀 DB）可獨立推進，B1 不依賴 migration。

## 0. 環境校準

- [ ] 0.1 確認 `npx tsc --noEmit` 無現有錯誤
- [ ] 0.2 確認 dev server 可啟動（`npm run dev`）

## 1. Supabase migration（B2 前置）

> 在 Supabase SQL Editor 執行，不是程式碼變更。

- [ ] 1.1 執行 `supabase/migrations/003_hero_alignments.sql`（建立 `hero_alignments` 表 + RLS + developer profiles policy）：
  ```sql
  -- hero_alignments 表
  CREATE TABLE IF NOT EXISTS public.hero_alignments (
    hero_id TEXT PRIMARY KEY,
    scale NUMERIC(4,2) NOT NULL DEFAULT 1.80,
    translate_x INTEGER NOT NULL DEFAULT 0,
    translate_y INTEGER NOT NULL DEFAULT 15,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  ALTER TABLE public.hero_alignments ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public read hero_alignments"
    ON public.hero_alignments FOR SELECT USING (true);
  CREATE POLICY "Developer write hero_alignments"
    ON public.hero_alignments FOR ALL
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');

  -- 讓 developer 可以查詢全部 profiles（用於 getSystemStats，C1 RLS fix）
  CREATE POLICY "Developers can view all profiles for stats"
    ON profiles FOR SELECT
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');
  ```
- [ ] 1.2 Seed 51 筆現有資料（從 `heroAlignments.ts` 複製，`ON CONFLICT (hero_id) DO NOTHING`，冪等）
- [ ] 1.3 驗證：`SELECT COUNT(*) FROM hero_alignments;` 回 51
- [ ] 1.4 建立 migration 檔案 `supabase/migrations/003_hero_alignments.sql` 至 codebase

## 2. 改 saveHeroAlignments（B2 — 修生產 bug）

- [ ] 2.1 修改 `src/app/actions/saveAlignment.ts`
  - 移除 `import fs from "fs"` 和 `import path from "path"`
  - 移除 `fs.writeFileSync` 邏輯
  - 改為 Supabase upsert（`hero_alignments` 表，`onConflict: "hero_id"`）
  - 錯誤不再靜默：`console.error` + `return { success: false, error }`
- [ ] 2.2 TypeScript 確認無錯誤

## 3. 建 getHeroAlignments Server Action（B2 — 讀取層）

- [ ] 3.1 建 `src/app/actions/alignment.ts`
  - `getHeroAlignments()` → SELECT `hero_id, scale, translate_x, translate_y`
  - 成功：回傳 DB 值（覆蓋靜態 HERO_ALIGNMENTS 對應項）
  - 失敗 / 空：fallback 到靜態 `{ ...HERO_ALIGNMENTS }`
  - 不需要 `ensureDeveloper()`（公開讀）
- [ ] 3.2 TypeScript 確認無錯誤

## 4. 前端接入 getHeroAlignments（browse + profile）

- [ ] 4.1 修改 `src/app/browse/page.tsx`
  - import `getHeroAlignments`, `AlignmentConfig`
  - 新增 `heroAlignments` state（初始為 `HERO_ALIGNMENTS`）
  - `useEffect` 裡呼叫 `getHeroAlignments().then(setHeroAlignments)`
  - 傳 `customAlignments={heroAlignments}` 給每個 `<OWCard>`
- [ ] 4.2 修改 `src/app/profile/page.tsx`（同上）
- [ ] 4.3 TypeScript 確認無錯誤

## 5. Overview 真實統計（B1 — 後台統計）

- [ ] 5.1 在 `src/app/actions/developer.ts` 加入 `getSystemStats()`
  - 查詢 `profiles` 表 count（`{ count: "exact", head: true }`）
  - 回傳 `{ totalProfiles, completedProfiles }`
- [ ] 5.2 修改 `src/app/developer/page.tsx`
  - 呼叫 `getSystemStats()` 並傳給 DeveloperConsoleClient
- [ ] 5.3 修改 `src/app/developer/DeveloperConsoleClient.tsx`
  - Overview tab 顯示 `totalProfiles` 數字
  - 移除「正常連線中」+ 假 Online badge
- [ ] 5.4 TypeScript 確認無錯誤

## 6. 整合測試

- [ ] 6.1 對準儀儲存測試：調整某英雄參數 → 儲存 → `SELECT * FROM hero_alignments WHERE hero_id = '<id>'` 確認值更新
- [ ] 6.2 廣場英雄立繪測試：browse 頁面英雄立繪使用 DB 對準值（非全部用 DEFAULT）
- [ ] 6.3 Overview 統計測試：`/developer` Overview tab 顯示真實數字（非「正常連線中」假 badge）；必須確認 `getSystemStats().totalProfiles` == SQL Editor `SELECT COUNT(*) FROM profiles;`（D5 RLS 驗收）
- [ ] 6.4 TypeScript 全 pass：`npx tsc --noEmit`
- [ ] 6.5 Vercel 部署後 smoke：對準儀儲存成功（`saveStatus = "success"`）
