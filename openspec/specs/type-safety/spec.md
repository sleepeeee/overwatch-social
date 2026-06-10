# type-safety Specification

## Purpose
TBD - created by archiving change adopt-supabase-generated-types. Update Purpose after archive.
## Requirements
### Requirement: DB 查詢結果以生成型別為事實來源
Supabase 查詢回傳的列 SHALL 使用官方生成的 `Database` 型別（`src/types/database.ts`）作為靜態型別來源，而非 `Record<string, unknown>` 加手動 `as` 斷言。

#### Scenario: client 注入 Database 泛型
- **WHEN** 建立 Supabase client
- **THEN** `createServerClient<Database>` 與 `createBrowserClient<Database>` SHALL 帶入 `Database` 泛型參數
- **AND** `.from('profiles').select('*')` 的回傳 `data` SHALL 自動推導為 `Database['public']['Tables']['profiles']['Row'][]`

#### Scenario: 欄位名錯誤在編譯期被捕捉
- **WHEN** 程式碼存取查詢結果上不存在的欄位，或對 `.eq()` 傳入拼錯的欄位名
- **THEN** `tsc` SHALL 報出編譯錯誤（取代原本沉默通過的執行期風險）

### Requirement: row→domain 轉換移除不必要的型別斷言
row→`OWPlayerCard` 的轉換函式 SHALL 以對應的生成 `Row` 型別作為參數型別，並移除因 `Record<string,unknown>` 而存在的 `as string` / `as boolean` / `as string[]` 斷言。

#### Scenario: 廣場轉換
- **WHEN** `browse.ts` 的 `rowToCard()` 處理 `public_profiles` view 的列
- **THEN** 其參數型別 SHALL 為 `Database['public']['Views']['public_profiles']['Row']`
- **AND** 對已具正確型別的純量欄位（battle_tag / is_tag_visible / server 等）SHALL NOT 再加 `as`

#### Scenario: 保留語意正確的 narrowing
- **WHEN** 欄位需要從寬鬆 DB 型別窄化為 domain union（如 `mic_status` → `'mic-on'|'listen-only'|'mic-off'`）
- **THEN** 該 narrowing 斷言 SHALL 保留（不在移除範圍內）

### Requirement: OWPlayerCard 作為 app domain 型別保留
`OWPlayerCard` SHALL 保留為 app domain 型別（anti-corruption layer），不被生成型別取代。

#### Scenario: 衍生欄位與正規化保留
- **WHEN** 轉換產出 `card_id`（DB 無此欄、為 `card-${user_id}` 衍生）或經 `normalizeOverwatchServer` 正規化的 `server`
- **THEN** 這些 domain 語意 SHALL 由 OWPlayerCard 表達，而非要求 DB 生成型別承擔

### Requirement: social_channels 型別分歧的受控收斂
view 的遮罩布林與 base table 的帳號字串型別分歧 SHALL 收斂於單一 helper，不散落多處盲斷言。

#### Scenario: 廣場 view 的遮罩布林
- **WHEN** 從 `public_profiles` view 讀取 `social_channels`（C1 後為遮罩布林 jsonb）
- **THEN** 轉換 SHALL 經單一 helper 將 `Json` 收斂為 `OWPlayerCard['social_channels']`
- **AND** 廣場名片的社群圖示顯示行為 SHALL 維持不變

#### Scenario: 不洩漏真實帳號
- **WHEN** 廣場（公開 view）渲染 social_channels
- **THEN** 系統 SHALL NOT 顯示 base table 的真實帳號字串（維持 C1 遮罩語意）

### Requirement: getSystemStats 佔位名片判定集中化
排除預設佔位名片的字面值 SHALL 集中為單一具名常數，不散落於查詢與註解。

#### Scenario: 魔術字串改常數
- **WHEN** `getSystemStats` 計算 `completedProfiles` 排除佔位名片
- **THEN** SHALL 使用具名常數 `PLACEHOLDER_BATTLE_TAG` 取代行內字面值 `"愛喝奶茶#3342"`
- **AND** 統計結果（completedProfiles 數值）SHALL 與變更前一致（行為不變）

### Requirement: 整體型別變更不改變執行期行為
本 change SHALL 為純型別 + 程式碼層級變更，不含 DB schema 變更，且不改變既有執行期行為。

#### Scenario: 建置通過且行為不變
- **WHEN** 套用所有型別改寫後執行 `npm run build`
- **THEN** SHALL 回報 0 TypeScript errors
- **AND** 廣場瀏覽 / 名片讀寫 / 後台統計 的行為 SHALL 與變更前一致

