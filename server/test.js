const fs = require('fs'), assert = require('assert');
const { makeRuntime } = require('./mock.js');
let src = fs.readFileSync(__dirname + '/Code.gs', 'utf8');
let pass = 0, failn = 0;
const t = (name, fn) => { try { fn(); pass++; } catch (e) { failn++; console.log('GAGAL:', name, '\n   ', e.message.split('\n')[0]); } };

// setup menolak email contoh
let rt = makeRuntime(src);
t('setup menolak ADMIN_EMAIL contoh', () => assert.throws(() => rt.run('setup()'), /ADMIN_EMAIL/));
src = src.replace("'ganti-dengan-email-admin@contoh.com'", "'admin@umt.test'");
rt = makeRuntime(src);
const { call } = rt;
rt.run('setup()');
const adminPw = (rt.logs.find(l => l.startsWith('Sandi sementara')) || '').split(': ')[1];
t('setup membuat sandi sementara', () => assert.ok(adminPw && adminPw.length === 10));
rt.run('setup()'); // idempotent
t('setup kedua tidak membuat admin ganda', () => assert.strictEqual(rt.sheets.users.data.filter(r => r[0] && r[0] !== 'id').length, 1));

let r = call('login', { email: 'admin@umt.test', pw: 'salah' });
t('login salah ditolak', () => assert.strictEqual(r.err, 'cred'));
r = call('login', { email: 'ADMIN@umt.test', pw: adminPw });
t('login admin ok, wajib ganti sandi', () => { assert.ok(r.ok && r.token); assert.strictEqual(r.must, true); });
let adm = r.token;
t('sync diblokir sebelum ganti sandi', () => assert.strictEqual(call('sync', { token: adm, ops: [] }).err, 'must_change'));
t('admin op diblokir sebelum ganti sandi', () => assert.strictEqual(call('admin', { token: adm, op: 'userCreate', nama: 'x', email: 'x@y.id', roles: ['dosen'] }).err, 'must_change'));
t('sandi baru terlalu pendek ditolak', () => assert.strictEqual(call('chpw', { token: adm, old: adminPw, nw: 'abc' }).err, 'weak'));
t('sandi lama salah ditolak', () => assert.strictEqual(call('chpw', { token: adm, old: 'x', nw: 'SandiBaru123' }).err, 'cred'));
r = call('chpw', { token: adm, old: adminPw, nw: 'SandiBaru123' });
t('ganti sandi ok dan token baru', () => { assert.ok(r.ok && r.token); });
t('token lama tidak berlaku', () => assert.strictEqual(call('load', { token: adm }).err, 'auth'));
adm = r.token;
t('login dengan sandi baru', () => { const x = call('login', { email: 'admin@umt.test', pw: 'SandiBaru123' }); assert.ok(x.ok && x.must === false); });

// buat pengguna
const mk = (o) => { const x = call('admin', Object.assign({ token: adm, op: 'userCreate' }, o)); assert.ok(x.ok, JSON.stringify(x)); return x; };
const today = new Date(); const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const past = new Date(today.getTime() - 20 * 86400000);
const U = {};
U.pre = mk({ nama: 'Dr. Preseptor', email: 'pre@umt.test', roles: ['preseptor'], unit: 'SMF IPD' });
U.pre2 = mk({ nama: 'Dr. Preseptor Dua', email: 'pre2@umt.test', roles: ['preseptor'] });
U.dos = mk({ nama: 'Dr. Dosen', email: 'dos@umt.test', roles: ['dosen'] });
U.kap = mk({ nama: 'Dr. Kaprodi', email: 'kap@umt.test', roles: ['kaprodi'] });
U.a = mk({ nama: 'Mahasiswa A', email: 'a@umt.test', roles: ['mahasiswa'], nim: 'PD001', g: 'B', mulai: iso(past) });
U.b = mk({ nama: 'Mahasiswa B', email: 'b@umt.test', roles: ['mahasiswa'], nim: 'PD002', g: 0, mulai: iso(past) });
t('email ganda ditolak', () => assert.strictEqual(call('admin', { token: adm, op: 'userCreate', nama: 'X', email: 'a@umt.test', roles: ['dosen'] }).err, 'invalid'));
const login = (em, pw, nw) => { let x = call('login', { email: em, pw }); assert.ok(x.ok, JSON.stringify(x)); if (x.must) { x = call('chpw', { token: x.token, old: pw, nw: nw || 'Rahasia1234' }); assert.ok(x.ok); } return x.token; };
const T = {};
T.pre = login('pre@umt.test', U.pre.pw); T.pre2 = login('pre2@umt.test', U.pre2.pw); T.dos = login('dos@umt.test', U.dos.pw); T.kap = login('kap@umt.test', U.kap.pw); T.a = login('a@umt.test', U.a.pw); T.b = login('b@umt.test', U.b.pw);

