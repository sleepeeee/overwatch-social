# 設計文件：開發者控制台與 UI 精緻化微調 (Developer Console & UI Refinements)

本文件詳細記錄了 UI 小細節微調、開發者白名單安全機制、以及開發者後台的功能架構設計。

---

## 1. UI 精緻化設計 (P1)

### 1.1 語音狀態圖示位置調整 (OWCard.tsx)

#### 【調整前 Layout (Before)】
在名片左下角，語音圖示緊密貼在語言列表後方，限制了語言文字寬度。
```
┌────────────────────────────────────────────────────────┐
│ 💬 留言                                                │
│ "這個玩家很懶，什麼都沒有留下..."                      │
│ ────────────────────────────────────────────────────── │
│ [Globe] 語言1、語言2... | [Mic]               [MBTI]  │
└────────────────────────────────────────────────────────┘
```

#### 【調整後 Layout (After)】
將麥克風狀態解耦，往右側移動，並改造成高辨識度的小膠囊 Badge。左側空間完整釋放給語言列表。
```
┌────────────────────────────────────────────────────────┐
│ 💬 留言                                                │
│ "這個玩家很懶，什麼都沒有留下..."                      │
│ ────────────────────────────────────────────────────── │
│ [Globe] 語言1、語言2、語言3      [Mic 語音膠囊]  [MBTI]  │
└────────────────────────────────────────────────────────┘
```

#### 【設計細節】
1.  **左側語言展示區**:
    *   保留 `Globe` 圖示。
    *   將文字 `max-w` 限制放寬至手機版 `140px` / 網頁版 `170px`，避免過早截斷。
    *   移除原本的左邊線 `border-l` 與麥克風圖示。
2.  **右側語音/MBTI區**:
    *   語音膠囊 (Mic Status Pill)：根據 `mic_status` 分為三種精美視覺配色：
        *   `mic-on` (可開麥): 背景 `emerald-500/8`，文字/圖示 `emerald-600`，邊框 `emerald-500/15`。
        *   `listen-only` (僅聽麥): 背景 `blue-500/8`，文字/圖示 `blue-600`，邊框 `blue-500/15`。
        *   `mic-off` (不用麥): 背景 `gray-500/8`，文字/圖示 `gray-500`，邊框 `gray-500/15`。
    *   膠囊內部顯示迷你圖示（`Mic` 或 `MicOff`，`size={11}`）與緊湊的繁體中文說明（「可開麥」、「僅聽麥」、「不用麥」）。
    *   此膠囊與 `MBTI` 徽章以 `gap-1.5` 水平並排。

---

### 1.2 底部導覽列精簡 (FloatingDock.tsx)

#### 【調整前 (Before)】
```
┌─────────────────────────────┐
│            lotus            │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│ │ ⌂ │ │ 🧭│ │ 👤│ │ ⚙ │     │
│ └───┘ └───┘ └───┘ └───┘     │
└─────────────────────────────┘
```

#### 【調整後 (After)】
```
┌─────────────────────────┐
│  ┌───┐   ┌───┐   ┌───┐  │
│  │ ⌂ │   │ 🧭│   │ 👤│  │
│  └───┘   └───┘   └───┘  │
└─────────────────────────┘
```

#### 【設計細節】
1.  **移除浮水印**: 刪除 `lotus` 手繪迷你水印的整個 `<div className="absolute -top-3 ...">lotus</div>` 區塊。
2.  **按鈕縮減**:
    *   移除 `navItems` 中 `id: "adjuster"` 的項目。
    *   將「廣場」標籤更名為「名片廣場」，「特工」更名為「個人檔案」，提升語意直覺性。
3.  **間距調整**:
    *   由於按鈕減為 3 顆，維持原 `flex` 容器設計即可自動完美收合。
    *   將內部按鈕間距改為 `gap-5` 或 `gap-6`，提升點擊與滑過時的微型手感。

---

## 2. 開發者白名單與自動化角色同步 (P2)

