/* ================= APP STATE, PUBLIK, SHELL, MAHASISWA ================= */
const A = {};
const PAGES = {};
const UI = { route: 'login', params: {}, navOpen: false, tab: {}, fl: {}, msg: '' };
const ROLE_LABEL = { mahasiswa: 'Mahasiswa', dosen: 'Dosen', preseptor: 'Preseptor', kaprodi: 'Kaprodi', admin: 'Admin Prodi' };
const NAV = {
  mahasiswa: [['m-home', 'Beranda', 'home'], ['m-log', 'Logbook', 'book'], ['m-sched', 'Jadwal Rotasi', 'cal'], ['m-asm', 'Asesmen', 'check'], ['m-fb', 'Umpan Balik', 'chat'], ['m-port', 'Portofolio', 'chart']],
  dosen: [['v-home', 'Beranda', 'home'], ['v-validate', 'Validasi Kasus', 'check'], ['v-assess', 'Penilaian', 'target'], ['v-dir', 'Direktori Mahasiswa', 'users']],
  preseptor: [['v-home', 'Beranda', 'home'], ['v-validate', 'Validasi Kasus', 'check'], ['v-assess', 'Penilaian', 'target'], ['v-dir', 'Direktori Mahasiswa', 'users']],
  kaprodi: [['k-home', 'Dashboard Kohort', 'grid'], ['k-comp', 'Capaian Kompetensi', 'target'], ['k-epa', 'Peta EPA', 'chart'], ['k-pct', 'Persentil Kohort', 'list'], ['k-ews', 'Peringatan Dini', 'alert'], ['k-wah', 'Wahana dan Variasi Kasus', 'pin'], ['k-osce', 'Rekap OSCE', 'check'], ['k-pre', 'Kinerja Preseptor', 'users'], ['v-dir', 'Direktori Mahasiswa', 'book']],
  admin: [['a-home', 'Ringkasan', 'home'], ['a-period', 'Periode Akademik', 'cal'], ['a-users', 'Pengguna dan Impor', 'users'], ['a-events', 'Event Asesmen', 'flag'], ['a-curr', 'Master Kurikulum', 'book'], ['a-import', 'Impor Hasil Asesmen', 'upload'], ['a-audit', 'Audit dan Break Glass', 'shield']]
};
const TITLES = {}; Object.keys(NAV).forEach(r => NAV[r].forEach(n => TITLES[n[0]] = n[1])); TITLES['v-student'] = 'Portofolio Mahasiswa';

const me = () => S.session ? userById(S.session.uid) : null;
const firstSid = () => (S.students[0] || {}).id || '';
const curSid = () => { const u = me(); return UI.params.sid || (u && u.sid) || firstSid(); };
const defPid = () => { const l = presList(); return l.some(p => p.id === 'u-pre') ? 'u-pre' : (l[0] ? l[0].id : ''); };
const isRole = r => S.session && S.session.role === r;
function go(page, params) { UI.route = page; UI.params = params || {}; UI.navOpen = false; UI.msg = ''; window.scrollTo(0, 0); render(); }
function applyTheme() { let t = null; try { t = localStorage.getItem('elogbook-theme'); } catch (e) { } if (t) document.documentElement.setAttribute('data-theme', t); }
function render() {
  const act = document.activeElement; const fid = act && act.id; let ss = null, se = null;
  if (fid && act.selectionStart != null) { ss = act.selectionStart; se = act.selectionEnd; }
  const root = document.getElementById('app');
  try { root.innerHTML = S.session ? shell() : publicView(); } catch (e) { root.innerHTML = '<div class="pad"><div class="card" style="margin:24px 0"><div class="card-b"><h3>Terjadi kesalahan tampilan</h3><p class="sub">' + esc(e && e.message) + '</p>' + (SERVER ? '<button class="btn" data-a="reload">Muat ulang data</button>' : '<button class="btn" data-a="reset">Atur ulang data demo</button>') + '</div></div></div>'; console.error(e); }
  if (fid) { const el = document.getElementById(fid); if (el && el !== document.activeElement) { el.focus(); if (ss != null && el.setSelectionRange) { try { el.setSelectionRange(ss, se); } catch (e) { } } } }
  const nxt = Object.keys(S.bg).map(k => S.bg[k].until).filter(t => t > Date.now()).sort()[0];
  if (nxt) { clearTimeout(render._t); render._t = setTimeout(render, Math.min(nxt - Date.now() + 500, 2147483000)); }
}

