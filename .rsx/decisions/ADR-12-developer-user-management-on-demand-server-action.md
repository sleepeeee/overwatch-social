---
id: ADR-12
title: 開發者用戶管理使用 on-demand Server Action（click to load），而非 server props 預先載入
status: Accepted
date: 2026-06-02
references_to: [REF-005, REF-006, F-012]
referenced_by: [F-012]
---

## 背景

`developer-console-enhancements` change 新增「用戶管理」tab，需在開發者後台列出所有用戶 profiles 並支援搜尋。

初始設計候選方案兩個：
- **方案 A（server props）**：在 `developer/page.tsx`（Server Component）呼叫 `getAllProfilesForDeveloper()`，
  把結果作為 props 傳給 `DeveloperConsoleClient`，頁面進入時立即載入。
- **方案 B（on-demand）**：`DeveloperConsoleClient` 維護本地 loading state，
  用戶點擊「用戶管理」tab 時才呼叫 `getAllProfilesForDeveloper()` Server Action。

§6.7 Gemini 初審（4/10）將「預先載入全部 profiles 作為 props」列為 Critical C2 問題。

## 決策

採用**方案 B（on-demand Server Action）**：

```typescript
// DeveloperConsoleClient.tsx
const [usersData, setUsersData] = useState<ProfileRow[] | null>(null);
const [usersLoading, setUsersLoading] = useState(false);
const [usersError, setUsersError] = useState<string | null>(null);

const handleTabClick = async (tab: TabType) => {
  setActiveTab(tab);
  if (tab === "users" && usersData === null) {
    setUsersLoading(true);
    try {
      const result = await getAllProfilesForDeveloper();
      if (result.success) setUsersData(result.data ?? []);
      else setUsersError(result.error ?? "載入失敗");
    } catch {
      setUsersError("載入失敗");
    } finally {
      setUsersLoading(false);
    }
  }
};
```

`developer/page.tsx` 只呼叫 `getHeroStats()`（輕量聚合查詢），不預載 profiles。

## 理由

| 考量 | 選擇依據 |
|---|---|
| 頁面載入效能 | 用戶管理 tab 不是最常使用的 tab（Overview 是預設），預載 100 筆 profiles 每次進入都浪費 |
| Server Component 職責 | Server Component 只應預載「首屏必要資料」；tab content 屬於延遲載入範疇 |
| UX 感知 | 點擊 tab 後 spinner 比整頁 loading slow 更符合用戶預期（局部 loading） |
| 搜尋整合 | on-demand 模式天然支援 server-side 搜尋（每次搜尋觸發新的 Server Action call），server props 模式則需前端 filter |
| 可擴展性 | 未來若需分頁（page > 1），on-demand 模式直接擴展 startIndex 參數；server props 需改動 page.tsx 介面 |

## 取捨 / 已知 Debt

- on-demand 模式的初次載入有一次 round-trip 延遲（tab click → Server Action → setState）；
  若未來發現用戶管理是高頻使用 tab，可考慮切回 server props 預載。
- `usersData === null` 用作「尚未載入」哨兵；`usersData = []` 表示「已載入但無資料」。
  此區分確保 tab 切換後不重複載入（only-once semantics）。
- 搜尋框 onChange 觸發新的 Server Action call（server-side ilike），
  搭配 `useTransition` 避免 UI freeze（見 F-012）。

## 影響範圍

- 新增：`src/app/actions/developer.ts`：`getAllProfilesForDeveloper(search?: string)`
- 修改：`src/app/developer/DeveloperConsoleClient.tsx`：on-demand state + tab click handler + users tab UI
- 修改：`src/app/developer/page.tsx`：移除 allProfiles props，只傳 heroStats
- 新增：`supabase/migrations/004_developer_profiles_policy.sql`：開發者跨用戶 SELECT policy

## 相關 ADR / Finding / REF

- REF-005：記錄開發者後台功能空白（用戶管理為其中一項）
- REF-006：Supabase RLS developer policy 模式（on-demand 搜尋的 DB 權限基礎）
- F-012：client-side search 在分頁查詢上的設計缺陷（本 ADR 採用 server-side search 的原因）
