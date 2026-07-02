// src/pages/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, isAdminRole, isStudentRole } from "../contexts/AuthContext";
import "./Navbar.css";
// ─── NAV LINKS par contexte ────────────────────────────────────────────────────
const PUBLIC_LINKS = [
  { path: "/",        label: "Accueil"  },
  { path: "/cours",   label: "Cours"    },
  { path: "/examens", label: "Examens"  },
  { path: "/tarifs",  label: "Tarifs"   },
  { path: "/contact", label: "Contact"  },
];

const STUDENT_LINKS = [
  { path: "/dashboard",            label: " Accueil"   },
  { path: "/dashboard/cours",      label: " Mes cours" },
  { path: "/dashboard/planning",   label: " Planning"  },
  { path: "/dashboard/resultats",  label: " Résultats" },
];

const ADMIN_LINKS = [
  { path: "/admin",           label: " Dashboard"  },
  { path: "/admin/students",  label: " Étudiants" },
  { path: "/admin/lessons",   label: " Leçons"     },
  { path: "/admin/schedule",  label: " Planning"   },
];

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [logoError, setLogoError] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  const isAdmin   = isAdminRole(userProfile);
  const isStudent = isStudentRole(userProfile);
  const isLogged  = !!currentUser;

  // Choisit les liens selon le contexte
  const links = isAdmin ? ADMIN_LINKS : isStudent ? STUDENT_LINKS : PUBLIC_LINKS;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Logo ── */}
        <Link to={isAdmin ? "/admin" : isStudent ? "/dashboard" : "/"} className="navbar-logo">
          {!logoError ? (
            <img src="/logo.png" alt="Lingly Academy" className="logo-img"
              onError={() => setLogoError(true)} />
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

        {/* ── Nav links (desktop) ── */}
        <ul className="nav-links">
          {links.map((link) => (
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

        {/* ── Actions droite ── */}
        <div className="nav-actions">
          {!isLogged ? (
            /* Pas connecté */
            <>
              <Link to="/connexion"   className="btn btn--outline-orange">Se connecter</Link>
              <Link to="/inscription" className="btn btn--grad">Commencer</Link>
            </>
          ) : (
            /* Connecté — avatar + menu déroulant */
            <div className="nav-user-menu">
              <button
                className="nav-user-btn"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <div className="nav-avatar">
                  {(userProfile?.nom || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">
                  {userProfile?.nom?.split(" ")[0] || currentUser.email?.split("@")[0]}
                </span>
                <span className="nav-chevron">{menuOpen ? "▲" : "▼"}</span>
              </button>

              {menuOpen && (
                <div className="nav-dropdown" onClick={() => setMenuOpen(false)}>
                  {/* Badge rôle */}
                  <div className="nav-dropdown-header">
                    <span className={`nav-role-badge ${isAdmin ? "nav-role-badge--admin" : "nav-role-badge--student"}`}>
                      {isAdmin ? "👨‍🏫 Professeur" : "👩‍🎓 Étudiant"}
                    </span>
                    <span className="nav-dropdown-email">{currentUser.email}</span>
                  </div>

                  <div className="nav-dropdown-divider" />

                  {/* Liens du dashboard */}
                  {(isAdmin ? ADMIN_LINKS : STUDENT_LINKS).map((link) => (
                    <Link key={link.path} to={link.path} className="nav-dropdown-item">
                      {link.label}
                    </Link>
                  ))}

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleLogout}>
                    🚪 Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Burger mobile */}
          <button className="nav-burger" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="nav-mobile">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-mobile-link ${pathname === link.path ? "nav-mobile-link--active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLogged && (
            <button className="nav-mobile-link nav-mobile-link--danger" onClick={handleLogout}>
              🚪 Se déconnecter
            </button>
          )}
          {!isLogged && (
            <>
              <Link to="/connexion"   className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Se connecter</Link>
              <Link to="/inscription" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
