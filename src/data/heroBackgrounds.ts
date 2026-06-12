import { HeroBackgroundConfig } from '../types/card';

// 🛡️ [Mitigation] 51位《鬥陣特攻》特工主要色彩對照資料庫 (Primary & Secondary Theme Colors)
export const HERO_THEME_COLORS: Record<string, { primary: string; secondary: string; theme: 'light' | 'dark' }> = {
  ana: { primary: '#607d8b', secondary: '#ebd496', theme: 'light' },
  anran: { primary: '#f44336', secondary: '#ff9800', theme: 'dark' },
  ashe: { primary: '#424242', secondary: '#d32f2f', theme: 'dark' },
  baptiste: { primary: '#00897b', secondary: '#80deea', theme: 'dark' },
  bastion: { primary: '#5d4037', secondary: '#8d6e63', theme: 'dark' },
  brigitte: { primary: '#ffb300', secondary: '#ff8f00', theme: 'light' },
  cassidy: { primary: '#8d6e63', secondary: '#b71c1c', theme: 'dark' },
  domina: { primary: '#37474f', secondary: '#78909c', theme: 'dark' },
  doomfist: { primary: '#4e342e', secondary: '#ff5722', theme: 'dark' },
  dva: { primary: '#ff85a2', secondary: '#42c2ff', theme: 'light' },
  echo: { primary: '#90caf9', secondary: '#e3f2fd', theme: 'light' },
  emre: { primary: '#795548', secondary: '#a1887f', theme: 'dark' },
  freja: { primary: '#ad1457', secondary: '#ec407a', theme: 'dark' },
  genji: { primary: '#1b1e1d', secondary: '#97ee00', theme: 'dark' },
  hanzo: { primary: '#1a237e', secondary: '#c5cae9', theme: 'dark' },
  hazard: { primary: '#004d40', secondary: '#26a69a', theme: 'dark' },
  illari: { primary: '#fbc02d', secondary: '#e65100', theme: 'light' },
  'jetpack-cat': { primary: '#ff9800', secondary: '#ffcc80', theme: 'light' },
  'junker-queen': { primary: '#006064', secondary: '#e0f7fa', theme: 'dark' },
  junkrat: { primary: '#ffb300', secondary: '#5d4037', theme: 'light' },
  juno: { primary: '#e91e63', secondary: '#80deea', theme: 'light' },
  kiriko: { primary: '#ec407a', secondary: '#ffffff', theme: 'light' },
  lifeweaver: { primary: '#f8bbd0', secondary: '#e91e63', theme: 'light' },
  lucio: { primary: '#4caf50', secondary: '#a5d6a7', theme: 'light' },
  mauga: { primary: '#b71c1c', secondary: '#ff8f00', theme: 'dark' },
  mei: { primary: '#03a9f4', secondary: '#e1f5fe', theme: 'light' },
  mercy: { primary: '#fff5e0', secondary: '#ffeba3', theme: 'light' },
  mizuki: { primary: '#0097a7', secondary: '#e0f7fa', theme: 'light' },
  moira: { primary: '#4a148c', secondary: '#8e24aa', theme: 'dark' },
  orisa: { primary: '#2e7d32', secondary: '#c8e6c9', theme: 'dark' },
  pharah: { primary: '#0d47a1', secondary: '#fbc02d', theme: 'dark' },
  ramattra: { primary: '#311b92', secondary: '#d1c4e9', theme: 'dark' },
  reaper: { primary: '#110d2c', secondary: '#ba68c8', theme: 'dark' },
  reinhardt: { primary: '#2d3035', secondary: '#f5b041', theme: 'dark' },
  roadhog: { primary: '#4e342e', secondary: '#8d6e63', theme: 'dark' },
  sierra: { primary: '#00695c', secondary: '#80cbc4', theme: 'dark' },
  sigma: { primary: '#263238', secondary: '#b0bec5', theme: 'dark' },
  sojourn: { primary: '#0d47a1', secondary: '#90caf9', theme: 'dark' },
  'soldier-76': { primary: '#b71c1c', secondary: '#0d47a1', theme: 'dark' },
  sombra: { primary: '#1a092a', secondary: '#d800ff', theme: 'dark' },
  symmetra: { primary: '#006064', secondary: '#80deea', theme: 'dark' },
  torbjorn: { primary: '#e65100', secondary: '#ffcc80', theme: 'dark' },
  tracer: { primary: '#ff9100', secondary: '#e1f5fe', theme: 'light' },
  vendetta: { primary: '#000000', secondary: '#d50000', theme: 'dark' },
  venture: { primary: '#795548', secondary: '#ffe082', theme: 'dark' },
  widowmaker: { primary: '#17102a', secondary: '#ba68c8', theme: 'dark' },
  winston: { primary: '#37474f', secondary: '#eceff1', theme: 'dark' },
  'wrecking-ball': { primary: '#ffb300', secondary: '#b0bec5', theme: 'light' },
  wuyang: { primary: '#1b5e20', secondary: '#a5d6a7', theme: 'dark' },
  zarya: { primary: '#ec407a', secondary: '#b0bec5', theme: 'light' },
  zenyatta: { primary: '#faf0d6', secondary: '#fdd835', theme: 'light' }
};

