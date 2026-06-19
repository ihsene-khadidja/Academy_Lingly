import React from "react";
import "./Home.css";
import Navbar from "./Navbar";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="hero" id="accueil">
    <div className="hero-inner">
      <div className="hero-content">
        <div className="hero-badges">
          <span className="badge">🎁 Exercices gratuits</span>
          <span className="badge">🎓 A1 – C2</span>
          <span className="badge">👨‍🏫 Vrais profs</span>
        </div>
        <h1 className="hero-title">
          Apprendre une langue<br />
          n'a jamais été aussi<br />
          <span className="text-amber">simple !</span>
        </h1>
        <p className="hero-desc">
          Parle, comprends, progresse ! Six langues, de vrais professeurs
          et des exercices 100% gratuits pour les apprenants algériens.
        </p>
        <div className="hero-ctas">
          <button className="btn btn--grad btn--lg">Commencer gratuitement</button>
          <button className="btn btn--dark-outline btn--lg">Voir les cours</button>
        </div>
      </div>
      <div className="hero-mascot">
        <img
          src="/ph2.png"
          alt="Lingly Mascot"
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

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎁", iconBg: "#FEF9C3",
    title: "100% Gratuit",
    desc: "Tous les exercices et leurs corrigés sont gratuits. Apprends sans limite, sans carte bancaire.",
  },
  {
    icon: "🎓", iconBg: "#FBE6C7",
    title: "Niveaux A1 – C2",
    desc: "Des cours complets et organisés par niveau, du grand débutant au niveau expert.",
  },
  {
    icon: "👨‍🏫", iconBg: "#FBE6C7",
    title: "De vrais profs",
    desc: "Une plateforme conçue pour vous, animée par de véritables professeurs algériens.",
  },
];

const Features = () => (
  <section className="features">
    <div className="section-inner">
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon" style={{ backgroundColor: f.iconBg }}>
              <span>{f.icon}</span>
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "FR", name: "Français",  level: "Niveaux A1 – C2", color: "#4A6CF7" },
  { code: "GB", name: "English",   level: "Niveaux A1 – C2", color: "#E85D04" },
  { code: "DZ", name: "Arabe",     level: "Niveaux A1 – C2", color: "#34C88A" },
  { code: "TR", name: "Turc",      level: "Niveaux A1 – C2", color: "#D4537E" },
  { code: "ES", name: "Espagnol",  level: "Niveaux A1 – C2", color: "#F5A623" },
  { code: "DE", name: "Allemand",  level: "Niveaux A1 – C2", color: "#2a2a3a" },
];

const Languages = () => (
  <section className="languages" id="cours">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">6 LANGUES</p>
        <h2 className="section-title">
          Choisissez votre <span className="text-amber">langue</span>
        </h2>
        <p className="section-subtitle">
          Commencez aujourd'hui dans la langue de votre choix — du niveau débutant à expert.
        </p>
      </div>
      <div className="lang-grid">
        {LANGUAGES.map((lang, i) => (
          <div className="lang-card" key={i}>
            <div className="lang-code">{lang.code}</div>
            <div className="lang-name">{lang.name}</div>
            <div className="lang-level">{lang.level}</div>
            <a href="#cours" className="lang-cta" style={{ color: lang.color }}>
              Commencer →
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  { num: "1", title: "Explorez les contenus",   desc: "Découvrez nos langues et nos leçons gratuites." },
  { num: "2", title: "Choisissez votre niveau",  desc: "De A1 à C2, trouvez le cours qui vous va." },
  { num: "3", title: "Inscrivez-vous en ligne",  desc: "Quelques clics suffisent pour démarrer." },
  { num: "4", title: "Apprenez et progressez 🚀", desc: "Gagnez des étoiles et suivez vos progrès." },
];

const Steps = () => (
  <section className="steps">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">COMMENT ÇA MARCHE</p>
        <h2 className="section-title">
          4 étapes vers la <span className="text-amber">réussite</span>
        </h2>
      </div>
      <div className="steps-row">
        {STEPS.map((step, i) => (
          <React.Fragment key={i}>
            <div className="step">
              <div className="step-circle">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && <div className="step-dash">– –</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "« Grâce à Lingly j'ai enfin réussi mon IELTS avec un 7.5 ! Les profs sont géniaux. »",
    name: "Yasmine B.", location: "Alger, Algérie", initial: "Y",
  },
  {
    text: "« Les exercices gratuits sont incroyables. J'apprends l'anglais tous les jours, c'est devenu un jeu. »",
    name: "Mehdi T.", location: "Oran, Algérie", initial: "M",
  },
  {
    text: "« منصة رائعة! تعلمت الفرنسية بسهولة والدروس منظمة جداً. أنصح بها الجميع. »",
    name: "سارة ك.", location: "Constantine, Algérie", initial: "س",
  },
];

const Testimonials = () => (
  <section className="testimonials">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">ILS NOUS FONT CONFIANCE</p>
        <h2 className="section-title">
          Des apprenants <span className="text-amber">heureux</span>
        </h2>
      </div>
      <div className="testi-grid">
        {TESTIMONIALS.map((t, i) => (
          <div className="testi-card" key={i}>
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">{t.text}</p>
            <div className="testi-author">
              <div className="testi-avatar">{t.initial}</div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-loc">{t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── PRICING BANNER ───────────────────────────────────────────────────────────
const PricingBanner = () => (
  <section className="pricing-banner" id="tarifs">
    <div className="pricing-inner">
      <div className="pricing-content">
        <p className="pricing-eyebrow">COURS PAR NIVEAU</p>
        <h2 className="pricing-price">1 000 Da / mois</h2>
        <p className="pricing-sub">seulement !</p>
        <p className="pricing-desc">
          Accédez à tous les cours complets, le suivi de progression
          et la préparation aux examens.
        </p>
        <button className="btn btn--white btn--lg">S'inscrire maintenant</button>
      </div>
      <div className="pricing-mascot">
        <img
          src="/mascot.png"
          alt="Mascot"
          className="pricing-mascot-img"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
    </div>
  </section>
);

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────
const EXAMS = ["IELTS", "TOEFL", "TOEIC", "TCF", "TEF"];

const Certifications = () => (
  <section className="certifications" id="examens">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">PRÉPARATION AUX EXAMENS</p>
        <h2 className="section-title">
          Décrochez votre <span className="text-amber">certification</span>
        </h2>
        <p className="section-subtitle">
          Préparez les certifications internationales reconnues avec nos parcours dédiés.
        </p>
      </div>
      <div className="exams-row">
        {EXAMS.map((exam, i) => (
          <div className="exam-badge" key={i}>{exam}</div>
        ))}
      </div>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="footer" id="contact">
    <div className="footer-inner">
      <div className="footer-col footer-col--brand">
        <div className="footer-logo">
          <img
            src="/logo.png"
            alt="Lingly Academy"
            className="footer-logo-img"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <span className="footer-logo-fallback"> <strong>Lingly</strong></span>
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
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="footer-link">{l}</a>
            </li>
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
        <img
          src="/mascot.png"
          alt=""
          className="footer-mascot"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        Instagram @lingly_academy
      </a>
    </div>
  </footer>
);

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const Home = () => (
  <div className="home">
    <Navbar />
    <Hero />
    <Features />
    <Languages />
    <Steps />
    <Testimonials />
    <PricingBanner />
    <Certifications />
    <Footer />
  </div>
);

export default Home;