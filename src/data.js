/* ================= DATA, SEED, SKOR ================= */
const DEMO_PW = 'password123';
const T0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseD = s => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const addD = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const dfmt = s => { if (!s) return '-'; const d = parseD(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); };
const n1 = x => (x == null || isNaN(x)) ? '-' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
const n0 = x => (x == null || isNaN(x)) ? '-' : String(Math.round(x));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const mean = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : null;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function RNG(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const dayDiff = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

const RSPU = 'RS Murni Teguh Methodist Susanna Wesley';
const LS_KEY = 'elogbook-umt-profesi-v1';

/* ---------- Master ---------- */
const STASES = [
  { id: 'ikm', nama: 'Ilmu Kesehatan Masyarakat dan Kedokteran Komunitas', pendek: 'IKM', smf: 'Kedokteran Komunitas', minggu: 8, tf: 30, tr: 0 },
  { id: 'anak', nama: 'Ilmu Kesehatan Anak', pendek: 'Anak', smf: 'Ilmu Kesehatan Anak', minggu: 10, tf: 28, tr: 12 },
  { id: 'obgyn', nama: 'Obstetri dan Ginekologi', pendek: 'Obgyn', smf: 'Obstetri dan Ginekologi', minggu: 10, tf: 24, tr: 14 },
  { id: 'ipd', nama: 'Ilmu Penyakit Dalam', pendek: 'IPD', smf: 'Ilmu Penyakit Dalam', minggu: 10, tf: 25, tr: 15 },
  { id: 'bedah', nama: 'Ilmu Bedah', pendek: 'Bedah', smf: 'Ilmu Bedah', minggu: 10, tf: 20, tr: 14 },
  { id: 'neuro', nama: 'Neurologi', pendek: 'Neuro', smf: 'Neurologi', minggu: 4, tf: 10, tr: 6 },
  { id: 'jiwa', nama: 'Psikiatri', pendek: 'Jiwa', smf: 'Psikiatri', minggu: 4, tf: 12, tr: 4 },
  { id: 'tht', nama: 'Telinga Hidung Tenggorok Kepala Leher', pendek: 'THT', smf: 'THT-KL', minggu: 3, tf: 10, tr: 4 },
  { id: 'mata', nama: 'Ilmu Kesehatan Mata', pendek: 'Mata', smf: 'Ilmu Kesehatan Mata', minggu: 3, tf: 10, tr: 4 },
  { id: 'kulit', nama: 'Dermatologi dan Venereologi', pendek: 'Kulit', smf: 'Dermatovenereologi', minggu: 3, tf: 14, tr: 2 },
  { id: 'forensik', nama: 'Ilmu Kedokteran Forensik dan Medikolegal', pendek: 'Forensik', smf: 'Kedokteran Forensik', minggu: 3, tf: 6, tr: 4 },
  { id: 'anestesi', nama: 'Anestesiologi dan Terapi Intensif', pendek: 'Anestesi', smf: 'Anestesiologi', minggu: 3, tf: 6, tr: 8 },
  { id: 'radiologi', nama: 'Radiologi', pendek: 'Radiologi', smf: 'Radiologi', minggu: 2, tf: 6, tr: 6 }
];
const ROT_BASE = ['ikm', 'anak', 'obgyn', 'ipd', 'bedah', 'neuro', 'jiwa', 'tht', 'mata', 'kulit', 'forensik', 'anestesi', 'radiologi'];
const ROT_SHIFT = [0, 3, 6, 9];
const SISTEM = ['Kardiovaskular', 'Respirasi', 'Gastrohepatobilier', 'Ginjal dan saluran kemih', 'Endokrin dan metabolik', 'Hematologi dan imunologi', 'Saraf', 'Psikiatri', 'Indra', 'Integumen', 'Reproduksi', 'Muskuloskeletal', 'Kedokteran forensik'];
const DX = {
  ikm: [['Hipertensi esensial', 'FKTP', 'Kardiovaskular'], ['Diabetes melitus tipe 2', 'FKTP', 'Endokrin dan metabolik'], ['Infeksi saluran napas akut', 'FKTP', 'Respirasi'], ['Diare akut', 'FKTP', 'Gastrohepatobilier'], ['Skabies', 'FKTP', 'Integumen'], ['Tuberkulosis paru', 'FKTP', 'Respirasi'], ['Osteoartritis', 'FKTP', 'Muskuloskeletal'], ['Konjungtivitis', 'FKTP', 'Indra']],
  anak: [['Infeksi saluran napas akut', 'FKTP', 'Respirasi'], ['Diare akut dengan dehidrasi', 'FKTP', 'Gastrohepatobilier'], ['Demam berdarah dengue', 'FKTP', 'Hematologi dan imunologi'], ['Kejang demam', 'FKTP', 'Saraf'], ['Bronkiolitis', 'FKRTL', 'Respirasi'], ['Gizi buruk', 'FKRTL', 'Endokrin dan metabolik']],
  obgyn: [['Antenatal care normal', 'FKTP', 'Reproduksi'], ['Persalinan normal', 'FKTP', 'Reproduksi'], ['Hiperemesis gravidarum', 'FKTP', 'Reproduksi'], ['Pelayanan kontrasepsi', 'FKTP', 'Reproduksi'], ['Infeksi saluran kemih', 'FKTP', 'Ginjal dan saluran kemih'], ['Preeklamsia', 'FKRTL', 'Reproduksi'], ['Perdarahan pascapersalinan', 'FKRTL', 'Reproduksi']],
  ipd: [['Hipertensi esensial', 'FKTP', 'Kardiovaskular'], ['Diabetes melitus tipe 2', 'FKTP', 'Endokrin dan metabolik'], ['Dispepsia', 'FKTP', 'Gastrohepatobilier'], ['Gastritis', 'FKTP', 'Gastrohepatobilier'], ['Demam tifoid', 'FKTP', 'Gastrohepatobilier'], ['Anemia defisiensi besi', 'FKTP', 'Hematologi dan imunologi'], ['Pneumonia komunitas', 'FKTP', 'Respirasi'], ['Sindrom koroner akut', 'FKRTL', 'Kardiovaskular'], ['Gagal jantung kronik', 'FKRTL', 'Kardiovaskular'], ['Sirosis hepatis', 'FKRTL', 'Gastrohepatobilier'], ['Penyakit ginjal kronik', 'FKRTL', 'Ginjal dan saluran kemih']],
  bedah: [['Abses kulit', 'FKTP', 'Integumen'], ['Luka laserasi', 'FKTP', 'Integumen'], ['Cedera kepala ringan', 'FKTP', 'Saraf'], ['Appendisitis akut', 'FKRTL', 'Gastrohepatobilier'], ['Hernia inguinalis', 'FKRTL', 'Gastrohepatobilier'], ['Batu saluran kemih', 'FKRTL', 'Ginjal dan saluran kemih'], ['Fraktur tertutup', 'FKRTL', 'Muskuloskeletal']],
  neuro: [['Cephalgia', 'FKTP', 'Saraf'], ['Vertigo perifer', 'FKTP', 'Saraf'], ['Epilepsi', 'FKTP', 'Saraf'], ['Stroke iskemik', 'FKRTL', 'Saraf']],
  jiwa: [['Gangguan cemas', 'FKTP', 'Psikiatri'], ['Gangguan depresi', 'FKTP', 'Psikiatri'], ['Skizofrenia', 'FKTP', 'Psikiatri'], ['Gangguan penggunaan zat', 'FKRTL', 'Psikiatri']],
  tht: [['Otitis media akut', 'FKTP', 'Indra'], ['Rinosinusitis akut', 'FKTP', 'Indra'], ['Faringitis akut', 'FKTP', 'Respirasi'], ['Epistaksis', 'FKTP', 'Indra']],
  mata: [['Konjungtivitis', 'FKTP', 'Indra'], ['Hordeolum', 'FKTP', 'Indra'], ['Katarak', 'FKRTL', 'Indra'], ['Glaukoma akut', 'FKRTL', 'Indra']],
  kulit: [['Dermatitis atopik', 'FKTP', 'Integumen'], ['Skabies', 'FKTP', 'Integumen'], ['Tinea korporis', 'FKTP', 'Integumen'], ['Urtikaria akut', 'FKTP', 'Integumen']],
  forensik: [['Visum et repertum korban hidup (luka)', 'FKTP', 'Kedokteran forensik'], ['Pemeriksaan jenazah', 'FKRTL', 'Kedokteran forensik'], ['Penentuan usia forensik', 'FKRTL', 'Kedokteran forensik']],
  anestesi: [['Manajemen jalan napas', 'FKTP', 'Respirasi'], ['Resusitasi jantung paru', 'FKTP', 'Kardiovaskular'], ['Persiapan pra-anestesi', 'FKRTL', 'Kardiovaskular'], ['Anestesi spinal', 'FKRTL', 'Saraf']],
  radiologi: [['Interpretasi foto toraks', 'FKTP', 'Respirasi'], ['Foto polos abdomen', 'FKRTL', 'Gastrohepatobilier'], ['CT scan kepala dasar', 'FKRTL', 'Saraf']]
};
const KEGIATAN = ['Visite bangsal', 'Jaga IGD', 'Presentasi kasus', 'Penyuluhan kesehatan', 'Posyandu dan imunisasi', 'Kunjungan rumah', 'Diskusi klinis'];
const KETERLIBATAN = ['Mengamati', 'Membantu', 'Melakukan dengan supervisi', 'Melakukan mandiri'];
const PROSEDUR = ['Pemasangan infus', 'Pemasangan kateter urin', 'Pemasangan pipa nasogastrik', 'Injeksi intramuskular dan intravena', 'Penjahitan luka laserasi', 'Resusitasi jantung paru', 'Pengambilan darah vena', 'Pemeriksaan EKG 12 sadapan', 'Nebulisasi'];
const MC_DOM = ['Anamnesis', 'Pemeriksaan fisik', 'Profesionalisme', 'Penalaran klinis', 'Komunikasi dan konseling', 'Organisasi dan efisiensi', 'Kompetensi klinis keseluruhan'];
const DP_DOM = ['Persiapan dan indikasi', 'Informed consent dan komunikasi', 'Teknik prosedur', 'Asepsis dan keselamatan', 'Penanganan komplikasi', 'Profesionalisme', 'Kompetensi keseluruhan'];
const EPAS = [
  ['Anamnesis', 'Menggali riwayat pasien secara terarah dan lengkap'],
  ['Pemeriksaan fisik', 'Melakukan pemeriksaan fisik sistematis sesuai keluhan'],
  ['Penalaran klinis', 'Menyusun diagnosis kerja dan diagnosis banding'],
  ['Usulan pemeriksaan penunjang', 'Memilih dan menginterpretasi pemeriksaan penunjang'],
  ['Tata laksana', 'Menyusun rencana terapi farmakologis dan nonfarmakologis'],
  ['Edukasi dan komunikasi', 'Menjelaskan kondisi dan rencana kepada pasien dan keluarga'],
  ['Dokumentasi rekam medis', 'Mencatat temuan dan rencana secara akurat'],
  ['Kegawatdaruratan awal', 'Mengenali dan menstabilkan pasien gawat darurat'],
  ['Rujukan dan serah terima', 'Menentukan kebutuhan rujukan dan menyampaikan serah terima']
];
const EPA_LEVEL = [
  'Level 1: Hanya mengamati',
  'Level 2: Bertindak dengan supervisi langsung di tempat',
  'Level 3: Bertindak dengan supervisi tidak langsung, supervisor mudah dihubungi',
  'Level 4: Bertindak mandiri, supervisi dari jauh atau atas permintaan',
  'Level 5: Bertindak mandiri dan dapat menyupervisi mahasiswa lain'
];
const JENIS_ASESMEN = [
  { k: 'DOPS', n: 'Direct Observation of Procedural Skills', g: 'Tempat kerja', miller: 'Does' },
  { k: 'Mini-CEX', n: 'Mini Clinical Evaluation Exercise', g: 'Tempat kerja', miller: 'Does' },
  { k: 'CBD', n: 'Case-Based Discussion', g: 'Tempat kerja', miller: 'Knows how' },
  { k: 'Long Case', n: 'Ujian kasus panjang', g: 'Akademik', miller: 'Shows how' },
  { k: 'Short Case', n: 'Ujian kasus pendek', g: 'Akademik', miller: 'Shows how' },
  { k: 'CBT', n: 'Computer-Based Test', g: 'Akademik', miller: 'Knows' },
  { k: 'OSCE', n: 'Objective Structured Clinical Examination', g: 'Akademik', miller: 'Shows how' },
  { k: 'MSF', n: 'Multisource Feedback 360 derajat', g: 'Tempat kerja', miller: 'Does' },
  { k: 'Ujian Lisan', n: 'Ujian lisan', g: 'Akademik', miller: 'Knows how' },
  { k: 'Presentasi Kasus', n: 'Presentasi kasus', g: 'Tempat kerja', miller: 'Knows how' },
  { k: 'Journal Reading', n: 'Telaah jurnal (EBCR)', g: 'Akademik', miller: 'Knows how' },
  { k: 'Referat', n: 'Referat', g: 'Akademik', miller: 'Knows' },
  { k: 'Tutorial', n: 'Tutorial dan diskusi (tahap sarjana)', g: 'Akademik', miller: 'Knows how' },
  { k: 'Praktikum', n: 'Praktikum (tahap sarjana)', g: 'Akademik', miller: 'Shows how' }
];
const AREA_SKDI = ['Profesionalitas yang luhur', 'Mawas diri dan pengembangan diri', 'Komunikasi efektif', 'Pengelolaan informasi', 'Landasan ilmiah ilmu kedokteran', 'Keterampilan klinis', 'Pengelolaan masalah kesehatan'];
const BS = { CBT: 25, OSCE: 15, 'Mini-CEX': 20, DOPS: 15, CBD: 15, Logbook: 5, MSF: 5 };
const BB = { CBT: 40, OSCE: 30, Tutorial: 15, Praktikum: 15 };
const PSSK_BLOK = ['Blok Kardiovaskular', 'Blok Respirasi', 'Blok Gastrohepatobilier', 'Blok Endokrin dan Metabolik', 'Blok Neurosains', 'Blok Reproduksi'];
const WAH = [
  { id: 'w0', nama: RSPU, jenis: 'RS Pendidikan Utama' },
  { id: 'w1', nama: 'FKTP Jejaring A', jenis: 'FKTP' },
  { id: 'w2', nama: 'FKTP Jejaring B', jenis: 'FKTP' },
  { id: 'w3', nama: 'FKTP Jejaring C', jenis: 'FKTP' },
  { id: 'w4', nama: 'FKTP Jejaring D', jenis: 'FKTP' }
];
const PRES_EXTRA = [
  { id: 'p4', nama: 'Preseptor Obgyn 1', smf: 'Obstetri dan Ginekologi' },
  { id: 'p5', nama: 'Preseptor Neurologi 1', smf: 'Neurologi' },
  { id: 'p6', nama: 'Preseptor Psikiatri 1', smf: 'Psikiatri' },
  { id: 'p7', nama: 'Preseptor Dermatologi 1', smf: 'Dermatovenereologi' },
  { id: 'p8', nama: 'Preseptor Komunitas 1', smf: 'Kedokteran Komunitas' },
  { id: 'p9', nama: 'Preseptor Anestesi 1', smf: 'Anestesiologi' }
];
const POOL_REF = ['Saya perlu memperdalam penalaran diagnosis banding sebelum mengusulkan pemeriksaan penunjang.', 'Komunikasi dengan keluarga pasien terasa lebih lancar setelah penjelasan disusun bertahap.', 'Saya belum percaya diri menentukan kebutuhan rujukan dan akan membaca pedoman nasional.', 'Pemeriksaan fisik menjadi lebih efisien setelah saya membuat urutan tetap.'];
const POOL_FB = ['Anamnesis sudah runtut. Tambahkan faktor risiko dan riwayat pengobatan sebelumnya.', 'Penalaran klinis baik. Pertimbangkan diagnosis banding lain sebelum menetapkan diagnosis kerja.', 'Tata laksana sesuai pedoman. Cantumkan edukasi dan rencana kontrol secara eksplisit.', 'Pemeriksaan fisik sudah terarah. Dokumentasi tanda vital perlu dilengkapi.'];
const POOL_RET = ['Ringkasan SOAP belum lengkap pada bagian penilaian dan rencana. Lengkapi lalu ajukan kembali.', 'Persetujuan pasien belum tercatat. Mohon kirim tautan atau pindai QR persetujuan.', 'Diagnosis kerja perlu disesuaikan dengan temuan pemeriksaan fisik.'];
const POOL_KEK = ['Anamnesis runtut dan empatik.', 'Pemeriksaan fisik sistematis dan percaya diri.', 'Komunikasi dengan pasien jelas dan menenangkan.', 'Teknik prosedur sesuai langkah baku.', 'Penalaran klinis terarah dengan diagnosis banding yang masuk akal.'];
const POOL_PERLU = ['Belum menggali kepatuhan obat dan hambatan biaya.', 'Manajemen waktu perlu dipercepat tanpa mengurangi ketelitian.', 'Penjelasan kepada keluarga masih terlalu teknis.', 'Asepsis perlu dijaga pada langkah akhir prosedur.', 'Rencana tata laksana belum menyebut kriteria rujukan.'];
const POOL_RENC = ['Dua kasus serupa dengan fokus kepatuhan, observasi ulang minggu depan.', 'Latihan prosedur di skills lab sebelum observasi berikutnya.', 'Presentasikan satu kasus dengan format SOAP lengkap.', 'Observasi ulang oleh preseptor yang sama dalam dua minggu.', 'Susun ringkasan kriteria rujukan untuk tiga diagnosis tersering.'];

let S = null;
const memo = {};
function inval() { for (const k in memo) delete memo[k]; }
function M(k, f) { if (!(k in memo)) memo[k] = f(); return memo[k]; }

/* ---------- Akses data ---------- */
const stase = id => (S ? S.stases : STASES).find(x => x.id === id);
const studentById = id => S.students.find(x => x.id === id);
const userById = id => S.users.find(x => x.id === id);
function pname(id) { const u = userById(id); if (u) return u.nama; const p = PRES_EXTRA.find(x => x.id === id); return p ? p.nama : '-'; }
const presList = () => [{ id: 'u-pre' }, { id: 'u-multi' }, { id: 'u-dosen' }].concat(PRES_EXTRA).map(p => ({ id: p.id, nama: pname(p.id) }));
const casesOf = sid => M('co' + sid, () => S.cases.filter(c => c.sid === sid));
const asmsOf = sid => M('ao' + sid, () => S.asms.filter(a => a.sid === sid));
const wahanaOf = id => S.wahana.find(w => w.id === id) || { nama: '-', jenis: '' };

function sched(st) {
  return M('sc' + st.id, () => {
    const shift = ROT_SHIFT[st.g % 4];
    const rot = ROT_BASE.slice(shift).concat(ROT_BASE.slice(0, shift));
    let cur = addD(T0, -241 + (st.off || 0));
    const out = [];
    for (const id of rot) {
      const s = stase(id); const start = cur; const end = addD(start, s.minggu * 7 - 1);
      out.push({ id, start, end, wah: id === 'ikm' ? 'w' + (1 + (parseInt(st.id.slice(1), 10) % 4)) : 'w0' });
      cur = addD(end, 1);
    }
    return out;
  });
}
function curItem(st) { const s = sched(st); return s.find(x => x.start <= T0 && T0 <= x.end) || s.filter(x => x.end < T0).pop() || s[0]; }
function itemStatus(it) { return it.end < T0 ? 'selesai' : (it.start <= T0 ? 'berjalan' : 'akan datang'); }

/* ---------- Seed ---------- */
function fitSum(vals, target, lo, hi, r) {
  let sum = vals.reduce((a, b) => a + b, 0), g = 0;
  while (sum !== target && g++ < 5000) {
    const i = Math.floor(r() * vals.length);
    if (sum < target && vals[i] < hi) { vals[i]++; sum++; } else if (sum > target && vals[i] > lo) { vals[i]--; sum--; }
  }
  return vals;
}
function mkCase(r, st, stId, d, o) {
  o = o || {};
  const jenis = o.jenis || 'Kasus';
  const dxp = o.dx || pick(r, DX[stId]);
  const days = dayDiff(T0, d);
  let stat = o.stat;
  if (!stat) {
    const x = r();
    if (days <= 12) stat = x < .35 ? 'valid' : x < .8 ? 'menunggu' : x < .92 ? 'draf' : 'kembali';
    else stat = x < .95 ? 'valid' : x < .98 ? 'kembali' : 'draf';
  }
  if (jenis !== 'Kasus' && stat === 'menunggu') stat = 'valid';
  const pr = r();
  const pid = pr < .5 ? 'u-pre' : pr < .65 ? 'u-multi' : pr < .75 ? 'u-dosen' : pick(r, PRES_EXTRA).id;
  const it = sched(st).find(x => x.id === stId);
  const c = {
    id: 'c' + (S.seq++), sid: st.id, tgl: iso(d), st: stId, wah: it ? it.wah : 'w0', jenis,
    dx: jenis === 'Kasus' ? dxp[0] : jenis === 'Kegiatan' ? pick(r, KEGIATAN) : 'Refleksi pembelajaran minggu ini',
    kat: jenis === 'Kasus' ? dxp[1] : '', sis: jenis === 'Kasus' ? dxp[2] : '',
    usia: Math.floor(1 + r() * 75), jk: r() < .5 ? 'L' : 'P',
    ini: String.fromCharCode(65 + Math.floor(r() * 26)) + '.' + String.fromCharCode(65 + Math.floor(r() * 26)) + '.',
    rm: String(100000 + Math.floor(r() * 899999)),
    ter: pick(r, KETERLIBATAN), pid, stat,
    sum: jenis === 'Kasus' ? dxp[0] + ': anamnesis dan pemeriksaan fisik terarah, usulan pemeriksaan penunjang, tata laksana awal, dan edukasi pasien.' : (jenis === 'Kegiatan' ? 'Kegiatan klinis dicatat sebagai bagian pembelajaran harian.' : ''),
    ref: r() < .22 ? pick(r, POOL_REF) : '', fb: '', fbTgl: '', cons: jenis === 'Kasus' ? (stat !== 'draf' ? true : r() < .5) : false, tok: Math.floor(r() * 1e9).toString(36)
  };
  if (stat === 'valid' && r() < .35) { c.fb = pick(r, POOL_FB); c.fbTgl = iso(addD(d, 1 + Math.floor(r() * 3))); }
  if (stat === 'kembali') { c.fb = pick(r, POOL_RET); c.fbTgl = iso(addD(d, 2)); c.cons = r() < .5; }
  return c;
}
function seedState() {
  const rng = RNG(20261025);
  S = { v: 1, seq: 5000, users: [], students: [], cases: [], asms: [], nilai: [], epa: {}, epaLog: [], audit: [], events: [], periods: [], regs: [], ews: [], osce: [], stases: STASES.map(x => Object.assign({}, x)), wahana: WAH.map(x => Object.assign({}, x)), bobotStase: Object.assign({}, BS), bobotBlok: Object.assign({}, BB), replies: {}, bg: {}, session: null };
  const NAMES = ['Aulia R.', 'Bima S.', 'Citra D.', 'Dimas P.', 'Elisabet T.', 'Farhan A.', 'Grace M.', 'Hendra L.', 'Intan K.', 'Joshua N.', 'Kevin S.', 'Livia H.', 'Marcel B.', 'Nadia F.', 'Obed G.', 'Putri W.'];
  S.students.push({ id: 's1', nama: 'Mahasiswa Demo 1', nim: 'PD25001', g: 0, mu: 7.4, rate: 3.8, angk: '2025' });
  S.students.push({ id: 's2', nama: 'Mahasiswa Demo 2', nim: 'PD25002', g: 1, mu: 6.6, rate: 1.6, angk: '2025' });
  NAMES.forEach((n, i) => S.students.push({ id: 's' + (i + 3), nama: n, nim: 'PD25' + String(i + 3).padStart(3, '0'), g: (i + 2) % 4, mu: Math.round((5.4 + rng() * 2.6) * 10) / 10, rate: Math.round((1.4 + rng() * 2.2) * 10) / 10, angk: '2025' }));
  const U = (id, nama, email, roles, unit, sid) => S.users.push({ id, nama, email, roles, pw: DEMO_PW, unit, sid: sid || null, demo: true });
  U('u-admin', 'Admin Prodi Demo', 'admin.demo@jejaklite.test', ['admin'], 'Program Studi Profesi Dokter');
  U('u-dosen', 'Dosen Demo', 'dosen.demo@jejaklite.test', ['dosen'], 'Fakultas Kedokteran UMT');
  U('u-pre', 'Preseptor Demo', 'preseptor.demo@jejaklite.test', ['preseptor'], 'SMF Ilmu Penyakit Dalam, ' + RSPU);
  U('u-kaprodi', 'Kaprodi Demo', 'kaprodi.demo@jejaklite.test', ['kaprodi'], 'Program Studi Profesi Dokter');
  U('u-multi', 'Multirole Demo', 'multirole.demo@jejaklite.test', ['dosen', 'preseptor', 'kaprodi'], 'Fakultas Kedokteran UMT dan ' + RSPU);
  U('u-m1', 'Mahasiswa Demo 1', 'mahasiswa1.demo@jejaklite.test', ['mahasiswa'], 'Profesi Dokter angkatan 2025', 's1');
  U('u-m2', 'Mahasiswa Demo 2', 'mahasiswa2.demo@jejaklite.test', ['mahasiswa'], 'Profesi Dokter angkatan 2025', 's2');

  const monthStart = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const rd = (a, b) => addD(a, Math.floor(rng() * Math.max(1, dayDiff(b, a) + 1)));
  S.students.forEach(st => {
    const sc = sched(st).filter(x => x.start <= T0).map(x => ({ id: x.id, start: x.start, end: x.end < T0 ? x.end : T0 }));
    const tot = sc.reduce((t, x) => t + dayDiff(x.end, x.start) + 1, 0);
    const wpick = () => { let v = rng() * tot; for (const x of sc) { v -= dayDiff(x.end, x.start) + 1; if (v <= 0) return x; } return sc[sc.length - 1]; };
    const out = [];
    if (st.id === 's1') {
      const ipd = sc.find(x => x.id === 'ipd');
      const fk = DX.ipd.filter(x => x[1] === 'FKTP'), fr = DX.ipd.filter(x => x[1] === 'FKRTL');
      const recStart = ipd.start > monthStart ? ipd.start : monthStart;
      for (let i = 0; i < 10; i++) out.push(mkCase(rng, st, 'ipd', rd(ipd.start, addD(monthStart, -1)), { dx: pick(rng, fk), stat: 'valid' }));
      for (let i = 0; i < 12; i++) {
        let o;
        if (i < 8) o = { dx: pick(rng, fk), stat: 'valid' }; else if (i < 10) o = { dx: pick(rng, fk), stat: 'menunggu' }; else if (i === 10) o = { dx: pick(rng, fr), stat: 'draf' }; else o = { dx: pick(rng, fr), stat: 'kembali' };
        out.push(mkCase(rng, st, 'ipd', rd(recStart, T0), o));
      }
      const others = sc.filter(x => x.id !== 'ipd');
      for (let i = 0; i < 106; i++) { const x = others[Math.floor(rng() * others.length)]; out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { stat: 'valid' })); }
      for (let i = 0; i < 9; i++) { const x = others[Math.floor(rng() * others.length)]; out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { jenis: i % 3 === 0 ? 'Refleksi' : 'Kegiatan', stat: 'valid' })); }
    } else {
      const N = Math.round(st.rate * 34);
      for (let i = 0; i < N; i++) { const x = wpick(); out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { jenis: rng() < .08 ? 'Kegiatan' : (rng() < .05 ? 'Refleksi' : 'Kasus') })); }
    }
    out.forEach(c => S.cases.push(c));
  });
  // asesmen
  const mkAsm = (st, jenis, judul, d, stId, pid, stat, sk) => ({ id: 'a' + (S.seq++), sid: st.id, jenis, judul, tgl: iso(d), st: stId, pid, stat, sk: sk || null, kek: sk ? pick(rng, POOL_KEK) : '', perlu: sk ? pick(rng, POOL_PERLU) : '', renc: sk ? pick(rng, POOL_RENC) : '' });
  S.students.forEach(st => {
    inval();
    const sc = sched(st).filter(x => x.start <= T0).map(x => ({ id: x.id, start: x.start, end: x.end < T0 ? x.end : T0 }));
    const miniN = st.id === 's1' ? 8 : 4 + Math.floor(rng() * 6), dopsN = st.id === 's1' ? 6 : 3 + Math.floor(rng() * 4);
    const mk = (n, dom, jenis) => {
      let vals = []; for (let i = 0; i < n * dom.length; i++) vals.push(clamp(Math.round(st.mu + (rng() - .5) * 3), 3, 9));
      vals = fitSum(vals, Math.round(st.mu * vals.length), 3, 9, rng);
      for (let i = 0; i < n; i++) {
        const x = sc[Math.floor(rng() * sc.length)]; const d = rd(x.start, x.end); const dx = pick(rng, DX[x.id]);
        const judul = jenis === 'Mini-CEX' ? 'Mini-CEX: ' + dx[0] : 'DOPS: ' + pick(rng, PROSEDUR);
        S.asms.push(mkAsm(st, jenis, judul, d, x.id, rng() < .6 ? 'u-pre' : pick(rng, PRES_EXTRA.concat([{ id: 'u-multi' }, { id: 'u-dosen' }])).id, 'dinilai', vals.slice(i * dom.length, (i + 1) * dom.length)));
      }
    };
    mk(miniN, MC_DOM, 'Mini-CEX'); mk(dopsN, DP_DOM, 'DOPS');
    if (st.id === 's1') S.asms.push(mkAsm(st, 'DOPS', 'DOPS: Pemasangan infus', addD(T0, -2), 'ipd', 'u-pre', 'menunggu'));
    else { const np = Math.floor(rng() * 3); for (let i = 0; i < np; i++) { const x = sc[sc.length - 1]; S.asms.push(mkAsm(st, i % 2 ? 'Mini-CEX' : 'DOPS', (i % 2 ? 'Mini-CEX: ' : 'DOPS: ') + (i % 2 ? pick(rng, DX[x.id])[0] : pick(rng, PROSEDUR)), addD(T0, -Math.floor(rng() * 6)), x.id, pick(rng, [{ id: 'u-pre' }, { id: 'u-multi' }, { id: 'u-dosen' }]).id, 'menunggu')); } }
    // EPA
    const lv = EPAS.map(() => clamp(Math.round(st.mu / 2.2 + (rng() - .5) * 1.6), 1, 5));
    if (st.id === 's1') { lv[0] = 4; lv[1] = 3; lv[4] = 2; }
    S.epa[st.id] = lv;
    // nilai
    const base = 55 + (st.mu - 5) * 8;
    PSSK_BLOK.forEach(b => Object.keys(S.bobotBlok).forEach(k => S.nilai.push({ sid: st.id, tahap: 'PSSK', unit: b, komp: k, v: clamp(Math.round(base + (rng() - .5) * 16), 40, 98), tgl: iso(addD(T0, -600 + Math.floor(rng() * 200))) })));
    sched(st).filter(x => x.start <= T0).forEach(x => {
      const done = x.end < T0;
      ['CBT', 'OSCE', 'CBD', 'MSF'].forEach(k => { if (done || (k === 'MSF' && rng() < .4)) S.nilai.push({ sid: st.id, tahap: 'PSPD', unit: x.id, komp: k, v: clamp(Math.round(base + (rng() - .5) * 16), 40, 98), tgl: iso(addD(x.end, -2)) }); });
    });
  });
  inval();
  S.epaLog.push({ id: 'e1', sid: 's1', epa: 0, level: 4, tgl: iso(addD(T0, -40)), pid: 'u-pre', cm: 'Anamnesis mandiri pada kasus tidak kompleks, supervisi dari jauh.' });
  S.epaLog.push({ id: 'e2', sid: 's1', epa: 1, level: 3, tgl: iso(addD(T0, -20)), pid: 'u-pre', cm: 'Pemeriksaan fisik sistematis, preseptor tersedia di dekat.' });
  S.epaLog.push({ id: 'e3', sid: 's1', epa: 4, level: 2, tgl: iso(addD(T0, -9)), pid: 'u-multi', cm: 'Rencana tata laksana masih perlu dikoreksi pada dosis dan kontraindikasi.' });
  S.periods = [
    { id: 'pa3', nama: 'Semester Ganjil 2026/2027', mulai: '2026-09-01', selesai: '2027-01-31', aktif: true },
    { id: 'pa2', nama: 'Semester Genap 2025/2026', mulai: '2026-02-01', selesai: '2026-07-31', aktif: false },
    { id: 'pa1', nama: 'Semester Ganjil 2025/2026', mulai: '2025-09-01', selesai: '2026-01-31', aktif: false }
  ];
  S.events = [
    { id: 'ev1', jenis: 'OSCE', judul: 'OSCE akhir stase Ilmu Penyakit Dalam', st: 'ipd', tgl: iso(addD(T0, 12)), lokasi: 'Skills Lab FK UMT', penguji: 'u-dosen', kuota: 20, status: 'Dijadwalkan' },
    { id: 'ev2', jenis: 'CBT', judul: 'CBT komprehensif tahap profesi', st: '', tgl: iso(addD(T0, 26)), lokasi: 'Laboratorium komputer FK UMT', penguji: 'u-multi', kuota: 40, status: 'Dijadwalkan' },
    { id: 'ev3', jenis: 'Ujian Lisan', judul: 'Ujian lisan stase Ilmu Bedah', st: 'bedah', tgl: iso(addD(T0, -15)), lokasi: RSPU, penguji: 'u-pre', kuota: 12, status: 'Selesai' }
  ];
  S.ews = [
    { id: 'w1', sid: 's6', kat: 'Kesejahteraan', oleh: 'u-pre', tgl: iso(addD(T0, -12)), txt: 'Mahasiswa melaporkan kelelahan setelah rangkaian jaga malam berturut-turut dan kesulitan menjaga ritme belajar.', stat: 'antrean', rek: [] },
    { id: 'w2', sid: 's11', kat: 'Akademik', oleh: 'u-dosen', tgl: iso(addD(T0, -8)), txt: 'Dua Mini-CEX berturut-turut di bawah harapan tahap pada domain penalaran klinis.', stat: 'antrean', rek: [] },
    { id: 'w3', sid: 's14', kat: 'Profesionalisme', oleh: 'u-multi', tgl: iso(addD(T0, -5)), txt: 'Keterlambatan hadir berulang pada visite pagi selama dua minggu terakhir.', stat: 'dilaporkan', rek: [{ jenis: 'Pembinaan profesionalisme', txt: 'Pertemuan dengan mentor akademik dan kesepakatan jadwal tiba.', target: iso(addD(T0, 14)), tgl: iso(addD(T0, -4)) }] }
  ];
  const osd = [['ikm', -150, 18, 8], ['anak', -120, 18, 6], ['obgyn', -75, 17, 7], ['ipd', -40, 18, 8], ['bedah', -12, 16, 7]];
  osd.forEach((o, i) => { const rr = RNG(900 + i); S.osce.push({ id: 'o' + (i + 1), st: o[0], nama: 'OSCE akhir stase ' + stase(o[0]).pendek, tgl: iso(addD(T0, o[1])), peserta: o[2], station: o[3], avg: Math.round((66 + rr() * 14) * 10) / 10, pass: Math.round((78 + rr() * 20) * 10) / 10 }); });
  const a1 = S.cases.find(c => c.sid === 's2' && c.stat === 'valid');
  S.audit.push({ id: 'b1', ts: iso(addD(T0, -14)) + ' 09:12', uid: 'u-pre', cid: a1 ? a1.id : '-', alasan: 'Pasien tidak sadar, identitas dibutuhkan untuk konfirmasi alergi obat sebelum tindakan.', menit: 15, status: 'Selesai' });
  S.audit.push({ id: 'b2', ts: iso(addD(T0, -6)) + ' 21:40', uid: 'u-multi', cid: a1 ? a1.id : '-', alasan: 'Rujukan darurat, perlu verifikasi identitas dengan keluarga pasien.', menit: 15, status: 'Selesai' });
  inval();
  return S;
}
function save() { inval(); try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } }
function load() {
  try { const t = localStorage.getItem(LS_KEY); if (t) { const o = JSON.parse(t); if (o && o.v === 1 && o.cases && o.users) { S = o; inval(); return S; } } } catch (e) { }
  seedState(); save(); return S;
}

