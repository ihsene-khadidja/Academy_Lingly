// src/pages/admin/Schedule.jsx
// Navigation : Langue → Niveau → Groupe → Planning du groupe
// 100% connecté à Firestore
//
// Modèle : chaque groupe a un planning HEBDOMADAIRE (pas de date fixe) :
//   ex. "Dimanche de 8:00 à 10:30".
// Deux types de séances :
//   - "normale"      → récurrente chaque semaine (jour + heureDebut + heureFin)
//   - "remplacement" → ponctuelle, un jour précis (date + heureDebut + heureFin)
import React, { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
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
const PROFS = ["Yacine Belkacem","Amina Meziane","Sofiane Khelifi"];

// Semaine algérienne : commence dimanche (0 = dimanche … 6 = samedi, comme Date#getDay())
const JOURS = [
  { key:"dimanche",  label:"Dimanche",  court:"Dim" },
  { key:"lundi",     label:"Lundi",     court:"Lun" },
  { key:"mardi",     label:"Mardi",     court:"Mar" },
  { key:"mercredi",  label:"Mercredi",  court:"Mer" },
  { key:"jeudi",     label:"Jeudi",     court:"Jeu" },
  { key:"vendredi",  label:"Vendredi",  court:"Ven" },
  { key:"samedi",    label:"Samedi",    court:"Sam" },
];
const JOUR_INDEX = Object.fromEntries(JOURS.map((j, i) => [j.key, i]));

const TYPES_SEANCE = [
  { type:"normale",      label:"Normale (hebdomadaire)", emoji:"📆" },
  { type:"remplacement", label:"Remplacement (ponctuelle)", emoji:"🔁" },
];

const Spinner = () => (
  <div style={{ textAlign:"center", padding:"3rem", color:"var(--ink-soft)" }}>⏳ Chargement…</div>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDateLong = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("fr-DZ", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

const formatDateShort = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("fr-DZ", { day:"2-digit", month:"2-digit", year:"numeric" });

function getGroupes(sessions, langue, niveau) {
  const grps = {};
  sessions.filter((s) => s.langue === langue && s.niveau === niveau)
    .forEach((s) => {
      if (!grps[s.groupe]) grps[s.groupe] = [];
      grps[s.groupe].push(s);
    });
  return grps;
}

// Tri stable : séances normales par jour de semaine puis heure, remplacements par date puis heure
const sortNormales = (list) =>
  [...list].sort((a, b) =>
    (JOUR_INDEX[a.jour] ?? 9) - (JOUR_INDEX[b.jour] ?? 9) || (a.heureDebut || "").localeCompare(b.heureDebut || "")
  );
const sortRemplacements = (list) =>
  [...list].sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.heureDebut || "").localeCompare(b.heureDebut || ""));

// ─── MODAL SÉANCE ─────────────────────────────────────────────────────────────
const SessionModal = ({ session, groupe, defaultType, onSave, onClose }) => {
  const EMPTY = {
    type: defaultType || "normale",
    jour: "dimanche",
    date: "",
    heureDebut: "08:00",
    heureFin: "10:30",
    prof: PROFS[0],
    salle: "",
    zoom: "",
    note: "",
  };
  const [form,   setForm]   = useState(session ? { ...EMPTY, ...session } : EMPTY);
  const [err,    setErr]    = useState("");
  const [saving, setSaving] = useState(false);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.heureDebut || !form.heureFin) return;
    if (form.heureFin <= form.heureDebut) {
      setErr("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (form.type === "normale" && !form.jour) return;
    if (form.type === "remplacement" && !form.date) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal-header">
          <span className="a-modal-title">{session ? "✏️ Modifier la séance" : `➕ Nouvelle séance — ${groupe}`}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={handleSubmit}>
            {/* Type de séance */}
            <div className="a-label">
              Type de séance
              <div className="a-file-types" style={{ marginTop:".4rem" }}>
                {TYPES_SEANCE.map((t) => (
                  <button key={t.type} type="button"
                    className={`a-file-type-btn ${form.type === t.type ? "a-file-type-btn--active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, type: t.type }))}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {form.type === "normale" ? (
              <label className="a-label">Jour de la semaine *
                <select className="a-input" name="jour" value={form.jour} onChange={ch}>
                  {JOURS.map((j) => <option key={j.key} value={j.key}>{j.label}</option>)}
                </select>
              </label>
            ) : (
              <label className="a-label">Date *
                <input className="a-input" type="date" name="date" value={form.date} onChange={ch} required />
              </label>
            )}

            <div className="a-form-row">
              <label className="a-label">Heure de début *
                <input className="a-input" type="time" name="heureDebut" value={form.heureDebut} onChange={ch} required />
              </label>
              <label className="a-label">Heure de fin *
                <input className="a-input" type="time" name="heureFin" value={form.heureFin} onChange={ch} required />
              </label>
            </div>

            {err && <div className="a-warn-banner">⚠️ {err}</div>}

            <div className="a-form-row">
              <label className="a-label">Professeur
                <select className="a-input" name="prof" value={form.prof} onChange={ch}>
                  {PROFS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="a-label">Salle (présentiel)
                <input className="a-input" name="salle" value={form.salle} onChange={ch} placeholder="ex. Salle 1" />
              </label>
            </div>

            <label className="a-label">Lien Zoom
              <input className="a-input" type="url" name="zoom" value={form.zoom} onChange={ch} placeholder="https://zoom.us/j/…" />
            </label>

            <label className="a-label">Note / sujet du cours
              <input className="a-input" name="note" value={form.note} onChange={ch}
                placeholder={form.type === "remplacement" ? "ex. Rattrapage séance du 12/07" : "ex. Révision IELTS"} />
            </label>

            <div className="a-info-banner">
              <span className="a-info-banner-icon">💡</span>
              <div>
                {form.type === "normale"
                  ? "Cette séance se répète chaque semaine, le même jour à la même heure."
                  : "Cette séance de remplacement n'a lieu qu'une seule fois, à la date choisie."}
                {" "}Si Zoom ET Salle sont remplis, le lien Zoom est prioritaire pour les étudiants.
              </div>
            </div>

            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Annuler</button>
              <button type="submit" className="btn btn--grad" disabled={saving}>
                {saving ? "Enregistrement…" : session ? "Enregistrer" : "Ajouter la séance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ session, onConfirm, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const label = session.type === "normale"
    ? `${JOURS.find((j) => j.key === session.jour)?.label || session.jour} de ${session.heureDebut} à ${session.heureFin}`
    : `du ${formatDateShort(session.date)} de ${session.heureDebut} à ${session.heureFin}`;
  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">Supprimer la séance</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-confirm-body">
          <div className="a-confirm-icon">🗑️</div>
          <p className="a-confirm-msg">
            Supprimer la séance <strong>{label}</strong> ?<br />
            {session.type === "normale" && (
              <span style={{ fontSize:".82rem" }}>Cette séance ne se répétera plus les semaines suivantes.</span>
            )}
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

// ─── SESSION CARD ─────────────────────────────────────────────────────────────
const SessionCard = ({ s, onEdit, onDelete }) => {
  const isNormale = s.type === "normale";
  const jourInfo  = JOURS.find((j) => j.key === s.jour);
  return (
    <div className="sch-slot">
      <div className="sch-slot-left">
        <div style={{ background: isNormale ? "var(--navy)" : "var(--orange)", color:"#fff", borderRadius:10, padding:".5rem .75rem", textAlign:"center", minWidth:64, flexShrink:0 }}>
          <div style={{ fontSize:".65rem", fontFamily:"var(--font-display)", fontWeight:800, opacity:.8, letterSpacing:".06em", textTransform:"uppercase" }}>
            {isNormale ? jourInfo?.court : formatDateShort(s.date).slice(0,5)}
          </div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:".82rem" }}>{s.heureDebut}–{s.heureFin}</div>
        </div>
        <div>
          <div className="sch-slot-group">
            {s.note || (isNormale ? `${jourInfo?.label} · chaque semaine` : `Remplacement du ${formatDateShort(s.date)}`)}
          </div>
          <div className="sch-slot-meta">
            {isNormale
              ? <span className="a-badge a-badge--navy" style={{ marginRight:".4rem" }}>📆 Hebdomadaire</span>
              : <span className="a-badge a-badge--amber" style={{ marginRight:".4rem" }}>🔁 Remplacement</span>}
            {s.prof}
          </div>
          <div style={{ marginTop:".4rem", display:"flex", gap:".5rem" }}>
            {s.zoom
              ? <a href={s.zoom} target="_blank" rel="noopener noreferrer" className="a-badge a-badge--blue">📹 Zoom</a>
              : s.salle
              ? <span className="a-badge a-badge--green">🏫 {s.salle}</span>
              : <span className="a-badge a-badge--amber">📍 À définir</span>
            }
          </div>
        </div>
      </div>
      <div className="sch-slot-right">
        <button className="btn btn--ghost btn--sm" onClick={() => onEdit(s)}>✏️</button>
        <button className="btn btn--danger btn--sm" onClick={() => onDelete(s)}>🗑️</button>
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
const Schedule = () => {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [step,     setStep]     = useState("langue");
  const [selLang,  setSelLang]  = useState(null);
  const [selNiv,   setSelNiv]   = useState(null);
  const [selGrp,   setSelGrp]   = useState(null);
  const [modal,    setModal]    = useState(null); // add | edit | delete
  const [modalType,setModalType]= useState("normale");
  const [selSess,  setSelSess]  = useState(null);
  const [error,    setError]    = useState(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "sessions"));
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError("Erreur Firestore : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const goReset = (to) => {
    if (to === "langue") { setStep("langue"); setSelLang(null); setSelNiv(null); setSelGrp(null); }
    if (to === "niveau") { setStep("niveau"); setSelNiv(null); setSelGrp(null); }
    if (to === "groupe") { setStep("groupe"); setSelGrp(null); }
  };

  // ── Calculs ──
  const langueStats = LANGUES_CONFIG.map((l) => ({
    ...l, count: sessions.filter((s) => s.langue === l.code).length,
  }));

  const niveauxDisponibles = selLang
    ? NIVEAUX.filter((n) => sessions.some((s) => s.langue === selLang && s.niveau === n))
    : [];

  const groupesMap = (selLang && selNiv) ? getGroupes(sessions, selLang, selNiv) : {};

  const groupeSessions      = selGrp ? sessions.filter((s) => s.groupe === selGrp) : [];
  const normaleSessions     = sortNormales(groupeSessions.filter((s) => s.type === "normale"));
  const remplacementSessions= sortRemplacements(groupeSessions.filter((s) => s.type === "remplacement"));

  // ── CRUD Firestore ────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    const base = {
      type:       form.type,
      jour:       form.type === "normale" ? form.jour : "",
      date:       form.type === "remplacement" ? form.date : "",
      heureDebut: form.heureDebut,
      heureFin:   form.heureFin,
      prof:       form.prof,
      salle:      form.salle || "",
      zoom:       form.zoom  || "",
      note:       form.note  || "",
    };
    try {
      if (selSess) {
        await updateDoc(doc(db, "sessions", selSess.id), { ...base, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "sessions"), {
          ...base,
          langue: selLang, niveau: selNiv, groupe: selGrp,
          createdAt: serverTimestamp(),
        });
      }
      await loadSessions();
    } catch (err) {
      console.error("Erreur save session:", err);
      alert("Erreur : " + err.message);
    }
    setModal(null); setSelSess(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "sessions", id));
      await loadSessions();
    } catch (err) {
      console.error("Erreur delete:", err);
      alert("Erreur : " + err.message);
    }
  };

  if (error) return (
    <AdminLayout title="Planning">
      <div className="a-empty">
        <div className="a-empty-icon">⚠️</div>
        <div className="a-empty-title">Erreur Firestore</div>
        <p className="a-empty-desc">{error}</p>
        <button className="btn btn--grad" style={{ marginTop:"1rem" }} onClick={loadSessions}>Réessayer</button>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Planning">
      <Breadcrumb langue={selLang} niveau={selNiv} groupe={selGrp} onReset={goReset} />

      {loading ? <Spinner /> : (
        <>
          {/* ══ STEP 1 — LANGUE ══ */}
          {step === "langue" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Choisir une langue</div>
                  <div className="admin-content-subtitle">{sessions.length} séances au total</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={loadSessions}>🔄 Actualiser</button>
              </div>
              <div className="a-pick-grid">
                {langueStats.map((l) => (
                  <div key={l.code} className="a-pick-card" onClick={() => { setSelLang(l.code); setStep("niveau"); }}>
                    <div className="a-pick-card-icon">{l.emoji}</div>
                    <div className="a-pick-card-label">{l.nom}</div>
                    <div className="a-pick-card-count">
                      <span className="a-badge a-badge--navy">{l.count} séance{l.count > 1 ? "s" : ""}</span>
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
              {niveauxDisponibles.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">📅</div>
                  <div className="a-empty-title">Aucune séance pour cette langue</div>
                  <p className="a-empty-desc">Choisissez un niveau pour ajouter des séances.</p>
                </div>
              ) : null}
              <div className="a-niveau-grid">
                {niveauxDisponibles.map((n) => {
                  const count = sessions.filter((s) => s.langue === selLang && s.niveau === n).length;
                  return (
                    <div key={n} className="a-niveau-card" onClick={() => { setSelNiv(n); setStep("groupe"); }}>
                      <div className="a-niveau-card-code">{n}</div>
                      <span className={`a-badge ${NIVEAU_COLOR[n]}`}>{count} séance{count > 1 ? "s" : ""}</span>
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
                  <div className="a-empty-title">Aucun groupe</div>
                  <p className="a-empty-desc">Ce niveau n'a pas encore de séances.</p>
                </div>
              ) : (
                <div className="a-groupe-grid">
                  {Object.entries(groupesMap).map(([grp, seances]) => {
                    const nbNormale = seances.filter((s) => s.type === "normale").length;
                    const nbRemp    = seances.filter((s) => s.type === "remplacement").length;
                    return (
                      <div key={grp} className="a-groupe-card" onClick={() => { setSelGrp(grp); setStep("list"); }}>
                        <div>
                          <div className="a-groupe-card-name">{grp}</div>
                          <div className="a-groupe-card-meta">
                            {nbNormale} séance{nbNormale > 1 ? "s" : ""} hebdo
                            {nbRemp > 0 && ` · ${nbRemp} remplacement${nbRemp > 1 ? "s" : ""}`}
                          </div>
                        </div>
                        <span className="a-groupe-card-arrow">›</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ══ STEP 4 — PLANNING DU GROUPE ══ */}
          {step === "list" && (
            <>
              <div className="admin-content-header">
                <div>
                  <div className="admin-content-title">Planning — {selGrp}</div>
                  <div className="admin-content-subtitle">
                    {normaleSessions.length} séance{normaleSessions.length > 1 ? "s" : ""} hebdo
                    {remplacementSessions.length > 0 && ` · ${remplacementSessions.length} remplacement${remplacementSessions.length > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div style={{ display:"flex", gap:".6rem" }}>
                  <button className="btn btn--outline btn--sm"
                    onClick={() => { setSelSess(null); setModalType("remplacement"); setModal("add"); }}>
                    🔁 Remplacement
                  </button>
                  <button className="btn btn--grad"
                    onClick={() => { setSelSess(null); setModalType("normale"); setModal("add"); }}>
                    ➕ Séance normale
                  </button>
                </div>
              </div>

              {groupeSessions.length === 0 ? (
                <div className="a-empty">
                  <div className="a-empty-icon">📅</div>
                  <div className="a-empty-title">Aucune séance programmée</div>
                  <p className="a-empty-desc">Ajoutez le planning hebdomadaire de ce groupe (ex. Dimanche 8:00–10:30).</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"1.75rem" }}>
                  {/* Séances normales (hebdomadaires) */}
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".75rem" }}>
                      <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:".9rem", color:"var(--navy)" }}>
                        📆 Planning hebdomadaire
                      </div>
                      <div style={{ flex:1, height:1, background:"var(--border)" }} />
                    </div>
                    {normaleSessions.length === 0 ? (
                      <div className="a-empty" style={{ padding:"1.5rem" }}>
                        <div className="a-empty-icon">📆</div>
                        <div className="a-empty-title">Aucune séance hebdomadaire</div>
                      </div>
                    ) : (
                      <div className="sch-list">
                        {normaleSessions.map((s) => (
                          <SessionCard key={s.id} s={s}
                            onEdit={(s) => { setSelSess(s); setModalType(s.type); setModal("edit"); }}
                            onDelete={(s) => { setSelSess(s); setModal("delete"); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Séances de remplacement */}
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".75rem" }}>
                      <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:".9rem", color:"var(--orange)" }}>
                        🔁 Séances de remplacement
                      </div>
                      <div style={{ flex:1, height:1, background:"var(--border)" }} />
                      {remplacementSessions.length > 0 && (
                        <span className="a-badge a-badge--amber">{remplacementSessions.length}</span>
                      )}
                    </div>
                    {remplacementSessions.length === 0 ? (
                      <div className="a-empty" style={{ padding:"1.5rem" }}>
                        <div className="a-empty-icon">🔁</div>
                        <div className="a-empty-title">Aucune séance de remplacement</div>
                        <p className="a-empty-desc">Ajoutez-en une pour rattraper une séance manquée.</p>
                      </div>
                    ) : (
                      <div className="sch-list">
                        {remplacementSessions.map((s) => (
                          <SessionCard key={s.id} s={s}
                            onEdit={(s) => { setSelSess(s); setModalType(s.type); setModal("edit"); }}
                            onDelete={(s) => { setSelSess(s); setModal("delete"); }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MODALS */}
      {(modal === "add" || modal === "edit") && (
        <SessionModal
          session={modal === "edit" ? selSess : null}
          groupe={selGrp}
          defaultType={modalType}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelSess(null); }}
        />
      )}
      {modal === "delete" && selSess && (
        <ConfirmDelete
          session={selSess}
          onConfirm={() => handleDelete(selSess.id)}
          onClose={() => { setModal(null); setSelSess(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Schedule;
