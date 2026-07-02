// src/pages/student/Planning.jsx
//
// ─── FONCTIONNALITÉ CLÉ ────────────────────────────────────────────────────────
// Un étudiant peut suivre PLUSIEURS langues en même temps.
// Son profil Firestore contient : groupes: ["A1-G1", "B2-FR-G1", "A1-AR1"]
// Ce composant récupère TOUTES les séances de tous ces groupes
// et les affiche dans UN SEUL calendrier hebdomadaire, coloré par langue.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "./StudentLayout";

// ─── COULEURS PAR LANGUE ──────────────────────────────────────────────────────
const LANG_STYLE = {
  "Anglais":  { bg: "#EEF2FF", color: "#4A6CF7", border: "#4A6CF7", dot: "#4A6CF7" },
  "Français": { bg: "#FFFBEB", color: "#B45309", border: "#F5A623", dot: "#F5A623" },
  "Arabe":    { bg: "#ECFDF5", color: "#059669", border: "#34C88A", dot: "#34C88A" },
  "Turc":     { bg: "#FDF2F8", color: "#9D174D", border: "#D4537E", dot: "#D4537E" },
  "Espagnol": { bg: "#FFF7ED", color: "#C2410C", border: "#E85D04", dot: "#E85D04" },
  "Allemand": { bg: "#F8FAFC", color: "#334155", border: "#64748B", dot: "#64748B" },
};
const DEFAULT_STYLE = { bg: "#F0F4FF", color: "#5b5b72", border: "#94a3b8", dot: "#94a3b8" };

const getLangStyle = (langue) => LANG_STYLE[langue] || DEFAULT_STYLE;

// ─── UTILITAIRES DATE ────────────────────────────────────────────────────────
const DAY_NAMES   = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

// Retourne le lundi de la semaine contenant `date`
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 7 dates à partir du lundi
const getWeekDates = (monday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

// "2026-06-20"
const toISODate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isToday = (date) => toISODate(date) === toISODate(new Date());

// ─── LÉGENDE DES LANGUES ─────────────────────────────────────────────────────
const PlanningLegend = ({ langues }) => {
  if (!langues.length) return null;
  return (
    <div className="planning-legend">
      {langues.map((lang) => {
        const s = getLangStyle(lang);
        return (
          <div className="planning-legend-item" key={lang}>
            <span className="planning-legend-dot" style={{ background: s.dot }} />
            {lang}
          </div>
        );
      })}
    </div>
  );
};

// ─── CARTE SÉANCE ─────────────────────────────────────────────────────────────
const SessionCard = ({ session }) => {
  const s = getLangStyle(session.langue);
  const isZoom = session.salle?.toLowerCase().includes("zoom");

  return (
    <div
      className="planning-session"
      style={{ background: s.bg, borderLeftColor: s.border, color: s.color }}
    >
      <p className="planning-session-time">{session.heure}</p>
      <p className="planning-session-lang">{session.langue}</p>
      <p className="planning-session-group">{session.groupe}</p>
      {session.prof  && <p className="planning-session-prof">👨‍🏫 {session.prof}</p>}
      {session.salle && (
        <p className="planning-session-salle">
          {isZoom ? "💻" : "📍"} {session.salle}
        </p>
      )}
    </div>
  );
};

// ─── COLONNE JOUR ────────────────────────────────────────────────────────────
const DayColumn = ({ date, sessions }) => {
  const today = isToday(date);
  // Trie les séances par heure
  const sorted = [...sessions].sort((a, b) => a.heure.localeCompare(b.heure));

  return (
    <div className="planning-day">
      <div className={`planning-day-head ${today ? "planning-day-head--today" : ""}`}>
        <p className="planning-day-name">{DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1]}</p>
        <p className="planning-day-date">{date.getDate()}</p>
      </div>

      {sorted.length > 0
        ? sorted.map((s, i) => <SessionCard key={s.id || i} session={s} />)
        : <div className="planning-day-empty">—</div>}
    </div>
  );
};

// ─── ÉTAT VIDE (pas encore de groupes assignés) ────────────────────────────
const EmptyPlanning = () => (
  <div className="s-card">
    <div className="s-empty">
      <span className="s-empty-icon">📅</span>
      <p className="s-empty-title">Aucun groupe assigné</p>
      <p className="s-empty-desc">
        Votre professeur doit d'abord vous assigner à un ou plusieurs groupes
        dans la base de données Firestore.<br /><br />
        <strong>Structure attendue dans votre profil :</strong><br />
        <code style={{ fontSize: ".8rem", background: "#f0f4ff", padding: ".2rem .5rem", borderRadius: 6, display: "inline-block", marginTop: ".5rem" }}>
          groupes: ["A1-G1", "B2-FR-G1"]
        </code>
      </p>
    </div>
  </div>
);

