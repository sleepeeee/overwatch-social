# Design — adopt-supabase-generated-types

## Context

- Next.js 16 App Router + TypeScript（`strict: true`）+ Supabase（`@supabase/ssr` 0.10.3 / `supabase-js` 2.106.2）。
- 44 個手動 `as` 斷言跨 6 個 server action 檔（grep 實測：browse 14 / profile 14 / homepage 6 / developer 5 / userProfile 3 / alignment 2）。
- C1（harden-supabase-security）已將 `public_profiles.social_channels` 改為遮罩布林並 apply 到生產 DB。
- **無 DB schema 變更**：C2 是純型別 + 程式碼工程，可隨時 revert。

## Goals / Non-Goals

**Goals**
- 編譯期捕捉欄位 / 型別錯誤（消除沉默的型別謊言）。
- 移除 row→domain 轉換層不必要的 `as`。
- 集中化 `getSystemStats` 魔術字串。

**Non-Goals**
- 不改 DB schema、不寫 migration。
- 不改 OWPlayerCard 欄位（domain 型別保留）。
- 不為消除 as 引入複雜泛型體操（karpathy 簡約）。
- 不追求「零 as」：部分 as 是合理的 domain narrowing（如 `mic_status as OWPlayerCard["mic_status"]`），保留。

---

## 決策 1：生成型別 vs 手寫 domain 型別的邊界（核心）

| 層 | 型別 | 角色 | C2 處置 |
|---|---|---|---|
| DB schema 層 | `Database['public']['Tables'\|'Views'][...]['Row']`（生成）| DB 真實 schema 的鏡像 | **新增**，作為查詢回傳的型別來源 |
| App domain 層 | `OWPlayerCard`（手寫，`card.ts`）| UI / 業務語意型別 | **保留**，row→card 轉換的目標型別 |

**橋接原則**：`createClient<Database>` 注入後，`.from('profiles').select('*')` 的 `data` 自動是 `Row[]`，
轉換函式簽名從 `rowToCard(row: Record<string,unknown>)` 改為 `rowToCard(row: PublicProfileRow)`，
函式體內 `row.battle_tag`（已是 string）不再需要 `as string`。

```ts
// 型別別名（建議放 src/types/database.ts 底部或 card.ts）
type ProfileRow      = Database['public']['Tables']['profiles']['Row'];
type PublicProfileRow = Database['public']['Views']['public_profiles']['Row'];
```

**為何保留 OWPlayerCard**：它含 `card_id`（DB 無此欄，是 `card-${user_id}` 衍生）、
`server` 經 `normalizeOverwatchServer` 正規化、`mic_status` 是 union literal（DB 是寬鬆 string）——
這些是 domain 語意，不該由 DB 型別取代。OWPlayerCard 是 anti-corruption layer。

---

## 決策 2：client 泛型注入（一次性投資）

```ts
// src/lib/supabase/server.ts
import type { Database } from "@/types/database";
createServerClient<Database>(url, key, { cookies: {...} });

// src/lib/supabase/client.ts
createBrowserClient<Database>(url, key);
```

注入後全 codebase 的 `.from()` 查詢自動帶型別。**這是 ROI 最高的一步**：改 2 行，
解鎖所有檔案的型別推導，多數 `as` 隨之可移除。

⚠️ **連帶風險**：注入泛型後，原本被 `Record<string,unknown>` 吞掉的型別錯誤會浮現為 tsc error。
這是好事（找到真 bug），但 APPLY 階段要逐一收斂，不是「移除 as 就完成」。預期需收斂處：
- `.select('a, b, c')` 投影查詢：回傳型別只含選定欄位，存取未選欄位會報錯（developer.ts `getAllProfilesForDeveloper` 用了投影）。
- `get_hero_stats` RPC：`Functions.get_hero_stats.Returns` 型別 vs 現有手寫 `Array<{hero_id; hero_count}>`。
- `.single()` 回傳 `Row | null`：現有 `if (!data) return null` 已處理。

---

## 決策 3：social_channels 型別分歧處理（C2 最大風險，REF-025）

**真相**：
- `profiles.social_channels`（base table）= 帳號字串 jsonb `{"discord":"u#1234"}`
- `public_profiles.social_channels`（view, C1 後）= 遮罩布林 jsonb `{"discord":true}`
- 生成型別**兩者皆為 `Json`**（Supabase jsonb 一律 `Json`）→ tsc 不會自動區分字串 vs 布林。

**消費端真相（grep 證據）**：`OWCard.tsx:329` 已把廣場 social_channels 當布林用（`isEnabled`）。
→ 現行 `browse.ts:21` 的 `as Record<string,string>` 是**錯誤斷言**（謊報字串），但因 JS 弱型別未爆。

