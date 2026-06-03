## Context

profiles 表（migration 001）缺少 display_name 欄位。AuthContext 的 `deriveUserProfile()` 從 `user.user_metadata.full_name` 衍生暱稱，profile 頁的 handleSaveHub 只寫 localStorage。換裝置後 localStorage 為空，AuthContext fallback 到 Google 帳號名，用戶設定的暱稱消失。

## Goals / Non-Goals

**Goals:**
- Supabase profiles 表加 display_name 欄位（migration）
- handleSaveHub 雙寫：localStorage（快取）+ Supabase（主資料源）
- user 載入時從 DB 同步最新 display_name，DB 值優先於 localStorage

**Non-Goals:**
- 修改 AuthContext（保持最小侵入性）
- 在 public_profiles view 暴露 display_name（個人設定，不公開）
- 即時全域同步（換裝置後下次登入才同步，非 realtime）

## Architecture Decision

採用雙寫策略（ADR-16）：localStorage 作為即時快取，Supabase 作為跨裝置 single source of truth。讀取優先序：DB > localStorage > auth.user_metadata。

## Key Files

- `supabase/migrations/012_add_display_name.sql`（新增）
- `src/app/actions/profile.ts`（新增 saveDisplayName / getMyDisplayName）
- `src/app/profile/page.tsx`（修改 handleSaveHub + user useEffect）
