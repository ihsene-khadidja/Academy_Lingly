// src/utils/createProfAccount.js
//
// Problème : côté client, `createUserWithEmailAndPassword` connecte
// automatiquement l'app en tant que l'utilisateur nouvellement créé — ce qui
// déconnecterait l'admin en train de créer le compte du prof.
//
// Solution classique (pas de backend/Cloud Functions nécessaire) : on ouvre
// une seconde instance Firebase temporaire, on l'utilise pour créer le compte,
// puis on la détruit. La session de l'admin dans l'app principale n'est
// jamais touchée.
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { firebaseConfig } from "../firebase/config";

export async function createProfAuthAccount(email, password, nom) {
  const secondaryApp  = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const result = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    if (nom) await updateProfile(result.user, { displayName: nom });
    const uid = result.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}