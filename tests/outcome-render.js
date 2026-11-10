const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let n=0;const app={innerHTML:''},modal={hidden:true};
const ctx={console,Date,Math,Set,Map,Promise,Array,JSON,URL,Blob,Uint8Array,crypto:require('crypto').webcrypto,
setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,location:{hash:'#demo'},
localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
navigator:{},window:{ELOGBOOK_DEMO:true,ELOGBOOK_OUTCOME_PREVIEW:true,addEventListener(){},scrollTo(){},matchMedia:()=>({matches:false})},
document:{activeElement:null,addEventListener(){},querySelector:()=>null,documentElement:{setAttribute(){},getAttribute(){return null}},
getElementById:id=>id==='app'?app:id==='modal'?modal:id==='toast'?{}:null}};
vm.createContext(ctx);
const html=fs.readFileSync('dist/elogbook-fragment.html','utf8');
const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
vm.runInContext(scripts.join('\n'),ctx);
function ok(c,m){assert.ok(c,m);n++;console.log('PASS '+m);}

for (const role of ['mahasiswa','admin','kaprodi']) {
 ctx.testRole=role;
 vm.runInContext("S.session={uid:S.users.find(u=>u.roles.includes(testRole)).id,role:testRole};UI.program='PSSK';UI.route='s-home';UI.params={};render()",ctx);
 ok(app.innerHTML.includes('Spider ketercapaian'),'radar renders for '+role);
 ok(app.innerHTML.includes('DATA SINTETIS'),'draft warning for '+role);
 ok(!app.innerHTML.includes('Terjadi kesalahan tampilan'),'view without errors '+role);
}
vm.runInContext("S.session={uid:'u-m1',role:'mahasiswa'};UI.params={};render()",ctx);
ok(!app.innerHTML.includes('data-a="outcome-config"'),'student cannot edit mapping');
ok(vm.runInContext("outcomeRadar([{id:'A',score:null},{id:'B',score:0,complete:true},{id:'C',score:70,complete:false}]).match(/<circle /g).length",ctx)===2,'missing radar point is not plotted as zero');
console.log(n+' outcome view checks passed');
