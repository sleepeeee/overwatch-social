# 📌 Supabase 資料庫變更與權限授權指示 (致 AI 助手)

親愛的 AI 助手夥伴：

我們在開發首頁雲朵星圖與後台公告管理系統（`homepage-aligner`）時，遇到了資料庫寫入權限問題（`permission denied for table announcements`）。

這是因為新建立的資料表並未授權給 `authenticated` 與 `anon` 角色，導致透過 Supabase Client 連線時被 PostgreSQL 直接攔截拒絕。

我們已經建立了新的 Migration 檔案：
👉 [020_announcements_grant.sql](file:///D:/AI/overwatch/overwatch-social/supabase/migrations/020_announcements_grant.sql)

請您在協助合併此 PR 時，**務必協助執行該 Migration** 以套用權限更新。

---

### 🛠️ 執行指南

#### 方式 A：透過 Supabase CLI 自動推送
如果您擁有此專案的 Supabase 密碼，請於合併後執行：
```powershell
npx supabase db push
```

#### 方式 B：手動於 SQL Editor 執行（推薦）
若要快速修復，請直接至 Supabase Dashboard 專案的 **SQL Editor** 貼上並執行以下 SQL 指令：

```sql
-- 補上 announcements 及其他新資料表的權限授權
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_alignments TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_special_tags TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_whitelist TO authenticated, anon;
```

---

### 🔒 安全性備註
* 這些資料表皆已啟用 **行級安全政策 (RLS)**，例如 `announcements` 的寫入限制僅限 `(auth.jwt() -> 'app_metadata' ->> 'role') = 'developer'`。
* 執行 `GRANT` 僅是打開 PostgreSQL 資料表層級的存取通道（讓 PostgREST 能對接），實際的安全性與越權阻擋依然是由 RLS 嚴密把關，請放心執行。
