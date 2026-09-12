import {assertAccount,currentAccount,readCloud,writeCloud} from '../lib/account-store';
import {createNotebookRequest,portableRequest,readLocalNotebook} from './portable-api';
export function accountRequest(){
 const owner=currentAccount;
 let revision:number|null=null;
 let queue:Promise<any>=Promise.resolve();
 const request=owner?createNotebookRequest({
  read:async()=>{const row=await readCloud(owner.id);revision=row?.revision??null;return row?.notebook;},
  write:async notebook=>writeCloud(owner.id,notebook,revision),
  member:()=>({id:owner.id,email:owner.email||'',status:'account'})
 }):portableRequest;
 return (path:string,body?:any,method='POST')=>{
  const next=queue.then(async()=>{
   assertAccount(owner?.id||null);
   if(path==='import-browser'){
    if(!owner)throw new Error('Sign in before copying your browser notebook.');
    const s=readLocalNotebook();
    const rows=(kind:string)=>(s.records||[]).filter((r:any)=>r.kind===kind).map((r:any)=>({...r.data,id:r.id}));
    // Explicit opt-in only. The browser original is never deleted or replaced.
    path='import';body={bottles:rows('bottle'),notes:rows('note'),gatherings:rows('host'),academy:s.academy,progress:s.progress};
   }
   const result=await request(path,body,method);
   assertAccount(owner?.id||null);
   return result;
  });
  queue=next.catch(()=>{});
  return next;
 };
}
