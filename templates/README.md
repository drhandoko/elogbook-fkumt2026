# Template E-Portofolio FK UMT

Paket persiapan impor untuk tahap **S.Ked** dan **Profesi**. Penambahan berkas ini tidak mengimpor akun, nilai, atau data apa pun ke aplikasi live.

## Pilih berkas yang benar

- `fk-umt/pengguna.csv`: header kosong yang sesuai importer pengguna FK UMT saat ini.
- `fk-umt/nilai.csv`: header kosong untuk nilai tahap PSSK (S.Ked) atau PSPD (Profesi).
- `source-reference/`: arsip bahan sumber, **bukan berkas siap impor ke FK UMT**. Contoh data dan petunjuknya berlaku untuk aplikasi sumber; jangan mengunggahnya ke produksi.

Template operasional sengaja tidak berisi baris contoh. Isilah data yang berwenang Anda kelola, periksa pratinjau, dan mulai dari lingkungan uji. Jangan commit file berisi data mahasiswa, pasien, kata sandi, atau nilai nyata ke repository publik.

## Pengguna

Kolom: `nama,email,peran,nim,kelompok,mulai,angkatan`. Peran majemuk pada template resmi memakai `|`, misalnya `dosen|preseptor`; parser saat ini juga menerima `+`. Urutan kolom wajib dipertahankan karena importer pengguna membaca posisi kolom, bukan memetakan nama header. Peran yang tersedia: mahasiswa, dosen, preseptor, kaprodi, admin. Jangan menambahkan peran koordinator atau kolom prodi dengan anggapan otomatis didukung; cek implementasi dan hak akses server terlebih dahulu.

Pada implementasi yang diperiksa, email yang sudah terdaftar dilewati, bukan diperbarui. Kolom NIM, kelompok A–D, tanggal mulai rotasi (YYYY-MM-DD), dan angkatan dipakai untuk mahasiswa. Template ini belum merupakan importer khusus penerimaan mahasiswa S.Ked: jangan mengisi rotasi klinis fiktif untuk mahasiswa sarjana. Pemisahan tampilan program tidak mengubah kontrak importer ini.

## Nilai

Kolom: `nim,tahap,stase,komponen,nilai,tanggal`. NIM harus sudah terdaftar. `tahap` wajib diisi PSSK atau PSPD; jangan mengandalkan default PSPD. Kolom `stase` berisi nama blok untuk PSSK atau kode stase untuk PSPD. Nilai 0–100; tanggal YYYY-MM-DD.

- PSSK: CBT, OSCE, Tutorial, Praktikum; nama blok harus cocok dengan master yang tersedia.
- PSPD: CBT, OSCE, CBD, MSF; kode stase harus cocok dengan master yang tersedia.
- Baris untuk mahasiswa/tahap/unit/komponen yang sama dapat memperbarui nilai lama. Tinjau dampaknya sebelum menerapkan.
- Nilai dimensi OSCE 0–3, global rating, percobaan berulang, dan skor berdimensi tidak boleh dipaksa menjadi satu nilai 0–100 tanpa aturan penilaian yang disahkan.

## Kompatibilitas arsip sumber

| Berkas sumber | Status untuk FK UMT |
| --- | --- |
| 01 diagnosis, 02 keterampilan, 03 obat | Referensi master; belum ada adapter impor langsung yang diverifikasi. |
| 04 pengguna | Urutan sumber email,nama berbeda dari target nama,email; ada prodi, dan perilaku update akun berbeda. Kedua pemisah peran + dan | diterima parser, tetapi ini tidak membuat keseluruhan format kompatibel. Perlu pemetaan eksplisit. |
| 05 relabel prodi | Tidak ada importer relabel yang kompatibel; jangan gunakan sebagai perpindahan program otomatis. |
| 06a nilai total | Perlu pemetaan email ke NIM serta tahap, unit, dan komponen yang sah. |
| 06b nilai per dimensi | Memerlukan model dimensi dan aturan bobot; jangan menjumlahkan otomatis. |
| 07a CBT per sesi, 07b format lama | Memerlukan pemetaan ujian, identitas, tanggal, kategori dan duplikasi. |
| 08 OSCE | Memerlukan model station/dimensi dan global rating; tidak setara dengan satu skor OSCE. |

## Provenans dan hak cipta

Arsip disalin dari folder template yang ditunjuk pengguna: https://drive.google.com/drive/folders/1UcB4iEj3kfpxP9B1iBI58cqBR7ZJylHs . Izin publikasi ulang dikonfirmasi pemilik tugas pada 10 November 2026. Sepuluh CSV dipertahankan sebagai referensi. README dan PDF asli tidak diterbitkan di paket ini; panduan FK UMT ditulis terpisah agar identitas aplikasi tetap jelas.

Repository sumber: https://github.com/basharihasan/jejak-essential . Lisensi repository sumber AGPL-3.0 disertakan di `source-reference/SOURCE-REPOSITORY-LICENSE.txt` untuk menjaga konteks hukum. Ini bukan klaim bahwa semua dokumen Drive memiliki lisensi identik, dan bukan perubahan lisensi seluruh repository FK UMT. Logo institusi sumber tidak boleh digunakan sebagai identitas aplikasi FK UMT. Tidak ada implementasi Rails dari repository sumber yang disalin pada paket ini.

`manifest.json` mencatat tautan asal dan hash SHA-256 file arsip. Template sumber berisi contoh yang dapat menjadi data nyata bila diimpor. Gunakan hanya untuk memahami format, bukan sebagai data produksi.
