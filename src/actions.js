/* ================= AKSI, FORM, BOOT ================= */
const CH = {}, FORMS = {};
const F = (f, n) => f.elements[n] ? f.elements[n].value : '';
const nowHM = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
function addStudent(nama, nim, g, angk, mulai) {
  const n = S.students.length + 1; const id = 's' + (S.seq++);
  S.students.push({ id, nama, nim: nim || ('PD25' + String(n).padStart(3, '0')), g: g == null ? S.students.length % 4 : g, mu: 6, rate: 2, angk: angk || '2025', mulai: mulai || '', off: 238 });
  S.epa[id] = EPAS.map(() => 1); return id;
}
function doLogin(u) {
  if (!u.roles.length) { UI.msg = 'Peran Anda belum ditetapkan oleh admin program studi.'; UI.msgTone = 'bad'; return render(); }
  S.session = { uid: u.id, role: u.roles[0] }; save(); UI.msg = ''; UI.route = NAV[u.roles[0]][0][0]; UI.params = {}; UI.navOpen = false; window.scrollTo(0, 0); render();
}
const done = (msg, tone) => { save(); closeModal(); render(); if (msg) toast(msg, tone || 'good'); };

/* ---------- Navigasi dan umum ---------- */
A.go = el => { UI.msg = ''; go(el.dataset.p === 'landing' ? 'login' : el.dataset.p); };
A.nav = el => go(el.dataset.p);
A.back = () => go(UI.back || 'v-dir');
A.stu = el => { UI.back = UI.route; go('v-student', { sid: el.dataset.id }); };
A.theme = () => { const r = document.documentElement; const cur = r.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); const nx = cur === 'dark' ? 'light' : 'dark'; r.setAttribute('data-theme', nx); try { localStorage.setItem('elogbook-theme', nx); } catch (e) { } };
A.navopen = () => { UI.navOpen = true; render(); };
A.navclose = () => { UI.navOpen = false; render(); };
A.logout = () => { if (SERVER) return serverLogout(); S.session = null; save(); UI.route = 'login'; UI.params = {}; UI.navOpen = false; render(); };
A.role = el => { S.session.role = el.dataset.r; if (!SERVER) save(); UI.route = NAV[el.dataset.r][0][0]; UI.params = {}; UI.navOpen = false; window.scrollTo(0, 0); render(); };
A.tab = el => { UI.tab[el.dataset.k] = el.dataset.v; render(); };
A.tabgo = el => { UI.tab[el.dataset.k] = el.dataset.v; go(el.dataset.p); };
A.mclose = () => closeModal();
A.mbg = (el, ev) => { if (ev.target === el) closeModal(); };
A.copy = el => copyText(el.dataset.t, 'Tersalin');
A.demo = el => { const u = S.users.find(x => x.email === el.dataset.e); if (u) doLogin(u); };
A.reload = () => reload();
A.reset = () => { if (SERVER) return; try { localStorage.removeItem(LS_KEY); } catch (e) { } seedState(); S.bgData = {}; S.session = null; save(); UI.route = 'login'; UI.params = {}; UI.fl = {}; UI.tab = {}; UI.imp = null; closeModal(); render(); toast('Data demo diatur ulang'); };
A.pw = () => pwForm(false);

FORMS.login = f => {
  const k = F(f, 'lg-email').trim().toLowerCase(), pw = F(f, 'lg-pw');
  if (SERVER) return serverLogin(k, pw);
  const u = S.users.find(x => x.email.toLowerCase() === k || x.email.toLowerCase().split('@')[0] === k);
  if (!u || u.pw !== pw) { UI.msg = 'Email atau kata sandi tidak cocok.'; UI.msgTone = 'bad'; return render(); }
  doLogin(u);
};
FORMS.register = async f => {
  const email = F(f, 'rg-email').trim().toLowerCase(), nama = F(f, 'rg-nama').trim(), unit = F(f, 'rg-unit').trim(), harap = F(f, 'rg-harap'), pw = F(f, 'rg-pw');
  if (pw.length < 8) { UI.msg = ERR.weak; UI.msgTone = 'bad'; return render(); }
  if (SERVER) {
    const r = await api('register', { nama, email, unit, harap, pw });
    if (!r || !r.ok) { UI.msg = errText(r); UI.msgTone = 'bad'; return render(); }
    UI.msg = 'Pendaftaran terkirim. Admin program studi akan menetapkan peran Anda, lalu Anda dapat masuk.'; UI.msgTone = 'good'; return render();
  }
  if (S.users.some(u => u.email.toLowerCase() === email) || S.regs.some(r => r.email.toLowerCase() === email)) { UI.msg = ERR.exists; UI.msgTone = 'bad'; return render(); }
  S.regs.push({ id: genId('r'), nama, email, unit, harap, pw, tgl: iso(T0) });
  save(); UI.msg = 'Pendaftaran terkirim. Admin program studi akan menetapkan peran Anda, lalu Anda dapat masuk.'; UI.msgTone = 'good'; render();
};

