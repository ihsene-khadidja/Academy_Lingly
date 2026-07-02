// src/pages/student/StudentLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Student.css";

const NAV_ITEMS = [
  { path: "/dashboard",            icon: "📊", label: "Tableau de bord" },
  { path: "/dashboard/cours",      icon: "📚", label: "Mes cours"       },
  { path: "/dashboard/planning",   icon: "📅", label: "Mon planning"    },
  { path: "/dashboard/resultats",  icon: "🏆", label: "Mes résultats"   },
];

const getInitials = (nom) => {
  if (!nom) return "?";
  const parts = nom.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const StudentLayout = ({ children, title }) => {
  const { pathname } = useLocation();
  const navigate      = useNavigate();
  const { userProfile, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    navigate("/");
  };

  const displayName = userProfile?.nom || "Étudiant";

  return (
    <div className="student-page">

      {/* ── SIDEBAR ── */}
      <aside className={`student-sidebar ${sidebarOpen ? "student-sidebar--open" : ""}`}>

        {/* Logo → retour site public */}
        <Link to="/" className="student-sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <span className="student-logo-fox">🦊</span>
          <div>
            <div className="student-logo-name">Lingly</div>
            <div className="student-logo-sub">Academy</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="student-nav">
          <p className="student-nav-label">Espace Étudiant</p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`student-nav-link ${pathname === item.path ? "student-nav-link--active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="student-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer : avatar + déconnexion */}
        <div className="student-sidebar-footer">
          <div className="student-sidebar-user">
            <div className="student-sidebar-avatar">
              {getInitials(displayName)}
            </div>
            <div>
              <p className="student-sidebar-name">{displayName}</p>
              <p className="student-sidebar-role">
                {userProfile?.groupes?.length
                  ? `${userProfile.groupes.length} groupe(s)`
                  : userProfile?.groupe || "Étudiant"}
              </p>
            </div>
          </div>
          <button className="student-logout-btn" onClick={handleLogout}>
            🚪 Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="student-main">

        {/* Top bar */}
        <div className="student-topbar">
          <button
            className="student-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
          <h1 className="student-page-title">{title}</h1>
          <Link to="/" className="student-topbar-home">← Site public</Link>
        </div>

        {/* Contenu de la page */}
        <div className="student-content">
          {children}
        </div>
      </main>

      {/* Overlay mobile : ferme la sidebar au clic */}
      {sidebarOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentLayout;