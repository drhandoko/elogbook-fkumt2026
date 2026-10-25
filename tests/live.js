const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const {makeRuntime}=require('../server/mock');
let source=fs.readFileSync('server/Code.gs','utf8').replaceAll('600000','1000').replaceAll('ganti-dengan-email-admin@contoh.com','admin@umt.test');
const rt=makeRuntime(source);rt.run('setup()');
let count=0;function ok(c,m){assert.ok(c,m);count++;console.log('PASS '+m);}
const adminPw=rt.logs.find(x=>x.startsWith('Sandi sementara')).split(': ')[1];
let a=rt.call('login',{email:'admin@umt.test',pw:adminPw});ok(a.ok,'bootstrap administrator');
let changed=rt.call('chpw',{token:a.token,old:adminPw,nw:'New-Secure-Pass-2026'});ok(changed.ok,'change temporary password');a.token=changed.token;
const users={};
for(const role of ['mahasiswa','dosen','preseptor','kaprodi']){
  const n=role==='preseptor'?3:1;
  for(let i=0;i<n;i++){
    const email=role+i+'@umt.test';
    const u=rt.call('admin',{token:a.token,op:'userCreate',nama:role+i,email,roles:[role],nim:'T'+role+i,mulai:'2026-01-01'});
    const l=rt.call('login',{email,pw:u.pw});
    const c=rt.call('chpw',{token:l.token,old:u.pw,nw:'Password-2026-'+role+i});
    const state=rt.call('load',{token:c.token});users[role+i]={id:u.id,token:c.token,sid:state.me.sid,state};
  }
}
const st=users.mahasiswa0,d=users.dosen0,p=users.preseptor0,ps=[p,users.preseptor1,users.preseptor2];
ok(rt.call('load',{token:d.token}).students.length===0,'unassigned lecturer receives no student records');
const userState=()=>rt.call('load',{token:st.token});
function send(u,c,id,doc,rev){return rt.call('sync',{token:u.token,ops:[{c,id,d:doc,rev:rev||0}]});}
for(const [i,u] of ps.entries()){
  const r=send(a,'assignments','assign'+i,{sid:st.sid,uid:u.id,st:'ipd',wah:'w0',mulai:'2026-01-01',selesai:'2027-12-31',aktif:true});
  ok(r.ok,'create scoped assignment '+i);
}
ok(rt.call('load',{token:p.token}).students.some(s=>s.id===st.sid),'assigned preceptor sees student without existing cases');
const doc={id:'case1',sid:st.sid,tgl:'2026-10-25',jenis:'Kasus',st:'ipd',wah:'w0',dx:'Hipertensi',kat:'FKRTL',sis:'Kardiovaskular',pid:p.id,stat:'menunggu',tok:'abcdefghijklmnopqrstuvwx',ini:'AB',rm:'RM123',sum:'Anonim',ter:'Melakukan dengan supervisi'};
let c=send(st,'cases','case1',doc);ok(c.ok,'student submits pseudonymous case');
ok(c.docs['cases:case1'].submittedAt,'submission timestamp from server');
let loaded=userState().cases[0];ok(!JSON.stringify(loaded).includes('RM123')&&!loaded.ini_e,'patient identifiers never returned in normal state');
const rejectNoConsent=send(p,'cases','case1',{...loaded,stat:'valid',fb:'Baik'},loaded._rev);ok(!rejectNoConsent.ok,'server rejects validation before consent');
ok(rt.ctx.consentRespond(doc.tok,'menolak').ok,'patient refusal persists');
loaded=userState().cases[0];ok(loaded.consStatus==='menolak'&&loaded.stat==='draf','refusal removes case from validated target');
ok(rt.run("get_('cases','case1').d.rm_e")==='','refusal clears additional identifiers');
ok(rt.ctx.consentRespond(doc.tok,'setuju').ok,'patient may record consent later');
loaded=userState().cases[0];c=send(st,'cases','case1',{...loaded,stat:'menunggu'},loaded._rev);ok(c.ok,'resubmit after consent');
loaded=userState().cases[0];c=send(p,'cases','case1',{...loaded,stat:'valid',fb:'Umpan balik'},loaded._rev);ok(c.ok,'assigned preceptor validates with consent');
ok(c.docs['cases:case1'].respondedAt,'response timestamp from server');
ok(rt.ctx.consentRespond(doc.tok,'ditarik').ok,'patient withdraws consent');
ok(userState().cases[0].stat==='draf','withdrawal revokes validated contribution');
ok(!send(d,'cases','case1',{...userState().cases[0],stat:'valid'},userState().cases[0]._rev).ok,'unassigned lecturer cannot validate');
ok(!send(st,'cases','badDate',{...doc,id:'badDate',tgl:'2026-02-31'}).ok,'invalid calendar date rejected');
ok(!send(st,'cases','badScope',{...doc,id:'badScope',st:'anak'}).ok,'wrong stase rejected');
const asm={id:'msf1',sid:st.sid,jenis:'MSF',judul:'MSF',tgl:'2026-10-25',st:'ipd',pid:p.id};
let r=send(st,'asms','msf1',asm);ok(r.ok,'MSF request');
for(let i=0;i<3;i++){
 const current=userState().asms.find(x=>x.id==='msf1');
 r=send(ps[i],'asms','msf1',{...current,sk:[6+i,6+i,6+i,6+i,6+i],kek:'Baik',perlu:'Komunikasi',renc:'Observasi ulang',stat:'dinilai'},current._rev);
 ok(r.ok,'distinct MSF rater '+(i+1));
 if(i===0){const now=userState().asms[0];ok(now.stat==='menunggu','single rater does not finalize MSF');ok(!send(p,'asms','msf1',{...now,sk:[6,6,6,6,6],kek:'Baik',perlu:'A',renc:'B'},now._rev).ok,'duplicate MSF rater rejected');}
}
let msf=userState().asms[0];ok(msf.stat==='dinilai'&&msf.raterCount===3&&msf.sk[0]===7,'MSF aggregates three distinct raters');
const cbd={...asm,id:'cbd1',jenis:'CBD',judul:'CBD'};
ok(send(st,'asms','cbd1',cbd).ok,'CBD request');
let cbd1=userState().asms.find(x=>x.id==='cbd1');
ok(!send(p,'asms','cbd1',{...cbd1,sk:[6,6,6,6,6,6,6],kek:'B',perlu:'A',renc:'C'},cbd1._rev).ok,'Mini-CEX domain count rejected for CBD');
ok(send(p,'asms','cbd1',{...cbd1,sk:[6,6,6,6,6,6],kek:'B',perlu:'A',renc:'C'},cbd1._rev).ok,'CBD uses its own six-domain rubric');
ok(!send(p,'asms','cbd1',{...cbd1,sk:[6,6,6,6,6,6],kek:'B',perlu:'A',renc:'C'},0).ok,'stale revision rejected');
ok(!send(p,'epaLog','epa1',{sid:st.sid,epa:0,level:3,tgl:'2026-10-25',st:'ipd',cm:'Bukti'}).ok,'EPA requires assessment evidence');
ok(send(p,'epaLog','epa1',{sid:st.sid,epa:0,level:3,tgl:'2026-10-25',st:'ipd',cm:'Bukti beberapa observasi',evidence:['msf1','cbd1']}).ok,'EPA retains linked evidence');
const cipher=rt.run("enc_('Identitas rahasia')");ok(cipher.startsWith('aesccm$'),'AES-CCM envelope');
rt.ctx.testCipher=cipher;ok(rt.run("dec_(testCipher)")==='Identitas rahasia','AES-CCM round trip');
let env=JSON.parse(cipher.slice(7));env.ct='A'+env.ct.slice(1);rt.ctx.testCipher='aesccm$'+JSON.stringify(env);ok(rt.run("dec_(testCipher)")==='','AES-CCM detects tampering');
const h=rt.run("hashPw_('password','salt')").split('$').pop();
ok(h===crypto.pbkdf2Sync('password','salt',1000,32,'sha256').toString('hex'),'PBKDF2 matches Node standard implementation');
ok(rt.call('load',{token:d.token}).cases.length===0,'unassigned lecturer receives no case data after population');
const audits=rt.call('load',{token:a.token}).audit;ok(audits.some(x=>x.action==='consent')&&audits.some(x=>x.collection==='asms'),'audit records consent and assessment changes');
const before=rt.call('load',{token:a.token}).periods.length;
const atomic=rt.call('sync',{token:a.token,ops:[{c:'periods',id:'periodAtomic',d:{nama:'Test',mulai:'2026-01-01',selesai:'2026-12-31',aktif:true}},{c:'cases',id:'forbidden',d:doc}]});
ok(!atomic.ok&&rt.call('load',{token:a.token}).periods.length===before,'batch rejects all writes when one operation fails');
rt.run("ADMIN_EMAIL");
rt.ctx.Session.getActiveUser=()=>({getEmail:()=>''});
let blocked=false;try{rt.run('setupLive()')}catch(e){blocked=e.code==='forbidden'}ok(blocked,'public callers cannot initialize database');
blocked=false;try{rt.run('backupDatabase()')}catch(e){blocked=e.code==='forbidden'}ok(blocked,'public callers cannot create backups');
console.log('\n'+count+' regression checks passed. Fast tests use 1000 PBKDF2 rounds; production uses 600000.');
