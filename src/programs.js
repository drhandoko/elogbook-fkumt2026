/* Two presentation areas share the existing authenticated account.
   This selector is NOT a permission boundary. The existing server continues
   to authorize every record; no curriculum or student record is fabricated. */
UI.program = 'PSPD';
try { if (sessionStorage.getItem('umt-program') === 'PSSK') UI.program = 'PSSK'; } catch (e) {}
const PROGRAMS = {
  PSSK: 'Sarjana Kedokteran / Bachelor of Medicine',
  PSPD: 'Pendidikan Profesi Dokter / Medical Professional Program'
};
function programTitle() { return PROGRAMS[UI.program] || PROGRAMS.PSPD; }
function programSelector() {
  return '<div class="program-selector" role="group" aria-label="Study programme">' + Object.keys(PROGRAMS).map(k =>
    '<button type="button" class="btn '+(UI.program===k?'primary':'')+'" data-a="program" data-program="'+k+'" aria-pressed="'+(UI.program===k)+'">'+esc(PROGRAMS[k])+'</button>').join('')+'</div>';
}
function programNavigation(role) {
  if (UI.program !== 'PSSK') return NAV[role];
  const nav = [['s-home','Overview','home']];
  // Existing admin operations are shared, not a newly granted scope.
  if (role === 'admin') nav.push(['a-users','Students and accounts (shared)','users'], ['a-import','Import grades (shared)','upload']);
  return nav;
}
TITLES['s-home'] = 'S.Ked Portfolio';
A.program = el => {
  const p=el.dataset.program;
  if (!Object.prototype.hasOwnProperty.call(PROGRAMS,p) || p===UI.program) return;
  const modal=document.getElementById('modal');
  if (modal && !modal.hidden) { toast('Close or finish the current form before switching programme.','warn'); return; }
  UI.program=p; UI.params={}; UI.navOpen=false;
  try { sessionStorage.setItem('umt-program',p); } catch(e) {}
  UI.route=S.session?programNavigation(S.session.role)[0][0]:'login'; render();
};
function skedRows(sid) { return S.nilai.filter(n=>n.tahap==='PSSK' && (!sid || n.sid===sid)); }
function skedGradeTable(rows,withStudent) {
  return table((withStudent?['Student']:[]).concat(['Block','Assessment','Score','Date']),rows.map(n=>'<tr>'+
    (withStudent?'<td>'+esc((studentById(n.sid)||{}).nama || n.sid)+'</td>':'')+
    '<td>'+esc(n.unit)+'</td><td>'+esc(n.komp)+'</td><td>'+esc(n.v)+'</td><td>'+esc(n.tgl||'Not recorded')+'</td></tr>'));
}
PAGES['s-home'] = () => {
  const role=S.session.role,u=me();
  if (!['mahasiswa','kaprodi','admin'].includes(role)) return pageHead(PROGRAMS.PSSK,'Undergraduate portfolio')+card('Access','<p>This area is intended for students and programme administrators. Your existing professional programme tools remain available in the other section.</p>');
  const sid=role==='mahasiswa'?u.sid:null;
  if (role==='mahasiswa' && !sid) return pageHead(PROGRAMS.PSSK,'Undergraduate portfolio')+card('Account setup','<p>Your account is not linked to a student record. Please contact the programme administrator.</p>');
  const rows=skedRows(sid), blocks=new Set(rows.map(n=>n.unit));
  return pageHead(PROGRAMS.PSSK,'Undergraduate assessment records within your current account access.')+
    '<div class="g3">'+kpi('Recorded grades','<b>'+rows.length+'</b>','PSSK records only')+kpi('Blocks with records','<b>'+blocks.size+'</b>','Not a count of completed blocks')+kpi('Competency progress','<b>Not configured</b>','Requires approved outcome-to-assessment mapping')+'</div>'+
    '<div class="mt">'+card(role==='mahasiswa'?'My undergraduate grades':'Undergraduate grades',rows.length?skedGradeTable(rows,role!=='mahasiswa'):'<p>No undergraduate grade records are available for your account yet.</p>')+'</div>'+
    card('About these records','<p>Aggregate grades do not establish individual competency achievement. Semester mapping, approved learning outcomes, progress notes and programme-specific coordinator permissions require further configuration. No demonstration curriculum is presented as the approved S.Ked curriculum.</p><p>Switching sections changes the view, not your permissions. Administrators’ account and grade-import tools remain shared with the professional programme.</p>');
};
