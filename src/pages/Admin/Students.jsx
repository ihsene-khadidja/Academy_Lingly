// src/pages/admin/Students.jsx
// Navigation : Langue → Niveau → Groupe → Liste étudiants
import React, { useState } from "react";
import AdminLayout from "./AdminLayout";

// ─── DONNÉES MOCK (remplacer par Firestore) ────────────────────────────────────
const LANGUES_CONFIG = [
  { code: "EN", nom: "Anglais",   emoji: "🇬🇧", color: "#4A6CF7", bg: "#EEF2FF" },
  { code: "FR", nom: "Français",  emoji: "🇫🇷", color: "#E85D04", bg: "#FBE6C7" },
  { code: "AR", nom: "Arabe",     emoji: "🇩🇿", color: "#34C88A", bg: "#D1FAE5" },
  { code: "TR", nom: "Turc",      emoji: "🇹🇷", color: "#D4537E", bg: "#FCE7F3" },
  { code: "ES", nom: "Espagnol",  emoji: "🇪🇸", color: "#F5A623", bg: "#FEF9C3" },
  { code: "DE", nom: "Allemand",  emoji: "🇩🇪", color: "#1A1A2E", bg: "#e8eaf2" },
];

const NIVEAUX = ["A1","A2","B1","B2","C1","C2"];

// Données étudiants : clé = "LANGUE-NIVEAU-GX"
const ALL_STUDENTS = [
  { id:"s1",  nom:"Yasmine Boudali",  email:"yasmine@gmail.com",  tel:"0770123456", groupe:"EN-B1-G1", langue:"EN", niveau:"B1", prof:"Yacine Belkacem"  },
  { id:"s2",  nom:"Mehdi Tebboune",   email:"mehdi@gmail.com",    tel:"0660987654", groupe:"FR-A2-G1", langue:"FR", niveau:"A2", prof:"Amina Meziane"    },
  { id:"s3",  nom:"Sara Kebbas",      email:"sara@gmail.com",     tel:"0551234567", groupe:"EN-A1-G2", langue:"EN", niveau:"A1", prof:"Yacine Belkacem"  },
  { id:"s4",  nom:"Amine Hadjoudj",   email:"amine@gmail.com",    tel:"0770000001", groupe:"TR-A1-G1", langue:"TR", niveau:"A1", prof:"Sofiane Khelifi"  },
  { id:"s5",  nom:"Lina Meziani",     email:"lina@gmail.com",     tel:"0561112233", groupe:"ES-B1-G1", langue:"ES", niveau:"B1", prof:"Yacine Belkacem"  },
  { id:"s6",  nom:"Karim Rezgui",     email:"karim@gmail.com",    tel:"0779988776", groupe:"EN-B1-G1", langue:"EN", niveau:"B1", prof:"Yacine Belkacem"  },
  { id:"s7",  nom:"Nadia Ferhat",     email:"nadia@gmail.com",    tel:"0660112233", groupe:"FR-B1-G1", langue:"FR", niveau:"B1", prof:"Amina Meziane"    },
  { id:"s8",  nom:"Omar Belhadj",     email:"omar@gmail.com",     tel:"0770445566", groupe:"EN-A1-G1", langue:"EN", niveau:"A1", prof:"Yacine Belkacem"  },
  { id:"s9",  nom:"Hana Djaout",      email:"hana@gmail.com",     tel:"0550998877", groupe:"EN-A2-G1", langue:"EN", niveau:"A2", prof:"Yacine Belkacem"  },
  { id:"s10", nom:"Riad Mansouri",    email:"riad@gmail.com",     tel:"0661223344", groupe:"FR-A1-G1", langue:"FR", niveau:"A1", prof:"Amina Meziane"    },
];

const PROFS = ["Yacine Belkacem","Amina Meziane","Sofiane Khelifi"];

const NIVEAU_COLOR = { A1:"a-badge--green", A2:"a-badge--green", B1:"a-badge--blue", B2:"a-badge--blue", C1:"a-badge--pink", C2:"a-badge--pink" };

const EMPTY_FORM = { nom:"", email:"", tel:"", niveau:"A1", langue:"EN", groupe:"", prof:PROFS[0] };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getGroupes(students, langue, niveau) {
  const grps = {};
  students
    .filter((s) => s.langue === langue && s.niveau === niveau)
    .forEach((s) => {
      if (!grps[s.groupe]) grps[s.groupe] = [];
      grps[s.groupe].push(s);
    });
  return grps;
}

