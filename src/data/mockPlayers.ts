import { OWPlayerCard, PresetTag, HeroConfig } from '../types/card';

// 1. 後台預設標籤庫 (最多選3個)
export const PRESET_TAGS: PresetTag[] = [
  { id: 'team-first', text: '團隊至上', type: 'info' },
  { id: 'main-tank', text: '主坦玩家', type: 'warning' },
  { id: 'push-payload', text: '一起推車！', type: 'success' },
  { id: 'rank-grind', text: '快樂排位', type: 'danger' },
  { id: 'chill-game', text: '輕鬆歡樂', type: 'default' },
  { id: 'voice-chat', text: '語音交流', type: 'success' },
  { id: 'deathmatch', text: '只玩死鬥', type: 'info' },
  { id: 'no-rage', text: '拒絕暴躁', type: 'success' },
  { id: 'have-mic', text: '有麥克風', type: 'warning' },
  { id: 'lfg', text: '招募隊友', type: 'danger' },
];

// 2. 常用《鬥陣特工》英雄配置（採用官方透明去背高解析度半身立繪 URL）
export const HEROES_CONFIG: HeroConfig[] = [
  {
    id: 'winston',
    name: '溫斯頓',
    role: 'tank',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/bltbeeb27cd8eb54366/62fc03b6dc091511c75cbfb9/winston-portrait.png'
  },
  {
    id: 'tracer',
    name: '閃光',
    role: 'damage',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blteca64c5d3cb8dc96/62fc03b413deab1204d60c49/tracer-portrait.png'
  },
  {
    id: 'genji',
    name: '源氏',
    role: 'damage',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blt0b343831b1513a07/62fc03ab4e09f511ca3a4ee7/genji-portrait.png'
  },
  {
    id: 'dva',
    name: 'D.Va',
    role: 'tank',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blte4ab4ff4fa12fcbb/62fc03a743a51411516f4df2/dva-portrait.png'
  },
  {
    id: 'mercy',
    name: '慈悲',
    role: 'support',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blt463b27bdf408018e/62fc03b1e3deab1204d60c41/mercy-portrait.png'
  },
  {
    id: 'kiriko',
    name: '霧子',
    role: 'support',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blt0dfa6c76476cf993/6323cfdfb12e3e10ab672688/kiriko-portrait.png'
  },
  {
    id: 'ana',
    name: '安娜',
    role: 'support',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blt3f1f7d54e4df97b7/62fc03a3d537f111f18fc43f/ana-portrait.png'
  },
  {
    id: 'reinhardt',
    name: '萊因哈特',
    role: 'tank',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blt1cbdfa5392cf0815/62fc03b211ab9c11f7c32bf2/reinhardt-portrait.png'
  },
  {
    id: 'reaper',
    name: '死神',
    role: 'damage',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/blte816bdf6312a0230/62fc03b2323cc6120892fb5a/reaper-portrait.png'
  },
  {
    id: 'cassidy',
    name: '卡西迪',
    role: 'damage',
    imageUrl: 'https://images.blz-contentstack.com/v3/assets/blt9c12f249594b3d99/bltc5d4c82b0577a760/62fc03a7cdc058117769cf3c/cassidy-portrait.png'
  }
];