/* ---------- Kata sandi ---------- */
function pwForm(force) {
  openModal(force ? 'Buat kata sandi baru' : 'Ganti kata sandi', (force ? '<div class="alert warn">Kata sandi Anda masih sementara. Buat kata sandi baru sebelum melanjutkan.</div>' : '') +
    '<form data-form="pw" class="form-grid">' + field('pw-old', 'Kata sandi saat ini', input('pw-old', '', { type: 'password', req: true, extra: 'autocomplete="current-password"' }), '', 'span2') + field('pw-new', 'Kata sandi baru', input('pw-new', '', { type: 'password', req: true, extra: 'minlength="8" autocomplete="new-password"' }), 'Minimal 8 karakter dan berbeda dari yang lama.', 'span2') + field('pw-new2', 'Ulangi kata sandi baru', input('pw-new2', '', { type: 'password', req: true, extra: 'autocomplete="new-password"' }), '', 'span2') +
    '<div class="form-act span2">' + (force ? '<button type="button" class="btn" data-a="logout">Keluar</button>' : '<button type="button" class="btn" data-a="mclose">Batal</button>') + '<button class="btn primary" type="submit">Simpan</button></div></form>', { lock: !!force });
}
FORMS.pw = async f => {
  const o = F(f, 'pw-old'), n = F(f, 'pw-new'), n2 = F(f, 'pw-new2');
  if (n.length < 8) { toast(ERR.weak, 'bad'); return; }
  if (n !== n2) { toast('Pengulangan kata sandi tidak sama', 'bad'); return; }
  if (n === o) { toast('Kata sandi baru harus berbeda dari yang lama', 'bad'); return; }
  if (SERVER) {
    const r = await api('chpw', { old: o, nw: n });
    if (!r || !r.ok) { toast(errText(r), 'bad'); return; }
    setToken(r.token); if (S.me) S.me.must = false; closeModal(true); render(); toast('Kata sandi diperbarui'); return;
  }
  const u = me(); if (u.pw !== o) { toast('Kata sandi saat ini tidak cocok', 'bad'); return; }
  u.pw = n; save(); closeModal(true); toast('Kata sandi diperbarui');
};

/* ---------- Mahasiswa ---------- */
A['case-new'] = () => caseForm();
A['case-edit'] = el => caseForm(el.dataset.id);
A['case-open'] = el => caseDetail(el.dataset.id);
A['case-submit'] = el => { const c = S.cases.find(x => x.id === el.dataset.id); if (!c) return; c.stat = c.jenis === 'Kasus' ? 'menunggu' : 'valid'; done(c.jenis === 'Kasus' ? 'Diajukan ke ' + pname(c.pid) : 'Entri tersimpan'); };
A['case-del'] = el => { S.cases = S.cases.filter(x => x.id !== el.dataset.id); done('Draf dihapus'); };
A['consent-sim'] = el => { const c = S.cases.find(x => x.id === el.dataset.id); if (c) { c.cons = true; save(); caseDetail(c.id); render(); toast('Persetujuan pasien tercatat'); } };
A['asm-new'] = () => asmForm();
A.logstat = el => { const f = logFilters(); f.stat = el.dataset.v; f.page = 1; render(); };
A.logpage = el => { const f = logFilters(); f.page += parseInt(el.dataset.v, 10); render(); };
A['log-csv'] = () => {
  const rows = [['Tanggal', 'Jenis', 'Stase', 'Tempat', 'Diagnosis atau kegiatan', 'Kategori', 'Sistem organ', 'Keterlibatan', 'Status', 'Preseptor']].concat(logRows(curSid()).map(c => [c.tgl, c.jenis, stase(c.st).nama, wahanaOf(c.wah).nama, c.dx, c.kat, c.sis, c.ter, STAT[c.stat][0], pname(c.pid)]));
  copyText(toCSV(rows), 'Rekap CSV disalin');
};
A['reply-save'] = el => { const t = document.getElementById(el.dataset.t); S.replies[el.dataset.k] = t ? t.value : ''; save(); toast('Rencana tindak lanjut tersimpan'); };
A['port-copy'] = () => { const sid = curSid(), s = stats(sid), st = studentById(sid); copyText('Ringkasan portofolio ' + st.nama + ' (' + st.nim + ')\nKasus: ' + s.total + ' (' + s.valid + ' divalidasi)\nMini-CEX rata-rata: ' + n1(s.mini) + ' dari 9\nEPA rata-rata: ' + n1(s.epaAvg) + ' dari 5\nNilai PSPD: ' + n1(s.pspd) + '\nNilai PSSK: ' + n1(s.pssk), 'Ringkasan disalin'); };

