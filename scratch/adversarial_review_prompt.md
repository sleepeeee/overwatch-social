# §6.5 對抗式審查 (Adversarial Review)

請對 `share-page-completion` change 進行 §6.5 對抗式審查。

## 審查重點：
1. 安全性：getPublicProfile 查 public_profiles view 是否有隱私問題？
2. og:image 絕對 URL：env var 未設定時的 fallback 行為是否正確？
3. ShareCardClient 接收 OWPlayerCard（無 social_channels）是否影響 OWCard 渲染？
4. share 頁 anon 可讀：是否有任何 auth guard 需要移除？

## 變更文件參考：
- Proposal: [proposal.md](file:///D:/Overwatch專案/overwatch-social/openspec/changes/share-page-completion/proposal.md)
- Design: [design.md](file:///D:/Overwatch專案/overwatch-social/openspec/changes/share-page-completion/design.md)
- Spec: [spec.md](file:///D:/Overwatch專案/overwatch-social/openspec/changes/share-page-completion/specs/share/spec.md)
- Tasks: [tasks.md](file:///D:/Overwatch專案/overwatch-social/openspec/changes/share-page-completion/tasks.md)

請評估以上 4 點是否存在漏洞、隱性風險或設計瑕疵，並給出 1-10 分的嚴重度評級 (Critical/Major/Minor)。
