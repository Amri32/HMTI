import assert from "node:assert/strict";
import test from "node:test";
import {
  createBeritaSlug,
  getBeritaHref,
  normalizeBeritaSlug,
} from "../lib/content-path.ts";
import { getAdminRedirect } from "../lib/admin-route.ts";

test("membuat slug dan tautan artikel dari judul", () => {
  const slug = createBeritaSlug("  Kegiatan HMTI: Belajar & Berkarya  ");

  assert.equal(slug, "kegiatan-hmti-belajar-berkarya");
  assert.equal(getBeritaHref(slug), "/berita/artikel?slug=kegiatan-hmti-belajar-berkarya");
});

test("menolak slug dari URL yang tidak sesuai format", () => {
  assert.equal(normalizeBeritaSlug("../admin"), null);
  assert.equal(normalizeBeritaSlug("Judul-Berita"), null);
  assert.equal(normalizeBeritaSlug("berita-valid"), "berita-valid");
});

test("mengirim pengunjung admin yang belum login langsung ke formulir", () => {
  assert.equal(getAdminRedirect("/admin", true, "guest"), "/admin/login");
  assert.equal(getAdminRedirect("/admin", false, null), "/admin/login");
});

test("mempertahankan admin sah di dashboard dan membiarkan halaman login terbuka", () => {
  assert.equal(getAdminRedirect("/admin", true, "ok"), null);
  assert.equal(getAdminRedirect("/admin/login", true, "guest"), null);
});