/* ---------- Publik: gerbang masuk yang sederhana ---------- */
const LOGOS = () => '<div class="logos"><span class="logo-chip"><img src="' + LOGO_FK + '" alt="Logo Fakultas Kedokteran Universitas Murni Teguh"></span><span class="logo-chip"><img src="' + LOGO_RS + '" alt="Logo RS Murni Teguh Methodist Susanna Wesley"></span></div>';
const showDemoList = () => !SERVER;
function gate(inner) {
  return '<main class="gate"><section class="gate-brand"><div class="gate-top">' + LOGOS() + '</div><div class="gate-title"><h1>E-Logbook</h1><p class="gate-p">Program Studi Profesi Dokter</p><p class="gate-sub">' + esc(INSTITUSI) + '</p></div><p class="gate-foot">Rumah sakit pendidikan utama<b>' + esc(RSPU) + '</b></p></section>' +
    '<section class="gate-form"><button class="icon-btn gate-theme" data-a="theme" aria-label="Ganti tema">' + ic('moon') + '</button><div class="gate-card">' + inner + '</div></section></main>';
}
function loginView() {
  const accts = showDemoList() ? S.users.filter(u => u.demo) : [];
  return gate('<h2>Masuk</h2><p class="sub">Gunakan akun yang diberikan program studi.</p>' + (UI.msg ? '<div class="alert ' + (UI.msgTone || 'bad') + '" role="alert">' + esc(UI.msg) + '</div>' : '') +
    '<form data-form="login" autocomplete="on">' + field('lg-email', 'Email', input('lg-email', '', { type: 'text', req: true, ph: 'nama@umt.ac.id', extra: 'autocomplete="username" autocapitalize="off" spellcheck="false"' })) + field('lg-pw', 'Kata sandi', input('lg-pw', '', { type: 'password', req: true, extra: 'autocomplete="current-password"' })) + '<button class="btn primary lg block" type="submit">Masuk</button></form>' +
    '<p class="hint c"><a href="docs/panduan-live.html" target="_blank" rel="noopener">Panduan dan bantuan</a></p><p class="hint c">Belum punya akun? <button class="lnk" data-a="go" data-p="register">Daftar</button></p>' +
    (SERVER ? '' : '<p class="hint c demo-flag">Mode demonstrasi. Data hanya tersimpan di peramban ini.</p>') +
    (accts.length ? '<div class="demo-box"><div class="eyebrow">Akun demo &middot; sandi <code>' + DEMO_PW + '</code></div><div class="demo-list">' + accts.map(u => '<button type="button" class="demo-row" data-a="demo" data-e="' + esc(u.email) + '"><span class="av">' + esc(u.nama.charAt(0)) + '</span><span class="dr-t"><b>' + esc(u.nama) + '</b><small>' + u.roles.map(r => ROLE_LABEL[r]).join(' + ') + '</small></span>' + ic('arrow', 16) + '</button>').join('') + '</div></div>' : ''));
}
function registerView() {
  return gate('<h2>Daftar akun</h2><p class="sub">Setelah mendaftar, admin program studi akan menetapkan peran Anda. Anda dapat masuk setelah peran ditetapkan.</p>' + (UI.msg ? '<div class="alert ' + (UI.msgTone || 'good') + '" role="status">' + esc(UI.msg) + '</div>' : '') +
    '<form data-form="register" autocomplete="off">' + field('rg-nama', 'Nama lengkap', input('rg-nama', '', { req: true })) + field('rg-email', 'Email', input('rg-email', '', { type: 'email', req: true })) + field('rg-unit', 'NIM atau NIP', input('rg-unit', '')) + field('rg-harap', 'Peran yang diharapkan', selectEl('rg-harap', ['Mahasiswa', 'Dosen', 'Preseptor'], 'Mahasiswa')) + field('rg-pw', 'Kata sandi', input('rg-pw', '', { type: 'password', req: true, extra: 'minlength="8" autocomplete="new-password"' }), 'Minimal 8 karakter. Jangan memakai kata sandi dari layanan lain.') + '<button class="btn primary lg block" type="submit">Kirim pendaftaran</button></form>' +
    '<p class="hint c">Sudah punya akun? <button class="lnk" data-a="go" data-p="login">Masuk</button></p>');
}
function publicView() { if (SERVER && !LIVE_CONFIGURED) return gate('<h2>Versi live sedang disiapkan</h2><p class="sub">Backend belum dikonfigurasi. Pencatatan data belum dibuka.</p><p>Hubungi admin program studi untuk aktivasi.</p><a class="btn" href="demo.html">Lihat demonstrasi dengan data contoh</a>'); if (UI.booting) return gate('<h2>Memuat data</h2><p class="sub">Mengambil data Anda dari server. Mohon tunggu sebentar.</p>'); return UI.route === 'register' ? registerView() : loginView(); }

/* ---------- Shell ---------- */
function shell() {
  const u = me(), role = S.session.role; const nav = NAV[role];
  if (!PAGES[UI.route] || !(nav.some(n => n[0] === UI.route) || UI.route === 'v-student')) UI.route = nav[0][0];
  const multi = u.roles.length > 1;
  const act = UI.route === 'v-student' ? 'v-dir' : UI.route;
  const sub = role === 'mahasiswa' && u.sid ? esc(stats(u.sid).curS.pendek) + ' &middot; ' + esc(studentById(u.sid).nim) : esc(u.unit || '');
  return '<div class="shell"><aside class="side ' + (UI.navOpen ? 'open' : '') + '" id="side"><div class="side-top"><button class="brand inv" data-a="nav" data-p="' + nav[0][0] + '" aria-label="Beranda">' + LOGOS() + '<span class="brand-t"><b>E-Logbook</b><small>Profesi Dokter UMT</small></span></button></div>' +
    '<div class="role-badge"><span class="eyebrow">Peran aktif</span><b>' + ROLE_LABEL[role] + '</b></div>' +
    '<nav class="snav" aria-label="Menu ' + ROLE_LABEL[role] + '">' + nav.map(n => '<button class="sn ' + (act === n[0] ? 'on' : '') + '" data-a="nav" data-p="' + n[0] + '"' + (act === n[0] ? ' aria-current="page"' : '') + '>' + ic(n[2], 18) + '<span>' + n[1] + '</span></button>').join('') + '</nav>' +
    '<div class="side-foot"><div class="site-note">' + ic('pin', 14) + '<span>' + esc(RSPU) + '</span></div><div class="usercard"><span class="av">' + esc(u.nama.charAt(0)) + '</span><span class="uc-t"><b>' + esc(u.nama) + '</b><small>' + sub + '</small></span></div><button class="sn" data-a="pw">' + ic('lock', 18) + '<span>Ganti kata sandi</span></button><button class="sn" data-a="logout">' + ic('logout', 18) + '<span>Keluar</span></button></div></aside>' +
    '<div class="scrim ' + (UI.navOpen ? 'on' : '') + '" data-a="navclose"></div>' +
    '<div class="main"><header class="top"><div class="pad top-in"><button class="icon-btn menu-btn" data-a="navopen" aria-label="Buka menu">' + ic('menu') + '</button><div class="top-t"><span class="eyebrow">' + ROLE_LABEL[role] + '</span><b>' + esc(TITLES[UI.route] || '') + '</b></div><div class="top-r">' +
    (multi ? '<div class="seg" role="group" aria-label="Ganti peran">' + u.roles.map(r => '<button class="' + (r === role ? 'on' : '') + '" data-a="role" data-r="' + r + '">' + ROLE_LABEL[r] + '</button>').join('') + '</div>' : '') +
    syncIndicator() + '<span class="chip-priv" title="Identitas pasien tersamarkan kecuali Break Glass aktif">' + ic('lock', 14) + 'Privacy Mode aktif</span><button class="icon-btn" data-a="theme" aria-label="Ganti tema">' + ic('moon') + '</button></div></div></header>' +
    '<main class="content pad" id="main">' + PAGES[UI.route](UI.params) + '</main></div></div>';
}

