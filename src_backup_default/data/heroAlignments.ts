export interface AlignmentConfig {
  scale: number;      // e.g. 1.8
  translateX: number; // e.g. 15 (means 15% translation)
  translateY: number; // e.g. 28 (means 28% translation)
}

// 🛡️ [Mitigation] 各特工半身立繪精準置中縮放與位移補償參數表（由開發者精密對準儀實時動態校準寫入）
export const HERO_ALIGNMENTS: Record<string, AlignmentConfig> = {
  "ana": {
    scale: 3.00,
    translateX: 6,
    translateY: -7
  },
  "anran": {
    scale: 3.00,
    translateX: 2,
    translateY: -4
  },
  "ashe": {
    scale: 3.00,
    translateX: 8,
    translateY: 0
  },
  "baptiste": {
    scale: 3.00,
    translateX: -7,
    translateY: -10
  },
  "bastion": {
    scale: 2.45,
    translateX: 0,
    translateY: -4
  },
  "brigitte": {
    scale: 3.00,
    translateX: 0,
    translateY: -4
  },
  "cassidy": {
    scale: 3.00,
    translateX: 1,
    translateY: 2
  },
  "domina": {
    scale: 3.00,
    translateX: 1,
    translateY: 0
  },
  "doomfist": {
    scale: 3.00,
    translateX: -8,
    translateY: -2
  },
  "dva": {
    scale: 2.85,
    translateX: 18,
    translateY: -32
  },
  "echo": {
    scale: 3.00,
    translateX: 5,
    translateY: -3
  },
  "emre": {
    scale: 3.00,
    translateX: 10,
    translateY: 0
  },
  "freja": {
    scale: 3.00,
    translateX: -6,
    translateY: -2
  },
  "genji": {
    scale: 3.00,
    translateX: 0,
    translateY: -2
  },
  "hanzo": {
    scale: 2.65,
    translateX: 4,
    translateY: 1
  },
  "hazard": {
    scale: 3.00,
    translateX: 0,
    translateY: 1
  },
  "illari": {
    scale: 3.00,
    translateX: 6,
    translateY: 1
  },
  "jetpack-cat": {
    scale: 1.50,
    translateX: 4,
    translateY: 6
  },
  "junker-queen": {
    scale: 3.00,
    translateX: 0,
    translateY: -2
  },
  "junkrat": {
    scale: 3.00,
    translateX: -8,
    translateY: 0
  },
  "juno": {
    scale: 3.00,
    translateX: 0,
    translateY: -1
  },
  "kiriko": {
    scale: 3.00,
    translateX: 8,
    translateY: -4
  },
  "lifeweaver": {
    scale: 3.00,
    translateX: 9,
    translateY: -1
  },
  "lucio": {
    scale: 3.00,
    translateX: 6,
    translateY: -6
  },
  "mauga": {
    scale: 3.00,
    translateX: -4,
    translateY: 3
  },
  "mei": {
    scale: 3.00,
    translateX: 6,
    translateY: 0
  },
  "mercy": {
    scale: 3.00,
    translateX: 27,
    translateY: 0
  },
  "mizuki": {
    scale: 3.00,
    translateX: 10,
    translateY: -2
  },
  "moira": {
    scale: 3.00,
    translateX: 0,
    translateY: -6
  },
  "orisa": {
    scale: 3.00,
    translateX: 4,
    translateY: -6
  },
  "pharah": {
    scale: 3.00,
    translateX: -11,
    translateY: 0
  },
  "ramattra": {
    scale: 3.00,
    translateX: -10,
    translateY: -19
  },
  "reaper": {
    scale: 3.00,
    translateX: 2,
    translateY: -5
  },
  "reinhardt": {
    scale: 3.00,
    translateX: 12,
    translateY: -4
  },
  "roadhog": {
    scale: 3.00,
    translateX: 0,
    translateY: -6
  },
  "sierra": {
    scale: 3.00,
    translateX: 0,
    translateY: -1
  },
  "sigma": {
    scale: 3.00,
    translateX: 0,
    translateY: 0
  },
  "sojourn": {
    scale: 3.00,
    translateX: 8,
    translateY: 0
  },
  "soldier-76": {
    scale: 3.00,
    translateX: -3,
    translateY: -1
  },
  "sombra": {
    scale: 3.00,
    translateX: 0,
    translateY: -1
  },
  "symmetra": {
    scale: 3.00,
    translateX: 1,
    translateY: 0
  },
  "torbjorn": {
    scale: 2.50,
    translateX: 8,
    translateY: -28
  },
  "tracer": {
    scale: 3.00,
    translateX: 4,
    translateY: -2
  },
  "vendetta": {
    scale: 3.00,
    translateX: 18,
    translateY: -16
  },
  "venture": {
    scale: 3.00,
    translateX: 3,
    translateY: 1
  },
  "widowmaker": {
    scale: 3.00,
    translateX: 10,
    translateY: 0
  },
  "winston": {
    scale: 2.30,
    translateX: 22,
    translateY: -7
  },
  "wrecking-ball": {
    scale: 3.00,
    translateX: 2,
    translateY: 3
  },
  "wuyang": {
    scale: 3.00,
    translateX: -4,
    translateY: 0
  },
  "zarya": {
    scale: 3.00,
    translateX: 8,
    translateY: 0
  },
  "zenyatta": {
    scale: 2.00,
    translateX: -8,
    translateY: 3
  }
};

export const DEFAULT_ALIGNMENT: AlignmentConfig = {
  scale: 1.8,
  translateX: 0,
  translateY: 15
};
