// src/pages/admin/Dashboard.jsx
// Connecté à Firestore — stats en temps réel
//
// Les séances sont désormais hebdomadaires (type "normale" : jour + heure, sans
// date fixe) ou ponctuelles (type "remplacement" : date précise). Ce tableau de
// bord recalcule donc les occurrences du mois et les prochaines séances à partir
// de ce modèle.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, limit, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "./AdminLayout";

const NIVEAU_COLOR = {
  A1:"a-badge--green", A2:"a-badge--green",
  B1:"a-badge--blue",  B2:"a-badge--blue",
  C1:"a-badge--pink",  C2:"a-badge--pink",
};

// Semaine algérienne : dimanche = 0 … samedi = 6 (comme Date#getDay())
const JOURS = [
  { key:"dimanche", label:"Dimanche" },
  { key:"lundi",    label:"Lundi" },
  { key:"mardi",    label:"Mardi" },
  { key:"mercredi", label:"Mercredi" },
  { key:"jeudi",    label:"Jeudi" },
  { key:"vendredi", label:"Vendredi" },
  { key:"samedi",   label:"Samedi" },
];
const JOUR_INDEX = Object.fromEntries(JOURS.map((j, i) => [j.key, i]));

const fmt = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("fr-DZ", {
    weekday:"short", day:"numeric", month:"short",
  });
const toISO = (d) => d.toISOString().slice(0,10);

// ── Occurrences d'un jour de semaine sur un mois donné ──────────────────────
function countWeekdayInMonth(weekdayIndex, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    if (new Date(year, month, day).getDay() === weekdayIndex) count++;
  }
  return count;
}

