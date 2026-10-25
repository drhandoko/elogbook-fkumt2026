/* Live hardening v3.0.0. Generated Code.gs includes SJCL (BSD/GPL dual license). */
const CONSENT_VERSION = 'FKUMT-2026-01';
function database_() {
  const P = PropertiesService.getScriptProperties(), id = P.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;
  fail_('not_setup', 'Jalankan setupLive untuk membuat basis data.');
}
sheet_ = function(name) {
  const ss = database_(); let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1,1,1,5).setValues([HEAD]); sh.setFrozenRows(1); }
  return sh;
};
function requireOwner_() {const email=Session.getActiveUser().getEmail();if(!email||email.toLowerCase()!==ADMIN_EMAIL.toLowerCase())fail_('forbidden','Inisialisasi dan cadangan hanya dapat dijalankan pemilik admin.');}
function setupLive() {
  requireOwner_();
  const P = PropertiesService.getScriptProperties();
  if (!P.getProperty('SPREADSHEET_ID')) {
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('E-Portofolio FK UMT - Data Live');
    P.setProperty('SPREADSHEET_ID', ss.getId());
  }
  setup();
  Logger.log('Basis data live: ' + database_().getUrl());
}
function backupDatabase() {
  requireOwner_();
  const copy = database_().copy('Cadangan E-Portofolio FK UMT ' + ts_());
  Logger.log('Cadangan dibuat: ' + copy.getUrl());
  return copy.getId();
}
const oldHash_ = hashPw_, oldDec_ = dec_;
hashPw_ = function(pw,salt) {
  return 'pbkdf2-sha256$600000$' + sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(String(pw),String(salt),600000,256));
};
function verifyPw_(pw,salt,hash) {
  return same_(hash.indexOf('pbkdf2-sha256$') === 0 ? hashPw_(pw,salt) : oldHash_(pw,salt),hash);
}
enc_ = function(value) {
  if(!value)return '';
  const iv=sjcl.codec.hex.toBits(Utilities.getUuid().replace(/-/g,'').slice(0,24));
  const cipher=new sjcl.cipher.aes(sjcl.codec.base64.toBits(key_()));
  const ct=sjcl.mode.ccm.encrypt(cipher,sjcl.codec.utf8String.toBits(String(value)),iv,[],128);
  return 'aesccm$'+JSON.stringify({v:1,iv:sjcl.codec.base64.fromBits(iv),ct:sjcl.codec.base64.fromBits(ct)});
};
dec_ = function(value) {
  if(!value)return '';
  if(String(value).indexOf('aesccm$')!==0)return oldDec_(value);
  try{const p=JSON.parse(String(value).slice(7));return sjcl.codec.utf8String.fromBits(sjcl.mode.ccm.decrypt(new sjcl.cipher.aes(sjcl.codec.base64.toBits(key_())),sjcl.codec.base64.toBits(p.ct),sjcl.codec.base64.toBits(p.iv),[],128));}catch(e){return '';}
};
function assignmentOk_(uid,sid,st,wah,day) {
  day = day || now_();
  return readAll_('assignments').some(function(r) {
    const a=r.d; return a.uid===uid && a.sid===sid && a.aktif!==false &&
      (!st || !a.st || a.st===st) && (!wah || !a.wah || a.wah===wah) &&
      (!a.mulai || (a.mulai<=day && a.mulai<=now_())) && (!a.selesai || (a.selesai>=day && a.selesai>=now_()));
  });
}
function staffOk_(u,sid,st,wah,day) {
  const R=rolesOf_(u);
  return !!(R.kaprodi || ((R.dosen || R.preseptor) && assignmentOk_(u.id,sid,st,wah,day)));
}
canReadCase_ = function(u,r) {
  const R=rolesOf_(u);
  return !!(R.admin || R.kaprodi || (R.mahasiswa && r.sid===u.d.sid) ||
    ((R.dosen || R.preseptor) && r.pid===u.id && assignmentOk_(u.id,r.sid,r.d.st,r.d.wah,r.d.tgl)));
};
const legacyLoad_ = load_;
load_ = function(req) {
  const out=legacyLoad_(req),u=auth_(req),R=rolesOf_(u);
  out.assignments=readAll_('assignments').filter(function(r){return R.admin||R.kaprodi||r.d.uid===u.id||r.sid===u.d.sid;}).map(function(r){return r.d;});
  if (!(R.admin||R.kaprodi)) {
    out.cases=out.cases.filter(function(d){return canReadCase_(u,{sid:d.sid,pid:d.pid,d:d});});
    out.asms=out.asms.filter(function(d){return d.sid===u.d.sid || (d.pid===u.id && staffOk_(u,d.sid,d.st,'',d.tgl));});
    const sids={}; if(u.d.sid)sids[u.d.sid]=true;
    out.assignments.forEach(function(a){if(a.uid===u.id&&assignmentOk_(u.id,a.sid,a.st,a.wah))sids[a.sid]=true;});
    out.students=readAll_('students').filter(function(r){return sids[r.id];}).map(function(r){return r.d;});
    ['nilai','epaLog'].forEach(function(k){out[k]=out[k].filter(function(d){return d.sid===u.d.sid||staffOk_(u,d.sid,d.st||d.unit);});});
    const epa={};Object.keys(out.epa||{}).forEach(function(s){if(sids[s])epa[s]=out.epa[s];});out.epa=epa;
    out.ews=[];
    out.replies={};
    readAll_('replies').filter(function(r){return r.sid===u.d.sid;}).forEach(function(r){out.replies[r.id]=r.d.t;});
  }
  out.version='3.0.0'; return out;
};
const rawPut_=put_;
put_=function(name,id,sid,pid,d) {
  const ex=get_(name,id); d._rev=(ex&&ex.d._rev||0)+1;
  return rawPut_(name,id,sid,pid,d);
};
const originalSync_=sync_;
sync_=function(req) {
  const u=auth_(req); if(!Array.isArray(req.ops)||req.ops.length>120)fail_('invalid','Maksimal 120 perubahan per permintaan.');
  req.ops.forEach(function(op){
    if(['cases','asms','nilai','ews','epaLog','assignments'].indexOf(op.c)>=0){
      const ex=get_(op.c,op.id),rev=ex&&ex.d._rev||0;
      if(Number(op.rev||0)!==rev)fail_('conflict','Data telah berubah. Tinjau data server sebelum mengirim ulang.');
    }
  });
  const result=originalSync_(req);
  if(result.rej.length)fail_('forbidden','Perubahan ditolak. Periksa penugasan, persetujuan, dan status data.');
  result.revisions={};
  req.ops.forEach(function(op){const r=get_(op.c,op.id);if(r)result.revisions[op.c+':'+op.id]=r.d._rev||0;});
  CacheService.getScriptCache().remove('pct');
  return result;
};
function auditChange_(u,c,id,action) {
  const aid=gid_('audit');put_('audit',aid,'',u.id,{id:aid,ts:ts_(),uid:u.id,cid:id,
    alasan:action+' '+c,action:action,collection:c,status:'Tercatat'});
}
const originalCases_=W.cases;
W.cases=function(u,R,op) {
  // Keep a snapshot: originalCases_ replaces the mutable stored row in place.
  const stored=get_('cases',op.id),ex=stored?Object.assign({},stored,{d:Object.assign({},stored.d)}):null,d=op.d||{};
  if(!op.del && R.mahasiswa && (!ex||ex.sid===u.d.sid)) {
    if(d.jenis==='Kasus' && !assignmentOk_(d.pid,u.d.sid,d.st,d.wah,d.tgl))return false;
    if(d.tgl && !validDate_(d.tgl))return false;
    if(d.jenis==='Kasus' && ex && (ex.d.consStatus==='menolak'||ex.d.consStatus==='ditarik') && d.stat!=='draf')return false;
  }
  if(ex && ex.d.stat==='menunggu' && ex.sid!==u.d.sid) {
    if(ex.pid!==u.id || !staffOk_(u,ex.sid,ex.d.st,ex.d.wah,ex.d.tgl))return false;
    if(d.stat==='valid' && ex.d.jenis==='Kasus' && !ex.d.cons)return false;
  }
  const previous=ex?Object.assign({},ex.d):null;
  const accepted=originalCases_(u,R,op);if(!accepted)return false;
  const r=get_('cases',op.id);
  if(r){
    r.d.tags=R.mahasiswa&&r.sid===u.d.sid&&Array.isArray(d.tags)?d.tags.filter(function(t){return ONKO_TAGS.indexOf(t)>=0;}):(previous&&previous.tags||[]);
    r.d.consStatus=previous&&previous.consStatus||(r.d.cons?'setuju':'menunggu');
    r.d.consVersion=previous&&previous.consVersion||CONSENT_VERSION;
    r.d.createdAt=previous&&previous.createdAt||new Date().toISOString();
    r.d.submittedAt=previous&&previous.submittedAt||'';
    if(r.d.stat==='menunggu'&&(!previous||previous.stat!=='menunggu'))r.d.submittedAt=new Date().toISOString();
    if(previous&&previous.stat==='menunggu'&&r.d.stat!=='menunggu')r.d.respondedAt=new Date().toISOString();
    r.d.followup=str_(R.mahasiswa&&r.sid===u.d.sid&&Object.prototype.hasOwnProperty.call(d,'followup')?d.followup:previous&&previous.followup,2000);
    r.d.followupDue=date_(d.followupDue||previous&&previous.followupDue,'');
    auditChange_(u,'cases',op.id,r.d.stat);
  }
  return true;
};
function validDate_(s) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s)))return false;
  const d=new Date(s+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
W.assignments=function(u,R,op) {
  if(!R.admin||op.del)return false;
  const d=op.d||{};
  if(!get_('students',d.sid)||!pidOk_(d.uid)||!validDate_(d.mulai)||!validDate_(d.selesai)||d.mulai>d.selesai)return false;
  if(d.st&&stIds_().indexOf(d.st)<0)return false;
  if(d.wah&&!get_('wahana',d.wah))return false;
  put_('assignments',op.id,d.sid,d.uid,{id:op.id,sid:d.sid,uid:d.uid,st:d.st||'',wah:d.wah||'',
    mulai:d.mulai,selesai:d.selesai,aktif:d.aktif!==false});
  auditChange_(u,'assignments',op.id,'penugasan');return true;
};

/* Rubrics and multisource feedback: server determines the rater and aggregate. */
W.asms=function(u,R,op) {
  if(op.del)return false;
  const ex=get_('asms',op.id),d=op.d||{};
  if(!ex) {
    if(!R.mahasiswa||!u.d.sid||!assessmentDomains(d.jenis)||['DOPS','Mini-CEX','CBD','Presentasi Kasus','MSF'].indexOf(d.jenis)<0)return false;
    if(!validDate_(d.tgl)||!assignmentOk_(d.pid,u.d.sid,d.st,'',d.tgl))return false;
    put_('asms',op.id,u.d.sid,d.pid,{id:op.id,sid:u.d.sid,jenis:d.jenis,judul:str_(d.judul,200),
      tgl:d.tgl,st:enum_(d.st,stIds_(),stIds_()[0]),pid:d.pid,stat:'menunggu',sk:null,kek:'',perlu:'',renc:'',
      requestedAt:new Date().toISOString(),ratings:[],rubricVersion:'FKUMT-2026-01'});
    auditChange_(u,'asms',op.id,'permintaan');return true;
  }
  if(ex.sid===u.d.sid||ex.d.stat!=='menunggu'||!staffOk_(u,ex.sid,ex.d.st,'',ex.d.tgl))return false;
  if(ex.d.jenis!=='MSF'&&ex.pid!==u.id)return false;
  const dom=assessmentDomains(ex.d.jenis);
  if(!Array.isArray(d.sk)||d.sk.length!==dom.length||d.sk.some(function(v){return typeof v!=='number'||!Number.isInteger(v)||v<1||v>9;}))return false;
  if(!str_(d.kek,1500).trim()||!str_(d.perlu,1500).trim()||!str_(d.renc,1500).trim())return false;
  const rating={uid:u.id,sk:d.sk.slice(),kek:str_(d.kek,1500),perlu:str_(d.perlu,1500),renc:str_(d.renc,1500),at:new Date().toISOString()};
  let out=Object.assign({},ex.d,{sk:rating.sk,kek:rating.kek,perlu:rating.perlu,renc:rating.renc,stat:'dinilai',assessedAt:rating.at,ratedBy:u.id});
  if(ex.d.jenis==='MSF') {
    const ratings=(ex.d.ratings||[]).slice();
    if(ratings.some(function(r){return r.uid===u.id;}))return false;
    ratings.push(rating);
    out.ratings=ratings;out.raterCount=ratings.length;out.stat=ratings.length>=3?'dinilai':'menunggu';
    out.sk=dom.map(function(_,i){return ratings.reduce(function(t,r){return t+r.sk[i];},0)/ratings.length;});
    out.kek=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.kek;}).join('\n');
    out.perlu=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.perlu;}).join('\n');
    out.renc=ratings.map(function(r,i){return 'Penilai '+(i+1)+': '+r.renc;}).join('\n');
  }
  put_('asms',op.id,ex.sid,ex.pid,out);auditChange_(u,'asms',op.id,'penilaian');return true;
};
['epaLog','nilai'].forEach(function(k){
  const original=W[k];
  W[k]=function(u,R,op){
    const d=op.d||{};
    if(!(R.admin&&k==='nilai')&&!staffOk_(u,d.sid,d.st||d.unit))return false;
    if(k==='epaLog'&&(!Number.isInteger(d.epa)||d.epa<0||d.epa>=EPAS.length||!Number.isInteger(d.level)||d.level<1||d.level>5))return false;
    if(k==='epaLog'&&(!str_(d.cm,1500).trim()||!Array.isArray(d.evidence)||!d.evidence.length))return false;
    if(k==='epaLog'&&d.evidence.some(function(id){const r=get_('asms',id);return !r||r.sid!==d.sid||r.d.stat!=='dinilai';}))return false;
    const ok=original(u,R,op);
    if(ok){const r=get_(k,op.id);if(k==='epaLog'){r.d.evidence=d.evidence.slice(0,30);r.d.st=d.st||'';}auditChange_(u,k,op.id,'penilaian');}
    return ok;
  };
});
/* Revocable consent; no patient details are displayed by the public page. */
consentPage_=function(tok) {
  if(!/^[a-z0-9]{12,40}$/.test(tok))return HtmlService.createHtmlOutput('<p>Tautan tidak valid.</p>');
  const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Persetujuan pembelajaran FK UMT</title><style>body{font:16px/1.6 system-ui;background:#f3f8fb;color:#16303f;margin:0}main{max-width:600px;margin:30px auto;padding:24px;background:white;border-radius:14px}button{font:inherit;margin:8px 5px;padding:12px;border-radius:8px;border:1px solid #abc;cursor:pointer}button:first-of-type{background:#006ab0;color:white}</style></head><body><main><h1>Persetujuan penggunaan kasus untuk pembelajaran</h1><p>Fakultas Kedokteran Universitas Murni Teguh</p><p>Mahasiswa memohon izin menggunakan ringkasan kasus Anda untuk pembelajaran dan penilaian. Data terbatas mungkin sudah dicatat sebagai draf sebelum Anda membuka halaman ini. Nama lengkap tidak diperlukan. Pencatatan mengutamakan kode pasien; identitas tambahan, bila ada, dienkripsi.</p><p>Persetujuan bersifat sukarela. Penolakan atau penarikan persetujuan tidak memengaruhi pelayanan Anda. Akses dibatasi kepada pihak pendidikan yang berwenang. Untuk pertanyaan atau permintaan penghapusan, hubungi program studi melalui petugas yang mendampingi Anda.</p><p>Keputusan terbaru menggantikan keputusan sebelumnya. Jika menolak atau menarik persetujuan, identitas tambahan dihapus dan kasus tidak dihitung sebagai capaian tervalidasi.</p><p>Versi informasi '+CONSENT_VERSION+'.</p><div id="buttons"><button data-choice="setuju">Saya setuju</button><button data-choice="menolak">Saya tidak setuju</button><button data-choice="ditarik">Tarik persetujuan sebelumnya</button></div><p id="result" role="status"></p><script>var tok='+JSON.stringify(tok)+';document.querySelectorAll("button").forEach(function(b){b.onclick=function(){document.querySelectorAll("button").forEach(function(x){x.disabled=true});google.script.run.withSuccessHandler(function(r){document.getElementById("result").textContent=r.ok?r.message:"Tautan tidak berlaku.";document.querySelectorAll("button").forEach(function(x){x.disabled=false})}).withFailureHandler(function(){document.getElementById("result").textContent="Gagal menyimpan keputusan. Coba lagi.";document.querySelectorAll("button").forEach(function(x){x.disabled=false})}).consentRespond(tok,b.getAttribute("data-choice"))}});</script></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Persetujuan pembelajaran FK UMT');
};
function consentRespond(tok,choice) {
  if(!/^[a-z0-9]{12,40}$/.test(String(tok))||['setuju','menolak','ditarik'].indexOf(choice)<0)return {ok:false};
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    MEM={};IDX={};TOUCH={};DELR={};
    const r=readAll_('cases').filter(function(r){return r.d.tok===tok;})[0];if(!r)return {ok:false};
    r.d.cons=choice==='setuju';r.d.consStatus=choice;r.d.consTgl=ts_();r.d.consVersion=CONSENT_VERSION;
    if(!r.d.cons){r.d.ini_e='';r.d.rm_e='';r.d.rm2='';r.d.stat='draf';}
    put_('cases',r.id,r.sid,r.pid,r.d);
    const aid=gid_('cons');put_('audit',aid,r.sid,'pasien',{id:aid,ts:ts_(),uid:'pasien',cid:r.id,
      action:'consent',status:choice,alasan:'Keputusan persetujuan '+choice,version:CONSENT_VERSION});
    flush_();return {ok:true,message:choice==='setuju'?'Persetujuan Anda tercatat. Anda dapat membuka tautan ini untuk menariknya kembali.':'Keputusan Anda tercatat. Kasus tidak dihitung sebagai capaian tervalidasi; identitas tambahan telah dihapus.'};
  }finally{lock.releaseLock();}
}
consentApprove=function(tok){return consentRespond(tok,'setuju').ok;};
const loadScoped_=load_;
load_=function(req){
  const out=loadScoped_(req),u=auth_(req),R=rolesOf_(u);
  if(!(R.admin||R.kaprodi)){
    readAll_('asms').forEach(function(r){if(r.d.jenis==='MSF'&&staffOk_(u,r.sid,r.d.st,'',r.d.tgl)&&!out.asms.some(function(a){return a.id===r.id;}))out.asms.push(r.d);});
  }
  return out;
};
const syncWithRevisions_=sync_;
sync_=function(req){
  const out=syncWithRevisions_(req),u=auth_(req);out.docs={};
  req.ops.forEach(function(op){const r=get_(op.c,op.id);if(r)out.docs[op.c+':'+op.id]=op.c==='cases'?maskCase_(r.d,r.sid===u.d.sid):r.d;});
  return out;
};

readableSids_=function(u) {
  const ids={};if(u.d.sid)ids[u.d.sid]=true;
  readAll_('assignments').forEach(function(r){if(r.d.uid===u.id&&assignmentOk_(u.id,r.sid,r.d.st,r.d.wah))ids[r.sid]=true;});
  return ids;
};
const loginV2_=login_;
login_=function(req){
  const result=loginV2_(req);
  if(result.ok){const u=userByEmail_(req.email);if(u.d.hash.indexOf('pbkdf2-sha256$')!==0){u.d.hash=hashPw_(req.pw,u.d.salt);put_('users',u.id,u.sid,'',u.d);}}
  return result;
};

const bgOriginal_=bg_;bg_=function(req){const u=auth_(req),r=get_("cases",req.cid),R=rolesOf_(u);if(!r||!r.d.cons||(!R.kaprodi&&!(R.mahasiswa&&r.sid===u.d.sid)&&!((R.dosen||R.preseptor)&&r.pid===u.id&&assignmentOk_(u.id,r.sid,r.d.st,r.d.wah,r.d.tgl))))fail_("forbidden");return bgOriginal_(req);};
