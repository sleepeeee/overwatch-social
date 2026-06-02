## ADDED Requirements

### Requirement: Real Gamer Avatar Integration
玩家名片卡片 SHALL 渲染使用者設定的真實大頭貼圖片，而不使用單個中文字的圓形文字貼紙。

#### Scenario: Display real avatars on cards
- **WHEN** 系統渲染首頁底部玩家卡片
- **THEN** 卡片左側顯示該玩家的真實頭貼圖片 (與 profile 頁面的 `avatar_url` 同步)

### Requirement: Layout Auto Shrink and Overflow Protection
卡片的發言文字框都 SHALL 進行高度收窄，且遊戲/角色標籤 SHALL 移至姓名下方，防止卡片被撐爆跑版。

#### Scenario: Layout overflow protection check
- **WHEN** 卡片顯示超長遊戲/角色標籤（如 `VALORANT • Reyna`）
- **THEN** 標籤自動呈現在姓名下方，且發言框高度固定在 `56px`，卡片在任何螢幕寬度下都 100% 不會撐爆溢出

### Requirement: Slide-In River Animation
當有新的玩家卡片加入時，名片列表 SHALL 展現從左邊滑動推移更新的流滑效果。

#### Scenario: Real-time matched gamer slide-in
- **WHEN** 新玩家卡片被推入到最前方
- **THEN** 最左側卡片會觸發 `slide-in` 自左滑入動畫，平滑推移舊卡片，最舊卡片從右側淡出滑走
