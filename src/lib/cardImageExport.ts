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

// 圖片轉 data URL：用 canvas.drawImage 直接提取，避免 html-to-image 序列化
// foreignObject 時 mobile 隨機空白（REF-036 race）。對未載入圖必須先 await load
// + decode，不可 early-return（會把未 decode 圖交回 foreignObject）。
const preloadImagesAsDataUrls = async (node: HTMLElement): Promise<void> => {
  const images = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.src.startsWith("data:")) return;

      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve) => {
          const timeout = window.setTimeout(resolve, 5000);
          img.addEventListener("load", () => { clearTimeout(timeout); resolve(); }, { once: true });
          img.addEventListener("error", () => { clearTimeout(timeout); resolve(); }, { once: true });
        });
      }

      await img.decode().catch(() => undefined);

      if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

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
  await document.fonts?.ready;
  // 雙呼叫暖機（REF-036）：第一次擷取暖 cache（丟棄），第二次才是正式結果。
  // 對 iOS Safari foreignObject 圖片載入競態必要；commit f22202d 曾加入，後重構移除。
  await toPng(node, toPngOptions).catch(() => undefined);
  return toPng(node, toPngOptions);
}

// 預先在背景產 File（給 ShareCardClient 暖好放 state，按鈕點擊時即可直接 share，
// 避免 await 產圖耗盡 iOS transient activation；REF-037）。
export async function createCardImageFile(node: HTMLElement, rawFileName: string): Promise<File> {
  const fileName = sanitizeFileName(rawFileName.endsWith(".png") ? rawFileName : `${rawFileName}.png`);

  await waitForCardExport(node);
  await preloadImagesAsDataUrls(node);
  await document.fonts?.ready;
  // 雙呼叫暖機（REF-036）：第一次 toBlob 暖 cache 後丟棄，第二次才是正式結果。
  await toBlob(node, toPngOptions).catch(() => undefined);
  const blob = await toBlob(node, toPngOptions);

  if (!blob) {
    throw new Error("名片圖片產生失敗");
  }

  return new File([blob], fileName, { type: "image/png" });
}

// 已預產好的 File 直接走 navigator.share；命中 transient activation。
// title: "" 避免 iOS 把 share 當純文字而吞掉 files（REF-037）。
export async function shareOrDownloadCardFile(file: File): Promise<ExportResult> {
  if (canShareImageFile(file)) {
    try {
      await navigator.share({
        files: [file],
        title: "",
      });
      return "shared";
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return "shared";
    }
  }

  downloadBlob(file, file.name);
  return "downloaded";
}

export async function exportCardImage(node: HTMLElement, rawFileName: string): Promise<ExportResult> {
  const file = await createCardImageFile(node, rawFileName);
  return shareOrDownloadCardFile(file);
}
