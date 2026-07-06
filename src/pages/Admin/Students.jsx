// src/pages/admin/Students.jsx
// Navigation : Langue → Niveau → Groupe → Liste étudiants
// 100% connecté à Firestore — gestion complète des groupes (créer / supprimer),
// ajout d'étudiants déjà inscrits, déplacement et suppression uniques ou en masse.
import React, { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import AdminLayout from "./AdminLayout";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const LANGUES_CONFIG = [
  { code:"EN", nom:"Anglais",  emoji:"🇬🇧", bg:"#EEF2FF" },
  { code:"FR", nom:"Français", emoji:"🇫🇷", bg:"#FBE6C7" },
  { code:"AR", nom:"Arabe",    emoji:"🇩🇿", bg:"#D1FAE5" },
  { code:"TR", nom:"Turc",     emoji:"🇹🇷", bg:"#FCE7F3" },
  { code:"ES", nom:"Espagnol", emoji:"🇪🇸", bg:"#FEF9C3" },
  { code:"DE", nom:"Allemand", emoji:"🇩🇪", bg:"#e8eaf2" },
];
const NIVEAUX = ["A1","A2","B1","B2","C1","C2"];
const PROFS   = ["Yacine Belkacem","Amina Meziane","Sofiane Khelifi"];
const NIVEAU_COLOR = {
  A1:"a-badge--green", A2:"a-badge--green",
  B1:"a-badge--blue",  B2:"a-badge--blue",
  C1:"a-badge--pink",  C2:"a-badge--pink",
};
const NOM_RESERVE = "sans groupe";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Fusionne les groupes déclarés (collection "groups") et les groupes hérités
// implicitement des données étudiants (compatibilité avec les données existantes).
function buildGroupesMap(students, groupsList, langue, niveau) {
  const map = {};
  groupsList
    .filter((g) => g.langue === langue && g.niveau === niveau)
    .forEach((g) => {
      map[g.nom] = { nom: g.nom, prof: g.prof || "", id: g.id, students: [] };
    });
  students
    .filter((s) => s.langue === langue && s.niveau === niveau && s.groupe)
    .forEach((s) => {
      if (!map[s.groupe]) {
        map[s.groupe] = { nom: s.groupe, prof: s.prof || "", id: null, students: [] };
      }
      map[s.groupe].students.push(s);
    });
  return map;
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ textAlign:"center", padding:"3rem", color:"var(--ink-soft)", fontSize:".95rem" }}>
    ⏳ Chargement…
  </div>
);

