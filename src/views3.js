/* ================= ADMIN ================= */
const ROLES_ALL = ['mahasiswa', 'dosen', 'preseptor', 'kaprodi', 'admin'];
const roleChecks = (sel, name) => '<div class="checks">' + ROLES_ALL.map(r => '<label class="chk"><input type="checkbox" name="' + (name || 'role') + '" value="' + r + '"' + ((sel || []).indexOf(r) >= 0 ? ' checked' : '') + '><span>' + ROLE_LABEL[r] + '</span></label>').join('') + '</div>';
const rolePills = rs => rs.length ? rs.map(r => pill(ROLE_LABEL[r], r === 'admin' ? 'bad' : r === 'kaprodi' ? 'info' : 'muted')).join(' ') : pill('Belum ada peran', 'warn');

PAGES['a-home'] = () => {
  const regs = S.regs;
  return pageHead('Ringkasan program studi', 'Pusat pengelolaan akun, periode, event asesmen, dan kurikulum untuk Program Studi Profesi Dokter Universitas Murni Teguh.') +
    '<div class="g4">' + kpi('Pengguna', '<b>' + S.users.length + '</b>', S.users.filter(u => !u.roles.length).length + ' belum berperan') + kpi('Pendaftar menunggu', '<b>' + regs.length + '</b>', regs.length ? 'Perlu ditetapkan perannya' : 'Tidak ada antrean') + kpi('Mahasiswa', '<b>' + S.students.length + '</b>', 'Angkatan 2025') + kpi('Entri logbook', '<b>' + S.cases.length + '</b>', S.asms.length + ' asesmen tercatat') + '</div>' +
    '<div class="g2 mt">' + card('Pendaftar menunggu penetapan peran', regs.length ? regs.map(r => '<div class="pend"><div class="pend-i">' + ic('users', 16) + '</div><div class="grow"><b>' + esc(r.nama) + '</b><span>' + esc(r.email) + ' &middot; mengharapkan ' + esc(r.harap) + '</span></div><button class="btn sm primary" data-a="reg-open" data-id="' + r.id + '">Tetapkan</button></div>').join('') : empty('Belum ada pendaftar baru', 'Pendaftar baru dari halaman daftar akan muncul di sini.'), '<button class="lnk" data-a="nav" data-p="a-users">Kelola</button>') +
    card('Periode akademik aktif', (() => { const p = S.periods.find(x => x.aktif); return p ? '<h3 class="big">' + esc(p.nama) + '</h3><p class="sub">' + dfmt(p.mulai) + ' sampai ' + dfmt(p.selesai) + '</p>' : empty('Belum ada periode aktif'); })(), '<button class="lnk" data-a="nav" data-p="a-period">Kelola</button>') + '</div>' +
    '<div class="g3 mt">' + [['a-events', 'Event asesmen', S.events.length + ' event terjadwal atau selesai', 'flag'], ['a-curr', 'Master kurikulum', S.stases.length + ' stase, 9 EPA, bobot nilai', 'book'], ['a-import', 'Impor hasil asesmen', 'CSV dengan pemetaan kolom', 'upload']].map(x => '<button class="card shortc" data-a="nav" data-p="' + x[0] + '"><div class="who-i">' + ic(x[3], 20) + '</div><b>' + x[1] + '</b><span>' + x[2] + '</span></button>').join('') + '</div>';
};
PAGES['a-period'] = () => pageHead('Periode akademik', 'Periode menjadi dasar pengelompokan data logbook, asesmen, dan laporan. Hanya satu periode yang aktif.', '<button class="btn primary" data-a="period-new">' + ic('plus', 16) + 'Periode baru</button>') +
  table(['Periode', 'Mulai', 'Selesai', 'Status', ''], S.periods.map(p => '<tr><td><b>' + esc(p.nama) + '</b></td><td class="nw">' + dfmt(p.mulai) + '</td><td class="nw">' + dfmt(p.selesai) + '</td><td>' + pill(p.aktif ? 'Aktif' : 'Tidak aktif', p.aktif ? 'good' : 'muted') + '</td><td>' + (p.aktif ? '' : '<button class="btn sm" data-a="period-act" data-id="' + p.id + '">Jadikan aktif</button>') + '</td></tr>'));
