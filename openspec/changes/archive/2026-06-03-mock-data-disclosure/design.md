## Context

Browse 廣場有三個 tab：Overwatch（真實資料）/ Valorant（mock）/ LoL（mock）。VAL/LoL 卡片使用 browse-preview-card class，外觀完全仿照真實玩家卡片，無任何區分標示。REF-016 品質審計時已識別此問題，但當時未修復。

## Goals / Non-Goals

**Goals:**
- 每張假卡片頂部加醒目橘色 banner（文字 + 顏色雙重標示）
- 假卡片改為 non-interactive（pointer-events-none）並降低透明度（opacity-70）

**Non-Goals:**
- 接入真實 VAL/LoL 後端（另立 change）
- 改動 Tab 按鈕設計（已有「即將開放」標示）

## Architecture Decision

最小侵入修改：在每張卡片容器加 absolute positioned banner，不改動 MOCK_VAL_PLAYERS / MOCK_LOL_PLAYERS 資料結構。

## Key Files

- `src/components/square/ValorantSquare.tsx`
- `src/components/square/LoLSquare.tsx`
