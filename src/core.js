/* ================= DATA, SEED, SKOR ================= */
const DEMO_PW = 'password123';
const isSrv = () => typeof SERVER !== 'undefined' && SERVER;
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
const CBD_DOM = ['Representasi masalah', 'Interpretasi data klinis', 'Diagnosis banding', 'Dasar ilmiah keputusan', 'Rencana tata laksana', 'Keselamatan dan refleksi'];
const PRESENT_DOM = ['Struktur presentasi', 'Ketepatan data', 'Penalaran klinis', 'Penggunaan bukti', 'Komunikasi', 'Respons diskusi'];
const MSF_DOM = ['Komunikasi', 'Kerja sama tim', 'Keandalan', 'Profesionalisme', 'Keselamatan pasien'];
function assessmentDomains(j) { return j === 'DOPS' ? DP_DOM : j === 'CBD' ? CBD_DOM : j === 'Presentasi Kasus' ? PRESENT_DOM : j === 'MSF' ? MSF_DOM : MC_DOM; }
const ONKO_TAGS = ['Promosi kesehatan', 'Pencegahan kanker', 'Deteksi dini kanker', 'Konseling faktor risiko', 'Tanda bahaya dan rujukan'];
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
const presList = () => isSrv() ? S.users.filter(u => u.roles.indexOf('preseptor') >= 0 || u.roles.indexOf('dosen') >= 0).map(u => ({ id: u.id, nama: u.nama })) : [{ id: 'u-pre' }, { id: 'u-multi' }, { id: 'u-dosen' }].concat(PRES_EXTRA).map(p => ({ id: p.id, nama: pname(p.id) }));
const casesOf = sid => M('co' + sid, () => S.cases.filter(c => c.sid === sid));
const asmsOf = sid => M('ao' + sid, () => S.asms.filter(a => a.sid === sid));
const wahanaOf = id => S.wahana.find(w => w.id === id) || { nama: '-', jenis: '' };

function ikmWah(st) {
  if (/^s\d+$/.test(st.id)) return 'w' + (1 + (parseInt(st.id.slice(1), 10) % 4));
  const f = S.wahana.filter(w => w.jenis === 'FKTP'); if (!f.length) return 'w0';
  let h = 0; for (let i = 0; i < st.id.length; i++) h = (h * 31 + st.id.charCodeAt(i)) >>> 0;
  return f[h % f.length].id;
}
function sched(st) {
  return M('sc' + st.id, () => {
    const shift = ROT_SHIFT[st.g % 4];
    const rot = ROT_BASE.slice(shift).concat(ROT_BASE.slice(0, shift));
    let cur = st.mulai ? parseD(st.mulai) : (isSrv() ? T0 : addD(T0, -241 + (st.off || 0)));
    const out = [];
    for (const id of rot) {
      const s = stase(id); const start = cur; const end = addD(start, s.minggu * 7 - 1);
      out.push({ id, start, end, wah: id === 'ikm' ? ikmWah(st) : 'w0' });
      cur = addD(end, 1);
    }
    return out;
  });
}
function curItem(st) { const s = sched(st); return s.find(x => x.start <= T0 && T0 <= x.end) || s.filter(x => x.end < T0).pop() || s[0]; }
function itemStatus(it) { return it.end < T0 ? 'selesai' : (it.start <= T0 ? 'berjalan' : 'akan datang'); }

/* ---------- Skor dan statistik ---------- */
function nilaiRec(sid, tahap, unit, komp) { const r = S.nilai.find(n => n.sid === sid && n.tahap === tahap && n.unit === unit && n.komp === komp); return r ? r.v : null; }
function stScore(sid, stId) {
  return M('ss' + sid + stId, () => {
    const st = studentById(sid), s = stase(stId), B = S.bobotStase;
    const item = sched(st).find(x => x.id === stId); const started = !!item && item.start <= T0;
    const avgA = j => { const l = asmsOf(sid).filter(a => a.jenis === j && a.st === stId && a.stat === 'dinilai'); return l.length ? mean(l.map(a => mean(a.sk))) / 9 * 100 : null; };
    const logb = () => { if (!started) return null; const t = s.tf + s.tr; if (!t) return null; return Math.min(100, casesOf(sid).filter(c => c.st === stId && c.jenis === 'Kasus' && c.stat === 'valid').length / t * 100); };
    const vals = { CBT: nilaiRec(sid, 'PSPD', stId, 'CBT'), OSCE: nilaiRec(sid, 'PSPD', stId, 'OSCE'), 'Mini-CEX': avgA('Mini-CEX'), DOPS: avgA('DOPS'), CBD: nilaiRec(sid, 'PSPD', stId, 'CBD') ?? avgA('CBD'), Logbook: logb(), MSF: nilaiRec(sid, 'PSPD', stId, 'MSF') ?? avgA('MSF') };
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
  if (S.pct && S.pct[sid]) return S.pct[sid][tahap];
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
    const exp = Math.max(2.2, (Math.max(7, dayDiff(T0, sched(st)[0].start)) / 7) * 2.2);
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
function genId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