FORMS.case = (f, sub) => {
  const id = f.dataset.id; const jenis = F(f, 'cf-jenis'); const s = sub && sub.dataset.submit;
  const isNew = !id; const c = isNew ? { id: genId('c'), sid: curSid(), stat: 'draf', fb: '', fbTgl: '', cons: false, tok: rndTok(), ini: '', rm: '' } : S.cases.find(x => x.id === id);
  if (!c) return closeModal();
  const ini = F(f, 'cf-ini').trim(), rm = F(f, 'cf-rm').trim();
  if (jenis === 'Kasus' && isNew && (!ini || !rm)) { toast('Isi inisial pasien dan nomor rekam medis', 'bad'); return; }
  Object.assign(c, { tgl: F(f, 'cf-tgl'), jenis, st: F(f, 'cf-st'), wah: F(f, 'cf-wah'), dx: F(f, 'cf-dx').trim(), pid: F(f, 'cf-pid'), sum: F(f, 'cf-sum'), ref: F(f, 'cf-ref') });
  if (jenis === 'Kasus') { Object.assign(c, { kat: F(f, 'cf-kat'), sis: F(f, 'cf-sis'), usia: F(f, 'cf-usia'), jk: F(f, 'cf-jk'), ter: F(f, 'cf-ter') }); if (ini) c.ini = ini; if (rm) c.rm = rm; } else { c.kat = ''; c.sis = ''; }
  c.stat = s === 'ajukan' ? (jenis === 'Kasus' ? 'menunggu' : 'valid') : 'draf';
  if (isNew) S.cases.push(c);
  done(s === 'ajukan' ? (jenis === 'Kasus' ? 'Entri diajukan untuk divalidasi' : 'Entri tersimpan') : 'Draf tersimpan');
};
FORMS.asm = f => {
  const j = F(f, 'as-j'), jd = F(f, 'as-jd');
  S.asms.push({ id: genId('a'), sid: curSid(), jenis: j, judul: j + ': ' + jd, tgl: F(f, 'as-tgl'), st: F(f, 'as-st'), pid: F(f, 'as-pid'), stat: 'menunggu', sk: null, kek: '', perlu: '', renc: '' });
  done('Permintaan penilaian dikirim');
};
CH['case-jenis'] = toggleKasus;
CH['case-stase'] = el => { const dl = document.getElementById('cf-dxl'); if (dl) dl.innerHTML = (DX[el.value] || []).map(d => '<option value="' + esc(d[0]) + '">').join(''); };
CH['case-dx'] = el => { const st = document.getElementById('cf-st'); const m = st && (DX[st.value] || []).find(d => d[0] === el.value); if (m) { const k = document.getElementById('cf-kat'), s = document.getElementById('cf-sis'); if (k) k.value = m[1]; if (s) s.value = m[2]; } };
CH['asm-j'] = () => {
  const j = document.getElementById('as-j').value, st = document.getElementById('as-st').value, sel = document.getElementById('as-jd');
  const opts = j === 'DOPS' ? PROSEDUR : (DX[st] || []).map(d => d[0]);
  sel.innerHTML = opts.map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('');
};

/* ---------- Break Glass ---------- */
A['bg-open'] = el => {
  const id = el.dataset.id;
  openModal('Break Glass: buka identitas pasien', '<div class="alert warn">Gunakan hanya untuk keadaan mendesak. Akses berlaku 15 menit dan dicatat dengan nama, waktu, dan alasan Anda.</div><form data-form="bg" data-id="' + id + '">' + field('bg-r', 'Alasan akses (minimal 15 karakter)', textarea('bg-r', '', { rows: 3, req: true, ph: 'Contoh: identitas diperlukan untuk konfirmasi alergi obat sebelum tindakan.' })) + '<div class="form-act"><button type="button" class="btn" data-a="case-open" data-id="' + id + '">Batal</button><button class="btn danger" type="submit">Buka identitas selama 15 menit</button></div></form>');
};
FORMS.bg = async f => {
  const id = f.dataset.id, r = F(f, 'bg-r').trim();
  if (r.length < 15) { toast('Alasan terlalu singkat', 'bad'); return; }
  if (SERVER) {
    const x = await api('bg', { cid: id, alasan: r });
    if (!x || !x.ok) { toast(errText(x), 'bad'); return; }
    S.bg[id] = { uid: S.session.uid, until: x.until }; S.bgData[id] = { ini: x.ini, rm: x.rm };
    S.audit.push({ id: genId('b'), ts: iso(T0) + ' ' + nowHM(), uid: S.session.uid, cid: id, alasan: r, menit: 15, status: 'Aktif', until: x.until });
  } else {
    S.bg[id] = { uid: S.session.uid, until: Date.now() + 15 * 60000 };
    S.audit.push({ id: genId('b'), ts: iso(T0) + ' ' + nowHM(), uid: S.session.uid, cid: id, alasan: r, menit: 15, status: 'Aktif' });
    save();
  }
  caseDetail(id); render(); toast('Break Glass aktif selama 15 menit', 'warn');
};
A['bg-end'] = async el => {
  const id = el.dataset.id;
  if (SERVER) { const x = await api('bgEnd', { cid: id }); if (!x || !x.ok) { toast(errText(x), 'bad'); return; } }
  delete S.bg[id]; delete S.bgData[id]; S.audit.forEach(a => { if (a.cid === id && a.status === 'Aktif') a.status = 'Selesai'; }); if (!SERVER) save(); render(); toast('Sesi Break Glass diakhiri');
};

