<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
<!-- rsx:awareness:begin v=0.10.0 -->

## rsx 工作流程規範（Codex / AGY 跨宿主入口）

詳見 rsx skill 的 `sop/RSX_SOP.md`（所在路徑視當前 agent 而定）：

- `~/.codex/skills/rsx/sop/RSX_SOP.md`（Codex CLI；若不存在退到 `~/.claude/skills/rsx/sop/RSX_SOP.md`）
- `~/.gemini/antigravity/skills/rsx/sop/RSX_SOP.md`（Antigravity）

新對話載入順序：
1. 本檔（AGENTS.md）
2. `.rsx/notes/latest.md`（若有）
3. RSX_SOP.md §0-§6 主幹

## rsx init 磁石 token（loader 驗證用）

rsx-init-magnet-95c18389a44ee8b9

（此 token 為 per-init 唯一識別碼，用於驗證 Codex/AGY loader 是否真的讀取本檔案。）
<!-- rsx:awareness:end -->
