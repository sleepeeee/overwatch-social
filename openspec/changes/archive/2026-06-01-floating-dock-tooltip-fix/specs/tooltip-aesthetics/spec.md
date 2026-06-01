## ADDED Requirements

### Requirement: FloatingDock Tooltip No Wrap
下方導覽列（FloatingDock）的溫順氣泡提示文字在任何長度下都 SHALL 保持單行且不進行自動換行。

#### Scenario: Tooltip display
- **WHEN** 滑鼠懸停於 FloatingDock 的「個人檔案」或「名片廣場」等長標題按鈕上
- **THEN** 氣泡提示文字保持為單行「個人檔案」或「名片廣場」，沒有換行

### Requirement: FloatingDock Tooltip Horizontal Center
氣泡提示元件 SHALL 相對於其對應的按鈕維持水平置中。

#### Scenario: Tooltip position
- **WHEN** 滑鼠懸停於任何按鈕上
- **THEN** 氣泡提示的水平中心點與按鈕的水平中心點對齊
