// src/pages/student/MyCourses.jsx
import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "./StudentLayout";

// ─── COULEURS PAR LANGUE ─────────────────────────────────────────────────────
const LANG_COLOR = {
  "Anglais":  { icon: "🇬🇧", bg: "#EEF2FF", color: "#4A6CF7", pill: "#EEF2FF", pillText: "#4A6CF7" },
  "Français": { icon: "🇫🇷", bg: "#FFFBEB", color: "#B45309", pill: "#FEF9C3", pillText: "#B45309" },
  "Arabe":    { icon: "🌙", bg: "#ECFDF5", color: "#059669", pill: "#D1FAE5", pillText: "#059669" },
  "Turc":     { icon: "🇹🇷", bg: "#FDF2F8", color: "#9D174D", pill: "#FCE7F3", pillText: "#9D174D" },
  "Espagnol": { icon: "🇪🇸", bg: "#FFF7ED", color: "#C2410C", pill: "#FBE6C7", pillText: "#C2410C" },
  "Allemand": { icon: "🇩🇪", bg: "#F8FAFC", color: "#334155", pill: "#F1F5F9", pillText: "#334155" },
};
const DEFAULT_LANG = { icon: "📚", bg: "#F0F4FF", color: "#5b5b72", pill: "#F0F4FF", pillText: "#5b5b72" };

const getLang = (langue) => LANG_COLOR[langue] || DEFAULT_LANG;

// ─── CARTE LEÇON ─────────────────────────────────────────────────────────────
const LessonCard = ({ lesson }) => {
  const l = getLang(lesson.langue);
  const hasPdf   = !!lesson.pdf;
  const hasVideo = !!lesson.video;

  return (
    <div className="s-card s-card--hover lesson-card">
      <div className="lesson-icon" style={{ background: l.bg }}>
        {l.icon}
      </div>

      <div>
        <span
          className="lang-badge"
          style={{ background: l.pill, color: l.pillText, marginBottom: ".5rem", display: "inline-flex" }}
        >
          {lesson.langue}
        </span>
        {lesson.niveau && (
          <span
            className="lang-badge"
            style={{ background: "#F0F4FF", color: "#5b5b72", marginLeft: ".35rem" }}
          >
            {lesson.niveau}
          </span>
        )}
      </div>

      <h3 className="lesson-title">{lesson.titre}</h3>

      {lesson.description && (
        <p className="lesson-meta">{lesson.description}</p>
      )}

      <div className="lesson-actions">
        {hasPdf ? (
          <a
            href={lesson.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline btn--sm"
          >
            📄 PDF
          </a>
        ) : (
          <button className="btn btn--ghost btn--sm" disabled style={{ opacity: .4, cursor: "default" }}>
            📄 PDF
          </button>
        )}

        {hasVideo ? (
          <a
            href={lesson.video}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--grad btn--sm"
          >
            ▶ Vidéo
          </a>
        ) : (
          <button className="btn btn--ghost btn--sm" disabled style={{ opacity: .4, cursor: "default" }}>
            ▶ Vidéo
          </button>
        )}
      </div>
    </div>
  );
};

// ─── MES COURS PAGE ───────────────────────────────────────────────────────────
const MyCourses = () => {
  const { userProfile } = useAuth();

  const [lessons, setLessons]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("Tous");

  // Langues suivies par l'étudiant
  const userGroupes = userProfile?.groupes?.length
    ? userProfile.groupes
    : userProfile?.groupe
      ? [userProfile.groupe]
      : [];

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        // On charge toutes les leçons depuis Firestore.
        // Optionnel : filtrer par langue si le profil étudiant a des langues assignées.
        const snap = await getDocs(collection(db, "lessons"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLessons(data);
      } catch (err) {
        console.error("Erreur chargement cours :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  // Langues disponibles dans les leçons (+ "Tous")
  const langues = ["Tous", ...new Set(lessons.map((l) => l.langue).filter(Boolean))];

  // Leçons filtrées selon l'onglet actif
  const filtered = activeTab === "Tous"
    ? lessons
    : lessons.filter((l) => l.langue === activeTab);

  return (
    <StudentLayout title="Mes cours">

      {/* Onglets par langue */}
      {!loading && langues.length > 1 && (
        <div className="courses-tabs">
          {langues.map((lang) => (
            <button
              key={lang}
              className={`courses-tab ${activeTab === lang ? "courses-tab--active" : ""}`}
              onClick={() => setActiveTab(lang)}
            >
              {lang === "Tous" ? "📚 Tous" : `${getLang(lang).icon} ${lang}`}
            </button>
          ))}
        </div>
      )}

      {/* Grille des leçons */}
      {loading ? (
        <div className="s-loader" />
      ) : filtered.length === 0 ? (
        <div className="s-card">
          <div className="s-empty">
            <span className="s-empty-icon">📚</span>
            <p className="s-empty-title">Aucune leçon disponible</p>
            <p className="s-empty-desc">
              Votre professeur n'a pas encore ajouté de leçons.<br />
              Revenez bientôt !<br /><br />
              <strong>Structure Firestore — collection <code>lessons</code> :</strong>
            </p>
            <pre style={{
              textAlign: "left", marginTop: ".75rem",
              background: "var(--offwhite)", borderRadius: 10,
              padding: "1rem 1.25rem", fontSize: ".82rem", overflowX: "auto",
              color: "var(--ink)", lineHeight: 1.7,
            }}>{`{
  "titre":       "Present Simple",
  "langue":      "Anglais",
  "niveau":      "A1",
  "description": "Introduction au présent simple.",
  "pdf":         "https://url-du-fichier.pdf",
  "video":       "https://youtube.com/..."
}`}</pre>
          </div>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default MyCourses;