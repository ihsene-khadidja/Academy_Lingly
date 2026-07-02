// src/firebase/config.js
//
// 1. Va sur https://console.firebase.google.com
// 2. Crée un projet, puis enregistre une application Web (icône </>)
// 3. Copie l'objet "firebaseConfig" qui t'est donné et remplace les valeurs ci-dessous
// 4. Active "Authentication" > "Sign-in method" > "E-mail/Mot de passe" ET "Google"
// 5. Active "Firestore Database" (mode test pour commencer)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5R97q5lAFPbiGBOj8-TFFiL_RdSG6iOM",
  authDomain: "lingly-academy.firebaseapp.com",
  projectId: "lingly-academy",
  storageBucket: "lingly-academy.firebasestorage.app",
  messagingSenderId: "826854206699",
  appId: "1:826854206699:web:35733d0ba26b601320a2ae",
  measurementId: "G-HQC3F7GSKQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
