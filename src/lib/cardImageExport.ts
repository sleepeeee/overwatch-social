"use client";

import { toBlob } from "html-to-image";
import { toPng } from "html-to-image";

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
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }

      await image.decode().catch(() => undefined);
    })
  );

  await nextFrame();
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

export async function createCardImageDataUrl(node: HTMLElement): Promise<string> {
  await waitForCardExport(node);

  const options = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  };

  // html-to-image 第一次呼叫只觸發圖片 fetch/內部快取；第二次才能正確嵌入 base64
  await toPng(node, options).catch(() => undefined);
  return toPng(node, options);
}

export async function exportCardImage(node: HTMLElement, rawFileName: string): Promise<ExportResult> {
  const fileName = sanitizeFileName(rawFileName.endsWith(".png") ? rawFileName : `${rawFileName}.png`);

  await waitForCardExport(node);

  const blobOptions = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  };

  // 同 createCardImageDataUrl：先暖機一次讓圖片 fetch 完成
  await toPng(node, blobOptions).catch(() => undefined);
  const blob = await toBlob(node, blobOptions);

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