// load mahasiswa A
let la = call('load', { token: T.a });
t('mahasiswa hanya melihat dirinya', () => { assert.strictEqual(la.students.length, 1); assert.strictEqual(la.students[0].nim, 'PD001'); assert.strictEqual(la.students[0].g, 1); });
t('mahasiswa tidak melihat email atau akun mahasiswa lain', () => { assert.ok(!la.users.some(u => u.id === U.b.id)); la.users.filter(u => u.id !== la.me.id).forEach(u => assert.strictEqual(u.email, undefined)); });
t('mahasiswa tidak menerima antrean pendaftar, audit, atau ews', () => { assert.strictEqual(la.regs.length, 0); assert.strictEqual(la.ews.length, 0); });
t('persentil tersedia untuk mahasiswa', () => assert.ok(la.pct && la.pct[la.me.sid]));
t('epa awal level 1', () => assert.deepStrictEqual(la.epa[la.me.sid], [1, 1, 1, 1, 1, 1, 1, 1, 1]));
const sidA = la.me.sid; const sidB = call('load', { token: T.b }).me.sid;

// kasus
const sync = (tok, ops) => call('sync', { token: tok, ops });
let rr = sync(T.a, [{ c: 'cases', id: 'c1', d: { tgl: iso(today), jenis: 'Kasus', st: 'ipd', wah: 'w0', dx: 'Hipertensi esensial', kat: 'FKTP', sis: 'Kardiovaskular', usia: '55', jk: 'L', ter: 'Membantu', pid: U.pre.id, sum: 'SOAP', ref: '', stat: 'valid', ini: 'AB', rm: '123456' } }]);
t('kasus baru diterima', () => assert.deepStrictEqual(rr.rej, []));
la = call('load', { token: T.a });
const c1 = la.cases.find(c => c.id === 'c1');
t('status valid dipaksa menjadi menunggu', () => assert.strictEqual(c1.stat, 'menunggu'));
t('identitas disamarkan di respons', () => { assert.strictEqual(c1.ini, ''); assert.strictEqual(c1.rm, ''); assert.strictEqual(c1.rm2, '56'); assert.ok(c1.tok); assert.strictEqual(c1.ini_e, undefined); });
t('identitas terenkripsi di lembar data', () => { const all = JSON.stringify(rt.sheets.cases.data); assert.ok(!all.includes('123456')); assert.ok(!all.includes('"ini":"AB"')); assert.ok(all.includes('ini_e')); });
t('mahasiswa tidak dapat memvalidasi kasus sendiri', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'c1', d: { stat: 'valid', fb: 'ok' } }]).rej.length, 1));
t('kasus menunggu tidak dapat diubah pemilik', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'c1', d: { dx: 'ubah', stat: 'menunggu', tgl: iso(today), jenis: 'Kasus', st: 'ipd', pid: U.pre.id } }]).rej.length, 1));
t('mahasiswa B tidak dapat menimpa kasus A', () => assert.strictEqual(sync(T.b, [{ c: 'cases', id: 'c1', d: { tgl: iso(today), jenis: 'Kasus', st: 'ipd', pid: U.pre.id, dx: 'x', stat: 'draf', rm: '99' } }]).rej.length, 1));
t('mahasiswa B tidak melihat kasus A', () => assert.strictEqual(call('load', { token: T.b }).cases.length, 0));
t('mahasiswa tidak dapat menulis nilai', () => assert.strictEqual(sync(T.a, [{ c: 'nilai', id: sidA + '|PSPD|ipd|OSCE', d: { sid: sidA, tahap: 'PSPD', unit: 'ipd', komp: 'OSCE', v: 100 } }]).rej.length, 1));
t('mahasiswa tidak dapat menulis epaLog', () => assert.strictEqual(sync(T.a, [{ c: 'epaLog', id: 'e1', d: { sid: sidA, epa: 0, level: 5, cm: 'x' } }]).rej.length, 1));
t('mahasiswa tidak dapat mengubah wahana atau periode', () => { assert.strictEqual(sync(T.a, [{ c: 'wahana', id: 'wx', d: { nama: 'x' } }]).rej.length, 1); assert.strictEqual(sync(T.a, [{ c: 'periods', id: 'px', d: { nama: 'x' } }]).rej.length, 1); });
t('preseptor yang tidak ditunjuk tidak melihat kasus', () => { const l = call('load', { token: T.pre2 }); assert.strictEqual(l.cases.length, 0); assert.strictEqual(l.students.length, 0); });
t('preseptor ditunjuk melihat kasus dan mahasiswanya', () => { const l = call('load', { token: T.pre }); assert.strictEqual(l.cases.length, 1); assert.strictEqual(l.students.length, 1); assert.strictEqual(l.cases[0].tok, undefined); assert.strictEqual(l.cases[0].ini, ''); });
t('preseptor lain tidak dapat memvalidasi', () => assert.strictEqual(sync(T.pre2, [{ c: 'cases', id: 'c1', d: { stat: 'valid', fb: 'x' } }]).rej.length, 1));
t('dikembalikan tanpa umpan balik ditolak', () => assert.strictEqual(sync(T.pre, [{ c: 'cases', id: 'c1', d: { stat: 'kembali', fb: '' } }]).rej.length, 1));
t('stat tak sah ditolak', () => assert.strictEqual(sync(T.pre, [{ c: 'cases', id: 'c1', d: { stat: 'draf', fb: 'x' } }]).rej.length, 1));

