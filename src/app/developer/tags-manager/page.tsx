import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getGameSpecialTags } from "@/app/actions/tags";
import TagsManagerClient, { TagItem } from "./TagsManagerClient";

export const metadata = {
  title: "特色標籤管理工具 | 開發者後台",
  description: "特色標籤新增與物理刪除管理主控台",
};

export default async function Page() {
  // 🛡️ [Security Defense-in-depth] 伺服器端開發者權限阻斷，防止繞過前端 UI 越權訪問
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }

  // 預載特色標籤資料
  const tagsRes = await getGameSpecialTags();
  const initialTags = tagsRes.success && tagsRes.data ? tagsRes.data : [];

  return (
    <TagsManagerClient
      initialTags={initialTags as TagItem[]}
      currentUserEmail={user?.email || "unknown@developer.com"}
    />
  );
}
