💡 技術決策說明：
本專案採用《鬥陣特工》官方 Next-gen 雲端透明背景高解析度 WebP 立繪（Blizzard 官方 CDN）。
這能確保玩家卡片在載入時享受到 3A 級遊戲的極致視覺質感，且防範本機專案體積過大（節省 Git Bandwidth 方便協作）。

若後續有本機載入需求，可將去背 WebP 英雄立繪置於此目錄下，檔名需與 `src/data/mockPlayers.ts` 中的 `imageUrl` 對應。
