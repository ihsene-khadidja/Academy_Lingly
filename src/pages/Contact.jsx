import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";
import Navbar from "./Navbar";

// ─── EN-TÊTE DE PAGE ───────────────────────────────────────────────────────────
const PageHeader = () => (
  <section className="contact-pagehead">
    <div className="section-inner">
      <p className="contact-breadcrumb">
        <Link to="/" className="contact-breadcrumb-link">Accueil</Link>
        <span className="contact-breadcrumb-sep"> / </span>
        <span className="contact-breadcrumb-current">Contact</span>
      </p>
      <h1 className="contact-title">
        Parlons <span className="text-amber">ensemble</span>
      </h1>
      <p className="contact-subtitle">
        Une question ? Une inscription ? Notre équipe vous répond rapidement.
      </p>
    </div>
  </section>
);

// ─── COORDONNÉES ──────────────────────────────────────────────────────────────
const CONTACT_INFO = [
  { icon: "📞", bg: "#D1FAE5", label: "TÉLÉPHONE & WHATSAPP", value: "0784091727" },
  { icon: "🌐", bg: "#DBEAFE", label: "SITE WEB", value: "www.linglyacademy.dz" },
  { icon: "📸", bg: "#FCE7F3", label: "INSTAGRAM", value: "@lingly_academy" },
  { icon: "🕐", bg: "#FEF3C7", label: "HORAIRES", value: "Sam – Jeu, 9h – 19h" },
];

const ContactInfo = () => (
  <div className="contact-card contact-info-card">
    <h2 className="contact-card-title">Nos coordonnées</h2>
    <ul className="contact-info-list">
      {CONTACT_INFO.map((item, i) => (
        <li className="contact-info-item" key={i}>
          <span className="contact-info-icon" style={{ background: item.bg }}>
            {item.icon}
          </span>
          <div>
            <span className="contact-info-label">{item.label}</span>
            <span className="contact-info-value">{item.value}</span>
          </div>
        </li>
      ))}
    </ul>
    <div className="contact-map">
      <span className="contact-map-pin">📍</span>
      <span className="contact-map-label">Alger, Algérie</span>
    </div>
  </div>
);

// ─── FORMULAIRE ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  "Inscription à un cours",
  "Préparation aux examens",
  "Question sur les tarifs",
  "Support technique",
  "Autre",
];

const ContactForm = () => {
  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", sujet: SUBJECTS[0], message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pas de backend connecté pour le moment : on simule juste l'envoi.
    setSent(true);
    setForm({ nom: "", email: "", telephone: "", sujet: SUBJECTS[0], message: "" });
  };

  return (
    <div className="contact-card contact-form-card">
      <h2 className="contact-card-title">Envoyez-nous un message</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label className="contact-label">
          Nom complet
          <input
            type="text"
            name="nom"
            className="contact-input"
            placeholder="Votre nom"
            value={form.nom}
            onChange={handleChange}
            required
          />
        </label>

        <label className="contact-label">
          Email
          <input
            type="email"
            name="email"
            className="contact-input"
            placeholder="vous@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="contact-label">
          Téléphone
          <input
            type="tel"
            name="telephone"
            className="contact-input"
            placeholder="0xxxxxxxxx"
            value={form.telephone}
            onChange={handleChange}
          />
        </label>

        <label className="contact-label">
          Sujet
          <select
            name="sujet"
            className="contact-input contact-select"
            value={form.sujet}
            onChange={handleChange}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="contact-label">
          Message
          <textarea
            name="message"
            className="contact-input contact-textarea"
            placeholder="Comment pouvons-nous vous aider ?"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn btn--grad btn--block">
          Envoyer le message
        </button>

        {sent && (
          <p className="contact-success">
            ✅ Merci ! Votre message a été envoyé avec succès. Nous vous répondrons rapidement.
          </p>
        )}
      </form>
    </div>
  );
};

const ContactSection = () => (
  <section className="contact-main">
    <div className="section-inner contact-grid">
      <ContactInfo />
      <ContactForm />
    </div>
  </section>
);

// ─── BANNIÈRE WHATSAPP ────────────────────────────────────────────────────────
const WhatsappBanner = () => (
  <section className="whatsapp-banner-section">
    <div className="section-inner whatsapp-banner">
      <div>
        <p className="whatsapp-banner-title">
          <span className="whatsapp-banner-icon">💬</span>
          Contactez-nous directement sur WhatsApp
        </p>
        <p className="whatsapp-banner-desc">Réponse rapide, du samedi au jeudi.</p>
      </div>
      <a
        href="https://wa.me/213784091727"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--white whatsapp-banner-btn"
      >
        Ouvrir WhatsApp · 0784091727
      </a>
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

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
const Contact = () => (
  <div className="page">
    <Navbar />
    <PageHeader />
    <ContactSection />
    <WhatsappBanner />
    <Footer />
  </div>
);

export default Contact;