function periodForm() {
  openModal('Periode akademik baru', '<form data-form="period" class="form-grid">' + field('pe-n', 'Nama periode', input('pe-n', '', { req: true, ph: 'Semester Genap 2026/2027' }), '', 'span2') + field('pe-a', 'Mulai', input('pe-a', iso(T0), { type: 'date', req: true })) + field('pe-b', 'Selesai', input('pe-b', iso(addD(T0, 150)), { type: 'date', req: true })) + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Simpan</button></div></form>');
}

PAGES['a-users'] = () => {
  const tab = UI.tab.users || 'pengguna'; const f = UI.fl.usr || (UI.fl.usr = { q: '' }); const q = f.q.toLowerCase();
  let body = '';
  if (tab === 'pengguna') {
    const us = S.users.filter(u => !q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    body = '<div class="toolbar"><div class="srch">' + ic('search', 16) + '<input id="usr-q" data-f="usr.q" type="search" value="' + esc(f.q) + '" placeholder="Cari nama atau email" aria-label="Cari"></div></div>' + table(['Pengguna', 'Email', 'Peran', 'Unit', ''], us.map(u => '<tr><td><b>' + esc(u.nama) + '</b></td><td class="mono">' + esc(u.email) + '</td><td>' + rolePills(u.roles) + '</td><td class="wrapc">' + esc(u.unit || '-') + '</td><td><button class="btn sm" data-a="user-edit" data-id="' + u.id + '">Ubah peran</button></td></tr>'));
  } else if (tab === 'pendaftar') {
    body = S.regs.length ? table(['Nama', 'Email', 'NIM atau NIP', 'Peran diharapkan', 'Mendaftar', ''], S.regs.map(r => '<tr><td><b>' + esc(r.nama) + '</b></td><td class="mono">' + esc(r.email) + '</td><td>' + esc(r.unit || '-') + '</td><td>' + esc(r.harap) + '</td><td class="nw">' + dfmt(r.tgl) + '</td><td class="nw"><button class="btn sm primary" data-a="reg-open" data-id="' + r.id + '">Tetapkan peran</button> <button class="btn sm danger" data-a="reg-no" data-id="' + r.id + '">Tolak</button></td></tr>')) : empty('Tidak ada pendaftar menunggu', 'Pendaftar dari halaman daftar akan tampil di sini.');
  } else {
    body = '<div class="g2">' + card('Impor pengguna dari CSV', '<p class="sub">Kolom: <code>nama,email,peran,nim</code>. Beberapa peran dipisah tanda <code>|</code>, misalnya <code>dosen|preseptor</code>. Kolom nim hanya untuk mahasiswa.</p><form data-form="userimp">' + field('ui-t', 'Isi CSV', textarea('ui-t', UI.userCsv || '', { rows: 8, ph: 'nama,email,peran,nim\nDr. Contoh,contoh@umt.ac.id,dosen|preseptor,\nBudi Santoso,budi@umt.ac.id,mahasiswa,PD25101' })) + '<div class="row"><button class="btn" type="button" data-a="user-tpl">Salin templat</button><button class="btn primary" type="submit">Impor pengguna</button></div></form>') +
      card('Catatan', '<ul class="ticks"><li>Pengguna yang diimpor memakai kata sandi awal yang sama dengan akun demo. Pada penerapan sebenarnya, kirim tautan atur kata sandi.</li><li>Peran dapat diubah kapan saja lewat tab Pengguna.</li><li>Baris dengan email yang sudah terdaftar dilewati.</li></ul>') + '</div>';
  }
  return pageHead('Pengguna dan impor', 'Tetapkan peran pengguna, proses pendaftar baru, atau impor akun sekaligus.') +
    '<div class="tabs" role="tablist">' + [['pengguna', 'Pengguna', S.users.length], ['pendaftar', 'Pendaftar', S.regs.length], ['impor', 'Impor CSV', '']].map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="users" data-v="' + t[0] + '">' + t[1] + (t[2] !== '' ? ' <b>' + t[2] + '</b>' : '') + '</button>').join('') + '</div>' + body;
};

PAGES['a-events'] = () => {
  const ev = S.events.slice().sort((a, b) => b.tgl.localeCompare(a.tgl));
  return pageHead('Event asesmen', 'Jadwalkan OSCE, CBT, ujian lisan, dan event asesmen lain beserta penguji dan kuota peserta.', '<button class="btn primary" data-a="ev-new">' + ic('plus', 16) + 'Event baru</button>') +
    (ev.length ? table(['Event', 'Jenis', 'Tanggal', 'Lokasi', 'Penguji', 'Kuota', 'Status', ''], ev.map(e => '<tr><td><b>' + esc(e.judul) + '</b><div class="mut">' + (e.st ? esc(stase(e.st).nama) : 'Lintas stase') + '</div></td><td>' + pill(e.jenis, 'info') + '</td><td class="nw">' + dfmt(e.tgl) + '</td><td>' + esc(e.lokasi) + '</td><td>' + esc(pname(e.penguji)) + '</td><td>' + e.kuota + '</td><td>' + pill(e.status, e.status === 'Selesai' ? 'good' : e.status === 'Dibatalkan' ? 'bad' : 'info') + '</td><td class="nw">' + (e.status === 'Dijadwalkan' ? '<button class="btn sm" data-a="ev-st" data-id="' + e.id + '" data-v="Selesai">Selesai</button> <button class="btn sm danger" data-a="ev-st" data-id="' + e.id + '" data-v="Dibatalkan">Batalkan</button>' : '') + '</td></tr>')) : empty('Belum ada event'));
};
function eventForm() {
  openModal('Event asesmen baru', '<form data-form="event" class="form-grid">' + field('ev-j', 'Jenis asesmen', selectEl('ev-j', JENIS_ASESMEN.map(x => [x.k, x.k + ', ' + x.n]), 'OSCE'), '', 'span2') + field('ev-t', 'Judul', input('ev-t', '', { req: true, ph: 'OSCE akhir stase Anak' }), '', 'span2') + field('ev-s', 'Stase', selectEl('ev-s', [['', 'Lintas stase']].concat(S.stases.map(x => [x.id, x.nama])), '')) + field('ev-d', 'Tanggal', input('ev-d', iso(addD(T0, 14)), { type: 'date', req: true })) + field('ev-l', 'Lokasi', input('ev-l', RSPU, { req: true })) + field('ev-p', 'Penguji utama', selectEl('ev-p', presList().map(p => [p.id, p.nama]), 'u-dosen')) + field('ev-k', 'Kuota peserta', input('ev-k', 20, { type: 'number', req: true, extra: 'min="1"' })) + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Jadwalkan</button></div></form>');
}

PAGES['a-curr'] = () => {
  const tab = UI.tab.curr || 'stase'; let body = '';
  const sumS = Object.keys(S.bobotStase).reduce((t, k) => t + S.bobotStase[k], 0), sumB = Object.keys(S.bobotBlok).reduce((t, k) => t + S.bobotBlok[k], 0);
  if (tab === 'stase') body = card('Stase, durasi, dan target kasus', '<form data-form="stase">' + table(['Stase', 'Durasi (minggu)', 'Target FKTP', 'Target FKRTL'], S.stases.map(s => '<tr><td><b>' + esc(s.nama) + '</b></td><td>' + input('st-m-' + s.id, s.minggu, { type: 'number', extra: 'min="1" max="20" aria-label="Durasi ' + esc(s.pendek) + '"' }) + '</td><td>' + input('st-f-' + s.id, s.tf, { type: 'number', extra: 'min="0" aria-label="Target FKTP ' + esc(s.pendek) + '"' }) + '</td><td>' + input('st-r-' + s.id, s.tr, { type: 'number', extra: 'min="0" aria-label="Target FKRTL ' + esc(s.pendek) + '"' }) + '</td></tr>'), 'edit') + '<div class="form-act"><button class="btn primary" type="submit">Simpan perubahan</button></div></form><p class="hint">Mengubah durasi menggeser jadwal rotasi semua mahasiswa. Daftar stase dan nilai awal adalah asumsi yang perlu disesuaikan dengan kurikulum prodi.</p>');
  else if (tab === 'bobot') body = '<div class="g2"><form data-form="bobot" data-t="stase">' + card('Bobot nilai stase (PSPD)', Object.keys(S.bobotStase).map(k => field('bs-' + k, esc(k), input('bs-' + k, S.bobotStase[k], { type: 'number', extra: 'min="0" max="100"' }))).join('') + '<p class="hint">Total saat ini: <b>' + sumS + '</b> dari 100. Komponen yang belum dinilai dikeluarkan dan bobotnya disetarakan ulang.</p><div class="form-act"><button class="btn primary" type="submit">Simpan bobot</button></div>') + '</form>' +
    '<form data-form="bobot" data-t="blok">' + card('Bobot nilai blok (PSSK)', Object.keys(S.bobotBlok).map(k => field('bb-' + k, esc(k), input('bb-' + k, S.bobotBlok[k], { type: 'number', extra: 'min="0" max="100"' }))).join('') + '<p class="hint">Total saat ini: <b>' + sumB + '</b> dari 100.</p><div class="form-act"><button class="btn primary" type="submit">Simpan bobot</button></div>') + '</form></div>';
  else if (tab === 'epa') body = card('Daftar EPA', table(['#', 'EPA', 'Deskripsi'], EPAS.map((e, i) => '<tr><td>E' + (i + 1) + '</td><td><b>' + esc(e[0]) + '</b></td><td class="wrapc">' + esc(e[1]) + '</td></tr>'))) + '<div class="mt">' + card('Tingkat entrustment', '<ol class="lv">' + EPA_LEVEL.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>') + '</div>';
  else if (tab === 'jenis') body = card('Empat belas jenis asesmen', table(['Jenis', 'Nama', 'Kelompok', 'Piramida Miller'], JENIS_ASESMEN.map(j => '<tr><td>' + pill(j.k, 'info') + '</td><td>' + esc(j.n) + '</td><td>' + esc(j.g) + '</td><td>' + esc(j.miller) + '</td></tr>'))) + '<p class="hint mt">Rubrik skala 1 sampai 9 tersedia untuk Mini-CEX dan DOPS. Jenis lain dicatat sebagai nilai 0 sampai 100 lewat input atau impor CSV.</p>';
  else body = card('Wahana pendidikan', table(['Wahana', 'Jenis'], S.wahana.map(w => '<tr><td><b>' + esc(w.nama) + '</b></td><td>' + pill(w.jenis, w.jenis === 'FKTP' ? 'info' : 'muted') + '</td></tr>')), '<button class="btn sm primary" data-a="wah-new">' + ic('plus', 14) + 'Tambah wahana</button>');
  return pageHead('Master kurikulum', 'Rumah sakit pendidikan utama ' + esc(RSPU) + '. Atur stase, bobot nilai, EPA, jenis asesmen, dan wahana.') +
    '<div class="tabs" role="tablist">' + [['stase', 'Stase dan target'], ['bobot', 'Bobot nilai'], ['epa', 'EPA'], ['jenis', 'Jenis asesmen'], ['wahana', 'Wahana']].map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="curr" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + body;
};
function wahForm() {
  openModal('Tambah wahana', '<form data-form="wahana" class="form-grid">' + field('wh-n', 'Nama wahana', input('wh-n', '', { req: true, ph: 'Puskesmas Contoh' }), '', 'span2') + field('wh-j', 'Jenis', selectEl('wh-j', ['FKTP', 'RS Jejaring', 'RS Pendidikan Utama'], 'FKTP'), '', 'span2') + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Tambah</button></div></form>');
}

/* ---------- Impor hasil asesmen ---------- */
const IMP_FIELDS = [['nim', 'NIM mahasiswa', ['nim', 'npm', 'nomor induk']], ['tahap', 'Tahap (PSSK atau PSPD)', ['tahap']], ['unit', 'Stase atau blok', ['unit', 'stase', 'blok']], ['komp', 'Komponen nilai', ['komponen', 'komp', 'jenis', 'asesmen']], ['v', 'Nilai', ['nilai', 'skor', 'score']], ['tgl', 'Tanggal (opsional)', ['tanggal', 'tgl', 'date']]];
function impAutoMap(head) { const m = {}; IMP_FIELDS.forEach(f => { const i = head.findIndex(h => f[2].indexOf(String(h).trim().toLowerCase()) >= 0); m[f[0]] = i; }); return m; }
function impUnit(tahap, raw) {
  const t = String(raw || '').trim().toLowerCase(); if (!t) return null;
  if (tahap === 'PSSK') { const b = PSSK_BLOK.find(x => x.toLowerCase() === t || x.toLowerCase().replace('blok ', '') === t); return b || null; }
  const s = S.stases.find(x => x.id === t || x.pendek.toLowerCase() === t || x.nama.toLowerCase() === t); return s ? s.id : null;
}
function impValidate() {
  const I = UI.imp; if (!I) return [];
  return I.rows.map((r, i) => {
    const g = k => I.map[k] >= 0 ? String(r[I.map[k]] == null ? '' : r[I.map[k]]).trim() : '';
    const err = []; const st = S.students.find(s => s.nim.toLowerCase() === g('nim').toLowerCase()); if (!st) err.push('NIM tidak ditemukan');
    let tahap = g('tahap').toUpperCase() || 'PSPD'; if (tahap !== 'PSSK' && tahap !== 'PSPD') { err.push('Tahap harus PSSK atau PSPD'); tahap = 'PSPD'; }
    const unit = impUnit(tahap, g('unit')); if (!unit) err.push('Stase atau blok tidak dikenali');
    const allowed = tahap === 'PSSK' ? Object.keys(S.bobotBlok) : ['CBT', 'OSCE', 'CBD', 'MSF'];
    const komp = allowed.find(k => k.toLowerCase() === g('komp').toLowerCase()); if (!komp) err.push('Komponen tidak valid untuk ' + tahap);
    const v = parseFloat(g('v').replace(',', '.')); if (isNaN(v) || v < 0 || v > 100) err.push('Nilai harus 0 sampai 100');
    const tg = g('tgl'); const tgl = /^\d{4}-\d{2}-\d{2}$/.test(tg) ? tg : iso(T0);
    return { i: i + 2, ok: !err.length, err, rec: err.length ? null : { sid: st.id, tahap, unit, komp, v: Math.round(v * 10) / 10, tgl, oleh: S.session.uid }, show: [g('nim'), tahap, g('unit'), g('komp'), g('v')] };
  });
}
PAGES['a-import'] = () => {
  const I = UI.imp; const val = I ? impValidate() : []; const ok = val.filter(x => x.ok).length;
  let prev = '';
  if (I) {
    prev = card('Pemetaan kolom', '<div class="form-grid">' + IMP_FIELDS.map(f => field('im-' + f[0], f[1], selectEl('im-' + f[0], [[-1, '(tidak dipakai)']].concat(I.head.map((h, i) => [i, h || 'Kolom ' + (i + 1)])), I.map[f[0]], { extra: 'data-ch="imp-map" data-k="' + f[0] + '"' }))).join('') + '</div>') +
      '<div class="mt">' + card('Pratinjau dan validasi', '<div class="row between"><span>' + pill(ok + ' baris valid', 'good') + ' ' + (val.length - ok ? pill((val.length - ok) + ' baris bermasalah', 'bad') : '') + '</span><div class="row"><button class="btn" data-a="imp-reset">Mulai ulang</button><button class="btn primary" data-a="imp-commit"' + (ok ? '' : ' disabled') + '>Impor ' + ok + ' baris valid</button></div></div>' +
        table(['Baris', 'NIM', 'Tahap', 'Stase atau blok', 'Komponen', 'Nilai', 'Hasil'], val.slice(0, 40).map(x => '<tr><td>' + x.i + '</td>' + x.show.map(c => '<td>' + esc(c) + '</td>').join('') + '<td>' + (x.ok ? pill('Valid', 'good') : pill(x.err[0], 'bad')) + '</td></tr>')) + (val.length > 40 ? '<p class="hint">Menampilkan 40 baris pertama dari ' + val.length + '.</p>' : '')) + '</div>';
  }
  return pageHead('Impor hasil asesmen', 'Impor nilai CBT, OSCE, CBD, dan MSF tahap profesi, atau nilai blok tahap sarjana, dari berkas CSV. Kolom dipetakan sendiri sehingga templat apa pun dapat dipakai.', '<button class="btn" data-a="imp-tpl">' + ic('copy', 16) + 'Salin templat CSV</button>') +
    (I ? prev : '<div class="g2">' + card('Tempel atau unggah CSV', '<form data-form="impparse">' + field('imp-text', 'Isi CSV', textarea('imp-text', UI.impText || '', { rows: 9, ph: 'nim,tahap,stase,komponen,nilai,tanggal\nPD25001,PSPD,ipd,OSCE,78,2026-10-10' })) + '<div class="row"><label class="btn file-btn">Pilih berkas CSV<input type="file" accept=".csv,text/csv,text/plain" data-ch="imp-file" hidden></label><button class="btn primary" type="submit">Baca dan validasi</button></div></form>') +
      card('Aturan impor', '<ul class="ticks"><li>NIM harus terdaftar. Contoh NIM demo: PD25001.</li><li>Tahap PSPD memakai kode stase seperti ipd, anak, atau bedah. Tahap PSSK memakai nama blok.</li><li>Komponen PSPD: CBT, OSCE, CBD, MSF. Mini-CEX, DOPS, dan Logbook dihitung otomatis.</li><li>Nilai pada rentang 0 sampai 100. Titik atau koma desimal sama-sama diterima.</li><li>Baris yang sudah ada untuk mahasiswa, stase, dan komponen yang sama akan diperbarui.</li></ul>') + '</div>');
};

/* ---------- Audit ---------- */
PAGES['a-audit'] = () => {
  const au = S.audit.slice().sort((a, b) => b.ts.localeCompare(a.ts)); const act = Object.keys(S.bg).filter(k => S.bg[k].until > Date.now());
  return pageHead('Audit dan Break Glass', 'Identitas pasien tersamarkan secara bawaan. Break Glass membuka identitas selama 15 menit untuk keadaan mendesak dan setiap akses dicatat di sini.', '<button class="btn" data-a="audit-copy">' + ic('copy', 16) + 'Salin CSV</button>') +
    '<div class="g3">' + kpi('Akses Break Glass', '<b>' + au.length + '</b>', 'Sepanjang periode ini') + kpi('Sesi aktif', '<b>' + act.length + '</b>', act.length ? 'Berakhir otomatis' : 'Tidak ada sesi terbuka') + kpi('Masa berlaku', '<b>15</b> menit', 'Setelah itu identitas tersamarkan kembali') + '</div>' +
    (act.length ? '<div class="mt">' + card('Sesi aktif', act.map(k => { const c = S.cases.find(x => x.id === k); return '<div class="pend"><div class="pend-i">' + ic('eye', 16) + '</div><div class="grow"><b>' + esc(c ? c.dx : k) + '</b><span>Dibuka oleh ' + esc(pname(S.bg[k].uid)) + ', sisa ' + Math.max(0, Math.ceil((S.bg[k].until - Date.now()) / 60000)) + ' menit</span></div><button class="btn sm danger" data-a="bg-end" data-id="' + k + '">Akhiri</button></div>'; }).join('')) + '</div>' : '') +
    '<div class="mt">' + card('Catatan akses', au.length ? table(['Waktu', 'Pengguna', 'Entri', 'Alasan', 'Durasi', 'Status'], au.map(a => { const c = S.cases.find(x => x.id === a.cid); return '<tr><td class="nw">' + esc(a.ts) + '</td><td>' + esc(pname(a.uid)) + '</td><td>' + esc(c ? c.dx + ' (' + sName(c.sid) + ')' : '-') + '</td><td class="wrapc">' + esc(a.alasan) + '</td><td>' + a.menit + ' menit</td><td>' + pill((a.status === 'Aktif' && !bgActive(a.cid)) ? 'Selesai' : a.status, (a.status === 'Aktif' && bgActive(a.cid)) ? 'warn' : 'muted') + '</td></tr>'; })) : empty('Belum ada akses Break Glass')) + '</div>' +
    '<div class="mt">' + card('Perlindungan data pasien', '<ul class="ticks"><li>Identitas pasien disimpan terpisah dan, pada penerapan sebenarnya, terenkripsi di basis data.</li><li>Privacy Mode aktif secara bawaan untuk semua peran.</li><li>Persetujuan pasien dikumpulkan lewat tautan atau QR.</li><li>Prototipe ini hanya menyimpan data di peramban Anda. Jangan memasukkan data pasien yang sebenarnya.</li></ul><div class="form-act"><button class="btn danger" data-a="reset">Atur ulang data demo</button></div>') + '</div>';
};
