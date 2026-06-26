# Design - 新增鬥陣特攻新英雄 Shion (死怨)

## Experience Goal

玩家在建立或瀏覽名片時，能夠無縫地選擇並展示新英雄「死怨」，並且其個人名片卡片能呈現符合該英雄黑暗賽博龐克風格的視覺漸層與圖案，讓新英雄在平台上與既有英雄享有同等精緻的呈現品質。

## Hero Registry Configuration

在 `src/data/mockPlayers.ts` 中，將 Shion 註冊至 `HEROES_CONFIG` 陣列：

```typescript
export const HEROES_CONFIG: HeroConfig[] = [
  // ... 其他既有英雄
  {
    id: 'shion',
    name: '死怨',
    role: 'damage',
    imageUrl: '/images/heroes/full/shion.png' // 指向本地端去背立繪
  }
];
```

## Theme Color Design

在 `src/data/heroBackgrounds.ts` 的 `HERO_THEME_COLORS` 中新增 Shion 的主題色彩配置。

配合 Shion 的背景（智械軀殼、橋本組長老、利爪成員、John Wick 般的動作賽博風格），採用**深暗紫色底色**搭配**霓虹桃紅/鮮紅色**的微光光暈：

```typescript
export const HERO_THEME_COLORS: Record<string, { primary: string; secondary: string; theme: 'light' | 'dark' }> = {
  // ... 其他既有英雄
  shion: { 
    primary: '#1a092a',   // 深紫黑，作為卡片基本色底與首層漸層
    secondary: '#ff2a5f', // 霓虹桃紅，作為主要代表色與光暈發光色
    theme: 'dark'         // 暗色主題（使文字呈現對比亮色）
  }
};
```

## Static Assets Specifications

專案中需確認以下靜態檔案位置正確且檔案有效：
1. **頭像檔案**：`public/images/heroes/avatars/shion.png`
   - 解析度為正方形，且已去背。
   - 於名片編輯器、名片卡片小頭貼中使用。
2. **全身/半身立繪**：`public/images/heroes/full/shion.png`
   - 高解析度去背 PNG。
   - 於名片卡片背景、詳細資料頁背景中渲染。
