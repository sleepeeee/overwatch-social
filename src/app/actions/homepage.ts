"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AlignmentConfig, AnnouncementItem } from "@/types/homepage";

export type { AlignmentConfig, AnnouncementItem } from "@/types/homepage";

const DEFAULT_ALIGNMENTS: AlignmentConfig = {
  icon_x: 0,
  icon_y: 0,
  icon_scale: 100,
  title_font_size: 18,
  title_x: 0,
  title_y: 0,
  message_font_size: 13,
  message_x: 0,
  message_y: 0,
  buttons_x: 0,
  buttons_y: 0,
  tag_font_size: 10,
  tag_x: 0,
  tag_y: 0
};

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    num: "01",
    tag: "ADMIN'S COLUMN",
    title: "站長隨筆手札 ✍️",
    color: "rgba(130, 183, 204, 0.85)",
    message: "給深夜還在線上的硬派玩家。在這裡，我們用名片點亮孤單的星空，幫助你找到能在耳麥裡分享勝負的靈魂伴侶。",
    custom_icon_url: "",
    alignments: { ...DEFAULT_ALIGNMENTS }
  },
  {
    num: "02",
    tag: "CHANGELOG",
    title: "最新改版日誌 🚀",
    color: "rgba(245, 212, 107, 0.85)",
    message: "v0.12.0 大改版：首頁全面解耦鬥陣特攻，支持跨遊戲大廳！新增『每日幸友翻牌』與『揪團活動行事曆』。",
    custom_icon_url: "",
    alignments: { ...DEFAULT_ALIGNMENTS }
  },
  {
    num: "03",
    tag: "CONTACT US",
    title: "加入玩家語音 ✉️",
    color: "rgba(235, 220, 216, 0.85)",
    message: "Discord 全局官方語音群已就緒！點擊頭像即可前往，與各路特工、召喚師與休閒大師一同暢聊開黑。",
    custom_icon_url: "",
    alignments: { ...DEFAULT_ALIGNMENTS }
  },
  {
    num: "04",
    tag: "SUPPORT US",
    title: "請站長喝杯咖啡 ☕",
    color: "rgba(140, 124, 108, 0.85)",
    message: "如果這個禪意手帳風的小站溫暖了你，歡迎買杯咖啡支持本站。我們將持續開發更多有趣、精美的遊戲社群小工具！",
    custom_icon_url: "",
    alignments: { ...DEFAULT_ALIGNMENTS }
  }
];

function getFilePath() {
  return path.join(process.cwd(), "src", "data", "announcements.json");
}

/**
 * 🛡️ 伺服器端開發者身分二次驗證（僅在生產環境強制執行）
 */
async function checkDeveloperAuth() {
  if (process.env.NODE_ENV === "development") {
    return; // 開發環境豁免
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "developer") {
    throw new Error("Unauthorized: Developer privilege required.");
  }
}

/**
 * 獲取首頁公告列表
 */
export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  // 強制不快取，每次都從磁碟讀取最新資料
  noStore();
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return DEFAULT_ANNOUNCEMENTS;
    }
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(fileContent) as AnnouncementItem[];
    
    // 補全可能因升級而缺失的 alignments 欄位，確保前台不會 crash
    return parsed.map(item => ({
      ...item,
      alignments: { ...DEFAULT_ALIGNMENTS, ...item.alignments }
    }));
  } catch (error) {
    console.error("Failed to read announcements JSON:", error);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

/**
 * 儲存首頁公告列表
 */
export async function saveAnnouncements(data: AnnouncementItem[]) {
  try {
    // 1. 權限檢查
    await checkDeveloperAuth();

    // 2. 資料格式驗證
    if (!Array.isArray(data) || data.length !== 4) {
      return { success: false, error: "無效的公告資料，長度必須為 4 筆" };
    }

    // 3. 寫入本機 JSON 檔案
    const filePath = getFilePath();
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    // 4. 重新驗證首頁快取（同時清除 developer 頁快取）
    revalidatePath("/");
    revalidatePath("/developer");
    return { success: true };
  } catch (error) {
    console.error("Failed to save announcements:", error);
    const errorMessage = error instanceof Error ? error.message : "儲存時發生未知錯誤";
    return { success: false, error: errorMessage };
  }
}

/**
 * 圖片上傳：自訂圖標圖片並儲存到 public/uploads 中
 */
export async function uploadAnnouncementIcon(num: string, formData: FormData) {
  try {
    await checkDeveloperAuth();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "無效的檔案輸入" };
    }

    // 驗證類型
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "上傳檔案必須為圖片類型" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".png";
    const filename = `announcement_icon_${num}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    const customIconUrl = `/uploads/${filename}`;

    return { success: true, customIconUrl };
  } catch (error) {
    console.error("Failed to upload announcement icon:", error);
    const errorMessage = error instanceof Error ? error.message : "上傳時發生未知錯誤";
    return { success: false, error: errorMessage };
  }
}