// ─── MODAL ÉTUDIANT ───────────────────────────────────────────────────────────
const StudentModal = ({ student, langue, niveau, groupe, allStudents, onSave, onClose }) => {
  const [form, setForm] = useState(student || { ...EMPTY_FORM, langue, niveau, groupe });
  const [search, setSearch] = useState("");

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Mode "ajouter depuis liste existante" (si pas edition)
  const existing = !student
    ? allStudents.filter((s) =>
        s.groupe !== groupe &&
        (s.nom.toLowerCase().includes(search.toLowerCase()) ||
         s.email.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const addExisting = (s) => {
    onSave({ ...s, groupe, langue, niveau });
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
          {/* ── Créer nouveau ── */}
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem", marginBottom:"1rem", color:"var(--ink)" }}>
            {student ? "Modifier les informations" : "Créer un nouvel étudiant"}
          </div>
          <form className="a-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
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
                <input className="a-input" name="tel" value={form.tel} onChange={ch} placeholder="07xxxxxxxx" />
              </label>
              <label className="a-label">Professeur
                <select className="a-input" name="prof" value={form.prof} onChange={ch}>
                  {PROFS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>
            <div className="a-form-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--grad">{student ? "Enregistrer" : "Créer et ajouter"}</button>
            </div>
          </form>

          {/* ── Ajouter depuis la liste existante ── */}
          {!student && (
            <div style={{ marginTop:"1.75rem" }}>
              <div style={{ height:1, background:"var(--border)", margin:"0 0 1.25rem" }} />
              <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".9rem", marginBottom:".75rem", color:"var(--ink)" }}>
                Ou ajouter un étudiant déjà inscrit
              </div>
              <div style={{ position:"relative", marginBottom:".75rem" }}>
                <span className="a-search-icon">🔍</span>
                <input className="a-search" placeholder="Rechercher un étudiant inscrit…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {search.length > 0 && (
                <div style={{ maxHeight:220, overflowY:"auto", display:"flex", flexDirection:"column", gap:".5rem" }}>
                  {existing.length === 0 ? (
                    <div style={{ fontSize:".85rem", color:"var(--ink-soft)", textAlign:"center", padding:"1rem" }}>Aucun résultat</div>
                  ) : existing.map((s) => (
                    <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".65rem 1rem", border:"1px solid var(--border)", borderRadius:10, gap:"1rem" }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:".88rem" }}>{s.nom}</div>
                        <div style={{ fontSize:".75rem", color:"var(--ink-soft)" }}>{s.email} · actuellement dans {s.groupe}</div>
                      </div>
                      <button className="btn btn--outline btn--sm" onClick={() => addExisting(s)}>Déplacer ici</button>
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

// ─── MODAL DÉPLACER ───────────────────────────────────────────────────────────
const MoveModal = ({ student, currentGroupe, langue, niveau, allStudents, onMove, onClose }) => {
  const allGroupes = [...new Set(
    allStudents
      .filter((s) => s.langue === langue && s.niveau === niveau && s.groupe !== currentGroupe)
      .map((s) => s.groupe)
  )];
  const [target, setTarget] = useState(allGroupes[0] || "");
  const [newGroupe, setNewGroupe] = useState("");

  return (
    <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <div className="a-modal-header">
          <span className="a-modal-title">↗️ Déplacer {student.nom}</span>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="a-modal-body">
          <div className="a-form">
            <p style={{ fontSize:".9rem", color:"var(--ink-soft)" }}>
              Actuellement dans <strong style={{ color:"var(--ink)" }}>{currentGroupe}</strong>. Choisissez le groupe de destination :
            </p>
            {allGroupes.length > 0 && (
              <label className="a-label">Groupe existant
                <select className="a-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                  {allGroupes.map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
            )}
            <label className="a-label">Ou créer un nouveau groupe
              <input className="a-input" placeholder={`ex. ${langue}-${niveau}-G3`} value={newGroupe} onChange={(e) => setNewGroupe(e.target.value)} />
            </label>
            <div className="a-form-actions">
              <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button className="btn btn--grad" onClick={() => { onMove(student, newGroupe || target); onClose(); }}>
                Déplacer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ nom, onConfirm, onClose }) => (
  <div className="a-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="a-modal">
      <div className="a-modal-header">
        <span className="a-modal-title">Supprimer l'étudiant</span>
        <button className="a-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="a-confirm-body">
        <div className="a-confirm-icon">🗑️</div>
        <p className="a-confirm-msg">Supprimer <strong>{nom}</strong> de ce groupe ?</p>
        <div className="a-confirm-actions">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn--danger" onClick={() => { onConfirm(); onClose(); }}>Supprimer</button>
        </div>
      </div>
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
const Students = () => {
  const [students, setStudents] = useState(ALL_STUDENTS);
  const [step,     setStep]     = useState("langue");   // langue | niveau | groupe | list
  const [selLang,  setSelLang]  = useState(null);
  const [selNiv,   setSelNiv]   = useState(null);
  const [selGrp,   setSelGrp]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);       // null | "add" | "edit" | "delete" | "move"
  const [selStu,   setSelStu]   = useState(null);

  const goReset = (to) => {
    if (to === "langue") { setStep("langue"); setSelLang(null); setSelNiv(null); setSelGrp(null); }
    if (to === "niveau") { setStep("niveau"); setSelNiv(null); setSelGrp(null); }
    if (to === "groupe") { setStep("groupe"); setSelGrp(null); }
  };

  // ── Calculs ──
  const langueStats = LANGUES_CONFIG.map((l) => ({
    ...l,
    count: students.filter((s) => s.langue === l.code).length,
  }));

  const niveauxDisponibles = selLang
    ? NIVEAUX.filter((n) => students.some((s) => s.langue === selLang && s.niveau === n))
    : [];

  const groupesMap = (selLang && selNiv) ? getGroupes(students, selLang, selNiv) : {};

  const groupeStudents = selGrp
    ? students.filter((s) => s.groupe === selGrp)
        .filter((s) => s.nom.toLowerCase().includes(search.toLowerCase()) ||
                       s.email.toLowerCase().includes(search.toLowerCase()))
    : [];

  // ── CRUD ──
  const handleSave = (form) => {
    if (selStu) {
      setStudents((p) => p.map((s) => s.id === selStu.id ? { ...s, ...form } : s));
    } else {
      setStudents((p) => [{ ...form, id: `s${Date.now()}` }, ...p]);
    }
    setModal(null); setSelStu(null);
  };

  const handleDelete = (id) => setStudents((p) => p.filter((s) => s.id !== id));

  const handleMove = (student, newGroupe) => {
    setStudents((p) => p.map((s) => s.id === student.id ? { ...s, groupe: newGroupe } : s));
  };

  // ── RENDER ──
  const topbarTitle = step === "langue" ? "Étudiants — Choisir une langue"
    : step === "niveau" ? `Étudiants — ${selLang} · Choisir un niveau`
    : step === "groupe" ? `Étudiants — ${selLang} ${selNiv} · Groupes`
    : `${selGrp} · ${students.filter((s) => s.groupe === selGrp).length} étudiants`;

  return (
    <AdminLayout title="Étudiants">

      <Breadcrumb langue={selLang} niveau={selNiv} groupe={selGrp} onReset={goReset} />

      {/* ════════════════════════════════════════
          STEP 1 — CHOISIR UNE LANGUE
      ════════════════════════════════════════ */}
      {step === "langue" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Choisir une langue</div>
              <div className="admin-content-subtitle">{students.length} étudiants au total</div>
            </div>
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
              <div className="admin-content-subtitle">
                {students.filter((s) => s.langue === selLang).length} étudiants dans cette langue
              </div>
            </div>
          </div>
          {niveauxDisponibles.length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">🎓</div>
              <div className="a-empty-title">Aucun niveau pour cette langue</div>
              <p className="a-empty-desc">Ajoutez des étudiants pour cette langue d'abord.</p>
            </div>
          ) : (
            <div className="a-niveau-grid">
              {niveauxDisponibles.map((n) => {
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

      {/* ════════════════════════════════════════
          STEP 3 — CHOISIR UN GROUPE
      ════════════════════════════════════════ */}
      {step === "groupe" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Niveau {selNiv} — Groupes</div>
              <div className="admin-content-subtitle">
                {Object.keys(groupesMap).length} groupe{Object.keys(groupesMap).length > 1 ? "s" : ""} actif{Object.keys(groupesMap).length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {Object.keys(groupesMap).length === 0 ? (
            <div className="a-empty">
              <div className="a-empty-icon">👥</div>
              <div className="a-empty-title">Aucun groupe</div>
              <p className="a-empty-desc">Ce niveau n'a pas encore de groupes.</p>
            </div>
          ) : (
            <div className="a-groupe-grid">
              {Object.entries(groupesMap).map(([grp, membres]) => (
                <div key={grp} className="a-groupe-card" onClick={() => { setSelGrp(grp); setStep("list"); setSearch(""); }}>
                  <div>
                    <div className="a-groupe-card-name">{grp}</div>
                    <div className="a-groupe-card-meta">
                      {membres.length} étudiant{membres.length > 1 ? "s" : ""} · {membres[0]?.prof}
                    </div>
                  </div>
                  <span className="a-groupe-card-arrow">›</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════
          STEP 4 — LISTE DES ÉTUDIANTS DU GROUPE
      ════════════════════════════════════════ */}
      {step === "list" && (
        <>
          <div className="admin-content-header">
            <div>
              <div className="admin-content-title">Groupe {selGrp}</div>
              <div className="admin-content-subtitle">
                {students.filter((s) => s.groupe === selGrp).length} étudiant{students.filter((s) => s.groupe === selGrp).length > 1 ? "s" : ""}
              </div>
            </div>
            <button className="btn btn--grad" onClick={() => { setSelStu(null); setModal("add"); }}>
              ➕ Ajouter un étudiant
            </button>
          </div>

          {/* Search */}
          <div className="a-toolbar">
            <div className="a-search-wrap">
              <span className="a-search-icon">🔍</span>
              <input className="a-search" placeholder="Rechercher dans ce groupe…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span style={{ fontSize:".82rem", color:"var(--ink-soft)", whiteSpace:"nowrap" }}>
              {groupeStudents.length} résultat{groupeStudents.length > 1 ? "s" : ""}
            </span>
          </div>

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
                    <th>Étudiant</th>
                    <th>Téléphone</th>
                    <th>Niveau</th>
                    <th>Professeur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupeStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="a-user-cell">
                          <div className="a-table-avatar" style={{ background:"var(--grad-orange)" }}>
                            {s.nom.charAt(0)}
                          </div>
                          <div>
                            <div className="a-table-name">{s.nom}</div>
                            <div className="a-table-sub">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize:".85rem" }}>{s.tel || "—"}</td>
                      <td><span className={`a-badge ${NIVEAU_COLOR[s.niveau]}`}>{s.niveau}</span></td>
                      <td style={{ fontSize:".85rem", color:"var(--ink-soft)" }}>{s.prof}</td>
                      <td>
                        <div className="a-table-actions">
                          <button className="btn btn--ghost btn--sm" title="Modifier"
                            onClick={() => { setSelStu(s); setModal("edit"); }}>✏️</button>
                          <button className="btn btn--outline btn--sm" title="Déplacer"
                            onClick={() => { setSelStu(s); setModal("move"); }}>↗️</button>
                          <button className="btn btn--danger btn--sm" title="Retirer"
                            onClick={() => { setSelStu(s); setModal("delete"); }}>🗑️</button>
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

      {/* ── MODALS ── */}
      {(modal === "add" || modal === "edit") && (
        <StudentModal
          student={modal === "edit" ? selStu : null}
          langue={selLang} niveau={selNiv} groupe={selGrp}
          allStudents={students}
          onSave={handleSave}
          onClose={() => { setModal(null); setSelStu(null); }}
        />
      )}
      {modal === "move" && selStu && (
        <MoveModal
          student={selStu} currentGroupe={selGrp}
          langue={selLang} niveau={selNiv}
          allStudents={students}
          onMove={handleMove}
          onClose={() => { setModal(null); setSelStu(null); }}
        />
      )}
      {modal === "delete" && selStu && (
        <ConfirmDelete
          nom={selStu.nom}
          onConfirm={() => handleDelete(selStu.id)}
          onClose={() => { setModal(null); setSelStu(null); }}
        />
      )}
    </AdminLayout>
  );
};

export default Students;