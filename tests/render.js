const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let n=0;const app={innerHTML:''},modal={hidden:true};
const ctx={console,Date,Math,Set,Map,Promise,Array,JSON,URL,Blob,Uint8Array,crypto:require('crypto').webcrypto,
setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,location:{hash:'#demo'},
localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
navigator:{},window:{ELOGBOOK_DEMO:true,addEventListener(){},scrollTo(){},matchMedia:()=>({matches:false})},
document:{activeElement:null,addEventListener(){},querySelector:()=>null,documentElement:{setAttribute(){},getAttribute(){return null}},
getElementById:id=>id==='app'?app:id==='modal'?modal:null}};
vm.createContext(ctx);
const html=fs.readFileSync('dist/elogbook-fragment.html','utf8');
const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
vm.runInContext(scripts.join('\n'),ctx);
function ok(c,m){assert.ok(c,m);n++;console.log('PASS '+m);}
ok(app.innerHTML.includes('Masuk'),'demo login renders');
const routes=vm.runInContext("Object.keys(NAV).flatMap(role=>NAV[role].map(row=>({role,page:row[0]})))",ctx);
for(const {role,page} of routes){
 ctx.testRole=role;ctx.testPage=page;
 vm.runInContext("S.session={uid:S.users.find(u=>u.roles.includes(testRole)).id,role:testRole};UI.route=testPage;UI.params={};render()",ctx);
 ok(!app.innerHTML.includes('Terjadi kesalahan tampilan'),role+' / '+page+' renders');
}
vm.runInContext("S.session={uid:'u-m1',role:'mahasiswa'};UI.route='m-port';render()",ctx);
ok(app.innerHTML.includes('Prioritas pengembangan'),'portfolio prioritizes development');
ok(app.innerHTML.includes('Cetak / Simpan PDF'),'portfolio PDF print action available');
ok(app.innerHTML.includes('Deteksi dini kanker'),'oncology evidence visible');
ok(vm.runInContext("assessmentDomains('CBD').length",ctx)===6,'CBD rubric uses six domains');
ok(vm.runInContext("assessmentDomains('MSF').length",ctx)===5,'MSF rubric uses five domains');
ok(vm.runInContext("feedbackHours({submittedAt:'2026-10-25T00:00:00Z',respondedAt:'2026-10-25T01:30:00Z'})",ctx)===1.5,'feedback response time uses exact timestamps');
ok(vm.runInContext("feedbackHours({tgl:'2026-10-25',fbTgl:'2026-10-26'})",ctx)===null,'old date-only records do not invent hour precision');
ctx.emptyRole='admin';vm.runInContext("S=emptyState();S.users=[{id:'empty-admin',nama:'Admin',roles:['admin'],unit:''}];S.session={uid:'empty-admin',role:'admin'};UI.route='a-home';render()",ctx);
ok(!app.innerHTML.includes('Terjadi kesalahan tampilan'),'empty live-style admin dashboard renders');
console.log('\n'+n+' frontend render checks passed.');
