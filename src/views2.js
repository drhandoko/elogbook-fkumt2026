/* ================= DOSEN / PRESEPTOR / KAPRODI ================= */
const riskPill = r => pill({ stabil: 'Stabil', perhatian: 'Perlu perhatian', berisiko: 'Berisiko' }[r] || '-', { stabil: 'good', perhatian: 'warn', berisiko: 'bad' }[r]);
const ageD = tgl => dayDiff(T0, parseD(tgl));
const mineCases = () => S.cases.filter(c => c.pid === S.session.uid);
const sName = id => { const s = studentById(id); return s ? s.nama : '-'; };
const STU_OPTS = () => S.students.map(s => [s.id, s.nama + ' (' + s.nim + ')']);
const MON_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/* ---------- Beranda dosen/preseptor ---------- */
PAGES['v-home'] = () => {
  const u = me(); const mc = mineCases(); const pend = mc.filter(c => c.stat === 'menunggu').sort((a, b) => a.tgl.localeCompare(b.tgl));
  const pa = S.asms.filter(a => (a.pid === u.id || (a.jenis === 'MSF' && !(a.ratings||[]).some(r=>r.uid===u.id))) && a.stat === 'menunggu');
  const sids = new Set(mc.map(c => c.sid));
  const fbH = mc.map(feedbackHours).filter(h => h != null);
  const old = pend.filter(c => ageD(c.tgl) > 7).length;
  const evs = S.events.filter(e => e.tgl >= iso(T0)).sort((a, b) => a.tgl.localeCompare(b.tgl));
  const myEpa = S.epaLog.filter(e => e.pid === u.id).sort((a, b) => b.tgl.localeCompare(a.tgl)).slice(0, 4);
  return pageHead('Selamat datang, ' + esc(u.nama), ROLE_LABEL[S.session.role] + ' &middot; ' + esc(u.unit || ''), '<button class="btn primary" data-a="nav" data-p="v-validate">' + ic('check', 16) + 'Buka antrean validasi</button>') +
    '<div class="g4">' + kpi('Menunggu validasi', '<b>' + pend.length + '</b>', old ? '<span class="warnt">' + old + ' lebih dari 7 hari</span>' : 'Tidak ada antrean tertunda') +
    kpi('Penilaian menunggu', '<b>' + pa.length + '</b>', 'DOPS dan Mini-CEX yang diminta mahasiswa') +
    kpi('Mahasiswa dibimbing', '<b>' + sids.size + '</b>', mc.length + ' entri logbook dibimbing') +
    kpi('Waktu umpan balik', '<b>' + (fbH.length ? n0(mean(fbH)) : '-') + '</b> jam', 'Rata-rata, target 72 jam', fbH.length ? bar(clamp(100 - mean(fbH) / 72 * 100 + 50, 0, 100), mean(fbH) <= 72 ? 'good' : 'warn') : '') + '</div>' +
    '<div class="g2 mt">' +
    card('Antrean validasi', pend.length ? table(['Tanggal', 'Mahasiswa', 'Entri', 'Usia', ''], pend.slice(0, 6).map(c => '<tr><td class="nw">' + dfmt(c.tgl) + '</td><td>' + esc(sName(c.sid)) + '</td><td>' + esc(c.dx) + '</td><td>' + pill(ageD(c.tgl) + ' hari', ageD(c.tgl) > 7 ? 'warn' : 'muted') + '</td><td><button class="btn sm" data-a="case-open" data-id="' + c.id + '">Tinjau</button></td></tr>')) : empty('Antrean validasi kosong', 'Semua entri yang diajukan sudah ditinjau.'), '<button class="lnk" data-a="nav" data-p="v-validate">Semua</button>') +
    card('Penilaian menunggu', pa.length ? pa.map(a => '<div class="pend"><div class="pend-i">' + ic('target', 16) + '</div><div class="grow"><b>' + esc(a.judul) + '</b><span>' + esc(sName(a.sid)) + ' &middot; ' + dfmt(a.tgl) + '</span></div><button class="btn sm primary" data-a="grade" data-id="' + a.id + '">Nilai</button></div>').join('') : empty('Tidak ada penilaian menunggu'), '<button class="lnk" data-a="nav" data-p="v-assess">Semua</button>') + '</div>' +
    '<div class="g2 mt">' +
    card('Jadwal event asesmen', evs.length ? evs.slice(0, 4).map(e => '<div class="evr"><div class="evr-d"><b>' + parseD(e.tgl).getDate() + '</b><span>' + MON[parseD(e.tgl).getMonth()] + '</span></div><div><b>' + esc(e.judul) + '</b><span>' + pill(e.jenis, 'info') + ' ' + esc(e.lokasi) + ' &middot; Penguji ' + esc(pname(e.penguji)) + '</span></div></div>').join('') : empty('Belum ada event mendatang')) +
    card('Keputusan entrustment terbaru', myEpa.length ? myEpa.map(e => '<div class="fbi"><div class="fbi-h">' + pill('Level ' + e.level, 'good') + '<span>' + dfmt(e.tgl) + ' &middot; ' + esc(sName(e.sid)) + '</span></div><b>' + esc(EPAS[e.epa][0]) + '</b><p>' + esc(e.cm) + '</p></div>').join('') : empty('Belum ada keputusan dari Anda'), '<button class="lnk" data-a="nav" data-p="v-assess">Buat</button>') + '</div>';
};

