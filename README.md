# E-Portofolio FK UMT - Firebase Hosting Spark

Situs aplikasi: https://e-portofolio-fk-umt-2026.web.app/
Proyek Firebase: e-portofolio-fk-umt-2026
Paket yang diverifikasi di konsol: Spark (tanpa penagihan).

Desain, warna, dan komponen antarmuka utama dipertahankan. Halaman utama memakai backend live Google Apps Script + Google Sheets. Demo terpisah tersedia pada /demo.html#demo.

## Build dan deployment

1. Jalankan pengujian: node tests/live.js; node tests/review-live.js; node tests/render.js (jalankan sebagai perintah terpisah).
2. Tetapkan variabel ELOGBOOK_API_URL ke URL deployment Apps Script /exec yang digunakan institusi.
3. Jalankan node build.js.
4. Setelah Firebase CLI terautentikasi, jalankan node scripts/deploy-firebase.js e-portofolio-fk-umt-2026.

Skrip hanya menerbitkan public/. firebase.json tidak mengonfigurasi Functions, App Hosting, Cloud Run, atau layanan yang memerlukan Blaze. Pertahankan proyek pada Spark dan jangan tautkan akun penagihan.

## Hasil verifikasi 25 Oktober 2026

- Firebase Hosting berhasil menerbitkan lima berkas tampilan.
- 43 pemeriksaan regresi backend dan 40 pemeriksaan render lulus di Cloud Shell sebelum deployment.
- 15 pemeriksaan backend terpisah juga lulus pada lingkungan lokal.
- Uji pendaftaran sintetis melalui situs Firebase tersimpan di Google Sheets. Baris uji dibersihkan sesudah verifikasi.
- Akun admin awal tersedia, tetapi masih mewajibkan pemilik mengganti kata sandi sementara. Uji alur penilaian lengkap dengan akun operasional belum selesai.

Jangan menyimpan kata sandi admin, kode otorisasi, kunci layanan, atau data pasien di repositori. Panduan migrasi: docs/Firebase_Hosting_Spark.md. Backend terbangun: server/Code.gs.
