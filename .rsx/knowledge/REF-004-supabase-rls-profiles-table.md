---
id: REF-004
type: docs
title: Supabase Row Level Security（profiles 表 + auth.uid() policy）官方指南
url: https://supabase.com/docs/guides/auth/row-level-security
status: active
version: "Supabase Postgres RLS (2026)"
last_updated: 2026-05-31
official: true
references_to: [REF-002, REF-003]
referenced_by: [ADR-01, REF-005, F-001, ADR-02, F-004, ADR-04, REF-010, REF-011, REF-022, ADR-24, F-024, F-025]
---

## 摘要

Supabase（Postgres）的 Row Level Security 是「公開 anon/publishable key 場景下唯一的資料授權邊界」。要點：

1. **啟用 RLS**：`alter table profiles enable row level security;` — 啟用後，**未建 policy 前所有 API 存取一律被拒**（這是安全預設，也是最常見坑：啟用卻忘了建 policy → 整表打不開）。
2. **建議表結構**：`profiles` 表以 `user_id uuid references auth.users` 連結登入身分。
3. **典型 policy 組合**（廣場可公開瀏覽、僅本人可寫）：
   - SELECT `to anon using (true)` — 所有人可看名片廣場。
   - INSERT `to authenticated with check ((select auth.uid()) = user_id)` — 只能建自己的 row。
   - UPDATE `to authenticated using/with check ((select auth.uid()) = user_id)` — 只能改自己的 row。
4. **效能**：`auth.uid()` 包成 `(select auth.uid())`，讓 Postgres per-statement 快取，避免每 row 呼叫。

## 對專案的啟示

直接對應 change 的「建 profiles 表 + 安全寫入」需求：
- `profiles` 表 schema 以 `OWPlayerCard` 型別逐欄對應：`user_id`(FK→auth.users)、`server`(text)、`battle_tag`(text)、`is_tag_visible`(bool)、`selected_heroes`(text[])、`tags`(text[])、`message`(text)、`languages`(text[])、`mic_status`(text/enum)、`social_channels`(jsonb)、`mbti`(text null)。
- 「名片廣場公開、`/profile` 僅本人可編輯儲存」正好對應 anon-SELECT + authenticated-own-row 的 policy 組合 —— RLS 是這個權限模型的執行點，不能只靠前端 `isLoggedIn` 旗標。
- migration SQL（建表 + enable RLS + 3 條 policy）是 tasks.md 一個明確 task。

## 引用場景

- design.md 的「profiles 表 schema」與「授權模型（RLS policy 表）」段
- specs/profiles/spec.md 的資料模型 + 授權 requirement
- tasks.md 的「撰寫 migration SQL（建表 + RLS）」task
- Stage 4 安全 audit（RLS 是否覆蓋所有寫入路徑、enable 後是否漏建 policy）
- 引用 REF-002（RLS 的 auth.uid() 來自 getClaims 驗證的 session）、REF-003（OAuth 登入產生的身分即 policy 主體）

## 風險 / Caveat

- RLS 是後端強制的最後防線，但**不取代**前端驗證體驗（前端仍需登入後才顯示編輯 UI）。兩層都要有，缺一不可。
- `social_channels` 用 jsonb 儲存 vs 拆多欄是設計取捨；jsonb 較貼合現有 TS 型別但較難下 SQL 約束，design.md 需明確 rationale（Stage 4 範圍/可行性 audit 項）。