/* ---------- Validasi ---------- */
PAGES['v-validate'] = () => {
  const f = UI.fl.val || (UI.fl.val = { scope: 'mine', q: '' }); const tab = UI.tab.val || 'antrean';
  const base = f.scope === 'all' ? S.cases : mineCases(); const q = f.q.toLowerCase();
  const pend = base.filter(c => c.stat === 'menunggu' && (!q || c.dx.toLowerCase().includes(q) || sName(c.sid).toLowerCase().includes(q))).sort((a, b) => a.tgl.localeCompare(b.tgl));
  const done = base.filter(c => (c.stat === 'valid' || c.stat === 'kembali') && c.fb).sort((a, b) => (b.fbTgl || '').localeCompare(a.fbTgl || '')).slice(0, 15);
  const ready = pend.filter(c => c.cons && c.jenis === 'Kasus').length;
  return pageHead('Validasi logbook', 'Tinjau entri yang diajukan mahasiswa, validasi, atau kembalikan dengan umpan balik yang spesifik.', ready ? '<button class="btn primary" data-a="val-bulk">' + ic('check', 16) + 'Validasi ' + ready + ' entri berpersetujuan</button>' : '') +
    '<div class="tabs" role="tablist">' + [['antrean', 'Antrean', pend.length], ['riwayat', 'Riwayat', done.length]].map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="val" data-v="' + t[0] + '">' + t[1] + ' <b>' + t[2] + '</b></button>').join('') + '</div>' +
    '<div class="toolbar"><div class="srch">' + ic('search', 16) + '<input id="val-q" data-f="val.q" type="search" value="' + esc(f.q) + '" placeholder="Cari mahasiswa atau diagnosis" aria-label="Cari"></div>' + selectEl('val-scope', [['mine', 'Hanya yang ditujukan kepada saya'], ['all', 'Semua preseptor']], f.scope, { extra: 'data-f="val.scope" aria-label="Cakupan"' }) + '</div>' +
    (tab === 'antrean' ? (pend.length ? table(['Tanggal', 'Mahasiswa', 'Entri', 'Stase', 'Pasien', 'Persetujuan', 'Usia', 'Penilai', ''], pend.map(c => '<tr><td class="nw">' + dfmt(c.tgl) + '</td><td>' + esc(sName(c.sid)) + '</td><td><b>' + esc(c.dx) + '</b><div class="mut">' + c.jenis + (c.kat ? ' &middot; ' + c.kat : '') + '</div></td><td>' + esc(stName(c.st)) + '</td><td class="mono">' + (c.jenis === 'Kasus' ? ptLabel(c) : '-') + '</td><td>' + (c.jenis === 'Kasus' ? pill(c.cons ? 'Tercatat' : 'Belum', c.cons ? 'good' : 'warn') : '-') + '</td><td>' + pill(ageD(c.tgl) + ' hari', ageD(c.tgl) > 7 ? 'warn' : 'muted') + '</td><td>' + esc(pname(c.pid)) + '</td><td><button class="btn sm primary" data-a="case-open" data-id="' + c.id + '">Tinjau</button></td></tr>')) : empty('Antrean kosong', 'Tidak ada entri yang menunggu validasi pada cakupan ini.'))
      : (done.length ? table(['Tanggal umpan balik', 'Mahasiswa', 'Entri', 'Hasil', 'Umpan balik', ''], done.map(c => '<tr><td class="nw">' + dfmt(c.fbTgl) + '</td><td>' + esc(sName(c.sid)) + '</td><td>' + esc(c.dx) + '</td><td>' + statPill(c.stat) + '</td><td class="wrapc">' + esc(c.fb) + '</td><td><button class="btn sm" data-a="case-open" data-id="' + c.id + '">Buka</button></td></tr>')) : empty('Belum ada riwayat')));
};

