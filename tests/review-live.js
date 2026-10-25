// Independent regression review for live access control, persistence and consent.
const fs=require('fs'),assert=require('assert'),{makeRuntime}=require('../server/mock');
const source=['vendor/sjcl.js','server/api.gs','src/core.js','server/live.gs'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
let failures=0,passes=0;
function fixture(){
 const rt=makeRuntime(source); rt.props.ENC_KEY=Buffer.alloc(32,7).toString('base64');
 rt.run(`
 put_('students','sa','sa','',{id:'sa',nama:'Student A',nim:'TESTA',g:0,mulai:'2026-01-01'});
 put_('students','sb','sb','',{id:'sb',nama:'Student B',nim:'TESTB',g:0,mulai:'2026-01-01'});
 put_('users','ua','sa','',{sid:'sa',roles:['mahasiswa'],nama:'Student A',aktif:true,tv:1});
 put_('users','up','','',{roles:['preseptor'],nama:'Supervisor',aktif:true,tv:1});
 put_('users','ud','','',{roles:['dosen'],nama:'Lecturer',aktif:true,tv:1});
 put_('users','admin','','',{roles:['admin'],nama:'Admin',aktif:true,tv:1});
 put_('assignments','assign1','sa','up',{id:'assign1',uid:'up',sid:'sa',st:'ipd',wah:'w0',mulai:'2026-01-01',selesai:'2026-12-31',aktif:true});
 put_('wahana','w0','','',{id:'w0',nama:'Test Hospital',jenis:'RS Pendidikan Utama'});
 flush_();`);
 for(const uid of ['ua','up','ud','admin'])rt.cache['tk:'+uid.padEnd(48,'0')]={v:uid+'|1',exp:Date.now()+3600000};
 return rt;
}
function test(name,fn){try{fn(fixture());passes++; console.log('PASS',name)}catch(e){failures++;console.log('FAIL',name,':',e.message)}}
function seedCase(rt,extra={}){ const d=Object.assign({id:'ca',sid:'sa',pid:'up',tgl:'2026-10-25',st:'ipd',wah:'w0',jenis:'Kasus',dx:'Test',stat:'menunggu',cons:false,tok:'abcdefghijklmnopqrstuvwx',_rev:1},extra);rt.run(`put_('cases','ca','sa','up',${JSON.stringify(d)});flush_();`); }
function read(rt,c,id){return JSON.parse(rt.run(`JSON.stringify(get_('${c}','${id}').d)`))}
test('unassigned lecturer cannot read cases',rt=>{seedCase(rt);assert.equal(rt.run("canReadCase_(get_('users','ud'),get_('cases','ca'))"),false)});
test('assigned supervisor can read assigned case',rt=>{seedCase(rt);assert.equal(rt.run("canReadCase_(get_('users','up'),get_('cases','ca'))"),true)});
test('server rejects validation without consent',rt=>{seedCase(rt);assert.equal(rt.run("W.cases(get_('users','up'),{preseptor:1},{id:'ca',d:{stat:'valid',fb:'Good'}})"),false)});
test('server accepts valid assigned case with consent',rt=>{seedCase(rt,{cons:true,consStatus:'setuju'});assert.equal(rt.run("W.cases(get_('users','up'),{preseptor:1},{id:'ca',d:{stat:'valid',fb:'Good'}})"),true)});
test('consent rejection persists and invalidates case',rt=>{seedCase(rt,{cons:true,stat:'valid'});const r=rt.ctx.consentRespond('abcdefghijklmnopqrstuvwx','menolak');assert.ok(r.ok);const d=read(rt,'cases','ca');assert.equal(d.cons,false);assert.equal(d.stat,'draf');assert.equal(d.consStatus,'menolak')});
test('invalid calendar date rejected',rt=>{assert.equal(rt.ctx.validDate_('2026-02-30'),false)});
test('successful sync returns sanitized canonical documents',rt=>{const r=rt.call('sync',{token:'ua'.padEnd(48,'0'),ops:[{c:'cases',id:'activity1',d:{jenis:'Kegiatan',tgl:'2026-10-25',st:'ipd',pid:'up',dx:'Test',stat:'valid'},rev:0}]});assert.ok(r.ok,JSON.stringify(r));assert.ok(r.docs['cases:activity1']);assert.equal(r.docs['cases:activity1'].ini_e,undefined)});
test('rejected mixed sync leaves no committed writes',rt=>{const r=rt.call('sync',{token:'ua'.padEnd(48,'0'),ops:[{c:'cases',id:'activity1',d:{jenis:'Kegiatan',tgl:'2026-10-25',st:'ipd',pid:'up',dx:'Test',stat:'valid'},rev:0},{c:'nilai',id:'forbidden1',d:{sid:'sb',v:99},rev:0}]});assert.equal(r.ok,false);const reloaded=rt.call('load',{token:'ua'.padEnd(48,'0')});assert.ok(!reloaded.cases.some(c=>c.id==='activity1'))});
test('non-Case cannot be changed into Case to bypass consent',rt=>{seedCase(rt,{jenis:'Kegiatan',stat:'draf',cons:false});const r=rt.run("W.cases(get_('users','ua'),{mahasiswa:1},{id:'ca',d:{jenis:'Kasus',tgl:'2026-10-25',st:'ipd',wah:'w0',pid:'up',stat:'valid',dx:'Test'}})");assert.ok(r);assert.equal(read(rt,'cases','ca').stat,'menunggu')});
console.log(JSON.stringify({passes,failures}));process.exitCode=failures?1:0;

test('existing draft records server submission time',rt=>{
 seedCase(rt,{stat:'draf'});
 const d=read(rt,'cases','ca');d.stat='menunggu';
 assert.ok(rt.run(`W.cases(get_('users','ua'),{mahasiswa:1},{id:'ca',d:${JSON.stringify(d)}})`));
 assert.ok(read(rt,'cases','ca').submittedAt,'submission timestamp missing');
});
test('validation records server response time',rt=>{
 seedCase(rt,{cons:true,consStatus:'setuju',submittedAt:'2026-10-25T00:00:00Z'});
 assert.ok(rt.run("W.cases(get_('users','up'),{preseptor:1},{id:'ca',d:{stat:'valid',fb:'Good'}})"));
 assert.ok(read(rt,'cases','ca').respondedAt,'response timestamp missing');
});
console.log(JSON.stringify({passes,failures}));process.exitCode=failures?1:0;
test('assignment alone grants student directory access to supervisor',rt=>{
 const r=rt.call('load',{token:'up'.padEnd(48,'0')});assert.ok(r.ok,JSON.stringify(r));assert.ok(r.students.some(s=>s.id==='sa'),'assigned student absent until case exists');
});
test('standard encryption works in Apps Script without browser randomness',rt=>{
 const value=rt.ctx.enc_('TEST ONLY');assert.equal(rt.ctx.dec_(value),'TEST ONLY');assert.notEqual(value,'TEST ONLY');
});
console.log(JSON.stringify({passes,failures}));process.exitCode=failures?1:0;
test('MSF requires three distinct assigned raters and rejects repeat rating',rt=>{
 rt.run(`['up2','up3'].forEach(function(uid){put_('users',uid,'','',{roles:['preseptor'],nama:uid,aktif:true,tv:1});put_('assignments','assign'+uid,'sa',uid,{uid:uid,sid:'sa',st:'ipd',mulai:'2026-01-01',selesai:'2026-12-31',aktif:true});});flush_();`);
 const d={jenis:'MSF',judul:'MSF test',st:'ipd',tgl:'2026-10-25',pid:'up'};
 assert.ok(rt.run(`W.asms(get_('users','ua'),{mahasiswa:1},{id:'msf1',d:${JSON.stringify(d)}})`));
 const grade={sk:[6,7,6,7,6],kek:'Good teamwork',perlu:'Communication',renc:'Repeat observation'};
 for(const [i,uid] of ['up','up2','up3'].entries()){
   assert.ok(rt.run(`W.asms(get_('users','${uid}'),{preseptor:1},{id:'msf1',d:${JSON.stringify(grade)}})`));
   const value=read(rt,'asms','msf1');assert.equal(value.raterCount,i+1);assert.equal(value.stat,i<2?'menunggu':'dinilai');
   assert.equal(rt.run(`W.asms(get_('users','${uid}'),{preseptor:1},{id:'msf1',d:${JSON.stringify(grade)}})`),false);
 }
});
test('CBD rejects Mini-CEX domain count and accepts its own rubric',rt=>{
 const d={jenis:'CBD',judul:'CBD test',st:'ipd',tgl:'2026-10-25',pid:'up'};
 assert.ok(rt.run(`W.asms(get_('users','ua'),{mahasiswa:1},{id:'cbd1',d:${JSON.stringify(d)}})`));
 const grade={sk:[6,6,6,6,6,6,6],kek:'Reasoning',perlu:'Evidence',renc:'Review guidelines'};
 assert.equal(rt.run(`W.asms(get_('users','up'),{preseptor:1},{id:'cbd1',d:${JSON.stringify(grade)}})`),false);
 grade.sk.pop();assert.ok(rt.run(`W.asms(get_('users','up'),{preseptor:1},{id:'cbd1',d:${JSON.stringify(grade)}})`));
});
console.log(JSON.stringify({passes,failures}));process.exitCode=failures?1:0;
