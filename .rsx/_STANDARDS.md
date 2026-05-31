# rsx — REF-NNN 多型別知識點 Schema

> 本檔是 rsx 知識點的單一規範來源。任何 schema 修改只動本檔，並同步 `config.yaml` 的 `schema:` 段。
> 對應 OpenSpec spec：`rsx-knowledge`。

---

## §1 ID 與命名規則

### §1.1 ID 格式

- 字面：`REF-NNN`，NNN 為三位數補零（`REF-001`、`REF-042`、`REF-128`）
- 範圍：`REF-001` ~ `REF-999`
- 遞增：新 REF 取「目前最大 ID + 1」

### §1.2 檔名格式

```
REF-NNN-kebab-title.md
```

- `kebab-title` 為英文小寫 + 連字號（ASCII only）；中文標題另寫進 frontmatter `title:`
- 範例：
  - `REF-001-why-rsx.md`
  - `REF-042-tanuma-2018-phi1-formula.md`
  - `REF-128-pentaglyph-per-dir-claude-md.md`

---

## §2 共用 core 欄位（所有 type 必填）

```yaml
---
id: REF-NNN
type: github | docs | blog | paper      # 四種之一（可由 config.yaml 擴充）
title: ...                              # 顯示標題（允許中文）
url: ...                                # 原始來源 URL
status: active                          # 詳見 §5 lifecycle
references_to: []                       # 本 REF 引用了誰
referenced_by: []                       # 誰引用了本 REF（被引用方在同一次操作回填）
---
```

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | Y | `REF-NNN` 格式 |
| `type` | Y | 限制於 `config.yaml` `schema.types` 白名單（預設四種） |
| `title` | Y | 自由文字 |
| `url` | Y | 原始來源；無 URL 來源（如書籍）填 `book://<isbn>` 或 `n/a`；**空字串不合法** |
| `status` | Y | active / superseded / deprecated |
| `references_to` | Y | 陣列；無引用填 `[]` |
| `referenced_by` | Y | 陣列；無引用填 `[]` |

---

## §3 Type-specific Optional 欄位

四種預設 type 的可選欄位。新增 type 由 `config.yaml` `schema.custom_types` 擴充，欄位定義在此檔補一節。

### §3.1 type = github

```yaml
stars: 1200                           # 取樣當下的 star 數（snapshot）
last_commit: 2026-04-15               # 最後 commit 日期（ISO 8601）
language: TypeScript                  # 主要語言
license: MIT                          # license 字串
```

### §3.2 type = docs

```yaml
version: "1.4.2"                      # 文件對應的工具版本
last_updated: 2026-05-01              # 文件最後更新日期
official: true                        # 是否為官方文件（boolean）
```

### §3.3 type = blog

```yaml
author: ...                           # 作者名
published_date: 2026-03-21            # 文章發布日期
platform: Medium                      # Medium / Dev.to / Substack / 個人部落格 / ...
```

### §3.4 type = paper

```yaml
doi: 10.1234/abc.5678
year: 2024
venue: NeurIPS                        # 期刊或會議名
```

---

## §4 雙向 Crossref 規則

### §4.1 對稱性

任意兩個知識點 A、B：
- A 的 `references_to` 包含 B's id → B 的 `referenced_by` **必須**包含 A's id
- 反之亦然

### §4.2 跨類型引用

REF / ADR / Finding 之間皆遵守對稱規則。引用對象可以是：
- 另一個 REF（`REF-NNN`）
- ADR（`ADR-NN`）
- Finding（`F-NNN`）

### §4.3 同一次操作回填

每次建立新引用必須在同一次編輯動作內，把被引用方的 `referenced_by` 也補上。不允許「先建立、稍後補對稱」。

### §4.4 跨系統 crossref 說明

`.rsx/` 的 REF id 命名空間與 `.knowledge/`（research skill）的 REF id 命名空間**獨立**。
兩個系統中可能同時存在 `REF-001`，但代表不同文件，互不衝突。

**設計決策**：crossref 對稱驗證（`maintain.py check-crossref`）只在同系統內執行，不跨系統。

若需標記跨系統的語意關聯，可在 frontmatter 加可選欄位：
```yaml
related_refs: ["knowledge::REF-003"]  # 非強制，maintain.py 不做 dead-link 驗證
```

`related_refs` 的格式規範：`<namespace>::<id>`（例：`knowledge::REF-003`、`rsx::REF-010`）。
`maintain.py --knowledge-root` 對此欄位只做格式驗證（`::`分隔），不驗證目標文件是否存在。

---

## §5 Status Lifecycle

