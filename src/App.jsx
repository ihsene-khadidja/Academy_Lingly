// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth, isAdminRole, isStudentRole } from "./contexts/AuthContext";

// ── Pages publiques
import Home     from "./pages/Home";
import Examens  from "./pages/Examens";
import Tarifs   from "./pages/Tarifs";
import Contact  from "./pages/Contact";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Navbar   from "./pages/Navbar";

// ── Pages étudiant (Phase 3) ✅ activées
// Fichiers réels : src/pages/student/{Dashboard,MyCourses,Planning,Results,InfoEleve,StudentLayout}.jsx
import StudentDashboard from "./pages/student/Dashboard";
import MyCourses        from "./pages/student/MyCourses";
import Planning         from "./pages/student/Planning";
import Results          from "./pages/student/Results";
import InfoEleve        from "./pages/student/InfoEleve";

// ── Pages admin / professeur (Phase 4) ✅
// Fichiers réels : src/pages/admin/{Dashboard,Students,Lessons,Schedule,AdminLayout}.jsx
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents  from "./pages/admin/Students";
import AdminLessons   from "./pages/admin/Lessons";
import AdminSchedule  from "./pages/admin/Schedule";

// ─── ROUTE PROTÉGÉE ────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, type }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  // ⏳ Attend que Firebase charge le profil Firestore
  if (loading) return null;

  // ❌ Pas connecté → login
  if (!currentUser) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // ❌ Route admin → vérifie role "Professeur", "teacher" ou "admin"
  if (type === "admin" && !isAdminRole(userProfile)) {
    return <Navigate to="/" replace />;
  }

  // ❌ Route étudiant → vérifie role "student" ou "etudiant"
  if (type === "student" && !isStudentRole(userProfile)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Autorisé
  return children;
};

// ─── ROUTE PUBLIQUE SEULEMENT ─────────────────────────────────────────────────
const PublicOnlyRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return null;

  // Si connecté → redirige vers le bon dashboard selon le rôle
  if (currentUser) {
    if (isAdminRole(userProfile)) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ─── PAGE TEMPORAIRE (utilisée uniquement pour "Cours" public, pas encore fait) ─
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

          {/* ══════════════════════════════════════════════
              PAGES PUBLIQUES
          ══════════════════════════════════════════════ */}
          <Route path="/"        element={<Home />} />
          <Route path="/examens" element={<Examens />} />
          <Route path="/tarifs"  element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cours"   element={<ComingSoon title="Nos Cours" />} />

          {/* ══════════════════════════════════════════════
              AUTH — login / inscription
              Redirige vers /admin si prof, /dashboard si étudiant
          ══════════════════════════════════════════════ */}
          <Route path="/connexion" element={
            <PublicOnlyRoute><Login /></PublicOnlyRoute>
          } />
          <Route path="/inscription" element={
            <PublicOnlyRoute><Register /></PublicOnlyRoute>
          } />

          {/* ══════════════════════════════════════════════
              PHASE 3 — TABLEAU DE BORD ÉTUDIANT ✅ activé
          ══════════════════════════════════════════════ */}
          <Route path="/dashboard" element={
            <PrivateRoute type="student">
              <StudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard/cours" element={
            <PrivateRoute type="student">
              <MyCourses />
            </PrivateRoute>
          } />
          <Route path="/dashboard/planning" element={
            <PrivateRoute type="student">
              <Planning />
            </PrivateRoute>
          } />
          <Route path="/dashboard/resultats" element={
            <PrivateRoute type="student">
              <Results />
            </PrivateRoute>
          } />
          <Route path="/dashboard/info" element={
            <PrivateRoute type="student">
              <InfoEleve />
            </PrivateRoute>
          } />

          {/* ══════════════════════════════════════════════
              PHASE 4 — TABLEAU DE BORD ADMIN / PROFESSEUR ✅
              role "Professeur" OU "teacher" OU "admin"
          ══════════════════════════════════════════════ */}
          <Route path="/admin" element={
            <PrivateRoute type="admin"><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute type="admin"><AdminStudents /></PrivateRoute>
          } />
          <Route path="/admin/lessons" element={
            <PrivateRoute type="admin"><AdminLessons /></PrivateRoute>
          } />
          <Route path="/admin/schedule" element={
            <PrivateRoute type="admin"><AdminSchedule /></PrivateRoute>
          } />

          {/* ══════════════════════════════════════════════
              404
          ══════════════════════════════════════════════ */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
