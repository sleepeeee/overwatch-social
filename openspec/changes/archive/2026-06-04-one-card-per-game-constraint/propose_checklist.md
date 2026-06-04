# propose_checklist: one-card-per-game-constraint

## §6.1 Stage 0 動機定位

| 項目 | 結果 |
|---|---|
| 執行者 | Claude Sonnet 4.6（inline，無 Codex dispatch）|
| Why now 分析 | 完成：VAL/LoL 接入前加約束，防靜默資料覆蓋 |
| 跳過原因 | 輕量 change，主代理直接分析；無外部 API 調用必要性 |

## §6.5 Stage 6 最終審查

| 項目 | 結果 |
|---|---|
| 執行者 | Claude Sonnet 4.6（inline adversarial review）|
| P0 風險 | `getPublicProfile .single()` multi-row 問題 → 已加 Known Limitations |
| P1 風險 | saveDisplayName 無 game → 已在 spec 覆蓋 |
| 評分估計 | 8/10（範疇清晰，known limitations 明確標注）|

## §6.7 APPLY 完成審查

| 項目 | 結果 |
|---|---|
| 執行者 | Claude Sonnet 4.6（inline，APPLY 完成後）|
| Migration 014 | ✅ profiles_user_game_unique (type=u) DB 驗證確認 |
| profile.ts 三處 | ✅ getMyProfile/saveProfile/saveDisplayName 全更新 |
| Build | ✅ npm run build 無錯誤 |
| 評分 | 9/10 |

## Claim 前置檢查

跳過，理由：.rsx/claims/ 目錄為空

## REF 清單

- REF-019: profiles schema 遷移路徑
- REF-020: Supabase upsert onConflict 複合鍵
- REF-021: PostgreSQL PK 遷移安全步驟（共 3 個，≥ min_refs_per_propose=3 ✓）
