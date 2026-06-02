"use server";

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

// MIME type → 安全副檔名對照表（不信任 file.name）
const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

const STORAGE_BUCKET = "announcement-icons";
const SUPABASE_STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;

/**
 * 🛡️ 伺服器端開發者身分驗證（生產環境強制執行）
 */
async function checkDeveloperAuth() {
  if (process.env.NODE_ENV === "development") return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "developer") {
    throw new Error("Unauthorized: Developer privilege required.");
  }
}

/**
 * 獲取首頁公告列表（從 Supabase announcements 表讀取，fallback 到預設值）
 */
export async function getAnnouncements(): Promise<AnnouncementItem[]> {
  noStore();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("num", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_ANNOUNCEMENTS;
    }

    return data.map(row => ({
      num: row.num as string,
      tag: row.tag as string,
      title: row.title as string,
      color: row.color as string,
      message: row.message as string,
      custom_icon_url: (row.custom_icon_url as string) || "",
      alignments: { ...DEFAULT_ALIGNMENTS, ...(row.alignments as Partial<AlignmentConfig>) },
    }));
  } catch (error) {
    console.error("Failed to read announcements from Supabase:", error);
    return DEFAULT_ANNOUNCEMENTS;
  }
}

/**
 * 儲存首頁公告列表到 Supabase（含欄位驗證）
 */
export async function saveAnnouncements(data: AnnouncementItem[]) {
  try {
    await checkDeveloperAuth();

    // 格式驗證
    if (!Array.isArray(data) || data.length !== 4) {
      return { success: false, error: "無效的公告資料，長度必須為 4 筆" };
    }

    const VALID_NUMS = ["01", "02", "03", "04"];
    const MAX_LEN = { tag: 50, title: 100, message: 500, color: 100 };

    for (const [i, item] of data.entries()) {
      if (!VALID_NUMS.includes(item.num)) {
        return { success: false, error: `第 ${i + 1} 筆：num 必須為 01~04` };
      }
      for (const field of ["tag", "title", "message", "color"] as const) {
        if (typeof item[field] !== "string") {
          return { success: false, error: `第 ${i + 1} 筆：${field} 必須為字串` };
        }
        if (item[field].length > MAX_LEN[field]) {
          return { success: false, error: `第 ${i + 1} 筆：${field} 超過 ${MAX_LEN[field]} 字元上限` };
        }
      }
      // custom_icon_url 只允許 Supabase Storage URL 或空字串
      if (item.custom_icon_url && item.custom_icon_url !== "" &&
          !item.custom_icon_url.startsWith(SUPABASE_STORAGE_PREFIX)) {
        return { success: false, error: `第 ${i + 1} 筆：custom_icon_url 只允許 Supabase Storage URL` };
      }
    }

    const supabase = await createClient();
    const rows = data.map(item => ({
      num: item.num,
      tag: item.tag,
      title: item.title,
      color: item.color,
      message: item.message,
      custom_icon_url: item.custom_icon_url ?? "",
      alignments: item.alignments ?? DEFAULT_ALIGNMENTS,
    }));

    const { error } = await supabase
      .from("announcements")
      .upsert(rows, { onConflict: "num" });

    if (error) {
      console.error("Failed to save announcements to Supabase:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/developer");
    return { success: true };
  } catch (error) {
    console.error("Failed to save announcements:", error);
    return { success: false, error: error instanceof Error ? error.message : "儲存時發生未知錯誤" };
  }
}

/**
 * 上傳公告圖標到 Supabase Storage（含安全驗證）
 */
export async function uploadAnnouncementIcon(num: string, formData: FormData) {
  try {
    await checkDeveloperAuth();

    // num 格式驗證（防路徑遍歷）
    if (!/^0[1-4]$/.test(num)) {
      return { success: false, error: "無效的公告編號（必須為 01~04）" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "無效的檔案輸入" };
    }

    // MIME type 驗證（從 file.type 推導副檔名，不信任 file.name）
    const ext = EXT_MAP[file.type];
    if (!ext) {
      return { success: false, error: "不支援的圖片格式（支援：JPG、PNG、GIF、WEBP、SVG）" };
    }

    // 大小驗證（2MB 上限）
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "圖片大小超過 2MB 上限" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `announcement_icon_${num}${ext}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload icon to Supabase Storage:", uploadError.message);
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return { success: true, customIconUrl: publicUrl };
  } catch (error) {
    console.error("Failed to upload announcement icon:", error);
    return { success: false, error: error instanceof Error ? error.message : "上傳時發生未知錯誤" };
  }
}
