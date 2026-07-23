// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "./StudentLayout";

// ─── Un(e) étudiant(e) peut appartenir à un ou plusieurs groupes, et le
// profil Firestore peut stocker ça de plusieurs façons :
//   groupes: ["G1","G2"]                        (tableau de noms)
//   groupes: [{ nom: "G1", langue, niveau }, …]  (objets, clé "nom")
//   groupes: [{ groupe: "G1", … }, …]            (variante, clé "groupe")
//   groupe: "G1"                                 (ancien champ unique)
// Avant, ce fichier supposait que "groupes" était toujours un tableau de
// textes simples : si c'était en réalité un tableau d'objets, `.split("-")`
// plantait (les objets n'ont pas cette méthode) → React arrête tout
// l'affichage → page blanche. On normalise donc toujours vers un tableau
// de NOMS (chaînes) avant de s'en servir.
function getGroupNames(profile) {
  if (!profile) return [];
  if (Array.isArray(profile.groupes)) {
    return profile.groupes
      .map((g) => (typeof g === "string" ? g : g?.nom || g?.groupe || g?.name || g?.id || null))
      .filter(Boolean);
  }
  if (profile.groupe) return [profile.groupe];
  return [];
}

// ─── COULEURS PAR LANGUE ──────────────────────────────────────────────────────
const LANG_DOT = {
  "Anglais":  "#4A6CF7", "Français": "#F5A623",
  "Arabe":    "#34C88A", "Turc":     "#D4537E",
  "Espagnol": "#E85D04", "Allemand": "#64748B",
};

// ─── CARTE DE BIENVENUE ───────────────────────────────────────────────────────
const WelcomeCard = ({ nom }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const prenom = nom?.split(" ")[0] || "cher étudiant";

  return (
    <div className="dash-welcome">
      <div className="dash-welcome-text">
        <p className="dash-welcome-hi">{greeting}, {prenom} ! 👋</p>
        <p className="dash-welcome-sub">
          Bienvenue dans votre espace étudiant Lingly Academy.
        </p>
      </div>
      <span className="dash-welcome-mascot">🦊</span>
    </div>
  );
};

