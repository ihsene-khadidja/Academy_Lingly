import React, { useState } from "react";
import "./Tarifs.css";
import Navbar from "./Navbar";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section className="tarifs-hero">
    <div className="section-inner">
      <p className="eyebrow tarifs-eyebrow">TARIFS</p>
      <h1 className="tarifs-title">
        Choisissez votre <span className="text-amber">plan</span>
      </h1>
      <p className="tarifs-desc">
        Deux formules simples pour atteindre vos objectifs.
        Sans engagement, sans surprise.
      </p>
    </div>
  </section>
);

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Standard",
    price: "1 000",
    desc: "Pour apprendre à votre rythme.",
    featured: false,
    cta: "Commencer maintenant",
    features: [
      { ok: true,  label: "Tous les exercices" },
      { ok: true,  label: "Corrigés inclus" },
      { ok: true,  label: "Cours complets A1 → C2" },
      { ok: true,  label: "Suivi de progression détaillé" },
      { ok: true,  label: "Préparation aux examens" },
      { ok: true,  label: "De vrais professeurs" },
      { ok: true,  label: "Certificats de niveau" },
      { ok: false, label: "Coaching individuel 1-to-1" },
      { ok: false, label: "Certificat officiel reconnu" },
      { ok: false, label: "Accès illimité aux examens blancs" },
      { ok: false, label: "Support prioritaire WhatsApp 24/7" },
    ],
  },
  {
    name: "Premium",
    price: "2 000",
    desc: "L'expérience complète Lingly, sans limite.",
    featured: true,
    cta: "Devenir Premium",
    features: [
      { ok: true, label: "Tous les exercices" },
      { ok: true, label: "Corrigés inclus" },
      { ok: true, label: "Cours complets A1 → C2" },
      { ok: true, label: "Suivi de progression détaillé" },
      { ok: true, label: "Préparation aux examens" },
      { ok: true, label: "De vrais professeurs" },
      { ok: true, label: "Certificats de niveau" },
      { ok: true, label: "Coaching individuel 1-to-1" },
      { ok: true, label: "Certificat officiel reconnu" },
      { ok: true, label: "Accès illimité aux examens blancs" },
      { ok: true, label: "Support prioritaire WhatsApp 24/7" },
    ],
  },
];

const Plans = () => (
  <section className="plans-section">
    <div className="section-inner">
      <div className="plans-grid">
        {PLANS.map((plan, i) => (
          <div
            className={`plan-card ${plan.featured ? "plan-card--featured" : ""}`}
            key={i}
          >
            {plan.featured && <span className="plan-badge">⭐ Recommandé</span>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              {plan.price}
              <span className="plan-price-unit">Da / mois</span>
            </div>
            <p className="plan-desc">{plan.desc}</p>
            <ul className="plan-features">
              {plan.features.map((f, j) => (
                <li
                  key={j}
                  className={`plan-feature ${f.ok ? "" : "plan-feature--off"}`}
                >
                  <span className="plan-feature-icon">{f.ok ? "✅" : "❌"}</span>
                  {f.label}
                </li>
              ))}
            </ul>
            <button
              className={`btn btn--block ${
                plan.featured ? "btn--white" : "btn--outline-orange"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── COMMENT PAYER ────────────────────────────────────────────────────────────
const PAY_STEPS = [
  { num: "1", title: "Choisir un plan", desc: "Sélectionnez l'offre Standard ou Premium qui vous convient." },
  { num: "2", title: "Contacter via WhatsApp", desc: "Écrivez-nous au 0784091727 pour confirmer." },
  { num: "3", title: "Effectuer le paiement", desc: "Réglez 1 000 Da ou 2 000 Da selon votre offre, par le moyen de votre choix." },
  { num: "4", title: "Accéder immédiatement", desc: "Votre compte est activé instantanément. 🚀" },
];

const HowToPay = () => (
  <section className="how-pay">
    <div className="section-inner">
      <div className="section-header">
        <p className="eyebrow">SIMPLE & RAPIDE</p>
        <h2 className="section-title">
          Comment <span className="text-amber">payer</span>
        </h2>
        <p className="section-subtitle">
          Quatre étapes pour activer votre accès Standard ou Premium.
        </p>
      </div>
      <div className="how-pay-grid">
        {PAY_STEPS.map((step) => (
          <div className="how-pay-card" key={step.num}>
            <div className="how-pay-num">{step.num}</div>
            <h3 className="how-pay-title">{step.title}</h3>
            <p className="how-pay-desc">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="how-pay-banner">
        💬 Paiement &amp; support via WhatsApp : 0784091727
      </div>
    </div>
  </section>
);

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "Le plan gratuit est-il vraiment gratuit ?",
    a: "Oui, à 100%. Tous les exercices et leurs corrigés sont accessibles gratuitement, sans carte bancaire ni engagement.",
  },
  {
    q: "Puis-je annuler mon abonnement Premium ?",
    a: "Bien sûr. L'abonnement est mensuel et sans engagement — vous pouvez arrêter quand vous le souhaitez.",
  },
  {
    q: "Comment payer 1 000 Da ou 2 000 Da par mois ?",
    a: "Le paiement se fait simplement via WhatsApp au 0784091727. Nous acceptons plusieurs moyens de paiement locaux.",
  },
  {
    q: "Y a-t-il une réduction pour plusieurs mois ?",
    a: "Pas encore pour le moment, mais des formules multi-mois arrivent bientôt. Contactez-nous sur WhatsApp pour être informé en priorité.",
  },
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
          Questions sur les <span className="text-amber">tarifs</span>
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

// ─── TARIFS PAGE ──────────────────────────────────────────────────────────────
const Tarifs = () => (
  <div className="page">
    <Navbar />
    <Hero />
    <Plans />
    <HowToPay />
    <Faq />
    <Footer />
  </div>
);

export default Tarifs;