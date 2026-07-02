// src/pages/admin/Lessons.jsx
// Navigation : Langue → Niveau → Liste des cours
// Support : PDF, Word, PPT, Vidéo, Lien, Texte
import React, { useState } from "react";
import AdminLayout from "./AdminLayout";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const LANGUES_CONFIG = [
  { code:"EN", nom:"Anglais",  emoji:"🇬🇧" },
  { code:"FR", nom:"Français", emoji:"🇫🇷" },
  { code:"AR", nom:"Arabe",    emoji:"🇩🇿" },
  { code:"TR", nom:"Turc",     emoji:"🇹🇷" },
  { code:"ES", nom:"Espagnol", emoji:"🇪🇸" },
  { code:"DE", nom:"Allemand", emoji:"🇩🇪" },
];

const NIVEAUX = ["A1","A2","B1","B2","C1","C2"];
const NIVEAU_COLOR = { A1:"a-badge--green",A2:"a-badge--green",B1:"a-badge--blue",B2:"a-badge--blue",C1:"a-badge--pink",C2:"a-badge--pink" };

const FILE_TYPES = [
  { type:"pdf",   label:"PDF",        emoji:"📄", accept:".pdf"                          },
  { type:"word",  label:"Word",       emoji:"📝", accept:".doc,.docx"                    },
  { type:"ppt",   label:"PowerPoint", emoji:"📊", accept:".ppt,.pptx"                    },
  { type:"video", label:"Vidéo",      emoji:"🎬", accept:"video/*"                       },
  { type:"audio", label:"Audio",      emoji:"🎧", accept:"audio/*"                       },
  { type:"link",  label:"Lien",       emoji:"🔗", accept:null                            },
  { type:"image", label:"Image",      emoji:"🖼️", accept:"image/*"                       },
  { type:"autre", label:"Autre",      emoji:"📁", accept:"*"                             },
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_LESSONS = [
  { id:"L1",  langue:"EN", niveau:"A1", titre:"Present Simple",        type:"pdf",   fileUrl:"https://example.com/L1.pdf",  desc:"Introduction au présent simple." },
  { id:"L2",  langue:"EN", niveau:"A1", titre:"To Be — Exercises",     type:"word",  fileUrl:"https://example.com/L2.docx", desc:"Exercices sur le verbe être." },
  { id:"L3",  langue:"EN", niveau:"B1", titre:"IELTS Writing Task 2",  type:"pdf",   fileUrl:"https://example.com/L3.pdf",  desc:"Méthodologie essay argumentatif." },
  { id:"L4",  langue:"EN", niveau:"B1", titre:"Speaking Practice",     type:"video", fileUrl:"https://youtube.com/xyz",     desc:"Vidéo de pratique orale." },
  { id:"L5",  langue:"FR", niveau:"A1", titre:"Les articles",          type:"pdf",   fileUrl:"https://example.com/L5.pdf",  desc:"Articles définis et indéfinis." },
  { id:"L6",  langue:"FR", niveau:"B1", titre:"TCF Expression écrite", type:"ppt",   fileUrl:"https://example.com/L6.pptx", desc:"Slides de préparation TCF." },
  { id:"L7",  langue:"TR", niveau:"A1", titre:"İsim Halleri",          type:"pdf",   fileUrl:"https://example.com/L7.pdf",  desc:"Les cas grammaticaux en turc." },
  { id:"L8",  langue:"ES", niveau:"B1", titre:"Subjuntivo",            type:"pdf",   fileUrl:"",                            desc:"Introduction au subjonctif." },
];

const EMPTY_FORM = { titre:"", type:"pdf", fileUrl:"", desc:"", langue:"EN", niveau:"A1" };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fileEmoji = (type) => FILE_TYPES.find((f) => f.type === type)?.emoji || "📁";
const fileBg    = (type) => ({
  pdf:"#FEE2E2", word:"#DBEAFE", ppt:"#FEF3C7",
  video:"#F3E8FF", audio:"#ECFDF5", link:"#EEF2FF",
  image:"#FCE7F3", autre:"#F0F4FF",
})[type] || "#F0F4FF";

// ─── MODAL COURS ──────────────────────────────────────────────────────────────
const LessonModal = ({ lesson, langue, niveau, onSave, onClose }) => {
  const [form, setForm] = useState(lesson || { ...EMPTY_FORM, langue, niveau });
  const [fileName, setFileName] = useState("");

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    // En production : uploader vers Firebase Storage et récupérer l'URL
    setForm((prev) => ({ ...prev, fileUrl: `[Firebase Storage] ${f.name}` }));
  };

  const ft = FILE_TYPES.find((f) => f.type === form.type);

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal-header">
          <span className="a-modal-title">{lesson ? "✏️ Modifier le cours" : "➕ Nouveau cours"}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={(e) => { e.preventDefault(); if(!form.titre.trim()) return; onSave(form); }}>

            <label className="a-label">Titre du cours *
              <input className="a-input" name="titre" value={form.titre} onChange={ch}
                placeholder="ex. Present Simple — Introduction" required />
            </label>

            <label className="a-label">Description / résumé
              <textarea className="a-input a-textarea" name="desc" value={form.desc} onChange={ch}
                placeholder="Contenu, objectifs du cours…" rows={3} />
            </label>

            {/* Type de fichier */}
            <div className="a-label">
              Type de contenu
              <div className="a-file-types" style={{ marginTop:".4rem" }}>
                {FILE_TYPES.map((f) => (
                  <button key={f.type} type="button"
                    className={`a-file-type-btn ${form.type === f.type ? "a-file-type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type: f.type, fileUrl:"" }))}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload ou lien */}
            {form.type === "link" ? (
              <label className="a-label">URL du lien *
                <input className="a-input" name="fileUrl" value={form.fileUrl} onChange={ch}
                  type="url" placeholder="https://youtube.com/…" />
              </label>
            ) : (
              <label className="a-label">
                {ft?.emoji} Fichier {ft?.label}
                <span className="a-label-hint">Sera uploadé sur Firebase Storage</span>
                <input type="file" accept={ft?.accept || "*"} onChange={handleFile}
                  style={{ padding:".5rem", border:"1px solid var(--border)", borderRadius:"var(--r-btn)", background:"var(--white)", cursor:"pointer" }} />
                {fileName && <span style={{ fontSize:".8rem", color:"var(--emerald,#34C88A)" }}>✓ {fileName}</span>}
                {!fileName && form.fileUrl && <span style={{ fontSize:".8rem", color:"var(--ink-soft)" }}>Actuel : {form.fileUrl}</span>}
              </label>
            )}

            <div className="a-warn-banner" style={{ marginTop:".25rem" }}>
              <span style={{ fontSize:"1rem" }}>⚠️</span>
              <div>En production : connectez Firebase Storage pour l'upload réel des fichiers. Actuellement le nom du fichier est enregistré en local.</div>
            </div>

            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--grad">{lesson ? "Enregistrer" : "Ajouter le cours"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ titre, onConfirm, onClose }) => (
  <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="a-modal">
      <div className="a-modal-header">
        <span className="a-modal-title">Supprimer le cours</span>
        <button className="a-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="a-confirm-body">
        <div className="a-confirm-icon">🗑️</div>
        <p className="a-confirm-msg">Supprimer <strong>« {titre} »</strong> ?<br />Cette action est irréversible.</p>
        <div className="a-confirm-actions">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn--danger" onClick={() => { onConfirm(); onClose(); }}>Supprimer</button>
        </div>
      </div>
    </div>
  </div>
);

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ langue, niveau, onReset }) => (
  <div className="a-breadcrumb">
    <button className="a-breadcrumb-item" onClick={() => onReset("langue")}>Langues</button>
    {langue && (<>
      <span className="a-breadcrumb-sep">›</span>
      <button className="a-breadcrumb-item" onClick={() => onReset("niveau")}>{langue}</button>
    </>)}
    {niveau && (<>
      <span className="a-breadcrumb-sep">›</span>
      <span className="a-breadcrumb-item a-breadcrumb-item--active">{niveau}</span>
    </>)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
const Lessons = () => {
  const [lessons,  setLessons]  = useState(INITIAL_LESSONS);
  const [step,     setStep]     = useState("langue");
  const [selLang,  setSelLang]  = useState(null);
  const [selNiv,   setSelNiv]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [selLesson,setSelLesson]= useState(null);

  const goReset = (to) => {
    if (to === "langue") { setStep("langue"); setSelLang(null); setSelNiv(null); }
    if (to === "niveau") { setStep("niveau"); setSelNiv(null); }
  };

  const langueStats = LANGUES_CONFIG.map((l) => ({
    ...l, count: lessons.filter((c) => c.langue === l.code).length,
  }));

  const niveauxDisponibles = selLang
    ? NIVEAUX.filter((n) => lessons.some((c) => c.langue === selLang && c.niveau === n))
    : [];

  const currentLessons = (selLang && selNiv)
    ? lessons.filter((c) => c.langue === selLang && c.niveau === selNiv &&
        (c.titre.toLowerCase().includes(search.toLowerCase()) ||
         c.desc.toLowerCase().includes(search.toLowerCase())))
    : [];

  const handleSave = (form) => {
    if (selLesson) {
      setLessons((p) => p.map((c) => c.id === selLesson.id ? { ...c, ...form } : c));
    } else {
      setLessons((p) => [{ ...form, id:`L${Date.now()}` }, ...p]);
    }
    setModal(null); setSelLesson(null);
  };

  const handleDelete = (id) => setLessons((p) => p.filter((c) => c.id !== id));

  return (
    <AdminLayout title="Cours">

      <Breadcrumb langue={selLang} niveau={selNiv} onReset={goReset} />

      {/* ════════════════════════════════════════
          STEP 1 — CHOISIR UNE LANGUE
      ════════════════════════════════════════ */}
      {step === "langue" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Choisir une langue</div>
              <div className="admin-content-subtitle">{lessons.length} cours au total</div>
            </div>
          </div>
          <div className="a-pick-grid">
            {langueStats.map((l) => (
              <div key={l.code} className="a-pick-card" onClick={() => { setSelLang(l.code); setStep("niveau"); }}>
                <div className="a-pick-card-icon">{l.emoji}</div>
                <div className="a-pick-card-label">{l.nom}</div>
                <div className="a-pick-card-count">
                  <span className="a-badge a-badge--navy">{l.count} cours</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 2 — CHOISIR UN NIVEAU
      ════════════════════════════════════════ */}
      {step === "niveau" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">
                {LANGUES_CONFIG.find((l) => l.code === selLang)?.emoji} {LANGUES_CONFIG.find((l) => l.code === selLang)?.nom} — Choisir un niveau
              </div>
            </div>
          </div>
          {niveauxDisponibles.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">📚</div>
              <div className="a-empty-title">Aucun cours pour cette langue</div>
              <p className="a-empty-desc">Sélectionnez un niveau ci-dessous pour ajouter des cours.</p>
            </div>
          ) : null}
          <div className="a-niveau-grid">
            {NIVEAUX.map((n) => {
              const count = lessons.filter((c) => c.langue === selLang && c.niveau === n).length;
              return (
                <div key={n} className="a-niveau-card" onClick={() => { setSelNiv(n); setStep("list"); setSearch(""); }}>
                  <div className="a-niveau-card-code">{n}</div>
                  <span className={`a-badge ${NIVEAU_COLOR[n]}`}>{count} cours</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 3 — LISTE DES COURS
      ════════════════════════════════════════ */}
      {step === "list" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">
                {LANGUES_CONFIG.find((l) => l.code === selLang)?.emoji} {selLang} · Niveau {selNiv}
              </div>
              <div className="admin-content-subtitle">
                {lessons.filter((c) => c.langue === selLang && c.niveau === selNiv).length} cours disponibles
              </div>
            </div>
            <button className="btn btn--grad" onClick={() => { setSelLesson(null); setModal("add"); }}>
              ➕ Ajouter un cours
            </button>
          </div>

          {/* Search */}
          <div className="a-toolbar">
            <div className="a-search-wrap">
              <span className="a-search-icon">🔍</span>
              <input className="a-search" placeholder="Rechercher un cours…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span style={{ fontSize:".82rem", color:"var(--ink-soft)", whiteSpace:"nowrap" }}>
              {currentLessons.length} résultat{currentLessons.length > 1 ? "s" : ""}
            </span>
          </div>

          {currentLessons.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">📚</div>
              <div className="a-empty-title">Aucun cours</div>
              <p className="a-empty-desc">Ajoutez votre premier cours pour ce niveau.</p>
            </div>
          ) : (
            <div className="lesson-list">
              {currentLessons.map((c) => (
                <div key={c.id} className="lesson-card">
                  <div className="lesson-card-left">
                    <div className="lesson-icon" style={{ background: fileBg(c.type) }}>
                      {fileEmoji(c.type)}
                    </div>
                    <div>
                      <div className="lesson-title">{c.titre}</div>
                      <div className="lesson-meta" style={{ display:"flex", gap:".5rem", flexWrap:"wrap", marginTop:".3rem" }}>
                        <span className={`a-badge ${NIVEAU_COLOR[c.niveau]}`}>{c.niveau}</span>
                        <span className="a-badge a-badge--navy">{FILE_TYPES.find((f)=>f.type===c.type)?.label || c.type}</span>
                        {c.desc && <span style={{ color:"var(--ink-soft)" }}>{c.desc}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="lesson-card-right">
                    {c.fileUrl && (
                      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn--ghost btn--sm">
                        {c.type === "link" ? "🔗 Ouvrir" : "⬇️ Télécharger"}
                      </a>
                    )}
                    <button className="btn btn--ghost btn--sm"
                      onClick={() => { setSelLesson(c); setModal("edit"); }}>✏️</button>
                    <button className="btn btn--danger btn--sm"
                      onClick={() => { setSelLesson(c); setModal("delete"); }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODALS ── */}
      {(modal === "add" || modal === "edit") && (
        <LessonModal
          lesson={modal === "edit" ? selLesson : null}
          langue={selLang} niveau={selNiv}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelLesson(null); }}
        />
      )}
      {modal === "delete" && selLesson && (
        <ConfirmDelete
          titre={selLesson.titre}
          onConfirm={() => handleDelete(selLesson.id)}
          onClose={() => { setModal(null); setSelLesson(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Lessons;