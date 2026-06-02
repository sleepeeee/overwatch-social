# Design: browse-quality-fixes

## Context

Next.js 15 App Router，全部修改都在 Client Components。無 DB schema 變更，無新路由。

## D1 — VAL/LoL 假資料：完全移除 vs 保留骨架

**決策**：保留 tab 骨架（讓使用者知道未來會有這個功能），但移除所有假玩家資料，改成 "coming soon" 畫面。

```tsx
// 新的 ValorantSquare（LoLSquare 同理）
export default function ValorantSquare() {
  return (
    <div className="w-full animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-col items-center justify-center py-20 px-8 gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#82b7cc]/10 border border-[#82b7cc]/20 flex items-center justify-center">
          <Target size={28} className="text-[#82b7cc]" />
        </div>
        <div className="space-y-2">
          <h3>特戰英豪廣場</h3>
          <p>VALORANT 玩家名片系統正在開發中。目前僅支援《鬥陣特工》廣場。</p>
        </div>
        <div className="... flex items-center gap-2">
          <Clock size={12} />
          敬請期待
        </div>
      </div>
    </div>
  );
}
```

**為何不直接隱藏 tab**：保留 tab 讓用戶了解平台路線圖，不讓他們誤以為功能被移除。

## D2 — Dead Code 刪除

直接 `rm` 兩個文件。同時更新 `CLAUDE.md` 的「已知 Dead Code」段落，移除對應記錄。

確認依據：
- `grep -r "Navbar" src/` → 只有 Navbar.tsx 自身，無其他 import
- `grep -r "AppSidebar" src/` → 只有 AppSidebar.tsx 自身，無其他 import

## D3 — Mock 資料提示條

```typescript
const [isShowingMockData, setIsShowingMockData] = useState(false);

// 在 loadPlayers() 的 else 分支：
setIsShowingMockData(true);
setPlayers(MOCK_PLAYERS);

// 在真實資料分支：
setIsShowingMockData(false);
setPlayers(realData);
```

**提示條設計**：放在篩選 ribbon 上方，橙黃色（`#d8a070`）低對比度，不搶眼但清楚。有真實資料時 `isShowingMockData = false`，提示條消失。

## D4 — useDevMode 使用 AuthContext

```typescript
// 改前：自己訂閱 onAuthStateChange
export function useDevMode(): DevModeState {
  const isDev = process.env.NODE_ENV === "development";
  const [state, setState] = useState<DevModeState>({
    isDeveloper: isDev,
    loading: !isDev
  });
  useEffect(() => {
    if (isDev) return;
    // ... onAuthStateChange 訂閱
  }, [isDev]);
  return state;
}

// 改後：消費 AuthContext
export function useDevMode(): DevModeState {
  const isDev = process.env.NODE_ENV === "development";
  const { user, authLoading } = useAuth();
  if (isDev) return { isDeveloper: true, loading: false };
  return {
    isDeveloper: user?.app_metadata?.role === "developer",
    loading: authLoading,
  };
}
```

**Flash 防護**：`DevModeBanner` 在 `loading: true` 時 render null（已有此邏輯），`authLoading` 從 AuthContext 來，在 INITIAL_SESSION 後即 false。不會出現意外閃爍。

## 實際時間估算

| Task | 預估 |
|---|---|
| VAL/LoL 改寫 | 10 min |
| Dead code 刪除 | 5 min |
| OverwatchSquare mock 提示 | 10 min |
| useDevMode 重構 | 10 min |
| Build 驗證 | 10 min |
| **合計** | **~45 min** |

Wall-clock < 1 hr，不觸發 Smoke Test。

## Rationale 表

| 決策 | 選擇 | 依據 |
|---|---|---|
| VAL/LoL | 保留 tab 骨架，移除假資料 | 維持路線圖透明度 |
| Dead code | 直接刪除 | grep 確認無任何 import |
| Mock 提示條 | `isShowingMockData` state | 最小侵入，不影響現有渲染邏輯 |
| useDevMode | useAuth() | REF-001 基準 + 消除重複訂閱 |
