# Status migrasi Firebase - 25 Oktober 2026

Situs baru: https://e-portofolio-fk-umt-2026.web.app/
Hosting: Firebase Hosting, proyek e-portofolio-fk-umt-2026, paket Spark.
Backend: Google Apps Script dan Google Sheets.

Selesai:
- Konfigurasi hosting statis dan build dengan URL backend.
- Autentikasi Firebase CLI dan deployment dari Cloud Shell.
- Tema utama dipertahankan.
- 43 pemeriksaan backend dan 40 pemeriksaan render lulus pada Cloud Shell; 15 pemeriksaan terpisah lulus secara lokal.
- Pendaftaran sintetis dari situs Firebase berhasil disimpan di basis data server dan diverifikasi melalui pembacaan terpisah. Data uji dibersihkan.

Masih memerlukan tindakan pemilik:
- Masuk ke aplikasi dan mengganti kata sandi admin sementara. Kebijakan perubahan kredensial mengharuskan pemilik melakukan langkah ini sendiri.
- Sesudah itu, alur akun admin, penugasan, validasi, dan penilaian operasional perlu diuji melalui aplikasi.

Tidak ada paket Blaze, metode pembayaran, atau layanan Firebase berbayar yang diaktifkan dalam migrasi ini.
