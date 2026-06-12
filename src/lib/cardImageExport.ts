"use client";

import { toBlob, toPng } from "html-to-image";

type ExportResult = "shared" | "downloaded";

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const isMobileLikeDevice = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "after-midnight-card.png";

const waitForCardExport = async (node: HTMLElement) => {
  await nextFrame();
  await nextFrame();
  await document.fonts?.ready;

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (!image.currentSrc && image.loading === "lazy") {
        image.loading = "eager";
      }

      if (!image.complete || image.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          const timeout = window.setTimeout(resolve, 5000);
          image.addEventListener("load", () => { clearTimeout(timeout); resolve(); }, { once: true });
          image.addEventListener("error", () => { clearTimeout(timeout); resolve(); }, { once: true });
        });
      }

      await image.decode().catch(() => undefined);
    })
  );

  await nextFrame();
  await nextFrame();
};

// 圖片在 viewport 內已載入，用 canvas.drawImage 直接提取 data URL。
// 比 fetch 更可靠：不依賴網路、不受 mobile 並行限制影響。
const preloadImagesAsDataUrls = async (node: HTMLElement): Promise<void> => {
  const images = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.src.startsWith("data:")) return;
      if (!img.complete || img.naturalWidth === 0) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        img.src = canvas.toDataURL("image/png");
        await img.decode().catch(() => undefined);
      } catch {
        // 保留原始 src（CORS 或其他問題）
      }
    })
  );
  await nextFrame();
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const canShareImageFile = (file: File) => {
  if (!isMobileLikeDevice()) return false;
  if (!navigator.share || !navigator.canShare) return false;
  return navigator.canShare({ files: [file] });
};

const toPngOptions = {
  cacheBust: false, // 圖片已是 data URL，不需要 cache bust
  pixelRatio: 2,
  backgroundColor: "transparent",
  style: {
    transform: "scale(1)",
    transformOrigin: "top left",
  },
} as const;

export async function createCardImageDataUrl(node: HTMLElement): Promise<string> {
  await waitForCardExport(node);
  await preloadImagesAsDataUrls(node);
  return toPng(node, toPngOptions);
}

export async function exportCardImage(node: HTMLElement, rawFileName: string): Promise<ExportResult> {
  const fileName = sanitizeFileName(rawFileName.endsWith(".png") ? rawFileName : `${rawFileName}.png`);

  await waitForCardExport(node);
  await preloadImagesAsDataUrls(node);
  const blob = await toBlob(node, toPngOptions);

  if (!blob) {
    throw new Error("名片圖片產生失敗");
  }

  const file = new File([blob], fileName, { type: "image/png" });

  if (canShareImageFile(file)) {
    try {
      await navigator.share({
        files: [file],
        title: "AFTER MIDNIGHT 玩家名片",
      });
      return "shared";
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return "shared";
    }
  }

  downloadBlob(blob, fileName);
  return "downloaded";
}