// 3. 5~10 個精美的預設玩家名片 Mock 資料
export const MOCK_PLAYERS: OWPlayerCard[] = [
  {
    id: 'player-akira',
    server: 'Asia Server',
    battle_tag: '愛喝奶茶#3342',
    is_tag_visible: true,
    selected_heroes: ['winston', 'tracer', 'genji'],
    tags: ['團隊至上', '主坦玩家', '一起推車！'],
    message: 'GGWP！一起加油，推車到底啦 🚀 遇到會玩的隊友真的超開心！',
    languages: ['繁體中文', '简体中文', 'English'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'akira#1234',
      steam: '98765432',
      x: '@akira_ow'
    },
    mbti: 'INFJ'
  },
  {
    id: 'player-lily',
    server: 'Asia Server',
    battle_tag: '機甲少女莉莉#4321',
    is_tag_visible: true,
    selected_heroes: ['dva', 'mercy', 'kiriko'],
    tags: ['輕鬆歡樂', '拒絕暴躁', '語音交流'],
    message: '主玩 D.Va / 慈悲！希望能找個會輸出的大哥一起雙排 🌸 RK目前黃金，快樂打遊戲不氣餒！',
    languages: ['繁體中文'],
    mic_status: 'listen-only',
    social_channels: {
      discord: 'lily_ow',
      line: 'lilyline'
    },
    mbti: 'ENFP'
  },
  {
    id: 'player-genjigod',
    server: 'America Server',
    battle_tag: '有神快拜#1111',
    is_tag_visible: false, // 對外隱藏
    selected_heroes: ['genji', 'reaper', 'cassidy'],
    tags: ['快樂排位', '只玩死鬥', '招募隊友'],
    message: '忍術！竜神の剣を喰らえ！DPS專精玩家，尋求保我的慈悲/安娜，拒絕擺爛！',
    languages: ['English', '繁體中文'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'genjigod_ow'
    },
    mbti: 'ESTP'
  },
  {
    id: 'player-fish',
    server: 'Europe Server',
    battle_tag: '只想當鹹魚#2222',
    is_tag_visible: true,
    selected_heroes: ['ana', 'kiriko', 'mercy'],
    tags: ['團隊至上', '拒絕暴躁', '有麥克風'],
    message: '專職輔助，安娜睡針很準！隊友不送我就能奶得住 💉 歡迎心態成熟的玩家一起排位。',
    languages: ['繁體中文', 'English'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'fish_support',
      steam: '12345678'
    },
    mbti: 'INFJ'
  },
  {
    id: 'player-hardt',
    server: 'Asia Server',
    battle_tag: '萊因哈特本哈#8888',
    is_tag_visible: true,
    selected_heroes: ['reinhardt', 'winston', 'dva'],
    tags: ['主坦玩家', '團隊至上', '一起推車！'],
    message: '盾牌不倒，青春不老！大錘專精，衝鋒陷陣！求個安娜連體嬰。',
    languages: ['繁體中文'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'hardt_main',
      line: 'hardtline'
    },
    mbti: 'ESFJ'
  },
  {
    id: 'player-reaper',
    server: 'America Server',
    battle_tag: '幽靈死神#6666',
    is_tag_visible: true,
    selected_heroes: ['reaper', 'genji', 'cassidy'],
    tags: ['快樂排位', '輕鬆歡樂', '招募隊友'],
    message: '死神繞後專精，快速清後排。平日晚上都會在線，歡迎組隊。',
    languages: ['English'],
    mic_status: 'mic-off',
    social_channels: {
      discord: 'reaper_main'
    },
    mbti: 'ISTJ'
  }
];

export const SERVER_OPTIONS = ['Asia Server', 'America Server', 'Europe Server'];
export const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];
export const LANGUAGE_OPTIONS = ['繁體中文', '简体中文', 'English', '日本語', '한국어'];
export const MIC_OPTIONS = [
  { value: 'mic-on', label: '可開麥交流 🎤' },
  { value: 'listen-only', label: '僅能聽麥 🎧' },
  { value: 'mic-off', label: '不用語音 🔇' }
];
export const SOCIAL_PLATFORMS = [
  { id: 'discord', label: 'Discord', placeholder: 'Discord 帳號 (如: user#1234)' },
  { id: 'steam', label: 'Steam', placeholder: 'Steam 好友代碼 (如: 12345678)' },
  { id: 'x', label: 'X (Twitter)', placeholder: '𝕏 帳號 (如: @username)' },
  { id: 'line', label: 'Line', placeholder: 'Line ID' }
];
export const OVERWATCH_RANKS = ['青銅', '白銀', '黃金', '白金', '鑽石', '大師', '宗師', '五百強'];
