/* ---------- Seed ---------- */
function fitSum(vals, target, lo, hi, r) {
  let sum = vals.reduce((a, b) => a + b, 0), g = 0;
  while (sum !== target && g++ < 5000) {
    const i = Math.floor(r() * vals.length);
    if (sum < target && vals[i] < hi) { vals[i]++; sum++; } else if (sum > target && vals[i] > lo) { vals[i]--; sum--; }
  }
  return vals;
}
function mkCase(r, st, stId, d, o) {
  o = o || {};
  const jenis = o.jenis || 'Kasus';
  const dxp = o.dx || pick(r, DX[stId]);
  const days = dayDiff(T0, d);
  let stat = o.stat;
  if (!stat) {
    const x = r();
    if (days <= 12) stat = x < .35 ? 'valid' : x < .8 ? 'menunggu' : x < .92 ? 'draf' : 'kembali';
    else stat = x < .95 ? 'valid' : x < .98 ? 'kembali' : 'draf';
  }
  if (jenis !== 'Kasus' && stat === 'menunggu') stat = 'valid';
  const pr = r();
  const pid = pr < .5 ? 'u-pre' : pr < .65 ? 'u-multi' : pr < .75 ? 'u-dosen' : pick(r, PRES_EXTRA).id;
  const it = sched(st).find(x => x.id === stId);
  const c = {
    id: 'c' + (S.seq++), sid: st.id, tgl: iso(d), st: stId, wah: it ? it.wah : 'w0', jenis,
    dx: jenis === 'Kasus' ? dxp[0] : jenis === 'Kegiatan' ? pick(r, KEGIATAN) : 'Refleksi pembelajaran minggu ini',
    kat: jenis === 'Kasus' ? dxp[1] : '', sis: jenis === 'Kasus' ? dxp[2] : '',
    usia: Math.floor(1 + r() * 75), jk: r() < .5 ? 'L' : 'P',
    ini: String.fromCharCode(65 + Math.floor(r() * 26)) + '.' + String.fromCharCode(65 + Math.floor(r() * 26)) + '.',
    rm: String(100000 + Math.floor(r() * 899999)),
    ter: pick(r, KETERLIBATAN), pid, stat,
    sum: jenis === 'Kasus' ? dxp[0] + ': anamnesis dan pemeriksaan fisik terarah, usulan pemeriksaan penunjang, tata laksana awal, dan edukasi pasien.' : (jenis === 'Kegiatan' ? 'Kegiatan klinis dicatat sebagai bagian pembelajaran harian.' : ''),
    ref: r() < .22 ? pick(r, POOL_REF) : '', fb: '', fbTgl: '', cons: jenis === 'Kasus' ? (stat !== 'draf' ? true : r() < .5) : false, tok: Math.floor(r() * 1e9).toString(36)
  };
  if (stat === 'valid' && r() < .35) { c.fb = pick(r, POOL_FB); c.fbTgl = iso(addD(d, 1 + Math.floor(r() * 3))); }
  if (stat === 'kembali') { c.fb = pick(r, POOL_RET); c.fbTgl = iso(addD(d, 2)); c.cons = r() < .5; }
  return c;
}
function seedState() {
  const rng = RNG(20261025);
  S = { v: 1, seq: 5000, users: [], students: [], cases: [], asms: [], nilai: [], epa: {}, epaLog: [], audit: [], events: [], periods: [], regs: [], ews: [], osce: [], stases: STASES.map(x => Object.assign({}, x)), wahana: WAH.map(x => Object.assign({}, x)), bobotStase: Object.assign({}, BS), bobotBlok: Object.assign({}, BB), replies: {}, bg: {}, session: null };
  const NAMES = ['Aulia R.', 'Bima S.', 'Citra D.', 'Dimas P.', 'Elisabet T.', 'Farhan A.', 'Grace M.', 'Hendra L.', 'Intan K.', 'Joshua N.', 'Kevin S.', 'Livia H.', 'Marcel B.', 'Nadia F.', 'Obed G.', 'Putri W.'];
  S.students.push({ id: 's1', nama: 'Mahasiswa Demo 1', nim: 'PD25001', g: 0, mu: 7.4, rate: 3.8, angk: '2025' });
  S.students.push({ id: 's2', nama: 'Mahasiswa Demo 2', nim: 'PD25002', g: 1, mu: 6.6, rate: 1.6, angk: '2025' });
  NAMES.forEach((n, i) => S.students.push({ id: 's' + (i + 3), nama: n, nim: 'PD25' + String(i + 3).padStart(3, '0'), g: (i + 2) % 4, mu: Math.round((5.4 + rng() * 2.6) * 10) / 10, rate: Math.round((1.4 + rng() * 2.2) * 10) / 10, angk: '2025' }));
  const U = (id, nama, email, roles, unit, sid) => S.users.push({ id, nama, email, roles, pw: DEMO_PW, unit, sid: sid || null, demo: true });
  U('u-admin', 'Admin Prodi Demo', 'admin.demo@demo.umt.test', ['admin'], 'Program Studi Profesi Dokter');
  U('u-dosen', 'Dosen Demo', 'dosen.demo@demo.umt.test', ['dosen'], 'Fakultas Kedokteran UMT');
  U('u-pre', 'Preseptor Demo', 'preseptor.demo@demo.umt.test', ['preseptor'], 'SMF Ilmu Penyakit Dalam, ' + RSPU);
  U('u-kaprodi', 'Kaprodi Demo', 'kaprodi.demo@demo.umt.test', ['kaprodi'], 'Program Studi Profesi Dokter');
  U('u-multi', 'Multirole Demo', 'multirole.demo@demo.umt.test', ['dosen', 'preseptor', 'kaprodi'], 'Fakultas Kedokteran UMT dan ' + RSPU);
  U('u-m1', 'Mahasiswa Demo 1', 'mahasiswa1.demo@demo.umt.test', ['mahasiswa'], 'Profesi Dokter angkatan 2025', 's1');
  U('u-m2', 'Mahasiswa Demo 2', 'mahasiswa2.demo@demo.umt.test', ['mahasiswa'], 'Profesi Dokter angkatan 2025', 's2');

  const monthStart = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const rd = (a, b) => addD(a, Math.floor(rng() * Math.max(1, dayDiff(b, a) + 1)));
  S.students.forEach(st => {
    const sc = sched(st).filter(x => x.start <= T0).map(x => ({ id: x.id, start: x.start, end: x.end < T0 ? x.end : T0 }));
    const tot = sc.reduce((t, x) => t + dayDiff(x.end, x.start) + 1, 0);
    const wpick = () => { let v = rng() * tot; for (const x of sc) { v -= dayDiff(x.end, x.start) + 1; if (v <= 0) return x; } return sc[sc.length - 1]; };
    const out = [];
    if (st.id === 's1') {
      const ipd = sc.find(x => x.id === 'ipd');
      const fk = DX.ipd.filter(x => x[1] === 'FKTP'), fr = DX.ipd.filter(x => x[1] === 'FKRTL');
      const recStart = ipd.start > monthStart ? ipd.start : monthStart;
      for (let i = 0; i < 10; i++) out.push(mkCase(rng, st, 'ipd', rd(ipd.start, addD(monthStart, -1)), { dx: pick(rng, fk), stat: 'valid' }));
      for (let i = 0; i < 12; i++) {
        let o;
        if (i < 8) o = { dx: pick(rng, fk), stat: 'valid' }; else if (i < 10) o = { dx: pick(rng, fk), stat: 'menunggu' }; else if (i === 10) o = { dx: pick(rng, fr), stat: 'draf' }; else o = { dx: pick(rng, fr), stat: 'kembali' };
        out.push(mkCase(rng, st, 'ipd', rd(recStart, T0), o));
      }
      const others = sc.filter(x => x.id !== 'ipd');
      for (let i = 0; i < 106; i++) { const x = others[Math.floor(rng() * others.length)]; out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { stat: 'valid' })); }
      for (let i = 0; i < 9; i++) { const x = others[Math.floor(rng() * others.length)]; out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { jenis: i % 3 === 0 ? 'Refleksi' : 'Kegiatan', stat: 'valid' })); }
    } else {
      const N = Math.round(st.rate * 34);
      for (let i = 0; i < N; i++) { const x = wpick(); out.push(mkCase(rng, st, x.id, rd(x.start, x.end), { jenis: rng() < .08 ? 'Kegiatan' : (rng() < .05 ? 'Refleksi' : 'Kasus') })); }
    }
    out.forEach(c => S.cases.push(c));
  });
  // asesmen
  const mkAsm = (st, jenis, judul, d, stId, pid, stat, sk) => ({ id: 'a' + (S.seq++), sid: st.id, jenis, judul, tgl: iso(d), st: stId, pid, stat, sk: sk || null, kek: sk ? pick(rng, POOL_KEK) : '', perlu: sk ? pick(rng, POOL_PERLU) : '', renc: sk ? pick(rng, POOL_RENC) : '' });
  S.students.forEach(st => {
    inval();
    const sc = sched(st).filter(x => x.start <= T0).map(x => ({ id: x.id, start: x.start, end: x.end < T0 ? x.end : T0 }));
    const miniN = st.id === 's1' ? 8 : 4 + Math.floor(rng() * 6), dopsN = st.id === 's1' ? 6 : 3 + Math.floor(rng() * 4);
    const mk = (n, dom, jenis) => {
      let vals = []; for (let i = 0; i < n * dom.length; i++) vals.push(clamp(Math.round(st.mu + (rng() - .5) * 3), 3, 9));
      vals = fitSum(vals, Math.round(st.mu * vals.length), 3, 9, rng);
      for (let i = 0; i < n; i++) {
        const x = sc[Math.floor(rng() * sc.length)]; const d = rd(x.start, x.end); const dx = pick(rng, DX[x.id]);
        const judul = jenis === 'Mini-CEX' ? 'Mini-CEX: ' + dx[0] : 'DOPS: ' + pick(rng, PROSEDUR);
        S.asms.push(mkAsm(st, jenis, judul, d, x.id, rng() < .6 ? 'u-pre' : pick(rng, PRES_EXTRA.concat([{ id: 'u-multi' }, { id: 'u-dosen' }])).id, 'dinilai', vals.slice(i * dom.length, (i + 1) * dom.length)));
      }
    };
    mk(miniN, MC_DOM, 'Mini-CEX'); mk(dopsN, DP_DOM, 'DOPS');
    if (st.id === 's1') S.asms.push(mkAsm(st, 'DOPS', 'DOPS: Pemasangan infus', addD(T0, -2), 'ipd', 'u-pre', 'menunggu'));
    else { const np = Math.floor(rng() * 3); for (let i = 0; i < np; i++) { const x = sc[sc.length - 1]; S.asms.push(mkAsm(st, i % 2 ? 'Mini-CEX' : 'DOPS', (i % 2 ? 'Mini-CEX: ' : 'DOPS: ') + (i % 2 ? pick(rng, DX[x.id])[0] : pick(rng, PROSEDUR)), addD(T0, -Math.floor(rng() * 6)), x.id, pick(rng, [{ id: 'u-pre' }, { id: 'u-multi' }, { id: 'u-dosen' }]).id, 'menunggu')); } }
    // EPA
    const lv = EPAS.map(() => clamp(Math.round(st.mu / 2.2 + (rng() - .5) * 1.6), 1, 5));
    if (st.id === 's1') { lv[0] = 4; lv[1] = 3; lv[4] = 2; }
    S.epa[st.id] = lv;
    // nilai
    const base = 55 + (st.mu - 5) * 8;
    PSSK_BLOK.forEach(b => Object.keys(S.bobotBlok).forEach(k => S.nilai.push({ sid: st.id, tahap: 'PSSK', unit: b, komp: k, v: clamp(Math.round(base + (rng() - .5) * 16), 40, 98), tgl: iso(addD(T0, -600 + Math.floor(rng() * 200))) })));
    sched(st).filter(x => x.start <= T0).forEach(x => {
      const done = x.end < T0;
      ['CBT', 'OSCE', 'CBD', 'MSF'].forEach(k => { if (done || (k === 'MSF' && rng() < .4)) S.nilai.push({ sid: st.id, tahap: 'PSPD', unit: x.id, komp: k, v: clamp(Math.round(base + (rng() - .5) * 16), 40, 98), tgl: iso(addD(x.end, -2)) }); });
    });
  });
  inval();
  S.epaLog.push({ id: 'e1', sid: 's1', epa: 0, level: 4, tgl: iso(addD(T0, -40)), pid: 'u-pre', cm: 'Anamnesis mandiri pada kasus tidak kompleks, supervisi dari jauh.' });
  S.epaLog.push({ id: 'e2', sid: 's1', epa: 1, level: 3, tgl: iso(addD(T0, -20)), pid: 'u-pre', cm: 'Pemeriksaan fisik sistematis, preseptor tersedia di dekat.' });
  S.epaLog.push({ id: 'e3', sid: 's1', epa: 4, level: 2, tgl: iso(addD(T0, -9)), pid: 'u-multi', cm: 'Rencana tata laksana masih perlu dikoreksi pada dosis dan kontraindikasi.' });
  S.periods = [
    { id: 'pa3', nama: 'Semester Ganjil 2026/2027', mulai: '2026-09-01', selesai: '2027-01-31', aktif: true },
    { id: 'pa2', nama: 'Semester Genap 2025/2026', mulai: '2026-02-01', selesai: '2026-07-31', aktif: false },
    { id: 'pa1', nama: 'Semester Ganjil 2025/2026', mulai: '2025-09-01', selesai: '2026-01-31', aktif: false }
  ];
  S.events = [
    { id: 'ev1', jenis: 'OSCE', judul: 'OSCE akhir stase Ilmu Penyakit Dalam', st: 'ipd', tgl: iso(addD(T0, 12)), lokasi: 'Skills Lab FK UMT', penguji: 'u-dosen', kuota: 20, status: 'Dijadwalkan' },
    { id: 'ev2', jenis: 'CBT', judul: 'CBT komprehensif tahap profesi', st: '', tgl: iso(addD(T0, 26)), lokasi: 'Laboratorium komputer FK UMT', penguji: 'u-multi', kuota: 40, status: 'Dijadwalkan' },
    { id: 'ev3', jenis: 'Ujian Lisan', judul: 'Ujian lisan stase Ilmu Bedah', st: 'bedah', tgl: iso(addD(T0, -15)), lokasi: RSPU, penguji: 'u-pre', kuota: 12, status: 'Selesai' }
  ];
  S.ews = [
    { id: 'w1', sid: 's6', kat: 'Kesejahteraan', oleh: 'u-pre', tgl: iso(addD(T0, -12)), txt: 'Mahasiswa melaporkan kelelahan setelah rangkaian jaga malam berturut-turut dan kesulitan menjaga ritme belajar.', stat: 'antrean', rek: [] },
    { id: 'w2', sid: 's11', kat: 'Akademik', oleh: 'u-dosen', tgl: iso(addD(T0, -8)), txt: 'Dua Mini-CEX berturut-turut di bawah harapan tahap pada domain penalaran klinis.', stat: 'antrean', rek: [] },
    { id: 'w3', sid: 's14', kat: 'Profesionalisme', oleh: 'u-multi', tgl: iso(addD(T0, -5)), txt: 'Keterlambatan hadir berulang pada visite pagi selama dua minggu terakhir.', stat: 'dilaporkan', rek: [{ jenis: 'Pembinaan profesionalisme', txt: 'Pertemuan dengan mentor akademik dan kesepakatan jadwal tiba.', target: iso(addD(T0, 14)), tgl: iso(addD(T0, -4)) }] }
  ];
  const osd = [['ikm', -150, 18, 8], ['anak', -120, 18, 6], ['obgyn', -75, 17, 7], ['ipd', -40, 18, 8], ['bedah', -12, 16, 7]];
  osd.forEach((o, i) => { const rr = RNG(900 + i); S.osce.push({ id: 'o' + (i + 1), st: o[0], nama: 'OSCE akhir stase ' + stase(o[0]).pendek, tgl: iso(addD(T0, o[1])), peserta: o[2], station: o[3], avg: Math.round((66 + rr() * 14) * 10) / 10, pass: Math.round((78 + rr() * 20) * 10) / 10 }); });
  const a1 = S.cases.find(c => c.sid === 's2' && c.stat === 'valid');
  S.audit.push({ id: 'b1', ts: iso(addD(T0, -14)) + ' 09:12', uid: 'u-pre', cid: a1 ? a1.id : '-', alasan: 'Pasien tidak sadar, identitas dibutuhkan untuk konfirmasi alergi obat sebelum tindakan.', menit: 15, status: 'Selesai' });
  S.audit.push({ id: 'b2', ts: iso(addD(T0, -6)) + ' 21:40', uid: 'u-multi', cid: a1 ? a1.id : '-', alasan: 'Rujukan darurat, perlu verifikasi identitas dengan keluarga pasien.', menit: 15, status: 'Selesai' });
  inval();
  return S;
}
