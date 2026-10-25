/**
 * E-LOGBOOK PROGRAM STUDI PROFESI DOKTER
 * Fakultas Kedokteran Universitas Murni Teguh
 * Rumah sakit pendidikan utama: RS Murni Teguh Methodist Susanna Wesley
 *
 * Backend Google Apps Script. Data disimpan di Google Sheets yang terikat pada skrip ini.
 * Petunjuk pemasangan lengkap ada di berkas PDF "Petunjuk Penggunaan E-Logbook".
 *
 * LANGKAH SINGKAT
 *  1. Ubah ADMIN_EMAIL dan ADMIN_NAME di bawah ini.
 *  2. Pilih fungsi "setup" lalu klik Jalankan. Setujui izin akses. Lihat sandi awal admin di "Log eksekusi".
 *  3. Terapkan > Deployment baru > Aplikasi web. Jalankan sebagai: Saya. Akses: Siapa saja.
 *  4. Salin URL aplikasi web ke berkas config.js pada aplikasi (API_URL).
 */

/* ======== PENGATURAN YANG PERLU DIUBAH ======== */
const ADMIN_EMAIL = 'ganti-dengan-email-admin@contoh.com';
const ADMIN_NAME = 'Admin Program Studi';

/* ======== KONSTANTA ======== */
const SERVER = true;
const PW_ROUNDS = 120;
const TOKEN_TTL = 21600;      // detik, 6 jam
const BG_MENIT = 15;
const MAX_FAIL = 5;           // gagal masuk berturut-turut sebelum dikunci sementara
const LOCK_TTL = 900;         // detik
const ROLES = ['mahasiswa', 'dosen', 'preseptor', 'kaprodi', 'admin'];
const HEAD = ['id', 'sid', 'pid', 'json', 'upd'];
const SHEETS = ['users', 'students', 'cases', 'asms', 'epaLog', 'nilai', 'ews', 'events', 'periods', 'wahana', 'epa', 'replies', 'cfg', 'stases', 'audit', 'regs'];

/* ======== PEMASANGAN ======== */
function setup() {
  if (!/^\S+@\S+\.\S+$/.test(ADMIN_EMAIL) || ADMIN_EMAIL.indexOf('contoh.com') >= 0) throw new Error('Ubah ADMIN_EMAIL di bagian atas skrip dengan email admin yang sebenarnya, lalu jalankan setup lagi.');
  SHEETS.forEach(function (n) { sheet_(n); });
  const P = PropertiesService.getScriptProperties();
  if (!P.getProperty('ENC_KEY')) {
    const k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('ENC_KEY', Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, k)));
  }
  MEM = {};
  const us = readAll_('users');
  if (!us.some(function (r) { return r.d.email === ADMIN_EMAIL.toLowerCase(); })) {
    const pw = tempPw_();
    const salt = Utilities.getUuid();
    put_('users', gid_('u'), '', '', { nama: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), roles: ['admin'], unit: 'Program Studi Profesi Dokter', sid: '', aktif: true, must: true, salt: salt, hash: hashPw_(pw, salt), tv: 1, created: now_() });
    Logger.log('==============================================');
    Logger.log('AKUN ADMIN DIBUAT');
    Logger.log('Email : ' + ADMIN_EMAIL.toLowerCase());
    Logger.log('Sandi sementara : ' + pw);
    Logger.log('Anda akan diminta menggantinya saat masuk pertama kali.');
    Logger.log('==============================================');
  } else Logger.log('Akun admin sudah ada. Gunakan menu Reset sandi dari aplikasi bila lupa.');
  if (!readAll_('wahana').length) {
    put_('wahana', 'w0', '', '', { id: 'w0', nama: 'RS Murni Teguh Methodist Susanna Wesley', jenis: 'RS Pendidikan Utama' });
  }
  flush_();
  Logger.log('Setup selesai. Lanjutkan dengan Terapkan > Deployment baru > Aplikasi web.');
}

/* ======== PINTU MASUK WEB ======== */
function doGet(e) {
  const tok = e && e.parameter && e.parameter.consent;
  if (tok) return consentPage_(String(tok));
  return json_({ ok: true, name: 'E-Logbook Profesi Dokter FK UMT', version: 2 });
}
function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return json_({ ok: false, err: 'bad_request' }); }
  MEM = {}; IDX = {}; TOUCH = {}; DELR = {};
  const act = String(req.action || '');
  const writes = { sync: 1, register: 1, chpw: 1, admin: 1, bg: 1, bgEnd: 1 };
  let lock = null;
  try {
    if (writes[act]) { lock = LockService.getScriptLock(); lock.waitLock(25000); }
    const H = { login: login_, logout: logout_, register: register_, chpw: chpw_, load: load_, sync: sync_, bg: bg_, bgGet: bgGet_, bgEnd: bgEnd_, admin: admin_ };
    if (!H[act]) return json_({ ok: false, err: 'unknown_action' });
    const out = H[act](req);
    flush_();
    return json_(out);
  } catch (x) {
    if (x && x.code) return json_({ ok: false, err: x.code, msg: x.msg || '' });
    console.error(x && x.stack || x);
    return json_({ ok: false, err: 'server', msg: String(x && x.message || x) });
  } finally { if (lock) { try { lock.releaseLock(); } catch (y) { } } }
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function fail_(code, msg) { const e = new Error(code); e.code = code; e.msg = msg || ''; throw e; }

