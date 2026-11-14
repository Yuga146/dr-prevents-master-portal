
import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyCouVRRLKymy1QE7LZazrji-xkbdQxd1tA',
  authDomain: 'dr-prevents-master-portal.firebaseapp.com',
  projectId: 'dr-prevents-master-portal',
  storageBucket: 'dr-prevents-master-portal.firebasestorage.app',
  messagingSenderId: '469793236119',
  appId: '1:469793236119:web:318b32181c1be839b6f5d2'
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export function watchModule(moduleName, onData, onError = console.error) {
  return onSnapshot(doc(db, 'portalData', moduleName), snapshot => {
    onData(snapshot.exists() ? snapshot.data().data : null);
  }, onError);
}

export async function saveModule(moduleName, data) {
  await setDoc(doc(db, 'portalData', moduleName), {
    data,
    updatedAt: serverTimestamp()
  });
}

export async function loadModule(moduleName) {
  const snapshot = await getDoc(doc(db, 'portalData', moduleName));
  return snapshot.exists() ? snapshot.data().data : null;
}
