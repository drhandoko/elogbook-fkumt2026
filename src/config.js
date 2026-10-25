/* ================= KONFIGURASI ================= */
/* URL aplikasi web Google Apps Script. Kosongkan untuk mode demo (data hanya di peramban). */
const API_URL = '';
const DEMO_MODE = typeof window !== 'undefined' && window.ELOGBOOK_DEMO === true;
const SERVER = !DEMO_MODE;
const LIVE_CONFIGURED = !!API_URL;
const APP_VERSION = '3.0.0';
/* Mode demo saja: daftar akun contoh pada halaman masuk hanya muncul bila alamat diakhiri #demo. */
const DEMO_HASH = '#demo';
const APP_NAME = 'E-Logbook Profesi Dokter';
const INSTITUSI = 'Fakultas Kedokteran Universitas Murni Teguh';