/* ---------- Penilaian ---------- */
function gradeForm(id) {
  const a = S.asms.find(x => x.id === id); if (!a) return; const dom = assessmentDomains(a.jenis);
  openModal('Nilai ' + esc(a.judul), '<p class="sub">' + esc(sName(a.sid)) + ' &middot; ' + dfmt(a.tgl) + ' &middot; ' + esc(stase(a.st).nama) + '</p><p class="hint">Skala 1 sampai 9: 1 sampai 3 di bawah harapan, 4 sampai 6 sesuai harapan, 7 sampai 9 di atas harapan.</p>' +
    '<form data-form="grade" data-id="' + a.id + '" class="form-grid">' + dom.map((d, i) => field('g' + i, esc(d), selectEl('g' + i, [['', 'Pilih skor']].concat([1,2,3,4,5,6,7,8,9]), '', {req:true}))).join('') +
    field('g-kek', 'Kekuatan', textarea('g-kek', '', { rows: 2, req: true, ph: 'Hal yang sudah dilakukan dengan baik' }), '', 'span2') + field('g-perlu', 'Perlu ditingkatkan', textarea('g-perlu', '', { rows: 2, req: true }), '', 'span2') + field('g-renc', 'Rencana tindak lanjut', textarea('g-renc', '', { rows: 2, req: true, ph: 'Langkah konkret dan kapan diobservasi ulang' }), '', 'span2') +
    '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Simpan penilaian</button></div></form>', { wide: true });
}
function epaForm(sid) {
  openModal('Keputusan entrustment EPA', '<form data-form="epa" class="form-grid">' + field('ep-s', 'Mahasiswa', selectEl('ep-s', STU_OPTS(), sid || firstSid()), '', 'span2') + field('ep-e', 'EPA', selectEl('ep-e', EPAS.map((e, i) => [i, e[0]]), 0), '', 'span2') + field('ep-l', 'Tingkat entrustment', selectEl('ep-l', EPA_LEVEL.map((x, i) => [i + 1, x]), 3), '', 'span2') + field('ep-c', 'Dasar keputusan', textarea('ep-c', '', { rows: 3, req: true, ph: 'Data point yang mendasari keputusan, misalnya jumlah observasi dan konsistensinya' }), 'Keputusan entrustment ditinjau dari banyak data point, bukan satu kejadian.', 'span2') + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Tetapkan</button></div></form>', { wide: true });
}
function scoreForm() {
  openModal('Input nilai asesmen akademik', '<form data-form="score" class="form-grid">' + field('sc-s', 'Mahasiswa', selectEl('sc-s', STU_OPTS(), firstSid()), '', 'span2') + field('sc-u', 'Stase', selectEl('sc-u', S.stases.map(x => [x.id, x.nama]), 'ipd')) + field('sc-k', 'Komponen', selectEl('sc-k', ['CBT', 'OSCE', 'CBD', 'MSF'], 'OSCE')) + field('sc-v', 'Nilai (0 sampai 100)', input('sc-v', '', { type: 'number', req: true, extra: 'min="0" max="100" step="0.1"' }), '', 'span2') + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Simpan nilai</button></div></form>');
}
PAGES['v-assess'] = () => {
  const u = me(); const tab = UI.tab.assess || 'menunggu';
  const pa = S.asms.filter(a => (a.pid === u.id || (a.jenis === 'MSF' && !(a.ratings||[]).some(r=>r.uid===u.id))) && a.stat === 'menunggu');
  const hist = S.asms.filter(a => a.pid === u.id && a.stat === 'dinilai').sort((a, b) => b.tgl.localeCompare(a.tgl)).slice(0, 12);
  const epl = S.epaLog.filter(e => e.pid === u.id).sort((a, b) => b.tgl.localeCompare(a.tgl));
  const nl = S.nilai.filter(n => n.tahap === 'PSPD').sort((a, b) => b.tgl.localeCompare(a.tgl)).slice(0, 12);
  let body = '';
  if (tab === 'menunggu') body = pa.length ? '<div class="g2">' + pa.map(a => '<article class="card"><div class="card-b"><div class="asm-h"><div><b>' + esc(a.judul) + '</b><span class="mut">' + esc(sName(a.sid)) + ' &middot; ' + dfmt(a.tgl) + ' &middot; ' + esc(stName(a.st)) + '</span></div>' + pill('Menunggu', 'warn') + '</div><p class="hint">Rubrik ' + esc(a.jenis) + ' dengan ' + assessmentDomains(a.jenis).length + ' domain dan umpan balik naratif.</p><button class="btn primary" data-a="grade" data-id="' + a.id + '">Mulai menilai</button></div></article>').join('') + '</div>' : empty('Tidak ada penilaian menunggu');
  else if (tab === 'epa') body = '<div class="g2">' + card('Keputusan Anda', epl.length ? epl.map(e => '<div class="fbi"><div class="fbi-h">' + pill('Level ' + e.level, 'good') + '<span>' + dfmt(e.tgl) + ' &middot; ' + esc(sName(e.sid)) + '</span></div><b>' + esc(EPAS[e.epa][0]) + '</b><p>' + esc(e.cm) + '</p></div>').join('') : empty('Belum ada keputusan'), '<button class="btn sm primary" data-a="epa-new">' + ic('plus', 14) + 'Keputusan baru</button>') + card('Tingkat entrustment', '<ol class="lv">' + EPA_LEVEL.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol><p class="hint">Gunakan beberapa observasi dan sumber sebelum menaikkan tingkat.</p>') + '</div>';
  else if (tab === 'nilai') body = card('Nilai akademik terbaru', nl.length ? table(['Tanggal', 'Mahasiswa', 'Stase', 'Komponen', 'Nilai'], nl.map(n => '<tr><td class="nw">' + dfmt(n.tgl) + '</td><td>' + esc(sName(n.sid)) + '</td><td>' + esc(stName(n.unit)) + '</td><td>' + pill(n.komp, 'info') + '</td><td><b>' + n0(n.v) + '</b></td></tr>')) : empty('Belum ada nilai'), '<button class="btn sm primary" data-a="score-new">' + ic('plus', 14) + 'Input nilai</button>') + '<p class="hint mt">CBT, OSCE, CBD, dan MSF diinput di sini atau lewat impor CSV oleh admin. Mini-CEX, DOPS, dan Logbook dihitung otomatis dari asesmen dan logbook.</p>';
  else body = hist.length ? table(['Tanggal', 'Mahasiswa', 'Asesmen', 'Rata-rata', 'Rencana tindak lanjut'], hist.map(a => '<tr><td class="nw">' + dfmt(a.tgl) + '</td><td>' + esc(sName(a.sid)) + '</td><td>' + esc(a.judul) + '</td><td><b>' + n1(mean(a.sk)) + '</b></td><td class="wrapc">' + esc(a.renc) + '</td></tr>')) : empty('Belum ada riwayat penilaian');
  return pageHead('Penilaian', 'Asesmen tempat kerja berbasis rubrik, keputusan entrustment EPA, dan input nilai akademik.', '<button class="btn" data-a="score-new">Input nilai</button><button class="btn primary" data-a="epa-new">' + ic('plus', 16) + 'Keputusan EPA</button>') +
    '<div class="tabs" role="tablist">' + [['menunggu', 'Menunggu dinilai', pa.length], ['epa', 'Entrustment EPA', epl.length], ['nilai', 'Nilai akademik', nl.length], ['riwayat', 'Riwayat penilaian', hist.length]].map(t => '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="' + (tab === t[0] ? 'on' : '') + '" data-a="tab" data-k="assess" data-v="' + t[0] + '">' + t[1] + ' <b>' + t[2] + '</b></button>').join('') + '</div>' + body;
};

/* ---------- Direktori dan portofolio mahasiswa ---------- */
PAGES['v-dir'] = () => {
  const f = UI.fl.dir || (UI.fl.dir = { q: '', risk: '', g: '' }); const q = f.q.toLowerCase();
  const rows = S.students.map(s => ({ s, t: stats(s.id) })).filter(x => (!q || x.s.nama.toLowerCase().includes(q) || x.s.nim.toLowerCase().includes(q)) && (!f.risk || x.t.risk === f.risk) && (!f.g || String(x.s.g) === f.g));
  return pageHead('Direktori mahasiswa', 'Profil longitudinal setiap mahasiswa. Klik untuk membuka portofolio lengkap.') +
    '<div class="toolbar"><div class="srch">' + ic('search', 16) + '<input id="dir-q" data-f="dir.q" type="search" value="' + esc(f.q) + '" placeholder="Cari nama atau NIM" aria-label="Cari"></div>' + selectEl('dir-g', [['', 'Semua kelompok'], ['0', 'Kelompok A'], ['1', 'Kelompok B'], ['2', 'Kelompok C'], ['3', 'Kelompok D']], f.g, { extra: 'data-f="dir.g" aria-label="Kelompok"' }) + selectEl('dir-r', [['', 'Semua status'], ['stabil', 'Stabil'], ['perhatian', 'Perlu perhatian'], ['berisiko', 'Berisiko']], f.risk, { extra: 'data-f="dir.risk" aria-label="Status"' }) + '</div>' +
    (rows.length ? table(['Mahasiswa', 'Kelompok', 'Stase berjalan', 'Kasus', 'Validasi', 'Mini-CEX', 'EPA rata-rata', 'Nilai PSPD', 'Status', ''], rows.map(x => '<tr><td><b>' + esc(x.s.nama) + '</b><div class="mut mono">' + esc(x.s.nim) + '</div></td><td>' + 'ABCD'[x.s.g % 4] + '</td><td>' + esc(x.t.curS.pendek) + '</td><td>' + x.t.total + '</td><td>' + n0(x.t.total ? x.t.valid / x.t.total * 100 : 0) + '%</td><td>' + n1(x.t.mini) + '</td><td>' + n1(x.t.epaAvg) + '</td><td>' + n1(x.t.pspd) + '</td><td>' + riskPill(x.t.risk) + '</td><td><button class="btn sm" data-a="stu" data-id="' + x.s.id + '">Buka</button></td></tr>')) : empty('Tidak ada mahasiswa yang cocok'));
};
PAGES['v-student'] = p => {
  const sid = p.sid || firstSid(); const st = studentById(sid), s = stats(sid); const role = S.session.role;
  const rec = casesOf(sid).slice().sort((a, b) => b.tgl.localeCompare(a.tgl)).slice(0, 8);
  return '<button class="lnk back" data-a="back">&larr; Kembali</button>' +
    pageHead(st.nama, esc(st.nim) + ' &middot; Kelompok ' + 'ABCD'[st.g % 4] + ' &middot; Stase berjalan ' + esc(s.curS.nama) + ' ' + riskPill(s.risk), (role === 'kaprodi' ? '<button class="btn" data-a="ews-new" data-id="' + sid + '">' + ic('alert', 16) + 'Catat peringatan dini</button>' : '') + '<button class="btn primary" data-a="epa-new" data-id="' + sid + '">' + ic('target', 16) + 'Keputusan EPA</button>') +
    '<div class="g4">' + kpi('Kasus', '<b>' + s.total + '</b>', '+' + s.bulan + ' bulan ini') + kpi('Validasi', '<b>' + n0(s.total ? s.valid / s.total * 100 : 0) + '%</b>', s.menunggu + ' menunggu, ' + s.kembali + ' dikembalikan') + kpi('Mini-CEX', '<b>' + n1(s.mini) + '</b>', 'Skala 1 sampai 9') + kpi('Skor kesehatan belajar', '<b>' + n0(s.health) + '</b>', riskPill(s.risk)) + '</div>' +
    '<div class="mt">' + portfolio(sid) + '</div>' +
    '<div class="mt">' + card('Entri logbook terbaru', table(['Tanggal', 'Entri', 'Stase', 'Status', ''], rec.map(c => '<tr><td class="nw">' + dfmt(c.tgl) + '</td><td>' + esc(c.dx) + '</td><td>' + esc(stName(c.st)) + '</td><td>' + statPill(c.stat) + '</td><td><button class="btn sm" data-a="case-open" data-id="' + c.id + '">Buka</button></td></tr>'))) + '</div>';
};

/* ================= KAPRODI ================= */
const ALL = () => S.students.map(s => s.id);
function monthKeys(n) { const out = []; for (let k = n - 1; k >= 0; k--) { const d = new Date(T0.getFullYear(), T0.getMonth() - k, 1); out.push({ key: d.getFullYear() + '-' + pad(d.getMonth() + 1), lab: MON[d.getMonth()] }); } return out; }
PAGES['k-home'] = () => {
  const ss = S.students.map(s => ({ s, t: stats(s.id) }));
  const nR = ss.filter(x => x.t.risk === 'berisiko').length, nP = ss.filter(x => x.t.risk === 'perhatian').length, nS = ss.length - nR - nP;
  const tot = ss.reduce((t, x) => t + x.t.total, 0), val = ss.reduce((t, x) => t + x.t.valid, 0);
  const back = S.cases.filter(c => c.stat === 'menunggu' && ageD(c.tgl) > 7).length;
  const mk = monthKeys(8); const mini = S.asms.filter(a => a.jenis === 'Mini-CEX' && a.stat === 'dinilai');
  const trend = mk.map(m => { const l = mini.filter(a => a.tgl.slice(0, 7) === m.key); return l.length ? mean(l.map(a => mean(a.sk))) : null; });
  const perSt = S.stases.map(s => S.cases.filter(c => c.st === s.id && c.jenis === 'Kasus' && c.stat === 'valid').length);
  const worst = ss.slice().sort((a, b) => (a.t.health == null ? 999 : a.t.health) - (b.t.health == null ? 999 : b.t.health)).slice(0, 5);
  return pageHead('Dashboard kohort', 'Gambaran program studi: kemajuan, kualitas asesmen, dan mahasiswa yang perlu perhatian. Data ' + S.students.length + ' mahasiswa.', '<button class="btn" data-a="cohort-copy">' + ic('copy', 16) + 'Salin ringkasan CSV</button>') +
    '<div class="g4">' + kpi('Mahasiswa aktif', '<b>' + ss.length + '</b>', nS + ' stabil, ' + nP + ' perlu perhatian') + kpi('Kasus tervalidasi', '<b>' + n0(tot ? val / tot * 100 : 0) + '%</b>', val + ' dari ' + tot + ' kasus', bar(tot ? val / tot * 100 : 0, 'good')) + kpi('Mini-CEX kohort', '<b>' + n1(mean(mini.map(a => mean(a.sk)))) + '</b>', 'Rata-rata ' + mini.length + ' observasi') + kpi('Verifikasi tertunda', '<b>' + back + '</b>', 'Entri menunggu lebih dari 7 hari', '') + '</div>' +
    '<div class="g2 mt">' + card('Tren Mini-CEX kohort', lineChart([{ name: 'Rata-rata kohort', vals: trend }], mk.map(m => m.lab), { min: 1, max: 9, area: true, label: 'Tren Mini-CEX kohort' }), '<span class="hint">Skala 1 sampai 9</span>') +
    card('Sebaran status mahasiswa', hbars([{ l: 'Stabil', v: nS, tone: 'good' }, { l: 'Perlu perhatian', v: nP, tone: 'warn' }, { l: 'Berisiko', v: nR, tone: 'bad' }], { max: ss.length }) + '<p class="hint">Status berasal dari skor kesehatan belajar gabungan Mini-CEX, laju kasus, EPA, dan nilai PSPD.</p>', '<button class="lnk" data-a="nav" data-p="k-ews">Detail</button>') + '</div>' +
    '<div class="g2 mt">' + card('Kasus tervalidasi per stase', columns(perSt, S.stases.map(s => s.pendek)), '<span class="hint">Seluruh kohort</span>') +
    card('Perlu perhatian', table(['Mahasiswa', 'Stase', 'Skor', 'Status', ''], worst.map(x => '<tr><td><b>' + esc(x.s.nama) + '</b></td><td>' + esc(x.t.curS.pendek) + '</td><td>' + n0(x.t.health) + '</td><td>' + riskPill(x.t.risk) + '</td><td><button class="btn sm" data-a="stu" data-id="' + x.s.id + '">Buka</button></td></tr>'))) + '</div>';
};

/* Pemetaan kompetensi SKDI */
const AREA_SHORT = ['Profesionalitas', 'Mawas diri', 'Komunikasi', 'Info', 'Landasan ilmiah', 'Keterampilan klinis', 'Masalah kesehatan'];
const AREA_SRC = ['Mini-CEX dan DOPS domain profesionalisme, MSF', 'Persentase entri logbook yang disertai refleksi, terhadap target 30 persen', 'Mini-CEX komunikasi, DOPS informed consent, EPA Edukasi dan komunikasi', 'EPA Dokumentasi rekam medis, kelengkapan dan validasi logbook', 'CBT dan CBD', 'Mini-CEX anamnesis dan pemeriksaan fisik, DOPS teknik, OSCE', 'Mini-CEX penalaran klinis, EPA Tata laksana, EPA Rujukan'];
function areaScores(sids) {
  const a = sids.reduce((t, id) => t.concat(asmsOf(id).filter(x => x.stat === 'dinilai')), []);
  const mc = a.filter(x => x.jenis === 'Mini-CEX'), dp = a.filter(x => x.jenis === 'DOPS');
  const avg = (l, i) => l.length ? mean(l.map(x => x.sk[i])) / 9 * 100 : null;
  const nv = k => { const v = S.nilai.filter(n => sids.includes(n.sid) && n.komp === k && n.tahap === 'PSPD').map(n => n.v); return v.length ? mean(v) : null; };
  const epa = i => { const v = sids.map(id => (S.epa[id] || [])[i]).filter(x => x != null); return v.length ? mean(v) / 5 * 100 : null; };
  const cs = sids.reduce((t, id) => t.concat(casesOf(id).filter(c => c.jenis === 'Kasus')), []);
  const valR = cs.length ? cs.filter(c => c.stat === 'valid').length / cs.length * 100 : null;
  const refR = cs.length ? Math.min(100, cs.filter(c => c.ref).length / cs.length / .3 * 100) : null;
  const m = function () { const v = Array.prototype.slice.call(arguments).filter(y => y != null); return v.length ? mean(v) : null; };
  return [m(avg(mc, 2), avg(dp, 5), nv('MSF')), refR, m(avg(mc, 4), avg(dp, 1), epa(5)), m(epa(6), valR), m(nv('CBT'), nv('CBD')), m(avg(mc, 0), avg(mc, 1), avg(dp, 2), nv('OSCE')), m(avg(mc, 3), epa(4), epa(8))];
}
PAGES['k-comp'] = () => {
  const g = UI.fl.comp || (UI.fl.comp = { g: '' }); const sids = S.students.filter(s => g.g === '' || String(s.g) === g.g).map(s => s.id);
  const sc = areaScores(sids); const all = areaScores(ALL());
  return pageHead('Capaian kompetensi', 'Gabungan data point dari berbagai sumber dipetakan ke tujuh area kompetensi SKDI 2026. Satu area dibaca dari banyak asesmen, bukan satu instrumen.', selectEl('comp-g', [['', 'Seluruh kohort'], ['0', 'Kelompok A'], ['1', 'Kelompok B'], ['2', 'Kelompok C'], ['3', 'Kelompok D']], g.g, { extra: 'data-f="comp.g" aria-label="Kelompok"' })) +
    '<div class="g2">' + card('Radar area kompetensi', '<div class="rad-s">' + radar(sc.map(v => v || 0), AREA_SHORT, 100) + '</div><p class="hint c">Skala 0 sampai 100. Berdasarkan ' + sids.length + ' mahasiswa.</p>') +
    card('Skor per area', hbars(sc.map((v, i) => ({ l: AREA_SKDI[i], v: v || 0, t: n0(v), tone: v == null ? '' : v >= 75 ? 'good' : v >= 60 ? '' : 'warn' })), { max: 100 }) + '<p class="hint">Ambang perhatian 60. Area di bawah ambang perlu ditinjau lewat data point penyusunnya.</p>') + '</div>' +
    '<div class="mt">' + card('Sumber data point tiap area', table(['Area kompetensi', 'Sumber data point', 'Skor pilihan', 'Seluruh kohort'], AREA_SKDI.map((a, i) => '<tr><td><b>' + esc(a) + '</b></td><td class="wrapc">' + esc(AREA_SRC[i]) + '</td><td>' + n0(sc[i]) + '</td><td>' + n0(all[i]) + '</td></tr>')) + '<p class="hint">Pemetaan ini adalah asumsi awal yang dapat disesuaikan prodi bersama tim kurikulum.</p>') + '</div>';
};
PAGES['k-epa'] = () => {
  const cls = v => v >= 4 ? 'hi' : v >= 3 ? 'mid' : 'lo';
  const rows = S.students.map(s => ({ s, lv: S.epa[s.id] || EPAS.map(() => 1) }));
  const mean9 = EPAS.map((_, i) => mean(rows.map(r => r.lv[i])));
  return pageHead('Peta EPA', 'Tingkat entrustment setiap mahasiswa pada sembilan EPA. Sel gelap menunjukkan tingkat lebih tinggi.') +
    card('Peta panas entrustment', '<div class="tbl-wrap"><table class="mosaic heatm"><thead><tr><th>Mahasiswa</th>' + EPAS.map((e, i) => '<th title="' + esc(e[0]) + '">E' + (i + 1) + '</th>').join('') + '<th>Rata-rata</th></tr></thead><tbody>' + rows.map(r => '<tr><th scope="row"><button class="lnk" data-a="stu" data-id="' + r.s.id + '">' + esc(r.s.nama) + '</button></th>' + r.lv.map(v => '<td><span class="mz" style="' + heat(v - 1, 4) + '">' + v + '</span></td>').join('') + '<td><b>' + n1(mean(r.lv)) + '</b></td></tr>').join('') + '<tr class="sumrow"><th scope="row">Rata-rata kohort</th>' + mean9.map(v => '<td><b>' + n1(v) + '</b></td>').join('') + '<td><b>' + n1(mean(mean9)) + '</b></td></tr></tbody></table></div><div class="legend">' + EPAS.map((e, i) => '<span><b>E' + (i + 1) + '</b> ' + esc(e[0]) + '</span>').join('') + '</div>') +
    '<div class="g2 mt">' + card('Mahasiswa dengan level 3 atau lebih', hbars(EPAS.map((e, i) => { const n = rows.filter(r => r.lv[i] >= 3).length; return { l: 'E' + (i + 1) + ' ' + e[0], v: n, t: n + ' dari ' + rows.length, tone: n / rows.length >= .6 ? 'good' : n / rows.length >= .35 ? '' : 'warn' }; }), { max: rows.length })) +
    card('Arti tingkat entrustment', '<ol class="lv">' + EPA_LEVEL.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>') + '</div>';
};
PAGES['k-pct'] = () => {
  const th = UI.tab.pct || 'PSPD'; const f = th === 'PSSK' ? psskScore : pspdScore;
  const rows = S.students.map(s => ({ s, v: f(s.id), p: pctRank(th, s.id) })).filter(x => x.v != null).sort((a, b) => b.v - a.v);
  const bins = [['< 60', 0, 60], ['60 sampai 69', 60, 70], ['70 sampai 79', 70, 80], ['80 atau lebih', 80, 101]];
  return pageHead('Persentil kohort', 'Posisi relatif setiap mahasiswa dalam kohort. Persentil dipakai untuk pembinaan, bukan untuk memeringkat secara terbuka.') +
    '<div class="tabs sm" role="tablist">' + [['PSPD', 'PSPD, tahap profesi'], ['PSSK', 'PSSK, tahap sarjana']].map(t => '<button role="tab" aria-selected="' + (th === t[0]) + '" class="' + (th === t[0] ? 'on' : '') + '" data-a="tab" data-k="pct" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
    '<div class="g2">' + card('Sebaran nilai terbobot', columns(bins.map(b => rows.filter(r => r.v >= b[1] && r.v < b[2]).length), bins.map(b => b[0])), '<span class="hint">' + rows.length + ' mahasiswa</span>') + card('Ringkasan', '<div class="g2 tight">' + kpi('Rata-rata', '<b>' + n1(mean(rows.map(r => r.v))) + '</b>') + kpi('Median', '<b>' + n1(rows.length ? rows[Math.floor(rows.length / 2)].v : null) + '</b>') + '</div><p class="hint">Nilai dihitung dari komponen yang sudah dinilai dengan bobot disetarakan ke 100 persen.</p>') + '</div>' +
    '<div class="mt">' + table(['#', 'Mahasiswa', 'Nilai terbobot', 'Persentil', 'Posisi'], rows.map((r, i) => '<tr><td>' + (i + 1) + '</td><td><button class="lnk" data-a="stu" data-id="' + r.s.id + '">' + esc(r.s.nama) + '</button></td><td><b>' + n1(r.v) + '</b></td><td>' + n0(r.p) + '</td><td class="gcell">' + gauge(r.p, '') + '</td></tr>')) + '</div>';
};
const EWS_STAT = { antrean: ['Antrean', 'warn'], dilaporkan: ['Direkomendasikan', 'info'], selesai: ['Selesai', 'good'] };
PAGES['k-ews'] = () => {
  const ss = S.students.map(s => ({ s, t: stats(s.id) })).sort((a, b) => (a.t.health == null ? 999 : a.t.health) - (b.t.health == null ? 999 : b.t.health));
  const notes = S.ews.slice().sort((a, b) => b.tgl.localeCompare(a.tgl));
  return pageHead('Peringatan dini', 'Deteksi lebih awal mahasiswa yang mungkin membutuhkan pendampingan, lalu catat rekomendasi tindak lanjut. Catatan hanya terlihat oleh Kaprodi.', '<button class="btn primary" data-a="ews-new">' + ic('plus', 16) + 'Catat peringatan</button>') +
    '<div class="g2">' + card('Skor kesehatan belajar', table(['Mahasiswa', 'Mini-CEX', 'Laju kasus', 'EPA', 'PSPD', 'Skor', 'Status'], ss.slice(0, 10).map(x => '<tr><td><button class="lnk" data-a="stu" data-id="' + x.s.id + '">' + esc(x.s.nama) + '</button></td><td>' + n1(x.t.mini) + '</td><td>' + n0(x.t.total ? x.t.valid / x.t.total * 100 : 0) + '%</td><td>' + n1(x.t.epaAvg) + '</td><td>' + n1(x.t.pspd) + '</td><td><b>' + n0(x.t.health) + '</b></td><td>' + riskPill(x.t.risk) + '</td></tr>')) + '<p class="hint">Skor = Mini-CEX 35 persen, laju kasus tervalidasi 25 persen, EPA 20 persen, nilai PSPD 20 persen. Di bawah 58 berisiko, 58 sampai 67 perlu perhatian. Skor adalah penanda awal, bukan penilaian.</p>', '<span class="hint">10 terendah</span>') +
    card('Catatan peringatan dini', notes.length ? notes.map(n => '<article class="ewn"><div class="fbi-h">' + pill(n.kat, 'muted') + pill(EWS_STAT[n.stat][0], EWS_STAT[n.stat][1]) + '<span>' + dfmt(n.tgl) + ' &middot; dilaporkan ' + esc(pname(n.oleh)) + '</span></div><b>' + esc(sName(n.sid)) + '</b><p>' + esc(n.txt) + '</p>' + n.rek.map(r => '<div class="rek"><b>' + esc(r.jenis) + '</b><span>' + esc(r.txt) + ' Target ' + dfmt(r.target) + '</span></div>').join('') + '<div class="row">' + (n.stat !== 'selesai' ? '<button class="btn sm" data-a="ews-rek" data-id="' + n.id + '">Tambah rekomendasi</button><button class="btn sm" data-a="ews-done" data-id="' + n.id + '">Tandai selesai</button>' : '') + '<button class="btn sm" data-a="stu" data-id="' + n.sid + '">Portofolio</button></div></article>').join('') : empty('Belum ada catatan')) + '</div>';
};
function ewsForm(sid) {
  openModal('Catat peringatan dini', '<form data-form="ews" class="form-grid">' + field('ew-s', 'Mahasiswa', selectEl('ew-s', STU_OPTS(), sid || firstSid()), '', 'span2') + field('ew-k', 'Kategori', selectEl('ew-k', ['Akademik', 'Profesionalisme', 'Kesejahteraan', 'Kehadiran', 'Lainnya'], 'Akademik'), '', 'span2') + field('ew-t', 'Catatan', textarea('ew-t', '', { rows: 4, req: true, ph: 'Tuliskan pengamatan yang faktual dan spesifik, tanpa menyimpulkan penyebab.' }), 'Catatan sensitif. Hanya Kaprodi yang dapat melihatnya.', 'span2') + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Simpan catatan</button></div></form>');
}
function ewsRekForm(id) {
  openModal('Rekomendasi tindak lanjut', '<form data-form="ewsrek" data-id="' + id + '" class="form-grid">' + field('er-j', 'Jenis tindak lanjut', selectEl('er-j', ['Pembinaan akademik', 'Pembinaan profesionalisme', 'Dukungan kesejahteraan', 'Remedial terstruktur', 'Rujuk layanan konseling kampus'], 'Pembinaan akademik'), '', 'span2') + field('er-t', 'Rencana', textarea('er-t', '', { rows: 3, req: true }), '', 'span2') + field('er-d', 'Target tanggal', input('er-d', iso(addD(T0, 14)), { type: 'date', req: true })) + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Simpan</button></div></form>');
}
PAGES['k-wah'] = () => {
  const ws = S.wahana.map(w => {
    const cs = S.cases.filter(c => c.wah === w.id && c.jenis === 'Kasus' && c.stat === 'valid');
    return { w, n: cs.length, mhs: new Set(cs.map(c => c.sid)).size, f: cs.filter(c => c.kat === 'FKTP').length, r: cs.filter(c => c.kat === 'FKRTL').length, dx: new Set(cs.map(c => c.dx)).size, sis: new Set(cs.map(c => c.sis)).size, cs };
  });
  const maxC = Math.max.apply(null, [1].concat([].concat.apply([], ws.map(x => SISTEM.map(s => x.cs.filter(c => c.sis === s).length)))));
  const tg = S.stases.map(s => {
    const vals = S.students.filter(st => { const it = sched(st).find(x => x.id === s.id); return it && it.start <= T0; }).map(st => { const n = casesOf(st.id).filter(c => c.st === s.id && c.jenis === 'Kasus' && c.stat === 'valid').length; return Math.min(100, n / Math.max(1, s.tf + s.tr) * 100); });
    return { s, n: vals.length, p: vals.length ? mean(vals) : null };
  });
  return pageHead('Wahana dan variasi kasus', 'Paparan kasus per tempat pendidikan, supaya prodi tahu wahana mana yang perlu diperkaya. Rumah sakit pendidikan utama: ' + esc(RSPU) + '.') +
    card('Ringkasan per wahana', table(['Wahana', 'Jenis', 'Mahasiswa', 'Kasus tervalidasi', 'FKTP', 'FKRTL', 'Diagnosis berbeda', 'Sistem organ (dari 13)'], ws.map(x => '<tr><td><b>' + esc(x.w.nama) + '</b></td><td>' + pill(x.w.jenis, x.w.jenis === 'FKTP' ? 'info' : 'muted') + '</td><td>' + x.mhs + '</td><td>' + x.n + '</td><td>' + x.f + '</td><td>' + x.r + '</td><td>' + x.dx + '</td><td>' + x.sis + bar(x.sis / 13 * 100, x.sis >= 10 ? 'good' : x.sis >= 6 ? '' : 'warn') + '</td></tr>'))) +
    '<div class="mt">' + card('Peta panas sistem organ per wahana', '<div class="tbl-wrap"><table class="mosaic heatm"><thead><tr><th>Sistem organ</th>' + ws.map(x => '<th>' + esc(x.w.id === 'w0' ? 'RSPU' : x.w.nama.replace('FKTP Jejaring ', 'FKTP ')) + '</th>').join('') + '</tr></thead><tbody>' + SISTEM.map(s => '<tr><th scope="row">' + esc(s) + '</th>' + ws.map(x => { const n = x.cs.filter(c => c.sis === s).length; return '<td><span class="mz" style="' + heat(n, maxC) + '">' + n + '</span></td>'; }).join('') + '</tr>').join('') + '</tbody></table></div>') + '</div>' +
    '<div class="mt">' + card('Capaian target kasus per stase', table(['Stase', 'Mahasiswa yang sudah rotasi', 'Rata-rata capaian target', ''], tg.map(x => '<tr><td><b>' + esc(x.s.nama) + '</b></td><td>' + x.n + '</td><td class="tgc">' + (x.p == null ? '-' : n0(x.p) + '%' + bar(x.p, toneOf(x.p))) + '</td><td>' + (x.p != null && x.p < 60 ? pill('Perlu diperkaya', 'warn') : '') + '</td></tr>'))) + '</div>';
};
PAGES['k-osce'] = () => {
  const o = S.osce.slice().sort((a, b) => a.tgl.localeCompare(b.tgl));
  return pageHead('Rekap OSCE', 'Hasil OSCE akhir stase: peserta, jumlah station, rerata nilai, dan persentase kelulusan.', '<button class="btn" data-a="osce-copy">' + ic('copy', 16) + 'Salin CSV</button>') +
    '<div class="g2">' + card('Tren OSCE', o.length ? lineChart([{ name: 'Rerata nilai', vals: o.map(x => x.avg) }, { name: 'Persentase lulus', vals: o.map(x => x.pass) }], o.map(x => stase(x.st).pendek), { min: 50, max: 100, label: 'Tren OSCE' }) : empty('Belum ada rekap')) +
    card('Ringkasan', '<div class="g2 tight">' + kpi('Sesi OSCE', '<b>' + o.length + '</b>') + kpi('Rerata nilai', '<b>' + n1(mean(o.map(x => x.avg))) + '</b>') + kpi('Rerata kelulusan', '<b>' + n0(mean(o.map(x => x.pass))) + '%</b>') + kpi('Total peserta', '<b>' + o.reduce((t, x) => t + x.peserta, 0) + '</b>') + '</div>') + '</div>' +
    '<div class="mt">' + table(['Sesi', 'Tanggal', 'Peserta', 'Station', 'Rerata nilai', 'Lulus'], o.slice().reverse().map(x => '<tr><td><b>' + esc(x.nama) + '</b></td><td class="nw">' + dfmt(x.tgl) + '</td><td>' + x.peserta + '</td><td>' + x.station + '</td><td>' + n1(x.avg) + '</td><td>' + n0(x.pass) + '%' + bar(x.pass, toneOf(x.pass)) + '</td></tr>')) + '</div>';
};
function presStats() {
  return presList().map(p => {
    const cs = S.cases.filter(c => c.pid === p.id); const fb = cs.map(feedbackHours).filter(h => h != null);
    const back = cs.filter(c => c.stat === 'menunggu' && ageD(c.tgl) > 7).length; const r = RNG(p.id.split('').reduce((t, ch) => t + ch.charCodeAt(0) * 31, 7));
    const att = SERVER ? null : Math.round(72 + r() * 26);
    return { p, n: cs.length, mhs: new Set(cs.map(c => c.sid)).size, h: fb.length ? mean(fb) : null, back, att, asm: S.asms.filter(a => a.pid === p.id && a.stat === 'dinilai').length };
  });
}
PAGES['k-pre'] = () => {
  const ps = presStats();
  return pageHead('Kinerja preseptor', 'Pemantauan keterlibatan preseptor dalam membimbing, memverifikasi logbook, dan memberi umpan balik. Ambang: kehadiran 80 persen, umpan balik 72 jam, antrean tidak lebih dari 7 hari.') +
    table(['Preseptor', 'Mahasiswa', 'Entri dibimbing', 'Asesmen dinilai', 'Waktu umpan balik', 'Antrean >7 hari', 'Kehadiran bimbingan', 'Catatan'], ps.map(x => { const fl = []; if (x.att != null && x.att < 80) fl.push('Kehadiran'); if (x.h != null && x.h > 72) fl.push('Umpan balik'); if (x.back > 0) fl.push('Antrean'); return '<tr><td><b>' + esc(x.p.nama) + '</b></td><td>' + x.mhs + '</td><td>' + x.n + '</td><td>' + x.asm + '</td><td>' + (x.h == null ? '-' : n0(x.h) + ' jam') + '</td><td>' + x.back + '</td><td class="tgc">' + (x.att == null ? '-' : x.att + '%' + bar(x.att, x.att >= 80 ? 'good' : 'warn')) + '</td><td>' + (fl.length ? fl.map(f => pill(f, 'warn')).join(' ') : pill('Sesuai ambang', 'good')) + '</td></tr>'; })) +
    '<p class="hint mt">' + (SERVER ? 'Kehadiran bimbingan belum terhubung ke presensi kegiatan klinis, sehingga belum ditampilkan.' : 'Kehadiran bimbingan pada mode demonstrasi berupa data contoh.') + '</p>';
};
