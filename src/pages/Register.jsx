// src/pages/Register.jsx
// Inscription publique = élève uniquement. Les comptes prof et admin sont
// créés depuis l'espace admin (page Profs), jamais en libre-service.
// Remarque : même dans l'ancienne version de cette page, le rôle "Professeur"
// choisi ici n'était jamais réellement appliqué — signup()/loginWithGoogle()
// imposent toujours "student" et ignorent tout paramètre role envoyé. Ce
// sélecteur ne changeait donc déjà rien en pratique ; il est retiré ici.
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

// ─── PAGE REGISTER ────────────────────────────────────────────────────────────
const Register = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [logoError, setLogoError] = useState(false);
  const [form, setForm]       = useState({ nom: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    if (!form.nom.trim())               return "Veuillez entrer votre nom complet.";
    if (form.password.length < 6)       return "Le mot de passe doit contenir au moins 6 caractères.";
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
      await signup(form.email, form.password, form.nom.trim());
      navigate("/dashboard");
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
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape--1" />
      <div className="auth-bg-shape auth-bg-shape--2" />
      <div className="auth-bg-shape auth-bg-shape--3" />

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

        <h1 className="auth-card-title">Créer un compte</h1>
        <p className="auth-card-subtitle">Rejoignez Lingly Academy et accédez à vos cours dès aujourd'hui.</p>

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

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn--grad btn--block"
            disabled={loading}
          >
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
