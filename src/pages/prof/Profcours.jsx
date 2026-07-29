// src/pages/prof/ProfCours.jsx
// Ajout de cours et d'exercices, limité aux groupes assignés au prof.
// Réutilise la même logique d'upload (Supabase Storage) que la page admin
// équivalente (Lessons.jsx) et le même modèle Firestore ("lessons"), avec un
// champ supplémentaire "categorie" ("cours" | "exercice").
import React, { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, documentId, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { uploadToSupabase } from "../../utils/uploadToSupabase";
import ProfLayout from "./ProfLayout";

const NIVEAU_COLOR = {
  A1:"a-badge--green", A2:"a-badge--green",
  B1:"a-badge--blue",  B2:"a-badge--blue",
  C1:"a-badge--pink",  C2:"a-badge--pink",
};
const LANGUE_EMOJI = { EN:"🇬🇧", FR:"🇫🇷", AR:"🇩🇿", TR:"🇹🇷", ES:"🇪🇸", DE:"🇩🇪" };

const FILE_TYPES = [
  { type:"pdf",   label:"PDF",        emoji:"📄", accept:".pdf",       color:"#FEE2E2" },
  { type:"word",  label:"Word",       emoji:"📝", accept:".doc,.docx", color:"#DBEAFE" },
  { type:"ppt",   label:"PowerPoint", emoji:"📊", accept:".ppt,.pptx", color:"#FEF3C7" },
  { type:"video", label:"Vidéo",      emoji:"🎬", accept:"video/*",    color:"#F3E8FF" },
  { type:"audio", label:"Audio",      emoji:"🎧", accept:"audio/*",    color:"#ECFDF5" },
  { type:"link",  label:"Lien URL",   emoji:"🔗", accept:null,         color:"#EEF2FF" },
  { type:"image", label:"Image",      emoji:"🖼️", accept:"image/*",    color:"#FCE7F3" },
  { type:"autre", label:"Autre",      emoji:"📁", accept:"*",          color:"#F0F4FF" },
];
const CATEGORIES = [
  { cat:"cours",    label:"Cours",    emoji:"📖" },
  { cat:"exercice", label:"Exercice", emoji:"✏️" },
];

const Spinner = () => (
  <div style={{ textAlign:"center", padding:"3rem", color:"var(--ink-soft)" }}>⏳ Chargement…</div>
);

// ─── MODAL COURS / EXERCICE ────────────────────────────────────────────────────
const LessonModal = ({ lesson, groupe, onSave, onClose }) => {
  const EMPTY = { titre:"", categorie:"cours", type:"pdf", fileUrl:"", desc:"" };
  const [form,      setForm]      = useState(lesson || EMPTY);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [saving,    setSaving]    = useState(false);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const ft = FILE_TYPES.find((f) => f.type === form.type) || FILE_TYPES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) return;
    setSaving(true);
    try {
      let finalForm = { ...form };
      if (file && form.type !== "link") {
        setUploading(true); setProgress(10);
        const url = await uploadToSupabase(file);
        setProgress(100);
        finalForm.fileUrl = url;
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
          <span className="a-modal-title">{lesson ? "✏️ Modifier" : `➕ Ajouter — ${groupe}`}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={handleSubmit}>
            <div className="a-label">
              Type de contenu
              <div className="a-file-types" style={{ marginTop:".4rem" }}>
                {CATEGORIES.map((c) => (
                  <button key={c.cat} type="button"
                    className={`a-file-type-btn ${form.categorie === c.cat ? "a-file-type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, categorie: c.cat }))}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="a-label">Titre *
              <input className="a-input" name="titre" value={form.titre} onChange={ch}
                placeholder={form.categorie === "exercice" ? "ex. Exercice — Present Simple" : "ex. Present Simple — Introduction"} required />
            </label>

            <label className="a-label">Description
              <textarea className="a-input a-textarea" name="desc" value={form.desc} onChange={ch} rows={2}
                placeholder="Consignes, objectifs…" />
            </label>

            <div className="a-label">
              Format du fichier
              <div className="a-file-types" style={{ marginTop:".4rem" }}>
                {FILE_TYPES.map((f) => (
                  <button key={f.type} type="button"
                    className={`a-file-type-btn ${form.type === f.type ? "a-file-type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type:f.type, fileUrl:"" }))}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {form.type === "link" ? (
              <label className="a-label">URL *
                <input className="a-input" name="fileUrl" value={form.fileUrl} onChange={ch} type="url" placeholder="https://…" />
              </label>
            ) : (
              <label className="a-label">
                {ft.emoji} Fichier {ft.label}
                <input type="file" accept={ft.accept || "*"} onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ padding:".5rem", border:"1px solid var(--border)", borderRadius:"var(--r-btn)", background:"var(--white)", cursor:"pointer" }} />
                {!file && form.fileUrl && (
                  <span style={{ fontSize:".8rem", color:"var(--ink-soft)" }}>
                    Fichier actuel : <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color:"var(--orange)" }}>Ouvrir ↗</a>
                  </span>
                )}
                {uploading && (
                  <div style={{ marginTop:".5rem" }}>
                    <div style={{ height:6, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${progress}%`, background:"var(--grad-orange)", transition:"width .3s" }} />
                    </div>
                  </div>
                )}
                {file && !uploading && <span style={{ fontSize:".8rem", color:"#059669" }}>✓ {file.name} sélectionné</span>}
              </label>
            )}

            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Annuler</button>
              <button type="submit" className="btn btn--grad" disabled={saving || uploading}>
                {uploading ? `Upload ${progress}%…` : saving ? "Enregistrement…" : lesson ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ConfirmDelete = ({ lesson, onConfirm, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">Supprimer</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-confirm-body">
          <div className="a-confirm-icon">🗑️</div>
          <p className="a-confirm-msg">Supprimer <strong>« {lesson.titre} »</strong> ?</p>
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

// ═══════════════════════════════════════════════════════════════════════════════
const ProfCours = () => {
  const { userProfile } = useAuth();
  const groupIds = userProfile?.groupIds || [];

  const [groups,    setGroups]    = useState([]);
  const [lessons,   setLessons]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [selGrp,    setSelGrp]    = useState(null);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [selLesson, setSelLesson] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      if (groupIds.length === 0) { setGroups([]); setLessons([]); return; }
      const grpSnap = await getDocs(
        query(collection(db, "groups"), where(documentId(), "in", groupIds.slice(0, 30)))
      );
      const myGroups = grpSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGroups(myGroups);

      const groupNames = [...new Set(myGroups.map((g) => g.nom))];
      if (groupNames.length > 0) {
        const lesSnap = await getDocs(
          query(collection(db, "lessons"), where("groupe", "in", groupNames.slice(0, 30)))
        );
        setLessons(lesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur Firestore : " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [JSON.stringify(groupIds)]);

  // Filtre strict nom + langue + niveau, pour éviter toute collision avec un
  // groupe homonyme d'une autre combinaison langue/niveau.
  const currentLessons = selGrp
    ? lessons
        .filter((l) => l.groupe === selGrp.nom && l.langue === selGrp.langue && l.niveau === selGrp.niveau)
        .filter((l) => l.titre?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    : [];

  const handleSave = async (form) => {
    try {
      if (selLesson) {
        await updateDoc(doc(db, "lessons", selLesson.id), {
          titre: form.titre, desc: form.desc || "", type: form.type,
          categorie: form.categorie, fileUrl: form.fileUrl || "", updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "lessons"), {
          titre: form.titre, desc: form.desc || "", type: form.type, categorie: form.categorie,
          langue: selGrp.langue, niveau: selGrp.niveau, groupe: selGrp.nom,
          fileUrl: form.fileUrl || "", prof: userProfile?.nom || "", profId: userProfile?.uid || "",
          createdAt: serverTimestamp(),
        });
      }
      await loadAll();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
    setModal(null); setSelLesson(null);
  };

  const handleDelete = async (lesson) => {
    try {
      await deleteDoc(doc(db, "lessons", lesson.id));
      await loadAll();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const fileInfo = (type) => FILE_TYPES.find((f) => f.type === type) || FILE_TYPES[FILE_TYPES.length - 1];

  if (error) return (
    <ProfLayout title="Cours & Exercices">
      <div className="a-empty">
        <div className="a-empty-icon">⚠️</div>
        <div className="a-empty-title">Erreur Firestore</div>
        <p className="a-empty-desc">{error}</p>
        <button className="btn btn--grad" style={{ marginTop:"1rem" }} onClick={loadAll}>Réessayer</button>
      </div>
    </ProfLayout>
  );

  return (
    <ProfLayout title="Cours & Exercices">
      {selGrp && (
        <div className="a-breadcrumb">
          <button className="a-breadcrumb-item" onClick={() => setSelGrp(null)}>Mes groupes</button>
          <span className="a-breadcrumb-sep">›</span>
          <span className="a-breadcrumb-item a-breadcrumb-item--active">{selGrp.nom}</span>
        </div>
      )}

      {loading ? <Spinner /> : !selGrp ? (
        <>
          <div className="admin-content-header">
            <div className="admin-content-title">Choisir un groupe</div>
          </div>
          {groups.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">👥</div>
              <div className="a-empty-title">Aucun groupe assigné</div>
            </div>
          ) : (
            <div className="a-groupe-grid">
              {groups.map((g) => {
                const count = lessons.filter((l) => l.groupe === g.nom && l.langue === g.langue && l.niveau === g.niveau).length;
                return (
                  <div key={g.id} className="a-groupe-card" onClick={() => setSelGrp(g)}>
                    <div>
                      <div className="a-groupe-card-name">{LANGUE_EMOJI[g.langue]} {g.nom}</div>
                      <div className="a-groupe-card-meta">
                        <span className={`a-badge ${NIVEAU_COLOR[g.niveau] || "a-badge--navy"}`} style={{ marginRight:".4rem" }}>{g.niveau}</span>
                        {count} contenu{count > 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className="a-groupe-card-arrow">›</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">{selGrp.nom}</div>
              <div className="admin-content-subtitle">{currentLessons.length} contenu{currentLessons.length > 1 ? "s" : ""}</div>
            </div>
            <button className="btn btn--grad" onClick={() => { setSelLesson(null); setModal("add"); }}>➕ Ajouter</button>
          </div>

          <div className="a-toolbar">
            <div className="a-search-wrap">
              <span className="a-search-icon">🔍</span>
              <input className="a-search" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {currentLessons.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">📚</div>
              <div className="a-empty-title">Aucun cours ni exercice pour ce groupe</div>
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
                          <span className={`a-badge ${c.categorie === "exercice" ? "a-badge--amber" : "a-badge--blue"}`}>
                            {c.categorie === "exercice" ? "✏️ Exercice" : "📖 Cours"}
                          </span>
                          <span className="a-badge a-badge--navy">{fi.label}</span>
                          {c.desc && <span style={{ color:"var(--ink-soft)", fontSize:".8rem" }}>{c.desc}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="lesson-card-right">
                      {c.fileUrl && (
                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                          {c.type === "link" ? "🔗 Ouvrir" : "Télécharger"}
                        </a>
                      )}
                      <button className="btn btn--ghost btn--sm" onClick={() => { setSelLesson(c); setModal("edit"); }}>✏️</button>
                      <button className="btn btn--danger btn--sm" onClick={() => { setSelLesson(c); setModal("delete"); }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {(modal === "add" || modal === "edit") && (
        <LessonModal lesson={modal === "edit" ? selLesson : null} groupe={selGrp?.nom}
          onSave={handleSave} onClose={() => { setModal(null); setSelLesson(null); }} />
      )}
      {modal === "delete" && selLesson && (
        <ConfirmDelete lesson={selLesson} onConfirm={() => handleDelete(selLesson)}
          onClose={() => { setModal(null); setSelLesson(null); }} />
      )}
    </ProfLayout>
  );
};

export default ProfCours;
