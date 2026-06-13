"use client";

import { toBlob, toPng } from "html-to-image";

type ExportResult = "shared" | "downloaded";

export type DiagEvent = {
  kind: string;
  src?: string;
  info?: string;
};
type DiagFn = (e: DiagEvent) => void;

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
const preloadImagesAsDataUrls = async (node: HTMLElement, onDiag?: DiagFn): Promise<void> => {
  const images = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
  onDiag?.({ kind: "preload_start", info: `images=${images.length}` });
  await Promise.all(
    images.map(async (img, idx) => {
      const tag = `img[${idx}]`;
      const shortSrc = (img.src || "").split("/").pop() || "(empty)";
      if (img.src.startsWith("data:")) {
        onDiag?.({ kind: "preload_skip_data", src: tag, info: "already dataURL" });
        return;
      }
      const originalSrc = img.src;
      try {
        const res = await fetch(originalSrc, { cache: "force-cache" });
        onDiag?.({ kind: "fetch_done", src: `${tag} ${shortSrc}`, info: `ok=${res.ok} status=${res.status}` });
        if (!res.ok) return;
        const blob = await res.blob();
        onDiag?.({ kind: "blob_done", src: `${tag} ${shortSrc}`, info: `size=${blob.size} type=${blob.type}` });
        const dataUrl = await blobToDataUrl(blob);
        onDiag?.({ kind: "dataurl_done", src: `${tag} ${shortSrc}`, info: `len=${dataUrl.length}` });
        img.src = dataUrl;
        await img.decode().catch((e) => {
          onDiag?.({ kind: "decode_fail", src: `${tag} ${shortSrc}`, info: String(e) });
        });
        onDiag?.({ kind: "ready", src: `${tag} ${shortSrc}`, info: `natW=${img.naturalWidth} natH=${img.naturalHeight}` });
      } catch (e) {
        onDiag?.({ kind: "fetch_error", src: `${tag} ${shortSrc}`, info: String(e) });
      }
    })
  );
  await nextFrame();
  onDiag?.({ kind: "preload_end" });
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

const makeToPngOptions = (pixelRatio: number) => ({
  cacheBust: false, // 圖片已是 data URL，不需要 cache bust
  pixelRatio,
  backgroundColor: "transparent",
  style: {
    transform: "scale(1)",
    transformOrigin: "top left",
  },
} as const);

// iOS Safari foreignObject rasterization 在 pixelRatio=2 + 多張 hero img 時
// 容易撞 memory/paint budget 把某張 image 漏掉（Codex 對抗式審查 Q5）。
// blob size 異常小視為 fallback signal：3 張 hero PNG 完整輸出 normally ≥ 80KB。
const SMALL_BLOB_THRESHOLD = 80 * 1024;

export async function createCardImageDataUrl(node: HTMLElement): Promise<string> {
  await waitForCardExport(node);
  await preloadImagesAsDataUrls(node);
  await document.fonts?.ready;
  const opts = makeToPngOptions(2);
  // 雙呼叫暖機（REF-036）：第一次擷取暖 cache（丟棄），第二次才是正式結果。
  await toPng(node, opts).catch(() => undefined);
  return toPng(node, opts);
}

// 預先在背景產 File（給 ShareCardClient 暖好放 state，按鈕點擊時即可直接 share，
// 避免 await 產圖耗盡 iOS transient activation；REF-037）。
export async function createCardImageFile(node: HTMLElement, rawFileName: string, onDiag?: DiagFn): Promise<File> {
  const fileName = sanitizeFileName(rawFileName.endsWith(".png") ? rawFileName : `${rawFileName}.png`);

  onDiag?.({ kind: "start" });
  await waitForCardExport(node);
  onDiag?.({ kind: "waitForCardExport_done" });
  await preloadImagesAsDataUrls(node, onDiag);
  await document.fonts?.ready;
  onDiag?.({ kind: "fonts_ready" });

  // 第一次嘗試 pixelRatio=2（高品質）
  const optsHi = makeToPngOptions(2);
  await toBlob(node, optsHi).catch(() => undefined);
  onDiag?.({ kind: "warmup_hi_done" });
  let blob = await toBlob(node, optsHi);
  onDiag?.({ kind: "attempt_hi", info: `size=${blob?.size ?? 0} threshold=${SMALL_BLOB_THRESHOLD}` });

  // blob 太小 = iOS memory budget 可能漏圖 → 退回 pixelRatio=1 重做
  if (!blob || blob.size < SMALL_BLOB_THRESHOLD) {
    onDiag?.({ kind: "fallback_lo", info: "pixelRatio=2 too small, retry @1" });
    const optsLo = makeToPngOptions(1);
    await toBlob(node, optsLo).catch(() => undefined);
    blob = await toBlob(node, optsLo);
    onDiag?.({ kind: "attempt_lo", info: `size=${blob?.size ?? 0}` });
  }

  onDiag?.({ kind: "final_blob", info: `size=${blob?.size ?? 0}` });
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
