// Metadata slot gambar situs (koleksi site_images Appwrite) dalam bahasa
// manusia: nama slot mentah seperti "home-community" jadi "Foto hero beranda".
// Dipakai panel Media agar admin langsung paham slot itu tampil di halaman mana
// tanpa harus menebak key.
export type SlotMeta = {
  label: string;
  page: string;
  pageLabel: string;
  deskripsi: string;
  // false = slot ada di database tetapi tidak dibaca komponen publik mana pun
  // (disembunyikan dari daftar agar admin tidak mengubah gambar tanpa efek).
  dipakai?: boolean;
};

export const SLOT_META: Record<string, SlotMeta> = {
  "home-community": {
    label: "Foto utama beranda",
    page: "/",
    pageLabel: "Beranda",
    deskripsi:
      "Gambar besar di sisi kanan hero beranda; juga dipakai halaman Tentang dan tab Berorganisasi.",
  },
  "home-learning": {
    label: "Foto tab “Belajar”",
    page: "/",
    pageLabel: "Beranda",
    deskripsi: "Gambar pada tab Belajar di bagian pengembangan mahasiswa.",
  },
  "home-collaboration": {
    label: "Foto tab “Berkolaborasi”",
    page: "/",
    pageLabel: "Beranda",
    deskripsi:
      "Gambar tab Berkolaborasi beranda, kartu kecil hero, dan gambar besar bagian program.",
  },
  "proker-website": {
    label: "Preview proker: Website HMTI",
    page: "/proker",
    pageLabel: "Program Kerja",
    deskripsi: "Slot cadangan — tidak dibaca halaman publik.",
    dipakai: false,
  },
  "proker-baksos": {
    label: "Preview proker: Baksos",
    page: "/proker",
    pageLabel: "Program Kerja",
    deskripsi: "Slot cadangan — tidak dibaca halaman publik.",
    dipakai: false,
  },
};

// Fallback slot yang tidak ada di SLOT_META (mis. slot baru tanpa metadata).
export function slotMeta(key: string): SlotMeta {
  return (
    SLOT_META[key] ?? {
      label: key,
      page: "/",
      pageLabel: "Beranda",
      deskripsi: "",
    }
  );
}
