// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Auth.css";

// ─── Icône Google ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── PANNEAU GAUCHE ───────────────────────────────────────────────────────────
const LeftPanel = () => (
  <div className="auth-panel-left">
    <Link to="/" className="auth-brand-logo">
      <img
        src="/logo.png"
        alt="Lingly Academy"
        className="logo-img"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <span className="auth-brand-fox">🦊</span>
      <div>
        <div className="auth-brand-name">Lingly</div>
        <div className="auth-brand-sub">Academy</div>
      </div>
    </Link>

    <h2 className="auth-panel-tagline">
      Commencez<br />
      à apprendre<br />
      <span className="text-amber">aujourd'hui</span>
    </h2>
    <p className="auth-panel-desc">
      Créez votre compte en quelques secondes et accédez immédiatement
      à des centaines d'exercices et de cours.
    </p>

    <ul className="auth-perks">
      <li className="auth-perk">
        <span className="auth-perk-icon">🎁</span>
        Exercices 100% gratuits dès l'inscription
      </li>
      <li className="auth-perk">
        <span className="auth-perk-icon">👨‍🏫</span>
        Suivis par de vrais professeurs
      </li>
      <li className="auth-perk">
        <span className="auth-perk-icon">🌍</span>
        6 langues : FR, EN, AR, TR, ES, DE
      </li>
    </ul>
  </div>
);

// ─── FORMULAIRE D'INSCRIPTION ─────────────────────────────────────────────────
const RegisterForm = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [role, setRole] = useState("student");  // "student" | "teacher"
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    if (!form.nom.trim())           return "Veuillez entrer votre nom complet.";
    if (form.password.length < 6)   return "Le mot de passe doit contenir au moins 6 caractères.";
    if (form.password !== form.confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  // ── Inscription Email / Mot de passe ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError("");
    setLoading(true);
    try {
      await signup(form.email, form.password, form.nom.trim(), role);
      navigate("/");   // Redirige vers l'accueil après inscription
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Inscription Google ─────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(role);
      navigate("/");
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card-title">Créer un compte</h1>
      <p className="auth-card-subtitle">
        Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
      </p>

      {/* Sélecteur de rôle */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: ".9rem", fontWeight: 700, color: "var(--ink)", marginBottom: ".5rem" }}>
          Je suis…
        </p>
        <div className="auth-role-group">
          <button
            type="button"
            className={`auth-role-btn ${role === "student" ? "auth-role-btn--active" : ""}`}
            onClick={() => setRole("student")}
          >
            🎒 Étudiant
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === "teacher" ? "auth-role-btn--active" : ""}`}
            onClick={() => setRole("teacher")}
          >
            👨‍🏫 Professeur
          </button>
        </div>
      </div>

      {/* Bouton Google */}
      <button
        type="button"
        className="btn btn--google btn--block"
        onClick={handleGoogle}
        disabled={loading}
        style={{ marginBottom: "1.25rem" }}
      >
        <GoogleIcon />
        Continuer avec Google
      </button>

      <div className="auth-divider">ou avec votre email</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Nom complet
          <input
            type="text"
            name="nom"
            className="auth-input"
            placeholder="Votre prénom et nom"
            value={form.nom}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </label>

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
            placeholder="6 caractères minimum"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>

        <label className="auth-label">
          Confirmer le mot de passe
          <input
            type="password"
            name="confirm"
            className={`auth-input ${form.confirm && form.confirm !== form.password ? "auth-input--error" : ""}`}
            placeholder="Répétez le mot de passe"
            value={form.confirm}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className="auth-error">⚠️ {error}</p>}

        <button
          type="submit"
          className="btn btn--grad btn--block"
          disabled={loading}
          style={{ marginTop: ".25rem" }}
        >
          {loading ? "Création du compte…" : "Créer mon compte"}
        </button>
      </form>

      <p className="auth-switch">
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </div>
  );
};

// ─── PAGE REGISTER ────────────────────────────────────────────────────────────
const Register = () => (
  <div className="auth-page">
    <LeftPanel />
    <div className="auth-panel-right">
      <RegisterForm />
    </div>
  </div>
);

// ─── MESSAGES D'ERREUR FIREBASE ───────────────────────────────────────────────
const getFirebaseError = (code) => {
  const errors = {
    "auth/email-already-in-use":   "Cet email est déjà utilisé. Connectez-vous ou changez d'email.",
    "auth/invalid-email":          "L'adresse email n'est pas valide.",
    "auth/weak-password":          "Le mot de passe est trop faible (6 caractères minimum).",
    "auth/popup-closed-by-user":   "La fenêtre Google a été fermée. Réessayez.",
    "auth/network-request-failed": "Problème de connexion réseau.",
  };
  return errors[code] || "Une erreur est survenue. Réessayez.";
};

export default Register;