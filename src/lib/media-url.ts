/**
 * Image URL helpers for zero-cost architecture.
 *
 * Public storefront MUST use getPublicImageUrl only (direct R2/CDN).
 * Admin/preview can use getMediaUrl when /api/media fallback is needed.
 */

const getPublicBaseUrl = (): string | null => {
  if (typeof process === "undefined") return null;
  const base =
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
  return base ? String(base).trim() || null : null;
};

/**
 * Public storefront image URL only. Returns direct R2/CDN URL.
 * No /api/media fallback – public traffic must not depend on app server.
 * Returns "" when R2 public base URL is not configured (require it for storefront).
 */
export function getPublicImageUrl(storageKey: string): string {
  if (!storageKey || storageKey.includes("..")) return "";
  if (storageKey.startsWith("http")) return storageKey;
  const base = getPublicBaseUrl();
  if (!base) return "";
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}/${storageKey}`;
}

/**
 * Media URL: direct R2/CDN only. No /api/media fallback (zero-cost).
 * Use getPublicImageUrl for public storefront; getMediaUrl for admin when R2 base is set.
 * Returns "" when no public base URL (fail safely; /api/media is admin-only, not for storefront).
 */
export function getMediaUrl(storageKey: string): string {
  if (!storageKey) return "";
  if (storageKey.startsWith("/api/media/") || storageKey.startsWith("http")) return storageKey;
  if (storageKey.includes("..")) return storageKey;
  const base = getPublicBaseUrl();
  if (!base) return "";
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}/${storageKey}`;
}
