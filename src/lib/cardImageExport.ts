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

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// 用 fetch 直接拿 binary → FileReader 轉 dataURL，完全繞過 <img> 元素的
// load/decode 時序。html-to-image 序列化 foreignObject 時 mobile Safari
// 對 <img> race（REF-036）；以 dataURL src 餵入則 serialize 沒有 race。
const preloadImagesAsDataUrls = async (node: HTMLElement): Promise<void> => {
  const images = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.src.startsWith("data:")) return;
      const originalSrc = img.src;
      try {
        const res = await fetch(originalSrc, { cache: "force-cache" });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        img.src = dataUrl;
        // 等到瀏覽器把 dataURL decode 完成才回（避免 html-to-image 跑時還沒 decode）
        await img.decode().catch(() => undefined);
      } catch {
        // 保留原始 src（網路失敗時走 onError silhouette fallback）
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
