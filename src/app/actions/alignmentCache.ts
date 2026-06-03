// 非 Server Action（不加 "use server"）：module-level 快取持有者
// "use server" 檔案只能 export async functions；cache 狀態放此獨立模組
import type { AlignmentConfig } from "@/data/heroAlignments";

interface CacheEntry {
  data: Record<string, AlignmentConfig>;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 分鐘

export function getCachedAlignments(): Record<string, AlignmentConfig> | null {
  if (!cache || Date.now() > cache.expiresAt) {
    cache = null;
    return null;
  }
  return cache.data;
}

export function setCachedAlignments(data: Record<string, AlignmentConfig>): void {
  cache = { data, expiresAt: Date.now() + TTL_MS };
}

export function clearAlignmentCache(): void {
  cache = null;
}
