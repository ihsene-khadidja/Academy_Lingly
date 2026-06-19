import React, { useState } from "react";
import "./Examens.css";
import Navbar from "./Navbar";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="ex-hero">
    <div className="ex-hero-inner">
      <div className="ex-hero-content">
        <p className="eyebrow" style={{ color: "#F5A623" }}>PRÉPARATION AUX EXAMENS</p>
        <h1 className="ex-hero-title">
          Préparez vos certifications<br />
          avec <span className="text-amber">Lingly</span>
        </h1>
        <p className="ex-hero-desc">
          94% de nos candidats obtiennent leur certification du premier coup.
          Des parcours dédiés, des tests blancs et de vrais examinateurs.
        </p>
        <button className="btn btn--grad btn--lg">Commencer ma préparation</button>
      </div>
      <div className="ex-hero-mascot">
        <img
          src="/ph2.png"
          alt="Mascot"
          className="mascot-img"
          onError={(e) => {
            e.target.parentElement.innerHTML =
              `<div class="mascot-placeholder"><span>🦊</span></div>`;
          }}
        />
      </div>
    </div>
  </section>
);

// ─── EXAMS GRID ───────────────────────────────────────────────────────────────
const EXAMS = [
  {
    code: "IELTS", color: "#4A6CF7",
    lang: "English", langBg: "#EEF2FF", langColor: "#4A6CF7",
    fullName: "International English Language Testing System",
    level: "A2 – C2", usedFor: "Université, immigration, visa",
    features: [
      "Listening — 4 sections",
      "Reading — textes académiques",
      "Writing — essais & graphiques",
      "Speaking — entretien oral",
    ],
  },
  {
    code: "TOEFL", color: "#4A6CF7",
    lang: "English", langBg: "#EEF2FF", langColor: "#4A6CF7",
    fullName: "Test of English as a Foreign Language",
    level: "B1 – C2", usedFor: "Universités anglophones",
    features: [
      "Reading académique",
      "Listening — cours & dialogues",
      "Speaking — tâches intégrées",
      "Writing — synthèse & opinion",
    ],
  },
  {
    code: "TOEIC", color: "#34C88A",
    lang: "English", langBg: "#D1FAE5", langColor: "#059669",
    fullName: "Test of English for International Communication",
    level: "A1 – C1", usedFor: "Monde professionnel & entreprises",
    features: [
      "Listening — conversations pro",
      "Reading — emails & rapports",
      "Vocabulaire des affaires",
      "Grammaire appliquée",
    ],
  },
  {
    code: "TCF", color: "#F5A623",
    lang: "Français", langBg: "#FEF9C3", langColor: "#B45309",
    fullName: "Test de Connaissance du Français",
    level: "A1 – C2", usedFor: "Immigration Canada, naturalisation",
    features: [
      "Compréhension orale",
      "Compréhension écrite",
      "Expression écrite",
      "Maîtrise des structures",
    ],
  },
  {
    code: "TEF", color: "#D4537E",
    lang: "Français", langBg: "#FCE7F3", langColor: "#9D174D",
    fullName: "Test d'Évaluation de Français",
    level: "A1 – C2", usedFor: "Études & immigration francophone",
    features: [
      "Compréhension orale & écrite",
      "Lexique et structure",
      "Expression écrite guidée",
      "Expression orale",
    ],
  },
];

const ExamsGrid = () => (
  <section className="exams-grid-section">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">5 CERTIFICATIONS</p>
        <h2 className="section-title">
          Choisissez votre <span className="text-amber">examen</span>
        </h2>
      </div>
      <div className="exams-grid">
        {EXAMS.map((exam, i) => (
          <div className="exam-card" key={i}>
            {/* Header */}
            <div className="exam-card-head">
              <span className="exam-card-code" style={{ color: exam.color }}>
                {exam.code}
              </span>
              <span
                className="exam-lang-pill"
                style={{ background: exam.langBg, color: exam.langColor }}
              >
                {exam.lang}
              </span>
            </div>
            {/* Full name */}
            <p className="exam-fullname">{exam.fullName}</p>
            {/* Level + usage */}
            <div className="exam-meta">
              <div>
                <span className="exam-meta-label">NIVEAUX</span>
                <span className="exam-meta-val">{exam.level}</span>
              </div>
              <div>
                <span className="exam-meta-label">UTILISÉ POUR</span>
                <span className="exam-meta-val exam-meta-val--bold">{exam.usedFor}</span>
              </div>
            </div>
            {/* Features */}
            <ul className="exam-features">
              {exam.features.map((f, j) => (
                <li key={j}>✓ {f}</li>
              ))}
            </ul>
            {/* CTA */}
            <button className="btn btn--grad btn--block">Voir les cours</button>
          </div>
        ))}
        {/* Empty card to fill the grid */}
        <div className="exam-card exam-card--empty" />
      </div>
    </div>
  </section>
);

// ─── INSTRUCTORS ──────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <span className="stars-row">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.floor(rating) ? "star star--on" : "star star--off"}>
        ★
      </span>
    ))}
    <span className="stars-score">({rating.toFixed(1)})</span>
  </span>
);

