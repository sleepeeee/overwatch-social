export type { UserProfile } from "@/types/auth";

/** 預設佔位 BattleTag（mock 預設值）；後台統計用於排除「未實際填寫」的名片。 */
export const PLACEHOLDER_BATTLE_TAG = "愛喝奶茶#3342";

export interface OWPlayerCard {
  card_id: string;           // 名片唯一 ID
  user_id: string;           // 關聯至 UserProfile.id 的外鍵
  server: string;            // 伺服器代號，例如: 'asia' | 'america' | 'europe'
  battle_tag: string;        // 玩家 BattleTag，例如: '愛喝奶茶#3342'
  is_tag_visible: boolean;   // BattleTag 隱私開關，若為 false 則在廣場顯示為 '已隱藏#xxxx'
  is_card_visible?: boolean; // 整張卡片可見性開關，若為 false 則整張卡從廣場/詳細頁消失（預設 true）
  is_draft?: boolean;        // 系統自動建檔的草稿（進編輯器未儲存）；第一次儲存後轉 false
  
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
    threads?: string;        // Threads 帳號
    rc_voice?: string;       // RC語音 ID/群組
    game_voice?: string;     // 遊戲內語音 BattleTag
  };
  
  mbti?: string;             // MBTI 人格特質 (可選)
  display_name?: string;     // 廣場顯示名稱（可選，未設定時前端 fallback 到 battle_tag）
  game?: string;             // 遊戲分區（'overwatch' | 'lol' | 'valorant'）
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

export interface HeroBackgroundConfig {
  gradient: string;          // CSS 漸層語法，例如 linear-gradient(...)
  glowColor: string;         // 徑向光暈的顏色 (rgba/hex)
  glowPosition?: string;     // 預設為 '50% 50%'
  theme: 'light' | 'dark';   // 用於自動適配名字標籤的對比度
  shapes: Array<{
    type: 'circle' | 'polygon' | 'stripes';
    className: string;       // Tailwind 類別，控制定位、不透明度與大小
    style?: Record<string, string | number>; // 支援自訂樣式
  }>;
}

