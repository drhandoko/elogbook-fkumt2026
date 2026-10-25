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