// ─── STATS RAPIDES ────────────────────────────────────────────────────────────
const StatsRow = ({ stats }) => {
  const items = [
    { icon: "📚", bg: "#EEF2FF", val: stats.courses,  lbl: "Cours disponibles" },
    { icon: "📅", bg: "#FEF9C3", val: stats.sessions, lbl: "Séances ce mois" },
    { icon: "🏆", bg: "#D1FAE5", val: stats.exams,    lbl: "Examens passés" },
    { icon: "🌍", bg: "#FCE7F3", val: stats.langues,  lbl: "Langue(s) suivie(s)" },
  ];
  return (
    <div className="dash-stats">
      {items.map((item, i) => (
        <div className="dash-stat" key={i}>
          <div className="dash-stat-icon" style={{ background: item.bg }}>
            {item.icon}
          </div>
          <div>
            <div className="dash-stat-val">{item.val ?? "–"}</div>
            <div className="dash-stat-lbl">{item.lbl}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── PROCHAINES SÉANCES ───────────────────────────────────────────────────────
const UpcomingCard = ({ sessions, loading }) => {
  const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const MONTHS  = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  return (
    <div className="s-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "1.25rem 1.5rem .5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="s-section-title" style={{ margin: 0 }}>Prochaines séances</h2>
        <Link to="/dashboard/planning" className="btn btn--ghost btn--sm">Voir tout</Link>
      </div>

      {loading ? (
        <div className="s-loader" />
      ) : sessions.length === 0 ? (
        <div className="s-empty" style={{ padding: "2rem" }}>
          <span className="s-empty-icon">📅</span>
          <p className="s-empty-title">Aucune séance à venir</p>
          <p className="s-empty-desc">
            Votre professeur n'a pas encore ajouté de séances.<br />
            Revenez bientôt !
          </p>
        </div>
      ) : (
        <div className="upcoming-list">
          {sessions.map((s, i) => (
            <div className="upcoming-item" key={s.id || i}>
              <div
                className="upcoming-dot"
                style={{ background: LANG_DOT[s.langue] || "#94a3b8" }}
              />
              <div className="upcoming-info">
                <div className="upcoming-time">{formatDate(s.date)} · {s.heure}</div>
                <div className="upcoming-name">{s.langue} — {s.groupe}</div>
                <div className="upcoming-meta">👨‍🏫 {s.prof} · 📍 {s.salle || "À définir"}</div>
              </div>
              <span
                className="status-pill"
                style={{ background: "#EEF2FF", color: "#4A6CF7" }}
              >
                {s.type || "Cours"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PROFIL RAPIDE ────────────────────────────────────────────────────────────
const ProfileCard = ({ userProfile, email }) => {
  const getInitials = (nom) => {
    if (!nom) return "?";
    const parts = nom.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  // Groupes : toujours normalisés en tableau de NOMS (chaînes)
  const groupes = getGroupNames(userProfile);

  return (
    <div className="s-card">
      <div className="profile-card">
        <div className="profile-avatar">{getInitials(userProfile?.nom)}</div>
        <p className="profile-name">{userProfile?.nom || "–"}</p>
        <p className="profile-email">{email}</p>
        <div className="profile-rows">
          <div className="profile-row">
            <span></span>
            <span>
              <strong>Langue(s) : </strong>
              {groupes.length
                ? groupes.map((g) => g.split("-")[0]).join(", ")
                : "Non assigné"}
            </span>
          </div>
          <div className="profile-row">
            <span></span>
            <span>
              <strong>Groupe(s) : </strong>
              {groupes.length ? groupes.join(", ") : "Non assigné"}
            </span>
          </div>
          <div className="profile-row">
            <span></span>
            <span>
              <strong>Niveau : </strong>
              {userProfile?.niveau || "Non assigné"}
            </span>
          </div>
          <div className="profile-row">
            <span></span>
            <span>
              <strong>Professeur : </strong>
              {userProfile?.professeur || "Non assigné"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats]   = useState({ courses: 0, sessions: 0, exams: 0, langues: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];

        // Groupes de l'étudiant, toujours normalisés en tableau de NOMS
        // (chaînes) — Firestore "where(..., 'in', groupes)" a besoin de
        // valeurs simples, pas d'objets.
        const groupes = getGroupNames(userProfile);

        if (groupes.length) {
          // Prochaines séances (toutes les langues confondues)
          const sessionsQ = query(
            collection(db, "schedules"),
            where("groupe", "in", groupes),
            where("date", ">=", today),
            orderBy("date"),
            orderBy("heure"),
            limit(4)
          );
          const sessSnap = await getDocs(sessionsQ);
          setUpcomingSessions(sessSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

          // Nombre de séances ce mois
          const firstOfMonth = today.slice(0, 7) + "-01";
          const sessMonthQ = query(
            collection(db, "schedules"),
            where("groupe", "in", groupes),
            where("date", ">=", firstOfMonth)
          );
          const sessMonthSnap = await getDocs(sessMonthQ);

          // Langues distinctes
          const languesSet = new Set(sessMonthSnap.docs.map((d) => d.data().langue).filter(Boolean));

          // Examens
          const examsQ = query(
            collection(db, "exams"),
            where("etudiant", "==", currentUser.uid)
          );
          const examsSnap = await getDocs(examsQ);

          // Cours
          const coursesQ = query(collection(db, "lessons"));
          const coursesSnap = await getDocs(coursesQ);

          setStats({
            courses:  coursesSnap.size,
            sessions: sessMonthSnap.size,
            exams:    examsSnap.size,
            langues:  languesSet.size || groupes.length,
          });
        }
      } catch (err) {
        console.error("Erreur chargement dashboard :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile, currentUser]);

  return (
    <StudentLayout title="Tableau de bord">
      <WelcomeCard nom={userProfile?.nom} />
      <StatsRow stats={stats} />
      <div className="dash-grid-2">
        <UpcomingCard sessions={upcomingSessions} loading={loading} />
        <ProfileCard userProfile={userProfile} email={currentUser?.email} />
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
