## ADDED Requirements

### Requirement: 全站曜石暗夜星河背景 (Obsidian Cosmic Glow Background)
系統 **SHALL** 確保全域 `body` 擁有 `#030206` 的曜石黑實體背景底色，且其行內背景 **MUST** 使用 `backgroundImage` 載入 `var(--theme-bg-gradient)` 曜石暗夜星塵漸變，不 **SHALL** 使用簡寫 `background` 屬性以防隱式重置背景底色。

#### Scenario: 全站曜石背景底色與發光漸層正常重疊
- **WHEN** 使用者在瀏覽器中載入 OW Social 的任何頁面時
- **THEN** 系統將 `layout.tsx` 中 `body` 的 `backgroundColor` 強制設為 `#030206`
- **AND** 將 `backgroundImage` 設為 `var(--theme-bg-gradient)` 曜石星河漸變

---

### Requirement: 全域常駐星空粒子背景 (Global Cosmic Particles Background)
系統 **SHALL** 在全域 `layout.tsx` 中常駐渲染 `<CosmicParticlesBackground />`，且該元件的 Canvas **MUST** 具備 `fixed inset-0 pointer-events-none z-0 opacity-80` 定位，以確保粒子在所有頁面上無縫漂浮且不被重複渲染所打斷。首頁與個人檔案頁面中重複的粒子背景宣告 **SHALL** 被移除。

#### Scenario: 跨頁面時星塵粒子維持無縫飄動
- **WHEN** 使用者從首頁（INTRO）跳轉至展示館（LOBBY）或工作室（STUDIO）時
- **THEN** 全域渲染的星空粒子 Canvas 維持重繪，粒子不因頁面跳轉而重新初始化，且沒有任何多重背景粒子覆蓋

---

### Requirement: 完整 Logo SVG 星宿細節與動態 (Complete Cosmic Logo SVG & Animations)
系統的 `CosmicFullLogo` 元件 **SHALL** 包含完整的北極星星芒 (`main-star`)、行星小星軌道 1 與逆向旋轉軌道 2 (`planetary-orbit-1`, `planetary-orbit-2`)，並且 SVG **MUST** 套用 `<g transform="translate(32, 25) scale(0.92)">` 容器，以防在高解析度螢幕或不同容器中 SVG 被生硬裁剪。

#### Scenario: Logo SVG 在大螢幕下完整呈現且具備星宿動態
- **WHEN** 系統渲染 `CosmicFullLogo` 元件時
- **THEN** 北極星星芒觸發 `glowPulse` 脈衝發光與 `rotateStar` 緩慢旋轉
- **AND** 行星 1 與行星 2 分別順時針及逆時針繞行
- **AND** SVG 內容物被包在 `scale(0.92)` 容器中，四周邊界無任何裁切
