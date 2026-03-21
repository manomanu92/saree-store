import { randomUUID } from "@/lib/random-id";
import { deleteStorageKeysViaWorker, finalizeTempUploadsViaWorker } from "@/lib/storage-worker-client";

/**
 * Storage helper utilities for managing temporary uploads.
 * Temp uploads use keys like: temp/<sessionId>/<filename>.
 * Finalize/cleanup use upload-signer Worker (no R2 secrets in static admin).
 */

export interface TempUploadMetadata {
  storage_key: string;
  file_name: string;
  uploaded_at: Date;
}

export function generateTempUploadKey(sessionId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  return `temp/${sessionId}/${randomUUID()}.${ext}`;
}

export async function finalizeTempUploads(
  productId: string,
  tempStorageKeys: string[]
): Promise<Map<string, string>> {
  return finalizeTempUploadsViaWorker(productId, tempStorageKeys);
}

export async function cleanupTempUploadsForSession(_sessionId: string): Promise<number> {
  console.warn(
    "[admin] cleanupTempUploadsForSession: not available without R2 list API in static build"
  );
  return 0;
}

export async function cleanupTempUploadsByKeys(storageKeys: string[]): Promise<number> {
  const tempOnly = storageKeys.filter((k) => k.startsWith("temp/"));
  if (tempOnly.length === 0) return 0;
  const { deleted } = await deleteStorageKeysViaWorker(tempOnly);
  return deleted;
}

export async function cleanupAbandonedTempUploads(_ttlHours: number = 24): Promise<number> {
  return 0;
}
