# Catatan Perubahan E-Portofolio FK UMT
Tanggal: 25 Oktober 2026 (WIB)
Versi: 3.0.0
Dasar: masukan peninjauan aplikasi dan instruksi mempertahankan desain serta menyiapkan versi live.

## Desain yang dipertahankan
Warna, tema terang/gelap, logo, sidebar, navigasi utama, kartu, dan grafik asli. Penambahan menggunakan komponen yang sudah ada.

## Perubahan yang diterapkan
1. Pemisahan versi live dan demo.html. Konfigurasi backend kosong pada live menampilkan status belum aktif, bukan menyimpan diam-diam di peramban.
2. Build untuk Render dengan ELOGBOOK_API_URL dan direktori public.
3. Setup Apps Script mandiri untuk membuat spreadsheet live kosong.
4. Penugasan pembimbing melalui admin: mahasiswa, pembimbing, stase, wahana, dan rentang tanggal. Dosen tanpa penugasan tidak dapat membaca seluruh kohort.
5. Persetujuan pasien versi FKUMT-2026-01: setuju, menolak, tarik persetujuan. Penolakan/penarikan tercatat, menghapus identitas tambahan, dan mengeluarkan kasus dari capaian tervalidasi.
6. Pemeriksaan persetujuan dan penugasan pada server sebelum validasi.
7. Identitas tambahan pasien opsional; kode kasus diprioritaskan.
8. Enkripsi AES-CCM-256 dengan tag 128-bit memakai SJCL yang disertakan dalam paket. Migrasi baca format enkripsi lama tetap didukung.
9. PBKDF2-HMAC-SHA256 600.000 iterasi untuk password baru; upgrade hash lama saat login.
10. Rubrik terpisah: Mini-CEX, DOPS, CBD, Presentasi Kasus, MSF. Penilai mengisi skor secara eksplisit, tanpa nilai default enam.
11. MSF menggabungkan tiga penilai berbeda dan menolak penilaian ganda.
12. EPA mengharuskan bukti asesmen serta konteks stase.
13. Nilai CBD/MSF dapat berasal dari asesmen selesai bila nilai impor belum tersedia.
14. Status penyimpanan, retry, perlindungan perubahan pada sesi, masuk ulang, dan tinjauan konflik. Tidak ada salinan data sensitif otomatis di localStorage pada versi live.
15. Pemeriksaan revisi per baris untuk menghindari penimpaan diam-diam. Batch gagal tidak menyimpan sebagian perubahan.
16. Audit perubahan kasus, asesmen, penugasan dan persetujuan.
17. Timestamp pengajuan/respons dari server untuk menghitung waktu umpan balik dalam jam sebenarnya.
18. Prioritas pengembangan, jumlah observasi/penilai, rencana tindak lanjut, target observasi ulang, serta tag kegiatan unggulan onkologi.
19. Ekspor CSV dan cetak/Simpan PDF melalui dialog cetak peramban. Identitas tambahan pasien tidak dimasukkan ke ekspor.
20. Panduan versi live dan bantuan pada halaman masuk; fungsi cadangan database dan petunjuk pemulihan.

## Pengujian
- 43 pemeriksaan regresi backend lulus, termasuk akses, consent, MSF, rubrik, konflik, audit, transaksi batch, dan kriptografi.
- 40 pemeriksaan HTML hasil render lulus untuk menu mahasiswa, dosen, preseptor, kaprodi, admin, serta dashboard kosong.
- Vektor PBKDF2 produksi 600.000 iterasi cocok dengan implementasi Node crypto; sekitar 6,3 detik pada lingkungan pengujian.
- Tes regresi cepat memakai 1.000 iterasi; kode produksi tetap 600.000.
- Pengujian lama berbasis kontrak v2 tidak dijadikan pemeriksaan rilis v3 karena fixture-nya belum mengikuti kebijakan penugasan/revisi/rubrik baru.
- Pengujian ini tidak menggantikan uji keamanan independen atau uji penerimaan klinis.

## Status deployment
Kode backend dan konfigurasi live disiapkan. Aktivasi memerlukan persetujuan izin Google oleh pemilik akun, pembuatan deployment /exec, pemasangan URL di Render, dan uji lintas perangkat. Status ini akan diperbarui setelah verifikasi nyata.

## Keputusan institusi yang masih diperlukan
Pengesahan rubrik asesmen dan kriteria entrustment; kebijakan retensi data serta kontak layanan privasi; jadwal cadangan dan uji pemulihan. Aplikasi menyediakan alur teknis tetapi tidak menetapkan kebijakan klinis/akademik tersebut secara sepihak.