```
active ──────────→ superseded ──────────→ deprecated
   │                    │
   │                    └─ 被新版取代但仍有歷史價值
   │
   └─→ deprecated（過時、不再適用、來源失效）
```

| status | 意義 | 使用情境 |
|---|---|---|
| `active` | 目前有效 | 初始狀態 |
| `superseded` | 被新版/新來源取代 | frontmatter 須補 `superseded_by: REF-XXX` |
| `deprecated` | 不再適用 | 過時技術、來源失效、結論被推翻 |

**規則**：
- `superseded` 與 `deprecated` 的差別在於「有沒有可指向的後繼者」。有 → superseded；沒有 → deprecated。
- 任一 non-active 狀態下，`referenced_by` 仍須維持對稱（歷史引用不抹除）。

---

## §6 Body 章節結構

REF body 預設三段：

```markdown
## 摘要
（1-3 段，描述來源在說什麼）

## 對專案的啟示
（為什麼我們關心？對 init / explore / propose / apply / archive 哪個階段有用？）

## 引用場景
（在哪些 ADR / Finding / 後續 REF 會用到？）
```

可選額外段落：
- `## 風險 / Caveat`：來源的限制條件、不適用範圍
- `## 原文摘錄`：關鍵 quote（標頁碼 / 行號）

---

## §7 ID 遞增驗證

建立新 REF 前必先掃 `.rsx/knowledge/` 取目前最大 NNN：

```bash
ls .rsx/knowledge/ | grep -oE 'REF-[0-9]+' | sort -V | tail -1
```

若無任何 REF → 從 `REF-001` 開始。

---

## §8 與 OpenSpec spec 的對應

| 本檔段落 | spec requirement |
|---|---|
| §2 共用 core | `rsx-knowledge` REF-xxx 共用 core 欄位 scenario |
| §3 type-specific | `rsx-knowledge` type-specific optional 欄位 scenario |
| §4 雙向 crossref | `rsx-knowledge` crossref 對稱 scenario |
| §1 ID 與命名 | `rsx-knowledge` ID 遞增 scenario |

---

## §9 Claim Schema（Evidence Ledger）

每個 claim 為一個獨立 YAML 檔，存放於 `.rsx/claims/<claim_id>.yaml`。

### §9.1 Claim ID 命名規則

格式：`C-<DOMAIN>-NNN`

| DOMAIN（3-4 字大寫）| 代表領域 |
|---|---|
| `PLM` | 偏光顯微鏡 |
| `INV` | 逆問題反演 |
| `PHYS` | 物理建模 |
| `DL` | 深度學習 |
| `EXP` | 實驗驗證 |

**規則**：NNN 為三位數字補零（001-999）。新增 DOMAIN 需先 PR 修改此受控縮寫表。

---

### §9.2 完整欄位定義表

#### Mandatory 欄位（7 個）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `claim_id` | string | 格式 `^C-[A-Z]{3,4}-\d{3}$` |
| `claim_type` | enum | `empirical` \| `theoretical` \| `methodological` |
| `status` | enum | 見 §9.3 state machine（5 個值）|
| `confidence` | enum | `high` \| `moderate` \| `low` \| `very_low`（GRADE 四級）|
| `statement` | string | 非空，≥ 10 字的主張敘述 |
| `evidence` | list | evidence 物件列表（status ≥ collecting 時需 ≥ 1 筆）|
| `created_by_change` | string | 建立此 claim 的 change kebab-case（對應 OpenSpec active 或 archived change）|

#### Optional 欄位（含預設值）

| 欄位 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `tags` | list | `[]` | 受控詞彙（見下方表格）|
| `related_claims` | list | `[]` | 語意相關 claim_id 列表 |
| `superseded_by` | string | `null` | `status=superseded` 時必填 |
| `supersedes` | string | `null` | 若本 claim 取代舊 claim |
| `finding_ids` | list | `[]` | 對應 Finding ID（`F-NNN`）|
| `adr_ids` | list | `[]` | 相關 ADR ID（`ADR-NN`）|
| `created_date` | string | ISO 8601 | 自動填入 |
| `last_updated` | string | ISO 8601 | 每次更新 status/evidence 時更新 |
| `notes` | string | `""` | 自由文字備註 |

#### evidence 物件欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `evidence_id` | string | 本 claim 內遞增（E-001, E-002, ...）|
| `ref_id` | string | 必須對應存在的 REF-NNN |
| `stance` | enum | `supporting` \| `contradicting` \| `neutral` |
| `excerpt` | string | 關鍵引文 |
| `notes` | string | 量測條件、樣本說明等（可選）|

---

### §9.3 Status State Machine

