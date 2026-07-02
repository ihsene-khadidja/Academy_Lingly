// src/pages/admin/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "./AdminLayout";

const STATS = [
  { icon:"👩‍🎓", bg:"#EEF2FF", val:24, label:"Étudiants inscrits",  link:"/admin/students"  },
  { icon:"📚",  bg:"#D1FAE5", val:38, label:"Cours disponibles",   link:"/admin/lessons"   },
  { icon:"📅",  bg:"#FEF9C3", val:12, label:"Séances ce mois",     link:"/admin/schedule"  },
  { icon:"👥",  bg:"#FCE7F3", val:6,  label:"Groupes actifs",      link:null               },
];

const RECENT = [
  { id:"1", nom:"Yasmine Boudali",  email:"yasmine@gmail.com",  groupe:"EN-B1-G1", niveau:"B1" },
  { id:"2", nom:"Mehdi Tebboune",   email:"mehdi@gmail.com",    groupe:"FR-A2-G1", niveau:"A2" },
  { id:"3", nom:"Sara Kebbas",      email:"sara@gmail.com",     groupe:"EN-A1-G2", niveau:"A1" },
  { id:"4", nom:"Amine Hadjoudj",   email:"amine@gmail.com",    groupe:"TR-A1-G1", niveau:"A1" },
];

const UPCOMING = [
  { id:"s1", groupe:"EN-B1-G1", date:"2026-06-28", heure:"18:00", prof:"Yacine Belkacem", zoom:"https://zoom.us/j/123" },
  { id:"s2", groupe:"FR-A2-G1", date:"2026-06-29", heure:"10:00", prof:"Amina Meziane",   zoom:"" },
  { id:"s3", groupe:"TR-A1-G1", date:"2026-06-30", heure:"14:00", prof:"Sofiane Khelifi", zoom:"https://zoom.us/j/456" },
];

const NIVEAU_COLOR = { A1:"a-badge--green",A2:"a-badge--green",B1:"a-badge--blue",B2:"a-badge--blue",C1:"a-badge--pink",C2:"a-badge--pink" };

const fmt = (d) => new Date(d+"T00:00:00").toLocaleDateString("fr-DZ",{ weekday:"short", day:"numeric", month:"short" });

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const prenom = (userProfile?.nom || currentUser?.email || "Admin").split(" ")[0];

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
      <div className="a-stats-grid">
        {STATS.map((s, i) => (
          <div key={i} className="a-stat" style={{ cursor: s.link ? "pointer" : "default" }}
            onClick={() => s.link && (window.location.href = s.link)}>
            <div className="a-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="a-stat-label">{s.label}</div>
              <div className="a-stat-val">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deux colonnes */}
      <div className="a-grid-2">
        {/* Derniers étudiants */}
        <div className="a-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem" }}>Derniers étudiants</span>
            <Link to="/admin/students" className="btn btn--ghost btn--sm">Voir tous →</Link>
          </div>
          <div className="a-table-wrap" style={{ border:"none" }}>
            <table className="a-table">
              <thead><tr><th>Étudiant</th><th>Groupe</th><th>Niveau</th></tr></thead>
              <tbody>
                {RECENT.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="a-user-cell">
                        <div className="a-table-avatar" style={{ background:"var(--grad-orange)", width:30, height:30, fontSize:".75rem" }}>{s.nom.charAt(0)}</div>
                        <div>
                          <div className="a-table-name" style={{ fontSize:".88rem" }}>{s.nom}</div>
                          <div className="a-table-sub">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="a-badge a-badge--navy">{s.groupe}</span></td>
                    <td><span className={`a-badge ${NIVEAU_COLOR[s.niveau]}`}>{s.niveau}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prochaines séances */}
        <div className="a-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1rem" }}>Prochaines séances</span>
            <Link to="/admin/schedule" className="btn btn--ghost btn--sm">Planning →</Link>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".65rem" }}>
            {UPCOMING.map((s) => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".75rem 1rem", borderRadius:10, border:"1px solid var(--border)", gap:"1rem" }}>
                <div>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem" }}>{s.groupe}</div>
                  <div style={{ fontSize:".78rem", color:"var(--ink-soft)", marginTop:".12rem" }}>{fmt(s.date)} · {s.heure} · {s.prof}</div>
                </div>
                {s.zoom
                  ? <a href={s.zoom} target="_blank" rel="noopener noreferrer" className="btn btn--grad btn--sm">📹 Zoom</a>
                  : <span className="a-badge a-badge--amber">Présentiel</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="a-grid-3" style={{ marginTop:"1.25rem" }}>
        {[
          { to:"/admin/students", icon:"👩‍🎓", label:"Gérer les étudiants", desc:"Groupes, niveaux, déplacements" },
          { to:"/admin/lessons",  icon:"📚", label:"Gérer les cours",      desc:"PDF, Word, PPT, vidéo…" },
          { to:"/admin/schedule", icon:"📅", label:"Gérer le planning",    desc:"Séances Zoom & présentiel" },
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
    </AdminLayout>
  );
};

export default Dashboard;