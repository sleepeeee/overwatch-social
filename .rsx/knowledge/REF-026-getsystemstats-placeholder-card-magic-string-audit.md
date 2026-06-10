---
id: REF-026
type: docs
title: getSystemStats 佔位名片魔術字串審計：'愛喝奶茶#3342' 排除邏輯的脆弱性與替代方案
url: n/a
status: active
references_to: [REF-019]
referenced_by: [ADR-25]
---

> DERIV 性質（衍生自 developer.ts 程式碼審計）；無外部 URL，url 填 n/a。

## 探索動機（Stage 1）

C2 範圍 #3：清掉 `developer.ts:191` 的魔術字串 `"愛喝奶茶#3342"`（getSystemStats 用來排除預設佔位名片）。
此 REF 釐清：(a) 這個值從哪來、(b) 它脆弱在哪、(c) 不改 DB schema 的前提下最小改動方案。

## 現況（developer.ts:182-192）

```ts
supabase.from("profiles").select("*", { count: "exact", head: true })
  .not("battle_tag", "is", null)
  .neq("battle_tag", "愛喝奶茶#3342") // 排除預設佔位值，只計算真正填寫的名片
```

`completedProfiles` = 排除 NULL battle_tag + 排除字面值 `愛喝奶茶#3342` 後的名片數。

## 魔術字串的來源

- `card.ts:7` 註解直接寫範例 `'愛喝奶茶#3342'`，`mockPlayers.ts` 亦用此值作為示範。
- 推測：早期 seed / 預設名片用此 battle_tag 當佔位，故統計時排除。
- **問題**：這是一個散落在 註解 + mock + 統計查詢 三處的 magic constant，無單一定義來源。

## 脆弱性

| 脆弱點 | 後果 |
|---|---|
| 硬編碼中文字面值 | 改 seed 值就漏算/誤算；無編譯期保護 |
| 語意不清 | 「完成名片」的定義綁在一個帳號字串上，而非 profile 完整度 |
| 無 DB 欄位支撐 | profiles 表無 `is_placeholder` / `is_complete` 旗標 |

## 替代方案評估（不改 DB schema 前提）

| 方案 | 改動 | 評估 |
|---|---|---|
| **A. 抽常數**（最小）| 把 `'愛喝奶茶#3342'` 抽成 `PLACEHOLDER_BATTLE_TAG` 共用常數（如 `src/lib/constants.ts`）| ✅ 最小改動；消除散落；保留現有語意；karpathy 友善 |
| B. 改判斷語意 | 改用「battle_tag 非空且非預設」之外加 `selected_heroes` 非空等完整度判斷 | ⚠️ 改變統計定義（行為變更），超出 C2「行為不變」驗收 |
| C. 加 DB 旗標 | profiles 加 `is_placeholder boolean` + migration | ❌ 需 DB schema 變更，超出 C2 純型別範圍 |
| D. NULL 語意 | 預設名片改存 NULL battle_tag（已被 `.not("battle_tag","is",null)` 涵蓋）| ❌ 需資料遷移；且現有佔位卡 battle_tag 非 NULL |

## 建議（design 取捨）

採 **方案 A（抽常數）**：
- 在 `src/lib/constants.ts`（或 card.ts 旁）定義 `export const PLACEHOLDER_BATTLE_TAG = "愛喝奶茶#3342";`
- developer.ts 改用 `.neq("battle_tag", PLACEHOLDER_BATTLE_TAG)`
- mockPlayers.ts / card.ts 註解亦可引用（選配，避免擴散）
- **行為完全不變**（同一個值，只是集中定義）→ 符合 C2「既有行為不變」驗收。
- 若 DB 無對應欄位，方案 C/D 記為 design 取捨（已評估、暫不採），符合 brief「若 DB 無對應欄位則記為 design 取捨」。

> 此項與型別斷言主軸正交（是 code smell 清理）；但同屬「順手清掉一個異味」的 C2 範圍。

## 相關 REF

- REF-019：profiles schema（battle_tag 欄位、無 is_placeholder 旗標的證據來源）