/* ---------- Dosen dan preseptor ---------- */
A.grade = el => gradeForm(el.dataset.id);
FORMS.grade = f => {
  const a = S.asms.find(x => x.id === f.dataset.id); if (!a) return closeModal();
  const n = a.jenis === 'DOPS' ? DP_DOM.length : MC_DOM.length; a.sk = []; for (let i = 0; i < n; i++) a.sk.push(clamp(parseInt(F(f, 'g' + i), 10) || 6, 1, 9));
  a.kek = F(f, 'g-kek').trim(); a.perlu = F(f, 'g-perlu').trim(); a.renc = F(f, 'g-renc').trim(); a.stat = 'dinilai';
  done('Penilaian tersimpan, rata-rata ' + n1(mean(a.sk)));
};
A['epa-new'] = el => epaForm(el.dataset.id);
FORMS.epa = f => {
  const sid = F(f, 'ep-s'), e = parseInt(F(f, 'ep-e'), 10), l = parseInt(F(f, 'ep-l'), 10);
  if (!S.epa[sid]) S.epa[sid] = EPAS.map(() => 1);
  S.epa[sid][e] = l; S.epaLog.push({ id: genId('e'), sid, epa: e, level: l, tgl: iso(T0), pid: S.session.uid, cm: F(f, 'ep-c').trim() });
  done('Level ' + l + ' ditetapkan untuk ' + EPAS[e][0]);
};
A['score-new'] = () => scoreForm();
FORMS.score = f => {
  const sid = F(f, 'sc-s'), unit = F(f, 'sc-u'), komp = F(f, 'sc-k'), v = parseFloat(F(f, 'sc-v'));
  if (isNaN(v) || v < 0 || v > 100) { toast('Nilai harus 0 sampai 100', 'bad'); return; }
  const ex = S.nilai.find(n => n.sid === sid && n.tahap === 'PSPD' && n.unit === unit && n.komp === komp);
  if (ex) { ex.v = v; ex.tgl = iso(T0); ex.oleh = S.session.uid; } else S.nilai.push({ sid, tahap: 'PSPD', unit, komp, v, tgl: iso(T0), oleh: S.session.uid });
  done('Nilai ' + komp + ' tersimpan');
};
FORMS.validate = (f, sub) => {
  const c = S.cases.find(x => x.id === f.dataset.id); const how = sub && sub.dataset.submit; const cm = F(f, 'vl-cm').trim();
  if (!c) return closeModal();
  if (how === 'kembali' && !cm) { toast('Tuliskan umpan balik agar mahasiswa tahu apa yang perlu diperbaiki', 'bad'); return; }
  c.stat = how === 'kembali' ? 'kembali' : 'valid'; c.fb = cm; c.fbTgl = iso(T0);
  done(how === 'kembali' ? 'Entri dikembalikan ke mahasiswa' : 'Kasus divalidasi');
};
A['val-bulk'] = () => {
  const f = UI.fl.val || { scope: 'mine' }; const base = f.scope === 'all' ? S.cases : mineCases(); let n = 0;
  base.forEach(c => { if (c.stat === 'menunggu' && c.jenis === 'Kasus' && c.cons) { c.stat = 'valid'; c.fbTgl = iso(T0); n++; } });
  done(n + ' entri divalidasi');
};

/* ---------- Kaprodi ---------- */
A['ews-new'] = el => ewsForm(el.dataset.id);
FORMS.ews = f => { S.ews.push({ id: genId('w'), sid: F(f, 'ew-s'), kat: F(f, 'ew-k'), oleh: S.session.uid, tgl: iso(T0), txt: F(f, 'ew-t').trim(), stat: 'antrean', rek: [] }); done('Catatan peringatan dini tersimpan'); };
A['ews-rek'] = el => ewsRekForm(el.dataset.id);
FORMS.ewsrek = f => { const n = S.ews.find(x => x.id === f.dataset.id); if (!n) return closeModal(); n.rek.push({ jenis: F(f, 'er-j'), txt: F(f, 'er-t').trim(), target: F(f, 'er-d'), tgl: iso(T0) }); n.stat = 'dilaporkan'; done('Rekomendasi tersimpan'); };
A['ews-done'] = el => { const n = S.ews.find(x => x.id === el.dataset.id); if (n) { n.stat = 'selesai'; save(); render(); toast('Catatan ditandai selesai'); } };
A['cohort-copy'] = () => {
  const rows = [['Nama', 'NIM', 'Kelompok', 'Stase berjalan', 'Kasus', 'Validasi persen', 'Mini-CEX', 'EPA rata-rata', 'Nilai PSPD', 'Skor kesehatan', 'Status']].concat(S.students.map(s => { const t = stats(s.id); return [s.nama, s.nim, 'ABCD'[s.g % 4], t.curS.pendek, t.total, n0(t.total ? t.valid / t.total * 100 : 0), n1(t.mini), n1(t.epaAvg), n1(t.pspd), n0(t.health), t.risk]; }));
  copyText(toCSV(rows), 'Ringkasan kohort disalin');
};
A['osce-copy'] = () => copyText(toCSV([['Sesi', 'Tanggal', 'Peserta', 'Station', 'Rerata nilai', 'Lulus persen']].concat(S.osce.map(o => [o.nama, o.tgl, o.peserta, o.station, n1(o.avg), n0(o.pass)]))), 'Rekap OSCE disalin');

