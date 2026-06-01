const fs = require('fs');
const path = require('path');

// 定義路徑
const HEROES_DIR = path.join(__dirname, '..', 'public', 'images', 'heroes');
const AVATARS_DIR = path.join(HEROES_DIR, 'avatars');
const FULL_DIR = path.join(HEROES_DIR, 'full');
const EXTERNAL_FULL_DIR = 'D:\\AI\\overwatch\\hero_images';
const SILHOUETTE_PATH = path.join(HEROES_DIR, 'silhouette.png');

console.log('🚀 開始整理鬥陣特工特工圖片資源 (Scheme A)...');

// 1. 初始化與建立目錄
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}
if (!fs.existsSync(FULL_DIR)) {
  fs.mkdirSync(FULL_DIR, { recursive: true });
}

// 2. 轉換全身立繪檔名規則函數
function convertFilename(originalName) {
  // 去除 .png 與 OW2_ 字首
  let name = originalName.replace(/\.png$/i, '').replace(/^OW2_/i, '');
  
  // 處理特殊轉換
  if (name === 'D_Va') return 'dva';
  if (name === 'Soldier__76') return 'soldier-76';
  
  // 一般轉換：底線轉連字號，大寫轉小寫
  name = name.replace(/_/g, '-').toLowerCase();
  
  return name;
}

// 3. 搬移頭貼圖片 (把原本在 heroes/ 下的小寫圖片移到 avatars/)
if (fs.existsSync(HEROES_DIR)) {
  const files = fs.readdirSync(HEROES_DIR);
  let moveCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(HEROES_DIR, file);
    const stat = fs.statSync(filePath);
    
    // 只搬移檔案，排除子資料夾、README.txt 與 silhouette.png
    if (stat.isFile() && file.endsWith('.png') && file !== 'silhouette.png') {
      const destPath = path.join(AVATARS_DIR, file);
      fs.renameSync(filePath, destPath);
      moveCount++;
    }
  });
  console.log(`📦 頭貼搬移完成！已將 ${moveCount} 個頭貼歸檔至 heroes/avatars/。`);
}

// 4. 掃描與複製外部全身立繪
if (fs.existsSync(EXTERNAL_FULL_DIR)) {
  const files = fs.readdirSync(EXTERNAL_FULL_DIR);
  let copyCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.png') && file.startsWith('OW2_')) {
      const srcPath = path.join(EXTERNAL_FULL_DIR, file);
      const targetId = convertFilename(file);
      const destPath = path.join(FULL_DIR, `${targetId}.png`);
      
      fs.copyFileSync(srcPath, destPath);
      copyCount++;
    }
  });
  console.log(`✨ 立繪轉換與搬移完成！已將 ${copyCount} 個立繪對齊並複製至 heroes/full/。`);
} else {
  console.error(`⚠️ 找不到外部立繪目錄: ${EXTERNAL_FULL_DIR}`);
}

// 5. 實施 Fallback 機制，對齊所有的 avatars 和 full
if (fs.existsSync(AVATARS_DIR)) {
  const avatarFiles = fs.readdirSync(AVATARS_DIR);
  let fallbackCount = 0;
  
  avatarFiles.forEach(file => {
    if (file.endsWith('.png')) {
      const id = file.replace(/\.png$/i, '');
      const fullImagePath = path.join(FULL_DIR, file);
      
      // 如果 full 目錄下沒有對應的全身立繪，則使用 silhouette.png 兜底
      if (!fs.existsSync(fullImagePath)) {
        if (fs.existsSync(SILHOUETTE_PATH)) {
          fs.copyFileSync(SILHOUETTE_PATH, fullImagePath);
          fallbackCount++;
        } else {
          console.error(`❌ 找不到最底層的兜底檔案 silhouette.png！無法進行降級處理。`);
        }
      }
    }
  });
  console.log(`🛡️ Fallback 良率防禦完成！已為 ${fallbackCount} 位沒有大立繪的特工複製了機密剪影。`);
}

console.log('🎯 特工圖片整理圓滿完成！');
