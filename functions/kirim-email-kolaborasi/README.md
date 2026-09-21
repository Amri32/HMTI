# Fungsi email pengajuan kolaborasi

Mengirim notifikasi email ke inbox pengurus setiap ada pengajuan baru dari
halaman kontak. Tanpa fungsi ini, pengajuan hanya tersimpan di panel admin dan
pengunjung masih harus menekan "kirim" di aplikasi emailnya sendiri.

## Kenapa harus di server?

Situs HMTI diekspor statis (`next.config.ts` → `output: "export"`): tidak ada
server yang bisa menyimpan kunci rahasia. Kunci email yang ditaruh di browser
bisa dicuri siapa pun yang membuka DevTools, lalu dipakai mengirim spam atas
nama HMTI. Jadi pengiriman dilakukan di Appwrite Function, dan browser hanya
menyimpan pengajuan ke Appwrite seperti biasa.

```
pengunjung isi form → Appwrite simpan dokumen → Appwrite panggil fungsi ini
                                                → Resend kirim email ke inbox HMTI
                                                → Resend kirim konfirmasi ke email pengaju
```

## Yang perlu disiapkan

1. **Akun Resend** + kunci API (lihat bagian di bawah).
2. **Akun Appwrite** dengan akses project `hmti`.

## Bagian 0 — Daftar Resend dan ambil kunci API

Resend punya dua tahap: akun (siapa pemiliknya) dan kunci API (yang dipakai
fungsi ini). Keduanya dibuat sekali saja.

**Penting soal alamat pendaftaran.** Selama domain organisasi belum diverifikasi,
Resend hanya mengizinkan pengiriman **ke alamat pemilik akun** (pengirim
bawaannya `onboarding@resend.dev`). Karena notifikasi ini memang ditujukan ke
inbox HMTI, daftarkan memakai **`hmti.ubsi.margonda@gmail.com`** — kalau
didaftarkan dengan alamat lain, email ke inbox HMTI akan ditolak `403`.

1. Buka <https://resend.com> → **Get Started** / **Sign up**.
2. Pilih **Continue with Google**, lalu pilih akun
   `hmti.ubsi.margonda@gmail.com`. (Bisa juga daftar dengan alamat itu +
sandi baru, hasilnya sama.)
3. Selesaikan verifikasi email kalau diminta, lalu di layar *onboarding* pilih
alur **kirim email saja** dan **lewati (skip)** penambahan domain — kita belum
punya domain terverifikasi, dan itu tidak perlu untuk sekarang.
4. Di panel kiri buka **API Keys** → **Create API Key**:
   - Name: `hmti-website`
   - Permission: **Sending access** (cukup untuk fungsi ini; `Full access` juga
     jalan tapi tidak perlu)
   - Domain: `All domains`
5. Tekan **Add**, lalu **salin nilai kuncinya sekarang** (berawalan `re_`).
   Kunci hanya ditampilkan sekali — setelah halaman ditutup, nilainya tidak bisa
   dilihat lagi dan harus dibuat ulang.

Kuota gratis Resend jauh lebih dari cukup untuk notifikasi pengajuan (ribuan
email per bulan, dengan batas harian). Angka pastinya ada di
<https://resend.com/pricing> — untuk situs HMTI volume ini tidak akan tersentuh.

Simpan kunci itu di tempat aman sebentar; ia dipindahkan ke Appwrite di langkah
berikutnya. **Jangan** ditaruh di `.env.local` atau file mana pun di repo ini —
situs diekspor statis, jadi apa pun yang masuk `.env` ikut terkirim ke browser
pengunjung dan bisa dicuri lewat DevTools.

## Di mana kunci itu ditaruh

Ditaruh di **lingkungan Appwrite Function**, bukan di kode:

1. Appwrite Console → **Functions** → `kirim-email-kolaborasi`.
2. Tab **Settings** → **Environment variables** → **Create variable**.
   - Key: `RESEND_API_KEY`
   - Value: kunci `re_...` tadi
3. ⚠️ **Deploy ulang fungsi.** Variabel lingkungan baru hanya berlaku setelah
   deployment berikutnya dibuat — kalau dilewati, fungsi masih membaca nilai lama
   dan log akan berbunyi `RESEND_API_KEY kosong`.