// ── Prochaine date (>= aujourd'hui) correspondant à un jour de semaine ──────
function nextDateForWeekday(weekdayIndex, from) {
  const d = new Date(from);
  d.setHours(0,0,0,0);
  const diff = (weekdayIndex - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const prenom = (userProfile?.nom || currentUser?.email || "Admin").split(" ")[0];

  const [stats,    setStats]    = useState({ students:0, lessons:0, sessions:0, groups:0 });
  const [recent,   setRecent]   = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // ── Étudiants ──
        const stuSnap = await getDocs(
          query(collection(db, "users"), where("role", "in", ["student","etudiant"]))
        );
        const allStudents = stuSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Groupes uniques
        const groupes = new Set(allStudents.map((s) => s.groupe).filter(Boolean));

        // Derniers 4 étudiants
        const recentSnap = await getDocs(
          query(
            collection(db, "users"),
            where("role", "in", ["student","etudiant"]),
            orderBy("createdAt", "desc"),
            limit(4)
          )
        );
        setRecent(recentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // ── Leçons ──
        const lesSnap = await getDocs(collection(db, "lessons"));

        // ── Séances (hebdomadaires "normale" + ponctuelles "remplacement") ──
        const schSnap = await getDocs(collection(db, "sessions"));
        const allSessions = schSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const normales      = allSessions.filter((s) => s.type === "normale" && s.jour);
        const remplacements = allSessions.filter((s) => s.type === "remplacement" && s.date);

        const today    = new Date();
        today.setHours(0,0,0,0);
        const todayStr = toISO(today);
        const year     = today.getFullYear();
        const month    = today.getMonth();
        const firstOfMonth = toISO(new Date(year, month, 1));
        const lastOfMonth  = toISO(new Date(year, month + 1, 0));

        // Occurrences des séances hebdomadaires ce mois-ci
        const normalesThisMonth = normales.reduce(
          (sum, s) => sum + countWeekdayInMonth(JOUR_INDEX[s.jour] ?? 0, year, month),
          0
        );
        // Remplacements ponctuels tombant ce mois-ci
        const remplacementsThisMonth = remplacements.filter(
          (s) => s.date >= firstOfMonth && s.date <= lastOfMonth
        ).length;

        // Prochaines séances (mélange hebdo + remplacements, triées chronologiquement)
        const nextNormales = normales.map((s) => ({
          ...s,
          date: toISO(nextDateForWeekday(JOUR_INDEX[s.jour] ?? 0, today)),
        }));
        const nextRemplacements = remplacements.filter((s) => s.date >= todayStr);

        const nextSessions = [...nextNormales, ...nextRemplacements]
          .sort((a,b) => a.date.localeCompare(b.date) || (a.heureDebut || "").localeCompare(b.heureDebut || ""))
          .slice(0, 3);

        setStats({
          students: allStudents.length,
          lessons:  lesSnap.size,
          sessions: normalesThisMonth + remplacementsThisMonth,
          groups:   groupes.size,
        });
        setUpcoming(nextSessions);
      } catch (err) {
        console.error("Dashboard Firestore error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const STAT_CARDS = [
    { icon:"👩‍🎓", bg:"#EEF2FF", val:stats.students, label:"Étudiants inscrits",  link:"/admin/students" },
    { icon:"📚",  bg:"#D1FAE5", val:stats.lessons,  label:"Cours disponibles",   link:"/admin/lessons"  },
    { icon:"📅",  bg:"#FEF9C3", val:stats.sessions, label:"Séances ce mois",     link:"/admin/schedule" },
    { icon:"👥",  bg:"#FCE7F3", val:stats.groups,   label:"Groupes actifs",      link:null              },
  ];

  return (
    <AdminLayout title="Vue d'ensemble">

      {/* Bienvenue */}
      <div style={{ background:"var(--navy)", borderRadius:"var(--r-card)", padding:"1.5rem 2rem", marginBottom:"1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.25rem", fontWeight:900, color:"#fff", marginBottom:".3rem" }}>
            Bonjour {prenom} 👋
          </div>
          <div style={{ fontSize:".88rem", color:"var(--ink-light)" }}>Tableau de bord Lingly Academy</div>
        </div>
        <span style={{ background:"rgba(245,166,35,.18)", border:"1px solid rgba(245,166,35,.35)", borderRadius:999, padding:".45rem 1.1rem", fontFamily:"var(--font-display)", fontSize:".85rem", fontWeight:800, color:"var(--amber)" }}>
          👨‍🏫 Professeur / Admin
        </span>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"2rem", color:"var(--ink-soft)" }}>Chargement…</div>
      ) : (
        <>
          <div className="a-stats-grid">
            {STAT_CARDS.map((s, i) => (
              <div key={i} className="a-stat"
                style={{ cursor: s.link ? "pointer" : "default" }}
                onClick={() => s.link && (window.location.href = s.link)}>
                <div className="a-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="a-stat-label">{s.label}</div>
                  <div className="a-stat-val">{s.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="a-grid-2">
            {/* Derniers étudiants */}
            <div className="a-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem" }}>Derniers étudiants</span>
                <Link to="/admin/students" className="btn btn--ghost btn--sm">Voir tous →</Link>
              </div>
              {recent.length === 0 ? (
                <div className="a-empty" style={{ padding:"1.5rem" }}>
                  <div className="a-empty-icon">👩‍🎓</div>
                  <div className="a-empty-title">Aucun étudiant</div>
                </div>
              ) : (
                <div className="a-table-wrap" style={{ border:"none" }}>
                  <table className="a-table">
                    <thead><tr><th>Étudiant</th><th>Groupe</th><th>Niveau</th></tr></thead>
                    <tbody>
                      {recent.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div className="a-user-cell">
                              <div className="a-table-avatar" style={{ background:"var(--grad-orange)", width:30, height:30, fontSize:".75rem" }}>
                                {(s.nom || s.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="a-table-name" style={{ fontSize:".88rem" }}>{s.nom || "—"}</div>
                                <div className="a-table-sub">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="a-badge a-badge--navy">{s.groupe || "—"}</span></td>
                          <td><span className={`a-badge ${NIVEAU_COLOR[s.niveau] || "a-badge--navy"}`}>{s.niveau || "—"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Prochaines séances */}
            <div className="a-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
                <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem" }}>Prochaines séances</span>
                <Link to="/admin/schedule" className="btn btn--ghost btn--sm">Planning →</Link>
              </div>
              {upcoming.length === 0 ? (
                <div className="a-empty" style={{ padding:"1.5rem" }}>
                  <div className="a-empty-icon">📅</div>
                  <div className="a-empty-title">Aucune séance à venir</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:".65rem" }}>
                  {upcoming.map((s) => (
                    <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".75rem 1rem", borderRadius:10, border:"1px solid var(--border)", gap:"1rem" }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem" }}>{s.groupe}</span>
                          {s.type === "normale"
                            ? <span className="a-badge a-badge--navy">📆 Hebdo</span>
                            : <span className="a-badge a-badge--amber">🔁 Remplacement</span>}
                        </div>
                        <div style={{ fontSize:".78rem", color:"var(--ink-soft)", marginTop:".12rem" }}>
                          {fmt(s.date)} · {s.heureDebut}–{s.heureFin} · {s.prof}
                        </div>
                      </div>
                      {s.zoom
                        ? <a href={s.zoom} target="_blank" rel="noopener noreferrer" className="btn btn--grad btn--sm">📹 Zoom</a>
                        : <span className="a-badge a-badge--amber">Présentiel</span>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Accès rapides */}
          <div className="a-grid-3" style={{ marginTop:"1.25rem" }}>
            {[
              { to:"/admin/students", icon:"👩‍🎓", label:"Gérer les étudiants", desc:"Groupes, niveaux, déplacements" },
              { to:"/admin/lessons",  icon:"📚",  label:"Gérer les cours",      desc:"PDF, Word, PPT, vidéo…" },
              { to:"/admin/schedule", icon:"📅",  label:"Gérer le planning",    desc:"Séances hebdo & remplacements" },
            ].map((c) => (
              <Link key={c.to} to={c.to} style={{ textDecoration:"none" }}>
                <div style={{ background:"var(--white)", border:"1px solid var(--border)", borderRadius:"var(--r-card)", padding:"1.25rem 1.5rem", cursor:"pointer", transition:"box-shadow .2s, transform .18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow="var(--shadow-lg)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="none"; }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:".5rem" }}>{c.icon}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:800, color:"var(--ink)", marginBottom:".25rem" }}>{c.label}</div>
                  <div style={{ fontSize:".82rem", color:"var(--ink-soft)" }}>{c.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
