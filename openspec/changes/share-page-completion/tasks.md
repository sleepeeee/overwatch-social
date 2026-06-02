---
id: share-page-completion
type: tasks
---

# Tasks: share-page-completion

## Task 1 — 新增 `getPublicProfile()` Server Action

- [ ] 在 `src/app/actions/profile.ts` 新增：
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
- [ ] 驗收：TypeScript 無 error

## Task 2 — 建立 `ShareCardClient.tsx`（Client Component）

- [ ] 建立 `src/app/share/[id]/ShareCardClient.tsx`
- [ ] 從現有 `page.tsx` 搬移所有 `"use client"` 邏輯（useState / html-to-image / OWCard 渲染）
- [ ] Props：`{ cardData: OWPlayerCard }`（從 Server Component 接收真實資料）
- [ ] 在 Client Component 內用 `useAuth().user` 取登入狀態（不 hardcode isLoggedIn）
- [ ] 驗收：元件可接受 OWPlayerCard prop 並渲染 OWCard

## Task 3 — 重構 `page.tsx`（改為 Server Component）

- [ ] 移除 `"use client"` directive
- [ ] 加 `export async function generateMetadata({ params }: Props): Promise<Metadata>`：
  ```typescript
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const firstHero = player?.selected_heroes?.[0] ?? "ana";
  const ogImage = `${siteUrl}/images/heroes/avatars/${firstHero}.png`;
  return {
    title: `${player.battle_tag} 的 OW 名片 | OW Social`,
    description: player.message || player.tags?.join("、") || "查看這位特工的遊戲名片",
    openGraph: {
      title: `${player.battle_tag} 的 OW 名片`,
      description: player.message || "查看這位特工的遊戲名片",
      images: [{ url: ogImage }],
      type: "profile",
    },
    twitter: { card: "summary", images: [ogImage] },
  };
  ```
- [ ] `default export` 改為 async Server Component，呼叫 `getPublicProfile(id)` 並傳 `cardData` 給 `<ShareCardClient>`
- [ ] 不存在時顯示 404 訊息（不 `notFound()`，友善提示即可）
- [ ] 驗收：`rg '"use client"' src/app/share/[id]/page.tsx` 無命中

## Task 4 — 修改 `layout.tsx`（補全站 og meta）

- [ ] 讀取現有 `layout.tsx` metadata
- [ ] 加 `openGraph` 段：
  ```typescript
  openGraph: {
    siteName: "OW Social",
    locale: "zh_TW",
    type: "website",
    images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/images/heroes/avatars/ana.png` }],
  },
  twitter: { card: "summary" },
  ```
- [ ] 驗收：`rg "siteName.*OW Social" src/app/layout.tsx` 有命中

## Task 5 — 修改 `player/[id]/page.tsx`（og:image + 分享按鈕）

- [ ] `generateMetadata` 補 `openGraph.images`：
  ```typescript
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const firstHero = (player.selected_heroes as string[])?.[0] ?? "ana";
  const ogImage = `${siteUrl}/images/heroes/avatars/${firstHero}.png`;
  // 加入 openGraph: { images: [{ url: ogImage }] }
  ```
- [ ] 頁面加「分享名片」Link 按鈕（位於頁面底部或適當位置）：
  ```tsx
  <Link href={`/share/${id}`}>分享名片</Link>
  ```
- [ ] 驗收：`rg "分享名片" src/app/player/` 有命中

## Task 6 — TypeScript + 整合驗收（含 og:image HTML 確認）

- [ ] `npx tsc --noEmit` 無 error
- [ ] 訪問 `/share/{真實userId}` 顯示真實名片（非 mock）
- [ ] 確認 `NEXT_PUBLIC_SITE_URL` 已在 Vercel 設定（`https://overwatch-social.vercel.app`）
- [ ] **og:image 絕對 URL 驗收**：啟動 dev server 後：
  ```bash
  curl -s "http://localhost:3000/share/{userId}" | grep -o 'og:image.*content="[^"]*"'
  # 預期輸出含 domain，例如：og:image" content="https://overwatch-social.vercel.app/..."
  # 或 dev 環境允許相對 URL，但生產必須是絕對 URL
  ```
- [ ] 確認 `getPublicProfile` 可被 anon 呼叫（無 auth guard）
- [ ] 確認導出圖片功能正常（「保存此卡片為圖片」下載 PNG）
