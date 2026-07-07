// src/pages/admin/Lessons.jsx
// Navigation : Langue → Niveau → Groupe → Cours
// Upload réel vers Firebase Storage — Firestore pour les métadonnées
// Les cours sont désormais rattachés à un groupe précis (et plus seulement à un niveau).
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { uploadToSupabase } from "../../utils/uploadToSupabase";
import AdminLayout from "./AdminLayout";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const LANGUES_CONFIG = [
  { code:"EN", nom:"Anglais",  emoji:"🇬🇧" },
  { code:"FR", nom:"Français", emoji:"🇫🇷" },
  { code:"AR", nom:"Arabe",    emoji:"🇩🇿" },
  { code:"TR", nom:"Turc",     emoji:"🇹🇷" },
  { code:"ES", nom:"Espagnol", emoji:"🇪🇸" },
  { code:"DE", nom:"Allemand", emoji:"🇩🇪" },
];
const NIVEAUX = ["A1","A2","B1","B2","C1","C2"];
const NIVEAU_COLOR = {
  A1:"a-badge--green", A2:"a-badge--green",
  B1:"a-badge--blue",  B2:"a-badge--blue",
  C1:"a-badge--pink",  C2:"a-badge--pink",
};
const SANS_GROUPE = "Sans groupe";

const FILE_TYPES = [
  { type:"pdf",   label:"PDF",        emoji:"📄", accept:".pdf",                color:"#FEE2E2" },
  { type:"word",  label:"Word",       emoji:"📝", accept:".doc,.docx",          color:"#DBEAFE" },
  { type:"ppt",   label:"PowerPoint", emoji:"📊", accept:".ppt,.pptx",          color:"#FEF3C7" },
  { type:"video", label:"Vidéo",      emoji:"🎬", accept:"video/*",             color:"#F3E8FF" },
  { type:"audio", label:"Audio",      emoji:"🎧", accept:"audio/*",             color:"#ECFDF5" },
  { type:"link",  label:"Lien URL",   emoji:"🔗", accept:null,                  color:"#EEF2FF" },
  { type:"image", label:"Image",      emoji:"🖼️", accept:"image/*",             color:"#FCE7F3" },
  { type:"autre", label:"Autre",      emoji:"📁", accept:"*",                   color:"#F0F4FF" },
];