/* ---------- Helper mahasiswa ---------- */
function weekOf(it) { return clamp(Math.floor(dayDiff(T0, it.start) / 7) + 1, 1, stase(it.id).minggu); }
function pendList(sid) { return asmsOf(sid).filter(a => a.stat === 'menunggu'); }
function feedFor(sid) {
  const out = [];
  casesOf(sid).forEach(c => { if (c.fb) out.push({ key: 'c:' + c.id, tgl: c.fbTgl || c.tgl, src: 'Validasi logbook', from: pname(c.pid), txt: c.fb, ref: c.dx, tone: c.stat === 'kembali' ? 'bad' : 'good' }); });
  asmsOf(sid).filter(a => a.stat === 'dinilai').forEach(a => out.push({ key: 'a:' + a.id, tgl: a.tgl, src: a.jenis, from: pname(a.pid), txt: 'Kekuatan: ' + a.kek + ' Perlu ditingkatkan: ' + a.perlu + ' Rencana: ' + a.renc, ref: a.judul, tone: 'good' }));
  S.epaLog.filter(e => e.sid === sid).forEach(e => out.push({ key: 'e:' + e.id, tgl: e.tgl, src: 'Keputusan entrustment', from: pname(e.pid), txt: EPAS[e.epa][0] + ' ditetapkan Level ' + e.level + '. ' + e.cm, ref: EPAS[e.epa][0], tone: 'good' }));
  return out.sort((a, b) => b.tgl.localeCompare(a.tgl));
}

