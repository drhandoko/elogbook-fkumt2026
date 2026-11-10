/* Interactive prototype only: intentionally unavailable in production mode. */
function sampleOutcomeConfig(){
 const c={version:1,name:'Simulasi CPL–CPMK',revision:'demo-1',source:'Synthetic demonstration; not the FK UMT curriculum',cpl:[],cpmk:[],evidence:[]};
 for(let i=0;i<9;i++){
  const id='DEMO-'+(i+1);c.cpl.push({id,label:'CPL contoh '+(i+1),threshold:73});
  for(let j=0;j<2;j++){
   const mid=id+'-M'+(j+1);c.cpmk.push({id:mid,label:'CPMK simulasi '+(i+1)+'.'+(j+1),cpl:id,weight:1,semester:j?4:2});
   c.evidence.push({id:mid+'-E',cpmk:mid,block:PSSK_BLOK[(i+j)%PSSK_BLOK.length],assessment:['CBT','OSCE','Tutorial','Praktikum'][i%4],weight:1,max:100,type:'assessment-component'});
  }
 }return c;
}
let OUTCOME_CONFIG=null;
function outcomeConfig(){if(!OUTCOME_CONFIG)OUTCOME_CONFIG=sampleOutcomeConfig();return OUTCOME_CONFIG;}
function outcomeRadar(items){
 const n=items.length;if(n<3)return '<p>At least three outcomes are needed for a radar. See the table.</p>';
 const cx=200,cy=180,R=125,p=(i,r)=>[cx+Math.cos(-Math.PI/2+i*2*Math.PI/n)*r,cy+Math.sin(-Math.PI/2+i*2*Math.PI/n)*r],xy=a=>a.map(v=>v.toFixed(1)).join(',');let s='';
 [25,50,75,100].forEach(v=>s+='<polygon fill="none" stroke="var(--line,#ccd6df)" points="'+items.map((_,i)=>xy(p(i,R*v/100))).join(' ')+'"/>');
 if(items.every(x=>x.score!==null))s+='<polygon fill="rgba(0,106,176,.14)" stroke="var(--brand,#006ab0)" points="'+items.map((x,i)=>xy(p(i,R*x.score/100))).join(' ')+'"/>';
 items.forEach((x,i)=>{let q=p(i,R),l=p(i,R+24);s+='<line stroke="var(--line,#ccd6df)" x1="'+cx+'" y1="'+cy+'" x2="'+q[0]+'" y2="'+q[1]+'"/>';if(x.score!==null){q=p(i,R*x.score/100);s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="5" fill="'+(x.complete?'var(--brand,#006ab0)':'#d68b00')+'"><title>'+esc(x.id+': '+x.score.toFixed(1)+(x.complete?'':' provisional'))+'</title></circle>';}s+='<text x="'+l[0]+'" y="'+l[1]+'" text-anchor="middle" font-size="10" fill="currentColor">'+esc(x.id)+'</text>';});
 return '<svg viewBox="0 0 400 360" role="img" aria-label="Radar simulasi CPL, skala 0 sampai 100; bukti kosong tidak diplot" style="width:100%;max-height:380px">'+s+'</svg><p class="hint">Biru: data lengkap untuk peta contoh. Jingga: skor sementara dengan bukti kurang. Tanpa titik: belum ada bukti. Tidak ada keputusan kelulusan.</p>';
}
function outcomeStatus(x){return {'not-due':'Belum dijadwalkan','insufficient':'Bukti belum cukup','threshold-met':'Ambang contoh terpenuhi','below-threshold':'Di bawah ambang contoh'}[x.status];}
if(DEMO_MODE && window.ELOGBOOK_OUTCOME_PREVIEW === true){
 const oldSkedHome=PAGES['s-home'];
 PAGES['s-home']=()=>{
  if(!['mahasiswa','admin','kaprodi'].includes(S.session.role))return oldSkedHome();
  const sid=S.session.role==='mahasiswa'?me().sid:(UI.params.outcomeSid||S.students[0]?.id),sem=Number(UI.params.outcomeSemester||2),c=outcomeConfig(),r=OutcomeEngine.calculate(c,S.nilai,sid,sem);
  const controls='<div class="form-grid">'+(S.session.role==='mahasiswa'?'':'<label>Mahasiswa contoh<select data-ch="outcome-student">'+S.students.map(s=>'<option value="'+esc(s.id)+'" '+(s.id===sid?'selected':'')+'>'+esc(s.nama)+'</option>').join('')+'</select></label>')+'<label>Titik evaluasi<select data-ch="outcome-semester">'+[2,4,6,8].map(s=>'<option '+(s===sem?'selected':'')+'>'+s+'</option>').join('')+'</select></label></div>';
  if(r.errors.length)return pageHead('CPL / CPMK','Invalid draft configuration')+card('Configuration errors','<p>'+esc(r.errors.join('; '))+'</p>');
  const ev=r.cpmk.flatMap(m=>m.evidence.map(e=>({...e,mid:m.id}))),bad=ev.filter(e=>e.status!=='available').length;
  return pageHead(PROGRAMS.PSSK,'CPL / CPMK • interactive design preview')+'<div class="alert warn"><b>PROTOTIPE • DATA SINTETIS</b><p>ID, pemetaan, bobot, ambang 73 dan nilai berikut hanya ilustrasi. Bukan kurikulum resmi atau keputusan ketercapaian. Evaluasi semester 2/4/6/8 mengikuti arah pembahasan; aturan penghitungan masih perlu persetujuan.</p></div>'+controls+
  '<div class="g3">'+kpi('CPL dalam peta',c.cpl.length,'Versi '+esc(c.revision))+kpi('CPMK jatuh tempo',r.cpmk.length,'Sampai semester '+sem)+kpi('Bukti perlu perhatian',bad,'Termasuk kosong, ganda, atau tidak valid')+'</div>'+
  '<div class="g2 mt">'+card('Spider ketercapaian • simulasi',outcomeRadar(r.cpl))+card('Cakupan bukti dan status',table(['CPL','Skor sementara','Cakupan','Status'],r.cpl.map(x=>'<tr><td>'+esc(x.id)+'</td><td>'+(x.score===null?'—':x.score.toFixed(1))+'</td><td>'+Math.round(x.coverage*100)+'%</td><td>'+outcomeStatus(x)+'</td></tr>')))+'</div>'+
  card('Dari blok menuju CPMK',table(['CPMK','CPL','Semester','Bobot','Skor','Bukti lengkap'],r.cpmk.map(m=>'<tr><td>'+esc(m.id)+'</td><td>'+esc(m.cpl)+'</td><td>'+m.semester+'</td><td>'+m.weight+'</td><td>'+(m.score===null?'—':m.score.toFixed(1))+'</td><td>'+(m.complete?'Ya':'Belum')+'</td></tr>')))+
  card('Jejak bukti per blok',table(['CPMK','Blok','Asesmen','Nilai normalisasi','Status','Tanggal'],ev.map(e=>'<tr><td>'+esc(e.mid)+'</td><td>'+esc(e.block)+'</td><td>'+esc(e.assessment)+'</td><td>'+(e.score===null?'—':e.score.toFixed(1))+'</td><td>'+esc(e.status)+(e.type==='aggregate-proxy'?' • proxy nilai agregat':'')+'</td><td>'+esc(e.date||'—')+'</td></tr>')))+
  card('Belum dipetakan pada titik evaluasi ini','<p>'+r.unmapped.length+' nilai tidak digunakan. Nilai tidak dipaksa masuk ke CPL yang tidak relevan. Bukti untuk semester selanjutnya belum ikut dihitung.</p>')+
  card('Cara simulasi menghitung','<p>Normalisasi nilai terhadap skor maksimum, rata-rata berbobot bukti tersedia per CPMK, kemudian rata-rata berbobot CPMK per CPL. Skor yang belum lengkap tetap sementara. Ambang contoh hanya diperiksa bila seluruh bukti terjadwal tersedia. Nilai ganda tidak dipilih otomatis. Setiap tampilan menghitung ulang dari nilai terbaru.</p><p>Model produksi perlu blueprint versi/angkatan, bukti indikator langsung, aturan remedial, asesmen wajib dan persetujuan akademik. Satu nilai blok agregat tidak membuktikan seluruh CPL.</p>')+
  (['admin','kaprodi'].includes(S.session.role)?card('Studio konfigurasi • lokal dan sementara','<button class="btn" data-a="outcome-config">Ubah peta, bobot, dan ambang contoh</button> <button class="btn" data-a="outcome-grade" data-sid="'+esc(sid)+'">Simulasikan nilai masuk</button><p class="hint">Hanya peramban demo. Tidak mengubah server atau data mahasiswa nyata. Konfigurasi kembali ke contoh saat halaman dimuat ulang.</p>'):'');
 };
 CH['outcome-student']=el=>{UI.params.outcomeSid=el.value;render();};
 CH['outcome-semester']=el=>{UI.params.outcomeSemester=Number(el.value);render();};
 A['outcome-config']=()=>{if(!['admin','kaprodi'].includes(S.session.role))return;openModal('Draft mapping • JSON','<form data-form="outcome-config"><p>Contoh saja. Setiap CPMK memiliki CPL, semester dan bobot; setiap bukti memiliki blok, asesmen, skor maksimum, bobot dan jenis.</p><textarea name="mapping" rows="18" style="width:100%">'+esc(JSON.stringify(outcomeConfig(),null,2))+'</textarea><button class="btn primary" type="submit">Validasi dan tampilkan</button></form>',{wide:true});};
 FORMS['outcome-config']=f=>{if(!['admin','kaprodi'].includes(S.session.role))return;try{const c=JSON.parse(F(f,'mapping'));const e=OutcomeEngine.validate(c);if(e.length)throw Error(e.join('; '));OUTCOME_CONFIG=c;closeModal();render();toast('Peta simulasi diperbarui.');}catch(e){toast(e.message,'bad');}};
 A['outcome-grade']=el=>{if(!['admin','kaprodi'].includes(S.session.role))return;openModal('Simulasi nilai masuk','<form data-form="outcome-grade" data-sid="'+esc(el.dataset.sid)+'"><label>Blok<select name="block">'+PSSK_BLOK.map(b=>'<option>'+esc(b)+'</option>').join('')+'</select></label><label>Asesmen<select name="assessment">'+['CBT','OSCE','Tutorial','Praktikum'].map(a=>'<option>'+a+'</option>').join('')+'</select></label><label>Nilai 0–100<input name="score" type="number" min="0" max="100" step="0.1" required></label><button class="btn primary" type="submit">Terapkan ke data contoh</button></form>');};
 FORMS['outcome-grade']=f=>{if(!['admin','kaprodi'].includes(S.session.role))return;const raw=F(f,'score'),v=Number(raw),sid=f.dataset.sid;if(!raw.trim()||!Number.isFinite(v)||v<0||v>100||!S.students.some(s=>s.id===sid))return toast('Nilai atau mahasiswa tidak valid.','bad');const unit=F(f,'block'),komp=F(f,'assessment');if(!PSSK_BLOK.includes(unit)||!['CBT','OSCE','Tutorial','Praktikum'].includes(komp))return;const rows=S.nilai.filter(n=>n.sid===sid&&n.tahap==='PSSK'&&n.unit===unit&&n.komp===komp);if(rows.length>1)return toast('Data ganda: selesaikan konflik terlebih dahulu.','bad');if(rows.length)Object.assign(rows[0],{v,tgl:iso(new Date())});else S.nilai.push({sid,tahap:'PSSK',unit,komp,v,tgl:iso(new Date())});closeModal();render();toast('Simulasi dihitung ulang, tidak dikirim ke server.');};
}
