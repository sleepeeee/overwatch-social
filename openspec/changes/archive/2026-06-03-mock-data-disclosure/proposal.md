## Why

ValorantSquare 和 LoLSquare 的假卡片（MOCK_VAL_PLAYERS / MOCK_LOL_PLAYERS）外觀與真實 OW 廣場玩家完全相同，無任何 mock 標示。Tab 按鈕雖有「即將開放」badge，但進入 tab 後的卡片本體看起來是真實可互動的玩家，用戶可能誤以為已有真實玩家可配對。

## What Changes

- ValorantSquare / LoLSquare 假卡片頂部加橘色「⚠ 示範資料 — 非真實玩家」banner
- 假卡片套用 `opacity-70 pointer-events-none select-none`，視覺上明確為非互動佔位卡

## Capabilities

### Modified Capabilities

- `browse-valorant-square`：假卡片加 mock 標示，防止用戶誤判
- `browse-lol-square`：同上

## Impact

- **修改**：`src/components/square/ValorantSquare.tsx`
- **修改**：`src/components/square/LoLSquare.tsx`
