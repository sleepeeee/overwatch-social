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
    id: 'ana',
    name: '安娜',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png'
  },
  {
    id: 'anran',
    name: '安燃',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/2c38b41d79a1ce9a08b9ad8eb7edf3ff819bd448af16a5815be8c7fdb7203aa0.png'
  },
  {
    id: 'ashe',
    name: '艾希',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94.png'
  },
  {
    id: 'baptiste',
    name: '巴帝斯特',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680.png'
  },
  {
    id: 'bastion',
    name: '壁壘機兵',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4ede795c2a681aaccfa72d0c901cba0cb8a2c292fd6a97b2ba9faed161c2d184.png'
  },
  {
    id: 'brigitte',
    name: '碧姬',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0.png'
  },
  {
    id: 'cassidy',
    name: '卡西迪',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9240cd64cc8ef58df9acbf55204ab1b5d8578f743fda5931f0dbccbd75ab841b.png'
  },
  {
    id: 'domina',
    name: '多米娜',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/1161c112292c56c052c0ae711792fcde06e3251b98bc9709e582dd7585b5dcd6.png'
  },
  {
    id: 'doomfist',
    name: '毀滅拳王',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ff5c54f43ad253c7faeda9c4ed31d42582ea6b19205d197866f3dd0c0aa14c16.png'
  },
  {
    id: 'dva',
    name: 'D.Va',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png'
  },
  {
    id: 'echo',
    name: '迴音',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4f2d5b0c2b7e82d61353186c5f23152ccba9d3569b50839aa580dca3e9114ba.png'
  },
  {
    id: 'emre',
    name: '伊默',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c51e2f698138861c0e3b6cfab3c3ca9d67fd709be175e7c397aa6f2649712a30.png'
  },
  {
    id: 'freja',
    name: '弗蕾亞',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/811963897c352d9f178bec882d94bd0281074feee7c429c5145b6b8ea8ebe862.png'
  },
  {
    id: 'genji',
    name: '源氏',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8.png'
  },
  {
    id: 'hanzo',
    name: '半藏',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5.png'
  },
  {
    id: 'hazard',
    name: '災害',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ca48b96dbae6ea7f58ce8a5e73513c8c62b1685bdbf258020fb78bb21a008b5f.png'
  },
  {
    id: 'illari',
    name: '伊拉里',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4.png'
  },
  {
    id: 'jetpack-cat',
    name: '火箭貓',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/03a184cd0de27091e0099ac22635ad9615a8f6997881a5c25cc5f2444764f729.png'
  },
  {
    id: 'junker-queen',
    name: '垃圾鎮女王',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/06eeecb359f311f43a8f5121d4f9f3a93c565d70b30e94ef543c05596c9a39dc.png'
  },
  {
    id: 'junkrat',
    name: '炸彈鼠',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/7660b9fc6f25f30858fdd8797fe0d52b2306f1e78fef99843f58a274e69af046.png'
  },
  {
    id: 'juno',
    name: '朱諾',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0.png'
  },
  {
    id: 'kiriko',
    name: '霧子',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d.png'
  },
  {
    id: 'lifeweaver',
    name: '織命',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/3376515cebed0904012e67e956f6d1b9c12e03da642845eeaf787b7e4c7b339d.png'
  },
  {
    id: 'lucio',
    name: '路西歐',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png'
  },
  {
    id: 'mauga',
    name: '莫加',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/33d39bb439c08975197fc52eff4874716839711b5356c4fdc174f9c24bac1d0e.png'
  },
  {
    id: 'mei',
    name: '小美',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4a55ced3bd597fb08e0fde9dc007f8543ac616ba98ca3db9b0e4d871a8ae17f8.png'
  },
  {
    id: 'mercy',
    name: '慈悲',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab.png'
  },
  {
    id: 'mizuki',
    name: '瑞稀',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a9733c2367e0cbd70b9316fd2e1e17028653ec56d0051ea6ff098531dc4f99fc.png'
  },
  {
    id: 'moira',
    name: '莫伊拉',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de.png'
  },
  {
    id: 'orisa',
    name: '歐瑞莎',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6.png'
  },
  {
    id: 'pharah',
    name: '法拉',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/60ac2d5de4a6d34644d8872233da402f1436c87f804bb11a21661bb30bf4a51f.png'
  },
  {
    id: 'ramattra',
    name: '拉瑪塔',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ddef7c9fb8ce4256e8508196b486f81950efe7aaa6cf27fec4668beb4cd15774.png'
  },
  {
    id: 'reaper',
    name: '死神',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9.png'
  },
  {
    id: 'reinhardt',
    name: '萊因哈特',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e.png'
  },
  {
    id: 'roadhog',
    name: '攔路豬',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03.png'
  },
  {
    id: 'sierra',
    name: '席艾拉',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4bfd3d8b95844231115cb5bf4db03344c71bc3e865189c52403b2dc51438e63a.png'
  },
  {
    id: 'sigma',
    name: '席格馬',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d.png'
  },
  {
    id: 'sojourn',
    name: '索潔恩',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889.png'
  },
  {
    id: 'soldier-76',
    name: '士兵76',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png'
  },
  {
    id: 'sombra',
    name: '駭影',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/47727b02a16e3bd7b2447d86ae1edf11587bc320b2aecb4f2f16a7ca4ad4e8a0.png'
  },
  {
    id: 'symmetra',
    name: '辛梅塔',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ebec57e8bd68b3d4383edfeb34f8f52dd0b94a6467d594c2fee722e8a97c32aa.png'
  },
  {
    id: 'torbjorn',
    name: '托比昂',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce17118cedc29b0d2ac1e059666bed36b9531c85079b0b894bb402d12c917ba9.png'
  },
  {
    id: 'tracer',
    name: '閃光',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png'
  },
  {
    id: 'vendetta',
    name: '宿怨',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/cf8ffb52b6f315546d5e94e9d6defad5a2c570798776956de23f47536f9529da.png'
  },
  {
    id: 'venture',
    name: '無畏',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/dcab9123f5f55df22e54d4e797de43c71b917e0149dd059a7fd6136f48464cd0.png'
  },
  {
    id: 'widowmaker',
    name: '奪命女',
    role: 'damage',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259.png'
  },
  {
    id: 'winston',
    name: '溫斯頓',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png'
  },
  {
    id: 'wrecking-ball',
    name: '火爆鋼球',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png'
  },
  {
    id: 'wuyang',
    name: '無漾',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4959500b495b35c0908be2abda56b53f2601b2c5cc39a1cfde8df1bffd38d66d.png'
  },
  {
    id: 'zarya',
    name: '札莉雅',
    role: 'tank',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080.png'
  },
  {
    id: 'zenyatta',
    name: '禪亞塔',
    role: 'support',
    imageUrl: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d1546b1541a8afc39353f9337a408d6275a141b0432b7e560ef61579996b0fc.png'
  }
];

