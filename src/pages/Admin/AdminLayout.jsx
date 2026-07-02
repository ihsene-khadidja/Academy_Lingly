// src/pages/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const NAV = [
  { section: "TABLEAU DE BORD", items: [
    { path: "/admin",          icon: "📊", label: "Vue d'ensemble" },
  ]},
  { section: "GESTION", items: [
    { path: "/admin/students", icon: "👩‍🎓", label: "Étudiants" },
    { path: "/admin/lessons",  icon: "📚", label: "Cours" },
    { path: "/admin/schedule", icon: "📅", label: "Planning" },
  ]},
  { section: "SITE PUBLIC", items: [
    { path: "/", icon: "🏠", label: "Retour au site" },
  ]},
];

const AdminLayout = ({ children, title }) => {
  const { pathname }  = useLocation();
  const navigate      = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/"); };
  const initiale = (userProfile?.nom || currentUser?.email || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-page">
      {/* ── Overlay mobile ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:199 }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <Link to="/admin" className="admin-sidebar-logo" onClick={() => setOpen(false)}>
          <span className="admin-sidebar-logo-icon">🦊</span>
          <div>
            <div className="admin-sidebar-logo-title">Lingly</div>
            <div className="admin-sidebar-logo-sub">Admin</div>
          </div>
        </Link>

        <nav style={{ flex:1, overflowY:"auto" }}>
          {NAV.map((s) => (
            <div key={s.section}>
              <div className="admin-sidebar-label">{s.section}</div>
              <ul className="admin-nav">
                {s.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`admin-nav-link ${pathname === item.path ? "admin-nav-link--active" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="admin-nav-link-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">{initiale}</div>
            <div>
              <div className="admin-user-name">{userProfile?.nom || "Admin"}</div>
              <div className="admin-user-role">Professeur / Admin</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            🚪 Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
            <button className="admin-menu-toggle" onClick={() => setOpen((o) => !o)}>☰</button>
            <span className="admin-topbar-title">{title}</span>
          </div>
          <div className="admin-topbar-right">
            <span style={{ fontSize:".82rem", color:"var(--ink-soft)", fontFamily:"var(--font-display)", fontWeight:700 }}>
              🟢 En ligne
            </span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;