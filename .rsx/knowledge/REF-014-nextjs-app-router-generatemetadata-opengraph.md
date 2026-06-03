---
id: REF-014
type: docs
title: Next.js App Router generateMetadata + Open Graph 社群分享 meta
url: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
status: active
version: "Next.js 15+"
last_updated: 2026-06-03
official: true
references_to: [REF-002]
referenced_by: [F-007, ADR-07, F-018]
---

## 摘要

Next.js App Router 的 `generateMetadata` 允許在 Server Component 動態生成 Open Graph 等 SEO/社群分享 meta tags。這是讓分享連結在 Discord、LINE、Twitter 等平台顯示預覽卡的標準方式。

## 基本用法

```typescript
// app/share/[id]/page.tsx（Server Component）
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await getPublicProfile(id);
  if (!player) return { title: "找不到名片 | OW Social" };

  return {
    title: `${player.battle_tag} 的 OW 名片 | OW Social`,
    description: player.message || "查看這位特工的遊戲名片",
    openGraph: {
      title: `${player.battle_tag} 的 OW 名片`,
      description: player.message || "查看這位特工的遊戲名片",
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/${player.selected_heroes[0]}.png` }],
      type: "profile",
    },
  };
}
```

## og:image 的絕對 URL 要求

**重要**：og:image 必須是絕對 URL（包含 domain），相對路徑（`/images/...`）在社群平台 crawler 上無效。

解決方案：使用環境變數 `NEXT_PUBLIC_SITE_URL`（Vercel 需設定為 `https://overwatch-social.vercel.app`）。

```typescript
const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/images/heroes/avatars/${heroId}.png`;
```

本地開發（`process.env.NEXT_PUBLIC_SITE_URL` 未設定）時 og:image 會是相對路徑，僅影響本地預覽測試，不影響生產環境。

## Server Component vs Client Component 邊界

`generateMetadata` 只能在 Server Component（無 `"use client"` 指令）中使用。若頁面需要 Client 端互動（如 DOM 操作、html-to-image），需要拆分：

```
page.tsx        ← Server Component（generateMetadata + 資料取得）
  └── ShareCardClient.tsx  ← Client Component（接收 cardData prop，DOM 操作）
```

## twitter:card 格式

- `summary`：小圖預覽（適合頭像大小的 400x400 圖片）
- `summary_large_image`：大圖預覽（需要 630x630+ 的圖片）

英雄頭像（約 400x400）適合 `summary` 格式。

## 引用場景

- `share-page-completion` change 的核心技術依據
- `player/[id]/page.tsx` 的 og:image 補充
- `layout.tsx` 全站 og meta 設計
