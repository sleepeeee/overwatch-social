"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { saveCaptureDisplayLabels } from "@/lib/developer-capture/settings";

async function ensureDeveloper() {
  if (process.env.CAPTURE_REQUIRE_AUTH !== "true") {
    return;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.app_metadata?.role !== "developer") {
    throw new Error("Unauthorized: Developer privilege required.");
  }
}

function normalizeLabel(value: string): string {
  return value.trim();
}

export async function saveCaptureDisplayNames(input: {
  leftLabel: string;
  rightLabel: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDeveloper();

    const leftLabel = normalizeLabel(input.leftLabel);
    const rightLabel = normalizeLabel(input.rightLabel);

    if (!leftLabel || !rightLabel) {
      return { success: false, error: "左右顯示名稱都要填" };
    }

    await saveCaptureDisplayLabels({
      leftLabel,
      rightLabel,
    });
    revalidatePath("/developer");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "儲存據點名稱時發生未知錯誤",
    };
  }
}