// Break glass
t('Break Glass tanpa alasan memadai ditolak', () => assert.strictEqual(call('bg', { token: T.pre, cid: 'c1', alasan: 'singkat' }).err, 'invalid'));
t('Break Glass oleh yang tidak berhak ditolak', () => assert.strictEqual(call('bg', { token: T.pre2, cid: 'c1', alasan: 'alasan yang cukup panjang sekali' }).err, 'forbidden'));
t('Break Glass mahasiswa lain ditolak', () => assert.strictEqual(call('bg', { token: T.b, cid: 'c1', alasan: 'alasan yang cukup panjang sekali' }).err, 'forbidden'));
let bg = call('bg', { token: T.pre, cid: 'c1', alasan: 'Konfirmasi alergi obat sebelum tindakan' });
t('Break Glass membuka identitas', () => { assert.ok(bg.ok); assert.strictEqual(bg.ini, 'AB'); assert.strictEqual(bg.rm, '123456'); });
t('Break Glass tercatat di audit dan terlihat kaprodi', () => { const l = call('load', { token: T.kap }); assert.strictEqual(l.audit.length, 1); assert.strictEqual(l.audit[0].status, 'Aktif'); const lp = call('load', { token: T.pre }); assert.strictEqual(lp.bgAktif.length, 1); });
t('bgGet saat aktif ok', () => assert.strictEqual(call('bgGet', { token: T.pre, cid: 'c1' }).ini, 'AB'));
t('mahasiswa tidak melihat audit orang lain', () => assert.strictEqual(call('load', { token: T.a }).audit.length, 0));
t('bgEnd mengakhiri sesi', () => { assert.ok(call('bgEnd', { token: T.pre, cid: 'c1' }).ok); assert.strictEqual(call('bgGet', { token: T.pre, cid: 'c1' }).err, 'expired'); assert.strictEqual(call('load', { token: T.kap }).audit[0].status, 'Selesai'); });

