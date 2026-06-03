## Context

OverwatchSquare 為廣場探索頁面，目前 `loadPlayers` 函式在 browser 直接呼叫 Supabase SDK (`supabase.from('public_profiles')...`)，每個 user 造訪廣場都建立一條獨立 DB 連線。廣場的預設瀏覽（無搜尋關鍵字）流量占大多數，且內容短時間內高度重複，是典型可快取場景。

## Goals / Non-Goals

**Goals:**
- 廣場無搜尋路徑改由 Server Action 代理 DB 查詢，單一 server instance 快取 60s
- 消除 browser→Supabase 直連（無搜尋時），DB 連線數從 O(用戶數) 降為 O(server instances × 請求率/TTL)
- 有搜尋路徑行為不變，維持現有 Supabase 直連邏輯

**Non-Goals:**
- 跨 Vercel instance 的分散式快取（Redis/KV）— 超出本次 scope
- 廣場即時更新（WebSocket/Polling）— 60s 延遲於探索場景可接受
- Server Action 的 auth 限制 — `public_profiles` view 本身即為公開資料

## Decisions

### 決策 1：`unstable_cache` vs `React cache()`

| 方案 | 適用範圍 | 結論 |
|---|---|---|
| `unstable_cache` | Server Actions 從 Client Component 呼叫時可用；結果跨 request 持久化（TTL 內） | **採用** |
| `React cache()` | 僅在同一 render pass 內的 Server Components 共用；不能在 Server Actions 持久化 | 不適用 |

Server Action 由 Client Component（OverwatchSquare 是 `'use client'`）呼叫，`React cache()` 無法跨 request 保留，必須用 `unstable_cache`。

### 決策 2：TTL 60s

廣場為探索性場景，新名片最多延遲 60s 出現可接受；TTL 過長（e.g. 5min）對新用戶不友好，過短（e.g. 10s）快取命中率低，60s 為平衡點。

### 決策 3：分路條件 `searchQ.trim() === ""`

- 空搜尋 → 固定 query，可快取 → 呼叫 `getPublicProfiles` Server Action
- 非空搜尋 → 動態 query，快取命中率極低 → 維持直接 Supabase（現有邏輯不動）

分路在 `loadPlayers` 函式頂層判斷，維持單一入口，branch 清晰。

### 決策 4：快取 key 設計

```
["public-profiles", offset, server ?? "all", mic ?? "all"]
```

每個 filter 組合（offset + server + mic）獨立 cache entry，避免不同篩選條件的快取互相污染。searchQ 不進 key，因為有搜尋時完全繞過快取路徑。

### 決策 5：`toPlayerCard` mapper 中 `card_id` 的處理

`public_profiles` view 不含 `card_id` 欄位，改用 `user_id` 作為 `card_id` 替代值。Server Action 內部定義 mapper，不影響 OverwatchSquare 接收到的 `OWPlayerCard[]` 型別介面。

## Risks / Trade-offs

| 風險 | 緩解措施 |
|---|---|
| Vercel multi-instance：各 instance 各自快取，60s 視窗不同步 | 探索場景可接受輕微不一致；非核心數據一致性需求 |
| `unstable_cache` 名稱含 "unstable"，API 可能變動 | Next.js 15/16 已穩定使用；Vercel 官方文件推薦；若 API 變更 migration cost 低（集中在 browse.ts） |
| cache entry 數量爆炸（offset 分頁 × filter 組合） | offset 以 20 為步距，server/mic 各 ~10 種選項，最多 O(100) entries；in-memory 佔用極小 |
| Server Action cold start 延遲 | 快取命中後延遲與現有 browser 直連相近；首次請求略高但可接受 |

## Migration Plan

1. 建立 `src/app/actions/browse.ts`（新檔案，無破壞性）
2. 修改 `OverwatchSquare.tsx` 加入分路邏輯（import + loadPlayers 分支）
3. 部署至 Vercel Preview，DevTools Network 驗證無搜尋時無 browser→`supabase.co` 直接請求
4. 若驗收通過，合入 main 觸發 Production 部署

**Rollback**：還原 OverwatchSquare.tsx 至原始版本即可，browse.ts 可留存（不影響功能）。

## Open Questions

- 目前 `public_profiles` view 欄位清單是否包含 Server Action 需要的所有欄位（role, server, mic 等）？需在 apply 階段確認 schema。