/* ---------- Admin ---------- */
A['period-new'] = () => periodForm();
FORMS.period = f => { S.periods.unshift({ id: genId('pa'), nama: F(f, 'pe-n').trim(), mulai: F(f, 'pe-a'), selesai: F(f, 'pe-b'), aktif: false }); done('Periode ditambahkan'); };
A['period-act'] = el => { S.periods.forEach(p => { p.aktif = p.id === el.dataset.id; }); save(); render(); toast('Periode aktif diperbarui'); };
/* ---------- Pengguna: kelola, impor, pendaftar ---------- */
const checked = f => Array.prototype.slice.call(f.querySelectorAll('input[name=role]:checked')).map(x => x.value);
const kelFrom = v => { v = String(v == null ? '' : v).trim().toUpperCase(); const i = 'ABCD'.indexOf(v); if (v.length === 1 && i >= 0) return i; const n = parseInt(v, 10); return n >= 1 && n <= 4 ? n - 1 : (n === 0 ? 0 : 0); };
const stuFields = (st, pre) => '<div class="mhs-only span2 form-grid inner">' + field('uf-nim', 'NIM', input('uf-nim', st ? st.nim : pre || '')) + field('uf-g', 'Kelompok rotasi', selectEl('uf-g', [0, 1, 2, 3].map(i => [i, 'Kelompok ' + 'ABCD'[i]]), st ? st.g % 4 : 0)) + field('uf-angk', 'Angkatan', input('uf-angk', st ? st.angk : String(T0.getFullYear()))) + field('uf-mulai', 'Mulai rotasi stase pertama', input('uf-mulai', st && st.mulai ? st.mulai : '', { type: 'date' }), 'Dasar penyusunan jadwal rotasi. Kosong berarti hari ini.') + '</div>';
function toggleMhs() { const f = document.querySelector('form[data-form=user],form[data-form=regok]'); if (!f) return; const on = checked(f).indexOf('mahasiswa') >= 0; const m = f.querySelector('.mhs-only'); if (m) m.hidden = !on; }
CH['user-role'] = toggleMhs;
const roleBoxes = sel => '<div class="checks">' + ROLES_ALL.map(r => '<label class="chk"><input type="checkbox" name="role" value="' + r + '" data-ch="user-role"' + ((sel || []).indexOf(r) >= 0 ? ' checked' : '') + '><span>' + ROLE_LABEL[r] + '</span></label>').join('') + '</div>';
function userForm(id) {
  const u = id ? userById(id) : null; const st = u && u.sid ? studentById(u.sid) : null;
  openModal(u ? 'Ubah pengguna' : 'Tambah pengguna', '<form data-form="user" data-id="' + (u ? u.id : '') + '" class="form-grid">' + field('uf-nama', 'Nama lengkap', input('uf-nama', u ? u.nama : '', { req: true }), '', 'span2') +
    field('uf-email', 'Email', input('uf-email', u ? u.email : '', { type: 'email', req: true, extra: u ? 'readonly' : 'autocomplete="off"' }), u ? 'Email tidak dapat diubah.' : 'Dipakai untuk masuk.', 'span2') + field('uf-unit', 'Unit atau jabatan', input('uf-unit', u ? u.unit : ''), '', 'span2') +
    '<div class="field span2"><label>Peran</label>' + roleBoxes(u ? u.roles : []) + '<div class="hint">Satu pengguna boleh memegang beberapa peran dan berganti peran dari bilah atas.</div></div>' + stuFields(st) +
    (u ? '<label class="chk span2"><input type="checkbox" name="aktif"' + (u.aktif !== false ? ' checked' : '') + '><span>Akun aktif (hapus centang untuk menutup akses)</span></label>' : '') +
    '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">' + (u ? 'Simpan' : 'Buat akun') + '</button></div></form>', { wide: true });
  toggleMhs();
}
A['user-new'] = () => userForm('');
A['user-edit'] = el => userForm(el.dataset.id);
function showCreds(rows, title, skipped) {
  const csv = toCSV([['Nama', 'Email', 'Sandi sementara']].concat(rows.map(r => [r.nama, r.email, r.pw])));
  openModal(title || 'Sandi sementara', '<div class="alert warn">Sandi hanya ditampilkan sekali ini. Salin lalu sampaikan kepada pengguna lewat saluran yang aman. Pengguna diminta menggantinya saat masuk pertama kali.</div>' +
    (rows.length ? table(['Nama', 'Email', 'Sandi sementara'], rows.map(r => '<tr><td>' + esc(r.nama) + '</td><td class="mono">' + esc(r.email) + '</td><td class="mono"><b>' + esc(r.pw) + '</b></td></tr>')) : '') +
    (skipped && skipped.length ? '<p class="hint mt">' + skipped.length + ' baris dilewati: ' + skipped.slice(0, 8).map(x => esc((x.email || 'baris ' + x.i) + ' (' + x.err + ')')).join('; ') + (skipped.length > 8 ? '; dan lainnya' : '') + '</p>' : '') +
    '<div class="form-act"><button class="btn" data-a="mclose">Tutup</button>' + (rows.length ? '<button class="btn primary" data-a="copy" data-t="' + esc(csv) + '">' + ic('copy', 14) + 'Salin sebagai CSV</button>' : '') + '</div>', { wide: rows.length > 1 });
}
const Admin = {
  async call(op, data) { const r = await api('admin', Object.assign({ op }, data)); if (!r || !r.ok) { toast(errText(r), 'bad'); return null; } return r; },
  local: {
    create(d, pw, hash) {
      if (!d.nama || !/^\S+@\S+$/.test(d.email) || S.users.some(u => u.email.toLowerCase() === d.email)) return null;
      const u = { id: genId('u'), nama: d.nama, email: d.email, roles: d.roles, pw, unit: d.unit || '', sid: null, demo: false, aktif: true };
      if (d.roles.indexOf('mahasiswa') >= 0) u.sid = addStudent(d.nama, d.nim, d.g, d.angk, d.mulai);
      S.users.push(u); return u;
    }
  },
  async userSave(id, d) {
    if (SERVER) { const r = await Admin.call(id ? 'userUpdate' : 'userCreate', Object.assign({ id }, d)); if (!r) return null; await reload(true); return r; }
    if (!id) { const pw = tempPw(); const u = Admin.local.create(d, pw); if (!u) { toast('Nama atau email tidak valid, atau email sudah terdaftar', 'bad'); return null; } save(); return { ok: true, pw }; }
    const u = userById(id); if (!u) return null;
    if (u.id === S.session.uid && (d.aktif === false || d.roles.indexOf('admin') < 0)) { toast('Anda tidak dapat menonaktifkan akun sendiri atau melepas peran admin Anda', 'bad'); return null; }
    Object.assign(u, { nama: d.nama, roles: d.roles, unit: d.unit, aktif: d.aktif !== false });
    if (d.roles.indexOf('mahasiswa') >= 0) { if (!u.sid) u.sid = addStudent(d.nama, d.nim, d.g, d.angk, d.mulai); else { const st = studentById(u.sid); Object.assign(st, { nama: d.nama, g: d.g, angk: d.angk, mulai: d.mulai }); if (d.nim) st.nim = d.nim; } }
    save(); return { ok: true };
  },
  async userReset(id) {
    if (SERVER) return Admin.call('userReset', { id });
    const u = userById(id); if (!u) return null; u.pw = tempPw(); save(); return { ok: true, pw: u.pw };
  }
};
FORMS.user = async f => {
  const id = f.dataset.id; const d = { nama: F(f, 'uf-nama').trim(), email: F(f, 'uf-email').trim().toLowerCase(), unit: F(f, 'uf-unit').trim(), roles: checked(f), nim: F(f, 'uf-nim').trim(), g: parseInt(F(f, 'uf-g'), 10) || 0, angk: F(f, 'uf-angk').trim(), mulai: F(f, 'uf-mulai'), aktif: f.elements.aktif ? f.elements.aktif.checked : true };
  const r = await Admin.userSave(id, d); if (!r) return;
  closeModal(true); render();
  if (!id) showCreds([{ nama: d.nama, email: d.email, pw: r.pw }], 'Akun dibuat'); else toast('Perubahan tersimpan');
};
A['user-reset'] = el => {
  const u = userById(el.dataset.id); if (!u) return;
  openModal('Reset kata sandi', '<form data-form="userreset" data-id="' + u.id + '"><p>Buat sandi sementara baru untuk <b>' + esc(u.nama) + '</b> (' + esc(u.email) + ')? Semua sesi aktif pengguna ini akan berakhir dan pengguna diminta membuat sandi baru saat masuk.</p><div class="form-act"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Buat sandi sementara</button></div></form>');
};
FORMS.userreset = async f => {
  const u = userById(f.dataset.id); const r = await Admin.userReset(f.dataset.id); if (!r || !u) return;
  closeModal(true); showCreds([{ nama: u.nama, email: u.email, pw: r.pw }], 'Sandi sementara baru');
};
A['reg-open'] = el => {
  const r = S.regs.find(x => x.id === el.dataset.id); if (!r) return;
  openModal('Tetapkan peran ' + esc(r.nama), '<form data-form="regok" data-id="' + r.id + '" class="form-grid"><p class="sub span2">' + esc(r.email) + ' &middot; mengharapkan ' + esc(r.harap) + '</p><div class="field span2"><label>Peran</label>' + roleBoxes([String(r.harap).toLowerCase()]) + '</div>' + stuFields(null, r.unit) + '<div class="form-act span2"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn primary" type="submit">Setujui</button></div></form>', { wide: true });
  toggleMhs();
};
FORMS.regok = async f => {
  const r = S.regs.find(x => x.id === f.dataset.id); const rs = checked(f); if (!r) return closeModal();
  if (!rs.length) { toast('Pilih minimal satu peran', 'bad'); return; }
  const d = { roles: rs, nim: F(f, 'uf-nim').trim(), g: parseInt(F(f, 'uf-g'), 10) || 0, angk: F(f, 'uf-angk').trim(), mulai: F(f, 'uf-mulai') };
  if (SERVER) { const x = await Admin.call('regApprove', Object.assign({ id: r.id }, d)); if (!x) return; await reload(true); closeModal(true); render(); toast('Akun ' + r.nama + ' aktif'); return; }
  const u = { id: genId('u'), nama: r.nama, email: r.email, roles: rs, pw: r.pw, unit: r.unit || '', sid: null, demo: false, aktif: true };
  if (rs.indexOf('mahasiswa') >= 0) u.sid = addStudent(r.nama, d.nim || r.unit, d.g, d.angk, d.mulai);
  S.users.push(u); S.regs = S.regs.filter(x => x.id !== r.id); done('Akun ' + r.nama + ' aktif');
};
A['reg-no'] = async el => {
  if (SERVER) { const x = await Admin.call('regReject', { id: el.dataset.id }); if (!x) return; await reload(true); toast('Pendaftaran ditolak'); return; }
  S.regs = S.regs.filter(x => x.id !== el.dataset.id); save(); render(); toast('Pendaftaran ditolak');
};
A['user-tpl'] = () => copyText('nama,email,peran,nim,kelompok,mulai,angkatan\nDr. Contoh,contoh@umt.ac.id,dosen|preseptor,,,,\nBudi Santoso,budi@umt.ac.id,mahasiswa,PD25101,A,' + iso(T0) + ',' + T0.getFullYear(), 'Templat disalin');
FORMS.userimp = async f => {
  const txt = F(f, 'ui-t'); UI.userCsv = txt; let rows = parseCSV(txt); if (!rows.length) { toast('CSV kosong', 'bad'); return; }
  if (/nama/i.test(rows[0][0] || '')) rows = rows.slice(1);
  const recs = rows.map(r => ({ nama: (r[0] || '').trim(), email: (r[1] || '').trim().toLowerCase(), roles: (r[2] || '').split(/[|+]/).map(x => x.trim().toLowerCase()).filter(x => ROLES_ALL.indexOf(x) >= 0), nim: (r[3] || '').trim(), g: kelFrom(r[4]), mulai: /^\d{4}-\d{2}-\d{2}$/.test((r[5] || '').trim()) ? r[5].trim() : '', angk: (r[6] || '').trim() || String(T0.getFullYear()) }));
  let made = [], skip = [];
  if (SERVER) { const x = await Admin.call('userImport', { rows: recs }); if (!x) return; made = x.made; skip = x.skip; await reload(true); }
  else recs.forEach((d, i) => { const pw = tempPw(); const u = Admin.local.create(d, pw); if (u) made.push({ nama: d.nama, email: d.email, pw }); else skip.push({ i: i + 1, email: d.email, err: 'tidak valid atau sudah ada' }); });
  UI.userCsv = ''; if (!SERVER) save(); render(); showCreds(made, made.length + ' akun dibuat', skip);
};
A['ev-new'] = () => eventForm();
FORMS.event = f => { S.events.push({ id: genId('ev'), jenis: F(f, 'ev-j'), judul: F(f, 'ev-t').trim(), st: F(f, 'ev-s'), tgl: F(f, 'ev-d'), lokasi: F(f, 'ev-l').trim(), penguji: F(f, 'ev-p'), kuota: parseInt(F(f, 'ev-k'), 10) || 1, status: 'Dijadwalkan' }); done('Event dijadwalkan'); };
A['ev-st'] = el => { const e = S.events.find(x => x.id === el.dataset.id); if (e) { e.status = el.dataset.v; save(); render(); toast('Status event diperbarui'); } };
FORMS.stase = f => {
  S.stases.forEach(s => { s.minggu = clamp(parseInt(F(f, 'st-m-' + s.id), 10) || s.minggu, 1, 20); s.tf = Math.max(0, parseInt(F(f, 'st-f-' + s.id), 10) || 0); s.tr = Math.max(0, parseInt(F(f, 'st-r-' + s.id), 10) || 0); });
  save(); render(); toast('Kurikulum stase tersimpan');
};
FORMS.bobot = f => {
  const isS = f.dataset.t === 'stase'; const B = isS ? S.bobotStase : S.bobotBlok; const pre = isS ? 'bs-' : 'bb-'; const nb = {}; let sum = 0;
  Object.keys(B).forEach(k => { nb[k] = Math.max(0, parseFloat(F(f, pre + k)) || 0); sum += nb[k]; });
  if (Math.round(sum) !== 100) { toast('Total bobot harus 100, saat ini ' + Math.round(sum), 'bad'); return; }
  if (isS) S.bobotStase = nb; else S.bobotBlok = nb; save(); render(); toast('Bobot nilai tersimpan');
};
A['wah-new'] = () => wahForm();
FORMS.wahana = f => { S.wahana.push({ id: genId('w'), nama: F(f, 'wh-n').trim(), jenis: F(f, 'wh-j') }); done('Wahana ditambahkan'); };