// ─── MODAL ÉTUDIANT (créer / modifier / ajouter un étudiant déjà inscrit) ─────
const StudentModal = ({ student, langue, niveau, groupe, allStudents, onSave, onClose }) => {
  const EMPTY = { nom:"", email:"", tel:"", langue, niveau, groupe, prof:PROFS[0] };
  const [form,   setForm]   = useState(student || EMPTY);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const existing = !student
    ? allStudents.filter(
        (s) => s.groupe !== groupe &&
          (s.nom?.toLowerCase().includes(search.toLowerCase()) ||
           s.email?.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const handleAddExisting = async (s) => {
    setSaving(true);
    await onSave({ ...s, groupe, langue, niveau });
    setSaving(false);
    onClose();
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal-header">
          <span className="a-modal-title">{student ? "✏️ Modifier l'étudiant" : `➕ Ajouter dans ${groupe}`}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem", marginBottom:"1rem" }}>
            {student ? "Modifier les informations" : "Créer un nouvel étudiant"}
          </div>
          <form className="a-form" onSubmit={handleSubmit}>
            <div className="a-form-row">
              <label className="a-label">Nom complet *
                <input className="a-input" name="nom" value={form.nom} onChange={ch} placeholder="Yasmine Boudali" required />
              </label>
              <label className="a-label">Email *
                <input className="a-input" type="email" name="email" value={form.email} onChange={ch} placeholder="etudiant@gmail.com" required />
              </label>
            </div>
            <div className="a-form-row">
              <label className="a-label">Téléphone
                <input className="a-input" name="tel" value={form.tel || ""} onChange={ch} placeholder="07xxxxxxxx" />
              </label>
              <label className="a-label">Professeur
                <select className="a-input" name="prof" value={form.prof} onChange={ch}>
                  {PROFS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>
            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--grad" disabled={saving}>
                {saving ? "Enregistrement…" : student ? "Enregistrer" : "Créer et ajouter"}
              </button>
            </div>
          </form>

          {/* Ajouter un étudiant déjà inscrit ailleurs sur la plateforme */}
          {!student && (
            <div style={{ marginTop:"1.75rem" }}>
              <div style={{ height:1, background:"var(--border)", margin:"0 0 1.25rem" }} />
              <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem", marginBottom:".75rem" }}>
                Ou ajouter un étudiant déjà inscrit
              </div>
              <div style={{ position:"relative", marginBottom:".75rem" }}>
                <span className="a-search-icon">🔍</span>
                <input className="a-search" placeholder="Rechercher un étudiant déjà inscrit…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {search.length > 0 && (
                <div style={{ maxHeight:220, overflowY:"auto", display:"flex", flexDirection:"column", gap:".5rem" }}>
                  {existing.length === 0 ? (
                    <div style={{ fontSize:".85rem", color:"var(--ink-soft)", textAlign:"center", padding:"1rem" }}>Aucun résultat</div>
                  ) : existing.map((s) => (
                    <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".65rem 1rem", border:"1px solid var(--border)", borderRadius:10, gap:"1rem" }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".88rem" }}>{s.nom}</div>
                        <div style={{ fontSize:".75rem", color:"var(--ink-soft)" }}>
                          {s.email} · actuellement dans {s.groupe} ({s.langue} · {s.niveau})
                        </div>
                      </div>
                      <button className="btn btn--outline btn--sm" disabled={saving} onClick={() => handleAddExisting(s)}>
                        Ajouter ici
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MODAL CRÉER UN GROUPE ────────────────────────────────────────────────────
const GroupModal = ({ langue, niveau, existingNames, onSave, onClose }) => {
  const [nom,    setNom]    = useState("");
  const [prof,   setProf]   = useState(PROFS[0]);
  const [err,    setErr]    = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nom.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === NOM_RESERVE) {
      setErr("Ce nom est réservé. Choisissez un autre nom de groupe.");
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setErr("Ce nom de groupe existe déjà pour ce niveau.");
      return;
    }
    setSaving(true);
    await onSave({ nom: trimmed, prof });
    setSaving(false);
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">➕ Créer un groupe — {langue} {niveau}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={handleSubmit}>
            <label className="a-label">Nom du groupe *
              <input
                className="a-input" value={nom} autoFocus required
                placeholder={`ex. ${langue}-${niveau}-G${existingNames.length + 1}`}
                onChange={(e) => { setNom(e.target.value); setErr(""); }}
              />
            </label>
            {err && <div className="a-warn-banner">⚠️ {err}</div>}
            <label className="a-label">Professeur responsable
              <select className="a-input" value={prof} onChange={(e) => setProf(e.target.value)}>
                {PROFS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <div className="a-info-banner">
              <span className="a-info-banner-icon">💡</span>
              <div>Le groupe est créé vide. Ajoutez ensuite des étudiants (nouveaux ou déjà inscrits) directement dedans.</div>
            </div>
            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--grad" disabled={saving}>
                {saving ? "Création…" : "Créer le groupe"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL DÉPLACER (un ou plusieurs étudiants) ───────────────────────────────
const MoveModal = ({ students, currentGroupe, langue, niveau, existingGroupNames, onMove, onClose }) => {
  const alternatives = existingGroupNames.filter((g) => g !== currentGroupe);
  const [mode,      setMode]      = useState(alternatives.length > 0 ? "existing" : "new");
  const [target,    setTarget]    = useState(alternatives[0] || "");
  const [newGroupe, setNewGroupe] = useState("");
  const [saving,    setSaving]    = useState(false);

  const label = students.length > 1
    ? `${students.length} étudiants`
    : (students[0]?.nom || "cet étudiant");

  const handleConfirm = async () => {
    const dest = (mode === "new" ? newGroupe : target).trim();
    if (!dest) return;
    setSaving(true);
    await onMove(students, dest, mode === "new");
    setSaving(false);
    onClose();
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">↗️ Déplacer {label}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <div className="a-form">
            <p style={{ fontSize:".9rem", color:"var(--ink-soft)" }}>
              Actuellement dans <strong style={{ color:"var(--ink)" }}>{currentGroupe}</strong>
            </p>

            {alternatives.length > 0 && (
              <div>
                <div className="a-radio-row" onClick={() => setMode("existing")}>
                  <input type="radio" checked={mode === "existing"} readOnly />
                  Vers un groupe existant
                </div>
                <select
                  className="a-input" value={target} disabled={mode !== "existing"}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {alternatives.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            )}

            <div>
              <div className="a-radio-row" onClick={() => setMode("new")}>
                <input type="radio" checked={mode === "new"} readOnly />
                Vers un nouveau groupe
              </div>
              <input
                className="a-input" disabled={mode !== "new"}
                placeholder={`ex. ${langue}-${niveau}-G3`}
                value={newGroupe}
                onChange={(e) => { setNewGroupe(e.target.value); setMode("new"); }}
              />
            </div>

            <div className="a-form-actions">
              <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button className="btn btn--grad" disabled={saving} onClick={handleConfirm}>
                {saving ? "Déplacement…" : "Déplacer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRMATION GÉNÉRIQUE (suppression étudiant(s) / groupe) ────────────────
const ConfirmDialog = ({ icon = "🗑️", title, message, confirmLabel = "Supprimer", onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">{title}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-confirm-body">
          <div className="a-confirm-icon">{icon}</div>
          <p className="a-confirm-msg">{message}</p>
          <div className="a-confirm-actions">
            <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button
              className="btn btn--danger" disabled={busy}
              onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); onClose(); }}
            >
              {busy ? "Veuillez patienter…" : confirmLabel}
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
const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [step,     setStep]     = useState("langue");
  const [selLang,  setSelLang]  = useState(null);
  const [selNiv,   setSelNiv]   = useState(null);
  const [selGrp,   setSelGrp]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null); // add | edit | move | delete | createGroup | deleteGroup
  const [selStu,   setSelStu]   = useState(null);           // édition (unique)
  const [actionStudents, setActionStudents] = useState([]); // déplacer / supprimer (1 ou plusieurs)
  const [selGroupObj,    setSelGroupObj]    = useState(null); // groupe ciblé par une suppression
  const [selectedIds,    setSelectedIds]    = useState(new Set()); // sélection multiple (cases à cocher)
  const [error,    setError]    = useState(null);

  // ── Charger étudiants + groupes depuis Firestore ─────────────────────────
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stuSnap, grpSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "in", ["student","etudiant"]))),
        getDocs(collection(db, "groups")),
      ]);
      setStudents(stuSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setGroups(grpSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError("Erreur de chargement Firestore. Vérifiez vos règles de sécurité.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const clearSelection = () => setSelectedIds(new Set());

  const goReset = (to) => {
    clearSelection();
    if (to === "langue") { setStep("langue"); setSelLang(null); setSelNiv(null); setSelGrp(null); }
    if (to === "niveau") { setStep("niveau"); setSelNiv(null); setSelGrp(null); }
    if (to === "groupe") { setStep("groupe"); setSelGrp(null); }
  };

  // ── Calculs ──
  const langueStats = LANGUES_CONFIG.map((l) => ({
    ...l, count: students.filter((s) => s.langue === l.code).length,
  }));

  const niveauxDisponibles = selLang
    ? NIVEAUX.filter((n) =>
        groups.some((g) => g.langue === selLang && g.niveau === n) ||
        students.some((s) => s.langue === selLang && s.niveau === n)
      )
    : [];

  const groupesForNiveau = (selLang && selNiv) ? buildGroupesMap(students, groups, selLang, selNiv) : {};
  const groupInfo = selGrp ? groupesForNiveau[selGrp] : null;

  const groupeStudentsAll = groupInfo?.students || [];
  const groupeStudents = groupeStudentsAll.filter((s) =>
    (s.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Sélection multiple ──
  const toggleSelect = (id) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSelectAll = () => setSelectedIds((prev) =>
    prev.size === groupeStudents.length ? new Set() : new Set(groupeStudents.map((s) => s.id))
  );

  // ── CRUD Firestore ────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      if (selStu) {
        await updateDoc(doc(db, "users", selStu.id), {
          nom:    form.nom,
          email:  form.email,
          tel:    form.tel || "",
          prof:   form.prof,
          langue: form.langue,
          niveau: form.niveau,
          groupe: form.groupe,
        });
      } else if (form.id) {
        // Étudiant déjà inscrit : on le déplace simplement dans ce groupe
        await updateDoc(doc(db, "users", form.id), {
          groupe: form.groupe, langue: form.langue, niveau: form.niveau,
        });
      } else {
        await addDoc(collection(db, "users"), {
          nom:       form.nom,
          email:     form.email,
          tel:       form.tel || "",
          role:      "student",
          langue:    form.langue,
          niveau:    form.niveau,
          groupe:    form.groupe,
          prof:      form.prof,
          createdAt: serverTimestamp(),
        });
      }
      await loadAll();
    } catch (err) {
      console.error("Erreur save:", err);
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
    setModal(null); setSelStu(null);
  };

  const handleDeleteMany = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "users", id))));
      await loadAll();
      clearSelection();
    } catch (err) {
      console.error("Erreur delete:", err);
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const handleMoveMany = async (studentsToMove, dest, isNewGroup) => {
    try {
      if (isNewGroup) {
        await addDoc(collection(db, "groups"), {
          langue: selLang, niveau: selNiv, nom: dest,
          prof: studentsToMove[0]?.prof || PROFS[0],
          createdAt: serverTimestamp(),
        });
      }
      await Promise.all(studentsToMove.map((s) =>
        updateDoc(doc(db, "users", s.id), { groupe: dest })
      ));
      await loadAll();
      clearSelection();
    } catch (err) {
      console.error("Erreur move:", err);
      alert("Erreur lors du déplacement : " + err.message);
    }
  };

  const handleCreateGroup = async ({ nom, prof }) => {
    try {
      await addDoc(collection(db, "groups"), {
        langue: selLang, niveau: selNiv, nom, prof, createdAt: serverTimestamp(),
      });
      await loadAll();
    } catch (err) {
      console.error("Erreur création groupe:", err);
      alert("Erreur : " + err.message);
    }
    setModal(null);
  };

  const handleDeleteGroup = async (group) => {
    try {
      if (group.id) await deleteDoc(doc(db, "groups", group.id));
      await loadAll();
    } catch (err) {
      console.error("Erreur suppression groupe:", err);
      alert("Erreur : " + err.message);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (error) return (
    <AdminLayout title="Étudiants & Groupes">
      <div className="a-empty">
        <div className="a-empty-icon">⚠️</div>
        <div className="a-empty-title">Erreur Firestore</div>
        <p className="a-empty-desc">{error}</p>
        <button className="btn btn--grad" style={{ marginTop:"1rem" }} onClick={loadAll}>Réessayer</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Étudiants & Groupes">
      <Breadcrumb langue={selLang} niveau={selNiv} groupe={selGrp} onReset={goReset} />

      {loading ? <Spinner /> : (
        <>
          {/* ══ STEP 1 — LANGUE ══ */}
          {step === "langue" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Choisir une langue</div>
                  <div className="admin-content-subtitle">{students.length} étudiants au total</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadAll}>🔄 Actualiser</button>
              </div>
              <div className="a-pick-grid">
                {langueStats.map((l) => (
                  <div key={l.code} className="a-pick-card" onClick={() => { setSelLang(l.code); setStep("niveau"); }}>
                    <div className="a-pick-card-icon">{l.emoji}</div>
                    <div className="a-pick-card-label">{l.nom}</div>
                    <div className="a-pick-card-count">
                      <span className="a-badge a-badge--navy">{l.count} étudiant{l.count > 1 ? "s" : ""}</span>
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
                  <div className="admin-content-subtitle">
                    {students.filter((s) => s.langue === selLang).length} étudiants
                  </div>
                </div>
              </div>
              {niveauxDisponibles.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">🎓</div>
                  <div className="a-empty-title">Aucun groupe pour cette langue</div>
                  <p className="a-empty-desc">Choisissez un niveau puis créez votre premier groupe.</p>
                  <div className="a-niveau-grid" style={{ marginTop:"1.5rem" }}>
                    {NIVEAUX.map((n) => (
                      <div key={n} className="a-niveau-card" onClick={() => { setSelNiv(n); setStep("groupe"); }}>
                        <div className="a-niveau-card-code">{n}</div>
                        <span className="a-badge a-badge--navy">0 étudiant</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="a-niveau-grid">
                  {NIVEAUX.map((n) => {
                    const count = students.filter((s) => s.langue === selLang && s.niveau === n).length;
                    return (
                      <div key={n} className="a-niveau-card" onClick={() => { setSelNiv(n); setStep("groupe"); }}>
                        <div className="a-niveau-card-code">{n}</div>
                        <span className={`a-badge ${NIVEAU_COLOR[n]}`}>{count} étudiant{count > 1 ? "s" : ""}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ══ STEP 3 — GROUPE ══ */}
          {step === "groupe" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Niveau {selNiv} — Groupes</div>
                  <div className="admin-content-subtitle">{Object.keys(groupesForNiveau).length} groupe{Object.keys(groupesForNiveau).length > 1 ? "s" : ""}</div>
                </div>
                <button className="btn btn--grad" onClick={() => setModal("createGroup")}>➕ Créer un groupe</button>
              </div>
              {Object.keys(groupesForNiveau).length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">👥</div>
                  <div className="a-empty-title">Aucun groupe</div>
                  <p className="a-empty-desc">Ce niveau n'a pas encore de groupes. Créez-en un pour commencer à ajouter des étudiants.</p>
                  <button className="btn btn--grad" style={{ marginTop:"1rem" }} onClick={() => setModal("createGroup")}>➕ Créer un groupe</button>
                </div>
              ) : (
                <div className="a-groupe-grid">
                  {Object.values(groupesForNiveau).map((g) => (
                    <div key={g.nom} className="a-groupe-card" onClick={() => { setSelGrp(g.nom); setStep("list"); setSearch(""); clearSelection(); }}>
                      {g.students.length === 0 && g.id && (
                        <button
                          className="a-groupe-card-del" title="Supprimer ce groupe vide"
                          onClick={(e) => { e.stopPropagation(); setSelGroupObj(g); setModal("deleteGroup"); }}
                        >
                          🗑️
                        </button>
                      )}
                      <div>
                        <div className="a-groupe-card-name">
                          {g.nom}
                          {g.students.length === 0 && (
                            <span className="a-badge a-badge--navy" style={{ marginLeft:".5rem" }}>vide</span>
                          )}
                        </div>
                        <div className="a-groupe-card-meta">
                          {g.students.length} étudiant{g.students.length > 1 ? "s" : ""}{g.prof ? ` · ${g.prof}` : ""}
                        </div>
                      </div>
                      <span className="a-groupe-card-arrow">›</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ══ STEP 4 — LISTE ÉTUDIANTS ══ */}
          {step === "list" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Groupe {selGrp}</div>
                  <div className="admin-content-subtitle">
                    {groupInfo?.prof ? `Professeur : ${groupInfo.prof} · ` : ""}
                    {groupeStudentsAll.length} étudiant{groupeStudentsAll.length > 1 ? "s" : ""}
                  </div>
                </div>
                <button className="btn btn--grad" onClick={() => { setSelStu(null); setModal("add"); }}>
                  ➕ Ajouter un étudiant
                </button>
              </div>

              <div className="a-toolbar">
                <div className="a-search-wrap">
                  <span className="a-search-icon">🔍</span>
                  <input className="a-search" placeholder="Rechercher dans ce groupe…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <span style={{ fontSize:".82rem", color:"var(--ink-soft)", whiteSpace:"nowrap" }}>
                  {groupeStudents.length} résultat{groupeStudents.length > 1 ? "s" : ""}
                </span>
              </div>

              {selectedIds.size > 0 && (
                <div className="a-bulk-bar">
                  <span className="a-bulk-bar-count">{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
                  <div className="a-bulk-bar-actions">
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => { setActionStudents(students.filter((s) => selectedIds.has(s.id))); setModal("move"); }}
                    >
                      ↗️ Déplacer la sélection
                    </button>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => { setActionStudents(students.filter((s) => selectedIds.has(s.id))); setModal("delete"); }}
                    >
                      🗑️ Supprimer la sélection
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={clearSelection}>✕ Annuler</button>
                  </div>
                </div>
              )}

              {groupeStudents.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">👩‍🎓</div>
                  <div className="a-empty-title">Aucun étudiant dans ce groupe</div>
                  <p className="a-empty-desc">Cliquez sur "Ajouter un étudiant" pour commencer.</p>
                </div>
              ) : (
                <div className="a-table-wrap">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th style={{ width:36, textAlign:"center" }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.size > 0 && selectedIds.size === groupeStudents.length}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th>Étudiant</th><th>Téléphone</th><th>Niveau</th><th>Professeur</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupeStudents.map((s) => (
                        <tr key={s.id} className={selectedIds.has(s.id) ? "a-table-row--selected" : ""}>
                          <td style={{ textAlign:"center" }}>
                            <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} />
                          </td>
                          <td>
                            <div className="a-user-cell">
                              <div className="a-table-avatar" style={{ background:"var(--grad-orange)" }}>
                                {(s.nom || s.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="a-table-name">{s.nom || "—"}</div>
                                <div className="a-table-sub">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize:".85rem" }}>{s.tel || "—"}</td>
                          <td><span className={`a-badge ${NIVEAU_COLOR[s.niveau] || "a-badge--navy"}`}>{s.niveau || "—"}</span></td>
                          <td style={{ fontSize:".85rem", color:"var(--ink-soft)" }}>{s.prof || "—"}</td>
                          <td>
                            <div className="a-table-actions">
                              <button className="btn btn--ghost btn--sm" title="Modifier"
                                onClick={() => { setSelStu(s); setModal("edit"); }}>✏️</button>
                              <button className="btn btn--outline btn--sm" title="Déplacer"
                                onClick={() => { setActionStudents([s]); setModal("move"); }}>↗️</button>
                              <button className="btn btn--danger btn--sm" title="Supprimer"
                                onClick={() => { setActionStudents([s]); setModal("delete"); }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MODALS */}
      {(modal === "add" || modal === "edit") && (
        <StudentModal
          student={modal === "edit" ? selStu : null}
          langue={selLang} niveau={selNiv} groupe={selGrp}
          allStudents={students}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelStu(null); }}
        />
      )}

      {modal === "createGroup" && (
        <GroupModal
          langue={selLang} niveau={selNiv}
          existingNames={Object.keys(groupesForNiveau)}
          onSave={handleCreateGroup}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "move" && actionStudents.length > 0 && (
        <MoveModal
          students={actionStudents} currentGroupe={selGrp}
          langue={selLang} niveau={selNiv}
          existingGroupNames={Object.keys(groupesForNiveau)}
          onMove={handleMoveMany}
          onClose={() => { setModal(null); setActionStudents([]); }}
        />
      )}

      {modal === "delete" && actionStudents.length > 0 && (
        <ConfirmDialog
          title={actionStudents.length > 1 ? "Supprimer ces étudiants" : "Supprimer l'étudiant"}
          message={
            <>
              Supprimer {actionStudents.length > 1
                ? <>les <strong>{actionStudents.length}</strong> étudiants sélectionnés</>
                : <><strong>{actionStudents[0]?.nom}</strong></>
              } de ce groupe ?<br/>
              <span style={{ fontSize:".82rem" }}>Cette action supprime uniquement le(s) profil(s) Firestore, pas le(s) compte(s) Firebase Auth.</span>
            </>
          }
          confirmLabel="Supprimer"
          onConfirm={() => handleDeleteMany(actionStudents.map((s) => s.id))}
          onClose={() => { setModal(null); setActionStudents([]); }}
        />
      )}

      {modal === "deleteGroup" && selGroupObj && (
        <ConfirmDialog
          title="Supprimer le groupe"
          message={<>Supprimer le groupe <strong>{selGroupObj.nom}</strong> ? Ce groupe ne contient aucun étudiant.</>}
          confirmLabel="Supprimer le groupe"
          onConfirm={() => handleDeleteGroup(selGroupObj)}
          onClose={() => { setModal(null); setSelGroupObj(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Students;
