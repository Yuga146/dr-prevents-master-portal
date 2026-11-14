import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getFirestore,doc,onSnapshot,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const config={apiKey:'AIzaSyCouVRRLKymy1QE7LZazrji-xkbdQxd1tA',authDomain:'dr-prevents-master-portal.firebaseapp.com',projectId:'dr-prevents-master-portal',storageBucket:'dr-prevents-master-portal.firebasestorage.app',messagingSenderId:'469793236119',appId:'1:469793236119:web:318b32181c1be839b6f5d2'};
const app=initializeApp(config);const db=getFirestore(app);const auth=getAuth(app);
const mapping={'prevents_roster_v14':'roster','pantai-lab-user-tests-v1':'lab','drprevents_panel_finder_v2':'panel','dr_prevents_branches_v3':'branch'};
export function startSync(key){
 const module=mapping[key];if(!module)throw Error('Unknown storage key');
 const originalSet=Storage.prototype.setItem;const originalGet=Storage.prototype.getItem;
 const ref=doc(db,'workspaceData',module);
 let ready=false,remoteValue=null,updating=false,dirty=false,unsubscribe=null;
 const notify=(message)=>{let badge=document.getElementById('firebase-sync-indicator');if(!badge){badge=document.createElement('div');badge.id='firebase-sync-indicator';badge.style.cssText='position:fixed;bottom:8px;right:8px;z-index:2147483647;background:#17212b;color:white;border:1px solid #506071;border-radius:6px;padding:5px 9px;font:12px sans-serif;pointer-events:none';document.body.append(badge)}badge.textContent=message};
 const save=async(value)=>{try{notify('Syncing...');await setDoc(ref,{value,updatedAt:serverTimestamp()});notify('Cloud synced')}catch(err){console.error('Firebase save failed',err);notify('Sync error - changes only on this device')}};
 Storage.prototype.setItem=function(k,v){const result=originalSet.apply(this,arguments);if(this===localStorage&&k===key&&!updating){if(ready){if(v!==remoteValue){remoteValue=v;save(v)}}else dirty=true}return result};
 function connect(){if(unsubscribe)return;unsubscribe=onSnapshot(ref,snapshot=>{
  const value=snapshot.exists()?snapshot.data().value:null;
  if(!ready){ready=true;if(value===null){notify('Cloud connected - save to publish');if(dirty){const local=originalGet.call(localStorage,key);if(local!==null){remoteValue=local;save(local)}}}else{remoteValue=value;const current=originalGet.call(localStorage,key);if(current!==value){updating=true;originalSet.call(localStorage,key,value);updating=false;notify('Cloud data loaded');refresh()}else notify('Cloud connected')}return}
  if(value!==null&&value!==originalGet.call(localStorage,key)){remoteValue=value;updating=true;originalSet.call(localStorage,key,value);updating=false;notify('Updated on another device');refresh()}
 },err=>{console.error('Firebase subscription failed',err);notify('Cloud unavailable - check access rules')});}
 function refresh(){if(window.parent!==window){window.parent.postMessage({type:'drprevents-sync-refresh',module},location.origin)}else window.location.reload()}
 // Each GitHub Pages origin needs its own Firebase sign-in session.
 const overlay=document.createElement('div');overlay.id='firebase-auth-gate';
 overlay.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#0e1726;color:#f8fafc;display:flex;align-items:center;justify-content:center;padding:20px;font:15px system-ui,sans-serif';
 overlay.innerHTML='<form style="width:min(400px,100%);background:#1c293b;padding:26px;border-radius:14px;border:1px solid #41536b;display:grid;gap:13px"><h2 style="margin:0;font-size:22px">Dr Prevents staff sign in</h2><p style="margin:0;color:#cbd5e1">Sign in with your authorized Firebase staff account to enable secure cloud synchronization.</p><label>Email<input type="email" name="email" autocomplete="username" required style="box-sizing:border-box;width:100%;padding:12px;margin-top:5px;border-radius:7px"></label><label>Password<input type="password" name="password" autocomplete="current-password" required style="box-sizing:border-box;width:100%;padding:12px;margin-top:5px;border-radius:7px"></label><button type="submit" style="padding:12px;background:#3b82f6;border:0;border-radius:7px;color:white;cursor:pointer;font-weight:bold">Sign in</button><p data-auth-error role="alert" style="margin:0;color:#fca5a5"></p></form>';
 const form=overlay.querySelector('form');const error=overlay.querySelector('[data-auth-error]');
 form.addEventListener('submit',async ev=>{ev.preventDefault();error.textContent='Signing in...';const button=form.querySelector('button');button.disabled=true;try{await signInWithEmailAndPassword(auth,form.elements.email.value.trim(),form.elements.password.value);form.elements.password.value='';error.textContent='';}catch(e){console.error('Firebase sign in failed',e);error.textContent=e.code==='auth/invalid-credential'?'Incorrect email or password.':(e.code||e.message);}finally{button.disabled=false;}});
 const mount=()=>{if(!document.body){document.addEventListener('DOMContentLoaded',mount,{once:true});return;}document.body.append(overlay);};mount();
 onAuthStateChanged(auth,user=>{if(user){overlay.style.display='none';notify('Signed in - connecting cloud');connect();}else{overlay.style.display='flex';ready=false;if(unsubscribe){unsubscribe();unsubscribe=null;}notify('Sign in required');}},err=>{console.error('Firebase auth failed',err);error.textContent=err.message;});
 return {module,signOut:()=>signOut(auth)};
}
