export interface OWPlayerCard {
  id: string;                // 使用者唯一識別碼 (Supabase Auth ID / Mock ID)
  server: string;            // 伺服器，例如: 'Asia' | 'America' | 'Europe'
  battle_tag: string;        // 玩家 BattleTag，例如: '愛喝奶茶#3342'
  is_tag_visible: boolean;   // BattleTag 隱私開關，若為 false 則在廣場顯示為 '已隱藏#xxxx'
  
  // 英雄展示 (最多選 3 個常用英雄 ID，例如 'winston', 'tracer', 'genji')
  selected_heroes: string[]; 
  
  // 特色標籤貼紙 (最多 3 個，從預設選單中點選)
  tags: string[];            // 例如: ['團隊至上', '主坦玩家', '一起推車！']
  
  // 留言與語音
  message: string;           // 自我介紹留言，限制 100 字以內
  languages: string[];       // 溝通語言，例如: ['繁體中文', '简体中文', 'English']
  mic_status: 'mic-on' | 'listen-only' | 'mic-off'; // 語音狀態
  
  // 常用通訊軟體 (最少 1 個，最多 3 個)
  social_channels: {
    discord?: string;        // Discord 帳號
    steam?: string;          // Steam 好友代碼
    x?: string;              // X (Twitter) 帳號
    line?: string;           // Line ID
  };
  
  mbti?: string;             // MBTI 人格特質 (可選)
}

export interface PresetTag {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'default'; // 不同顏色的標籤貼紙
}

export interface HeroConfig {
  id: string;
  name: string;
  role: 'tank' | 'damage' | 'support';
  imageUrl: string;          // 立繪或頭像圖片路徑
}
