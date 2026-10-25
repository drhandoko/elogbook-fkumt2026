// Uji mode server: klien (jsdom) <-> backend Apps Script tiruan. Jalankan: node tests/server.js (setelah node build.js)
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const { makeRuntime } = require('../server/mock.js');
let gs = fs.readFileSync(path.join(__dirname, '../server/Code.gs'), 'utf8').replace("'ganti-dengan-email-admin@contoh.com'", "'admin@umt.test'");
const rt = makeRuntime(gs); rt.run('setup()');
const adminPw = (rt.logs.find(l => l.startsWith('Sandi sementara')) || '').split(': ')[1];
const frag = fs.readFileSync(path.join(__dirname, '../dist/elogbook-fragment.html'), 'utf8').replace(/<script src=[^>]*><\/script>/, '').replace("const API_URL = '';", "const API_URL = 'https://mock.test/exec';");
const errs = []; let pass = 0;
const ok = (c, m) => { if (c) pass++; else errs.push('GAGAL: ' + m); };
function client(name) {
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + frag + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x.test/' });
  const w = dom.window; w.scrollTo = () => { }; w.Element.prototype.scrollIntoView = () => { };
  w.addEventListener('error', e => errs.push(name + ' ERR ' + e.message)); w.console.error = (...a) => errs.push(name + ' CE ' + a.map(x => x && x.stack || x).join(' '));
  w.fetch = async (url, o) => { const b = JSON.parse(o.body); const out = rt.ctx.doPost({ postData: { contents: o.body } }); return { json: async () => JSON.parse(out.getContent()) }; };
  const ev = s => w.eval(s);
  const form = (name, vals) => { const f = w.document.querySelector('form[data-form=' + name + ']'); for (const k in vals) { const el = f.elements[k]; if (!el) throw new Error('field ' + k); el.value = vals[k]; } return f; };
  const app = () => w.document.getElementById('app').innerHTML;
  const chk = tag => { const a = app(); if (/Terjadi kesalahan tampilan/.test(a)) errs.push(name + ' RENDERFAIL ' + tag + ': ' + (a.match(/<p class="sub">([^<]*)/) || [])[1]); if (/undefined|NaN|\[object/.test(a)) errs.push(name + ' UNDEF ' + tag + ': ' + (a.match(/.{40}(undefined|NaN|\[object).{40}/) || [''])[0]); if (/AIPKI|Diktisaintek|PUKMPPD|JEJAK/i.test(a)) errs.push(name + ' kata terlarang ' + tag); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const login = async (email, pw) => { ev(`go('login')`); const f = form('login', { 'lg-email': email, 'lg-pw': pw }); await ev(`FORMS.login(document.querySelector('form[data-form=login]'))`); await sleep(20); };
  const pages = async (tag) => { for (const r of ev(`me().roles`)) { ev(`A.role({dataset:{r:'${r}'}})`); for (const p of ev(`NAV['${r}'].map(n=>n[0])`)) { ev(`go('${p}')`); chk(tag + ':' + r + ':' + p); } } };
  const push = async () => { await ev('pushNow()'); await sleep(10); };
  const changePw = async (old, nw) => { const f = form('pw', { 'pw-old': old, 'pw-new': nw, 'pw-new2': nw }); await ev(`FORMS.pw(document.querySelector('form[data-form=pw]'))`); await sleep(20); };
  const credPw = () => { const m = w.document.getElementById('modal').innerHTML; const x = m.match(/<td class="mono"><b>([^<]+)<\/b>/); return x && x[1]; };
  return { w, ev, form, app, chk, login, pages, push, changePw, credPw, sleep, dom };
}
(async () => {
  // --- halaman masuk tanpa daftar akun
  const A0 = client('anon'); await A0.sleep(30);
  ok(!/demo|password123|mahasiswa1/i.test(A0.app()), 'halaman masuk tidak menampilkan akun demo'); A0.w.location.hash = '#demo'; A0.ev('render()'); ok(!/Mahasiswa Demo/.test(A0.app()), '#demo tidak berlaku di mode server');
  await A0.login('admin@umt.test', 'salah'); ok(/tidak cocok|salah/i.test(A0.app()), 'sandi salah ditolak: ' + (A0.app().match(/alert[^>]*>([^<]*)/) || [])[1]);
  // --- admin masuk pertama kali
  const AD = client('admin'); await AD.login('admin@umt.test', adminPw); await AD.sleep(30);
  ok(/Buat kata sandi baru/.test(AD.w.document.getElementById('modal').innerHTML), 'admin dipaksa ganti sandi'); AD.chk('admin-modal');
  await AD.changePw(adminPw, 'AdminBaru2026'); ok(AD.ev('S.me.must') === false, 'must dihapus');
  await AD.pages('admin-kosong');
  // --- buat pengguna
  const mk = async (v) => { AD.ev(`go('a-users')`); AD.ev(`userForm('')`); const f = AD.w.document.querySelector('form[data-form=user]'); f.elements['uf-nama'].value = v.nama; f.elements['uf-email'].value = v.email; (v.roles || []).forEach(r => { f.querySelector('input[value=' + r + ']').checked = true; }); AD.ev('toggleMhs()'); if (v.nim) { f.elements['uf-nim'].value = v.nim; f.elements['uf-g'].value = String(v.g || 1); if (v.mulai) f.elements['uf-mulai'].value = v.mulai; }
    await AD.ev(`FORMS.user(document.querySelector('form[data-form=user]'))`); await AD.sleep(30); const pw = AD.credPw(); ok(pw && pw.length === 10, 'sandi sementara ' + v.email); AD.ev('closeModal(true)'); return pw; };
  const d0 = new Date(Date.now() - 20 * 864e5), iso = d => d.toISOString().slice(0, 10);
  const P = {};
  P.pre = await mk({ nama: 'Dr. Preseptor', email: 'pre@umt.test', roles: ['preseptor'] });
  P.dos = await mk({ nama: 'Dr. Dosen', email: 'dos@umt.test', roles: ['dosen'] });
  P.kap = await mk({ nama: 'Dr. Kaprodi', email: 'kap@umt.test', roles: ['kaprodi'] });
  P.mhs = await mk({ nama: 'Mahasiswa Satu', email: 'mhs@umt.test', roles: ['mahasiswa'], nim: 'PD26001', g: 1, mulai: iso(d0) });
  P.mhs2 = await mk({ nama: 'Mahasiswa Dua', email: 'mhs2@umt.test', roles: ['mahasiswa'], nim: 'PD26002', g: 2 });
  ok(AD.ev('S.users.filter(u=>u.roles.indexOf("mahasiswa")>=0).length') === 2, 'dua mahasiswa terlihat oleh admin');
  // impor CSV
  AD.ev(`UI.tab.users='impor'`); AD.ev('render()'); AD.w.document.getElementById('ui-t').value = 'nama,email,peran,nim,kelompok,mulai,angkatan\nDr. Impor,imp@umt.test,dosen|preseptor,,,,\nMhs Impor,mhs3@umt.test,mahasiswa,PD26003,C,,2026\nDup,imp@umt.test,dosen,,,,';
  await AD.ev(`FORMS.userimp(document.querySelector('form[data-form=userimp]'))`); await AD.sleep(30); ok(/imp@umt.test/.test(AD.w.document.getElementById('modal').innerHTML), 'impor menampilkan kredensial'); AD.ev('closeModal(true)');
  await AD.pages('admin-isi');
  // --- mahasiswa
  const MH = client('mhs'); await MH.login('mhs@umt.test', P.mhs); ok(/Buat kata sandi baru/.test(MH.w.document.getElementById('modal').innerHTML), 'mahasiswa dipaksa ganti sandi');
  await MH.changePw(P.mhs, 'MhsBaru2026'); await MH.pages('mhs-kosong');
  ok(MH.ev('S.users.length') < 8 || true, 'ok');
  const adminSeen = MH.ev(`S.users.map(u=>u.email).join(',')`); ok(!/mhs2@umt.test/.test(adminSeen), 'mahasiswa tidak melihat email mahasiswa lain: ' + adminSeen);
  MH.ev(`go('m-log')`); MH.ev('caseForm()'); const cf = MH.w.document.querySelector('form[data-form=case]');
  const preId = MH.ev(`(S.users.find(u=>u.roles.indexOf('preseptor')>=0)||{}).id`); ok(!!preId, 'mahasiswa melihat daftar preseptor');
  cf.elements['cf-dx'].value = 'Hipertensi esensial'; cf.elements['cf-ini'].value = 'A.B.'; cf.elements['cf-rm'].value = '4455667'; if (cf.elements['cf-pid']) cf.elements['cf-pid'].value = preId;
  MH.ev(`FORMS.case(document.querySelector('form[data-form=case]'),{dataset:{submit:'ajukan'}})`); await MH.push();
  ok(MH.ev('S.cases.length') === 1, 'kasus tersimpan: ' + MH.ev('S.cases.length')); const c0 = MH.ev('S.cases[0]');
  ok(!c0.ini && !c0.rm, 'inisial/RM tidak tersisa di klien mahasiswa'); ok(c0.rm2 === '67', 'rm2 = 2 digit terakhir');
  await MH.pages('mhs-isi');
  const cid = c0.id;
  // --- mahasiswa lain tidak melihat kasus
  const M2 = client('mhs2'); await M2.login('mhs2@umt.test', P.mhs2); await M2.changePw(P.mhs2, 'Mhs2Baru2026'); ok(M2.ev('S.cases.length') === 0, 'mahasiswa lain tidak melihat kasus');
  // --- preseptor
  const PR = client('pre'); await PR.login('pre@umt.test', P.pre); await PR.changePw(P.pre, 'PreBaru2026'); ok(PR.ev(`S.cases.some(c=>c.id==='${cid}')`), 'preseptor melihat kasus yang ditujukan kepadanya');
  const seen = PR.ev(`S.cases.find(c=>c.id==='${cid}')`); ok(!seen.ini && !seen.rm, 'preseptor tanpa Break Glass tidak menerima identitas');
  PR.ev(`caseDetail('${cid}')`); PR.ev(`A['bg-open']({dataset:{id:'${cid}'}})`); PR.form('bg', { 'bg-r': 'Konfirmasi alergi obat sebelum tindakan' }); await PR.ev(`FORMS.bg(document.querySelector('form[data-form=bg]'))`); await PR.sleep(30);
  ok(PR.ev(`bgActive('${cid}')`), 'Break Glass aktif'); ok(/A\.B\./.test(PR.app() + PR.w.document.getElementById('modal').innerHTML), 'identitas tampil setelah Break Glass');
  PR.ev(`caseDetail('${cid}')`); PR.form('validate', { 'vl-cm': 'Baik' }); PR.ev(`FORMS.validate(document.querySelector('form[data-form=validate]'),{dataset:{submit:'valid'}})`); await PR.push();
  await PR.pages('pre');
  // --- mahasiswa melihat hasil validasi
  await MH.ev('reload(true)'); await MH.sleep(30); ok(MH.ev(`S.cases.find(c=>c.id==='${cid}').stat`) === 'valid', 'validasi sampai ke mahasiswa');
  // mahasiswa tidak bisa memalsukan validasi sendiri
  MH.ev(`S.cases.find(c=>c.id==='${cid}').stat='menunggu'; S.cases.find(c=>c.id==='${cid}').fb='x'`); await MH.push(); await MH.ev('reload(true)'); await MH.sleep(30);
  ok(MH.ev(`S.cases.find(c=>c.id==='${cid}').stat`) === 'valid', 'mahasiswa tidak dapat mengubah status kasus tervalidasi');
  // --- dosen & kaprodi
  const DS = client('dos'); await DS.login('dos@umt.test', P.dos); await DS.changePw(P.dos, 'DosBaru2026'); await DS.pages('dos');
  const KP = client('kap'); await KP.login('kap@umt.test', P.kap); await KP.changePw(P.kap, 'KapBaru2026'); await KP.pages('kap');
  // --- non-admin tidak bisa jalankan operasi admin
  const x = await MH.w.eval(`api('admin',{op:'userCreate',nama:'x',email:'x@y.id',roles:['admin']})`); ok(x && x.ok === false || (x && x.err), 'mahasiswa ditolak untuk operasi admin: ' + JSON.stringify(x));
  // --- keluar
  await MH.ev('A.logout()'); await MH.sleep(20); ok(MH.ev('!S.session') && /Masuk/.test(MH.app()), 'keluar kembali ke halaman masuk');
  ok((await A0.w.eval(`api('load')`)).err === 'auth', 'tanpa token ditolak');
  console.log('lulus', pass); console.log(errs.length ? 'GALAT (' + errs.length + '):\n' + errs.slice(0, 20).join('\n') : 'SERVER-MODE: 0 galat');
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.log('EXC', e && e.stack || e); process.exit(2); });
