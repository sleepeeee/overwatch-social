---
id: F-025
type: finding
title: "migration 015 為功能補回 social_channels 進 anon view，回退了 F-014 隱私修復——view 補回私人欄位前必須遮罩 PII"
status: confirmed
confidence: high
change: harden-supabase-security
date: 2026-06-11
references_to: [F-014, ADR-24, ADR-01, ADR-14, REF-004]
referenced_by: [F-014, ADR-24]
supporting_refs: [F-014]
---

## 結論 / 數據

`harden-supabase-security` change 蒐證發現：`public_profiles` view（anon-readable）的 `social_channels` 欄位在 live DB 儲存真實帳號 PII：

```json
{"discord":"akira#1234"}
```

任何人無需登入，直接 `curl` Supabase REST API 即可取得所有公開名片的聯絡帳號：

```bash
curl "https://cxoncanfveqtfofcqyqe.supabase.co/rest/v1/public_profiles?select=user_id,social_channels" \
  -H "apikey: <anon_key>"
# 回傳：[{"user_id":"...","social_channels":{"discord":"akira#1234"}}, ...]
```

**量化影響**：
- 受影響行數：所有 `is_tag_visible=true` 的公開名片（live DB 5 筆）
- PII 類型：Discord / Twitter / Line 帳號字串
- 暴露層：anon-readable view，無需任何認證
- 前端表現：OWCard 只用 key 存在性渲染圖示（`if (social_channels.discord)`），**不顯示帳號文字**——但 API 層早已洩漏

**隱私洩漏路徑（F-014 回退機制）**：

```
migration 008 ── 修復：DROP + 重建 public_profiles view，移除 social_channels ──→ F-014 PASS
      ↓
migration 015 ── 功能需求：廣場 social 圖示需要知道「哪些平台存在」
             ── 作法：把 social_channels 補回 view 投影（未遮罩，直接 SELECT social_channels）
             ── 效果：anon-readable view 再次含完整帳號 PII ──→ F-014 回退 ❌
```

**根本原因**：開發者在 migration 015 為了實現廣場社群圖示（只需 key 存在性，不需帳號值），誤直接把 `social_channels` 整欄補回 view 投影，而非以遮罩形式（`jsonb_object_agg(k, true)`）補回。UI 層只用 key 存在性的需求，被錯誤地實作為「拉回完整欄位」。

**修復（migration 021）**：

```sql
-- 遮罩：保留平台鍵供前端圖示，value 一律 true，移除帳號 PII
CASE
  WHEN social_channels IS NOT NULL AND social_channels::text <> '{}'
  THEN (SELECT jsonb_object_agg(k, to_jsonb(true)) FROM jsonb_object_keys(social_channels) k)
  ELSE social_channels
END AS social_channels
```

修復後驗收：5 筆 social_channels 全為 `{"discord":true}` 格式，無帳號字串 PII。

## 與既有 REF 一致或矛盾

**繼承 [[F-014]]**（Supabase public view 納入私人欄位 = 隱私洩漏）：

F-014 確立的設計原則：
> 「凡是需要『登入後才可見』的欄位，一律不進 anon-readable view，改走 authenticated RLS policy + 直接表查詢。」

本 Finding 是 F-014 修復後的**回退案例**——不是 F-014 結論有誤，而是後續 migration 在功能實作時未遵守 F-014 的 view 白名單原則。

**F-014 後續影響第 3 點 Migration 審查 checklist** 早已列出應核查項，但 migration 015 未遵守。

**與 [[ADR-14]]**（social_channels 走 authenticated 直查 profiles）：
ADR-14 的 two-query pattern（anon 讀 public_profiles view 取基本資訊；authenticated 直查 profiles 取 social_channels）是正確的。migration 015 把 social_channels 補回 view 破壞了此分層。本 change 修復重新符合 ADR-14 設計。

## 對後續影響

**view 補回私人欄位前必須遮罩 PII 的強制規則**：

任何 migration 修改 anon-readable view（`GRANT SELECT TO anon` 的 view）的投影欄位時，必須遵守：

1. **不可直接補回含帳號、密碼、聯絡資訊的欄位**，即使前端只用到 key 存在性。
2. 若前端需要「存在性旗標」，用 `jsonb_object_agg(k, true)` 或 `jsonb_build_object(k, true)` 遮罩 value，**不傳真實 value**。
3. 修改 view 前必須比對 F-014 的 view 欄位白名單（遷移時明確確認每個欄位是否適合 anon 可讀）。

**Migration 審查 checklist 新增項**：建立或修改 Supabase view 時：
- view 是否 GRANT SELECT TO anon？
- view 投影中是否包含用戶聯絡資訊（social_channels / email / phone）、個人偏好、app_metadata？
- 若是，**必須先做 column-level 遮罩或排除**，不可直接投影原欄。

**follow-up**：此模式（前端只需 key 存在性，但 view 投影整欄 jsonb）在 `tags`、`languages`、`selected_heroes` 等欄位不存在（純公開資料），但 `social_channels` 的特殊性（帳號值 PII）使其需要特別處理。長期解：`social_channels` 拆到獨立表 `profile_contacts`，不放入任何 anon view（見 [[ADR-24]] follow-up）。