`main.js` membacanya lewat `process.env.RESEND_API_KEY`. Kunci tidak pernah
menyentuh repo, tidak ikut `git push`, dan tidak pernah sampai ke browser.

## Langkah pasang (Appwrite Console)

> **Ada dua tempat bernama "Settings" — jangan tertukar.**
>
> | Tempat | Cara masuk | Isinya |
> | --- | --- | --- |
> | Settings **project** | item paling bawah di sidebar kiri (ikon gerigi) | Global variables, API keys, Firewall |
> | Settings **fungsi** | Functions → klik fungsinya → tab **Settings** di dalam halaman itu | Events, Execute access, Build settings |
>
> Yang dipakai untuk `RESEND_API_KEY`, Events, dan Execute access adalah
yang **fungsi**. Global variables juga bisa dipakai (nilainya mengalir ke semua
fungsi & Sites), tapi jangan tertukar dengan yang di bawah ini.


1. Buka **Functions → Create function** (kalau fungsinya belum ada).
   - Name: `kirim-email-kolaborasi`
   - Runtime: **Node.js 22**
   - Entrypoint: `src/main.js` — harus persis sama dengan lokasi `main.js`
     di dalam arsip (`src/main.js`, lihat isi `code.tar.gz` di bawah).
2. Masuk ke fungsinya, buka tab **Settings** di dalam halaman fungsi itu, lalu
   bagian **Environment variables** atau **Variables** — tambahkan (kunci
   `RESEND_API_KEY` dari *Bagian 0* di atas). **Key** diisi *nama* variabel,
   **Value** diisi kuncinya:

   | Variabel | Nilai |
   | --- | --- |
   | `RESEND_API_KEY` | kunci API Resend (wajib) |
   | `EMAIL_TUJUAN` | `hmti.ubsi.margonda@gmail.com` (opsional, ini default) |
   | `EMAIL_PENGIRIM` | `HMTI Margonda <onboarding@resend.dev>` (opsional, ini default) |
   | `URL_SITUS` | alamat situs HMTI, mis. `https://hmti.ubsi.ac.id` (opsional) |
   | `EMAIL_KONFIRMASI_PENGAJU` | `true` (opsional, ini default — lihat bagian konfirmasi pengaju di bawah) |
3. Masih di tab **Settings** halaman fungsi itu, cari bagian **Events** — di
   console baru bagian ini berupa kartu accordion di bawah kartu lain (Name,
   Runtime, Variables, …), bukan bagian yang selalu terbuka. Gunakan kotak
   **"Search settings…"** yang ada di dalam halaman Settings fungsi (bukan
   Ctrl+K global di kanan atas — itu hanya mencari halaman, bukan kartu
   setting). Ketik `events` lalu buka kartunya. Tambahkan trigger:
   - `databases.hmti.tables.collab_messages.rows.*.create`

   ⚠️ Nama event memakai pola **TablesDB** (`tables` + `rows`). Pola lama
   `databases.hmti.collections.collab_messages.documents.*.create` tidak pernah
   dipicu lagi di Appwrite versi baru — kalau trigger masih memakai pola itu,
   pengajuan tetap tersimpan di panel tapi email tidak pernah terkirim dan di
   menu **Executions** tidak muncul apa pun. Perbaikannya cukup mengganti nama
   event di trigger, tanpa deploy ulang kode.
4. **Deploy kode lewat tab Manual** (bukan editor — Console tidak punya editor kode, dan
   terminal di Console adalah Appwrite CLI yang menolak `push`/`pull`). Buka
   **Deployments → Create deployment**, lalu:
   - Dialognya hanya meminta file: **drop `code.tar.gz`** dari akar repo —
     buat ulang kapan saja dengan:
     ```bash
     tar --exclude=README.md -czf code.tar.gz -C functions/kirim-email-kolaborasi .
     ```
   - **Entrypoint TIDAK ditanya di dialog ini** — itu settingan level fungsi.
     Kalau mau memastikan, cek tab **Settings** fungsi ini: field Entrypoint
     harus `src/main.js` (sama dengan langkah 1). Deployment lama yang sudah
     berjalan berarti nilainya sudah benar — tidak perlu diubah-ubah.
   - Klik **Create deployment** → tunggu build selesai. Kalau deployment baru
     berstatus *Ready* tetapi yang *Active* masih yang lama, buka menu **⋯**
     pada baris deployment baru lalu pilih **Activate**.
