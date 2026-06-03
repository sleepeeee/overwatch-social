---
id: ADR-14
title: 玩家詳細頁 social_channels 透過 authenticated 直接查 profiles 表，而非放入 public view
status: Accepted
date: 2026-06-02
references_to: [REF-016, REF-017, F-012, F-014]
referenced_by: [F-014]
---

## 背景

`browse-server-search-and-player-detail` change 新建 `/player/[id]` 玩家詳細頁，
需要顯示玩家的社群聯絡資訊（`social_channels`：Discord / Twitter / Line 等）。

初始設計（Migration 007）將 `social_channels` 納入 `public_profiles` view，
以簡化查詢（一次 join 取得所有欄位）。§6.7 Gemini 初審識別此設計為 Critical C1 隱私漏洞：
anon 角色可不需登入即透過 REST API 直接取得所有用戶的聯絡資訊。

## 決策

採用「雙層查詢 + 隱私分層」模式：

**第一層（anon 可讀）**：
```typescript
// public_profiles view — 只含公開欄位，social_channels 不在此
const { data: profile } = await supabase
  .from("public_profiles")
  .select("*")
  .eq("user_id", id)
  .single();
```

**第二層（authenticated 才執行）**：
```typescript
// 直接查 profiles 表，RLS policy 保護
if (user) {
  const { data: privateData } = await supabase
    .from("profiles")
    .select("social_channels")
    .eq("user_id", id)
    .single();
}
```

Migration 008 同步：
- DROP + 重建 `public_profiles` view（移除 `social_channels`）
- 新增 RLS policy：`authenticated read visible profiles`（允許已登入用戶讀取 is_tag_visible=true 的 profiles）

## 理由

| 考量 | 選擇依據 |
|---|---|
| 隱私保護（Critical） | `social_channels` 含個人聯絡方式，必須在 DB 層限制為 authenticated-only，不能依賴前端 conditional render |
| 最小權限原則 | anon view 只暴露「用戶主動設定為公開」的欄位；私人欄位走獨立 RLS 路徑 |
| 實作複雜度 | 兩次查詢（view + 直接表）邏輯清晰，前端用 `if (user)` 決定是否發第二次請求 |
| 擴展性 | 未來如有其他 authenticated-only 欄位（如 email、電話），沿用相同 RLS policy 即可，不需修改 view |
| Server Component 相容 | `/player/[id]/page.tsx` 為 Server Component，兩次 Supabase 查詢均在 server 執行，無額外 RTT |

## 取捨 / 已知 Debt

- 雙層查詢比單一 join 多一次 DB roundtrip，但因均在 Server Component 執行，對用戶端體驗無影響。
- `profiles` 表的 authenticated RLS policy 目前允許讀取任意 `is_tag_visible=true` 的記錄，
  未來若需要更細緻的存取控制（如只有「已媒合的玩家」才能看聯絡方式），需另行修改 policy。
- Migration 008 的 `DROP + 重建 view` 操作在 production 需在低流量時段執行。

## 影響範圍

- 新增：`src/app/player/[id]/page.tsx`（玩家詳細頁，雙層查詢實作）
- 新增：`supabase/migrations/008_*.sql`（DROP + 重建 view，新增 authenticated RLS policy）
- 棄用：`supabase/migrations/007_*.sql` 中的 `social_channels` in view 設計（被 008 覆蓋）

## 相關 ADR / Finding / REF

- F-014：Supabase public view 納入私人欄位的隱私漏洞（本 ADR 的設計根源）
- F-012：client-side search on LIMIT 設計缺陷（同類「UI 層保護不等於 DB 層保護」反模式）
- REF-017：Supabase ilike 搜尋 + Load More 模式（Player Detail Page 模式正確設計）
- REF-016：Browse 廣場 7 大品質問題審計（問題 5 = 本 change 的需求來源）
