---
id: ADR-01
title: "DB 層隱私遮蔽：public_profiles view 取代前端遮蔽"
status: Accepted
change: google-oauth-supabase-auth
date: 2026-06-01
references_to: [REF-004]
referenced_by: [F-001]
---

## 決策

在 DB 層（Postgres view）對 `battle_tag` 做條件遮蔽，而非在前端（React / Server Component）遮蔽。
具體實作：`public_profiles` view 在 SELECT 時將 `is_tag_visible = false` 的 row 的 `battle_tag` 替換為字面量 `'隱藏#xxxx'`；同時把 `social_channels` 欄位整體排除於 view projection 之外，使 anon key 無法取得聯絡資訊。

## 考量選項

| 選項 | 優點 | 缺點 |
|---|---|---|
| **DB 層 view 遮蔽（採用）** | 遮蔽邏輯在單一 DB 物件集中；前端永遠取到已處理資料；不依賴前端正確實作 | view 無法加 RLS（靠 projection 而非 policy）；需明確 GRANT SELECT 給 anon |
| 前端 Server Component 遮蔽 | 彈性高，邏輯可動態更新 | API 層仍可能洩漏原始值（若直查 profiles）；需在每個消費點都正確實作 |
| 前端 Client Component 遮蔽 | 無需後端修改 | 原始資料已到達客戶端，任何網路層攔截即可拿到真實值；根本上不安全 |

## 理由

1. anon key 公開存在於前端 bundle，任何人皆可直接對 Supabase API 發請求。若只靠前端遮蔽，攻擊者繞過 UI 即可拿到原始 `battle_tag` 與 `social_channels`。
2. DB 層是唯一可信的執行點。view 的 projection 使資料在離開 DB 時即已處理，不依賴任何上層邏輯正確性。
3. `§6.5` 第 1 輪 Codex audit 明確標記「profiles public SELECT policy 開放整表」為 Critical，直接觸發本決策。

## 影響與約束

- `profiles` 表**不得**建立 public SELECT policy（anon key 不可直查整表）。
- 前端（`/browse`）**不得**有自行遮蔽 `battle_tag` 的邏輯（Task 6.2 驗收項）。
- 後續若需要 view 的 RLS 行為，必須改用 `security_invoker` 或拆回 RLS policy（§6.7 Codex 建議列入 backlog）。
- `social_channels` 不在 view projection 內，廣場永遠不顯示聯絡資訊。

## 相關 REF / Finding

- REF-004：RLS policy 設計（本 ADR 依賴其「profiles 無 public SELECT」設計）
- F-001：三輪 §6.5 Codex 審查發現的隱私漏洞 → 觸發本 ADR