**決策（最小改動，保留 OWPlayerCard）**：
1. **不改** OWPlayerCard.social_channels 的字串型別定義（改它會擴散到 OWCard / 廣場 / profile 編輯多檔，違反 karpathy）。
2. 在轉換層加 narrowing helper，把 view 的 `Json` 安全收斂為 OWPlayerCard 需要的形狀：
   ```ts
   // 廣場（view）：social_channels 是遮罩布林，但 OWPlayerCard 期望 Record<string,string>
   // 既有相容行為：把 truthy 值塞進 string slot（OWCard 只看 key 是否存在 / isEnabled）
   function coerceSocialChannels(raw: Json | null | undefined): OWPlayerCard['social_channels'] {
     if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
     return raw as OWPlayerCard['social_channels']; // 收斂於 helper 內單點，取代散落的 as
   }
   ```
   → `as` 仍存在，但**收斂到單一 helper**（一處受控），而非散落 3+ 處盲斷言。
3. base table 路徑（`profile.ts:35` getMyProfile / `player/[id]/page.tsx:65`）的字串斷言**語意正確**（真帳號），可保留或走同一 helper。

⚠️ **APPLY 階段 smoke 驗證項**：廣場名片社群圖示（Discord/Threads/RC/game_voice）必須仍正確顯示——
生成型別不保護此行為回歸（布林與字串都是 Json）。

---

## 決策 4：getSystemStats 魔術字串（REF-026 方案 A）

```ts
// src/lib/constants.ts（新增，或加在 card.ts 旁）
export const PLACEHOLDER_BATTLE_TAG = "愛喝奶茶#3342";

// developer.ts
.neq("battle_tag", PLACEHOLDER_BATTLE_TAG)
```

- **行為完全不變**（同一個值集中定義）→ 符合「既有行為不變」驗收。
- 評估過但不採：加 DB `is_placeholder` 旗標（需 migration，超出 C2）、改完整度語意（改變統計定義，行為變更）。
- **design 取捨記錄**：DB 無 `is_placeholder` / `is_complete` 欄位，故沿用 battle_tag 字串比對；
  僅做集中化，不改判定語意。若未來要更穩健的「完成名片」定義，另開 change 加 DB 旗標。

---

## 決策 5：型別來源 = 生產 DB（drift 注意，REF-024）

`mcp__supabase__generate_typescript_types` 讀**生產 DB 即時 schema**，故生成的
`public_profiles.social_channels` 反映 C1 遮罩版本。但 repo `supabase/migrations/015,017` 仍是
**未遮罩**版本（C1 的遮罩 migration 檔尚未落地 repo）。

→ 生成型別正確（信任生產 DB）；此 drift **不在 C2 範圍**，記為已知問題，建議另案補 C1 migration 檔。
→ APPLY 時若重新生成型別，須在同一生產 DB 狀態下進行，避免引入非預期欄位變動。

---

## Rationale 表（技術選擇 ↔ prior work）

| 技術選擇 | 依據 REF/ADR | 理由 |
|---|---|---|
| `Database` generic + `createClient<Database>` | REF-024 | Supabase 官方模式；一次注入全域生效 |
| 保留 OWPlayerCard 作 anti-corruption layer | REF-024 §關鍵啟示 2、card.ts | domain 語意（card_id 衍生、server 正規化、mic_status union）不該由 DB 型別取代 |
| social_channels 收斂於單一 helper | REF-025、ADR-01 | view 遮罩布林 vs table 帳號的型別分歧；消費端早已當布林；最小改動 |
| 魔術字串抽常數（方案 A）| REF-026 | 行為不變、消除散落、無需 DB 變更 |
| 不改 DB schema | REF-019、proposal Non-Goals | C2 是純型別工程，可 revert |

---

## 風險點與不能簡單移除的 as（給 APPLY + Codex）

| 位置 | as | 能否移除 | 處置 |
|---|---|---|---|
| `browse.ts:20` `mic_status as OWPlayerCard["mic_status"]` | domain narrowing | ❌ 保留 | DB 是寬鬆 string，需窄化為 union literal |
| `browse.ts:21` social_channels `as Record<string,string>` | 型別謊言 | ⚠️ 改 helper | 見決策 3 |
| `profile.ts` getMyProfile 大量 as | 多數可移除 | ✅ 移除 | 注入泛型後 `data.x` 已是正確型別 |
| `developer.ts` getAllProfilesForDeveloper 投影 as | 可移除 | ✅ 移除 | 投影查詢回傳已帶型別；但要確認 select 欄位齊全 |
| `developer.ts` getHeroStats RPC `as Array<...>` | 看 Functions 型別 | ⚠️ 視生成 | 若 `Functions.get_hero_stats.Returns` 完整則移除，否則保留收斂 |
| `player/[id]/page.tsx:65` social_channels（base table 真帳號）| 語意正確 | 🆗 保留/helper | 走 base table，字串斷言正確 |