// validasi
rr = sync(T.pre, [{ c: 'cases', id: 'c1', d: { stat: 'valid', fb: 'Baik, lengkapi edukasi.', fbTgl: iso(today), dx: 'DIUBAH', sum: 'DIUBAH', pid: U.pre2.id } }]);
t('validasi oleh preseptor ditunjuk diterima', () => assert.deepStrictEqual(rr.rej, []));
la = call('load', { token: T.a });
t('validasi hanya mengubah stat dan umpan balik (bukan isi kasus)', () => { const c = la.cases.find(x => x.id === 'c1'); assert.strictEqual(c.stat, 'valid'); assert.strictEqual(c.fb, 'Baik, lengkapi edukasi.'); assert.strictEqual(c.dx, 'Hipertensi esensial'); assert.strictEqual(c.pid, U.pre.id); assert.strictEqual(c.cons, false); });
t('kasus valid tidak dapat diubah lagi', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'c1', d: { stat: 'draf', tgl: iso(today), jenis: 'Kasus', st: 'ipd', pid: U.pre.id, dx: 'x' } }]).rej.length, 1));
// draf dan hapus
t('draf dibuat lalu dihapus pemilik', () => { assert.deepStrictEqual(sync(T.a, [{ c: 'cases', id: 'c2', d: { tgl: iso(today), jenis: 'Kegiatan', st: 'ipd', pid: U.pre.id, dx: 'Visite', stat: 'draf' } }]).rej, []); assert.deepStrictEqual(sync(T.a, [{ c: 'cases', id: 'c2', del: 1 }]).rej, []); assert.ok(!call('load', { token: T.a }).cases.some(c => c.id === 'c2')); });
t('kasus valid tidak dapat dihapus', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'c1', del: 1 }]).rej.length, 1));
t('kasus dengan preseptor tak dikenal ditolak', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'c3', d: { tgl: iso(today), jenis: 'Kegiatan', st: 'ipd', pid: 'ngawur', dx: 'x', stat: 'draf' } }]).rej.length, 1));
t('kegiatan diajukan langsung valid', () => { sync(T.a, [{ c: 'cases', id: 'c4', d: { tgl: iso(today), jenis: 'Kegiatan', st: 'ipd', pid: U.pre.id, dx: 'Visite', stat: 'menunggu' } }]); assert.strictEqual(call('load', { token: T.a }).cases.find(c => c.id === 'c4').stat, 'valid'); });
t('kasus dikembalikan dapat diperbaiki ulang tanpa menghapus identitas', () => {
  sync(T.a, [{ c: 'cases', id: 'c5', d: { tgl: iso(today), jenis: 'Kasus', st: 'ipd', pid: U.pre.id, dx: 'DM', kat: 'FKTP', stat: 'menunggu', ini: 'CD', rm: '777788' } }]);
  assert.deepStrictEqual(sync(T.pre, [{ c: 'cases', id: 'c5', d: { stat: 'kembali', fb: 'Lengkapi SOAP' } }]).rej, []);
  assert.deepStrictEqual(sync(T.a, [{ c: 'cases', id: 'c5', d: { tgl: iso(today), jenis: 'Kasus', st: 'ipd', pid: U.pre.id, dx: 'DM tipe 2', kat: 'FKTP', stat: 'menunggu', sum: 'lengkap', ini: '', rm: '' } }]).rej, []);
  const c = call('load', { token: T.a }).cases.find(x => x.id === 'c5'); assert.strictEqual(c.stat, 'menunggu'); assert.strictEqual(c.rm2, '88'); assert.strictEqual(c.fb, 'Lengkapi SOAP');
  assert.strictEqual(call('bg', { token: T.pre, cid: 'c5', alasan: 'Verifikasi identitas dengan keluarga' }).rm, '777788');
});

