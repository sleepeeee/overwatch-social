# adopt-supabase-generated-types

## Why

跨資料邊界（Supabase row → app domain 型別）目前散落 **44 個手動型別斷言**（`as string` / `as boolean` / `as string[]` / `as Record<string,string>`），分布於 6 個 server action 檔。這些斷言有三個問題：

1. **編譯期無保護**：欄位名拼錯、型別寫錯（如把布林當字串）tsc 抓不到——廣場的 `social_channels` 就有一個真實的型別謊言（view 回布林，程式碼斷言為 `Record<string,string>`，見 REF-025）。
2. **schema 變更不會傳導**：DB 改欄位，`as` 會繼續沉默地謊報舊型別。
3. **可讀性差**：`rowToCard()` 充滿 `(row.x as T)` 噪音，掩蓋真正的轉換邏輯。

Supabase 提供官方生成型別（`Database` generic），注入 `createClient<Database>` 後，`.from().select()` 的回傳即帶真實 schema 型別，多數 `as` 可直接移除，欄位錯誤變編譯期錯誤（REF-024）。

同時順手清掉一個 code smell：`getSystemStats`（developer.ts:191）用硬編碼魔術字串 `"愛喝奶茶#3342"` 排除佔位名片（REF-026）。

## What Changes

1. **生成 DB schema 型別**：用 `mcp__supabase__generate_typescript_types` 生成 `src/types/database.ts`（反映生產 DB 真實 schema，含 C1 遮罩後的 view）。
2. **注入 Database 泛型**：`createBrowserClient<Database>` / `createServerClient<Database>`（`src/lib/supabase/client.ts` / `server.ts` 各一行）。
3. **改寫 row→domain 轉換**：以 `Database['public']['Tables'|'Views'][...]['Row']` 取代 `Record<string,unknown>` + `as`，重點是：
   - `browse.ts` `rowToCard()` / `getPublicProfiles()`
   - `profile.ts` `getMyProfile()` / `getPublicProfile()` / `getMyDisplayName()`
   - `developer.ts` `getAllProfilesForDeveloper()` / `getHeroStats()`
   - 視情況：`userProfile.ts` / `homepage.ts` / `alignment.ts` / `tags.ts`
4. **保留 OWPlayerCard domain 型別**：DB 生成型別與 app domain 型別並存，row→card 在轉換層橋接（不為消除 as 而引入泛型體操）。
5. **social_channels 收斂 helper**：view 的遮罩布林 vs base table 的帳號字串需明確窄化（REF-025），不能機械式移除 as。
6. **清魔術字串**：`"愛喝奶茶#3342"` 抽為 `PLACEHOLDER_BATTLE_TAG` 常數（行為不變，REF-026 方案 A）。

**不做**（明確 out of scope）：
- 不改 DB schema（無 migration）。
- 不改 OWPlayerCard 欄位定義（除非 social_channels 收斂必要且最小）。
- 不重構 mock data / 前端元件（除非型別注入後 tsc 強制要求微調）。
- 不補 C1 缺失的遮罩 migration 檔（記為已知 drift，另案處理）。

## Impact

- **Affected specs**: `type-safety`（新增 capability）
- **Affected code**:
  - 新增 `src/types/database.ts`（生成）、`src/lib/constants.ts`（或既有檔加常數）
  - 改 `src/lib/supabase/client.ts`、`server.ts`（各 +泛型參數）
  - 改 `src/app/actions/browse.ts`、`profile.ts`、`developer.ts`（核心）
  - 可能微調 `userProfile.ts`、`homepage.ts`、`alignment.ts`、`tags.ts`、`player/[id]/page.tsx`
- **驗收**：`npm run build` 0 errors；目標檔 row 轉換處無殘留不必要 `as`；getSystemStats 魔術字串集中化；既有行為不變（廣場 / 名片 / 後台讀寫）。
- **風險**：social_channels 型別分歧（REF-025）；生成型別與 repo migration drift（REF-024）；泛型注入可能在 `.select(投影)` 或 RPC 回傳處暴露既有隱性錯誤需收斂。
- **無 DB 變更 → 無資料風險、可隨時 revert**（純編譯期 + 程式碼）。
