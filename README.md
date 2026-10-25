# E-Portofolio Profesi Dokter FK UMT — v3

Desain dan tema asli dipertahankan. Versi live memakai Google Apps Script + Google Sheets, bukan penyimpanan lokal.

## Menjalankan dan menguji
- Build: node build.js
- Pengujian rilis: node tests/live.js dan node tests/render.js (tanpa dependensi tambahan).
- Uji vektor PBKDF2 produksi: 600.000 iterasi SHA-256 dibandingkan dengan Node crypto.
- tests/demo.js, tests/server.js, dan server/test.js merupakan pengujian kontrak versi sebelumnya; fixture lamanya belum mengikuti penugasan/revisi/rubrik versi 3 dan bukan pemeriksaan rilis v3.

## Versi live
1. Salin server/Code.gs ke satu proyek Google Apps Script. File ini dihasilkan dari vendor/sjcl.js + server/api.gs + src/core.js + server/live.gs. Jangan memasang keduanya Code.gs dan api.gs dalam satu proyek.
2. Pada Project Settings, tambahkan Script Property ADMIN_EMAIL.
3. Jalankan setupLive. Pemilik akun menyetujui izin Google; fungsi membuat database kosong tanpa akun contoh.
4. Buat deployment Web app: execute as owner, access Anyone. API mewajibkan token sesi dan memeriksa otorisasi tiap baris. Halaman persetujuan publik hanya memakai token kasus acak.
5. Di Render isi ELOGBOOK_API_URL dengan URL /exec. Build command node build.js, publish directory public.
6. Masuk dengan akun awal pada log eksekusi dan ubah kata sandi. Buat akun, periode, wahana dan penugasan pembimbing.

API_URL kosong pada versi live menampilkan halaman belum dikonfigurasi; tidak pernah beralih diam-diam menjadi demo. Demo tersedia terpisah di /demo.html.

## Perubahan penting
- Akses dosen/preseptor dibatasi mahasiswa, stase, wahana, dan tanggal penugasan.
- Persetujuan dapat diberikan, ditolak, atau ditarik; server menegakkan syarat validasi.
- Rubrik Mini-CEX, DOPS, CBD, Presentasi Kasus, dan MSF terpisah. MSF memerlukan tiga penilai berbeda.
- EPA memerlukan referensi asesmen yang mendukung. Rubrik awal dan kriteria entrustment harus disahkan tim kurikulum.
- Status simpan, retry, proteksi perubahan yang belum tersimpan, dan deteksi konflik dengan revisi per baris.
- AES-CCM-256 untuk identitas tambahan; PBKDF2-HMAC-SHA256 600.000 iterasi untuk password baru. Format lama dapat diverifikasi/dekripsi untuk migrasi.
- Audit perubahan, timestamp pengajuan/respons, ekspor CSV, cetak/PDF, prioritas pengembangan, tag onkologi, dan panduan bantuan.
- Tidak ada data pasien atau password pada source code.

Panduan: docs/panduan-live.html. Catatan perubahan: CHANGELOG-2026-10-25.md.

## Batas pengujian
Pengujian otomatis memakai simulator layanan Google dan pemeriksaan HTML hasil render. Pengujian nyata lintas perangkat dan pemulihan database dilakukan setelah pemilik akun menyetujui izin serta backend terpasang. Jangan menyebut layanan live aktif sebelum alur tersebut diverifikasi.

## Dependensi kriptografi
SJCL vendored pada commit 35b0641709cbefccb0b58b39b2862152a4f4f428 dari bitwiseshiftleft/sjcl. Lisensi ada di vendor/SJCL-LICENSE.txt. Kunci enkripsi hanya di Script Properties; jangan commit ke repository.