/* ---------- Skor dan statistik ---------- */
function nilaiRec(sid, tahap, unit, komp) { const r = S.nilai.find(n => n.sid === sid && n.tahap === tahap && n.unit === unit && n.komp === komp); return r ? r.v : null; }
function stScore(sid, stId) {
  return M('ss' + sid + stId, () => {
    const st = studentById(sid), s = stase(stId), B = S.bobotStase;
    const item = sched(st).find(x => x.id === stId); const started = !!item && item.start <= T0;
    const avgA = j => { const l = asmsOf(sid).filter(a => a.jenis === j && a.st === stId && a.stat === 'dinilai'); return l.length ? mean(l.map(a => mean(a.sk))) / 9 * 100 : null; };
    const logb = () => { if (!started) return null; const t = s.tf + s.tr; if (!t) return null; return Math.min(100, casesOf(sid).filter(c => c.st === stId && c.jenis === 'Kasus' && c.stat === 'valid').length / t * 100); };
    const vals = { CBT: nilaiRec(sid, 'PSPD', stId, 'CBT'), OSCE: nilaiRec(sid, 'PSPD', stId, 'OSCE'), 'Mini-CEX': avgA('Mini-CEX'), DOPS: avgA('DOPS'), CBD: nilaiRec(sid, 'PSPD', stId, 'CBD'), Logbook: logb(), MSF: nilaiRec(sid, 'PSPD', stId, 'MSF') };
    let sw = 0, sv = 0; const rows = [];
    Object.keys(B).forEach(k => { const v = vals[k] == null ? null : vals[k]; rows.push({ k, v, w: B[k] }); if (v != null) { sw += B[k]; sv += v * B[k]; } });
    return { rows, total: sw ? sv / sw : null, started };
  });
}
function blokScore(sid, blok) {
  return M('bs' + sid + blok, () => {
    const B = S.bobotBlok; let sw = 0, sv = 0; const rows = [];
    Object.keys(B).forEach(k => { const v = nilaiRec(sid, 'PSSK', blok, k); rows.push({ k, v, w: B[k] }); if (v != null) { sw += B[k]; sv += v * B[k]; } });
    return { rows, total: sw ? sv / sw : null };
  });
}
function psskScore(sid) { return M('pk' + sid, () => { const l = PSSK_BLOK.map(b => blokScore(sid, b).total).filter(x => x != null); return l.length ? mean(l) : null; }); }
function pspdScore(sid) { return M('pp' + sid, () => { let sw = 0, sv = 0; S.stases.forEach(s => { const t = stScore(sid, s.id).total; if (t != null) { sw += s.minggu; sv += t * s.minggu; } }); return sw ? sv / sw : null; }); }
function pctRank(tahap, sid) {
  return M('pr' + tahap + sid, () => {
    const f = tahap === 'PSSK' ? psskScore : pspdScore;
    const all = S.students.map(s => f(s.id)).filter(x => x != null); const me = f(sid);
    if (me == null || !all.length) return null;
    let lo = 0, eq = 0; all.forEach(x => { if (x < me) lo++; else if (x === me) eq++; });
    return (lo + eq * .5) / all.length * 100;
  });
}
function miniAvg(sid) { const l = asmsOf(sid).filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai'); return l.length ? mean([].concat.apply([], l.map(a => a.sk))) : null; }
function stats(sid) {
  return M('st' + sid, () => {
    const st = studentById(sid); const all = casesOf(sid); const cs = all.filter(c => c.jenis === 'Kasus');
    const mStart = iso(new Date(T0.getFullYear(), T0.getMonth(), 1));
    const it = curItem(st); const sd = stase(it.id);
    const fv = cs.filter(c => c.stat === 'valid' && c.st === it.id && c.kat === 'FKTP').length;
    const rv = cs.filter(c => c.stat === 'valid' && c.st === it.id && c.kat === 'FKRTL').length;
    const epa = S.epa[sid] || [];
    const exp = Math.max(1, (dayDiff(T0, addD(T0, -241)) / 7) * 2.2);
    const miniA = miniAvg(sid);
    const pend = asmsOf(sid).filter(a => a.stat === 'menunggu').length;
    const out = {
      total: cs.length, entri: all.length, bulan: cs.filter(c => c.tgl >= mStart).length,
      valid: cs.filter(c => c.stat === 'valid').length, menunggu: cs.filter(c => c.stat === 'menunggu').length, draf: cs.filter(c => c.stat === 'draf').length, kembali: cs.filter(c => c.stat === 'kembali').length,
      cur: it, curS: sd, fktpVal: fv, fkrtlVal: rv, pctF: sd.tf ? clamp(fv / sd.tf * 100, 0, 100) : 100, pctR: sd.tr ? clamp(rv / sd.tr * 100, 0, 100) : 100,
      mini: miniA, epaAvg: epa.length ? mean(epa) : null, pssk: psskScore(sid), pspd: pspdScore(sid), pendAsm: pend
    };
    const pace = clamp(out.valid / exp * 100, 0, 100);
    const parts = [[miniA == null ? null : miniA / 9 * 100, .35], [pace, .25], [out.epaAvg == null ? null : out.epaAvg / 5 * 100, .2], [out.pspd, .2]].filter(x => x[0] != null);
    out.health = parts.reduce((t, x) => t + x[1], 0) ? parts.reduce((t, x) => t + x[0] * x[1], 0) / parts.reduce((t, x) => t + x[1], 0) : null;
    out.risk = out.health == null ? 'stabil' : out.health < 58 ? 'berisiko' : out.health < 68 ? 'perhatian' : 'stabil';
    return out;
  });
}
function genId(p) { return p + (S.seq++); }