// 3. 5~10 個精美的預設玩家名片 Mock 資料
export const MOCK_PLAYERS: OWPlayerCard[] = [
  {
    id: 'player-hevelius',
    server: 'Asia Server',
    battle_tag: 'Hevelius#1777',
    is_tag_visible: true,
    selected_heroes: ['ana', 'zenyatta', 'kiriko'],
    tags: ['團隊至上', '拒絕暴躁', '輕鬆歡樂'],
    message: '每天清晨用色彩和安娜的睡針開啟新畫布 🎨 尋找溫和有心態的輸出特工一起快樂組排！',
    languages: ['繁體中文', 'English'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'hevelius#7777'
    },
    mbti: 'INFJ'
  },
  {
    id: 'player-solange',
    server: 'Asia Server',
    battle_tag: 'Solange#2888',
    is_tag_visible: true,
    selected_heroes: ['tracer', 'dva', 'mercy'],
    tags: ['有麥克風', '團隊至上', '招募隊友'],
    message: '哈囉特工！我是插畫家 Solange。專精閃光與碧姬，希望能找到一起歡樂推車的好拍檔！',
    languages: ['繁體中文', '简体中文'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'solange#8888',
      x: '@solange_riddle'
    },
    mbti: 'ENFP'
  },
  {
    id: 'player-aurum',
    server: 'Asia Server',
    battle_tag: 'Aurum#9999',
    is_tag_visible: true,
    selected_heroes: ['genji', 'hanzo', 'reaper'],
    tags: ['招募隊友', '拒絕暴躁', '語音交流'],
    message: '冷靜專注。目標宗師，主玩源氏與死神。不常開麥但配合度極高，輸贏皆平常心。',
    languages: ['繁體中文', 'English'],
    mic_status: 'listen-only',
    social_channels: {
      discord: 'aurum#9999'
    },
    mbti: 'INTJ'
  },
  {
    id: 'player-meteor',
    server: 'Asia Server',
    battle_tag: '流星#5542',
    is_tag_visible: true,
    selected_heroes: ['baptiste', 'kiriko', 'lucio'],
    tags: ['團隊至上', '有麥克風', '拒絕暴躁'],
    message: '主輔助巴帝斯特/霧子！喜歡跟坦克打戰術配合，心態良好拒絕暴躁，歡迎加好友排位！',
    languages: ['繁體中文'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'meteor#5542'
    },
    mbti: 'ENFJ'
  },
  {
    id: 'player-chronos',
    server: 'Asia Server',
    battle_tag: '時空特工#7761',
    is_tag_visible: true,
    selected_heroes: ['tracer', 'ashe', 'soldier-76'],
    tags: ['輕鬆歡樂', '語音交流', '招募隊友'],
    message: '主玩閃光艾希！每天休閒推車，輸贏都是一場精彩的冒險。',
    languages: ['繁體中文', 'English'],
    mic_status: 'mic-on',
    social_channels: {
      discord: 'chronos#7761',
      steam: '24681357'
    },
    mbti: 'ESFP'
  },
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
