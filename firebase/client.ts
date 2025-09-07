import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIs7ZzyXQr2S9Pvbi7uLFUPNGM7DvlziI",
  authDomain: "mockmate-205d6.firebaseapp.com",
  projectId: "mockmate-205d6",
  storageBucket: "mockmate-205d6.firebasestorage.app",
  messagingSenderId: "749807067921",
  appId: "1:749807067921:web:0ad296b4bd54eb82f062b0",
  measurementId: "G-06VH6DXGH7"
};


const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);