/* ======== LEMBAR DATA (satu lembar per koleksi: id | sid | pid | json | upd) ======== */
var MEM = {}, IDX = {}, TOUCH = {}, DELR = {};
function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1, 1, 1, 5).setValues([HEAD]); sh.setFrozenRows(1); }
  return sh;
}
function readAll_(name) {
  if (MEM[name]) return MEM[name];
  const sh = sheet_(name), n = sh.getLastRow() - 1, out = [];
  if (n > 0) {
    const v = sh.getRange(2, 1, n, 5).getValues();
    for (let i = 0; i < n; i++) {
      if (v[i][0] === '' || v[i][0] == null) continue;
      try { out.push({ id: String(v[i][0]), sid: String(v[i][1]), pid: String(v[i][2]), d: JSON.parse(v[i][3]), row: i + 2, dirty: false }); } catch (x) { }
    }
  }
  MEM[name] = out; IDX[name] = {}; out.forEach(function (r) { IDX[name][r.id] = r; });
  return out;
}
function get_(name, id) { readAll_(name); return IDX[name][id] || null; }
function put_(name, id, sid, pid, d) {
  const all = readAll_(name); let r = IDX[name][id];
  const s = JSON.stringify(d); if (s.length > 45000) fail_('too_big');
  if (r) { r.sid = sid || ''; r.pid = pid || ''; r.d = d; r.dirty = true; }
  else { r = { id: id, sid: sid || '', pid: pid || '', d: d, row: 0, dirty: true }; all.push(r); IDX[name][id] = r; }
  TOUCH[name] = true; return r;
}
function del_(name, id) {
  const all = readAll_(name); const r = IDX[name][id]; if (!r) return;
  all.splice(all.indexOf(r), 1); delete IDX[name][id];
  if (r.row) (DELR[name] = DELR[name] || []).push(r.row);
  TOUCH[name] = true;
}
function flush_() {
  Object.keys(TOUCH).forEach(function (name) {
    const all = MEM[name], sh = sheet_(name), dels = (DELR[name] || []).slice().sort(function (a, b) { return b - a; });
    const stamp = now_() + ' ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm:ss');
    const dirty = all.filter(function (r) { return r.dirty; });
    if (dels.length > 5 || dirty.length > 30) {
      const last = sh.getLastRow();
      if (last > 1) sh.getRange(2, 1, last - 1, 5).clearContent();
      if (all.length) sh.getRange(2, 1, all.length, 5).setValues(all.map(function (r) { return [r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]; }));
      all.forEach(function (r, i) { r.row = i + 2; r.dirty = false; });
    } else {
      dels.forEach(function (row) { sh.deleteRow(row); all.forEach(function (r) { if (r.row > row) r.row--; }); });
      const adds = [];
      dirty.forEach(function (r) {
        if (r.row) sh.getRange(r.row, 1, 1, 5).setValues([[r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]]);
        else adds.push(r);
      });
      if (adds.length) {
        const start = sh.getLastRow() + 1;
        sh.getRange(start, 1, adds.length, 5).setValues(adds.map(function (r) { return [r.id, r.sid, r.pid, JSON.stringify(r.d), stamp]; }));
        adds.forEach(function (r, i) { r.row = start + i; });
      }
      dirty.forEach(function (r) { r.dirty = false; });
    }
  });
  TOUCH = {}; DELR = {};
}