5. **Execute access**: jangan buka ke publik. Set ke **Users / team admin**
   (Console baru: tab **Security**; Console lama: tab **Settings**). Fungsi ini
   dipanggil Appwrite lewat **trigger event**, dan trigger tidak butuh Execute
   permission apa pun — jadi mengunci Execute access tidak mengganggu
   pengiriman email. Sebagai lapisan kedua, kode `main.js` juga menolak dengan
   `403 forbidden_source` setiap pemanggilan HTTP yang tidak membawa header
   event Appwrite yang sah (`databases.hmti.tables.collab_messages.rows.*.create`).
6. **Deploy ulang** setiap kali variabel lingkungan berubah, lalu pastikan status
deployment terbaru **Active**.

> Isi `code.tar.gz` harus berada di akar arsip (`src/main.js` +
> `package.json`), bukan di dalam subfolder — perintah di atas sudah begitu.
> `package.json` sengaja ikut supaya runtime memperlakukan `main.js` sebagai
> modul ESM.

## Menguji

- **Tanpa deploy sama sekali**, di komputer masing-masing:
  ```bash
  node scripts/uji-fungsi-email.mjs
  ```
  Skrip itu memanggil fungsi dengan payload event tiruan dan mencegat permintaan
  ke Resend, jadi tidak ada email sungguhan yang terkirim dan kunci API asli
  tidak dibutuhkan. Cocok dijalankan sebelum meng-upload `code.tar.gz`.
- Cara termudah sesudah deploy: kirim pengajuan sungguhan dari `/kontak`, lalu
  cek inbox `hmti.ubsi.margonda@gmail.com` dan menu **Executions** pada fungsi.
- Cara cepat tanpa mengisi form: buka tab **Execute** di Console dan kirim body
  JSON berikut (dokumen tiruan). ⚠️ Karena fungsi hanya menerima eksekusi dari
  trigger event, uji dari tab Execute wajib menyertakan `events` — persis
  seperti yang dikirim Appwrite saat row dibuat:

  ```json
  {
    "events": [
      "databases.hmti.tables.collab_messages.rows.uji-coba-1.create"
    ],
    "payload": {
      "$id": "uji-coba-1",
      "$createdAt": "2026-09-20T16:04:00.000Z",
      "nama": "Uji Coba",
      "email": "pengaju@example.com",
      "jenis": "Kolaborasi program kerja",
      "pesan": "Ini pengajuan percobaan."
    }
  }
  ```

  Tanpa `events` (atau dengan nama event pola lama `...collections...documents...`)
  fungsi membalas `403 {"ok":false,"reason":"forbidden_source"}` — itu tanda
  pagarnya bekerja, bukan kerusakan. Balasan `{"ok": true, "code": "KOL-..."}`
  berarti Resend menerima emailnya. Nomor referensi pada email harus sama
  dengan yang tampil di laporan pengaju.

## Kalau email tidak masuk

| Gejala | Sebab dan jalan keluar |
| --- | --- |
| Log: `RESEND_API_KEY kosong` | Variabel belum diisi, atau deployment lama belum di-deploy ulang setelah menambah variabel (variabel hanya berlaku pada deployment berikutnya). |
| Pengajuan masuk di panel tapi email tidak terkirim, menu Executions kosong | Trigger masih memakai nama event lama `...collections.collab_messages.documents.*.create`. Ganti menjadi `databases.hmti.tables.collab_messages.rows.*.create` (lihat langkah 3). |
| Log: `Konfirmasi pengaju ... masih memakai domain uji Resend` | Konfirmasi ke pengaju aktif tetapi `EMAIL_PENGIRIM` masih `onboarding@resend.dev`. Verifikasi domain lalu isi `EMAIL_PENGIRIM` (lihat bagian konfirmasi pengaju), atau matikan dengan `EMAIL_KONFIRMASI_PENGAJU=false`. |
| Log: `Eksekusi ditolak: bukan berasal dari trigger event` + balasan `403 forbidden_source` | Fungsi dipanggil langsung (bukan oleh trigger), atau nama event di body tidak memenuhi pola `databases.hmti.tables.collab_messages.rows.*.create`. Kalau ini muncul saat pengajuan sungguhan, cek nama event di trigger (langkah 3). |
| Resend menjawab `403 validation_error` | Pengirim `onboarding@resend.dev` hanya boleh mengirim ke alamat pemilik akun Resend. Daftarkan Resend memakai email tujuan, atau verifikasi domain lalu set `EMAIL_PENGIRIM`. |
| Resend menjawab `422` tentang `reply_to` | Fungsi otomatis mencoba ulang tanpa `reply_to`; kalau masih gagal, isi `EMAIL_PENGIRIM` dengan domain terverifikasi. |
| Email masuk dua kali | Pastikan hanya ada satu trigger `...create` pada tabel `collab_messages`; fungsi juga memakai `Idempotency-Key` per dokumen sebagai pengaman. |
| Email masuk tapi nomor referensi beda | Algoritma di `main.js` dan `lib/kolaborasi.ts` harus sama — `npm test` (tests/fungsi-email.test.mjs) menjaga keduanya tetap sinkron. |

