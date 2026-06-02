---
id: share-page-completion
type: design
---

# Design: share-page-completion

## Context

`/share/[id]/page.tsx` 由朋友加入，目前是 Client Component + mock 資料。要加上 `generateMetadata` 需要 Server Component，但導出圖片（`toPng`）需要 Client Component DOM 操作，形成架構衝突。

現有 `public_profiles` view 已對 anon 開放，ADR-08 確立 `social_channels` 不進 view（登入才可讀）。分享頁不需要 `social_channels`，適合直接查 view。

## Goals

- G1：`/share/{userId}` 顯示真實玩家名片（anon 可訪問）
- G2：分享連結在社群平台產生預覽卡（og:title + og:description + og:image）
- G3：保留「導出為圖片」功能（Client 端 html-to-image）
- G4：`/player/{id}` 有「分享名片」按鈕
- G5：layout.tsx 有全站 og meta 基礎

## Non-Goals

- NG1：不顯示 `social_channels`（share 頁是公開的，ADR-08 不允許進 public view）
- NG2：不實作動態圖片生成（`@vercel/og`），靜態 hero 頭像圖片足夠
- NG3：不改 `/share` 的 URL 結構（使用 `user_id` 作為 URL 參數，與現有 `/player/[id]` 一致）

## 架構決策

### D1：Server/Client Component 邊界

**選項 A（採用）**：Server Component 包 Client Component

```
src/app/share/[id]/
├── page.tsx            ← Server Component（generateMetadata + getPublicProfile）
└── ShareCardClient.tsx ← Client Component（導出圖片 DOM 操作）
```

page.tsx 取資料後以 prop 傳給 ShareCardClient.tsx，generateMetadata 在 Server 側執行。

**選項 B（拒絕）**：Client 截圖上傳 CDN
- 需要額外 CDN 上傳基礎設施，複雜度高，Gemini §6.1 指出此路徑讓本 change 假設失立

### D2：getPublicProfile Server Action

在 `profile.ts` 新增 `getPublicProfile(userId: string)`：
- 查 `public_profiles` view（anon 可讀，已有 GRANT）
- 回傳 `OWPlayerCard`，`social_channels` 設為 `{}`（share 頁不顯示）
- 不需認證（anon 可呼叫）

```typescript
export async function getPublicProfile(userId: string): Promise<OWPlayerCard | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!data) return null;
  return {
    card_id: `card-${data.user_id}`,
    user_id: data.user_id as string,
    server: data.server as string,
    battle_tag: data.battle_tag as string,
    is_tag_visible: data.is_tag_visible as boolean,
    selected_heroes: (data.selected_heroes as string[]) ?? [],
    tags: (data.tags as string[]) ?? [],
    message: (data.message as string) ?? "",
    languages: (data.languages as string[]) ?? [],
    mic_status: data.mic_status as OWPlayerCard["mic_status"],
    social_channels: {},
    mbti: (data.mbti as string) ?? undefined,
  };
}
```

### D3：og:image 格式

**靜態路徑 + 絕對 URL**（REF-014 確立）：
- 英雄頭像 51 張已在 `public/images/heroes/avatars/`
- 絕對 URL：`${process.env.NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/${heroId}.png`
- Fallback：若無英雄選擇，用 `${NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/ana.png`（最常見英雄）
- `twitter:card = "summary"`（400x400 頭像圖片）

**env var 要求**：`NEXT_PUBLIC_SITE_URL=https://overwatch-social.vercel.app` 已在 Vercel 設定（確認）。

### D4：layout.tsx og meta

加全站預設（當頁面無 generateMetadata 或覆蓋不完整時的 fallback）：
```typescript
openGraph: {
  siteName: "OW Social",
  locale: "zh_TW",
  type: "website",
  images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/ana.png` }],
},
twitter: { card: "summary" },
```

### D5：player/[id] 修改

1. `generateMetadata` 補 `openGraph.images`
2. 頁面底部加「分享名片」Link（`href="/share/{id}"`）

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` 未設定 | Low | Vercel 已設定；本地 og:image 不影響功能 |
| html-to-image + Google 頭像 CORS | Low | share 頁使用 public_profiles，social_channels 為空，無跨域頭像問題 |
| `is_tag_visible=false` 玩家 battle_tag 遮蔽 | Info | public_profiles view 已處理：顯示「隱藏#xxxx」|
| ShareCardClient 接收 isLoggedIn | Low | 從 `useAuth()` 取真實狀態，不 hardcode |

## Rationale 表

| 選擇 | 依據 |
|---|---|
| Server Component 包 Client Component | REF-014（generateMetadata 需要 Server Component）|
| 靜態 hero 頭像作 og:image | 已有 51 張本地圖片，無需 CDN；簡單可靠 |
| public_profiles view（anon 可讀）| REF-002（Supabase SSR）+ ADR-08（social_channels 不入 view）|
| social_channels: {} | share 頁是公開的，聯絡方式不公開（ADR-08）|
