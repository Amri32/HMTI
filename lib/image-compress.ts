// Kompresi gambar di browser sebelum unggah: foto besar dari kamera/HP
// (5–12 MB) di-resize + dikompresi jadi WebP ~ratusan KB. Situs tetap ringan,
// kuota bucket hemat, upload pun jauh lebih cepat di koneksi lambat.
//
// GIF dilewatkan apa adanya (canvas membunuh animasi), demikian juga file yang
// sudah di bawah ambang — diunggah apa adanya tanpa proses.

export const IMAGE_SIZE_LIMIT = 2_000_000; // 2 MB — batas file akhir yang disimpan ke bucket

// Batas file mentah yang boleh dipilih admin sebelum dikompresi. Foto kamera/HP
// lazim 5–12 MB dan akan di-resize + dikompresi di bawah IMAGE_SIZE_LIMIT.
export const RAW_INPUT_LIMIT = 10_000_000; // 10 MB

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Sisi terpanjang hasil kompresi (px). 1920 cukup untuk hero full-width;
// di atas itu mata manusia hampir tidak bisa membedakan.
const MAX_DIMENSION = 1920;

// Target WebP setelah resize. 0.82 = titik manis kualitas/ukuran foto web.
const WEBP_QUALITY = 0.82;

export type HasilKompresi = {
  file: File;
  dikompresi: boolean;
  ukuranAwal: number;
  ukuranAkhir: number;
};

async function decodeBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  // Fallback browser lama: decode via <img> + object URL.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode-gagal"));
      img.src = url;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5_000);
  }
}

// Kompres satu gambar. Mengembalikan file WebP baru, atau file asli kalau
// kompresi tidak membantu/ tidak memungkinkan (GIF, decode gagal, dsb).
export async function kompresGambar(file: File): Promise<HasilKompresi> {
  // GIF: canvas akan membuang animasinya → unggah apa adanya.
  // AVIF/HEIC yang tidak bisa didekode browser: biarkan server/SDK yang urus.
  const bisaDiproses =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";
  if (!bisaDiproses || typeof document === "undefined") {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await decodeBitmap(file);
  } catch {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }

  const lebar = "width" in bitmap ? bitmap.width : 0;
  const tinggi = "height" in bitmap ? bitmap.height : 0;
  if (!lebar || !tinggi) {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }

  const skala = Math.min(1, MAX_DIMENSION / Math.max(lebar, tinggi));
  const tujuanW = Math.round(lebar * skala);
  const tujuanH = Math.round(tinggi * skala);

  const canvas = document.createElement("canvas");
  canvas.width = tujuanW;
  canvas.height = tujuanH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, tujuanW, tujuanH);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob) {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }

  // Kompresi justru membesarkan file (gambar kecil/sudah optimal) → pakai asli.
  if (blob.size >= file.size) {
    return { file, dikompresi: false, ukuranAwal: file.size, ukuranAkhir: file.size };
  }

  const nama = file.name.replace(/\.[^.]+$/, "") || "gambar";
  const hasil = new File([blob], `${nama}.webp`, { type: "image/webp" });
  return {
    file: hasil,
    dikompresi: true,
    ukuranAwal: file.size,
    ukuranAkhir: hasil.size,
  };
}

export function formatUkuran(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(".0", "")} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

// Validasi file yang dipilih admin. Mengembalikan pesan error, atau null bila lolos.
export function cekFileGambar(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.";
  }
  if (file.size > RAW_INPUT_LIMIT) {
    return `Ukuran file terlalu besar. Maksimal ${formatUkuran(RAW_INPUT_LIMIT)} sebelum dikompresi otomatis.`;
  }
  if (file.type === "image/gif" || file.type === "image/avif") {
    // GIF/AVIF tidak bisa dikompresi browser (animasi/decode) — batas 2 MB
    // berlaku langsung ke file aslinya.
    if (file.size > IMAGE_SIZE_LIMIT) {
      return `GIF/AVIF tidak dikompresi otomatis, jadi ukurannya maksimal ${formatUkuran(IMAGE_SIZE_LIMIT)}.`;
    }
    return null;
  }
  return null;
}

// Validasi hasil akhir (setelah kompresi) — menjamin file di bucket ≤ 2 MB.
export function cekHasilKompresi(file: File): string | null {
  return file.size > IMAGE_SIZE_LIMIT
    ? `Gambar akhir tetap melebihi ${formatUkuran(IMAGE_SIZE_LIMIT)} setelah kompresi. Coba gambar dengan dimensi lebih kecil.`
    : null;
}
