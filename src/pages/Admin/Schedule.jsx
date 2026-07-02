// src/pages/admin/Schedule.jsx
// Navigation : Langue → Niveau → Groupe → Planning du groupe
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
const PROFS  = ["Yacine Belkacem", "Amina Meziane", "Sofiane Khelifi"];
const DUREES = [30, 45, 60, 90, 120];

// ─── MOCK DATA (remplacer par Firestore) ──────────────────────────────────────
// Chaque séance est rattachée à : langue, niveau, groupe
const INITIAL_SESSIONS = [
  { id:"S1", langue:"EN", niveau:"B1", groupe:"EN-B1-G1", date:"2026-07-02", heure:"18:00", duree:90, prof:"Yacine Belkacem", salle:"",        zoom:"https://zoom.us/j/123456", note:"Révision IELTS Writing Task 2" },
  { id:"S2", langue:"FR", niveau:"A2", groupe:"FR-A2-G1", date:"2026-07-03", heure:"10:00", duree:60, prof:"Amina Meziane",   salle:"Salle 1", zoom:"",                          note:"" },
  { id:"S3", langue:"EN", niveau:"A1", groupe:"EN-A1-G2", date:"2026-07-03", heure:"16:00", duree:60, prof:"Yacine Belkacem", salle:"",        zoom:"https://zoom.us/j/789012", note:"Present Simple — exercices" },
  { id:"S4", langue:"TR", niveau:"A1", groupe:"TR-A1-G1", date:"2026-07-04", heure:"14:00", duree:60, prof:"Sofiane Khelifi", salle:"Salle 2", zoom:"",                          note:"" },
  { id:"S5", langue:"ES", niveau:"B1", groupe:"ES-B1-G1", date:"2026-07-05", heure:"17:00", duree:90, prof:"Yacine Belkacem", salle:"",        zoom:"https://zoom.us/j/345678", note:"Subjuntivo" },
  { id:"S6", langue:"FR", niveau:"B1", groupe:"FR-B1-G1", date:"2026-07-06", heure:"09:00", duree:60, prof:"Amina Meziane",   salle:"Salle 1", zoom:"",                          note:"TCF expression orale" },
  { id:"S7", langue:"EN", niveau:"B1", groupe:"EN-B1-G1", date:"2026-07-09", heure:"18:00", duree:90, prof:"Yacine Belkacem", salle:"",        zoom:"https://zoom.us/j/123456", note:"Speaking Practice" },
];

const EMPTY_FORM = { date:"", heure:"18:00", duree:60, prof:PROFS[0], salle:"", zoom:"", note:"" };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-DZ", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
};
const formatDateShort = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-DZ", { day:"2-digit", month:"2-digit", year:"numeric" });
};

function getGroupes(sessions, langue, niveau) {
  const grps = {};
  sessions
    .filter((s) => s.langue === langue && s.niveau === niveau)
    .forEach((s) => {
      if (!grps[s.groupe]) grps[s.groupe] = [];
      grps[s.groupe].push(s);
    });
  return grps;
}

const groupByDate = (sessions) => {
  const map = {};
  [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.heure.localeCompare(b.heure))
    .forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
  return map;
};

