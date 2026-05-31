-- ============================================================
-- Migration 001: profiles 表 + RLS + public_profiles view
-- 對應 OWPlayerCard TypeScript 型別
-- ============================================================

create table if not exists profiles (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  server          text not null default 'Asia Server',
  battle_tag      text not null default '特工#0000',
  is_tag_visible  boolean not null default true,
  selected_heroes text[]  not null default '{}',
  tags            text[]  not null default '{}',
  message         text    not null default '',
  languages       text[]  not null default '{"繁體中文"}',
  mic_status      text    not null default 'mic-on',
  social_channels jsonb   not null default '{}',
  mbti            text,
  updated_at      timestamptz not null default now()
);

-- RLS 啟用
alter table profiles enable row level security;

-- policy：本人才能讀自己的完整 row（含 social_channels）
create policy "profiles select own"
  on profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- policy：本人才能新增自己的 row
create policy "profiles insert own"
  on profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- policy：本人才能更新自己的 row
create policy "profiles update own"
  on profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- public_profiles view：廣場公開讀取介面
-- 排除 social_channels；is_tag_visible=false 時遮蔽 battle_tag
-- ============================================================
create or replace view public_profiles as
  select
    user_id,
    server,
    case
      when is_tag_visible then battle_tag
      else '隱藏#xxxx'
    end as battle_tag,
    is_tag_visible,
    selected_heroes,
    tags,
    message,
    languages,
    mic_status,
    mbti,
    updated_at
    -- social_channels 故意排除：聯絡資訊不在廣場公開
  from profiles;

-- 允許 anon 和 authenticated 讀取 public view
grant select on public_profiles to anon, authenticated;

-- updated_at 自動更新 trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