const Spinner = () => (
  <div style={{ textAlign:"center", padding:"3rem", color:"var(--ink-soft)" }}>⏳ Chargement…</div>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Regroupe les cours par groupe. Les groupes déclarés (collection "groups") sont
// toujours listés, même sans cours. Les cours créés avant la mise en place des
// groupes (sans champ "groupe") sont rassemblés dans un panier "Sans groupe".
function buildGroupesMap(lessons, groupsList, langue, niveau) {
  const map = {};
  groupsList
    .filter((g) => g.langue === langue && g.niveau === niveau)
    .forEach((g) => { map[g.nom] = { nom: g.nom, prof: g.prof || "", id: g.id, lessons: [] }; });
  lessons
    .filter((c) => c.langue === langue && c.niveau === niveau)
    .forEach((c) => {
      const nom = c.groupe || SANS_GROUPE;
      if (!map[nom]) map[nom] = { nom, prof: "", id: null, lessons: [] };
      map[nom].lessons.push(c);
    });
  return map;
}

// ─── MODAL COURS ──────────────────────────────────────────────────────────────
const LessonModal = ({ lesson, langue, niveau, groupe, onSave, onClose }) => {
  const EMPTY = { titre:"", type:"pdf", fileUrl:"", storagePath:"", desc:"", langue, niveau, groupe };
  const [form,     setForm]     = useState(lesson || EMPTY);
  const [file,     setFile]     = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading,setUploading]= useState(false);
  const [saving,   setSaving]   = useState(false);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const ft = FILE_TYPES.find((f) => f.type === form.type) || FILE_TYPES[0];

const uploadFile = async (selectedFile) => {
  setUploading(true);
  setProgress(10);

  try {
    const url = await uploadToSupabase(selectedFile);

    setProgress(100);

    return {
      url,
      path: ""
    };
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) return;
    setSaving(true);
    try {
      let finalForm = { ...form };

      // Upload du fichier si sélectionné
      if (file && form.type !== "link") {
        setUploading(true);
        const { url, path } = await uploadFile(file);
        finalForm.fileUrl     = url;
        finalForm.storagePath = path;
        setUploading(false);
      }

      await onSave(finalForm);
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'upload : " + err.message);
      setUploading(false);
    }
    setSaving(false);
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal-header">
          <span className="a-modal-title">{lesson ? "✏️ Modifier le cours" : `➕ Nouveau cours — ${groupe}`}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={handleSubmit}>
            <label className="a-label">Titre du cours *
              <input className="a-input" name="titre" value={form.titre} onChange={ch}
                placeholder="ex. Present Simple — Introduction" required />
            </label>

            <label className="a-label">Description
              <textarea className="a-input a-textarea" name="desc" value={form.desc} onChange={ch}
                placeholder="Contenu, objectifs du cours…" rows={2} />
            </label>

            {/* Type de fichier */}
            <div className="a-label">
              Type de contenu
              <div className="a-file-types" style={{ marginTop:".4rem" }}>
                {FILE_TYPES.map((f) => (
                  <button key={f.type} type="button"
                    className={`a-file-type-btn ${form.type === f.type ? "a-file-type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type:f.type, fileUrl:"", storagePath:"" }))}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Champ selon type */}
            {form.type === "link" ? (
              <label className="a-label">URL *
                <input className="a-input" name="fileUrl" value={form.fileUrl} onChange={ch}
                  type="url" placeholder="https://youtube.com/…" />
              </label>
            ) : (
              <label className="a-label">
                {ft.emoji} Fichier {ft.label}
                <span className="a-label-hint">Sera stocké sur Supabase Storage</span>
                <input
                  type="file"
                  accept={ft.accept || "*"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ padding:".5rem", border:"1px solid var(--border)", borderRadius:"var(--r-btn)", background:"var(--white)", cursor:"pointer" }}
                />
                {/* Fichier actuel (mode édition) */}
                {!file && form.fileUrl && (
                  <span style={{ fontSize:".8rem", color:"var(--ink-soft)" }}>
                    Fichier actuel : <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color:"var(--orange)" }}>Ouvrir ↗</a>
                  </span>
                )}
                {/* Barre de progression */}
                {uploading && (
                  <div style={{ marginTop:".5rem" }}>
                    <div style={{ height:6, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${progress}%`, background:"var(--grad-orange)", transition:"width .3s" }} />
                    </div>
                    <span style={{ fontSize:".78rem", color:"var(--orange)" }}>Upload : {progress}%</span>
                  </div>
                )}
                {file && !uploading && (
                  <span style={{ fontSize:".8rem", color:"#059669" }}>✓ {file.name} sélectionné</span>
                )}
              </label>
            )}

            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Annuler</button>
              <button type="submit" className="btn btn--grad" disabled={saving || uploading}>
                {uploading ? `Upload ${progress}%…` : saving ? "Enregistrement…" : lesson ? "Enregistrer" : "Ajouter le cours"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ lesson, onConfirm, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">Supprimer le cours</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-confirm-body">
          <div className="a-confirm-icon">🗑️</div>
          <p className="a-confirm-msg">
            Supprimer <strong>« {lesson.titre} »</strong> ?<br />
            <span style={{ fontSize:".82rem" }}>Le fichier sera aussi supprimé de Supabase Storage.</span>
          </p>
          <div className="a-confirm-actions">
            <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn--danger" disabled={deleting}
              onClick={async () => { setDeleting(true); await onConfirm(); onClose(); }}>
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ langue, niveau, groupe, onReset }) => (
  <div className="a-breadcrumb">
    <button className="a-breadcrumb-item" onClick={() => onReset("langue")}>Langues</button>
    {langue && (<><span className="a-breadcrumb-sep">›</span>
      <button className="a-breadcrumb-item" onClick={() => onReset("niveau")}>{langue}</button></>)}
    {niveau && (<><span className="a-breadcrumb-sep">›</span>
      <button className="a-breadcrumb-item" onClick={() => onReset("groupe")}>{niveau}</button></>)}
    {groupe && (<><span className="a-breadcrumb-sep">›</span>
      <span className="a-breadcrumb-item a-breadcrumb-item--active">{groupe}</span></>)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
const Lessons = () => {
  const [lessons,   setLessons]   = useState([]);
  const [groups,    setGroups]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [step,      setStep]      = useState("langue");
  const [selLang,   setSelLang]   = useState(null);
  const [selNiv,    setSelNiv]    = useState(null);
  const [selGrp,    setSelGrp]    = useState(null);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [selLesson, setSelLesson] = useState(null);
  const [error,     setError]     = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lesSnap, grpSnap] = await Promise.all([
        getDocs(query(collection(db, "lessons"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "groups")),
      ]);
      setLessons(lesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setGroups(grpSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError("Erreur Firestore : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const goReset = (to) => {
    if (to === "langue") { setStep("langue"); setSelLang(null); setSelNiv(null); setSelGrp(null); }
    if (to === "niveau") { setStep("niveau"); setSelNiv(null); setSelGrp(null); }
    if (to === "groupe") { setStep("groupe"); setSelGrp(null); }
  };

  const langueStats = LANGUES_CONFIG.map((l) => ({
    ...l, count: lessons.filter((c) => c.langue === l.code).length,
  }));

  const groupesMap = (selLang && selNiv) ? buildGroupesMap(lessons, groups, selLang, selNiv) : {};

  const currentLessons = (selLang && selNiv && selGrp)
    ? lessons
        .filter((c) => c.langue === selLang && c.niveau === selNiv && (c.groupe || SANS_GROUPE) === selGrp)
        .filter((c) =>
          c.titre?.toLowerCase().includes(search.toLowerCase()) ||
          c.desc?.toLowerCase().includes(search.toLowerCase())
        )
    : [];

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      if (selLesson) {
        await updateDoc(doc(db, "lessons", selLesson.id), {
          titre:       form.titre,
          desc:        form.desc || "",
          type:        form.type,
          fileUrl:     form.fileUrl || "",
          storagePath: "",
          updatedAt:   serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "lessons"), {
          titre:       form.titre,
          desc:        form.desc || "",
          type:        form.type,
          langue:      form.langue,
          niveau:      form.niveau,
          groupe:      form.groupe,
          fileUrl:     form.fileUrl || "",
          storagePath: "",
          createdAt:   serverTimestamp(),
        });
      }
      await loadAll();
    } catch (err) {
      console.error("Erreur save lesson:", err);
      alert("Erreur : " + err.message);
    }
    setModal(null); setSelLesson(null);
  };

  const handleDelete = async (lesson) => {
    try {
      // Supprimer le fichier de Storage si existant
      
      await deleteDoc(doc(db, "lessons", lesson.id));
      await loadAll();
    } catch (err) {
      console.error("Erreur delete lesson:", err);
      alert("Erreur : " + err.message);
    }
  };

  const fileInfo = (type) => FILE_TYPES.find((f) => f.type === type) || FILE_TYPES[FILE_TYPES.length-1];

  if (error) return (
    <AdminLayout title="Cours">
      <div className="a-empty">
        <div className="a-empty-icon">⚠️</div>
        <div className="a-empty-title">Erreur Firestore</div>
        <p className="a-empty-desc">{error}</p>
        <button className="btn btn--grad" style={{ marginTop:"1rem" }} onClick={loadAll}>Réessayer</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Cours">
      <Breadcrumb langue={selLang} niveau={selNiv} groupe={selGrp} onReset={goReset} />

      {loading ? <Spinner /> : (
        <>
          {/* ══ STEP 1 — LANGUE ══ */}
          {step === "langue" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Choisir une langue</div>
                  <div className="admin-content-subtitle">{lessons.length} cours au total</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadAll}>🔄 Actualiser</button>
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

          {/* ══ STEP 2 — NIVEAU ══ */}
          {step === "niveau" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">
                    {LANGUES_CONFIG.find((l) => l.code === selLang)?.emoji} {LANGUES_CONFIG.find((l) => l.code === selLang)?.nom} — Choisir un niveau
                  </div>
                </div>
              </div>
              <div className="a-niveau-grid">
                {NIVEAUX.map((n) => {
                  const count = lessons.filter((c) => c.langue === selLang && c.niveau === n).length;
                  return (
                    <div key={n} className="a-niveau-card" onClick={() => { setSelNiv(n); setStep("groupe"); }}>
                      <div className="a-niveau-card-code">{n}</div>
                      <span className={`a-badge ${NIVEAU_COLOR[n]}`}>{count} cours</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ══ STEP 3 — GROUPE ══ */}
          {step === "groupe" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Niveau {selNiv} — Groupes</div>
                  <div className="admin-content-subtitle">{Object.keys(groupesMap).length} groupe{Object.keys(groupesMap).length > 1 ? "s" : ""}</div>
                </div>
              </div>
              {Object.keys(groupesMap).length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">👥</div>
                  <div className="a-empty-title">Aucun groupe pour ce niveau</div>
                  <p className="a-empty-desc">Créez d'abord un groupe depuis la section Étudiants & Groupes pour pouvoir y ajouter des cours.</p>
                  <Link to="/admin/students" className="btn btn--grad" style={{ marginTop:"1rem" }}>👩‍🎓 Aller à Étudiants & Groupes</Link>
                </div>
              ) : (
                <div className="a-groupe-grid">
                  {Object.values(groupesMap).map((g) => (
                    <div key={g.nom} className={`a-groupe-card ${g.nom === SANS_GROUPE ? "a-groupe-card--legacy" : ""}`}
                      onClick={() => { setSelGrp(g.nom); setStep("list"); setSearch(""); }}>
                      <div>
                        <div className="a-groupe-card-name">
                          {g.nom}
                          {g.nom === SANS_GROUPE && <span className="a-badge a-badge--navy" style={{ marginLeft:".5rem" }}>ancien</span>}
                        </div>
                        <div className="a-groupe-card-meta">
                          {g.lessons.length} cours{g.prof ? ` · ${g.prof}` : ""}
                        </div>
                      </div>
                      <span className="a-groupe-card-arrow">›</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ══ STEP 4 — LISTE DES COURS ══ */}
          {step === "list" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">
                    {LANGUES_CONFIG.find((l) => l.code === selLang)?.emoji} Groupe {selGrp}
                  </div>
                  <div className="admin-content-subtitle">
                    {currentLessons.length} cours
                  </div>
                </div>
                <button
                  className="btn btn--grad"
                  disabled={selGrp === SANS_GROUPE}
                  title={selGrp === SANS_GROUPE ? "Assignez d'abord un groupe à ces anciens cours" : undefined}
                  onClick={() => { setSelLesson(null); setModal("add"); }}
                >
                  ➕ Ajouter un cours
                </button>
              </div>

              {selGrp === SANS_GROUPE && (
                <div className="a-warn-banner" style={{ marginBottom:"1.25rem" }}>
                  ⚠️ Ces cours ont été créés avant la mise en place des groupes. Ils restent visibles ici, mais il n'est plus possible d'en ajouter de nouveaux dans cette section.
                </div>
              )}

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
                  <div className="a-empty-title">Aucun cours pour ce groupe</div>
                  <p className="a-empty-desc">Ajoutez votre premier cours en cliquant sur "Ajouter un cours".</p>
                </div>
              ) : (
                <div className="lesson-list">
                  {currentLessons.map((c) => {
                    const fi = fileInfo(c.type);
                    return (
                      <div key={c.id} className="lesson-card">
                        <div className="lesson-card-left">
                          <div className="lesson-icon" style={{ background: fi.color }}>{fi.emoji}</div>
                          <div>
                            <div className="lesson-title">{c.titre}</div>
                            <div className="lesson-meta" style={{ display:"flex", gap:".5rem", flexWrap:"wrap", marginTop:".3rem" }}>
                              <span className={`a-badge ${NIVEAU_COLOR[c.niveau]}`}>{c.niveau}</span>
                              <span className="a-badge a-badge--navy">{fi.label}</span>
                              {c.desc && <span style={{ color:"var(--ink-soft)", fontSize:".8rem" }}>{c.desc}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="lesson-card-right">
                          {c.fileUrl && (
                            <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="btn btn--ghost btn--sm">
                              {c.type === "link" ? "🔗 Ouvrir" : " Télécharger"}
                            </a>
                          )}
                          <button className="btn btn--ghost btn--sm"
                            onClick={() => { setSelLesson(c); setModal("edit"); }}>✏️</button>
                          <button className="btn btn--danger btn--sm"
                            onClick={() => { setSelLesson(c); setModal("delete"); }}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MODALS */}
      {(modal === "add" || modal === "edit") && (
        <LessonModal
          lesson={modal === "edit" ? selLesson : null}
          langue={selLang} niveau={selNiv} groupe={selGrp}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelLesson(null); }}
        />
      )}
      {modal === "delete" && selLesson && (
        <ConfirmDelete
          lesson={selLesson}
          onConfirm={() => handleDelete(selLesson)}
          onClose={() => { setModal(null); setSelLesson(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Lessons;