---

## MANDATORY Stage 6 — Codex review prompt（team lead 並行發起）

> ⚡ rsx sub-agent 無法 spawn Agent（F-039）→ orchestrator **無法執行** Codex review。
> Team lead 收到本回報後，請並行發起以下 Codex review。**未經 Codex review 不得進 Stage 7 / APPLY。**

```
Agent(subagent_type="codex:codex-rescue", prompt=<<<
You are reviewing a PROPOSE-stage design for an OpenSpec change in a Next.js 16 + TypeScript (strict) + Supabase (@supabase/ssr) codebase. NO code is changed yet; review the design/spec/tasks only. Do NOT write code.

Change: adopt-supabase-generated-types
Goal: replace ~44 manual `as` type assertions across 6 server-action files with Supabase generated `Database` types + `createClient<Database>` generic. Also centralize a magic string in getSystemStats. NO DB schema change.

Artifacts to read (absolute paths):
- D:/Overwatch專案/openspec/changes/adopt-supabase-generated-types/proposal.md
- D:/Overwatch專案/openspec/changes/adopt-supabase-generated-types/design.md
- D:/Overwatch專案/openspec/changes/adopt-supabase-generated-types/tasks.md
- D:/Overwatch專案/openspec/changes/adopt-supabase-generated-types/specs/type-safety/spec.md
Key source files (read for grounding):
- D:/Overwatch專案/src/app/actions/browse.ts (rowToCard, view query)
- D:/Overwatch專案/src/app/actions/profile.ts (base table read/write)
- D:/Overwatch專案/src/app/actions/developer.ts (projection select + RPC + magic string at line ~191)
- D:/Overwatch專案/src/types/card.ts (OWPlayerCard domain type)
- D:/Overwatch專案/src/lib/supabase/{client,server}.ts
- D:/Overwatch專案/supabase/migrations/015_*, 017_* (view definition)

Context worth knowing:
- C1 (already applied to PROD DB) masks public_profiles.social_channels to booleans {"discord":true}; base table profiles.social_channels stays as account strings {"discord":"u#1234"}. Supabase generated types make BOTH `Json`, so tsc cannot distinguish string vs boolean.
- The repo migrations (015/017) still show the UN-masked view → known prod-vs-repo drift (out of C2 scope).

Critique specifically (score each 1-10 + verdict PASS/REVISE/BLOCK):
1. Type boundary design: is keeping OWPlayerCard as an anti-corruption layer correct, or should we collapse to generated Row types? Any over-engineering or under-engineering?
2. social_channels handling (design decision 3): is the single-helper coercion sound? Does it risk a privacy regression (real account strings leaking to the public square) that tsc won't catch? Is there a safer typing that would catch it?
3. Will injecting createClient<Database> surface latent bugs (projection .select, .single, RPC Returns) that the task list under-scopes? List any specific call site the tasks miss.
4. The magic-string fix (PLACEHOLDER_BATTLE_TAG, decision 4): adequate, or is the underlying "completed profile" definition itself fragile enough to warrant flagging as tech debt?
5. Acceptance criteria + verification steps: sufficient to guarantee "behavior unchanged"? Is `npm run build` 0 errors enough, or do we need a runtime smoke (square social icons, profile save/load)?
6. Any "remove the as" that is actually a SEMANTICALLY CORRECT narrowing that the design wrongly marks as removable (false positive), or vice versa?

Output: per-item score + verdict, then a prioritized list of MUST-FIX (M1..Mn) before APPLY, then NICE-TO-HAVE. Be adversarial; find the failure mode the author missed.
>>>)
```

## OPTIONAL Gemini 第二臂（§6.8 D7，team lead 視需要）

如要 perspective-diverse 雙審，team lead 可同 prompt 並行：
`Agent(subagent_type="gemini:gemini-rescue", run_in_background=True)` 審同 4 artifacts，→ §6.8 Council Mode 合成。

---

## Team lead ready-to-run 指令清單（orchestrator 無法執行的部分）

```bash
# 1. 生成型別（orchestrator 無 Supabase MCP，由 team lead 跑）
mcp__supabase__generate_typescript_types   # project cxoncanfveqtfofcqyqe
#   → 輸出存成 D:/Overwatch專案/src/types/database.ts

# 2. openspec 驗證（Stage 7）
cd "D:/Overwatch專案" && openspec validate adopt-supabase-generated-types --strict

# 3. 並行發起 Codex review（見上方 prompt）+ 視需要 Gemini

# 4. APPLY 階段驗收
cd "D:/Overwatch專案" && npm run build          # 0 errors
```
