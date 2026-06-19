// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// ─── CONTEXTE ──────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// Hook pratique pour utiliser le contexte n'importe où
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
};

// ─── PROVIDER ──────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);   // objet Firebase Auth
  const [userProfile, setUserProfile] = useState(null);    // document Firestore
  const [loading, setLoading] = useState(true);            // évite le flash de contenu

  // ── Crée le document Firestore si inexistant ──────────────────────────
  const createUserDocument = async (firebaseUser, extraData = {}) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: firebaseUser.uid,
        nom: extraData.nom || firebaseUser.displayName || "",
        email: firebaseUser.email,
        role: extraData.role || "student",   // "student" | "teacher" | "admin"
        langue: "",
        groupe: "",
        createdAt: serverTimestamp(),
      });
    }
    // Recharge le profil dans l'état
    const updated = await getDoc(ref);
    setUserProfile(updated.data());
    return updated.data();
  };

  // ── Inscription Email / Mot de passe ──────────────────────────────────
  const signup = async (email, password, nom, role = "student") => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nom });
    await createUserDocument(result.user, { nom, role });
    return result;
  };

  // ── Connexion Email / Mot de passe ────────────────────────────────────
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Charge le profil depuis Firestore
    const ref = doc(db, "users", result.user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setUserProfile(snap.data());
    return result;
  };

  // ── Connexion Google ──────────────────────────────────────────────────
  const loginWithGoogle = async (role = "student") => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user, { role });
    return result;
  };

  // ── Déconnexion ───────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // ── Écoute les changements de session ─────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUserProfile(snap.data());
        else await createUserDocument(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,   // Firebase user (uid, email, displayName…)
    userProfile,   // Firestore doc (role, nom, groupe, langue…)
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  };

  // Tant que Firebase vérifie la session, on n'affiche rien
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
