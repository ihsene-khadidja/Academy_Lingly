// src/pages/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LINKS = [
  { path: "/",        label: "Accueil" },
  { path: "/cours",   label: "Cours" },
  { path: "/examens", label: "Examens" },
  { path: "/tarifs",  label: "Tarifs" },
  { path: "/contact", label: "Contact" },
];

// ─── Initiales de l'utilisateur pour l'avatar ─────────────────────────────────
const getInitials = (nom) => {
  if (!nom) return "?";
  const parts = nom.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  const [logoError, setLogoError] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  // Nom affiché : profil Firestore > Firebase displayName > email
  const displayName =
    userProfile?.nom ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Mon compte";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Lingly Academy"
              className="logo-img"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="logo-fallback">
              <span className="logo-fox">🦊</span>
              <div>
                <div className="logo-title">Lingly</div>
                <div className="logo-sub">Academy</div>
              </div>
            </div>
          )}
        </Link>

        {/* ── Liens nav ── */}
        <ul className="nav-links">
          {LINKS.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${pathname === link.path ? "nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Actions ── */}
        <div className="nav-actions">
          {currentUser ? (
            /* Utilisateur connecté : avatar + menu déroulant */
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: ".5rem",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px",
                }}
              >
                {/* Avatar initiales */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #F5A623 0%, #E85D04 100%)",
                  color: "#fff", fontFamily: "var(--font-display)",
                  fontWeight: 900, fontSize: ".95rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {getInitials(displayName)}
                </div>
                {/* Nom raccourci */}
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: ".9rem", color: "var(--ink)", maxWidth: 120,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {displayName.split(" ")[0]}
                </span>
                <span style={{ color: "var(--ink-soft)", fontSize: ".8rem" }}>▾</span>
              </button>

              {/* Menu déroulant */}
              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", borderRadius: 14, minWidth: 200,
                  boxShadow: "0 14px 44px rgba(26,26,46,.16)",
                  border: "1px solid #e8eaf2", overflow: "hidden", zIndex: 200,
                }}>
                  {/* Info utilisateur */}
                  <div style={{ padding: "1rem 1.1rem", borderBottom: "1px solid #e8eaf2" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: ".95rem", color: "var(--ink)" }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: ".8rem", color: "var(--ink-soft)", marginTop: ".15rem" }}>
                      {userProfile?.role === "teacher" ? "👨‍🏫 Professeur" : "🎒 Étudiant"}
                    </p>
                  </div>

                  {/* Lien tableau de bord selon rôle */}
                  <Link
                    to={userProfile?.role === "teacher" ? "/admin" : "/dashboard"}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block", padding: ".75rem 1.1rem",
                      textDecoration: "none", color: "var(--ink)",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: ".9rem",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#F0F4FF"}
                    onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    📊 Mon tableau de bord
                  </Link>

                  {/* Déconnexion */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", background: "none", border: "none",
                      padding: ".75rem 1.1rem", textAlign: "left",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: ".9rem",
                      color: "#E85D04", cursor: "pointer",
                      borderTop: "1px solid #e8eaf2",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#FBE6C7"}
                    onMouseLeave={(e) => e.target.style.background = "none"}
                  >
                    🚪 Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Utilisateur non connecté */
            <>
              <Link to="/connexion" className="btn btn--outline-orange">
                Se connecter
              </Link>
              <Link to="/inscription" className="btn btn--grad">
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Ferme le menu si on clique ailleurs */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 150 }}
        />
      )}
    </nav>
  );
};

export default Navbar;