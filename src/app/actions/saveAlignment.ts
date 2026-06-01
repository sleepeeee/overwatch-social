"use server";

import fs from "fs";
import path from "path";
import { AlignmentConfig } from "@/data/heroAlignments";
import { createClient } from "@/lib/supabase/server";

/**
 * 🛡️ [APC - Advanced Process Control] 
 * 實時自動製程回饋 API：將微調好並確認鎖定（固定數據）的特工立繪補償參數，
 * 直接持久化寫入物理檔案 `src/data/heroAlignments.ts`。
 * 寫入後 Next.js 熱模組重載 (HMR) 會立刻生效，全站（廣場、卡片、特工頁）直接無縫同步響應！
 */
export async function saveHeroAlignments(alignments: Record<string, AlignmentConfig>) {
  try {
    // 🛡️ [Security Defense-in-depth] 伺服器端開發者角色二次校驗
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.app_metadata?.role !== "developer") {
      return { success: false, error: "未授權：僅限白名單開發者使用對準儀參數調整" };
    }
    const filePath = path.join(process.cwd(), "src/data/heroAlignments.ts");
    
    let content = `export interface AlignmentConfig {
  scale: number;      // e.g. 1.8
  translateX: number; // e.g. 15 (means 15% translation)
  translateY: number; // e.g. 28 (means 28% translation)
}

// 🛡️ [Mitigation] 各特工半身立繪精準置中縮放與位移補償參數表（由開發者精密對準儀實時動態校準寫入）
export const HERO_ALIGNMENTS: Record<string, AlignmentConfig> = {
`;

    // 依據英文字母順序排列寫入，使檔案易於閱讀與版本控制
    const sortedEntries = Object.entries(alignments).sort((a, b) => a[0].localeCompare(b[0]));

    sortedEntries.forEach(([heroId, config]) => {
      content += `  "${heroId}": {\n    scale: ${config.scale.toFixed(2)},\n    translateX: ${config.translateX},\n    translateY: ${config.translateY}\n  },\n`;
    });

    if (sortedEntries.length > 0) {
      content = content.slice(0, -2) + "\n"; // 移除最後一行的逗號與換行
    }

    content += `};

export const DEFAULT_ALIGNMENT: AlignmentConfig = {
  scale: 1.8,
  translateX: 0,
  translateY: 15
};
`;

    // 寫入 UTF-8 無 BOM 實體檔案
    fs.writeFileSync(filePath, content, { encoding: "utf-8" });
    return { success: true };
  } catch (error) {
    console.error("Failed to save hero alignments via Server Action:", error);
    return { success: false, error: String(error) };
  }
}
