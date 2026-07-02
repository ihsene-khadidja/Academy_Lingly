// src/pages/student/Results.jsx
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "./StudentLayout";

// ─── COULEURS PAR TYPE D'EXAMEN ───────────────────────────────────────────────
const EXAM_STYLE = {
  "IELTS":  { color: "#4A6CF7", bg: "#EEF2FF" },
  "TOEFL":  { color: "#4A6CF7", bg: "#EEF2FF" },
  "TOEIC":  { color: "#059669", bg: "#D1FAE5" },
  "TCF":    { color: "#B45309", bg: "#FEF9C3" },
  "TEF":    { color: "#9D174D", bg: "#FCE7F3" },
  "Interne":{ color: "#5b5b72", bg: "#F0F4FF" },
};
const DEFAULT_EXAM = { color: "#5b5b72", bg: "#F0F4FF" };
const getExamStyle = (type) => EXAM_STYLE[type] || DEFAULT_EXAM;

// Calcule la moyenne des notes
const calcMoyenne = (exams) => {
  if (!exams.length) return null;
  const nums = exams
    .map((e) => parseFloat(e.note))
    .filter((n) => !isNaN(n));
  if (!nums.length) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
};

// Formate "2026-06-20" → "20 juin 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return "–";
  const MONTHS_FR = ["jan.","fév.","mars","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${MONTHS_FR[parseInt(m) - 1]} ${y}`;
};

// ─── CARTES STATISTIQUES ──────────────────────────────────────────────────────
const StatsCards = ({ exams }) => {
  const moyenne = calcMoyenne(exams);
  const best = exams.reduce((best, e) => {
    const n = parseFloat(e.note);
    return !isNaN(n) && n > (parseFloat(best?.note) || 0) ? e : best;
  }, null);

  return (
    <div className="results-grid" style={{ marginBottom: "1.75rem" }}>
      <div className="s-card result-stat-card">
        <span style={{ fontSize: "2rem" }}>📊</span>
        <p className="result-stat-score">{moyenne ?? "–"}</p>
        <p className="result-stat-label">Moyenne générale</p>
      </div>

      <div className="s-card result-stat-card">
        <span style={{ fontSize: "2rem" }}>🏆</span>
        <p className="result-stat-score">{exams.length}</p>
        <p className="result-stat-label">Examen{exams.length > 1 ? "s" : ""} passé{exams.length > 1 ? "s" : ""}</p>
      </div>

      {best && (
        <div className="s-card result-stat-card">
          <span style={{ fontSize: "2rem" }}>⭐</span>
          <p className="result-stat-score">{best.note}</p>
          <p className="result-stat-label">Meilleur score — {best.type}</p>
        </div>
      )}

      <div className="s-card result-stat-card">
        <span style={{ fontSize: "2rem" }}>🎖️</span>
        <p className="result-stat-score">
          {exams.filter((e) => e.certification).length}
        </p>
        <p className="result-stat-label">Certification{exams.filter((e) => e.certification).length > 1 ? "s" : ""} obtenue{exams.filter((e) => e.certification).length > 1 ? "s" : ""}</p>
      </div>
    </div>
  );
};

// ─── LISTE DES EXAMENS ────────────────────────────────────────────────────────
const ExamsList = ({ exams }) => (
  <div className="s-card" style={{ overflow: "hidden" }}>
    <div style={{ padding: "1.25rem 1.5rem .5rem" }}>
      <h2 className="s-section-title">Tous mes résultats</h2>
    </div>
    <div className="exams-list">
      {exams.map((exam, i) => {
        const s = getExamStyle(exam.type);
        const score = parseFloat(exam.note);
        const isGood = !isNaN(score) && score >= 5;

        return (
          <div className="exam-result-row" key={exam.id || i}>
            {/* Code examen */}
            <div
              className="exam-result-code"
              style={{
                background: s.bg, color: s.color,
                padding: ".35rem .75rem", borderRadius: 8,
                fontSize: ".9rem", textAlign: "center",
              }}
            >
              {exam.type || "–"}
            </div>

            {/* Info */}
            <div className="exam-result-info">
              <p className="exam-result-type">{exam.titre || exam.type}</p>
              <p className="exam-result-date">
                📅 {formatDate(exam.date)}
                {exam.langue && ` · ${exam.langue}`}
              </p>
            </div>

            {/* Note */}
            <div style={{ textAlign: "right" }}>
              <p className="exam-result-score" style={{ color: isGood ? "#059669" : "#E85D04" }}>
                {exam.note || "–"}
              </p>
              {exam.certification && (
                <span className="exam-result-cert">🎖 Certifié</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── RÉSULTATS PAGE ───────────────────────────────────────────────────────────
const Results = () => {
  const { currentUser } = useAuth();

  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchExams = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "exams"),
          where("etudiant", "==", currentUser.uid),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        setExams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        // L'index Firestore peut manquer la première fois — on charge sans tri
        try {
          const q2 = query(
            collection(db, "exams"),
            where("etudiant", "==", currentUser.uid)
          );
          const snap2 = await getDocs(q2);
          const data = snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
          setExams(data);
        } catch (e) {
          console.error("Erreur résultats :", e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [currentUser]);

  return (
    <StudentLayout title="Mes résultats">
      {loading ? (
        <div className="s-loader" />
      ) : exams.length === 0 ? (
        <div className="s-card">
          <div className="s-empty">
            <span className="s-empty-icon">🏆</span>
            <p className="s-empty-title">Aucun résultat pour l'instant</p>
            <p className="s-empty-desc">
              Vos résultats d'examens apparaîtront ici dès que votre professeur
              les aura enregistrés dans Firestore.<br /><br />
              <strong>Structure Firestore — collection <code>exams</code> :</strong>
            </p>
            <pre style={{
              textAlign: "left", marginTop: ".75rem",
              background: "var(--offwhite)", borderRadius: 10,
              padding: "1rem 1.25rem", fontSize: ".82rem", overflowX: "auto",
              color: "var(--ink)", lineHeight: 1.7,
            }}>{`{
  "etudiant":      "${currentUser?.uid}",
  "type":          "IELTS",
  "titre":         "IELTS Academic - Session Juin 2026",
  "langue":        "Anglais",
  "note":          "7.5",
  "date":          "2026-06-15",
  "certification": true
}`}</pre>
          </div>
        </div>
      ) : (
        <>
          <StatsCards exams={exams} />
          <ExamsList exams={exams} />
        </>
      )}
    </StudentLayout>
  );
};

export default Results;