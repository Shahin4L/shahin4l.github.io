export function filterRecipes(recipes,{query='',category='all',platform='all'}={}){
 const q=query.trim().normalize('NFKC').toLocaleLowerCase();
 const tiers={excel2016:['classic'],excel2019:['classic','2019'],excel2021:['classic','2019','modern'],excel365:['classic','2019','modern','new']};
 return recipes.filter(r=>(category==='all'||r.category===category)&&
 (platform==='all'||platform==='sheets'&&!!r.sheets||platform==='excel'&&!!r.excel||tiers[platform]?.includes(r.tier)&&!!r.excel)&&
 (!q||[r.name,r.description,r.description_bn,r.note,r.note_bn,r.excel,r.sheets].join(' ').normalize('NFKC').toLocaleLowerCase().includes(q)));
}
export function summarize(sample,hub='all',status='all'){
 const rows=sample.filter(r=>(hub==='all'||r[1]===hub)&&(status==='all'||r[2]===status));
 return {rows:rows.length,quantity:rows.reduce((n,r)=>n+r[4],0),amount:rows.reduce((n,r)=>n+r[5],0)};
}
export function summaryFormula(hub='all',status='all'){
 const args=['F2:F7'];if(hub!=='all')args.push('B2:B7','"'+hub+'"');if(status!=='all')args.push('C2:C7','"'+status+'"');
 return args.length===1?'=SUM(F2:F7)':'=SUMIFS('+args.join(',')+')';
}
export function sampleTSV(sample){
 const header=['Order ID','Hub','Status','Date','Qty','Amount','Agent','Hours'];
 return [header,...sample.map(r=>r.map((v,i)=>i===3?'=DATE('+String(v).replace(/-0?/g,',')+')':v))].map(r=>r.join('\t')).join('\n');
}