/* impor hasil asesmen */
FORMS.impparse = f => {
  const txt = F(f, 'imp-text'); UI.impText = txt; const rows = parseCSV(txt);
  if (rows.length < 2) { toast('CSV perlu baris judul dan minimal satu baris data', 'bad'); return; }
  UI.imp = { head: rows[0], rows: rows.slice(1), map: impAutoMap(rows[0]) }; render();
};
CH['imp-map'] = el => { UI.imp.map[el.dataset.k] = parseInt(el.value, 10); render(); };
CH['imp-file'] = el => {
  const file = el.files && el.files[0]; if (!file) return; const rd = new FileReader();
  rd.onload = () => { const txt = String(rd.result || ''); UI.impText = txt; const rows = parseCSV(txt); if (rows.length < 2) { toast('Berkas tidak berisi data', 'bad'); render(); return; } UI.imp = { head: rows[0], rows: rows.slice(1), map: impAutoMap(rows[0]) }; render(); };
  rd.onerror = () => toast('Berkas tidak dapat dibaca', 'bad'); rd.readAsText(file);
};
A['imp-reset'] = () => { UI.imp = null; render(); };
A['imp-commit'] = () => {
  let ins = 0, upd = 0;
  impValidate().forEach(x => { if (!x.ok) return; const r = x.rec; const ex = S.nilai.find(n => n.sid === r.sid && n.tahap === r.tahap && n.unit === r.unit && n.komp === r.komp); if (ex) { Object.assign(ex, r); upd++; } else { S.nilai.push(r); ins++; } });
  UI.imp = null; UI.impText = ''; save(); render(); toast(ins + ' nilai baru, ' + upd + ' diperbarui');
};
A['imp-tpl'] = () => copyText('nim,tahap,stase,komponen,nilai,tanggal\nPD25001,PSPD,ipd,OSCE,78,2026-10-10\nPD25002,PSPD,anak,CBT,82,2026-09-20\nPD25003,PSSK,Blok Respirasi,CBT,74,2026-03-15', 'Templat CSV disalin');
A['audit-copy'] = () => copyText(toCSV([['Waktu', 'Pengguna', 'Entri', 'Alasan', 'Menit', 'Status']].concat(S.audit.map(a => { const c = S.cases.find(x => x.id === a.cid); return [a.ts, pname(a.uid), c ? c.dx : '-', a.alasan, a.menit, a.status]; }))), 'Catatan audit disalin');

