## ADDED Requirements

### Requirement: 交友廣場卡片之薄膜微光玻璃擬態效果 (Thin-Film Interference Outpost Card Effect)
系統的交友廣場卡片 **SHALL** 具備微光薄膜玻璃擬態效果。背景色採用莫蘭迪沙灰色半透覆蓋，當使用者將滑鼠懸停 (Hover) 於卡片上時，卡片 **MUST** 觸發朝陽金黃微光邊框（`border-color: rgba(245, 212, 107, 0.8)`）與柔和發光陰影，且整個轉變過渡動畫 **MUST** 平滑，且為純 CSS 實現。

#### Scenario: 卡片滑鼠懸停觸發薄膜微光
- **WHEN** 使用者將游標滑過卡片時
- **THEN** 系統以 0.3s cubic-bezier 漸變將卡片背景白提升，邊框色漸變為朝陽金黃微光，且卡片微升 4px
