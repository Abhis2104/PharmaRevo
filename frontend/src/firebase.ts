import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDmIJFDjrnSXs0FXKL-9VGBlZ2NdNMkMfA",
  authDomain: "pharmarevo-53c74.firebaseapp.com",
  projectId: "pharmarevo-53c74",
  storageBucket: "pharmarevo-53c74.appspot.com",
  messagingSenderId: "781901846437",
  appId: "1:781901846437:web:b6c67d340deefe801e3a4c",
  measurementId: "G-10RMXXFS6X"
};

// ✅ Prevent duplicate app initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app, "gs://pharmarevo-53c74.appspot.com");

export { db, auth, storage };
