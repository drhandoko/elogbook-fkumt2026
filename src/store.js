/* ================= PENYIMPANAN =================
   Mode demo   : seluruh data di localStorage peramban (API_URL kosong).
   Mode server : data di Google Sheets lewat Google Apps Script. Peramban memegang salinan sesuai peran,
                 perubahan dikirim sebagai selisih (diff) dan setiap baris diperiksa ulang oleh server. */
const ERR = {
  cred: 'Email atau kata sandi tidak cocok.', locked: 'Terlalu banyak percobaan masuk. Coba lagi sekitar 15 menit.', norole: 'Peran Anda belum ditetapkan oleh admin program studi.',
  network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', auth: 'Sesi Anda berakhir. Silakan masuk kembali.', server: 'Terjadi gangguan pada server. Coba lagi sebentar lagi.',
  exists: 'Email ini sudah terdaftar atau sedang menunggu penetapan peran.', weak: 'Kata sandi minimal 8 karakter.', busy: 'Terlalu banyak permintaan. Coba lagi nanti.', forbidden: 'Anda tidak memiliki akses untuk tindakan ini.'
};
const errText = r => (r && (r.msg || ERR[r.err])) || ERR.server;
let TOKEN = '';
try { TOKEN = sessionStorage.getItem('elogbook-token') || ''; } catch (e) { }
const setToken = t => { TOKEN = t || ''; try { if (t) sessionStorage.setItem('elogbook-token', t); else sessionStorage.removeItem('elogbook-token'); } catch (e) { } };
let busyN = 0;
function setBusy(d) { busyN = Math.max(0, busyN + d); const b = document.getElementById('busy'); if (b) b.hidden = busyN === 0; }

async function api(action, data) {
  setBusy(1);
  try {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null; const to = setTimeout(() => { if (ctl) ctl.abort(); }, 90000);
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action, token: TOKEN }, data || {})), signal: ctl ? ctl.signal : undefined });
    clearTimeout(to);
    const j = await res.json();
    if (j && j.err === 'auth' && action !== 'login' && action !== 'logout') sessionExpired();
    return j;
  } catch (e) { return { ok: false, err: 'network' }; }
  finally { setBusy(-1); }
}
function sessionExpired() {
  if(typeof SYNC_STATUS!=='undefined'&&['pending','saving','failed','conflict'].includes(SYNC_STATUS)) {setSyncStatus('failed');toast('Sesi berakhir. Masuk ulang untuk menyimpan perubahan.','warn');return;}
  setToken(''); S = emptyState(); UI.route = 'login'; UI.params = {}; UI.msg = ERR.auth; UI.msgTone = 'bad'; closeModal(true); render();
}

function emptyState() {
  return {
    v: 2, seq: 1, users: [], students: [], cases: [], asms: [], nilai: [], epa: {}, epaLog: [], audit: [], events: [], periods: [], regs: [], ews: [], osce: [], assignments: [],
    stases: STASES.map(x => Object.assign({}, x)), wahana: WAH.slice(0, 1).map(x => Object.assign({}, x)), bobotStase: Object.assign({}, BS), bobotBlok: Object.assign({}, BB),
    replies: {}, bg: {}, bgData: {}, pct: null, session: null
  };
}