/* ---------- Penghubung kejadian ---------- */
function setF(el) { const p = el.dataset.f.split('.'); if (!UI.fl[p[0]]) UI.fl[p[0]] = {}; UI.fl[p[0]][p[1]] = el.value; if (p[0] === 'log') UI.fl.log.page = 1; render(); }
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-a]'); if (!el) return; const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName === 'A') ev.preventDefault(); fn(el, ev);
});
document.addEventListener('submit', ev => { const f = ev.target.closest('form[data-form]'); if (!f) return; ev.preventDefault(); const fn = FORMS[f.dataset.form]; if (fn) fn(f, ev.submitter); });
document.addEventListener('change', ev => { const el = ev.target; if (el.dataset && el.dataset.ch && CH[el.dataset.ch]) CH[el.dataset.ch](el); if (el.dataset && el.dataset.f && el.tagName === 'SELECT') setF(el); });
document.addEventListener('input', ev => { const el = ev.target; if (!el.dataset) return; if (el.dataset.f && el.tagName !== 'SELECT') setF(el); else if (el.dataset.ch === 'case-dx') CH['case-dx'](el); });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { const m = document.getElementById('modal'); if (m && !m.hidden) closeModal(); else if (UI.navOpen) { UI.navOpen = false; render(); } } });

/* ---------- Boot ---------- */
async function boot() {
  applyTheme();
  if (typeof window !== 'undefined') window.addEventListener('hashchange', () => { if (!S.session) render(); });
  if (!SERVER) {
    loadDemo();
    if (S.session) { const u = userById(S.session.uid); if (!u || !u.roles.length) S.session = null; else if (u.roles.indexOf(S.session.role) < 0) S.session.role = u.roles[0]; }
    UI.route = S.session ? NAV[S.session.role][0][0] : 'login'; render(); return;
  }
  S = emptyState(); UI.route = 'login';
  if (TOKEN) { UI.booting = true; render(); await startSession(); UI.booting = false; render(); } else render();
}
boot();
