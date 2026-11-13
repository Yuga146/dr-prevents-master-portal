
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCouVRRLKymy1QE7LZazrji-xkbdQxd1tA",
  authDomain: "dr-prevents-master-portal.firebaseapp.com",
  projectId: "dr-prevents-master-portal",
  storageBucket: "dr-prevents-master-portal.firebasestorage.app",
  messagingSenderId: "469793236119",
  appId: "1:469793236119:web:318b32181c1be839b6f5d2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  app,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc
};
