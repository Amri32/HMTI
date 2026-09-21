import assert from "node:assert/strict";
import test from "node:test";
import {
  createBeritaSlug,
  getBeritaHref,
  normalizeBeritaSlug,
} from "../lib/content-path.ts";
import { getAdminRedirect } from "../lib/admin-route.ts";
import { instagramUrl, normalizeInstagramHandle } from "../lib/social.ts";

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

test("merapikan handle Instagram dari semua bentuk tulisan admin", () => {
  assert.equal(normalizeInstagramHandle("  @Hmti.Ubsi  "), "Hmti.Ubsi");
  assert.equal(normalizeInstagramHandle("hmti.ubsi"), "hmti.ubsi");
  assert.equal(
    normalizeInstagramHandle("https://www.instagram.com/hmti.ubsi/?igsh=abc"),
    "hmti.ubsi"
  );
  assert.equal(instagramUrl("hmti.ubsi"), "https://www.instagram.com/hmti.ubsi/");
  // Tautan yang dibagikan Instagram HMTI: parameter pelacakan harus dibuang.
  assert.equal(
    normalizeInstagramHandle(
      "https://www.instagram.com/hmti.ubsi_margonda?stkn=ZDNlZDc0MzIxNw=="
    ),
    "hmti.ubsi_margonda"
  );
  assert.equal(
    instagramUrl("hmti.ubsi_margonda"),
    "https://www.instagram.com/hmti.ubsi_margonda/"
  );
});

test("menolak nilai yang tidak bisa jadi handle Instagram", () => {
  assert.equal(normalizeInstagramHandle(""), null);
  assert.equal(normalizeInstagramHandle("   "), null);
  assert.equal(normalizeInstagramHandle(null), null);
  assert.equal(normalizeInstagramHandle("nama dengan spasi"), null);
  assert.equal(normalizeInstagramHandle("a".repeat(31)), null);
  assert.equal(normalizeInstagramHandle(".awal"), null);
  // Bukan profil Instagram → jangan diteruskan sebagai handle.
  assert.equal(normalizeInstagramHandle("https://example.com/hmti"), null);
  assert.equal(normalizeInstagramHandle("javascript:alert(1)"), null);
});
