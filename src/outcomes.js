/* Draft outcome model. No production writes or automatic curriculum approval. */
const OutcomeEngine = (() => {
  const finite = x => typeof x === 'number' && Number.isFinite(x);
  function validate(c) {
    const errors=[];
    if (!c || c.version!==1 || !Array.isArray(c.cpl) || !Array.isArray(c.cpmk) || !Array.isArray(c.evidence)) return ['Expected version 1 with cpl, cpmk and evidence arrays.'];
    if(c.status && c.status!=='draft')errors.push('Preview accepts draft only; academic approval cannot be simulated as official.');
    if (!c.name || !c.revision || !c.source) errors.push('Name, revision and curriculum source are required.');
    if(c.cpl.length>20||c.cpmk.length>500||c.evidence.length>2000) errors.push('Configuration exceeds preview limits.');
    const ids=a=>a.map(x=>x.id), unique=a=>new Set(a).size===a.length;
    for(const [key,a] of [['CPL',c.cpl],['CPMK',c.cpmk],['evidence',c.evidence]]) if(!unique(ids(a))||a.some(x=>!x.id||typeof x.id!=='string')) errors.push(key+' IDs must be nonempty and unique.');
    c.cpl.forEach(x=>{if(!x.label||!finite(x.threshold)||x.threshold<0||x.threshold>100)errors.push('Invalid CPL label/threshold: '+x.id);});
    c.cpmk.forEach(x=>{if(!x.label||!c.cpl.some(y=>y.id===x.cpl)||!finite(x.weight)||x.weight<=0||!Number.isInteger(x.semester)||x.semester<1||x.semester>8)errors.push('Invalid CPMK link/weight/semester: '+x.id);});
    const keys=[];
    if(c.indicators){const is=c.indicators.map(x=>x.id);if(new Set(is).size!==is.length||c.indicators.some(x=>!x.id||!c.cpl.some(y=>y.id===x.cpl)))errors.push('Invalid or duplicate CPL indicator.');}

    c.evidence.forEach(x=>{if(!c.cpmk.some(y=>y.id===x.cpmk)||!x.block||!x.assessment||!finite(x.weight)||x.weight<=0||!finite(x.max)||x.max<=0||!['assessment-component','aggregate-proxy'].includes(x.type))errors.push('Invalid evidence mapping: '+x.id);if(x.sub && (!x.label||!c.indicators?.some(i=>i.id===x.indicator&&i.cpl===c.cpmk.find(m=>m.id===x.cpmk)?.cpl)))errors.push('Sub-CPMK requires label and matching CPL indicator: '+x.id);keys.push([x.cpmk,x.block,x.assessment,x.sub||''].join('|'));});
    if(c.evidence.some(e=>e.sub)){const direct=c.evidence.filter(e=>e.sub).map(e=>[e.block,e.assessment,e.sub].join('|'));if(!unique(direct))errors.push('Duplicate direct sub-CPMK contribution. Split explicitly rather than count twice.');}
    if(!unique(keys))errors.push('Duplicate assessment mapping within a CPMK.');
    return errors;
  }
  function calculate(c,grades,sid,semester) {
    const errors=validate(c); if(errors.length)return {errors};
    if(!sid||!Number.isInteger(semester)||semester<1||semester>8)return {errors:['Student and semester 1–8 required.']};
    const rows=grades.filter(n=>n.sid===sid&&n.tahap==='PSSK');
    const active=c.cpmk.filter(x=>x.semester<=semester);
    const used=new Set();
    const cpmk=active.map(m=>{
      const evidence=c.evidence.filter(e=>e.cpmk===m.id).map(e=>{
        const matches=rows.filter(n=>n.unit===e.block&&n.komp===e.assessment&&(!e.sub||n.sub===e.sub)); matches.forEach(n=>used.add(n));
        let status='missing',score=null,date=null;
        if(matches.length>1) status='ambiguous';
        else if(matches.length===1){const n=matches[0];date=n.tgl||null;if(!finite(n.v)||n.v<0||n.v>e.max)status='invalid';else {status='available';score=n.v/e.max*100;}}
        return {...e,status,score,date};
      });
      const total=evidence.reduce((s,e)=>s+e.weight,0),available=evidence.filter(e=>e.status==='available'),seen=available.reduce((s,e)=>s+e.weight,0);
      return {...m,evidence,coverage:total?seen/total:0,score:seen?available.reduce((s,e)=>s+e.score*e.weight,0)/seen:null,complete:total>0&&available.length===evidence.length,proxy:evidence.some(e=>e.type==='aggregate-proxy')};
    });
    const cpl=c.cpl.map(o=>{const ms=cpmk.filter(m=>m.cpl===o.id),total=ms.reduce((s,m)=>s+m.weight,0),seen=ms.filter(m=>m.score!==null),w=seen.reduce((s,m)=>s+m.weight,0),complete=ms.length>0&&ms.every(m=>m.complete),score=w?seen.reduce((s,m)=>s+m.score*m.weight,0)/w:null;return {...o,score,coverage:total?ms.reduce((s,m)=>s+m.coverage*m.weight,0)/total:0,complete,proxy:ms.some(m=>m.proxy),status:!ms.length?'not-due':!complete?'insufficient':score>=o.threshold?'threshold-met':'below-threshold',cpmk:ms};});
    return {errors:[],cpmk,cpl,unmapped:rows.filter(n=>!used.has(n)),semester,sid};
  }
  return {validate,calculate};
})();
if(typeof module!=='undefined'&&module.exports) module.exports=OutcomeEngine;