## Email konfirmasi ke pengaju

Setiap pengajuan yang berhasil tersimpan memicu dua email: notifikasi ke inbox
HMTI (dengan `Reply-To` alamat pengaju, jadi tinggal tekan "Balas") dan
konfirmasi otomatis ke email pengaju berisi salinan pengajuan + nomor
referensinya. Konfirmasi pengaju aktif secara default; matikan dengan variabel
lingkungan `EMAIL_KONFIRMASI_PENGAJU=false` (lalu deploy ulang).

Ada satu syarat sebelum konfirmasi pengaju benar-benar terkirim: **domain
pengirim harus terverifikasi di Resend**. Selama pengirim masih
`onboarding@resend.dev` (domain uji), Resend hanya mengizinkan pengiriman ke
alamat pemilik akun — dan email pengaju bisa beralamat apa pun. Kalau begitu,
fungsi tetap mengirim email ke HMTI, tetapi menolak konfirmasi pengaju dengan
alasan `applicant_email_requires_verified_domain` (terlihat di log Executions).

Cara mengaktifkan penuh:

1. Punya domain organisasi (mis. `hmti.ubsi.ac.id`) → di panel Resend buka
   **Domains** → **Add Domain** → ikuti record DNS (SPF/DKIM) yang diminta.
2. Setelah status domain **Verified**, ubah variabel fungsi:
   - `EMAIL_PENGIRIM`: `HMTI Margonda <noreply@hmti.ubsi.ac.id>` (ganti sesuai
     domain).
3. **Deploy ulang** fungsi agar variabel baru terbaca.
4. Uji: kirim pengajuan dari `/kontak` memakai email Gmail pribadi, lalu pastikan
   dua inbox sama-sama menerima email.

Tanpa domain sendiri, pengaju tetap menerima nomor referensi di layar begitu
form terkirim — konfirmasi emailnya hanya tambahan.

## Yang belum bisa dilakukan sekarang

**Status laporan otomatis di sisi pengaju.** Laporan yang dipegang pengaju
adalah salinan saat pengiriman; perubahan status di panel admin tidak mengalir
ke perangkatnya. Agar bisa, halaman laporan harus membaca ulang dokumen
`collab_messages` — tapi itu berarti membuka akses baca publik ke koleksi
tersebut atau membuat endpoint tambahan; keduanya disengaja tidak dilakukan
sekarang demi kesederhanaan dan privasi (catatan internal pengurus ada di
dokumen yang sama).

## Catatan perawatan

- `main.js` sengaja **tanpa dependensi** (hanya `fetch` bawaan) supaya bisa
  di-upload sebagai `code.tar.gz` tanpa proses build.
- `package.json` di folder ini hanya menandai `main.js` sebagai modul ESM
  (`"type": "module"`); tidak ada dependensi yang dipasang saat build.
- `code.tar.gz` adalah artefak lokal (sudah di-`.gitignore`) — kalau `main.js`
  diubah, buat ulang sebelum di-upload.
- Nama variabel lingkungan diatur di Console, bukan di repo — kunci tidak pernah
  masuk ke git.
- Perubahan pada `main.js` harus di-deploy ulang lewat tab **Deployments**.
