# E-Logbook Profesi Dokter
Program Studi Profesi Dokter, Fakultas Kedokteran Universitas Murni Teguh. Rumah sakit pendidikan utama: RS Murni Teguh Methodist Susanna Wesley.

Petunjuk lengkap untuk pengguna dan tim TI: `docs/Petunjuk_Penggunaan_E-Logbook_FK_UMT.pdf`.

## Struktur
- `index.html`, `config.js`, `logo-fk.svg`: aplikasi web statis (Render Static Site).
- `src/`: kode sumber. `node build.js` menghasilkan `index.html`, `server/Code.gs`, dan berkas turunan lain.
- `server/Code.gs`: backend Google Apps Script (data di Google Sheets). `server/appsscript.json`: manifes.
- `tests/`, `server/test.js`: pengujian (Node + jsdom). `npm i jsdom` lalu `node tests/demo.js`, `node tests/server.js`, `node server/test.js`.

## Mode
- `API_URL` kosong di `config.js`: mode demonstrasi (data di peramban, akun contoh via `#demo`).
- `API_URL` berisi URL aplikasi web Apps Script (`.../exec`): mode server (data sebenarnya).

Jangan mengubah `index.html` langsung. Ubah `src/` lalu jalankan `node build.js`.
