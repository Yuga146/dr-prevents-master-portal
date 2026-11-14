import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getFirestore,doc,onSnapshot,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const config={apiKey:'AIzaSyCouVRRLKymy1QE7LZazrji-xkbdQxd1tA',authDomain:'dr-prevents-master-portal.firebaseapp.com',projectId:'dr-prevents-master-portal',storageBucket:'dr-prevents-master-portal.firebasestorage.app',messagingSenderId:'469793236119',appId:'1:469793236119:web:318b32181c1be839b6f5d2'};
const app=initializeApp(config);const db=getFirestore(app);
const mapping={'prevents_roster_v14':'roster','pantai-lab-user-tests-v1':'lab','drprevents_panel_finder_v2':'panel','dr_prevents_branches_v3':'branch'};
export function startSync(key){
 const module=mapping[key];if(!module)throw Error('Unknown storage key');
 const originalSet=Storage.prototype.setItem;const originalGet=Storage.prototype.getItem;
 const ref=doc(db,'workspaceData',module);
 let ready=false,remoteValue=null,updating=false,dirty=false;
 const notify=(message)=>{let badge=document.getElementById('firebase-sync-indicator');if(!badge){badge=document.createElement('div');badge.id='firebase-sync-indicator';badge.style.cssText='position:fixed;bottom:8px;right:8px;z-index:2147483647;background:#17212b;color:white;border:1px solid #506071;border-radius:6px;padding:5px 9px;font:12px sans-serif;pointer-events:none';document.body.append(badge)}badge.textContent=message};
 const save=async(value)=>{try{notify('Syncing...');await setDoc(ref,{value,updatedAt:serverTimestamp()});notify('Cloud synced')}catch(err){console.error('Firebase save failed',err);notify('Sync error - changes only on this device')}};
 Storage.prototype.setItem=function(k,v){const result=originalSet.apply(this,arguments);if(this===localStorage&&k===key&&!updating){if(ready){if(v!==remoteValue){remoteValue=v;save(v)}}else dirty=true}return result};
 onSnapshot(ref,snapshot=>{
  const value=snapshot.exists()?snapshot.data().value:null;
  if(!ready){ready=true;if(value===null){notify('Cloud connected - save to publish');if(dirty){const local=originalGet.call(localStorage,key);if(local!==null){remoteValue=local;save(local)}}}else{remoteValue=value;const current=originalGet.call(localStorage,key);if(current!==value){updating=true;originalSet.call(localStorage,key,value);updating=false;notify('Cloud data loaded');refresh()}else notify('Cloud connected')}return}
  if(value!==null&&value!==originalGet.call(localStorage,key)){remoteValue=value;updating=true;originalSet.call(localStorage,key,value);updating=false;notify('Updated on another device');refresh()}
 },err=>{console.error('Firebase subscription failed',err);notify('Cloud unavailable - check access rules')});
 function refresh(){if(window.parent!==window){window.parent.postMessage({type:'drprevents-sync-refresh',module},location.origin)}else window.location.reload()}
 return {module};
}