// asesmen
t('asesmen: diminta mahasiswa, dinilai preseptor ditunjuk', () => {
  assert.deepStrictEqual(sync(T.a, [{ c: 'asms', id: 'a1', d: { jenis: 'DOPS', judul: 'DOPS: Pemasangan infus', tgl: iso(today), st: 'ipd', pid: U.pre.id } }]).rej, []);
  assert.strictEqual(sync(T.a, [{ c: 'asms', id: 'a1', d: { sk: [9, 9, 9, 9, 9, 9, 9], kek: 'x', perlu: 'y', renc: 'z' } }]).rej.length, 1);
  assert.strictEqual(sync(T.pre2, [{ c: 'asms', id: 'a1', d: { sk: [5, 5, 5, 5, 5, 5, 5], kek: 'x', perlu: 'y', renc: 'z' } }]).rej.length, 1);
  assert.strictEqual(sync(T.pre, [{ c: 'asms', id: 'a1', d: { sk: [5, 5, 5], kek: 'x', perlu: 'y', renc: 'z' } }]).rej.length, 1);
  assert.deepStrictEqual(sync(T.pre, [{ c: 'asms', id: 'a1', d: { sk: [7, 8, 9, 15, 0, 6, 7], kek: 'x', perlu: 'y', renc: 'z' } }]).rej, []);
  const a = call('load', { token: T.a }).asms.find(x => x.id === 'a1'); assert.strictEqual(a.stat, 'dinilai'); assert.deepStrictEqual(a.sk, [7, 8, 9, 9, 1, 6, 7]);
});
// EPA
t('keputusan EPA memperbarui level', () => {
  assert.strictEqual(sync(T.a, [{ c: 'epaLog', id: 'ee1', d: { sid: sidA, epa: 0, level: 5, cm: 'x' } }]).rej.length, 1);
  assert.deepStrictEqual(sync(T.pre, [{ c: 'epaLog', id: 'ee1', d: { sid: sidA, epa: 2, level: 3, tgl: iso(today), cm: 'Dasar keputusan' } }]).rej, []);
  const l = call('load', { token: T.a }); assert.strictEqual(l.epa[sidA][2], 3); assert.strictEqual(l.epaLog[0].pid, U.pre.id);
  assert.strictEqual(sync(T.pre2, [{ c: 'epaLog', id: 'ee2', d: { sid: sidA, epa: 2, level: 4, cm: 'x' } }]).rej.length, 0, 'preseptor lain boleh menetapkan EPA');
});
// nilai
t('nilai: dosen/kaprodi boleh, id harus sesuai kunci', () => {
  const id = sidA + '|PSPD|ipd|OSCE';
  assert.deepStrictEqual(sync(T.dos, [{ c: 'nilai', id, d: { sid: sidA, tahap: 'PSPD', unit: 'ipd', komp: 'OSCE', v: 78.46, tgl: iso(today) } }]).rej, []);
  assert.strictEqual(sync(T.dos, [{ c: 'nilai', id: 'lain', d: { sid: sidA, tahap: 'PSPD', unit: 'ipd', komp: 'OSCE', v: 80 } }]).rej.length, 1);
  assert.strictEqual(sync(T.dos, [{ c: 'nilai', id, d: { sid: sidA, tahap: 'PSPD', unit: 'ipd', komp: 'OSCE', v: 101 } }]).rej.length, 1);
  assert.strictEqual(sync(T.pre, [{ c: 'nilai', id, d: { sid: sidA, tahap: 'PSPD', unit: 'ipd', komp: 'OSCE', v: 50 } }]).rej.length, 1);
  assert.strictEqual(call('load', { token: T.a }).nilai[0].v, 78.5);
  assert.strictEqual(call('load', { token: T.b }).nilai.length, 0);
});
// ews
t('peringatan dini hanya kaprodi', () => {
  assert.strictEqual(sync(T.dos, [{ c: 'ews', id: 'w1', d: { sid: sidA, kat: 'Akademik', txt: 'x' } }]).rej.length, 1);
  assert.deepStrictEqual(sync(T.kap, [{ c: 'ews', id: 'w1', d: { sid: sidA, kat: 'Akademik', txt: 'catatan', tgl: iso(today) } }]).rej, []);
  assert.strictEqual(call('load', { token: T.a }).ews.length, 0); assert.strictEqual(call('load', { token: T.dos }).ews.length, 0); assert.strictEqual(call('load', { token: T.kap }).ews.length, 1);
  assert.deepStrictEqual(sync(T.kap, [{ c: 'ews', id: 'w1', d: { stat: 'dilaporkan', rek: [{ jenis: 'Pembinaan', txt: 'rencana', target: iso(today), tgl: iso(today) }] } }]).rej, []);
});
// balasan
t('rencana tindak lanjut hanya untuk data sendiri', () => {
  assert.deepStrictEqual(sync(T.a, [{ c: 'replies', id: 'c:c1', d: { t: 'Saya akan membaca pedoman' } }]).rej, []);
  assert.strictEqual(sync(T.b, [{ c: 'replies', id: 'c:c1', d: { t: 'curang' } }]).rej.length, 1);
  assert.strictEqual(call('load', { token: T.a }).replies['c:c1'], 'Saya akan membaca pedoman');
  assert.strictEqual(Object.keys(call('load', { token: T.b }).replies).length, 0);
});
// admin dapat menulis master, lainnya tidak
t('master data: hanya admin', () => {
  assert.deepStrictEqual(sync(adm, [{ c: 'wahana', id: 'w9', d: { nama: 'Puskesmas Contoh', jenis: 'FKTP' } }, { c: 'periods', id: 'p1', d: { nama: 'Ganjil 2026', mulai: '2026-09-01', selesai: '2027-01-31', aktif: true } }, { c: 'stases', id: 'ipd', d: { minggu: 12, tf: 20, tr: 10 } }, { c: 'events', id: 'ev1', d: { jenis: 'OSCE', judul: 'OSCE IPD', st: 'ipd', tgl: iso(today), lokasi: 'Skills Lab', penguji: U.dos.id, kuota: 20 } }]).rej, []);
  assert.strictEqual(sync(adm, [{ c: 'cfg', id: 'bs', d: { v: { CBT: 50 } } }]).rej.length, 1, 'bobot tidak berjumlah 100 ditolak');
  assert.strictEqual(sync(T.dos, [{ c: 'wahana', id: 'w8', d: { nama: 'x' } }]).rej.length, 1);
  const l = call('load', { token: T.a }); assert.ok(l.wahana.some(w => w.id === 'w9')); assert.strictEqual(l.stases.find(s => s.id === 'ipd').minggu, 12);
});
t('hanya admin yang menerima daftar pengguna lengkap dan pendaftar', () => { assert.ok(call('load', { token: adm }).users.every(u => u.email)); assert.strictEqual(call('admin', { token: T.dos, op: 'userCreate', nama: 'x', email: 'x@y.id', roles: ['dosen'] }).err, 'forbidden'); });
t('kaprodi menerima semua mahasiswa tetapi identitas pasien tetap tersamar', () => { const l = call('load', { token: T.kap }); assert.strictEqual(l.students.length, 2); assert.ok(l.cases.every(c => c.ini === '' && c.rm === '' && c.tok === undefined || c.sid === 'x')); });

