// 首頁公告相關 Types（獨立於 "use server" 檔案，避免 Next.js 限制）

export interface AlignmentConfig {
  icon_x: number;
  icon_y: number;
  icon_scale: number;
  title_font_size: number;
  title_x: number;
  title_y: number;
  message_font_size: number;
  message_x: number;
  message_y: number;
  buttons_x: number;
  buttons_y: number;
  tag_font_size: number;
  tag_x: number;
  tag_y: number;
  is_hidden?: boolean; // 新增：是否在星圖中隱藏
}

export interface AnnouncementItem {
  num: string;
  tag: string;
  title: string;
  color: string;
  message: string;
  custom_icon_url?: string;
  alignments?: AlignmentConfig;
}
