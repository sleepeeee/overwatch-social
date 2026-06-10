# tasks — audit-developer-capture-injection (C3)

> PROPOSE 產物。Task 0 audit 蒐證已由 team lead + sub-agent 完成並回填 design.md Evidence。
> 實作（測試檔 + npm script）為 APPLY 階段，由 team lead 主導。
> **核心原則**：不改 git.ts / developerCapture.ts / config.ts 的任何既有安全邏輯（karpathy 外科手術）。

## 0. Audit 蒐證 + 驗證（✅ 已完成）

- [x] 0.1 讀 `git.ts` → 確認 `promisify(execFile)` + 參數陣列（line 1-5, 102-118）
- [x] 0.2 讀 `config.ts` → 確認 `repositoryPath` 來自 `process.env.CAPTURE_REPO_PATH` + `assertSafeConfig` 驗絕對路徑（line 30-38, 52, 61）
- [x] 0.3 讀 `developerCapture.ts` → 確認三個 server action 不碰 shell、外部輸入只有 leftLabel/rightLabel 經 trim（全檔 96 行）
- [x] 0.4 grep 全 `src/` → `child_process`/`execFile`/`exec(`/`spawn`/`shell:true` 唯一出現在 `git.ts`（補充 2）
- [x] 0.5 **補充發現**：`scripts/recalculate-capture-meter.js:147-161` 是第二條 git 路徑，採相同 execFile + 陣列寫法（同樣安全），但其 `readTodayGitAuthorStats` 未 export
- [x] 0.6 經驗探針：execFile 餵惡意路徑 → git 把整串當單一目錄名、sentinel 未建立（design.md「經驗探針」）
- [x] 0.7 結論：**無漏洞要修**，三點 audit 全部成立。範圍轉為 regression 測試固化 + ADR/Finding

## 1. 撰寫 regression 測試（APPLY）

- [x] 1.1 建 `tests/unit/developer-capture-git-safety.test.mjs`（node:test + node:assert/strict，循 meter 測試風格）
- [x] 1.2 (A) 靜態斷言：讀 `git.ts` 原始碼，斷言 import `execFile`、不含 `execSync`/`spawn`/`shell:true`/裸 `exec(`（負向 lookbehind 排除 execFile）；對 `recalculate-capture-meter.js` 跑同組斷言
- [x] 1.3 (B) 注入行為斷言：與 git.ts:104 逐字對齊的 inline `execFile("git",["-C",path,"log",...])`，餵 `;`/`$()` 與 backtick 兩種惡意路徑 → `assert.rejects` + 斷言 sentinel 檔未建立；sentinel 走 `os.tmpdir()`
- [x] 1.4 (B-guard) skip-if-no-git：測試開頭探測 `execFile("git",["--version"])`，無 git 則 `it.skip`（避免沙箱環境問題誤判迴歸）
- [x] 1.5 (C) config/action 靜態斷言：`config.ts` 仍 `process.env.CAPTURE_REPO_PATH` + `path.isAbsolute` 守衛；`developerCapture.ts` 不含 `repositoryPath`/`child_process`/`git`

## 2. test runner 擴充（APPLY）

- [x] 2.1 `package.json` `test:unit` 由 `node tests/unit/developer-capture-meter.test.mjs` 改為 `node --test "tests/unit/*.test.mjs"`（**quoted glob 形式**，唯一非測試檔改動，僅動 npm script）。⚠️ **不可用裸目錄 `node --test tests/unit/`——本機 node 24/Windows 實測會失敗**（見 design.md Stage 4 自審校正）
- [x] 2.2 確認既有 meter 測試在新 runner 下仍全綠（sub-agent 已實測 `node --test "tests/unit/*.test.mjs"` → pass=5 fail=0，CJS default import 行為不變）

## 3. 驗收（APPLY）

- [x] 3.1 `npm run test:unit` 全綠（meter 既有測試 + 新 git-safety 測試；含 skip-if-no-git 守衛時 (B) 至少在有 git 環境通過）— **12/12 pass**（7 git-safety + 5 meter）
- [x] 3.2 **防迴歸驗證**：暫時把 oracle 改成 `exec("git -C " + path + " log")` 字串拼接 → 確認 (A) 與 (B) **FAIL**（sentinel 被建立），證明測試有防護力；驗證後還原
- [x] 3.3 `npm run build` 仍綠（無 source 邏輯變更，應不受影響）— **Compiled successfully, 16/16 static pages**
- [x] 3.4 確認 `git.ts` / `developerCapture.ts` / `config.ts` **零 diff**（git diff 驗證未動既有安全邏輯）

## 4. 第二意見（Stage 6，team lead 並行）

- [x] 4.1 team lead 用 design.md 內 Codex prompt 並行發起審查（今日 Codex 額度滿 → `Agent(subagent_type="gemini:gemini-rescue", run_in_background=True)`）；**sub-agent 未捏造評分** — Gemini §6.5 對抗式審查 PASS
- [x] 4.2 依審查結論：PASS → 進 APPLY 收尾 / 歸檔；NEEDS-WORK → 補測試覆蓋（如審查指出的遺漏注入面）；FAIL → 回報 team lead 不推進 — M1（B 斷言改部分匹配）+ M2（spec Requirement 2 加 threat model boundary Note）兩個小修補已完成

## 5. ARCHIVE 前置（ARCHIVE 階段）

- [x] 5.1 建 ADR-26（execFile + 參數陣列 + env 絕對路徑準則；草稿見 design 與本回報）
- [x] 5.2 建 F-027（audit-confirms-safe → characterization test 固化 pattern + 「無測試覆蓋的安全寫法等同未受保護」教訓）
- [x] 5.3 建 REF-027（Node child_process execFile vs exec shell 解析差異）
- [x] 5.4 雙向 crossref 回填（ADR-04 / F-004 referenced_by 加 ADR-26 / F-027；REF-027 referenced_by 加 ADR-26 / F-027）
- [x] 5.5 Pre-archive Gate（FAIL=0）+ latest.md Zone A/B 更新

---

## 驗收標準（明確化，供 APPLY 驗收循環）

| # | 標準 | 驗證方式 |
|---|---|---|
| AC1 | 新增 regression 測試通過，證明惡意 `repositoryPath` 不觸發 shell 執行 | `npm run test:unit` 綠；(B) sentinel 未建立 |
| AC2 | audit 結論文件化於 spec | `specs/capture-git-safety/spec.md` 三個 Requirement |
| AC3 | 不改動 `git.ts` / `developerCapture.ts` / `config.ts` 既有安全邏輯 | `git diff` 對三檔零變更（task 3.4） |
| AC4 | 測試具防迴歸力（非空殼） | task 3.2：把 oracle 換 exec 字串拼接 → 測試 FAIL |
| AC5 | `openspec validate audit-developer-capture-injection --strict` 通過 | team lead 執行（sub-agent 回報 plan） |