```
       建立            ≥1 evidence            ≥2 supporting + confidence↑
proposed ─────► collecting ─────► verified
   │                │
   │                ├─────► refuted（contradicting 主導）
   │                │
   └──────────► superseded（任何狀態都可進入，終態）
                ▲
                │
            superseded_by 必填
```

| status | 意義 | 進入條件 | 允許轉移到 |
|---|---|---|---|
| `proposed` | 主張已提出，尚無 evidence | 建立 claim | collecting, superseded |
| `collecting` | 正在收集 evidence | `evidence[]` ≥ 1 筆 | verified, refuted, superseded |
| `verified` | evidence 充分支持 | ≥ 2 筆 supporting + confidence ≥ moderate | superseded |
| `refuted` | evidence 否定主張 | contradicting 主導 + 明確否定機制 | superseded |
| `superseded` | 被新 claim 取代（終態）| `superseded_by` 填新 claim_id | — |

---

### §9.4 evidence 列表規則

- `evidence[].ref_id` 必須對應 `.rsx/knowledge/REF-NNN-*.md` 或 `.knowledge/knowledge/REF-NNN-*.md` 中存在的檔案
- `status == superseded` → `superseded_by` 必填且引用的 claim_id 必須存在
- 空 evidence 列表在 status=proposed 下合法；status ≥ collecting 需 ≥ 1 筆

---

### §9.5 Validation Rules（由 `maintain.py check-claims` 執行）

| 規則 | 違規等級 |
|---|---|
| `claim_id` 不符 `^C-[A-Z]{3,4}-\d{3}$` | FAIL |
| `claim_type` 不在 enum | FAIL |
| `status` 不在 enum | FAIL |
| `confidence` 不在 enum | FAIL |
| `statement` 空或 < 10 字 | FAIL |
| `created_by_change` 缺失 | FAIL |
| mandatory 欄位任一缺失 | FAIL |
| `evidence[].ref_id` 對應檔案不存在（dangling reference）| WARN |
| `finding_ids[]` 對應 `F-NNN-*.md` 不存在 | WARN |
| `adr_ids[]` 對應 `ADR-NN-*.md` 不存在 | WARN |
| `status=superseded` 且 `superseded_by` 為 null | FAIL |
| `tags[]` 含受控詞彙表外的值 | WARN |

---

### §9.6 `_index.yaml` 格式

存放於 `.rsx/claims/_index.yaml`，由 `maintain.py rebuild-claims-index` 自動生成：

```yaml
last_updated: "2026-05-29T10:00:00Z"
total: 3
by_status:
  proposed: 1
  collecting: 1
  verified: 1
  refuted: 0
  superseded: 0
by_domain:
  PLM: 2
  INV: 1
claims:
  - claim_id: "C-PLM-001"
    status: collecting
    confidence: moderate
    statement_preview: "4H-SiC 差排密度可由..."
```

`_index.yaml` 為快照，實體 claim YAML 為 single source of truth。

**觸發時機**：
- archive 前：MANDATORY 自動 rebuild（`maintain.py check-claims --pre-archive`）
- apply task 完成後更新 claim：MANDATORY rebuild
- 建立/更新 claim 後：RECOMMENDED 手動跑

**Stale Detection**：`maintain.py check-claims` 比對 `last_updated` 與所有 claim YAML 的 mtime；任何 claim mtime > index → 視為 stale，archive gate 改即時掃實體檔案並報 WARN。

---

### §9.7 tags 受控詞彙表

`tags` 欄位必須從以下受控詞彙表選擇。新增詞彙需 PR 修改此段：

```yaml
tags_vocabulary:
  # 研究階段
  - process_engineering
  - instrumentation
  - simulation_validation
  - dataset_construction
  - model_architecture
  # 材料領域
  - sic_4h
  - sic_6h
  - gan
  # 量測技術
  - plm
  - xrd
  - tem
  - ebsd
  # 缺陷類型
  - bpd
  - ted
  - tsd
```

---

### §9.8 Cross-Reference Policy

claim 可引用三類知識點：

| 前綴 | 對應檔案位置 | 驗證 |
|---|---|---|
| `REF-NNN` | `.rsx/knowledge/REF-NNN-*.md` 或 `.knowledge/knowledge/REF-NNN-*.md` | 必須存在（dangling → WARN）|
| `F-NNN` | `.rsx/findings/F-NNN-*.md` 或 `.knowledge/findings/` | 必須存在（dangling → WARN）|
| `ADR-NN` | `.rsx/decisions/ADR-NN-*.md` 或 `.knowledge/decisions/` | 必須存在（dangling → WARN）|

`maintain.py check-claims --reverse <ID>` 動態反查「哪些 claim 引用指定的 REF/Finding/ADR」。不強制反向回填（REF/ADR/Finding schema 不變）。
