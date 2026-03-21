import { cleanupAbandonedTempUploads, cleanupTempUploadsByKeys } from "@/modules/images/temp-upload-helpers";

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
