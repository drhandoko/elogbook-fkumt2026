// Uji asap mode demo: semua peran, semua halaman, alur utama. Jalankan: node tests/demo.js (setelah node build.js)
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../dist/elogbook-fragment.html'), 'utf8').replace(/<script src=[^>]*><\/script>/, '');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x.test/' });
const w = dom.window; const errs = [];
w.addEventListener('error', e => errs.push('ERR ' + e.message)); w.console.error = (...a) => errs.push('CE ' + a.map(x => x && x.stack || x).join(' '));
w.scrollTo = () => { }; w.Element.prototype.scrollIntoView = () => { };
const ev = s => w.eval(s);
function chk(tag) {
  const app = w.document.getElementById('app').innerHTML;
  if (/Terjadi kesalahan tampilan/.test(app)) errs.push('RENDERFAIL ' + tag + ': ' + (app.match(/<p class="sub">([^<]*)/) || [])[1]);
  if (/undefined|NaN|\[object/.test(app)) errs.push('UNDEF/NaN in ' + tag + ' : ' + (app.match(/.{40}(undefined|NaN|\[object).{40}/) || [''])[0]);
  if (/AIPKI|Diktisaintek|PUKMPPD|JEJAK/i.test(app)) errs.push('KATA TERLARANG di ' + tag);
}
(async () => {
  chk('awal'); ['login', 'register'].forEach(r => { ev(`go('${r}')`); chk(r); });
  const gateHtml = w.document.getElementById('app').innerHTML;
  ev(`go('login')`);
  const login = w.document.getElementById('app').innerHTML;
  if (/demo\.umt\.test|password123/.test(login)) errs.push('AKUN DEMO TAMPIL DI HALAMAN MASUK TANPA #demo');
  if (!/Logo Fakultas Kedokteran/.test(login) || !/Logo RS Murni Teguh/.test(login)) errs.push('logo tidak tampil');
  w.location.hash = '#demo'; ev('render()');
  if (!/demo\.umt\.test|Mahasiswa Demo 1/.test(w.document.getElementById('app').innerHTML)) errs.push('daftar demo tidak tampil dengan #demo'); else { const first = w.document.getElementById('app').innerHTML; if (/admin\.demo/.test(first) === false) { /* hanya nama, bukan email */ } }
  w.location.hash = '';
  const users = ev(`S.users.filter(u=>u.demo).map(u=>u.email)`);
  for (const email of users) {
    ev(`doLogin(S.users.find(u=>u.email==='${email}'))`);
    for (const r of ev(`me().roles`)) {
      ev(`A.role({dataset:{r:'${r}'}})`);
      for (const p of ev(`NAV['${r}'].map(n=>n[0])`)) {
        ev(`go('${p}')`); chk(email + ':' + r + ':' + p);
        if (r === 'mahasiswa' && p === 'm-port') { ['ringkasan', 'peta', 'nilai', 'entrust'].forEach(t => { ev(`UI.tab.port='${t}'`); ev('render()'); chk('port-' + t); }); ev(`UI.tab.nilai='PSSK'`); ev('render()'); chk('port-pssk'); }
        if (r === 'mahasiswa' && p === 'm-asm') { ev(`UI.tab.asm='dinilai'`); ev('render()'); chk('asm-dinilai'); }
        if (r === 'kaprodi' && p === 'k-pct') { ev(`UI.tab.pct='PSSK'`); ev('render()'); chk('pct-pssk'); }
        if (r === 'admin' && p === 'a-users') { ['pendaftar', 'impor'].forEach(t => { ev(`UI.tab.users='${t}'`); ev('render()'); chk('users-' + t); }); ev(`UI.tab.users='pengguna'`); }
        if (r === 'admin' && p === 'a-curr') { ['bobot', 'epa', 'jenis', 'wahana'].forEach(t => { ev(`UI.tab.curr='${t}'`); ev('render()'); chk('curr-' + t); }); }
        if (r === 'dosen' || r === 'preseptor') { if (p === 'v-validate') { ev(`UI.tab.val='riwayat'`); ev('render()'); chk('val-riw'); } if (p === 'v-assess') { ['epa', 'nilai', 'riwayat'].forEach(t => { ev(`UI.tab.assess='${t}'`); ev('render()'); chk('as-' + t); }); } }
      }
    }
  }
  // modal dasar
  ev(`doLogin(S.users.find(u=>u.email==='mahasiswa1.demo@demo.umt.test'))`);
  [`caseForm()`, `caseDetail(S.cases.find(c=>c.sid==='s1'&&c.stat==='menunggu').id)`, `asmForm()`, `caseDetail(S.cases.find(c=>c.sid==='s1'&&c.stat==='draf').id)`, `pwForm(false)`].forEach(m => { try { ev(m); } catch (e) { errs.push('MODAL ' + m + ' ' + e.message); } });
  ev(`closeModal(true)`);
  // kasus baru
  ev(`caseForm()`); const form = w.document.querySelector('form[data-form=case]');
  form.elements['cf-dx'].value = 'Hipertensi esensial'; form.elements['cf-ini'].value = 'A.B.'; form.elements['cf-rm'].value = '123456';
  ev(`FORMS.case(document.querySelector('form[data-form=case]'),{dataset:{submit:'ajukan'}})`);
  console.log('kasus s1:', ev(`casesOf('s1').length`), 'menunggu', ev(`S.cases.filter(c=>c.sid==='s1'&&c.stat==='menunggu').length`));
  ev(`asmForm()`); ev(`CH['asm-j']()`); ev(`FORMS.asm(document.querySelector('form[data-form=asm]'))`);
  // ganti sandi (demo)
  ev(`pwForm(false)`); let pf = w.document.querySelector('form[data-form=pw]'); pf.elements['pw-old'].value = 'password123'; pf.elements['pw-new'].value = 'sandibaru99'; pf.elements['pw-new2'].value = 'sandibaru99';
  await ev(`FORMS.pw(document.querySelector('form[data-form=pw]'))`); console.log('sandi baru:', ev(`me().pw`));
  // preseptor
  ev(`doLogin(S.users.find(u=>u.email==='preseptor.demo@demo.umt.test'))`);
  ev(`gradeForm(S.asms.find(a=>a.pid==='u-pre'&&a.stat==='menunggu').id)`); ev(`FORMS.grade(document.querySelector('form[data-form=grade]'))`);
  const cid = ev(`S.cases.find(c=>c.pid==='u-pre'&&c.stat==='menunggu').id`);
  ev(`caseDetail('${cid}')`); ev(`A['bg-open']({dataset:{id:'${cid}'}})`);
  const bf = w.document.querySelector('form[data-form=bg]'); bf.elements['bg-r'].value = 'alasan darurat yang cukup panjang'; await ev(`FORMS.bg(document.querySelector('form[data-form=bg]'))`);
  console.log('bg aktif', ev(`bgActive('${cid}')`), 'audit', ev('S.audit.length'));
  ev(`caseDetail('${cid}')`); ev(`FORMS.validate(document.querySelector('form[data-form=validate]'),{dataset:{submit:'valid'}})`); console.log('divalidasi', ev(`S.cases.find(c=>c.id==='${cid}').stat`));
  ev(`epaForm('s1')`); ev(`FORMS.epa(document.querySelector('form[data-form=epa]'))`); ev(`scoreForm()`); ev(`FORMS.score(document.querySelector('form[data-form=score]'))`);
  // kaprodi
  ev(`doLogin(S.users.find(u=>u.email==='kaprodi.demo@demo.umt.test'))`);
  ev(`ewsForm('s3')`); ev(`FORMS.ews(document.querySelector('form[data-form=ews]'))`); ev(`ewsRekForm(S.ews[0].id)`); ev(`FORMS.ewsrek(document.querySelector('form[data-form=ewsrek]'))`); ev(`A.stu({dataset:{id:'s3'}})`); chk('v-student');
  // admin: buat pengguna, reset, impor, ubah
  ev(`doLogin(S.users.find(u=>u.email==='admin.demo@demo.umt.test'))`);
  ev(`periodForm()`); ev(`FORMS.period(document.querySelector('form[data-form=period]'))`); ev(`eventForm()`); ev(`FORMS.event(document.querySelector('form[data-form=event]'))`); ev(`wahForm()`); ev(`FORMS.wahana(document.querySelector('form[data-form=wahana]'))`);
  ev(`go('a-curr')`); ev(`FORMS.stase(document.createElement('form'))`);
  ev(`userForm('')`); let uf = w.document.querySelector('form[data-form=user]'); uf.elements['uf-nama'].value = 'Mahasiswa Baru'; uf.elements['uf-email'].value = 'baru@umt.test'; uf.querySelector('input[value=mahasiswa]').checked = true; uf.elements['uf-nim'].value = 'PD26001'; uf.elements['uf-g'].value = '2';
  await ev(`FORMS.user(document.querySelector('form[data-form=user]'))`);
  const pwNew = ev(`S.users.find(u=>u.email==='baru@umt.test').pw`); console.log('akun baru, sandi sementara', pwNew.length, 'siswa', ev(`studentById(S.users.find(u=>u.email==='baru@umt.test').sid).nim`));
  if (!/Sandi sementara|Akun dibuat/.test(w.document.getElementById('modal').innerHTML)) errs.push('modal sandi sementara tidak muncul');
  ev(`closeModal(true)`);
  ev(`userForm(S.users.find(u=>u.email==='baru@umt.test').id)`); uf = w.document.querySelector('form[data-form=user]'); uf.elements['uf-g'].value = '1'; uf.elements['uf-mulai'].value = '2026-11-02'; await ev(`FORMS.user(document.querySelector('form[data-form=user]'))`);
  console.log('mulai tersimpan', ev(`studentById(S.users.find(u=>u.email==='baru@umt.test').sid).mulai`));
  ev(`A['user-reset']({dataset:{id:S.users.find(u=>u.email==='baru@umt.test').id}})`); await ev(`FORMS.userreset(document.querySelector('form[data-form=userreset]'))`);
  w.document.getElementById('modal'); ev(`closeModal(true)`);
  ev(`go('a-users')`); ev(`UI.tab.users='impor'`); ev('render()');
  w.document.getElementById('ui-t').value = 'nama,email,peran,nim,kelompok,mulai,angkatan\nDr. A,a@umt.test,dosen|preseptor,,,,\nMhs B,b@umt.test,mahasiswa,PD26002,C,2026-12-01,2026\nDup,a@umt.test,dosen,,,,';
  await ev(`FORMS.userimp(document.querySelector('form[data-form=userimp]'))`); console.log('pengguna sekarang', ev('S.users.length'));
  // daftar publik lalu setujui
  ev(`S.session=null`); ev(`go('register')`);
  const rf = w.document.querySelector('form[data-form=register]'); rf.elements['rg-nama'].value = 'Tes Daftar'; rf.elements['rg-email'].value = 'daftar@x.id'; rf.elements['rg-pw'].value = 'abcdefgh1';
  await ev(`FORMS.register(document.querySelector('form[data-form=register]'))`); console.log('pendaftar', ev('S.regs.length'));
  ev(`doLogin(S.users.find(u=>u.email==='admin.demo@demo.umt.test'))`); ev(`A['reg-open']({dataset:{id:S.regs[0].id}})`); await ev(`FORMS.regok(document.querySelector('form[data-form=regok]'))`);
  ev(`doLogin(S.users.find(u=>u.email==='daftar@x.id'))`); chk('siswa baru'); ['m-home', 'm-log', 'm-sched', 'm-asm', 'm-fb', 'm-port'].forEach(p => { ev(`go('${p}')`); chk('baru:' + p); });
  ev(`doLogin(S.users.find(u=>u.email==='baru@umt.test'))`); ['m-home', 'm-sched', 'm-port'].forEach(p => { ev(`go('${p}')`); chk('baru2:' + p); });
  // impor nilai
  ev(`doLogin(S.users.find(u=>u.email==='admin.demo@demo.umt.test'))`); ev(`go('a-import')`);
  w.document.getElementById('imp-text').value = 'nim,tahap,stase,komponen,nilai\nPD25001,PSPD,ipd,OSCE,78\nXX,PSPD,ipd,OSCE,70\nPD25002,PSPD,anak,CBT,82,';
  ev(`FORMS.impparse(document.querySelector('form[data-form=impparse]'))`); chk('imp'); console.log('baris valid', ev(`impValidate().filter(x=>x.ok).length`), 'dari', ev(`impValidate().length`));
  // persistensi demo
  const saved = w.localStorage.getItem('elogbook-umt-profesi-v1'); console.log('disimpan di localStorage:', !!saved, saved ? (saved.length / 1024).toFixed(0) + ' KB' : '');
  console.log(errs.length ? 'GALAT (' + errs.length + '):\n' + errs.slice(0, 15).join('\n') : 'DEMO: 0 galat');
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.log('EXC', e && e.stack || e); process.exit(2); });
