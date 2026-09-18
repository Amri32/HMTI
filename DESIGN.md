# HMTI UBSI Design Direction

Identity: organisasi mahasiswa Teknologi Informasi yang tertib, terbuka, dan dekat dengan kerja nyata.

Audience: mahasiswa, calon anggota, pihak kampus, masyarakat, dan calon mitra kegiatan.

Visual language: institutional editorial yang hangat, minimal, dan image-led. Tampilan mengambil ketegasan dari dokumen organisasi, ritme modul yang disiplin, serta aksen sinyal dari logo HMTI sebagai ciri yang berulang. Skala tipografi dibawa lebih berani (headline besar mendominasi pembuka tiap seksi) untuk energi yang lebih tegas tanpa menambah dekorasi.

References:
- Midday menjadi referensi sistem layout: headline besar, grid yang konsisten, demonstrasi isi melalui bidang lebar, dan perubahan ritme antarseksi. Struktur diadaptasi untuk narasi organisasi, bukan disalin sebagai landing SaaS.
- Sonos menjadi referensi art direction fotografi: satu gambar kuat per momen, crop yang berani, caption singkat, dan teks ditempatkan pada bidang solid agar tetap terbaca. Hanya dokumentasi HMTI yang nyata dan berizin yang boleh digunakan.
- Selama foto kegiatan resmi belum tersedia, homepage boleh memakai foto stok yang relevan sebagai ilustrasi sementara atas permintaan pemilik. Setiap foto wajib diberi label bahwa gambar bukan dokumentasi HMTI, menyimpan sumbernya, dan diganti dengan dokumentasi HMTI yang berizin sebelum publikasi institusional final.

Palette:
- Warm paper `#fcf9f1` menjadi canvas agar halaman terasa human dan cocok untuk konten panjang.
- Ink navy `#0e1b2a` menjadi warna utama untuk otoritas dan keterbacaan.
- Steel blue `#3c608b` menandai tautan dan tindakan.
- Signal yellow `#eadb31` dipakai terbatas sebagai aksen identitas pada permukaan gelap.

Typography:
- Newsreader dipakai pada heading dan pernyataan besar karena memberi karakter editorial tanpa terasa korporat.
- Instrument Sans dipakai pada navigasi, body, dan kontrol karena mudah dibaca pada ukuran kecil.

Layout: komposisi mengikuti bobot isi dalam grid 12 kolom pada layar lebar. Pernyataan organisasi memakai bidang besar, media memiliki stage sendiri, sedangkan data operasional memakai daftar dan garis pemisah, bukan kumpulan card seragam.

Spacing: jarak lebar memisahkan gagasan besar, sedangkan jarak rapat mengikat informasi yang masih satu kelompok.

Cards: card hanya dipakai ketika sebuah konten memang satu objek mandiri. Informasi lain tetap berada pada bidang halaman. Komponen interaktif kompleks menggunakan primitive headless Base UI agar visual tidak diwarisi dari template library.

Illustration and icons: logo resmi menjadi aset visual utama. Ikon hanya dipakai untuk kontrol yang memerlukan simbol, seperti tombol menu.

Identity motif: garis kuning pendek, angka indeks dua digit, dan crop besar emblem mengulang bahasa visual logo. Motif hanya muncul pada pembuka, navigasi, atau bidang penekanan.

Theme: light menjadi tema tetap karena website bersifat content-first dan mengambil bahasa visual dari dokumen organisasi serta media cetak. Bidang gelap dipakai sebagai penekanan, bukan sebagai mode utama.

Motion: gerak tetap singkat dan fungsional. Gunakan transisi untuk perubahan state, seperti drawer navigasi, hover tautan, indikator tab, dan pergantian panel; entrance media satu kali boleh dipakai untuk menegaskan arah komposisi. Semua gerak menghormati `prefers-reduced-motion`. Tidak ada text reveal, parallax, autoplay, atau loop dekoratif.

Pengecualian sadar (keputusan pemilik, 2026-09-18): marquee anggota divisi di halaman Struktur adalah satu-satunya loop yang diizinkan. Ia fungsional, bukan dekorasi: menjaga halaman tetap pendek, pause saat hover/focus, dan jatuh ke strip scroll manual saat `prefers-reduced-motion`. Tidak ada loop lain yang boleh ditambahkan tanpa keputusan pemilik.

Dial: ENERGY 3 / RHYTHM 3 / MOTION 2
