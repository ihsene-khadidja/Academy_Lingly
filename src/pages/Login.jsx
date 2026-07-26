// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth, isAdminRole, isProfRole } from "../contexts/AuthContext";
import "./Auth.css";

// ─── Icône Google ─────────────────────────────────────────────────────────────
// Seule icône conservée : c'est un repère de marque fonctionnel (pas une
// décoration), nécessaire pour que le bouton soit reconnaissable.
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── RÔLES ────────────────────────────────────────────────────────────────────
// L'onglet choisi ici est un repère visuel uniquement (sous-titre affiché).
// Le rôle réel utilisé pour la redirection vient toujours de Firestore —
// voir resolveDashboard plus bas — donc peu importe l'onglet cliqué, la
// personne atterrit toujours sur le bon espace.
const ROLES = [
  { key: "student", label: "Élève" },
  { key: "prof",     label: "Professeur" },
  { key: "admin",    label: "Admin" },
];

const ROLE_INTRO = {
  student: "Accédez à vos cours, votre planning et vos résultats.",
  prof:    "Gérez vos groupes : présences, cours et suivi pédagogique.",
  admin:   "Administration de Lingly Academy.",
};

// ─── MESSAGES D'ERREUR FIREBASE ───────────────────────────────────────────────
const getFirebaseError = (code) => {
  const errors = {
    "auth/user-not-found":     "Aucun compte trouvé avec cet email.",
    "auth/wrong-password":     "Mot de passe incorrect. Réessayez.",
    "auth/invalid-email":      "L'adresse email n'est pas valide.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
    "auth/too-many-requests":  "Trop de tentatives. Réessayez dans quelques minutes.",
    "auth/popup-closed-by-user": "La fenêtre Google a été fermée. Réessayez.",
    "auth/network-request-failed": "Problème de connexion réseau.",
  };
  return errors[code] || "Une erreur est survenue. Réessayez.";
};

// ─── PAGE LOGIN ────────────────────────────────────────────────────────────────
const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole]           = useState("student");
  const [logoError, setLogoError] = useState(false);
  const [form, setForm]           = useState({ email: "", password: "" });
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Détermine le tableau de bord à rejoindre à partir du VRAI rôle Firestore
  // du compte (indépendant de l'onglet choisi ci-dessus).
  const resolveDashboard = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    const profile = snap.exists() ? snap.data() : null;
    if (isAdminRole(profile)) return "/admin";
    if (isProfRole(profile))  return "/prof";
    return "/dashboard";
  };

  const afterLogin = async (uid) => {
    const from = location.state?.from?.pathname;
    navigate(from || (await resolveDashboard(uid)), { replace: true });
  };

  // ── Connexion Email / Mot de passe ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      await afterLogin(result.user.uid);
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Connexion Google ────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      await afterLogin(result.user.uid);
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Formes floues en arrière-plan — donnent l'effet de profondeur/verre dépoli */}
      <div className="auth-bg-shape auth-bg-shape--1" />
      <div className="auth-bg-shape auth-bg-shape--2" />
      <div className="auth-bg-shape auth-bg-shape--3" />

      {/* Carte unique */}
      <div className="auth-card">
        <Link to="/" className="auth-brand-logo">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Lingly Academy"
              className="logo-img"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="auth-brand-fallback">Lingly Academy</span>
          )}
        </Link>

        <div className="auth-role-tabs">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`auth-role-tab ${role === r.key ? "auth-role-tab--active" : ""}`}
              onClick={() => setRole(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <h1 className="auth-card-title">Se connecter</h1>
        <p className="auth-card-subtitle">{ROLE_INTRO[role]}</p>

        <button
          type="button"
          className="btn btn--google btn--block"
          onClick={handleGoogle}
          disabled={loading}
        >
          <GoogleIcon />
          Continuer avec Google
        </button>

        <div className="auth-divider">ou avec votre email</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="vous@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Mot de passe
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn--grad btn--block"
            disabled={loading}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Pas de compte ? <Link to="/inscription">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
