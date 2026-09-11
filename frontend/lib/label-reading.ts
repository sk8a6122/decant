// Only propose readable name lines. A year is never automatically chosen from label prose.
export function labelReading(data:{text?:string;confidence?:number;tsv?:string},current=new Date().getFullYear()){
 const lines=new Map<string,{words:string[];scores:number[];height:number}>();
 for(const row of (data.tsv||'').split('\n').slice(1)){
  const parts=row.split('\t');if(parts[0]!=='5'||parts.length<12)continue;
  const key=parts.slice(1,5).join('-'),text=parts.slice(11).join('\t').trim(),score=Number(parts[10]);if(!text)continue;
  const line=lines.get(key)||{words:[],scores:[],height:0};line.words.push(text);line.scores.push(score);line.height=Math.max(line.height,Number(parts[9])||0);lines.set(key,line);
 }
 const rows=[...lines.values()].map(l=>({text:l.words.join(' '),confidence:l.scores.reduce((a,b)=>a+b,0)/l.scores.length,height:l.height}));
 const years=[...new Set(rows.filter(l=>l.confidence>=80&&/^(?:19|20)\d{2}$/.test(l.text)&&Number(l.text)<=current).map(l=>l.text))];
 const names=rows.filter(l=>l.confidence>=70).map(l=>({...l,text:l.text.replace(/[^\p{L}\s'-]/gu,' ').replace(/\s+/g,' ').trim()})).filter(l=>{
  const words=l.text.split(' ');return words.length<=7&&words.some(w=>w.length>=5)&&words.filter(w=>w.length<=2).length<=words.length/3&&/[aeiouyàáâäèéêëìíîïòóôöùúûü]/i.test(l.text)&&!/bottled|contains|sulfite|sulphite|alcohol|imported|warning|product of|bouteille|since|founded|first vintage|anniversary/i.test(l.text);
 }).sort((a,b)=>b.height-a.height||b.confidence-a.confidence);
 const query=names.slice(0,2).map(l=>l.text).join(' ').slice(0,100);
 return {query,years:query?years:[],reliable:!!query};
}