為了讓開發者後台擁有堅不可摧的安全防線，我們將採用「資料庫白名單 + 系統自動指派 Metadata Role」的雙重安全架構。

### 2.1 資料庫設計 (Postgres Migration SQL)
當有新開發者透過 Google 登入時，資料庫 trigger 將自動為其加上 `'developer'` 的角色標籤。這防範了用戶在前端篡改 JavaScript state。

```sql
-- 1. 建立白名單資料表
CREATE TABLE IF NOT EXISTS public.developer_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 啟用行級安全 (RLS)
ALTER TABLE public.developer_whitelist ENABLE ROW LEVEL SECURITY;

-- 僅允許 developer 角色的使用者操作白名單
CREATE POLICY "Allow developers full access to whitelist" 
  ON public.developer_whitelist
  FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');

-- 2. 建立自動化角色指派函數 (SECURITY DEFINER 確保擁有系統寫入權限)
CREATE OR REPLACE FUNCTION public.handle_developer_role_sync()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.developer_whitelist WHERE email = NEW.email) THEN
    -- 將 raw_app_meta_data 的 role 欄位原子化設為 "developer"
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"developer"'::jsonb
    );
  ELSE
    -- 非白名單用戶，確保其 role 不被誤設
    NEW.raw_app_meta_data = NEW.raw_app_meta_data - 'role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 掛載 Trigger 到 auth.users 表 (BEFORE INSERT OR UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_role_sync ON auth.users;
CREATE TRIGGER on_auth_user_role_sync
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_developer_role_sync();
```

---

## 3. 開發者控制台與功能移轉 (P3)

### 3.1 獨立開發者後台 (/developer)

我們將建立一個優雅精緻的暗色調（或高對比高科技感）控制台頁面 `src/app/developer/page.tsx`。

#### 【控制台系統架構圖 (System Architecture)】
```
[Client App] 
     │
     ├─▶ [/developer] 獨立頁面 
     │        │ 
     │        ▼ [Server Check: auth.getUser()]
     │   檢查 app_metadata.role === 'developer'
     │        ├─▶ [否] ──▶ redirect("/") 阻斷重導向
     │        └─▶ [是] ──▶ 渲染控制台 Dashboard
     │
     └─▶ [/profile] 個人頁面 ──▶ 偵測 useDevMode().isDeveloper ──▶ 顯示「進入後台」按鈕
```

#### 【Dashboard 內部版面配置】
*   **系統管理 Tab**: 顯示當前 Supabase 連線狀態、資料庫統計。
*   **白名單維護 Tab**: 顯示目前白名單列表，允許開發者直接在此處 `新增 / 移除` 授權 email。
*   **功能開關 Tab**: 系統全域開關（如維護模式、註冊限制等）。
*   **立繪對準儀 Tab**: 內嵌「精密對齊儀」工具，並移除原本外層的單獨路由。

---

### 3.2 對準儀功能安全移轉 (Migration of Adjuster)

1.  **檔案遷移**:
    *   將現有 `src/app/adjuster/page.tsx` 搬移至 `src/app/developer/adjuster/page.tsx` (或者將其作為 `src/app/developer/page.tsx` 底下的一個整合 Tab，後者能提供更為一致的單頁面體驗)。
    *   徹底刪除原本的 `src/app/adjuster/page.tsx`。
2.  **API / Action 雙重校驗**:
    *   微調對準儀的對齊參數保存 Server Action `saveHeroAlignments` (`src/app/actions/saveAlignment.ts` 或對應 Action 檔案)。
    *   在 Action 最頂端，加入伺服器端角色檢查：
        ```typescript
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.app_metadata?.role !== 'developer') {
          throw new Error("Unauthorized: Only developers can adjust alignments.");
        }
        ```
        這實現了「多層深度防禦」，即使有駭客繞過前端 UI，也絕對無法透過 POST 請求篡改資料庫中的英雄立繪縮放偏移參數！
