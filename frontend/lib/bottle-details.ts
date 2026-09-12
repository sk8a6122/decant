export const currencies=['USD','EUR','GBP','CAD','AUD','NZD','CHF','JPY','CNY','HKD','SGD','ZAR','INR','SEK','NOK','DKK','MXN','BRL'];
export function currencyCode(value:any){const code=String(value||'USD').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(code))throw new Error('Use a three-letter currency code, such as USD or EUR.');return code}
export function purchaseTotals(bottles:any[]){const totals:Record<string,number>={};for(const r of bottles){const d=r.data||r;if(Number(d.price)>0&&Number(d.qty)>0){const code=currencyCode(d.currency);totals[code]=(totals[code]||0)+Number(d.price)*Number(d.qty)}}return Object.entries(totals).map(([code,value])=>`${code} ${value.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`).join(' · ')}
export type WindowState='young'|'ready'|'closing'|'past';
export type DrinkWindow={state:WindowState;label:string;from:number|null;to:number|null};
// Reads only what the owner recorded. No window means no claim; Decant never guesses one.
export function drinkWindow(data:any,year=new Date().getFullYear()):DrinkWindow|null{
 const parse=(v:any)=>/^\d{4}$/.test(String(v??'').trim())?Number(String(v).trim()):null;
 const from=parse(data?.from),to=parse(data?.to);
 if(from===null&&to===null)return null;
 if(from!==null&&year<from)return {state:'young',label:`Opens ${from}`,from,to};
 if(to!==null&&year>to)return {state:'past',label:`Past your window · ended ${to}`,from,to};
 if(to!==null&&year===to)return {state:'closing',label:`Last year in your window`,from,to};
 if(to!==null)return {state:'ready',label:`In your window · through ${to}`,from,to};
 return {state:'ready',label:`Ready since ${from}`,from,to};
}
export const readyNow=(bottles:any[],year=new Date().getFullYear())=>bottles.filter(r=>Number(r.data?.qty)>0).map(r=>({record:r,window:drinkWindow(r.data,year)})).filter(x=>x.window&&(x.window.state==='ready'||x.window.state==='closing')).sort((a,b)=>(a.window!.state==='closing'?0:1)-(b.window!.state==='closing'?0:1));
export function validateYears(data:any){const current=new Date().getFullYear();const vintage=String(data.vintage||'').trim().toUpperCase();if(vintage&&vintage!=='NV'&&(!/^\d{4}$/.test(vintage)||Number(vintage)<1000||Number(vintage)>current))throw new Error('Choose NV or enter a complete vintage year no later than '+current+'.');for(const key of ['from','to'])if(data[key]&&!/^\d{4}$/.test(String(data[key]).trim()))throw new Error('Enter a four-digit drinking-window year.');if(data.from&&data.to&&Number(data.from)>Number(data.to))throw new Error('The drinking window must end on or after it begins.');return vintage}
