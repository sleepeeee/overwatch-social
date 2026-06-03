## 1. ValorantSquare 修改

- [x] 1.1 卡片容器加 `relative` + 移除 `hover:-translate-y-1`，加 `opacity-70 pointer-events-none select-none`
- [x] 1.2 卡片頂部插入橘色 banner div（absolute inset-x-0 top-0，rounded-t-2xl）

## 2. LoLSquare 修改

- [x] 2.1 套用與 ValorantSquare 相同的修改

## 3. 驗收

- [x] 3.1 開啟 /browse → 切 Valorant tab → 確認橘色「⚠ 示範資料」banner 顯示
- [x] 3.2 切 LoL tab → 確認相同 banner 顯示
- [x] 3.3 切回 Overwatch → 確認無 banner（真實玩家正常顯示）
- [x] 3.4 TypeScript + build 驗證通過