const INSTRUCTORS = [
  {
    initials: "YB", avatarBg: "#4A6CF7",
    name: "Yacine Belkacem",
    badge: "English · IELTS & TOEFL", badgeBg: "#EEF2FF", badgeColor: "#4A6CF7",
    desc: "10 ans d'expérience, ancien examinateur IELTS. Spécialiste du Speaking et du Writing.",
    rating: 5.0,
  },
  {
    initials: "AM", avatarBg: "#F5A623",
    name: "Amina Meziane",
    badge: "Français · TCF & TEF", badgeBg: "#FEF9C3", badgeColor: "#B45309",
    desc: "Professeure certifiée FLE. Accompagne les candidats à l'immigration depuis 8 ans.",
    rating: 5.0,
  },
  {
    initials: "SK", avatarBg: "#34C88A",
    name: "Sofiane Khelifi",
    badge: "English · TOEIC Business", badgeBg: "#D1FAE5", badgeColor: "#059669",
    desc: "Formateur en entreprise. Prépare les professionnels au TOEIC et à l'anglais des affaires.",
    rating: 4.0,
  },
];

const Instructors = () => (
  <section className="instructors">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">NOS FORMATEURS</p>
        <h2 className="section-title">
          Apprenez avec de <span className="text-amber">vrais experts</span>
        </h2>
      </div>
      <div className="instructors-grid">
        {INSTRUCTORS.map((inst, i) => (
          <div className="inst-card" key={i}>
            <div
              className="inst-avatar"
              style={{ background: inst.avatarBg }}
            >
              {inst.initials}
            </div>
            <h3 className="inst-name">{inst.name}</h3>
            <span
              className="inst-badge"
              style={{ background: inst.badgeBg, color: inst.badgeColor }}
            >
              {inst.badge}
            </span>
            <p className="inst-desc">{inst.desc}</p>
            <Stars rating={inst.rating} />
            <button className="btn btn--outline-orange btn--block">
              Réserver une session
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "Combien de temps faut-il pour préparer un examen ?",
    a: "En moyenne 2 à 4 mois selon votre niveau de départ et votre objectif. Nos parcours s'adaptent à votre rythme avec un planning personnalisé."},
  {
    q: "Proposez-vous des tests blancs ?",
    a: "Oui ! Chaque parcours inclut des tests blancs chronométrés dans les conditions réelles de l'examen, avec corrigés détaillés."},
  {
    q: "Les professeurs sont-ils certifiés ?",
    a: "Tous nos professeurs sont certifiés et plusieurs sont d'anciens examinateurs officiels IELTS et TCF." },
  {
    q: "Quelle est la différence entre TCF et TEF ?",
    a: "Les deux évaluent le français. Le TCF est souvent demandé pour la naturalisation et le Canada, le TEF pour l'immigration francophone. Nous vous aidons à choisir."},
  {
    q: "Que se passe-t-il si j'échoue à l'examen ?",
    a: "Nous vous accompagnons pour une nouvelle tentative sans frais supplémentaires sur la plateforme, avec un bilan ciblé de vos points faibles." },
];

const FaqItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-item--open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{item.q}</span>
        <span className="faq-icon">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="faq-answer">{item.a}</p>}
    </div>
  );
};

const Faq = () => (
  <section className="faq">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">FAQ</p>
        <h2 className="section-title">
          Questions <span className="text-amber">fréquentes</span>
        </h2>
      </div>
      <div className="faq-list">
        {FAQ_DATA.map((item, i) => (
          <FaqItem key={i} item={item} />
        ))}
      </div>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-col footer-col--brand">
        <div className="footer-logo">
          <img src="/logo.png" alt="Lingly Academy" className="footer-logo-img"
            onError={(e) => { e.target.style.display = "none"; }} />
          
        </div>
        <p className="footer-tagline">
          « Don't just learn it. Live it. »<br />
          Apprendre une langue n'a jamais été aussi simple !
        </p>
      </div>
      <div className="footer-col">
        <h4 className="footer-col-title">NAVIGATION</h4>
        <ul className="footer-links">
          {["Accueil","Cours","Examens","Tarifs","Contact"].map((l) => (
            <li key={l}><a href={`#${l.toLowerCase()}`} className="footer-link">{l}</a></li>
          ))}
        </ul>
      </div>
      <div className="footer-col">
        <h4 className="footer-col-title">LANGUES</h4>
        <div className="footer-langs">
          {["FR","EN","AR","TR","ES","DE"].map((lang) => (
            <span key={lang} className="footer-lang-pill">{lang}</span>
          ))}
        </div>
      </div>
      <div className="footer-col">
        <h4 className="footer-col-title">CONTACT</h4>
        <ul className="footer-contact">
          <li>📞 0784091727</li>
          <li>🌐 www.linglyacademy.dz</li>
          <li>📸 @lingly_academy</li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 Lingly Academy — www.linglyacademy.dz</span>
      <a href="https://instagram.com/lingly_academy" className="footer-ig">
        <img src="/mascot.png" alt="" className="footer-mascot"
          onError={(e) => { e.target.style.display = "none"; }} />
        Instagram @lingly_academy
      </a>
    </div>
  </footer>
);

// ─── EXAMENS PAGE ─────────────────────────────────────────────────────────────
const Examens = () => (
  <div className="page">
    <Navbar />
    <Hero />
    <ExamsGrid />
    <Instructors />
    <Faq />
    <Footer />
  </div>
);

export default Examens;