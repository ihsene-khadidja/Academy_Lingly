
import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "./StudentLayout";

// ─── LANGUES : les documents stockent un CODE ("EN","FR"…), jamais le nom
// complet — c'est ce qui empêchait les couleurs/le nom affiché de fonctionner.
const LANGUES = {
  EN: { nom: "Anglais",  bg: "#EEF2FF", color: "#4A6CF7", border: "#4A6CF7" },
  FR: { nom: "Français", bg: "#FFFBEB", color: "#B45309", border: "#F5A623" },
  AR: { nom: "Arabe",    bg: "#ECFDF5", color: "#059669", border: "#34C88A" },
  TR: { nom: "Turc",     bg: "#FDF2F8", color: "#9D174D", border: "#D4537E" },
  ES: { nom: "Espagnol", bg: "#FFF7ED", color: "#C2410C", border: "#E85D04" },
  DE: { nom: "Allemand", bg: "#F8FAFC", color: "#334155", border: "#64748B" },
};
const DEFAULT_LANG = { nom: "Autre", bg: "#F0F4FF", color: "#5b5b72", border: "#94a3b8" };
const getLang = (code) => LANGUES[code] || DEFAULT_LANG;

// Mêmes clés que côté admin (dimanche = 0, comme Date#getDay())
const JOUR_INDEX = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
const MOIS_COMPLETS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const JOURS_COMPLETS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"]; // index = getDay()

const toISODate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// "dimanche 2 septembre 2026"
const formatDateComplete = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return `${JOURS_COMPLETS[d.getDay()]} ${d.getDate()} ${MOIS_COMPLETS[d.getMonth()]} ${d.getFullYear()}`;
};

// ─── Un(e) étudiant(e) peut appartenir à un ou plusieurs groupes. On gère les
// formats possibles du profil Firestore pour rester compatible :
//   groupes: ["G1","G2"]                        (tableau de noms)
//   groupes: [{ langue, niveau, groupe }, …]     (tableau d'objets enrichis)
//   groupe: "G1"                                 (ancien champ unique)
function getGroupNames(profile) {
  if (!profile) return [];
  if (Array.isArray(profile.groupes)) {
    return profile.groupes
      .map((g) => (typeof g === "string" ? g : g?.groupe))
      .filter(Boolean);
  }
  if (profile.groupe) return [profile.groupe];
  return [];
}

// ─── LIGNE SÉANCE ─────────────────────────────────────────────────────────────
const SessionRow = ({ session, dateLabel }) => {
  const l = getLang(session.langue);

  return (
    <div className="s-card" style={{ padding: "1.1rem 1.4rem", borderLeft: `4px solid ${l.border}` }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: ".95rem", color: "var(--ink)" }}>
        <strong style={{ fontWeight: 900 }}>{l.nom} {session.niveau} {session.groupe}</strong>
        {" — "}
        <span style={{ color: l.color, fontWeight: 700 }}>
          {dateLabel} de {session.heureDebut} à {session.heureFin}
        </span>
      </p>
      <p style={{ fontSize: ".8rem", color: "var(--ink-soft)", marginTop: ".35rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {session.prof && <span>👨‍🏫 {session.prof}</span>}
        {session.zoom ? (
          <a href={session.zoom} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>💻 Rejoindre sur Zoom</a>
        ) : session.salle ? (
          <span>📍 {session.salle}</span>
        ) : (
          <span>📍 À définir</span>
        )}
      </p>
      {session.note && (
        <p style={{ fontSize: ".78rem", fontStyle: "italic", color: "var(--ink-soft)", marginTop: ".2rem" }}>{session.note}</p>
      )}
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
        Votre professeur doit d'abord vous ajouter à un ou plusieurs groupes pour que votre planning apparaisse ici.
      </p>
    </div>
  </div>
);

const SectionEmpty = ({ icon, title }) => (
  <div className="s-card">
    <div className="s-empty" style={{ padding: "2rem" }}>
      <span className="s-empty-icon">{icon}</span>
      <p className="s-empty-title">{title}</p>
    </div>
  </div>
);

// ─── PLANNING PAGE ────────────────────────────────────────────────────────────
const Planning = () => {
  const { userProfile } = useAuth();

  const [rawSessions, setRawSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userGroups = useMemo(() => getGroupNames(userProfile), [userProfile]);
  const groupKey = userGroups.join(",");

  useEffect(() => {
    if (!userGroups.length) { setRawSessions([]); return; }

    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "sessions"));
        const snap = await getDocs(q);
        console.log("Groupes :", userGroups);
console.log("Nombre :", snap.size);

snap.forEach((doc) => {
    console.log(doc.data());
});
        setRawSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Erreur planning :", err);
        setError("Impossible de charger le planning. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [groupKey]);

  // Séances hebdomadaires (normale) : triées par jour de semaine puis heure.
  // Affichées avec juste le nom du jour — pas de date précise, elles se
  // répètent chaque semaine.
  const normales = useMemo(() => {
    return rawSessions
      .filter((s) => s.type === "normale" && s.jour)
      .sort((a, b) =>
        (JOUR_INDEX[a.jour] ?? 9) - (JOUR_INDEX[b.jour] ?? 9) ||
        (a.heureDebut || "").localeCompare(b.heureDebut || "")
      );
  }, [rawSessions]);

  // Remplacements À VENIR (date >= aujourd'hui) : triés chronologiquement.
  const remplacements = useMemo(() => {
    const todayISO = toISODate(new Date());
    return rawSessions
      .filter((s) => s.type === "remplacement" && s.date >= todayISO)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.heureDebut || "").localeCompare(b.heureDebut || "")
      );
  }, [rawSessions]);

  if (!loading && !userGroups.length) return (
    <StudentLayout title="Mon planning"><EmptyPlanning /></StudentLayout>
  );

  return (
    <StudentLayout title="Mon planning">
      {loading ? (
        <div className="s-loader" />
      ) : error ? (
        <div className="s-card" style={{ padding: "2rem", color: "var(--orange)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      ) : (
        <>
          {/* ── Planning hebdomadaire ── */}
          <div style={{ marginBottom: "2.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
              <h2 className="s-section-title" style={{ margin: 0 }}>📆 Planning hebdomadaire</h2>
              {normales.length > 0 && (
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--ink-soft)", background: "var(--offwhite)", padding: ".2rem .7rem", borderRadius: 999 }}>
                  {normales.length} séance{normales.length > 1 ? "s" : ""} / semaine
                </span>
              )}
            </div>
            {normales.length === 0 ? (
              <SectionEmpty icon="📆" title="Aucune séance hebdomadaire pour l'instant" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {normales.map((s) => (
                  <SessionRow key={s.id} session={s} dateLabel={s.jour} />
                ))}
              </div>
            )}
          </div>

          {/* ── Remplacements à venir ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
              <h2 className="s-section-title" style={{ margin: 0 }}>🔁 Remplacements à venir</h2>
              {remplacements.length > 0 && (
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--ink-soft)", background: "var(--offwhite)", padding: ".2rem .7rem", borderRadius: 999 }}>
                  {remplacements.length}
                </span>
              )}
            </div>
            {remplacements.length === 0 ? (
              <SectionEmpty icon="🔁" title="Aucune séance de remplacement prévue" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {remplacements.map((s) => (
                  <SessionRow key={s.id} session={s} dateLabel={formatDateComplete(s.date)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </StudentLayout>
  );
};

export default Planning;