/* ---------- Mode demo ---------- */
function loadDemo() {
  let ok = false;
  try { const raw = localStorage.getItem(LS_KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1 && o.cases && o.users) { S = o; ok = true; } } } catch (e) { }
  if (!ok) { seedState(); saveDemo(); }
  if (!S.bgData) S.bgData = {};
}
function saveDemo() { inval(); try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- Mode server: penerapan data dari server ---------- */
const COLL = ['cases', 'asms', 'epaLog', 'nilai', 'ews', 'events', 'periods', 'wahana', 'assignments'];
const idOf = (c, d) => c === 'nilai' ? [d.sid, d.tahap, d.unit, d.komp].join('|').replace(/[^A-Za-z0-9|_-]/g, '_') : d.id;
const SNAP = {};
function osceFromNilai() {
  const by = {};
  S.nilai.filter(n => n.tahap === 'PSPD' && n.komp === 'OSCE').forEach(n => { (by[n.unit] = by[n.unit] || []).push(n); });
  return Object.keys(by).filter(k => stase(k)).map(k => { const l = by[k]; return { id: 'o-' + k, st: k, nama: 'OSCE akhir stase ' + stase(k).pendek, tgl: l.map(x => x.tgl).sort().pop(), peserta: l.length, station: '-', avg: mean(l.map(x => x.v)), pass: l.filter(x => x.v >= 70).length / l.length * 100 }; });
}
function applyState(r) {
  const prev = S || emptyState(); const keepRole = prev.session && prev.session.role;
  const st = emptyState();
  st.users = r.users.map(u => Object.assign({ pw: '' }, u));
  st.assignments = r.assignments || []; st.students = r.students; st.cases = r.cases; st.asms = r.asms; st.epaLog = r.epaLog; st.ews = r.ews; st.audit = r.audit; st.regs = r.regs;
  st.nilai = r.nilai.map(n => Object.assign({}, n, { id: idOf('nilai', n) }));
  st.epa = r.epa || {}; st.events = r.events; st.periods = r.periods; st.replies = r.replies || {};
  if (r.wahana && r.wahana.length) st.wahana = r.wahana;
  st.stases.forEach(s => { const o = (r.stases || []).find(x => x.id === s.id); if (o) { s.minggu = o.minggu; s.tf = o.tf; s.tr = o.tr; } });
  if (r.cfg && r.cfg.bs) st.bobotStase = r.cfg.bs.v; if (r.cfg && r.cfg.bb) st.bobotBlok = r.cfg.bb.v;
  st.students.forEach(s => { if (!st.epa[s.id]) st.epa[s.id] = EPAS.map(() => 1); });
  st.pct = r.pct || null; st.bg = prev.bg || {}; st.bgData = prev.bgData || {}; st.me = r.me;
  const roles = r.me.roles || [];
  st.session = { uid: r.me.id, role: roles.indexOf(keepRole) >= 0 ? keepRole : roles[0] };
  (r.bgAktif || []).forEach(b => { st.bg[b.cid] = { uid: r.me.id, until: b.until }; });
  S = st; S.osce = osceFromNilai(); inval(); takeSnap();
  (r.bgAktif || []).forEach(b => { if (!S.bgData[b.cid]) api('bgGet', { cid: b.cid }).then(x => { if (x.ok) { S.bgData[b.cid] = { ini: x.ini, rm: x.rm }; render(); } }); });
}
function snapStr(c, d) { if (c === 'cases') { const o = Object.assign({}, d); delete o.ini; delete o.rm; return JSON.stringify(o); } return JSON.stringify(d); }
function toDocs() {
  const o = {};
  COLL.forEach(c => { o[c] = {}; (S[c] || []).forEach(d => { if (c === 'nilai') d.id = idOf(c, d); o[c][d.id] = d; }); });
  o.stases = {}; S.stases.forEach(s => { o.stases[s.id] = { id: s.id, minggu: s.minggu, tf: s.tf, tr: s.tr }; });
  o.cfg = { bs: { id: 'bs', v: S.bobotStase }, bb: { id: 'bb', v: S.bobotBlok } };
  o.replies = {}; Object.keys(S.replies || {}).forEach(k => { o.replies[k] = { t: S.replies[k] }; });
  return o;
}
function takeSnap() { const d = toDocs(); Object.keys(SNAP).forEach(k => delete SNAP[k]); Object.keys(d).forEach(c => { SNAP[c] = {}; Object.keys(d[c]).forEach(id => { SNAP[c][id] = snapStr(c, d[c][id]); }); }); }

/* ---------- Mode server: kirim perubahan ---------- */
let syncQ = Promise.resolve(), syncT = null;
function save() {
  if (!SERVER) return saveDemo();
  inval(); setSyncStatus('pending'); clearTimeout(syncT); syncT = setTimeout(pushNow, 150);
}
function pushNow() { clearTimeout(syncT); syncQ = syncQ.then(doPush).catch(e => { console.error(e); }); return syncQ; }
async function doPush() {
  if (!TOKEN || !S || !S.session) return;
  const cur = toDocs(), ops = [], built = [];
  Object.keys(cur).forEach(c => {
    const prev = SNAP[c] || {};
    Object.keys(cur[c]).forEach(id => { const d = cur[c][id], s = snapStr(c, d); if (prev[id] !== s || (c === 'cases' && (d.ini || d.rm))) { ops.push({ c, id, d }); built.push([c, id, s]); } });
    Object.keys(prev).forEach(id => { if (!(id in cur[c])) { ops.push({ c, id, del: 1 }); built.push([c, id, null]); } });
  });
  if (!ops.length) { setSyncStatus('saved'); return; }
  ops.forEach(op => { const prev=SNAP[op.c]&&SNAP[op.c][op.id]; op.rev=prev?(JSON.parse(prev)._rev||0):0; });
  setSyncStatus('saving');
  for (let i = 0; i < ops.length; i += 120) {
    const r = await api('sync', { ops: ops.slice(i, i + 120) });
    if (!r || !r.ok) {
      if (r && r.err === 'auth') { setSyncStatus('failed'); return; }
      setSyncStatus(r && r.err === 'conflict' ? 'conflict' : 'failed'); toast(errText(r) + ' Perubahan tetap ada pada sesi ini. Gunakan Coba lagi.', 'bad'); return;
    }
    if (r.rej && r.rej.length) { setSyncStatus('failed'); toast('Perubahan ditolak. Periksa penugasan dan status data.', 'bad'); return; }
    ops.slice(i, i + 120).forEach((op, k) => {
      const b=built[i+k], doc=r.docs&&r.docs[op.c+':'+op.id];
      if(!SNAP[op.c])SNAP[op.c]={};
      if(b[2]==null){delete SNAP[op.c][op.id];return;}
      const target=Array.isArray(S[op.c])?S[op.c].find(x=>idOf(op.c,x)===op.id):null;
      const unchanged=target&&snapStr(op.c,target)===b[2];
      if(doc&&target){if(unchanged)Object.assign(target,doc);else target._rev=doc._rev;}
      SNAP[op.c][op.id]=doc&&!['stases','cfg','replies'].includes(op.c)?snapStr(op.c,doc):b[2];
    });
    ops.slice(i, i + 120).forEach(op => { if (op.c === 'cases' && op.d) { const c = S.cases.find(x => x.id === op.id); if (c && (op.d.ini || op.d.rm) && c.ini === op.d.ini && c.rm === op.d.rm) { if (c.rm) c.rm2 = String(c.rm).slice(-2); c.ini = ''; c.rm = ''; } } });
  }
  setSyncStatus('saved'); render();
}
async function reload(quiet) {
  if (!TOKEN) return false;
  if (!quiet) await pushNow();
  if (['pending','saving','failed','conflict'].includes(SYNC_STATUS)) { if(!quiet) toast('Selesaikan perubahan yang belum tersimpan sebelum memuat ulang.','warn'); return false; }
  const r = await api('load');
  if (!r || !r.ok) { if (!r || r.err !== 'auth') toast(errText(r), 'bad'); return false; }
  const route = UI.route, params = UI.params; applyState(r);
  UI.route = route; UI.params = params; render(); return true;
}
let lastRefresh = Date.now();
function autoRefresh() {
  if (!SERVER || !TOKEN || !S.session || busyN || ['pending','saving','failed','conflict'].includes(SYNC_STATUS)) return;
  const m = document.getElementById('modal'); const a = document.activeElement; const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  if ((m && !m.hidden) || typing || Date.now() - lastRefresh < 120000) return;
  lastRefresh = Date.now(); reload(true);
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') autoRefresh(); });
  setInterval(autoRefresh, 60000);
}

/* ---------- Masuk, keluar, kata sandi ---------- */
async function serverLogin(email, pw) {
  const r = await api('login', { email, pw });
  if (!r || !r.ok) { UI.msg = errText(r); UI.msgTone = 'bad'; render(); return; }
  setToken(r.token); UI.msg = '';
  await startSession();
}
async function startSession() {
  const r = await api('load');
  if (!r || !r.ok) { setToken(''); UI.msg = errText(r); UI.msgTone = 'bad'; render(); return; }
  applyState(r); lastRefresh = Date.now(); UI.route = NAV[S.session.role][0][0]; UI.params = {}; UI.navOpen = false; window.scrollTo(0, 0); render();
  if (S.me.must) pwForm(true);
}
async function serverLogout() { await pushNow(); if (['pending','saving','failed','conflict'].includes(SYNC_STATUS)) { toast('Ada perubahan belum tersimpan. Selesaikan sebelum keluar.','warn'); return; } await api('logout'); setToken(''); S = emptyState(); UI.route = 'login'; UI.params = {}; UI.navOpen = false; UI.msg = ''; closeModal(true); render(); }
function tempPw() { const cs = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 10; i++) s += cs[Math.floor(Math.random() * cs.length)]; return s; }
function rndTok(n) { n = n || 24; const cs = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; try { const a = new Uint8Array(n); crypto.getRandomValues(a); for (let i = 0; i < n; i++) s += cs[a[i] % 36]; } catch (e) { for (let i = 0; i < n; i++) s += cs[Math.floor(Math.random() * 36)]; } return s; }
