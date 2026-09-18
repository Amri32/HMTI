const BERITA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createBeritaSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function normalizeBeritaSlug(value: string | null): string | null {
  if (!value || value.length > 80 || !BERITA_SLUG_PATTERN.test(value)) return null;
  return value;
}

export function getBeritaHref(slug: string): string {
  return `/berita/artikel?slug=${encodeURIComponent(slug)}`;
}
