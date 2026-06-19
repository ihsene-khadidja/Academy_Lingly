// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// ── Pages publiques
import Home     from "./pages/Home";
import Examens  from "./pages/Examens";
import Tarifs   from "./pages/Tarifs";
import Contact  from "./pages/Contact";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Navbar   from "./pages/Navbar";

// ── Pages privées (Phase 3 & 4 — à créer plus tard)
// import StudentDashboard from "./pages/student/Dashboard";
// import AdminDashboard   from "./pages/admin/Dashboard";

// ─── ROUTE PROTÉGÉE ────────────────────────────────────────────────────────────
// Redirige vers /connexion si l'utilisateur n'est pas connecté
const PrivateRoute = ({ children, roles }) => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Garde en mémoire la page demandée pour y revenir après connexion
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Si des rôles sont requis, vérifie le rôle de l'utilisateur
  if (roles && userProfile && !roles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─── ROUTE PUBLIQUE SEULEMENT ─────────────────────────────────────────────────
// Redirige vers l'accueil si l'utilisateur est DÉJÀ connecté (Login / Register)
const PublicOnlyRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;
  return children;
};

// ─── PAGE TEMPORAIRE ───────────────────────────────────────────────────────────
const ComingSoon = ({ title }) => (
  <div className="page">
    <Navbar />
    <div style={{
      minHeight: "60vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem",
    }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "1rem" }}>
        {title}
      </h1>
      <p style={{ color: "var(--ink-soft)" }}>Cette page arrive bientôt 🚧</p>
    </div>
  </div>
);

// ─── APP ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Pages publiques ── */}
          <Route path="/"        element={<Home />} />
          <Route path="/examens" element={<Examens />} />
          <Route path="/tarifs"  element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cours"   element={<ComingSoon title="Nos Cours" />} />

          {/* ── Auth (login / register) ── */}
          <Route path="/connexion" element={
            <PublicOnlyRoute><Login /></PublicOnlyRoute>
          } />
          <Route path="/inscription" element={
            <PublicOnlyRoute><Register /></PublicOnlyRoute>
          } />

          {/* ── Tableau de bord étudiant (Phase 3) ── */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={["student"]}>
              <ComingSoon title="Tableau de bord étudiant — Phase 3 🚧" />
            </PrivateRoute>
          } />

          {/* ── Tableau de bord admin/prof (Phase 4) ── */}
          <Route path="/admin" element={
            <PrivateRoute roles={["teacher", "admin"]}>
              <ComingSoon title="Tableau de bord professeur — Phase 4 🚧" />
            </PrivateRoute>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;