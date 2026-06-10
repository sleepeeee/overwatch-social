# After Midnight Google 表單匯入指南

## 使用方式

Google 表單沒有穩定的原生匯入按鈕。請用 Apps Script 直接生成表單。

1. 打開 <https://script.google.com/>。
2. 建立新專案。
3. 刪掉預設的 `Code.gs` 內容。
4. 貼上 `docs/google-report-form-apps-script.gs` 的全部內容。
5. 儲存專案。
6. 在上方函式選單選擇 `createAfterMidnightReportForm`。
7. 按「執行」。
8. 第一次會要求 Google 授權，選擇你的品牌信箱帳號授權。
9. 執行完成後，打開左側「執行項目」或「執行紀錄」。
10. 複製以下三個連結：
    - 表單填寫連結
    - 表單編輯連結
    - 回覆試算表

## 生成後要檢查的設定

| 設定 | 建議 |
| --- | --- |
| 收集電子郵件地址 | 關閉，讓玩家自行選擇是否留下聯絡方式。 |
| 限制為同一組織使用者 | 關閉，不然外部玩家可能不能填。 |
| 允許編輯回覆 | 關閉 |
| 顯示進度列 | 可關閉，第一版欄位不多。 |
| 回覆通知 | 建議你在回覆試算表開啟通知，方便收到新回報。 |

## 生成出的欄位

| 順序 | 欄位名稱 | 類型 | 必填 |
| --- | --- | --- | --- |
| 1 | 回報類型 | 單選 | 是 |
| 2 | 聯絡方式 | 簡答 | 否 |
| 3 | 發生問題的頁面 | 單選 | 否 |
| 4 | 問題或建議描述 | 段落 | 是 |
| 5 | 重現步驟 | 段落 | 否 |
| 6 | 截圖或影片連結 | 簡答 | 否 |
| 7 | 裝置類型 | 單選 | 否 |
| 8 | 瀏覽器 | 單選 | 否 |
| 9 | 是否同意站方為處理此回報而查看你提供的內容 | 核取方塊 | 是 |

## 接回網站

生成表單後，把「表單填寫連結」設定到環境變數：

```env
NEXT_PUBLIC_REPORT_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSc6M3udnINVt5H2NpZbzFteZHC0Pb94DLmptplxDcSAmKMBSw/viewform
```

品牌信箱目前是：

```text
aftermidnight.halo@gmail.com
```
