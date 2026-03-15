"use server";

import {
  cleanupTempUploadsByKeys,
  cleanupAbandonedTempUploads,
} from "@/modules/images/temp-upload-helpers";

/**
 * Clean up specific temp uploads by storage keys (e.g. when admin cancels product creation).
 * Zero-cost: runs in Next.js server action context, no dedicated API route.
 */
export async function cleanupTempUploadsByKeysAction(
  storageKeys: string[]
): Promise<{ deleted: number; error?: string }> {
  try {
    if (!Array.isArray(storageKeys) || storageKeys.length === 0) {
      return { deleted: 0 };
    }
    const deleted = await cleanupTempUploadsByKeys(storageKeys);
    return { deleted };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    console.error("Temp cleanup error:", err);
    return { deleted: 0, error: message };
  }
}

/**
 * Clean up abandoned temp uploads older than TTL (e.g. for periodic maintenance).
 * Call from a cron job or admin-triggered action; no API route required.
 */
export async function cleanupAbandonedTempUploadsAction(
  ttlHours: number = 24
): Promise<{ deleted: number; error?: string }> {
  try {
    const deleted = await cleanupAbandonedTempUploads(ttlHours);
    return { deleted };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    console.error("Abandoned temp cleanup error:", err);
    return { deleted: 0, error: message };
  }
}
