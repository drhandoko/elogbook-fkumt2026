/* v3 live UX: preserves the existing theme and reusable cards. */
let SYNC_STATUS = 'saved';
function setSyncStatus(value) {
  SYNC_STATUS=value;
  const el=document.getElementById('sync-state');
  if(el)el.outerHTML=syncIndicator();
}
function syncIndicator() {
  if(!SERVER)return '<span class="chip-priv">Demo · data contoh</span>';
  const text={saved:'Tersimpan di server',pending:'Belum tersimpan',saving:'Menyimpan…',failed:'Gagal menyimpan',conflict:'Perubahan bertabrakan'}[SYNC_STATUS];
  return '<span id="sync-state" role="status" aria-live="polite" class="sync-state '+SYNC_STATUS+'">'+esc(text)+
    (['failed','conflict'].includes(SYNC_STATUS)?' <button class="lnk" data-a="sync-retry">Coba lagi</button> <button class="lnk" data-a="sync-review">Tinjau</button>':'')+'</span>';
}
function feedbackHours(c) {
  if(!c.submittedAt||!c.respondedAt)return null;
  const h=(Date.parse(c.respondedAt)-Date.parse(c.submittedAt))/3600000;
  return Number.isFinite(h)&&h>=0?h:null;
}
function downloadText(name,text,mime) {
  const blob=new Blob(['\uFEFF'+text],{type:mime||'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
A['sync-retry']=()=>pushNow();
A['sync-review']=async()=>{
  const r=await api('load');if(!r.ok){if(r.err==='auth')return A['sync-login']();return toast(errText(r),'bad');}
  UI.serverReview=r;
  openModal('Perubahan belum tersimpan','<p>Perubahan Anda tetap berada dalam sesi ini. Pada konflik, bandingkan nilai sebelum memilih.</p>'+
    '<p><b>Kasus lokal:</b> '+S.cases.length+'; <b>kasus server:</b> '+r.cases.length+'.</p>'+
    '<p>Untuk melindungi data pasien, salinan perubahan tidak disimpan otomatis di perangkat.</p>'+
    '<div class="row"><button class="btn" data-a="sync-rebase">Tinjau perubahan satu per satu</button>'+
    '<button class="btn" data-a="sync-discard">Gunakan data server dan batalkan perubahan lokal</button></div>');
};
A['sync-discard']=()=>{const r=UI.serverReview;if(!r)return;applyState(r);setSyncStatus('saved');closeModal();render();};
A['sync-rebase']=()=>{
  const r=UI.serverReview;if(!r)return;
  const pending=toDocs(),diff=[];
  Object.keys(pending).forEach(c=>Object.keys(pending[c]).forEach(id=>{
    if(SNAP[c]&&SNAP[c][id]===snapStr(c,pending[c][id]))return;
    const server=Array.isArray(r[c])?r[c].find(x=>idOf(c,x)===id):null;
    diff.push({c,id,local:pending[c][id],server});
  }));
  UI.conflicts=diff;
  openModal('Bandingkan perubahan','<p>Periksa data server dan perubahan Anda. Untuk perubahan bertabrakan, muat data server lalu masukkan ulang revisi yang masih diperlukan.</p>'+
    diff.map(x=>'<div class="box"><h3>'+esc(x.c)+' · '+esc(x.id)+'</h3><details><summary>Perubahan Anda</summary><pre class="wrapc">'+esc(JSON.stringify(x.local,null,2))+'</pre></details><details><summary>Data server</summary><pre class="wrapc">'+esc(JSON.stringify(x.server,null,2))+'</pre></details></div>').join('')+
    '<button class="btn" data-a="mclose">Kembali tanpa membuang perubahan</button><button class="btn" data-a="sync-discard">Gunakan data server</button>',{wide:true});
};
window.addEventListener('beforeunload',e=>{if(SERVER&&['pending','saving','failed','conflict'].includes(SYNC_STATUS)){e.preventDefault();e.returnValue='';}});
window.addEventListener('online',()=>{if(SYNC_STATUS==='failed')toast('Koneksi kembali. Klik Coba lagi untuk menyimpan.','info');});
function assignedStaff(sid,st,wah) {
  if(!SERVER)return presList();
  const ids=new Set((S.assignments||[]).filter(a=>a.sid===sid&&a.aktif!==false&&(!a.st||a.st===st)&&(!wah||!a.wah||a.wah===wah)&&a.mulai<=iso(T0)&&a.selesai>=iso(T0)).map(a=>a.uid));
  return presList().filter(p=>ids.has(p.id));
}
const baseCaseForm=caseForm;
caseForm=function(id){
  baseCaseForm(id);
  const form=document.querySelector('form[data-form="case"]');if(!form)return;
  const c=S.cases.find(x=>x.id===id)||{};
  const box=document.createElement('div');box.className='span2';
  box.innerHTML='<div class="alert info">Gunakan kode kasus. Identitas tambahan pasien bersifat opsional. Jangan menulis nama, NIK, alamat, atau nomor telepon pada ringkasan/refleksi.</div>'+
    field('cf-follow','Rencana pengembangan',textarea('cf-follow',c.followup||'',{rows:2}))+
    field('cf-due','Target observasi ulang',input('cf-due',c.followupDue||'',{type:'date'}))+
    '<fieldset><legend>Kegiatan unggulan FK UMT</legend>'+ONKO_TAGS.map((t,i)=>'<label class="chk"><input type="checkbox" name="onko'+i+'" '+((c.tags||[]).includes(t)?'checked':'')+'><span>'+esc(t)+'</span></label>').join('')+'</fieldset>';
  form.querySelector('.form-act').before(box);
  if(SERVER){const pid=form.elements['cf-pid'];const staff=assignedStaff(curSid(),form.elements['cf-st'].value,form.elements['cf-wah'].value);
    pid.innerHTML=staff.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nama)+'</option>').join('');
    if(c.pid)pid.value=c.pid;
    if(!staff.length)pid.innerHTML='<option value="">Belum ada penugasan; hubungi admin</option>';
  }
};
const baseCaseSubmit=FORMS.case;
FORMS.case=function(f,sub) {
  const tags=ONKO_TAGS.filter((_,i)=>f.elements['onko'+i]&&f.elements['onko'+i].checked),followup=F(f,'cf-follow'),followupDue=F(f,'cf-due');
  if(SERVER&&F(f,'cf-jenis')==='Kasus'&&!F(f,'cf-pid'))return toast('Admin perlu menetapkan pembimbing untuk mahasiswa, stase, dan wahana ini.','bad');
  baseCaseSubmit(f,sub);
  const c=f.dataset.id?S.cases.find(x=>x.id===f.dataset.id):S.cases[S.cases.length-1];
  if(c){Object.assign(c,{tags,followup,followupDue});save();}
};
const baseEpaForm=epaForm;
epaForm=function(sid) {
  baseEpaForm(sid);
  const f=document.querySelector('form[data-form="epa"]');if(!f)return;
  const target=sid||firstSid();
  const box=document.createElement('div');box.className='span2';box.id='epa-evidence';
  function evidenceFor(s) {return '<fieldset><legend>Bukti asesmen yang mendukung keputusan</legend>'+asmsOf(s).filter(a=>a.stat==='dinilai').map(a=>'<label class="chk"><input type="checkbox" name="evidence" value="'+esc(a.id)+'"><span>'+esc(a.judul)+' · '+dfmt(a.tgl)+'</span></label>').join('')+'</fieldset><p class="hint">Pilih bukti yang relevan. Level supervisi adalah kategori, bukan nilai interval. Kewenangan klinis tetap mengikuti penugasan resmi.</p>';}
  box.innerHTML=evidenceFor(target);f.querySelector('.form-act').before(box);
  f.elements['ep-s'].addEventListener('change',()=>{box.innerHTML=evidenceFor(f.elements['ep-s'].value);});
};
const baseEpaSubmit=FORMS.epa;
FORMS.epa=function(f){
  const evidence=Array.from(f.querySelectorAll('input[name="evidence"]:checked')).map(x=>x.value);
  if(!evidence.length)return toast('Pilih minimal satu bukti asesmen.','bad');
  baseEpaSubmit(f);const e=S.epaLog[S.epaLog.length-1];if(e)e.evidence=evidence;save();
};
const basePortfolio=portfolio;
portfolio=function(sid){
  const s=stats(sid),as=asmsOf(sid).filter(a=>a.stat==='dinilai'),cs=casesOf(sid);
  const onko=ONKO_TAGS.map(t=>({t,n:cs.filter(c=>c.stat==='valid'&&(c.tags||[]).includes(t)).length}));
  const gaps=S.stases.filter(st=>{const it=sched(studentById(sid)).find(x=>x.id===st.id);return it&&it.start<=T0;}).filter(st=>{const r=stScore(sid,st.id);return r.rows.some(x=>x.v==null);});
  return card('Prioritas pengembangan', '<p>'+gaps.length+' stase memiliki komponen nilai yang belum lengkap. Nilai terbobot sementara tidak menunjukkan kelulusan akhir.</p>'+
    '<p>'+as.length+' asesmen selesai dari '+new Set(as.map(a=>a.ratedBy||a.pid)).size+' penilai. '+cs.filter(c=>c.stat==='kembali').length+' entri perlu diperbaiki.</p>'+
    '<p>Target stase berjalan: FKTP '+s.fktpVal+'/'+s.curS.tf+'; FKRTL '+s.fkrtlVal+'/'+s.curS.tr+'. Jumlah kasus menunjukkan paparan; keputusan kompetensi memerlukan bukti observasi.</p>'+
    '<button class="btn" data-a="port-print">Cetak / Simpan PDF</button> <button class="btn" data-a="port-csv">Unduh bukti CSV</button>')+
    '<div class="mt">'+card('Promosi, pencegahan, dan deteksi dini kanker',onko.map(x=>'<div class="ep"><span>'+esc(x.t)+'</span><b>'+x.n+' bukti</b></div>').join(''))+'</div>'+
    '<div class="mt">'+basePortfolio(sid)+'</div>';
};
A['port-print']=()=>window.print();
A['port-csv']=()=>{const sid=curSid();downloadText('Bukti-portofolio-'+iso(T0)+'.csv',toCSV([['Tanggal','Jenis','Judul','Stase','Status','Penilai','Tag unggulan','Rencana pengembangan','Target observasi ulang']].concat(casesOf(sid).map(c=>[c.tgl,c.jenis,c.dx,stName(c.st),c.stat,pname(c.pid),(c.tags||[]).join('; '),c.followup||'',c.followupDue||'']))),'text/csv;charset=utf-8');};

NAV.admin.splice(3,0,['a-assign','Penugasan Pembimbing','users']);TITLES['a-assign']='Penugasan Pembimbing';
PAGES['a-assign']=()=>pageHead('Penugasan pembimbing','Tetapkan akses per mahasiswa, stase, wahana, dan tanggal. Akun dosen atau preseptor tanpa penugasan tidak dapat membuka seluruh kohort.','<button class="btn primary" data-a="assignment-new">Tambah penugasan</button>')+
  table(['Mahasiswa','Pembimbing','Stase','Wahana','Berlaku','Status',''],(S.assignments||[]).map(a=>'<tr><td>'+esc(sName(a.sid))+'</td><td>'+esc(pname(a.uid))+'</td><td>'+esc(a.st?stName(a.st):'Semua stase')+'</td><td>'+esc(a.wah?wahanaOf(a.wah).nama:'Semua wahana')+'</td><td>'+dfmt(a.mulai)+' – '+dfmt(a.selesai)+'</td><td>'+pill(a.aktif?'Aktif':'Nonaktif',a.aktif?'good':'muted')+'</td><td><button class="btn sm" data-a="assignment-toggle" data-id="'+a.id+'">'+(a.aktif?'Nonaktifkan':'Aktifkan')+'</button></td></tr>'));
A['assignment-new']=()=>openModal('Penugasan pembimbing','<form data-form="assignment" class="form-grid">'+
  field('au-s','Mahasiswa',selectEl('au-s',STU_OPTS(),firstSid()))+
  field('au-u','Pembimbing',selectEl('au-u',presList().map(p=>[p.id,p.nama]),''))+
  field('au-st','Stase',selectEl('au-st',[['','Semua stase']].concat(S.stases.map(s=>[s.id,s.nama])),''))+
  field('au-w','Wahana',selectEl('au-w',[['','Semua wahana']].concat(S.wahana.map(w=>[w.id,w.nama])),''))+
  field('au-from','Mulai',input('au-from',iso(T0),{type:'date',req:true}))+
  field('au-until','Selesai',input('au-until',iso(addD(T0,70)),{type:'date',req:true}))+
  '<div class="form-act span2"><button class="btn" type="button" data-a="mclose">Batal</button><button class="btn primary">Simpan penugasan</button></div></form>');
FORMS.assignment=f=>{
  if(!F(f,'au-s')||!F(f,'au-u')||F(f,'au-from')>F(f,'au-until'))return toast('Periksa mahasiswa, pembimbing, dan rentang tanggal.','bad');
  if(!S.assignments)S.assignments=[];
  S.assignments.push({id:genId('assign'),sid:F(f,'au-s'),uid:F(f,'au-u'),st:F(f,'au-st'),wah:F(f,'au-w'),mulai:F(f,'au-from'),selesai:F(f,'au-until'),aktif:true});done('Penugasan disiapkan');
};
A['assignment-toggle']=el=>{const a=(S.assignments||[]).find(a=>a.id===el.dataset.id);if(a){a.aktif=!a.aktif;save();render();}};
const oldGrade=FORMS.grade;
FORMS.grade=function(f){
  const a=S.asms.find(x=>x.id===f.dataset.id);
  if(a&&a.jenis==='MSF'&&(a.ratings||[]).some(r=>r.uid===S.session.uid))return toast('Anda sudah memberi penilaian MSF ini.','warn');
  oldGrade(f);
};
const oldAsmForm=asmForm;
asmForm=function(){
  oldAsmForm();
  const f=document.querySelector('form[data-form="asm"]');if(!f)return;
  if(SERVER){
    const staff=assignedStaff(curSid(),f.elements['as-st'].value);
    f.elements['as-pid'].innerHTML=staff.length?staff.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nama)+'</option>').join(''):'<option value="">Belum ada pembimbing ditugaskan</option>';
  }
  const note=document.createElement('p');note.className='hint span2';note.textContent='MSF memerlukan tiga penilai berbeda yang ditugaskan oleh program studi. Rubrik awal perlu disahkan tim kurikulum sebelum penilaian sumatif.';
  f.querySelector('.form-act').before(note);
};
const oldAsmSubmit=FORMS.asm;
FORMS.asm=f=>{if(SERVER&&!F(f,'as-pid'))return toast('Hubungi admin untuk penugasan pembimbing.','bad');oldAsmSubmit(f);};
const oldEpaFormV3=epaForm;
epaForm=function(sid){
  oldEpaFormV3(sid);const f=document.querySelector('form[data-form="epa"]');if(!f)return;
  const box=document.createElement('div');box.className='span2';box.innerHTML=field('ep-st','Konteks stase',selectEl('ep-st',S.stases.map(s=>[s.id,s.nama]),stats(sid||firstSid()).cur.id));f.querySelector('.form-act').before(box);
};
const oldEpaSubmitV3=FORMS.epa;
FORMS.epa=f=>{const before=S.epaLog.length;oldEpaSubmitV3(f);if(S.epaLog.length>before){S.epaLog[S.epaLog.length-1].st=F(f,'ep-st');save();}};
const originalDone=done;
function refreshCaseStaff() {
  const f=document.querySelector('form[data-form="case"]');if(!SERVER||!f)return;
  const staff=assignedStaff(curSid(),F(f,'cf-st'),F(f,'cf-wah')),sel=f.elements['cf-pid'];
  sel.innerHTML=staff.length?staff.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nama)+'</option>').join(''):'<option value="">Belum ada penugasan; hubungi admin</option>';
}
const oldCaseChange=CH['case-stase'];CH['case-stase']=el=>{oldCaseChange(el);refreshCaseStaff();};
document.addEventListener('change',e=>{if(e.target.id==='cf-wah')refreshCaseStaff();if(e.target.id==='as-st'&&SERVER){const f=e.target.form,p=f.elements['as-pid'];p.innerHTML=assignedStaff(curSid(),e.target.value).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.nama)+'</option>').join('');}});
A['sync-login']=()=>openModal('Masuk ulang untuk menyimpan','<p>Perubahan Anda tetap berada pada sesi ini.</p><form data-form="reauth">'+field('ra-email','Email',input('ra-email',me().email||'',{type:'email',req:true}))+field('ra-pw','Kata sandi',input('ra-pw','',{type:'password',req:true}))+'<button class="btn primary">Masuk dan coba simpan</button></form>');
FORMS.reauth=async f=>{
  const r=await api('login',{email:F(f,'ra-email'),pw:F(f,'ra-pw')});if(!r.ok)return toast(errText(r),'bad');
  const previous=TOKEN;setToken(r.token);
  const state=await api('load');
  if(!state.ok||state.me.id!==S.session.uid){setToken(previous);return toast('Gunakan akun yang sama dengan sesi ini.','bad');}
  closeModal();await pushNow();
};
boot();