/* ======== UTILITAS ======== */
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function ts_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
function gid_(p) { return p + new Date().getTime().toString(36) + Utilities.getUuid().replace(/-/g, '').slice(0, 6); }
function b64_(bytes) { return Utilities.base64Encode(bytes); }
function str_(v, max) { v = v == null ? '' : String(v); return v.length > max ? v.slice(0, max) : v; }
function int_(v, lo, hi, def) { const n = parseInt(v, 10); return isNaN(n) ? def : Math.max(lo, Math.min(hi, n)); }
function num_(v, lo, hi) { const n = parseFloat(v); if (isNaN(n) || n < lo || n > hi) return null; return Math.round(n * 10) / 10; }
function enum_(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }
function date_(v, def) { v = String(v || ''); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : (def === undefined ? now_() : def); }
function idok_(v) { return /^[A-Za-z0-9_:|-]{2,80}$/.test(String(v || '')); }
function tempPw_() {
  const cs = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
  const u = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  for (let i = 0; i < 10; i++) s += cs.charAt(parseInt(u.substr(i * 2, 2), 16) % cs.length);
  return s;
}
function hashPw_(pw, salt) {
  let h = salt + '|' + pw;
  for (let i = 0; i < PW_ROUNDS; i++) h = b64_(Utilities.computeHmacSha256Signature(h, salt + ':' + i));
  return h;
}
function same_(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function rolesOf_(u) { const r = {}; (u.d.roles || []).forEach(function (x) { r[x] = 1; }); return r; }

/* Enkripsi identitas pasien: aliran kunci HMAC-SHA256 mode penghitung, disertai MAC. Kunci ada di Script Properties. */
function key_() { const k = PropertiesService.getScriptProperties().getProperty('ENC_KEY'); if (!k) fail_('not_setup', 'Jalankan setup terlebih dahulu.'); return k; }
function xor_(bytes, nonce, key) {
  const out = []; let blk = null;
  for (let i = 0; i < bytes.length; i++) {
    if (i % 32 === 0) blk = Utilities.computeHmacSha256Signature(nonce + ':' + Math.floor(i / 32), key);
    out.push(((bytes[i] & 255) ^ (blk[i % 32] & 255)) & 255);
  }
  return out.map(function (x) { return x > 127 ? x - 256 : x; });
}
function enc_(s) {
  s = String(s == null ? '' : s); if (!s) return '';
  const key = key_(), nonce = Utilities.getUuid();
  const ct = b64_(xor_(Utilities.newBlob(s).getBytes(), nonce, key));
  const mac = b64_(Utilities.computeHmacSha256Signature(nonce + '.' + ct, key));
  return nonce + '.' + ct + '.' + mac;
}
function dec_(t) {
  if (!t) return '';
  const p = String(t).split('.'); if (p.length !== 3) return '';
  const key = key_();
  if (!same_(b64_(Utilities.computeHmacSha256Signature(p[0] + '.' + p[1], key)), p[2])) return '';
  return Utilities.newBlob(xor_(Utilities.base64Decode(p[1]), p[0], key)).getDataAsString();
}

/* ======== AUTENTIKASI ======== */
function userByEmail_(email) { email = String(email || '').trim().toLowerCase(); return readAll_('users').filter(function (r) { return r.d.email === email; })[0] || null; }
function auth_(req) {
  const tk = String(req.token || ''); if (!/^[A-Za-z0-9]{40,100}$/.test(tk)) fail_('auth');
  const v = CacheService.getScriptCache().get('tk:' + tk); if (!v) fail_('auth');
  const p = v.split('|'); const u = get_('users', p[0]);
  if (!u || u.d.aktif === false || String(u.d.tv) !== p[1]) fail_('auth');
  return u;
}
function login_(req) {
  const email = String(req.email || '').trim().toLowerCase(), pw = String(req.pw || '');
  const C = CacheService.getScriptCache(), lk = 'lf:' + email;
  const fails = parseInt(C.get(lk) || '0', 10);
  if (fails >= MAX_FAIL) fail_('locked', 'Terlalu banyak percobaan. Coba lagi sekitar 15 menit.');
  const u = userByEmail_(email);
  const ok = !!u && u.d.aktif !== false && same_(hashPw_(pw, u.d.salt), u.d.hash);
  if (!ok) { C.put(lk, String(fails + 1), LOCK_TTL); fail_('cred', 'Email atau kata sandi tidak cocok.'); }
  if (!u.d.roles || !u.d.roles.length) fail_('norole', 'Peran Anda belum ditetapkan oleh admin program studi.');
  C.remove(lk);
  const tok = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  C.put('tk:' + tok, u.id + '|' + u.d.tv, TOKEN_TTL);
  return { ok: true, token: tok, must: !!u.d.must };
}
function logout_(req) { try { CacheService.getScriptCache().remove('tk:' + String(req.token || '')); } catch (x) { } return { ok: true }; }
function register_(req) {
  const email = String(req.email || '').trim().toLowerCase(), nama = str_(String(req.nama || '').trim(), 80), pw = String(req.pw || '');
  if (!nama || !/^\S+@\S+\.\S+$/.test(email) || email.length > 120) fail_('invalid', 'Nama atau email tidak valid.');
  if (pw.length < 8) fail_('weak', 'Kata sandi minimal 8 karakter.');
  const C = CacheService.getScriptCache(); const n = parseInt(C.get('rg:n') || '0', 10);
  if (n >= 30) fail_('busy', 'Terlalu banyak pendaftaran dalam satu jam. Coba lagi nanti.');
  if (userByEmail_(email) || readAll_('regs').some(function (r) { return r.d.email === email; })) fail_('exists', 'Email ini sudah terdaftar atau sedang menunggu penetapan peran.');
  C.put('rg:n', String(n + 1), 3600);
  const salt = Utilities.getUuid();
  put_('regs', gid_('r'), '', '', { nama: nama, email: email, unit: str_(req.unit, 30), harap: enum_(String(req.harap || '').toLowerCase(), ['mahasiswa', 'dosen', 'preseptor'], 'mahasiswa'), salt: salt, hash: hashPw_(pw, salt), tgl: now_() });
  return { ok: true };
}
function chpw_(req) {
  const u = auth_(req); const nw = String(req.nw || '');
  if (nw.length < 8) fail_('weak', 'Kata sandi baru minimal 8 karakter.');
  if (!same_(hashPw_(String(req.old || ''), u.d.salt), u.d.hash)) fail_('cred', 'Kata sandi lama tidak cocok.');
  if (nw === String(req.old)) fail_('same', 'Kata sandi baru harus berbeda dari yang lama.');
  u.d.salt = Utilities.getUuid(); u.d.hash = hashPw_(nw, u.d.salt); u.d.must = false; u.d.tv = (u.d.tv || 1) + 1;
  put_('users', u.id, u.sid || '', '', u.d);
  const tok = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  CacheService.getScriptCache().put('tk:' + tok, u.id + '|' + u.d.tv, TOKEN_TTL);
  return { ok: true, token: tok };
}

/* ======== MUAT DATA SESUAI PERAN ======== */
function maskCase_(d, own) {
  const o = {}; Object.keys(d).forEach(function (k) { if (k !== 'ini_e' && k !== 'rm_e') o[k] = d[k]; });
  if (!own) delete o.tok;
  o.ini = ''; o.rm = '';
  return o;
}
function readableSids_(u) {
  const R = rolesOf_(u); const sids = {};
  if (R.mahasiswa && u.d.sid) sids[u.d.sid] = 1;
  if (R.preseptor) {
    readAll_('cases').forEach(function (r) { if (r.pid === u.id) sids[r.sid] = 1; });
    readAll_('asms').forEach(function (r) { if (r.pid === u.id) sids[r.sid] = 1; });
  }
  return sids;
}
function canReadCase_(u, r) {
  const R = rolesOf_(u);
  if (R.admin || R.kaprodi || R.dosen) return true;
  if (R.mahasiswa && u.d.sid && r.sid === u.d.sid) return true;
  return !!R.preseptor && r.pid === u.id;
}
function load_(req) {
  const u = auth_(req), R = rolesOf_(u), full = !!(R.admin || R.kaprodi || R.dosen);
  let cases = readAll_('cases'), asms = readAll_('asms'), students = readAll_('students');
  let sids = null;
  if (!full) {
    sids = readableSids_(u);
    cases = cases.filter(function (r) { return (R.mahasiswa && r.sid === u.d.sid) || (R.preseptor && r.pid === u.id); });
    asms = asms.filter(function (r) { return (R.mahasiswa && r.sid === u.d.sid) || (R.preseptor && r.pid === u.id); });
    students = students.filter(function (r) { return sids[r.id]; });
  }
  const inS = function (r) { return full || sids[r.sid]; };
  const st = {
    ok: true, today: now_(),
    me: { id: u.id, nama: u.d.nama, email: u.d.email, roles: u.d.roles, unit: u.d.unit || '', sid: u.d.sid || '', must: !!u.d.must },
    students: students.map(function (r) { return r.d; }),
    cases: cases.map(function (r) { return maskCase_(r.d, r.sid === u.d.sid); }),
    asms: asms.map(function (r) { return r.d; }),
    epaLog: readAll_('epaLog').filter(inS).map(function (r) { return r.d; }),
    nilai: readAll_('nilai').filter(inS).map(function (r) { return r.d; }),
    epa: {}, replies: {}, events: readAll_('events').map(function (r) { return r.d; }), periods: readAll_('periods').map(function (r) { return r.d; }), wahana: readAll_('wahana').map(function (r) { return r.d; }),
    stases: readAll_('stases').map(function (r) { return r.d; }), cfg: {}, regs: [], audit: [], ews: []
  };
  readAll_('epa').forEach(function (r) { if (inS(r)) st.epa[r.id] = r.d.l; });
  readAll_('replies').forEach(function (r) { if (R.mahasiswa && r.sid === u.d.sid) st.replies[r.id] = r.d.t; });
  readAll_('cfg').forEach(function (r) { st.cfg[r.id] = r.d; });
  st.ews = readAll_('ews').filter(function (r) { return R.kaprodi || r.d.oleh === u.id; }).map(function (r) { return r.d; });
  st.audit = readAll_('audit').filter(function (r) { return R.admin || R.kaprodi || r.d.uid === u.id; }).map(function (r) { return r.d; });
  if (R.admin) st.regs = readAll_('regs').map(function (r) { const d = r.d; return { id: r.id, nama: d.nama, email: d.email, unit: d.unit, harap: d.harap, tgl: d.tgl }; });
  st.users = readAll_('users').filter(function (r) {
    if (R.admin || r.id === u.id) return true;
    const rr = r.d.roles || []; return rr.indexOf('dosen') >= 0 || rr.indexOf('preseptor') >= 0 || rr.indexOf('kaprodi') >= 0;
  }).map(function (r) { const d = r.d; const o = { id: r.id, nama: d.nama, roles: d.roles, unit: d.unit || '', sid: d.sid || '', aktif: d.aktif !== false }; if (R.admin || r.id === u.id) { o.email = d.email; o.last = d.last || ''; o.must = !!d.must; } return o; });
  st.bgAktif = st.audit.filter(function (a) { return a.uid === u.id && a.status === 'Aktif' && a.until > new Date().getTime(); }).map(function (a) { return { cid: a.cid, until: a.until }; });
  if (R.mahasiswa && u.d.sid && !R.admin && !R.kaprodi && !R.dosen) st.pct = pct_(u.d.sid);
  return st;
}
/* Persentil kohort dihitung di server agar mahasiswa tidak perlu menerima data teman sekelas. */
function pct_(sid) {
  const C = CacheService.getScriptCache(); let all = null;
  try { const c = C.get('pct'); if (c) all = JSON.parse(c); } catch (x) { }
  if (!all) {
    const keep = S;
    S = { students: readAll_('students').map(function (r) { return r.d; }), cases: readAll_('cases').map(function (r) { return { sid: r.sid, st: r.d.st, jenis: r.d.jenis, stat: r.d.stat, kat: r.d.kat }; }), asms: readAll_('asms').filter(function (r) { return r.d.stat === 'dinilai'; }).map(function (r) { return r.d; }), nilai: readAll_('nilai').map(function (r) { return r.d; }), epa: {}, pct: null };
    cfg_(S); inval();
    all = {};
    S.students.forEach(function (s) { all[s.id] = { PSSK: pctRank('PSSK', s.id), PSPD: pctRank('PSPD', s.id) }; });
    S = keep; inval();
    try { C.put('pct', JSON.stringify(all), 600); } catch (x) { }
  }
  const o = {}; if (all[sid]) o[sid] = all[sid]; return o;
}
function cfg_(Sx) {
  Sx.bobotStase = Object.assign({}, BS); Sx.bobotBlok = Object.assign({}, BB);
  readAll_('cfg').forEach(function (r) { if (r.id === 'bs') Sx.bobotStase = r.d.v; if (r.id === 'bb') Sx.bobotBlok = r.d.v; });
  Sx.stases = STASES.map(function (x) { return Object.assign({}, x); });
  readAll_('stases').forEach(function (r) { const s = Sx.stases.filter(function (x) { return x.id === r.id; })[0]; if (s) { s.minggu = r.d.minggu; s.tf = r.d.tf; s.tr = r.d.tr; } });
  Sx.wahana = readAll_('wahana').map(function (r) { return r.d; });
}

/* ======== SINKRONISASI TULIS DENGAN OTORISASI TIAP BARIS ======== */
function stIds_() { return STASES.map(function (s) { return s.id; }); }
function pidOk_(pid) { const r = get_('users', pid); return !!r && r.d.aktif !== false && (r.d.roles || []).some(function (x) { return x === 'preseptor' || x === 'dosen' || x === 'kaprodi'; }); }
function sync_(req) {
  const u = auth_(req), R = rolesOf_(u);
  if (u.d.must) fail_('must_change', 'Ganti kata sandi terlebih dahulu.');
  const ops = Array.isArray(req.ops) ? req.ops.slice(0, 400) : [];
  const rej = [];
  ops.forEach(function (op) {
    let ok = false;
    try {
      const f = Object.prototype.hasOwnProperty.call(W, op.c) ? W[op.c] : null; if (f && idok_(op.id)) ok = f(u, R, op) === true;
    } catch (x) { if (x && x.code === 'too_big') ok = false; else throw x; }
    if (!ok) rej.push([op.c, op.id]);
  });
  return { ok: true, rej: rej };
}
const W = {};
W.cases = function (u, R, op) {
  const ex = get_('cases', op.id);
  if (op.del) {
    if (!ex || !R.mahasiswa || ex.sid !== u.d.sid || ex.d.stat !== 'draf') return false;
    del_('cases', op.id); return true;
  }
  const d = op.d || {};
  const common = function () {
    return { tgl: date_(d.tgl), jenis: enum_(d.jenis, ['Kasus', 'Kegiatan', 'Refleksi'], 'Kasus'), st: enum_(d.st, stIds_(), stIds_()[0]), wah: str_(d.wah, 20), dx: str_(d.dx, 200), kat: enum_(d.kat, ['FKTP', 'FKRTL', ''], ''), sis: str_(d.sis, 60), usia: str_(d.usia, 4), jk: enum_(d.jk, ['L', 'P'], 'L'), ter: str_(d.ter, 60), pid: str_(d.pid, 40), sum: str_(d.sum, 4000), ref: str_(d.ref, 3000) };
  };
  const idn = function (o, cur) {
    const ini = str_(d.ini, 30).trim(), rm = str_(d.rm, 30).trim();
    o.ini_e = ini ? enc_(ini) : (cur ? cur.ini_e || '' : ''); o.rm_e = rm ? enc_(rm) : (cur ? cur.rm_e || '' : '');
    o.rm2 = rm ? rm.slice(-2) : (cur ? cur.rm2 || '' : '');
  };
  // Mahasiswa pemilik
  if (R.mahasiswa && u.d.sid && (!ex || ex.sid === u.d.sid) && (!ex || ex.d.stat === 'draf' || ex.d.stat === 'kembali')) {
    const o = common(); if (o.pid && !pidOk_(o.pid)) return false;
    let stat = enum_(d.stat, ['draf', 'menunggu', 'valid'], 'draf');
    if (o.jenis === 'Kasus' && stat === 'valid') stat = 'menunggu';
    if (o.jenis !== 'Kasus' && stat === 'menunggu') stat = 'valid';
    if (o.jenis !== 'Kasus') { o.kat = ''; o.sis = ''; }
    const cur = ex ? ex.d : null;
    const out = Object.assign({ id: op.id, sid: u.d.sid }, o, { stat: stat, fb: cur ? cur.fb || '' : '', fbTgl: cur ? cur.fbTgl || '' : '', cons: cur ? !!cur.cons : false, tok: cur ? cur.tok : (/^[a-z0-9]{12,40}$/.test(String(d.tok || '')) ? d.tok : Utilities.getUuid().replace(/-/g, '').slice(0, 24)) });
    idn(out, cur);
    if (!ex && out.jenis === 'Kasus' && !out.rm2 && stat !== 'draf') return false;
    put_('cases', op.id, u.d.sid, out.pid, out); return true;
  }
  // Validator
  if (ex && ex.d.stat === 'menunggu' && ex.sid !== u.d.sid && (R.dosen || R.preseptor) && (ex.pid === u.id || R.dosen)) {
    const stat = enum_(d.stat, ['valid', 'kembali'], null); if (!stat) return false;
    const out = Object.assign({}, ex.d, { stat: stat, fb: str_(d.fb, 2000), fbTgl: date_(d.fbTgl) });
    if (stat === 'kembali' && !out.fb.trim()) return false;
    put_('cases', op.id, ex.sid, ex.pid, out); return true;
  }
  return false;
};
W.asms = function (u, R, op) {
  const ex = get_('asms', op.id); const d = op.d || {}; if (op.del) return false;
  if (!ex) {
    if (!R.mahasiswa || !u.d.sid) return false;
    const jenis = enum_(d.jenis, ['DOPS', 'Mini-CEX', 'CBD', 'Presentasi Kasus', 'MSF'], null); if (!jenis || !pidOk_(d.pid)) return false;
    put_('asms', op.id, u.d.sid, d.pid, { id: op.id, sid: u.d.sid, jenis: jenis, judul: str_(d.judul, 200), tgl: date_(d.tgl), st: enum_(d.st, stIds_(), stIds_()[0]), pid: d.pid, stat: 'menunggu', sk: null, kek: '', perlu: '', renc: '' }); return true;
  }
  if (ex.d.stat !== 'menunggu' || ex.sid === u.d.sid || !(R.dosen || R.preseptor) || !(ex.pid === u.id || R.dosen)) return false;
  const n = ex.d.jenis === 'DOPS' ? DP_DOM.length : MC_DOM.length;
  if (!Array.isArray(d.sk) || d.sk.length !== n) return false;
  const sk = d.sk.map(function (x) { return int_(x, 1, 9, 6); });
  put_('asms', op.id, ex.sid, ex.pid, Object.assign({}, ex.d, { sk: sk, kek: str_(d.kek, 1500), perlu: str_(d.perlu, 1500), renc: str_(d.renc, 1500), stat: 'dinilai' })); return true;
};
W.epaLog = function (u, R, op) {
  if (op.del || get_('epaLog', op.id)) return false;
  if (!(R.dosen || R.preseptor || R.kaprodi)) return false;
  const d = op.d || {}; const s = get_('students', d.sid); if (!s) return false;
  const epa = int_(d.epa, 0, EPAS.length - 1, -1), level = int_(d.level, 1, 5, 0); if (epa < 0 || !level) return false;
  put_('epaLog', op.id, s.id, u.id, { id: op.id, sid: s.id, epa: epa, level: level, tgl: date_(d.tgl), pid: u.id, cm: str_(d.cm, 1500) });
  const cur = get_('epa', s.id); const l = cur ? cur.d.l.slice() : EPAS.map(function () { return 1; }); l[epa] = level;
  put_('epa', s.id, s.id, '', { l: l }); return true;
};
W.nilai = function (u, R, op) {
  if (op.del || !(R.dosen || R.kaprodi || R.admin)) return false;
  const d = op.d || {}; const s = get_('students', d.sid); if (!s) return false;
  const tahap = enum_(d.tahap, ['PSPD', 'PSSK'], null); if (!tahap) return false;
  const unit = tahap === 'PSPD' ? enum_(d.unit, stIds_(), null) : enum_(d.unit, PSSK_BLOK, null); if (!unit) return false;
  const komp = tahap === 'PSPD' ? enum_(d.komp, ['CBT', 'OSCE', 'CBD', 'MSF'], null) : enum_(d.komp, Object.keys(BB), null); if (!komp) return false;
  const v = num_(d.v, 0, 100); if (v == null) return false;
  const id = [s.id, tahap, unit, komp].join('|').replace(/[^A-Za-z0-9|_-]/g, '_'); if (id !== op.id) return false;
  put_('nilai', id, s.id, '', { id: id, sid: s.id, tahap: tahap, unit: unit, komp: komp, v: v, tgl: date_(d.tgl), oleh: u.id }); return true;
};
W.ews = function (u, R, op) {
  if (op.del || !R.kaprodi) return false;
  const ex = get_('ews', op.id); const d = op.d || {};
  if (!ex) {
    const s = get_('students', d.sid); if (!s) return false;
    put_('ews', op.id, s.id, u.id, { id: op.id, sid: s.id, kat: enum_(d.kat, ['Akademik', 'Profesionalisme', 'Kesejahteraan', 'Kehadiran', 'Lainnya'], 'Lainnya'), oleh: u.id, tgl: date_(d.tgl), txt: str_(d.txt, 2000), stat: 'antrean', rek: [] }); return true;
  }
  const rek = (Array.isArray(d.rek) ? d.rek : []).slice(0, 20).map(function (r) { return { jenis: str_(r.jenis, 80), txt: str_(r.txt, 1500), target: date_(r.target), tgl: date_(r.tgl) }; });
  put_('ews', op.id, ex.sid, ex.pid, Object.assign({}, ex.d, { stat: enum_(d.stat, ['antrean', 'dilaporkan', 'selesai'], ex.d.stat), rek: rek })); return true;
};
W.events = function (u, R, op) {
  if (!R.admin) return false; if (op.del) { del_('events', op.id); return true; }
  const d = op.d || {};
  put_('events', op.id, '', '', { id: op.id, jenis: enum_(d.jenis, JENIS_ASESMEN.map(function (j) { return j.k; }), 'OSCE'), judul: str_(d.judul, 200), st: enum_(d.st, stIds_().concat(['']), ''), tgl: date_(d.tgl), lokasi: str_(d.lokasi, 200), penguji: str_(d.penguji, 40), kuota: int_(d.kuota, 1, 2000, 1), status: enum_(d.status, ['Dijadwalkan', 'Selesai', 'Dibatalkan'], 'Dijadwalkan') }); return true;
};
W.periods = function (u, R, op) {
  if (!R.admin) return false; if (op.del) { del_('periods', op.id); return true; }
  const d = op.d || {};
  put_('periods', op.id, '', '', { id: op.id, nama: str_(d.nama, 120), mulai: date_(d.mulai), selesai: date_(d.selesai), aktif: !!d.aktif }); return true;
};
W.wahana = function (u, R, op) {
  if (!R.admin || op.del) return false; const d = op.d || {};
  put_('wahana', op.id, '', '', { id: op.id, nama: str_(d.nama, 160), jenis: enum_(d.jenis, ['FKTP', 'RS Jejaring', 'RS Pendidikan Utama'], 'FKTP') }); return true;
};
W.stases = function (u, R, op) {
  if (!R.admin || op.del || stIds_().indexOf(op.id) < 0) return false; const d = op.d || {};
  put_('stases', op.id, '', '', { id: op.id, minggu: int_(d.minggu, 1, 30, 4), tf: int_(d.tf, 0, 500, 0), tr: int_(d.tr, 0, 500, 0) }); return true;
};
W.cfg = function (u, R, op) {
  if (!R.admin || op.del || (op.id !== 'bs' && op.id !== 'bb')) return false;
  const v = op.d && op.d.v || {}; const base = op.id === 'bs' ? BS : BB; const out = {}; let sum = 0;
  Object.keys(base).forEach(function (k) { out[k] = Math.max(0, Math.min(100, parseFloat(v[k]) || 0)); sum += out[k]; });
  if (Math.round(sum) !== 100) return false;
  put_('cfg', op.id, '', '', { id: op.id, v: out }); return true;
};
W.replies = function (u, R, op) {
  if (!R.mahasiswa || !u.d.sid || op.del) return false;
  const m = /^([cae]):(.+)$/.exec(String(op.id)); if (!m) return false;
  const src = get_(m[1] === 'c' ? 'cases' : m[1] === 'a' ? 'asms' : 'epaLog', m[2]);
  if (!src || src.sid !== u.d.sid) return false;
  put_('replies', op.id, u.d.sid, '', { id: op.id, t: str_(op.d && op.d.t, 2000) }); return true;
};

/* ======== BREAK GLASS ======== */
function bg_(req) {
  const u = auth_(req); const c = get_('cases', String(req.cid || '')); if (!c || !canReadCase_(u, c)) fail_('forbidden');
  const alasan = str_(String(req.alasan || '').trim(), 400); if (alasan.length < 15) fail_('invalid', 'Alasan minimal 15 karakter.');
  const until = new Date().getTime() + BG_MENIT * 60000;
  const aid = gid_('b');
  put_('audit', aid, c.sid, u.id, { id: aid, ts: ts_(), uid: u.id, cid: c.id, alasan: alasan, menit: BG_MENIT, status: 'Aktif', until: until });
  return { ok: true, ini: dec_(c.d.ini_e), rm: dec_(c.d.rm_e), until: until };
}
function bgGet_(req) {
  const u = auth_(req); const c = get_('cases', String(req.cid || '')); if (!c || !canReadCase_(u, c)) fail_('forbidden');
  const a = readAll_('audit').filter(function (r) { return r.d.uid === u.id && r.d.cid === c.id && r.d.status === 'Aktif' && r.d.until > new Date().getTime(); })[0];
  if (!a) fail_('expired');
  return { ok: true, ini: dec_(c.d.ini_e), rm: dec_(c.d.rm_e), until: a.d.until };
}
function bgEnd_(req) {
  const u = auth_(req); const R = rolesOf_(u); const cid = String(req.cid || '');
  readAll_('audit').forEach(function (r) {
    if (r.d.cid === cid && r.d.status === 'Aktif' && (r.d.uid === u.id || R.admin)) { r.d.status = 'Selesai'; put_('audit', r.id, r.sid, r.pid, r.d); }
  });
  return { ok: true };
}

/* ======== ADMIN ======== */
function admin_(req) {
  const u = auth_(req); const R = rolesOf_(u); if (!R.admin) fail_('forbidden');
  if (u.d.must) fail_('must_change');
  const f = ADM[req.op]; if (!f) fail_('unknown_op');
  return f(u, req);
}
const ADM = {};
function cleanUser_(p) {
  const roles = (Array.isArray(p.roles) ? p.roles : []).filter(function (r, i, a) { return ROLES.indexOf(r) >= 0 && a.indexOf(r) === i; });
  let g = p.g; if (typeof g === 'string' && /^[A-Da-d]$/.test(g)) g = g.toUpperCase().charCodeAt(0) - 65;
  return { nama: str_(String(p.nama || '').trim(), 80), email: String(p.email || '').trim().toLowerCase(), roles: roles, unit: str_(p.unit, 120), nim: str_(String(p.nim || '').trim(), 20), g: int_(g, 0, 3, 0), angk: str_(p.angk, 4) || String(new Date().getFullYear()), mulai: date_(p.mulai, '') };
}
function ensureStudent_(uid, c, sidKnown) {
  let sid = sidKnown;
  let s = sid ? get_('students', sid) : null;
  if (!s) {
    sid = gid_('s');
    put_('students', sid, sid, '', { id: sid, nama: c.nama, nim: c.nim || ('NIM' + sid.slice(-5).toUpperCase()), g: c.g, angk: c.angk, mulai: c.mulai, mu: 0, rate: 0, uid: uid });
    put_('epa', sid, sid, '', { l: EPAS.map(function () { return 1; }) });
  } else {
    const d = Object.assign({}, s.d, { nama: c.nama, g: c.g, angk: c.angk, mulai: c.mulai }); if (c.nim) d.nim = c.nim;
    put_('students', sid, sid, '', d);
  }
  return sid;
}
function createUser_(c, hash, salt, must) {
  if (!c.nama || !/^\S+@\S+\.\S+$/.test(c.email)) return { err: 'Nama atau email tidak valid' };
  if (userByEmail_(c.email)) return { err: 'Email sudah terdaftar' };
  const id = gid_('u'); let sid = '';
  if (c.roles.indexOf('mahasiswa') >= 0) sid = ensureStudent_(id, c, '');
  put_('users', id, sid, '', { nama: c.nama, email: c.email, roles: c.roles, unit: c.unit, sid: sid, aktif: true, must: must, salt: salt, hash: hash, tv: 1, created: now_() });
  return { id: id };
}
ADM.userCreate = function (u, req) {
  const c = cleanUser_(req); const pw = tempPw_(); const salt = Utilities.getUuid();
  const r = createUser_(c, hashPw_(pw, salt), salt, true); if (r.err) fail_('invalid', r.err);
  return { ok: true, id: r.id, pw: pw };
};
ADM.userImport = function (u, req) {
  const rows = Array.isArray(req.rows) ? req.rows.slice(0, 300) : []; const out = [], skip = [];
  rows.forEach(function (p, i) {
    const c = cleanUser_(p); const pw = tempPw_(); const salt = Utilities.getUuid();
    const r = createUser_(c, hashPw_(pw, salt), salt, true);
    if (r.err) skip.push({ i: i + 1, email: c.email, err: r.err }); else out.push({ nama: c.nama, email: c.email, pw: pw });
  });
  return { ok: true, made: out, skip: skip };
};
ADM.userUpdate = function (u, req) {
  const r = get_('users', String(req.id || '')); if (!r) fail_('notfound');
  const c = cleanUser_(Object.assign({}, r.d, req, { email: r.d.email }));
  if (!c.nama) fail_('invalid', 'Nama wajib diisi.');
  const aktif = req.aktif !== false;
  if (r.id === u.id && (!aktif || c.roles.indexOf('admin') < 0)) fail_('self', 'Anda tidak dapat menonaktifkan akun sendiri atau melepas peran admin Anda.');
  const d = Object.assign({}, r.d, { nama: c.nama, roles: c.roles, unit: c.unit, aktif: aktif });
  if (c.roles.indexOf('mahasiswa') >= 0) d.sid = ensureStudent_(r.id, c, r.d.sid || '');
  if (!aktif || c.roles.length !== (r.d.roles || []).length) d.tv = (d.tv || 1) + 1;
  put_('users', r.id, d.sid || '', '', d);
  return { ok: true };
};
ADM.userReset = function (u, req) {
  const r = get_('users', String(req.id || '')); if (!r) fail_('notfound');
  const pw = tempPw_(); const salt = Utilities.getUuid();
  r.d.salt = salt; r.d.hash = hashPw_(pw, salt); r.d.must = true; r.d.tv = (r.d.tv || 1) + 1; put_('users', r.id, r.d.sid || '', '', r.d);
  CacheService.getScriptCache().remove('lf:' + r.d.email);
  return { ok: true, pw: pw };
};
ADM.regApprove = function (u, req) {
  const r = get_('regs', String(req.id || '')); if (!r) fail_('notfound');
  const c = cleanUser_(Object.assign({}, req, { nama: r.d.nama, email: r.d.email, nim: req.nim || r.d.unit }));
  if (!c.roles.length) fail_('invalid', 'Pilih minimal satu peran.');
  const x = createUser_(c, r.d.hash, r.d.salt, false); if (x.err) fail_('invalid', x.err);
  del_('regs', r.id); return { ok: true };
};
ADM.regReject = function (u, req) { del_('regs', String(req.id || '')); return { ok: true }; };

/* ======== PERSETUJUAN PASIEN (halaman publik tanpa data kasus) ======== */
function consentPage_(tok) {
  const ok = /^[a-z0-9]{12,40}$/.test(tok);
  const html = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_top"><title>Persetujuan Pasien</title><style>body{font:16px/1.6 system-ui,sans-serif;margin:0;background:#f3f8fb;color:#16303f}main{max-width:560px;margin:0 auto;padding:28px 20px}h1{font-size:22px;color:#006AB0;margin:0 0 6px}p{margin:12px 0}.card{background:#fff;border-radius:14px;padding:22px;box-shadow:0 1px 6px rgba(0,60,100,.12)}button{font:inherit;font-weight:600;border:0;border-radius:10px;padding:12px 18px;cursor:pointer;margin:6px 8px 0 0}#ya{background:#006AB0;color:#fff}#tdk{background:#e4edf3;color:#16303f}small{color:#5b7280}.ok{color:#0b7a4b;font-weight:600}</style></head><body><main><div class="card"><small>Fakultas Kedokteran Universitas Murni Teguh &middot; RS Murni Teguh Methodist Susanna Wesley</small><h1>Persetujuan penggunaan data kasus untuk pembelajaran</h1>' +
    (ok ? '<div id="isi"><p>Mahasiswa kedokteran yang ikut merawat Anda memohon izin untuk mencatat informasi kesehatan Anda sebagai bahan pembelajaran dalam e-logbook. Nama lengkap Anda tidak dicatat, hanya inisial dan nomor rekam medis yang disimpan terenkripsi.</p><p>Persetujuan ini sukarela. Menolak tidak memengaruhi pelayanan yang Anda terima.</p><button id="ya">Saya setuju</button><button id="tdk">Saya tidak setuju</button></div><p id="hasil"></p>' : '<p>Tautan tidak valid.</p>') +
    '</div></main><script>var t=' + JSON.stringify(tok) + ';function s(m,c){document.getElementById("isi").style.display="none";var h=document.getElementById("hasil");h.textContent=m;h.className=c||""}' +
    (ok ? 'document.getElementById("ya").onclick=function(){google.script.run.withSuccessHandler(function(r){s(r?"Terima kasih. Persetujuan Anda telah tercatat.":"Tautan sudah tidak berlaku.",r?"ok":"")}).withFailureHandler(function(){s("Terjadi kesalahan. Coba lagi.")}).consentApprove(t)};document.getElementById("tdk").onclick=function(){s("Baik, tidak ada data yang dicatat. Terima kasih.")};' : '') + '</script></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Persetujuan Pasien');
}
function consentApprove(tok) {
  tok = String(tok || ''); if (!/^[a-z0-9]{12,40}$/.test(tok)) return false;
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet_('cases'); const n = sh.getLastRow() - 1; if (n < 1) return false;
    const f = sh.getRange(2, 4, n, 1).createTextFinder('"tok":"' + tok + '"').matchEntireCell(false).findNext();
    if (!f) return false;
    const row = f.getRow(); const d = JSON.parse(sh.getRange(row, 4).getValue());
    if (d.tok !== tok) return false;
    d.cons = true; d.consTgl = ts_();
    sh.getRange(row, 4).setValue(JSON.stringify(d)); sh.getRange(row, 5).setValue(ts_());
    return true;
  } finally { lock.releaseLock(); }
}


/* ======== LOGIKA SKOR BERSAMA (dari src/core.js) ======== */
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
