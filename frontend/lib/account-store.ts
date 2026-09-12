import {createClient} from '@supabase/supabase-js';
declare global { interface Window { DECANT_SUPABASE?: {url:string;publishableKey:string} } }
const config = typeof window === 'undefined' ? undefined : window.DECANT_SUPABASE;
export const supabase = config?.url && config?.publishableKey
  ? createClient(config.url, config.publishableKey, {auth:{storageKey:'decant-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
  : null;
export let currentAccount: {id:string;email?:string}|null = null;
export function setAccount(user:typeof currentAccount){currentAccount=user;}
export function assertAccount(id:string|null){
  if((currentAccount?.id||null)!==id)throw new Error('Your sign-in changed. Please reopen your notebook.');
}
export async function readCloud(id:string){
  assertAccount(id);
  if(!supabase)throw new Error('Account setup is not complete.');
  const {data,error}=await supabase.from('decant_notebooks').select('notebook,revision').eq('user_id',id).maybeSingle();
  assertAccount(id);
  if(error)throw new Error('Your cloud notebook could not be loaded. Check your connection and try again.');
  return data;
}
export async function writeCloud(id:string,notebook:any,revision:number|null){
  assertAccount(id);
  if(!supabase)throw new Error('Account setup is not complete.');
  const query=revision===null
    ?supabase.from('decant_notebooks').insert({user_id:id,notebook})
    :supabase.from('decant_notebooks').update({notebook}).eq('user_id',id).eq('revision',revision);
  const {data,error}=await query.select('revision').maybeSingle();
  assertAccount(id);
  if(error?.code==='23505'||(!error&&!data))throw new Error('Your notebook changed on another device. Refresh it, then try your change again.');
  if(error)throw new Error('This change was not saved. Check your connection and try again.');
}