/* ---------- Mahasiswa: Beranda ---------- */
PAGES['m-home'] = () => {
  const sid = curSid(), st = studentById(sid), s = stats(sid), it = s.cur, sd = s.curS;
  const epa = S.epa[sid]; const pend = pendList(sid);
  const act = casesOf(sid).filter(c => c.stat === 'kembali' || c.stat === 'draf').length;
  const mini = MC_DOM.map((_, i) => mean(asmsOf(sid).filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai').map(a => a.sk[i])));
  const fb = feedFor(sid).slice(0, 3);
  return pageHead('Selamat datang, ' + esc(st.nama), 'Stase berjalan: <b>' + esc(sd.nama) + '</b>, minggu ke-' + weekOf(it) + ' dari ' + sd.minggu + ' di ' + esc(wahanaOf(it.wah).nama), '<button class="btn primary" data-a="case-new">' + ic('plus', 16) + 'Catat kasus baru</button>') +
    '<div class="g4">' + kpi('Kasus', '<b>' + s.total + '</b>', '<span class="up">+' + s.bulan + ' bulan ini</span>') +
    kpi('Target kasus FKTP', '<b>' + n0(s.pctF) + '%</b>', 'Stase ' + esc(sd.nama) + ' &middot; ' + s.fktpVal + ' dari ' + sd.tf, bar(s.pctF, toneOf(s.pctF))) +
    kpi('Divalidasi', '<b>' + n0(s.total ? s.valid / s.total * 100 : 0) + '%</b>', s.valid + ' dari ' + s.total + ' kasus', bar(s.total ? s.valid / s.total * 100 : 0, 'good')) +
    kpi('Perlu tindakan', '<b>' + (act + pend.length) + '</b>', act + ' entri draf atau dikembalikan, ' + pend.length + ' asesmen menunggu') + '</div>' +
    '<div class="g3 mt">' +
    card('Tingkat entrustment EPA', [0, 1, 4].map(i => '<div class="ep"><span>' + esc(EPAS[i][0]) + '</span><b>Level ' + epa[i] + '</b></div>' + bar(epa[i] / 5 * 100, 'good')).join('') + '<p class="hint">Rata-rata seluruh EPA: ' + n1(s.epaAvg) + ' dari 5</p>', '<button class="lnk" data-a="tabgo" data-k="port" data-v="entrust" data-p="m-port">Semua EPA</button>') +
    card('Mini-CEX', '<div class="rad-s">' + radar(mini, ['Anamnesis', 'Pem. fisik', 'Profesional', 'Penalaran', 'Komunikasi', 'Organisasi', 'Kompetensi'], 9) + '</div><p class="c"><b>Rata-rata ' + n1(s.mini) + '</b> dari 9 pada ' + asmsOf(sid).filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai').length + ' observasi</p>') +
    card('Menunggu penilaian', pend.length ? pend.map(a => '<div class="pend"><div class="pend-i">' + ic('check', 16) + '</div><div><b>' + esc(a.judul.replace(': ', ', ')) + '</b><span>Menunggu penilaian ' + esc(pname(a.pid)) + ' &middot; ' + dfmt(a.tgl) + '</span></div></div>').join('') : empty('Tidak ada asesmen menunggu'), '<button class="lnk" data-a="nav" data-p="m-asm">Kelola</button>') + '</div>' +
    '<div class="g2 mt">' +
    card('Target kasus stase berjalan', '<div class="tg"><div><span>FKTP</span><b>' + s.fktpVal + ' / ' + sd.tf + '</b></div>' + bar(s.pctF, toneOf(s.pctF)) + '</div><div class="tg"><div><span>FKRTL</span><b>' + s.fkrtlVal + ' / ' + sd.tr + '</b></div>' + bar(s.pctR, toneOf(s.pctR)) + '</div><p class="hint">Hanya kasus berstatus divalidasi yang dihitung terhadap target.</p>') +
    card('Umpan balik terbaru', fb.length ? fb.map(f => '<div class="fbi"><div class="fbi-h">' + pill(f.src, f.tone) + '<span>' + dfmt(f.tgl) + ' &middot; ' + esc(f.from) + '</span></div><p>' + esc(f.txt) + '</p></div>').join('') : empty('Belum ada umpan balik'), '<button class="lnk" data-a="nav" data-p="m-fb">Jurnal lengkap</button>') + '</div>';
};

/* ---------- Mahasiswa: Logbook ---------- */
function logFilters() { return UI.fl.log || (UI.fl.log = { q: '', st: '', stat: '', jenis: '', page: 1 }); }
function logRows(sid) {
  const f = logFilters(); const q = f.q.toLowerCase();
  return casesOf(sid).filter(c => (!f.st || c.st === f.st) && (!f.stat || c.stat === f.stat) && (!f.jenis || c.jenis === f.jenis) && (!q || c.dx.toLowerCase().includes(q) || stName(c.st).toLowerCase().includes(q))).sort((a, b) => b.tgl.localeCompare(a.tgl));
}
PAGES['m-log'] = () => {
  const sid = curSid(), f = logFilters(); const rows = logRows(sid); const per = 10; const pages = Math.max(1, Math.ceil(rows.length / per)); f.page = clamp(f.page, 1, pages);
  const s = stats(sid); const sl = rows.slice((f.page - 1) * per, f.page * per);
  return pageHead('Logbook kasus klinis', 'Catat kasus dan kegiatan harian, lalu ajukan ke dosen atau preseptor untuk divalidasi.', '<button class="btn" data-a="log-csv">' + ic('copy', 16) + 'Unduh rekap CSV</button><button class="btn primary" data-a="case-new">' + ic('plus', 16) + 'Catat entri baru</button>') +
    '<div class="chips">' + [['', 'Semua', s.entri], ['draf', 'Draf', s.draf], ['menunggu', 'Menunggu', s.menunggu], ['valid', 'Divalidasi', s.valid], ['kembali', 'Dikembalikan', s.kembali]].map(x => '<button class="chipf ' + (f.stat === x[0] ? 'on' : '') + '" data-a="logstat" data-v="' + x[0] + '">' + x[1] + ' <b>' + x[2] + '</b></button>').join('') + '</div>' +
    '<div class="toolbar"><div class="srch">' + ic('search', 16) + '<input id="log-q" data-f="log.q" type="search" value="' + esc(f.q) + '" placeholder="Cari diagnosis atau stase" aria-label="Cari"></div>' +
    selectEl('log-st', [['', 'Semua stase']].concat(S.stases.map(x => [x.id, x.pendek])), f.st, { extra: 'data-f="log.st" aria-label="Stase"' }) + selectEl('log-jenis', [['', 'Semua jenis'], 'Kasus', 'Kegiatan', 'Refleksi'], f.jenis, { extra: 'data-f="log.jenis" aria-label="Jenis"' }) + '</div>' +
    (rows.length ? table(['Tanggal', 'Entri', 'Stase', 'Pasien', 'Kategori', 'Status', 'Preseptor', ''], sl.map(c => '<tr><td class="nw">' + dfmt(c.tgl) + '</td><td><b>' + esc(c.dx) + '</b><div class="mut">' + c.jenis + (c.ter && c.jenis === 'Kasus' ? ' &middot; ' + esc(c.ter) : '') + '</div></td><td>' + esc(stName(c.st)) + '</td><td class="mono">' + (c.jenis === 'Kasus' ? ptLabel(c) : '-') + '</td><td>' + (c.kat ? pill(c.kat, c.kat === 'FKTP' ? 'info' : 'muted') : '-') + '</td><td>' + statPill(c.stat) + '</td><td>' + esc(pname(c.pid)) + '</td><td><button class="btn sm" data-a="case-open" data-id="' + c.id + '">Buka</button></td></tr>')) +
      '<div class="pager"><span>' + rows.length + ' entri &middot; halaman ' + f.page + ' dari ' + pages + '</span><div><button class="btn sm" data-a="logpage" data-v="-1"' + (f.page <= 1 ? ' disabled' : '') + '>Sebelumnya</button><button class="btn sm" data-a="logpage" data-v="1"' + (f.page >= pages ? ' disabled' : '') + '>Berikutnya</button></div></div>' : empty('Belum ada entri yang cocok', 'Ubah filter atau catat entri baru.'));
};
function caseForm(id) {
  const c = id ? S.cases.find(x => x.id === id) : null; const sid = curSid(); const s = stats(sid);
  const v = c || { tgl: iso(T0), jenis: 'Kasus', st: s.cur.id, wah: s.cur.wah, dx: '', kat: 'FKTP', sis: '', usia: '', jk: 'L', ini: '', rm: '', ter: KETERLIBATAN[2], pid: defPid(), sum: '', ref: '' };
  const dl = (DX[v.st] || []).map(d => '<option value="' + esc(d[0]) + '">').join('');
  openModal(c ? 'Ubah entri logbook' : 'Catat entri logbook',
    '<form data-form="case" data-id="' + (c ? c.id : '') + '" class="form-grid">' +
    field('cf-jenis', 'Jenis entri', selectEl('cf-jenis', ['Kasus', 'Kegiatan', 'Refleksi'], v.jenis, { extra: 'data-ch="case-jenis"' })) + field('cf-tgl', 'Tanggal', input('cf-tgl', v.tgl, { type: 'date', req: true })) +
    field('cf-st', 'Stase', selectEl('cf-st', S.stases.map(x => [x.id, x.nama]), v.st, { extra: 'data-ch="case-stase"' })) + field('cf-wah', 'Tempat', selectEl('cf-wah', S.wahana.map(w => [w.id, w.nama]), v.wah)) +
    field('cf-dx', 'Diagnosis atau nama kegiatan', input('cf-dx', v.dx, { req: true, extra: 'list="cf-dxl" data-ch="case-dx" autocomplete="off"' }) + '<datalist id="cf-dxl">' + dl + '</datalist>', 'Pilih dari daftar stase atau ketik sendiri.', 'span2') +
    '<div class="kasus-only span2 form-grid inner">' + field('cf-kat', 'Kategori layanan', selectEl('cf-kat', ['FKTP', 'FKRTL'], v.kat)) + field('cf-sis', 'Sistem organ', selectEl('cf-sis', SISTEM, v.sis || SISTEM[0])) + field('cf-usia', 'Usia pasien (tahun)', input('cf-usia', v.usia, { type: 'number', extra: 'min="0" max="120"' })) + field('cf-jk', 'Jenis kelamin', selectEl('cf-jk', [['L', 'Laki-laki'], ['P', 'Perempuan']], v.jk)) +
    field('cf-ini', 'Inisial pasien (opsional)', input('cf-ini', '', { ph: c ? 'Tersimpan. Isi hanya untuk mengubah' : 'Contoh: A.B.' }), 'Identitas disimpan terenkripsi dan tersamarkan secara bawaan.') + field('cf-rm', 'Nomor rekam medis (opsional)', input('cf-rm', '', { ph: c ? 'Tersimpan. Isi hanya untuk mengubah' : '' })) +
    field('cf-ter', 'Tingkat keterlibatan', selectEl('cf-ter', KETERLIBATAN, v.ter)) + '</div>' +
    field('cf-pid', 'Preseptor atau dosen penilai', selectEl('cf-pid', presList().map(p => [p.id, p.nama]), v.pid), '', 'span2') +
    field('cf-sum', 'Ringkasan SOAP', textarea('cf-sum', v.sum, { rows: 5, ph: 'S: keluhan utama dan riwayat. O: temuan pemeriksaan. A: diagnosis kerja dan banding. P: rencana tata laksana dan edukasi.' }), '', 'span2') +
    field('cf-ref', 'Refleksi', textarea('cf-ref', v.ref, { rows: 3, ph: 'Apa yang berjalan baik, apa yang sulit, dan apa yang akan Anda lakukan berikutnya?' }), '', 'span2') +
    '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn" type="submit" data-submit="draf">Simpan draf</button><button class="btn primary" type="submit" data-submit="ajukan">Simpan dan ajukan validasi</button></div></form>', { wide: true });
  toggleKasus();
}
function toggleKasus() { const j = document.getElementById('cf-jenis'); const k = document.querySelector('.kasus-only'); if (j && k) k.hidden = j.value !== 'Kasus'; }
function caseDetail(id) {
  const c = S.cases.find(x => x.id === id); if (!c) return;
  const role = S.session.role, u = me(); const owner = role === 'mahasiswa' && u.sid === c.sid;
  const canVal = (role === 'dosen' || role === 'preseptor') && c.stat === 'menunggu';
  const bg = bgActive(c.id); const left = bg ? Math.max(0, Math.ceil((S.bg[c.id].until - Date.now()) / 60000)) : 0;
  const url = c.tok ? (SERVER ? API_URL + '?consent=' + c.tok : 'https://elogbook.umt.example/persetujuan/' + c.tok) : '';
  const consent = c.jenis !== 'Kasus' ? '' : '<div class="box"><div class="box-h"><b>Persetujuan pasien</b>' + pill(c.cons ? 'Tercatat' : 'Belum tercatat', c.cons ? 'good' : 'warn') + '</div>' + (c.cons ? '<p class="hint">Persetujuan telah dikonfirmasi pasien melalui tautan QR.</p>' : (url ? '<div class="consent">' + qrSvg(url) + '<div><p class="hint">Minta pasien memindai QR atau membuka tautan berikut untuk menyetujui penggunaan data kasus bagi pembelajaran.</p><code class="url">' + esc(url) + '</code><div class="row"><button class="btn sm" data-a="copy" data-t="' + esc(url) + '">' + ic('copy', 14) + 'Salin tautan</button>' + (owner && !SERVER ? '<button class="btn sm" data-a="consent-sim" data-id="' + c.id + '">Simulasikan pasien menyetujui</button>' : '') + '</div></div></div>' : '<p class="hint">Menunggu persetujuan pasien. Tautan persetujuan hanya tersedia bagi mahasiswa pencatat.</p>')) + '</div>';
  const actions = (owner && (c.stat === 'draf' || c.stat === 'kembali') ? '<button class="btn" data-a="case-edit" data-id="' + c.id + '">Ubah</button><button class="btn primary" data-a="case-submit" data-id="' + c.id + '">Ajukan validasi</button>' : '') + (owner && c.stat === 'draf' ? '<button class="btn danger" data-a="case-del" data-id="' + c.id + '">Hapus</button>' : '');
  openModal(esc(c.dx),
    '<div class="meta"><span>' + dfmt(c.tgl) + '</span>' + statPill(c.stat) + pill(c.jenis, 'muted') + (c.kat ? pill(c.kat, 'info') : '') + '<span>' + esc(stase(c.st).nama) + '</span></div>' +
    '<dl class="dl"><div><dt>Mahasiswa</dt><dd>' + esc(studentById(c.sid).nama) + '</dd></div><div><dt>Tempat</dt><dd>' + esc(wahanaOf(c.wah).nama) + '</dd></div><div><dt>Preseptor</dt><dd>' + esc(pname(c.pid)) + '</dd></div>' + (c.jenis === 'Kasus' ? '<div><dt>Pasien</dt><dd class="mono">' + ptLabel(c) + ' &middot; ' + esc(c.usia) + ' th, ' + (c.jk === 'L' ? 'laki-laki' : 'perempuan') + '</dd></div><div><dt>Sistem organ</dt><dd>' + esc(c.sis || '-') + '</dd></div><div><dt>Keterlibatan</dt><dd>' + esc(c.ter) + '</dd></div>' : '') + '</dl>' +
    (c.jenis === 'Kasus' ? '<div class="box bgbox"><div><b>Identitas pasien</b><span class="hint">' + (bg ? 'Break Glass aktif, sisa sekitar ' + left + ' menit. Akses ini tercatat di audit.' : 'Tersamarkan oleh Privacy Mode.') + '</span></div>' + (bg ? '' : '<button class="btn sm danger" data-a="bg-open" data-id="' + c.id + '">' + ic('alert', 14) + 'Break Glass</button>') + '</div>' : '') +
    '<div class="box"><b>Ringkasan</b><p class="pre">' + esc(c.sum || 'Belum diisi.') + '</p></div>' + (c.ref ? '<div class="box"><b>Refleksi mahasiswa</b><p class="pre">' + esc(c.ref) + '</p></div>' : '') + consent +
    (c.fb ? '<div class="box fb ' + (c.stat === 'kembali' ? 'bad' : '') + '"><b>Umpan balik ' + esc(pname(c.pid)) + '</b><p>' + esc(c.fb) + '</p><span class="hint">' + dfmt(c.fbTgl) + '</span></div>' : '') +
    (canVal ? '<form data-form="validate" data-id="' + c.id + '">' + field('vl-cm', 'Umpan balik untuk mahasiswa', textarea('vl-cm', '', { rows: 3, ph: 'Satu hal yang sudah baik dan satu hal yang perlu ditingkatkan.' }), 'Wajib diisi bila dikembalikan.') + '<div class="form-act"><button class="btn danger" type="submit" data-submit="kembali">Kembalikan untuk diperbaiki</button><button class="btn primary" type="submit" data-submit="valid">Validasi kasus</button></div></form>' : '') +
    (actions ? '<div class="form-act">' + actions + '</div>' : ''), { wide: true });
}

/* ---------- Mahasiswa: Jadwal ---------- */
PAGES['m-sched'] = () => {
  const sid = curSid(), st = studentById(sid); const sc = sched(st); const tot = sc.reduce((t, x) => t + stase(x.id).minggu, 0);
  const done = sc.filter(x => x.end < T0).length;
  return pageHead('Jadwal rotasi', 'Urutan stase kelompok ' + 'ABCD'[st.g % 4] + ' dari ' + dfmt(iso(sc[0].start)) + ' sampai ' + dfmt(iso(sc[sc.length - 1].end)) + '. ' + done + ' dari ' + sc.length + ' stase selesai.') +
    card('Lini masa rotasi', '<div class="gantt" role="list">' + sc.map(x => { const s = stase(x.id), stt = itemStatus(x); return '<div class="gt ' + stt.replace(' ', '-') + '" role="listitem" style="flex:' + s.minggu + ' 1 0" title="' + esc(s.nama) + ', ' + s.minggu + ' minggu"><span>' + esc(s.pendek) + '</span><small>' + s.minggu + ' mgg</small></div>'; }).join('') + '</div><div class="legend"><span><i class="sw d"></i>Selesai</span><span><i class="sw n"></i>Berjalan</span><span><i class="sw f"></i>Akan datang</span></div>') +
    '<div class="mt">' + table(['Stase', 'Periode', 'Tempat', 'Status', 'Target FKTP', 'Target FKRTL'], sc.map(x => {
      const s = stase(x.id), cs = casesOf(sid).filter(c => c.st === x.id && c.jenis === 'Kasus' && c.stat === 'valid'); const f = cs.filter(c => c.kat === 'FKTP').length, r = cs.filter(c => c.kat === 'FKRTL').length; const stt = itemStatus(x);
      return '<tr class="' + (stt === 'berjalan' ? 'hl' : '') + '"><td><b>' + esc(s.nama) + '</b><div class="mut">' + s.minggu + ' minggu' + (stt === 'berjalan' ? ', minggu ke-' + weekOf(x) : '') + '</div></td><td class="nw">' + dfmt(iso(x.start)) + '<br>' + dfmt(iso(x.end)) + '</td><td>' + esc(wahanaOf(x.wah).nama) + '</td><td>' + pill(stt === 'selesai' ? 'Selesai' : stt === 'berjalan' ? 'Berjalan' : 'Akan datang', stt === 'selesai' ? 'good' : stt === 'berjalan' ? 'info' : 'muted') + '</td><td class="tgc">' + (stt === 'akan datang' ? '-' : f + ' / ' + s.tf + bar(s.tf ? f / s.tf * 100 : 100, toneOf(s.tf ? f / s.tf * 100 : 100))) + '</td><td class="tgc">' + (stt === 'akan datang' ? '-' : r + ' / ' + s.tr + bar(s.tr ? r / s.tr * 100 : 100, toneOf(s.tr ? r / s.tr * 100 : 100))) + '</td></tr>';
    })) + '</div>';
};

/* ---------- Mahasiswa: Asesmen ---------- */
PAGES['m-asm'] = () => {
  const sid = curSid(); const tab = UI.tab.asm || 'menunggu'; const all = asmsOf(sid).slice().sort((a, b) => b.tgl.localeCompare(a.tgl));
  const list = all.filter(a => tab === 'menunggu' ? a.stat === 'menunggu' : a.stat === 'dinilai');
  const dom = a => assessmentDomains(a.jenis);
  return pageHead('Asesmen', 'Asesmen akademik dan asesmen di tempat kerja Anda, lengkap dengan umpan balik.', '<button class="btn primary" data-a="asm-new">' + ic('plus', 16) + 'Ajukan penilaian</button>') +
    '<div class="tabs" role="tablist">' + [['menunggu', 'Menunggu penilaian', all.filter(a => a.stat === 'menunggu').length], ['dinilai', 'Sudah dinilai', all.filter(a => a.stat === 'dinilai').length]].map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="asm" data-v="' + t[0] + '">' + t[1] + ' <b>' + t[2] + '</b></button>').join('') + '</div>' +
    (list.length ? '<div class="g2">' + list.slice(0, 20).map(a => '<article class="card asm"><div class="card-b"><div class="asm-h"><div><b>' + esc(a.judul) + '</b><span class="mut">' + dfmt(a.tgl) + ' &middot; ' + esc(stName(a.st)) + ' &middot; ' + esc(pname(a.pid)) + '</span></div>' + pill(a.stat === 'dinilai' ? 'Rata-rata ' + n1(mean(a.sk)) : 'Menunggu', asmTone(a.stat)) + '</div>' +
      (a.stat === 'dinilai' ? '<div class="hbars sm">' + a.sk.map((v, i) => '<div class="hb"><div class="hb-l">' + esc(dom(a)[i]) + '</div><div class="hb-t"><i class="' + (v >= 7 ? 'good' : v >= 5 ? '' : 'warn') + '" style="width:' + v / 9 * 100 + '%"></i></div><div class="hb-v">' + v + '</div></div>').join('') + '</div><div class="narr"><p><b>Kekuatan.</b> ' + esc(a.kek) + '</p><p><b>Perlu ditingkatkan.</b> ' + esc(a.perlu) + '</p><p><b>Rencana tindak lanjut.</b> ' + esc(a.renc) + '</p></div>' : '<p class="hint">Preseptor akan menilai dengan rubrik dan menuliskan umpan balik naratif.</p>') + '</div></article>').join('') + '</div>' : empty(tab === 'menunggu' ? 'Tidak ada asesmen yang menunggu' : 'Belum ada asesmen yang dinilai'));
};
function asmForm() {
  openModal('Ajukan penilaian', '<form data-form="asm" class="form-grid">' + field('as-j', 'Jenis asesmen', selectEl('as-j', ['DOPS', 'Mini-CEX', 'CBD', 'Presentasi Kasus', 'MSF'], 'DOPS', { extra: 'data-ch="asm-j"' })) + field('as-tgl', 'Tanggal observasi', input('as-tgl', iso(T0), { type: 'date', req: true })) +
    field('as-jd', 'Prosedur atau kasus', selectEl('as-jd', PROSEDUR, PROSEDUR[0]), '', 'span2') + field('as-st', 'Stase', selectEl('as-st', S.stases.map(x => [x.id, x.nama]), stats(curSid()).cur.id, { extra: 'data-ch="asm-j"' })) + field('as-pid', 'Penilai', selectEl('as-pid', presList().map(p => [p.id, p.nama]), defPid())) +
    '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Kirim permintaan</button></div></form>');
}

/* ---------- Mahasiswa: Umpan balik ---------- */
PAGES['m-fb'] = () => {
  const sid = curSid(); const f = UI.fl.fb || (UI.fl.fb = { src: '' }); let list = feedFor(sid); const srcs = Array.from(new Set(list.map(x => x.src)));
  if (f.src) list = list.filter(x => x.src === f.src);
  return pageHead('Jurnal umpan balik', 'Kumpulan umpan balik dari validasi logbook, asesmen, dan keputusan entrustment. Tuliskan rencana tindak lanjut agar umpan balik tidak berhenti sebagai catatan.', selectEl('fb-src', [['', 'Semua sumber']].concat(srcs), f.src, { extra: 'data-f="fb.src" aria-label="Sumber"' })) +
    (list.length ? '<div class="feed">' + list.slice(0, 25).map(x => '<article class="card fbc"><div class="card-b"><div class="fbi-h">' + pill(x.src, x.tone) + '<span>' + dfmt(x.tgl) + ' &middot; ' + esc(x.from) + '</span></div><div class="fb-ref">' + esc(x.ref) + '</div><p>' + esc(x.txt) + '</p>' + field('rp-' + x.key.replace(/[^a-z0-9]/gi, ''), 'Rencana tindak lanjut saya', textarea('rp-' + x.key.replace(/[^a-z0-9]/gi, ''), S.replies[x.key] || '', { rows: 2, ph: 'Langkah konkret yang akan saya lakukan' })) + '<button class="btn sm" data-a="reply-save" data-k="' + esc(x.key) + '" data-t="rp-' + x.key.replace(/[^a-z0-9]/gi, '') + '">Simpan rencana</button></div></article>').join('') + '</div>' : empty('Belum ada umpan balik'));
};

/* ---------- Portofolio (dipakai mahasiswa dan direktori) ---------- */
function portfolio(sid) {
  const st = studentById(sid), s = stats(sid); const tab = UI.tab.port || 'ringkasan';
  const tabs = [['ringkasan', 'Ringkasan'], ['peta', 'Peta kompetensi'], ['nilai', 'Nilai terbobot'], ['entrust', 'Entrustment EPA']];
  let body = '';
  if (tab === 'ringkasan') {
    const ml = asmsOf(sid).filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai').sort((a, b) => a.tgl.localeCompare(b.tgl));
    const mini = MC_DOM.map((_, i) => mean(ml.map(a => a.sk[i])));
    const p1 = pctRank('PSSK', sid), p2 = pctRank('PSPD', sid);
    body = '<div class="g2">' + card('Persentil kohort', '<div class="pc"><div class="pc-h"><b>PSSK (tahap sarjana)</b><span>Nilai ' + n1(s.pssk) + '</span></div>' + gauge(p1, p1 == null ? '' : 'Persentil ke-' + n0(p1) + ' dari ' + S.students.length + ' mahasiswa') + '</div><div class="pc"><div class="pc-h"><b>PSPD (tahap profesi)</b><span>Nilai ' + n1(s.pspd) + '</span></div>' + gauge(p2, p2 == null ? '' : 'Persentil ke-' + n0(p2) + ' dari ' + S.students.length + ' mahasiswa') + '</div>') +
      card('Profil Mini-CEX', '<div class="rad-s">' + radar(mini, ['Anamnesis', 'Pem. fisik', 'Profesional', 'Penalaran', 'Komunikasi', 'Organisasi', 'Kompetensi'], 9) + '</div>') + '</div>' +
      '<div class="mt">' + card('Tren Mini-CEX dari waktu ke waktu', ml.length ? lineChart([{ name: 'Rata-rata Mini-CEX', vals: ml.map(a => mean(a.sk)) }], ml.map(a => dfmt(a.tgl).slice(0, -5)), { min: 1, max: 9, area: true, label: 'Tren Mini-CEX' }) : empty('Belum ada Mini-CEX'), '<span class="hint">Skala 1 sampai 9</span>') + '</div>' +
      '<div class="mt">' + card('Mosaik kemajuan per stase', mosaic(sid), '<span class="hint">Setiap sel satu komponen nilai</span>') + '</div>';
  } else if (tab === 'peta') {
    const sis = SISTEM.map(x => ({ l: x, v: casesOf(sid).filter(c => c.jenis === 'Kasus' && c.sis === x && c.stat === 'valid').length }));
    body = card('Capaian target kasus per stase', table(['Stase', 'FKTP', 'FKRTL', 'Total kasus'], sched(st).filter(x => x.start <= T0).map(x => { const sd = stase(x.id), cs = casesOf(sid).filter(c => c.st === x.id && c.jenis === 'Kasus' && c.stat === 'valid'); const f = cs.filter(c => c.kat === 'FKTP').length, r = cs.filter(c => c.kat === 'FKRTL').length; const pf = sd.tf ? f / sd.tf * 100 : 100, pr = sd.tr ? r / sd.tr * 100 : 100; return '<tr><td><b>' + esc(sd.nama) + '</b></td><td class="tgc">' + f + ' / ' + sd.tf + bar(pf, toneOf(pf)) + '</td><td class="tgc">' + r + ' / ' + sd.tr + bar(pr, toneOf(pr)) + '</td><td>' + (f + r) + '</td></tr>'; }))) +
      '<div class="g2 mt">' + card('Paparan kasus per sistem organ', hbars(sis.map(x => ({ l: x.l, v: x.v })))) + card('Tingkat entrustment seluruh EPA', epaList(sid)) + '</div>';
  } else if (tab === 'nilai') {
    const th = UI.tab.nilai || 'PSPD';
    const units = th === 'PSPD' ? sched(st).filter(x => x.start <= T0).map(x => ({ n: stase(x.id).nama, r: stScore(sid, x.id) })) : PSSK_BLOK.map(b => ({ n: b, r: blokScore(sid, b) }));
    const keys = Object.keys(th === 'PSPD' ? S.bobotStase : S.bobotBlok), B = th === 'PSPD' ? S.bobotStase : S.bobotBlok;
    body = '<div class="tabs sm" role="tablist">' + [['PSPD', 'PSPD, tahap profesi'], ['PSSK', 'PSSK, tahap sarjana']].map(t => '<button role="tab" aria-selected="' + (th === t[0]) + '" class="' + (th === t[0] ? 'on' : '') + '" data-a="tab" data-k="nilai" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      card('Nilai ' + (th === 'PSPD' ? 'stase' : 'blok') + ' terbobot', table([th === 'PSPD' ? 'Stase' : 'Blok'].concat(keys.map(k => esc(k) + ' <small>' + B[k] + '%</small>')).concat(['Nilai sementara']), units.map(u => '<tr><td><b>' + esc(u.n) + '</b></td>' + u.r.rows.map(r => '<td>' + (r.v == null ? '<span class="mut">belum</span>' : n0(r.v)) + '</td>').join('') + '<td><b>' + (u.r.total == null ? '-' : n1(u.r.total)) + '</b>' + (u.r.rows.some(r=>r.v==null) ? '<div class="mut">Sementara; komponen belum lengkap</div>' : '') + '</td></tr>'))) +
      '<p class="hint mt">Nilai terbobot dihitung dari komponen yang sudah dinilai. Bobot komponen yang belum dinilai dikeluarkan lalu bobot sisanya disetarakan ke 100 persen. Mini-CEX, DOPS, dan Logbook diturunkan otomatis dari data asesmen dan logbook.</p>';
  } else {
    body = '<div class="g2">' + card('Tingkat entrustment seluruh EPA', epaList(sid)) + card('Riwayat keputusan entrustment', S.epaLog.filter(e => e.sid === sid).sort((a, b) => b.tgl.localeCompare(a.tgl)).map(e => '<div class="fbi"><div class="fbi-h">' + pill('Level ' + e.level, 'good') + '<span>' + dfmt(e.tgl) + ' &middot; ' + esc(pname(e.pid)) + '</span></div><b>' + esc(EPAS[e.epa][0]) + '</b><p>' + esc(e.cm) + '</p><p class="hint">Bukti: ' + (e.evidence||[]).map(id=>{const a=S.asms.find(x=>x.id===id);return a?esc(a.judul)+' ('+dfmt(a.tgl)+')':esc(id);}).join('; ') + '</p></div>').join('') || empty('Belum ada keputusan entrustment')) + '</div>' +
      '<div class="mt">' + card('Arti tingkat entrustment', '<ol class="lv">' + EPA_LEVEL.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>') + '</div>';
  }
  return '<div class="tabs" role="tablist">' + tabs.map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="port" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + body;
}
function epaList(sid) {
  const lv = S.epa[sid] || [];
  return '<div class="epa-l">' + EPAS.map((e, i) => '<div class="epa-i"><div class="epa-t"><b>' + esc(e[0]) + '</b><span>' + esc(e[1]) + '</span></div><div class="steps" aria-label="Level ' + lv[i] + ' dari 5">' + [1, 2, 3, 4, 5].map(k => '<i class="' + (k <= lv[i] ? 'on' : '') + '"></i>').join('') + '<b>L' + lv[i] + '</b></div></div>').join('') + '</div>';
}
function mosaic(sid) {
  const st = studentById(sid); const keys = Object.keys(S.bobotStase); const its = sched(st).filter(x => x.start <= T0);
  const cls = v => v == null ? 'na' : v < 60 ? 'lo' : v < 75 ? 'mid' : 'hi';
  return '<div class="tbl-wrap"><table class="mosaic"><thead><tr><th></th>' + keys.map(k => '<th>' + esc(k) + '</th>').join('') + '</tr></thead><tbody>' + its.map(x => { const r = stScore(sid, x.id); return '<tr><th scope="row">' + esc(stName(x.id)) + '</th>' + r.rows.map(c => '<td><span class="mz ' + cls(c.v) + '" title="' + (c.v == null ? 'Belum dinilai' : n0(c.v)) + '">' + (c.v == null ? '' : n0(c.v)) + '</span></td>').join('') + '</tr>'; }).join('') + '</tbody></table></div><div class="legend"><span><i class="sw lo"></i>Di bawah harapan (kurang dari 60)</span><span><i class="sw mid"></i>Sesuai harapan (60 sampai 74)</span><span><i class="sw hi"></i>Di atas harapan (75 atau lebih)</span></div>';
}
PAGES['m-port'] = () => pageHead('Portofolio pribadi', 'Gambaran longitudinal kompetensi Anda sejak tahap sarjana sampai profesi.', '<button class="btn" data-a="port-copy">' + ic('copy', 16) + 'Salin ringkasan</button>') + portfolio(curSid());
