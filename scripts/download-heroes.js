const fs = require('fs');
const path = require('path');
const https = require('https');

// 設定路徑
const mockPlayersPath = path.join(__dirname, '../src/data/mockPlayers.ts');
const outputDir = path.join(__dirname, '../public/images/heroes');
const fallbackSource = path.join(outputDir, 'silhouette.png');

console.log('🚀 開始執行鬥陣特工英雄圖片自動化本地下載...');

// 確保輸出目錄存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 讀取 mockPlayers.ts
if (!fs.existsSync(mockPlayersPath)) {
  console.error(`❌ 找不到 mockPlayers.ts，路徑: ${mockPlayersPath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(mockPlayersPath, 'utf-8');

// 強固的正則表達式，用來匹配 HEROES_CONFIG 內部的英雄物件
// 支援單引號、雙引號、多行格式與換行空白
const heroRegex = /\{\s*id:\s*['"]([^'"]+)['"](?:,\s*|\s+)name:\s*['"]([^'"]+)['"](?:,\s*|\s+)role:\s*['"]([^'"]+)['"](?:,\s*|\s+)imageUrl:\s*['"]([^'"]+)['"]\s*\}/g;

const heroes = [];
let match;
while ((match = heroRegex.exec(fileContent)) !== null) {
  heroes.push({
    id: match[1],
    name: match[2],
    role: match[3],
    url: match[4]
  });
}

console.log(`📊 共解析出 ${heroes.length} 位特工設定。`);

if (heroes.length === 0) {
  console.warn('⚠️ 解析出的特工數量為 0！請檢查正則表達式或 mockPlayers.ts 格式。');
}

// 下載單張圖片的 Promise 封裝
function downloadImage(hero) {
  return new Promise((resolve) => {
    const targetPath = path.join(outputDir, `${hero.id}.png`);
    
    // 如果圖片已經存在（如預設的 silhouette.png 或已下載），且不是虛擬角色，可選擇跳過，但為了確保純淨，我們直接下載
    console.log(`⏳ 正在下載 [${hero.name}] (${hero.id}) -> ${hero.url}`);
    
    const request = https.get(hero.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://playoverwatch.com/'
      },
      timeout: 10000 // 10秒超時
    }, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(targetPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✅ [${hero.name}] 下載成功！`);
          resolve(true);
        });
      } else {
        console.warn(`⚠️ [${hero.name}] 請求失敗，狀態碼: ${response.statusCode}。將啟用備用剪影。`);
        applyFallback(hero);
        resolve(false);
      }
    });

    request.on('error', (err) => {
      console.warn(`⚠️ [${hero.name}] 網路連接失敗: ${err.message}。將啟用備用剪影。`);
      applyFallback(hero);
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      console.warn(`⚠️ [${hero.name}] 下載超時。將啟用備用剪影。`);
      applyFallback(hero);
      resolve(false);
    });
  });
}

// 降級備用機制：複製 silhouette.png
function applyFallback(hero) {
  const targetPath = path.join(outputDir, `${hero.id}.png`);
  if (fs.existsSync(fallbackSource)) {
    try {
      fs.copyFileSync(fallbackSource, targetPath);
      console.log(`🛡️  已為 [${hero.name}] 套用機密特工備用剪影。`);
    } catch (e) {
      console.error(`❌ 無法套用備用剪影給 [${hero.name}]: ${e.message}`);
    }
  } else {
    console.error(`❌ 找不到預設備用剪影檔，請確認 silhouette.png 是否存在於: ${fallbackSource}`);
  }
}

// 佇列執行下載，避免同時打幾十個連線被 CDN 封鎖
async function run() {
  const batchSize = 5; // 每批下載 5 張
  for (let i = 0; i < heroes.length; i += batchSize) {
    const batch = heroes.slice(i, i + batchSize);
    await Promise.all(batch.map(hero => downloadImage(hero)));
  }
  console.log('🎉 鬥陣特工所有英雄圖片本地整合完畢！');
}

run();
