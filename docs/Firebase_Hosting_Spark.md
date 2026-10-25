# Firebase Hosting: paket Spark tanpa penagihan

Tujuan migrasi: mengganti hosting tampilan Render dengan Firebase Hosting sambil mempertahankan tema, backend Google Apps Script, dan basis data Google Sheets.

Gunakan Firebase Hosting klasik dengan paket Spark. Jangan aktifkan App Hosting, Blaze, Cloud Functions, Cloud Run, atau penagihan Google Cloud. firebase.json sengaja hanya memuat konfigurasi hosting statis.

## Langkah deployment

1. Di Firebase Console, buat proyek pada akun pemilik yang dipilih. Pengguna perlu meninjau persyaratan Firebase sebelum menerima perjanjian. Tidak diperlukan akun penagihan untuk Spark.
2. Gunakan Cloud Shell dari Firebase Console. Firebase CLI tersedia di Cloud Shell menurut dokumentasi Firebase.
3. Ambil cabang repositori yang berisi perbaikan e-portofolio dan konfigurasi Firebase. Jalankan pengujian rilis sebelum build.
4. Tetapkan ELOGBOOK_API_URL ke URL deployment Apps Script /exec lalu jalankan node build.js.
5. Jalankan node scripts/deploy-firebase.js PROJECT_ID. Skrip hanya mengirim public/ ke Firebase Hosting dan menolak build tanpa URL backend.
6. Catat URL web.app yang benar-benar dikembalikan deployment. Uji login, penugasan pembimbing, pengajuan, persetujuan, validasi, dan pembacaan ulang data melalui sesi berbeda.

Backend perlu dapat dipanggil oleh aplikasi web. Pengaturan akses deployment Apps Script memerlukan persetujuan pemilik. Autentikasi dan pembatasan akses data tetap ditegakkan oleh aplikasi.

Jangan menyimpan kata sandi, token OAuth, kunci layanan, isi basis data, atau identitas pasien dalam repositori maupun public/. Sumber backend dan berkas pengujian tidak diterbitkan karena direktori hosting dibatasi ke public/.

Status saat dokumen disiapkan: konfigurasi migrasi selesai; proyek Firebase belum dibuat dan situs Firebase belum diterbitkan.

Dokumentasi resmi:
https://firebase.google.com/docs/hosting/quickstart
https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
