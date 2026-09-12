import {SocialPanel} from './social';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {supabase,setAccount,currentAccount} from '../lib/account-store';
const AccountContext=createContext<any>({user:null});
const returnUrl=()=>location.origin+location.pathname;
export function AccountProvider({children}:{children:React.ReactNode}){
 const [state,setState]=useState<any>({loading:true,user:null,recovery:location.hash.includes('type=recovery')}),[error,setError]=useState('');
 useEffect(()=>{
  if(!supabase){setState({loading:false,user:null,recovery:false});return;}
  let alive=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!alive)return;
   setAccount(session?.user||null);
   setState((old:any)=>({loading:false,user:session?.user||null,recovery:event==='PASSWORD_RECOVERY'||(old.recovery&&!!session)}));
  });
  supabase.auth.getSession().catch(()=>{if(alive){setError('Sign-in could not be restored. Reload to try again.');setState({loading:false,user:null,recovery:false});}});
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 if(state.loading)return <main className="account-loading">Opening your notebook…</main>;
 if(error)return <main className="account-loading" role="alert">{error}<button onClick={()=>location.reload()}>Try again</button></main>;
 return <AccountContext.Provider value={state}>{state.recovery?<main className="account-loading"><AuthForm mode="update" onDone={()=>setState({...state,recovery:false})}/></main>:<React.Fragment key={state.user?.id||'guest'}>{children}</React.Fragment>}</AccountContext.Provider>;
}
function AuthForm({mode:initial='signin',onDone}:{mode?:string;onDone:()=>void}){
 const [mode,setMode]=useState(initial),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function submit(e:React.FormEvent){
  e.preventDefault();if(!supabase)return;setBusy(true);setError('');setNotice('');
  try{
   const result=mode==='signup'?await supabase.auth.signUp({email,password,options:{emailRedirectTo:returnUrl()}})
    :mode==='reset'?await supabase.auth.resetPasswordForEmail(email,{redirectTo:returnUrl()})
    :mode==='update'?await supabase.auth.updateUser({password}):await supabase.auth.signInWithPassword({email,password});
   if(result.error)throw result.error;
   setPassword('');
   if(mode==='signup')setNotice('Check your email to confirm your account, then sign in.');
   else if(mode==='reset')setNotice('If an account exists for this email, a password reset link has been requested. Check your inbox.');
   else onDone();
  }catch(e:any){setError(e.message||'Unable to sign in. Please try again.');}finally{setBusy(false);}
 }
 return <form className="account-auth panel" onSubmit={submit}>
  <h2>{mode==='signup'?'Create your Decant account':mode==='reset'?'Reset your password':mode==='update'?'Choose a new password':'Sign in to Decant'}</h2>
  {mode!=='update'&&<label className="field">Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
  {mode!=='reset'&&<label className="field">Password<input type="password" required minLength={mode==='signin'?1:8} autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <button className="primary" disabled={busy||!supabase}>{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':mode==='update'?'Save password':'Sign in'}</button>
  {mode!=='update'&&<div className="account-actions">{['signin','signup','reset'].filter(m=>m!==mode).map(m=><button type="button" className="text-button" key={m} disabled={busy} onClick={()=>{setMode(m);setError('');setNotice('')}}>{m==='signup'?'Create account':m==='reset'?'Forgot password?':'Sign in'}</button>)}<button type="button" className="text-button" onClick={onDone}>Close</button></div>}
 </form>;
}
export function AccountBar({refresh,request,exportData,ready,records}:{records:any[];ready:boolean;refresh:()=>Promise<void>;request:(p:string,b?:any)=>Promise<any>;exportData:()=>void}){
 const [showSocial,setShowSocial]=useState(false);
 const {user}=useContext(AccountContext),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function action(fn:()=>Promise<any>,message=''){
  setBusy(true);setError('');setNotice('');try{await fn();setNotice(message)}catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 return <section className="account-strip" aria-label="Notebook account">
  <div className="banner backup-banner"><span>{user?'Account notebook · '+user.email:'Saved in this browser'}</span><button className="backup-button" disabled={!ready} onClick={exportData}>Export notebook</button>
   {user?<><button className="backup-button" onClick={()=>setShowSocial(!showSocial)}>Friends & sharing</button><button className="backup-button" disabled={busy} onClick={()=>action(refresh)}>Refresh cloud notebook</button><button className="backup-button" disabled={busy} onClick={()=>action(async()=>{const r=await supabase!.auth.signOut({scope:'local'});if(r.error)throw r.error;})}>Sign out</button></>:<button className="backup-button" disabled={!supabase} onClick={()=>setShow(!show)}>Sign in / Create account</button>}
  </div>
  {user&&<details className="account-import"><summary>Bring your browser notebook into this account</summary><p>Copy the cellar, notes, gatherings, and learning progress saved in this browser to {user.email}. Existing entry IDs are kept and duplicates skipped. Your original browser notebook stays here. Only copy it if it belongs to you.</p><button className="outline-button" disabled={busy} onClick={()=>action(async()=>{await request('import-browser',{});await refresh()},'Browser notebook copied to your account.')}>Copy my browser notebook</button></details>}
  {!supabase&&<p className="small">Account setup is not complete. Your browser notebook still works.</p>}
  {user&&<p className="small">Account changes save online. Refresh to load changes from another device.</p>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {showSocial&&user&&<SocialPanel records={records}/>}
  {show&&!user&&<AuthForm onDone={()=>setShow(false)}/>}
 </section>;
}