// ─── MODAL SÉANCE ─────────────────────────────────────────────────────────────
const SessionModal = ({ session, groupe, onSave, onClose }) => {
  const [form, setForm] = useState(session || { ...EMPTY_FORM, groupe });

  const ch = (e) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.heure) return;
    onSave(form);
  };

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal-header">
          <span className="a-modal-title">
            {session ? "✏️ Modifier la séance" : `➕ Nouvelle séance — ${groupe}`}
          </span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <form className="a-form" onSubmit={handleSubmit}>

            <div className="a-form-row">
              <label className="a-label">Date *
                <input className="a-input" type="date" name="date" value={form.date} onChange={ch} required />
              </label>
              <label className="a-label">Heure *
                <input className="a-input" type="time" name="heure" value={form.heure} onChange={ch} required />
              </label>
            </div>

            <div className="a-form-row">
              <label className="a-label">Durée (minutes)
                <select className="a-input" name="duree" value={form.duree} onChange={ch}>
                  {DUREES.map((d) => <option key={d} value={d}>{d} min</option>)}
                </select>
              </label>
              <label className="a-label">Professeur
                <select className="a-input" name="prof" value={form.prof} onChange={ch}>
                  {PROFS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>

            <div className="a-form-row">
              <label className="a-label">Salle (présentiel)
                <input className="a-input" name="salle" value={form.salle} onChange={ch}
                  placeholder="ex. Salle 1 — laisser vide si Zoom" />
              </label>
              <label className="a-label">Lien Zoom (en ligne)
                <input className="a-input" type="url" name="zoom" value={form.zoom} onChange={ch}
                  placeholder="https://zoom.us/j/…" />
              </label>
            </div>

            <label className="a-label">Note / sujet du cours
              <input className="a-input" name="note" value={form.note} onChange={ch}
                placeholder="ex. Révision IELTS Writing Task 2" />
            </label>

            <div className="a-info-banner">
              <span className="a-info-banner-icon">💡</span>
              <div>Si une salle ET un lien Zoom sont remplis, le lien Zoom est prioritaire pour les étudiants.</div>
            </div>

            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--grad">{session ? "Enregistrer" : "Ajouter la séance"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ session, onConfirm, onClose }) => (
  <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="a-modal">
      <div className="a-modal-header">
        <span className="a-modal-title">Supprimer la séance</span>
        <button className="a-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="a-confirm-body">
        <div className="a-confirm-icon">🗑️</div>
        <p className="a-confirm-msg">
          Supprimer la séance du <strong>{formatDateShort(session.date)}</strong> à <strong>{session.heure}</strong> ?
        </p>
        <div className="a-confirm-actions">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn--danger" onClick={() => { onConfirm(); onClose(); }}>Supprimer</button>
        </div>
      </div>
    </div>
  </div>
);