// pendaftaran publik
t('pendaftaran publik dan persetujuan admin', () => {
  assert.strictEqual(call('register', { nama: 'Calon', email: 'calon@umt.test', pw: 'pendek' }).err, 'weak');
  assert.ok(call('register', { nama: 'Calon Dokter', email: 'calon@umt.test', pw: 'PilihanSaya99', unit: 'PD777', harap: 'mahasiswa' }).ok);
  assert.strictEqual(call('register', { nama: 'Calon Dokter', email: 'calon@umt.test', pw: 'PilihanSaya99' }).err, 'exists');
  assert.strictEqual(call('login', { email: 'calon@umt.test', pw: 'PilihanSaya99' }).err, 'cred', 'belum bisa masuk sebelum disetujui');
  const l = call('load', { token: adm }); assert.strictEqual(l.regs.length, 1); assert.strictEqual(l.regs[0].hash, undefined);
  assert.ok(call('admin', { token: adm, op: 'regApprove', id: l.regs[0].id, roles: ['mahasiswa'], g: 2, mulai: iso(today) }).ok);
  const x = call('login', { email: 'calon@umt.test', pw: 'PilihanSaya99' }); assert.ok(x.ok); assert.strictEqual(x.must, false);
  assert.strictEqual(call('load', { token: x.token }).students[0].nim, 'PD777');
});
t('impor CSV: lewati duplikat, kembalikan sandi sementara', () => {
  const x = call('admin', { token: adm, op: 'userImport', rows: [{ nama: 'M1', email: 'm1@umt.test', roles: ['mahasiswa'], nim: 'PD101', g: 'C' }, { nama: 'Dup', email: 'a@umt.test', roles: ['dosen'] }, { nama: 'D1', email: 'd1@umt.test', roles: ['dosen', 'preseptor'] }, { nama: '', email: 'bad', roles: [] }] });
  assert.strictEqual(x.made.length, 2); assert.strictEqual(x.skip.length, 2); assert.ok(x.made[0].pw.length === 10);
  assert.ok(call('login', { email: 'm1@umt.test', pw: x.made[0].pw }).must);
});
t('reset sandi mencabut sesi lama dan memaksa ganti', () => {
  const x = call('admin', { token: adm, op: 'userReset', id: U.b.id }); assert.ok(x.pw);
  assert.strictEqual(call('load', { token: T.b }).err, 'auth');
  assert.strictEqual(call('login', { email: 'b@umt.test', pw: x.pw }).must, true);
});
t('nonaktifkan pengguna mencabut akses; admin tidak dapat menonaktifkan diri', () => {
  assert.ok(call('admin', { token: adm, op: 'userUpdate', id: U.pre2.id, nama: 'Dr. Preseptor Dua', roles: ['preseptor'], aktif: false }).ok);
  assert.strictEqual(call('load', { token: T.pre2 }).err, 'auth');
  assert.strictEqual(call('login', { email: 'pre2@umt.test', pw: 'Rahasia1234' }).err, 'cred');
  const me = call('load', { token: adm }).me.id;
  assert.strictEqual(call('admin', { token: adm, op: 'userUpdate', id: me, nama: 'Admin', roles: ['admin'], aktif: false }).err, 'self');
  assert.strictEqual(call('admin', { token: adm, op: 'userUpdate', id: me, nama: 'Admin', roles: ['dosen'] }).err, 'self');
});
t('perubahan peran mahasiswa membuat atau memperbarui rekam mahasiswa', () => {
  const l = call('load', { token: adm }); const u = l.users.find(x => x.email === 'dos@umt.test');
  assert.ok(call('admin', { token: adm, op: 'userUpdate', id: u.id, nama: 'Dr. Dosen', roles: ['dosen', 'mahasiswa'], nim: 'PD900', g: 3 }).ok);
  const l2 = call('load', { token: adm }); assert.ok(l2.users.find(x => x.id === u.id).sid); assert.ok(l2.students.some(s => s.nim === 'PD900' && s.g === 3));
});
// pembatasan percobaan
t('penguncian setelah 5 kali gagal', () => {
  for (let i = 0; i < 5; i++) call('login', { email: 'kap@umt.test', pw: 'salah' + i });
  assert.strictEqual(call('login', { email: 'kap@umt.test', pw: 'Rahasia1234' }).err, 'locked');
  rt.cache['lf:kap@umt.test'].exp = 0; assert.ok(call('login', { email: 'kap@umt.test', pw: 'Rahasia1234' }).ok);
});
// persetujuan
t('persetujuan pasien lewat tautan memperbarui kasus', () => {
  const tok = call('load', { token: T.a }).cases.find(c => c.id === 'c1').tok;
  assert.strictEqual(rt.ctx.consentApprove('tidakada1234567890'), false);
  assert.strictEqual(rt.ctx.consentApprove(tok), true);
  assert.strictEqual(call('load', { token: T.a }).cases.find(c => c.id === 'c1').cons, true);
  assert.strictEqual(rt.ctx.consentApprove("x'];drop"), false);
  const pg = rt.ctx.doGet({ parameter: { consent: tok } }); assert.ok(pg.html.includes('Persetujuan') && !pg.html.includes('Hipertensi'));
});
t('permintaan tak sah ditolak', () => {
  assert.strictEqual(call('load', {}).err, 'auth'); assert.strictEqual(call('load', { token: 'x'.repeat(50) }).err, 'auth'); assert.strictEqual(call('nonsense').err, 'unknown_action');
  assert.strictEqual(call('sync', { token: T.a, ops: [{ c: '__proto__', id: 'zz', d: {} }, { c: 'constructor', id: 'zz' }, { c: 'users', id: 'zz', d: { roles: ['admin'] } }, { c: 'audit', id: 'zz', del: 1 }] }).rej.length, 4);
  const out = rt.ctx.doPost({ postData: { contents: '{bukan json' } }); assert.strictEqual(JSON.parse(out.getContent()).err, 'bad_request');
});
t('dokumen terlalu besar ditolak', () => assert.strictEqual(sync(T.a, [{ c: 'cases', id: 'cbig', d: { tgl: iso(today), jenis: 'Kegiatan', st: 'ipd', pid: U.pre.id, dx: 'x', sum: 'a'.repeat(100000), stat: 'draf' } }]).rej.length, 0, 'dipotong ke batas'));
t('sandi tidak pernah dikirim ke klien', () => { const s = JSON.stringify(call('load', { token: adm })); assert.ok(!/"hash"|"salt"|"pw"/.test(s)); });
t('enkripsi: dua enkripsi teks sama berbeda, dekripsi kembali', () => { const a = rt.ctx.enc_('RM-123 é'), b = rt.ctx.enc_('RM-123 é'); assert.notStrictEqual(a, b); assert.strictEqual(rt.ctx.dec_(a), 'RM-123 é'); assert.strictEqual(rt.ctx.dec_(a.replace(/\.[^.]*$/, '.AAAA')), ''); });

console.log('\nServer: ' + pass + ' lulus, ' + failn + ' gagal');
process.exit(failn ? 1 : 0);
