---
id: REF-023
type: blog
title: "Admin 後台可展開用戶列表 UI 設計模式（DERIV）"
source: DERIV（基於 shadcn/ui 文件 + 現有 dev console 架構）
created: 2026-06-04
references_to:
  - REF-002
referenced_by:
  - user-identity-global-nickname/design.md
---

## 問題

Dev console 現有架構（DeveloperConsoleClient.tsx）以 tab 組織功能，用戶管理 tab 需要「兩層視圖」：
1. 第一層：用戶列表（nickname + ID + 遊戲清單）
2. 第二層：點展開後顯示各遊戲角色卡詳情

## shadcn/ui Collapsible 模式

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// 第一層 row
<Collapsible>
  <div className="flex items-center">
    <span>{nickname ?? `ID: ${userId.slice(0,8)}...`}</span>
    <span>{userId}</span>
    <GameBadges games={games} />
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">展開</Button>
    </CollapsibleTrigger>
  </div>
  
  {/* 第二層：lazy load */}
  <CollapsibleContent>
    <UserCardDetail userId={userId} />
  </CollapsibleContent>
</Collapsible>
```

## Lazy Load 設計

第二層展開時才 fetch，避免一次 load 所有用戶的所有卡片資料：

```tsx
// UserCardDetail: isOpen 時才 fetch
const [cards, setCards] = useState<OWPlayerCard[]>([])
const [loaded, setLoaded] = useState(false)

// 展開時 trigger fetch（useEffect on isOpen）
```

## Server Action 設計

```typescript
// 第一層：getAdminUserList()
// SELECT up.user_id, up.nickname, array_agg(p.game) as games
// FROM user_profiles up LEFT JOIN profiles p ON p.user_id = up.user_id
// WHERE nickname ILIKE '%query%' (when query provided)
// GROUP BY up.user_id, up.nickname
// ORDER BY MAX(p.updated_at) DESC NULLS LAST
// LIMIT 50 OFFSET offset

// 第二層：getAdminUserCards(userId)
// SELECT * FROM profiles WHERE user_id = userId
```

## 文獻空白標記

DERIV-2026-06-04：基於 shadcn/ui Collapsible API 文件和現有 DeveloperConsoleClient.tsx 架構推導。