// ─── SESSION CARD ─────────────────────────────────────────────────────────────
const SessionCard = ({ s, onEdit, onDelete }) => (
  <div className="sch-slot">
    <div className="sch-slot-left">
      <div className="sch-slot-date-block" style={{ background:"var(--navy)", color:"#fff", borderRadius:10, padding:".5rem .75rem" }}>
        <div className="sch-slot-day" style={{ color:"rgba(255,255,255,.7)" }}>{formatDateShort(s.date).slice(0,5)}</div>
        <div className="sch-slot-num" style={{ color:"#fff", fontSize:"1.1rem" }}>{s.heure}</div>
      </div>
      <div>
        <div className="sch-slot-group">{s.note || s.groupe}</div>
        <div className="sch-slot-meta">{s.duree} min · {s.prof}</div>
        <div style={{ marginTop:".4rem" }}>
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
      <button className="btn btn--ghost btn--sm" title="Modifier" onClick={() => onEdit(s)}>✏️</button>
      <button className="btn btn--danger btn--sm" title="Supprimer" onClick={() => onDelete(s)}>🗑️</button>
    </div>
  </div>
);

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ langue, niveau, groupe, onReset }) => (
  <div className="a-breadcrumb">
    <button className="a-breadcrumb-item" onClick={() => onReset("langue")}>Langues</button>
    {langue && (<>
      <span className="a-breadcrumb-sep">›</span>
      <button className="a-breadcrumb-item" onClick={() => onReset("niveau")}>{langue}</button>
    </>)}
    {niveau && (<>
      <span className="a-breadcrumb-sep">›</span>
      <button className="a-breadcrumb-item" onClick={() => onReset("groupe")}>{niveau}</button>
    </>)}
    {groupe && (<>
      <span className="a-breadcrumb-sep">›</span>
      <span className="a-breadcrumb-item a-breadcrumb-item--active">{groupe}</span>
    </>)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════
const Schedule = () => {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [step,     setStep]     = useState("langue");   // langue | niveau | groupe | list
  const [selLang,  setSelLang]  = useState(null);
  const [selNiv,   setSelNiv]   = useState(null);
  const [selGrp,   setSelGrp]   = useState(null);
  const [modal,    setModal]    = useState(null);
  const [selSess,  setSelSess]  = useState(null);

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

  const groupeSessions = selGrp ? sessions.filter((s) => s.groupe === selGrp) : [];
  const byDate = groupByDate(groupeSessions);

  // ── CRUD ──
  const handleSave = (form) => {
    if (selSess) {
      setSessions((p) => p.map((s) => s.id === selSess.id ? { ...s, ...form } : s));
    } else {
      setSessions((p) => [...p, { ...form, id:`S${Date.now()}`, langue:selLang, niveau:selNiv, groupe:selGrp }]);
    }
    setModal(null); setSelSess(null);
  };

  const handleDelete = (id) => setSessions((p) => p.filter((s) => s.id !== id));

  return (
    <AdminLayout title="Planning">

      <Breadcrumb langue={selLang} niveau={selNiv} groupe={selGrp} onReset={goReset} />

      {/* ════════════════════════════════════════
          STEP 1 — CHOISIR UNE LANGUE
      ════════════════════════════════════════ */}
      {step === "langue" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Choisir une langue</div>
              <div className="admin-content-subtitle">{sessions.length} séances programmées au total</div>
            </div>
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
              <div className="a-empty-icon">📅</div>
              <div className="a-empty-title">Aucune séance pour cette langue</div>
              <p className="a-empty-desc">Créez d'abord un groupe avec une séance pour ce niveau.</p>
            </div>
          ) : (
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
          )}
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 3 — CHOISIR UN GROUPE
      ════════════════════════════════════════ */}
      {step === "groupe" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Niveau {selNiv} — Groupes</div>
              <div className="admin-content-subtitle">
                {Object.keys(groupesMap).length} groupe{Object.keys(groupesMap).length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {Object.keys(groupesMap).length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">👥</div>
              <div className="a-empty-title">Aucun groupe</div>
              <p className="a-empty-desc">Ce niveau n'a pas encore de séances programmées.</p>
            </div>
          ) : (
            <div className="a-groupe-grid">
              {Object.entries(groupesMap).map(([grp, seances]) => {
                const next = [...seances].sort((a,b) => a.date.localeCompare(b.date))[0];
                return (
                  <div key={grp} className="a-groupe-card" onClick={() => { setSelGrp(grp); setStep("list"); }}>
                    <div>
                      <div className="a-groupe-card-name">{grp}</div>
                      <div className="a-groupe-card-meta">
                        {seances.length} séance{seances.length > 1 ? "s" : ""}
                        {next && ` · prochaine le ${formatDateShort(next.date)}`}
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

      {/* ════════════════════════════════════════
          STEP 4 — PLANNING DU GROUPE
      ════════════════════════════════════════ */}
      {step === "list" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Planning — {selGrp}</div>
              <div className="admin-content-subtitle">
                {groupeSessions.length} séance{groupeSessions.length > 1 ? "s" : ""} programmée{groupeSessions.length > 1 ? "s" : ""}
              </div>
            </div>
            <button className="btn btn--grad" onClick={() => { setSelSess(null); setModal("add"); }}>
              ➕ Ajouter une séance
            </button>
          </div>

          {groupeSessions.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">📅</div>
              <div className="a-empty-title">Aucune séance programmée</div>
              <p className="a-empty-desc">Cliquez sur "Ajouter une séance" pour planifier le premier cours de ce groupe.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              {Object.entries(byDate).map(([date, daySessions]) => (
                <div key={date}>
                  <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".75rem" }}>
                    <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:".9rem", color:"var(--orange)", textTransform:"capitalize" }}>
                      {formatDate(date)}
                    </div>
                    <div style={{ flex:1, height:1, background:"var(--border)" }} />
                  </div>
                  <div className="sch-list">
                    {daySessions.map((s) => (
                      <SessionCard
                        key={s.id} s={s}
                        onEdit={(s) => { setSelSess(s); setModal("edit"); }}
                        onDelete={(s) => { setSelSess(s); setModal("delete"); }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODALS ── */}
      {(modal === "add" || modal === "edit") && (
        <SessionModal
          session={modal === "edit" ? selSess : null}
          groupe={selGrp}
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