// 🛡️ [Mitigation] 各定位預設兜底色彩 (Role Default Colors)
export const ROLE_DEFAULT_COLORS = {
  tank: { primary: '#37474f', secondary: '#78909c', theme: 'dark' as const },
  damage: { primary: '#424242', secondary: '#d32f2f', theme: 'dark' as const },
  support: { primary: '#fff5e0', secondary: '#ffeba3', theme: 'light' as const }
};

/**
 * 雙軸智慧主題推導函數：依據英雄主要代表色與其特工定位 (Role) 自動拼裝高品質極簡背景
 */
export function getHeroBackgroundConfig(heroId: string, role: 'tank' | 'damage' | 'support'): HeroBackgroundConfig {
  // 1. 取得色彩配置 (若為未知英雄則依據定位自動兜底)
  const colors = HERO_THEME_COLORS[heroId] || ROLE_DEFAULT_COLORS[role] || ROLE_DEFAULT_COLORS.damage;

  // 2. 構建低飽和度、半透明玻璃擬態底層線性漸層
  const gradient = `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.primary}22 50%, ${colors.secondary}35 100%)`;
  
  // 3. 氛圍光暈的徑向色 (Glow Color)
  const glowColor = `${colors.secondary}50`; // 帶有約30%透明度的光暈
  const glowPosition = role === 'support' ? '50% 50%' : role === 'damage' ? '70% 30%' : '50% 80%';

  // 4. 根據 Role 模具動態配置幾何形狀
  let shapes: HeroBackgroundConfig['shapes'] = [];

  if (role === 'support') {
    // 💖 輔助幾何：溫暖的半透明同心圓弧與光環 (z-index 疊加)
    shapes = [
      {
        type: 'circle',
        className: 'w-24 h-24 -left-6 -bottom-6 border border-white/10 bg-white/2 mix-blend-overlay',
      },
      {
        type: 'circle',
        className: 'w-16 h-16 -right-4 -top-4 border border-white/8 mix-blend-overlay',
      },
      {
        type: 'circle',
        className: 'w-36 h-36 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 border-dashed mix-blend-overlay animate-[spin_40s_linear_infinite]',
      }
    ];
  } else if (role === 'tank') {
    // 🛡️ 坦克幾何：厚重的半透明六角盾牌與折面
    shapes = [
      {
        type: 'polygon',
        className: 'w-32 h-32 left-1/2 -translate-x-1/2 -bottom-6 bg-white/3 border border-white/5 mix-blend-overlay',
        style: {
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }
      },
      {
        type: 'polygon',
        className: 'w-20 h-16 -right-6 -top-4 bg-white/4 border border-white/5 rotate-[15deg] mix-blend-overlay',
        style: {
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }
      }
    ];
  } else {
    // ⚔️ 傷害幾何：具備凌厲方向感的平行斜線條 (45度斜線)
    shapes = [
      {
        type: 'stripes',
        className: 'w-12 h-60 -right-2 -top-12 bg-white/4 pointer-events-none transform rotate-[30deg] mix-blend-overlay',
      },
      {
        type: 'stripes',
        className: 'w-6 h-60 -right-6 -top-4 bg-white/2 pointer-events-none transform rotate-[30deg] mix-blend-overlay',
      }
    ];
  }

  return {
    gradient,
    glowColor,
    glowPosition,
    theme: colors.theme,
    shapes
  };
}