// ─── PLANNING PAGE ────────────────────────────────────────────────────────────
const Planning = () => {
  const { userProfile } = useAuth();

  const [weekOffset, setWeekOffset]   = useState(0);
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Groupes de l'étudiant (supporte tableau OU champ unique)
  const userGroups = useMemo(() => {
    if (!userProfile) return [];
    if (Array.isArray(userProfile.groupes) && userProfile.groupes.length)
      return userProfile.groupes;
    if (userProfile.groupe)
      return [userProfile.groupe];
    return [];
  }, [userProfile]);

  // Langues distinctes présentes dans le planning (pour la légende)
  const languesPresentes = useMemo(() => {
    const set = new Set(sessions.map((s) => s.langue).filter(Boolean));
    return [...set].sort();
  }, [sessions]);

  // Calcul des dates de la semaine affichée
  const baseMonday = useMemo(() => getMonday(new Date()), []);
  const currentMonday = useMemo(() => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + weekOffset * 7);
    return d;
  }, [baseMonday, weekOffset]);
  const weekDates = useMemo(() => getWeekDates(currentMonday), [currentMonday]);

  // Label "16 – 22 Juin 2026"
  const weekLabel = (() => {
    const start = weekDates[0];
    const end   = weekDates[6];
    if (start.getMonth() === end.getMonth())
      return `${start.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  })();

  // Charge les séances depuis Firestore pour la semaine courante
  useEffect(() => {
    if (!userGroups.length) return;

    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        // On récupère toutes les séances des groupes de l'étudiant.
        // Firebase "in" supporte jusqu'à 30 valeurs — largement suffisant.
        const q = query(
          collection(db, "schedules"),
          where("groupe", "in", userGroups)
        );
        const snap = await getDocs(q);
        const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Filtre côté client sur la semaine affichée
        const weekSet = new Set(weekDates.map(toISODate));
        setSessions(all.filter((s) => weekSet.has(s.date)));
      } catch (err) {
        console.error("Erreur planning :", err);
        setError("Impossible de charger le planning. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [weekOffset, userGroups]);  // Re-charge quand la semaine change ou quand le profil change

  // Sessions indexées par date ISO
  const sessionsByDate = useMemo(() => {
    const map = {};
    weekDates.forEach((d) => { map[toISODate(d)] = []; });
    sessions.forEach((s) => {
      if (map[s.date] !== undefined) map[s.date].push(s);
    });
    return map;
  }, [sessions, weekDates]);

  if (!userGroups.length) return (
    <StudentLayout title="Mon planning">
      <EmptyPlanning />
    </StudentLayout>
  );

  return (
    <StudentLayout title="Mon planning">

      {/* En-tête : navigation semaine */}
      <div className="planning-header">
        <div className="planning-nav">
          <button className="planning-nav-btn" onClick={() => setWeekOffset((o) => o - 1)}>←</button>
          <button className="planning-nav-btn" onClick={() => setWeekOffset(0)}
            style={{ padding: "0 .75rem", width: "auto", fontFamily: "var(--font-display)", fontSize: ".82rem", fontWeight: 700 }}>
            Aujourd'hui
          </button>
          <button className="planning-nav-btn" onClick={() => setWeekOffset((o) => o + 1)}>→</button>
        </div>
        <p className="planning-week-label">{weekLabel}</p>

        {/* Nombre de séances cette semaine */}
        {!loading && (
          <span style={{
            fontFamily: "var(--font-display)", fontSize: ".82rem", fontWeight: 700,
            color: "var(--ink-soft)", background: "var(--offwhite)",
            padding: ".3rem .85rem", borderRadius: 999,
          }}>
            {sessions.length} séance{sessions.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Légende des langues */}
      <PlanningLegend langues={languesPresentes} />

      {/* Grille hebdomadaire */}
      {loading ? (
        <div className="s-loader" />
      ) : error ? (
        <div className="s-card" style={{ padding: "2rem", color: "var(--orange)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      ) : (
        <div className="planning-grid">
          {weekDates.map((date) => (
            <DayColumn
              key={toISODate(date)}
              date={date}
              sessions={sessionsByDate[toISODate(date)] || []}
            />
          ))}
        </div>
      )}

      {/* Info : structure Firestore attendue */}
      {!loading && sessions.length === 0 && (
        <div style={{
          marginTop: "1.5rem", background: "var(--white)",
          border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem 2rem",
        }}>
          <p className="s-eyebrow">Structure Firestore attendue</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--ink)", marginBottom: ".75rem" }}>
            Aucune séance trouvée pour cette semaine
          </p>
          <p style={{ fontSize: ".88rem", color: "var(--ink-soft)", lineHeight: 1.7 }}>
            Pour afficher des séances, ajoutez des documents dans la collection <strong>schedules</strong> de Firestore
            avec cette structure :
          </p>
          <pre style={{
            marginTop: ".75rem", background: "var(--offwhite)", borderRadius: 10,
            padding: "1rem 1.25rem", fontSize: ".82rem", overflowX: "auto",
            color: "var(--ink)", lineHeight: 1.7,
          }}>{`{
  "groupe":  "${userGroups[0]}",
  "langue":  "Anglais",
  "date":    "${toISODate(weekDates[1])}",
  "heure":   "18:00",
  "prof":    "Yacine Belkacem",
  "salle":   "Salle 3",
  "type":    "cours"
}`}</pre>
        </div>
      )}
    </StudentLayout>
  );
};

export default Planning;