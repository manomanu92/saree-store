/**
 * R2 operations via upload-signer Worker (required for static admin — no R2 secrets in browser).
 */

import { createClient } from "@/lib/supabase/client";

function getSignerBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_UPLOAD_SIGNER_URL?.trim();
  if (!u) {
    throw new Error(
      "NEXT_PUBLIC_UPLOAD_SIGNER_URL is not set. Deploy upload-signer and set this URL."
    );
  }
  return u.replace(/\/$/, "");
}

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not signed in");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

/** Copy temp/* keys to productId/* (same as server-side finalizeTempUploads). */
export async function finalizeTempUploadsViaWorker(
  productId: string,
  tempKeys: string[]
): Promise<Map<string, string>> {
  const res = await fetch(`${getSignerBaseUrl()}/finalize-temp`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ productId, tempKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "finalize-temp failed" }));
    throw new Error((err as { error?: string }).error || `finalize-temp ${res.status}`);
  }
  const data = (await res.json()) as { keyMap?: Record<string, string> };
  const m = new Map<string, string>();
  if (data.keyMap) {
    for (const [k, v] of Object.entries(data.keyMap)) {
      m.set(k, v);
    }
  }
  return m;
}

/** Delete R2 objects by key (admin JWT required). */
export async function deleteStorageKeysViaWorker(keys: string[]): Promise<{ deleted: number }> {
  if (keys.length === 0) return { deleted: 0 };
  const res = await fetch(`${getSignerBaseUrl()}/delete-objects`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ keys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "delete-objects failed" }));
    throw new Error((err as { error?: string }).error || `delete-objects ${res.status}`);
  }
  return (await res.json()) as { deleted: number };
}
