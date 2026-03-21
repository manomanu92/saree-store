const getPublicBaseUrl = (): string | null => {
  if (typeof process === "undefined") return null;
  const base =
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL ||
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
  return base ? String(base).trim() || null : null;
};

export function getMediaUrl(storageKey: string): string {
  if (!storageKey || storageKey.includes("..")) return "";
  if (storageKey.startsWith("http")) return storageKey;
  const base = getPublicBaseUrl();
  if (!base) return "";
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}/${storageKey}`;
}
