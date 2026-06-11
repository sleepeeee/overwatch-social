function createAfterMidnightReportForm() {
  const supportEmail = "aftermidnight.halo@gmail.com";
  const formTitle = "After Midnight Beta 回報表單";
  const formDescription =
    "請用這份表單回報錯誤、不當名片、資料刪除請求、建議或聯絡我們。\n\n" +
    "若需要站方回覆，請留下可聯絡方式。請不要送出你不想讓站方看到的私人資訊。";

  const form = FormApp.create(formTitle);
  form
    .setDescription(formDescription)
    .setConfirmationMessage(
      "已收到你的回報。若你有留下聯絡方式，After Midnight 會視情況透過品牌信箱回覆。"
    )
    .setAcceptingResponses(true)
    .setAllowResponseEdits(false);

  form
    .addMultipleChoiceItem()
    .setTitle("回報類型")
    .setHelpText("請選擇最接近的一種。")
    .setChoiceValues(["錯誤回報", "不當名片", "資料刪除請求", "提供建議 & 聯絡我們"])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle("聯絡方式")
    .setHelpText("若需要回覆，請填 Email 或 Discord。例如：" + supportEmail + " 或 name#0000。")
    .setRequired(false);

  form
    .addMultipleChoiceItem()
    .setTitle("發生問題的頁面")
    .setHelpText("如果不確定，選「其他」即可。")
    .setChoiceValues(["首頁", "展示館", "工作室", "玩家名片頁", "分享頁", "其他"])
    .setRequired(false);

  form
    .addParagraphTextItem()
    .setTitle("問題或建議描述")
    .setHelpText("請描述你看到什麼、按了什麼、預期應該發生什麼。")
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("重現步驟")
    .setHelpText("例如：進入展示館 > 點某張名片 > 手機畫面被裁切。")
    .setRequired(false);

  form
    .addTextItem()
    .setTitle("截圖或影片連結")
    .setHelpText("可貼 Google Drive、YouTube、Imgur、Discord 圖片連結。")
    .setRequired(false);

  form
    .addMultipleChoiceItem()
    .setTitle("裝置類型")
    .setChoiceValues(["手機", "平板", "電腦", "不確定"])
    .setRequired(false);

  form
    .addMultipleChoiceItem()
    .setTitle("瀏覽器")
    .setChoiceValues(["Chrome", "Safari", "Edge", "Firefox", "其他", "不確定"])
    .setRequired(false);

  const consent = form.addCheckboxItem();
  consent
    .setTitle("是否同意站方為處理此回報而查看你提供的內容")
    .setChoices([
      consent.createChoice("我同意 After Midnight 只為處理本次回報查看我提供的內容與聯絡方式。"),
    ])
    .setRequired(true);

  const responsesSheet = SpreadsheetApp.create("After Midnight Beta 回報回覆");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responsesSheet.getId());

  Logger.log("表單填寫連結：" + form.getPublishedUrl());
  Logger.log("表單編輯連結：" + form.getEditUrl());
  Logger.log("回覆試算表：" + responsesSheet.getUrl());
}
