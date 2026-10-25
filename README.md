# E-Portofolio FK UMT

Perbaikan versi 3 mempertahankan tema aplikasi dan memisahkan situs live dari data contoh.

## Menjalankan dan memeriksa

- Node.js: `node build.js` menghasilkan situs siap hosting di `public/` dan backend `server/Code.gs`.
- Backend: `node tests/live.js` dan `node tests/review-live.js`.
- Tampilan: `node tests/render.js`.
- `tests/live.js` mempercepat PBKDF2 hanya di simulator; kode produksi memakai 600.000 iterasi.

## Aktivasi live

1. Buat proyek Google Apps Script milik institusi. Salin `server/Code.gs`, ganti ADMIN_EMAIL, dan pasang manifes `server/appsscript.json`.
2. Jalankan `setupLive`, setujui izin Google setelah meninjau cakupannya, dan simpan sandi admin sementara dari log eksekusi secara pribadi.
3. Deploy sebagai aplikasi web. Jalankan sebagai pemilik; akses endpoint tersedia untuk pengguna aplikasi. Data pendidikan tetap memerlukan autentikasi aplikasi dan otorisasi per baris. Halaman persetujuan pasien tidak menampilkan data kasus.
4. Pada layanan Render yang sudah ada, tetapkan Build Command `node build.js`, Publish Directory `public`, dan variabel lingkungan `ELOGBOOK_API_URL` ke URL deployment Apps Script yang berakhiran `/exec`.
5. Uji mahasiswa mengajukan kasus, pasien memberikan keputusan, penilai memvalidasi, dan hasil terbaca setelah masuk dari sesi/perangkat lain. Atur penugasan pembimbing sebelum mahasiswa mengajukan kasus.

`/demo.html#demo` memakai data contoh di peramban. Halaman utama memakai backend live dan tidak beralih diam-diam ke demo apabila backend belum dikonfigurasi. Backend dan deployment live belum dinyatakan aktif hanya karena pengujian simulator berhasil.

Panduan operasional: `docs/panduan-live.html`. Jalankan `backupDatabase` untuk membuat salinan basis data; uji pemulihan pada salinan terpisah sebelum penggunaan operasional.

Rubrik awal dan ketentuan pendidikan tetap perlu pengesahan program studi sebelum penilaian sumatif. Kode tidak memuat akun mahasiswa atau pasien nyata.
