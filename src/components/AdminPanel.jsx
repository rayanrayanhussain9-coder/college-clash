import { useState } from "react";
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, X } from "lucide-react";
import { FACTORS } from "../data/colleges.js";
import { supabase } from "../lib/supabase.js";
import AdminCutoffs from "./AdminCutoffs.jsx";

const blankFactors = () =>
  Object.fromEntries(FACTORS.map((f) => [f.key, f.type === "text" ? "" : null]));

const EMPTY = {
  id: "", name: "", city: "", type: "Engineering & Technology",
  accent: "#38bdf8", tagline: "", image: "", thumb: "",
  specialities: [], factors: blankFactors(),
};

export default function AdminPanel({ colleges, onClose, onChanged }) {
  const [tab, setTab] = useState("colleges"); // 'colleges' | 'cutoffs'
  const [editing, setEditing] = useState(null); // college being edited/created
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [specialityText, setSpecialityText] = useState("");
  const [originalId, setOriginalId] = useState(null);

  const startNew = () => { setMsg(""); setOriginalId(null); setSpecialityText(""); setEditing({ ...EMPTY, factors: blankFactors() }); };
  const startEdit = (c) => { setMsg(""); setOriginalId(c.id); setSpecialityText((c.specialities || []).join("\n")); setEditing(JSON.parse(JSON.stringify(c))); };

  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));
  const setFactor = (k, v) => setEditing((e) => ({ ...e, factors: { ...e.factors, [k]: v } }));

  async function save() {
    if (!editing.id.trim() || !editing.name.trim()) { setMsg("ID and name are required."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editing.id) || editing.id.includes("-vs-")) { setMsg("Use a lowercase ID with letters, numbers and hyphens, without -vs-."); return; }
    for (const factor of FACTORS) {
      const value = editing.factors[factor.key];
      if (factor.type !== "text" && value != null && (!Number.isFinite(value) || value < 0 || (factor.type === "stars" && (!Number.isInteger(value) || value < 1 || value > 3)) || (["placementRate", "research"].includes(factor.key) && value > 100))) { setMsg(`Check ${factor.label}: enter a valid value, or leave it blank.`); return; }
    }
    setBusy(true); setMsg("");
    const payload = Object.fromEntries(Object.keys(EMPTY).map((key) => [key, editing[key]]));
    payload.specialities = specialityText.split("\n").map((s) => s.trim()).filter(Boolean);
    let error;
    try {
      const result = originalId
        ? await supabase.from("colleges").update(payload).eq("id", originalId).select().single()
        : await supabase.from("colleges").insert(payload).select().single();
      error = result.error;
    } catch (failure) { error = failure; }
    setBusy(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setEditing(null);
    onChanged?.();
  }

  async function remove(c) {
    if (!window.confirm(`Delete "${c.name}" (${c.id})? This cannot be undone.`)) return;
    setBusy(true); setMsg("");
    const { error } = await supabase.from("colleges").delete().eq("id", c.id);
    setBusy(false);
    if (error) { setMsg("Error: " + error.message); return; }
    onChanged?.();
  }

  async function logout() { await supabase.auth.signOut(); onClose?.(); }

  return (
    <div className="admin-panel">
      <div className="admin-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <strong>CollegeClash / Studio</strong>
          <div className="admin-tabs">
            <button className={`cat-pill ${tab === "colleges" ? "active" : ""}`}
              onClick={() => { setTab("colleges"); setEditing(null); }}>Colleges</button>
            <button className={`cat-pill ${tab === "cutoffs" ? "active" : ""}`}
              onClick={() => { setTab("cutoffs"); setEditing(null); }}>Cutoffs</button>
          </div>
        </div>
        <div className="admin-bar-actions">
          {tab === "colleges" && !editing && (
            <button className="btn" onClick={startNew}><Plus size={16} /> Add college</button>
          )}
          <button className="btn ghost" onClick={logout}><LogOut size={16} /> Log out</button>
          <button className="icon-btn" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
      </div>

      {msg && <p className="admin-error" style={{ margin: "0 0 14px" }}>{msg}</p>}

      {tab === "cutoffs" ? (
        <AdminCutoffs colleges={colleges} />
      ) : !editing ? (
        <div className="admin-list">
          <div className="admin-overview"><h1>College directory</h1><p>{colleges.length} colleges · Manage profiles and comparison data</p><input aria-label="Search colleges" placeholder="Search by college or city…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {colleges.filter((c) => `${c.name} ${c.city}`.toLowerCase().includes(search.toLowerCase())).map((c) => (
            <div key={c.id} className="admin-row">
              <span className="admin-row-rank">{c.factors?.ranking}</span>
              <span className="admin-row-name">{c.name}</span>
              <span className="admin-row-city">{c.city}</span>
              <button className="icon-btn" aria-label="Edit" onClick={() => startEdit(c)}><Pencil size={16} /></button>
              <button className="icon-btn danger" disabled={busy} aria-label={`Delete ${c.name}`} onClick={() => remove(c)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-form">
          <button className="btn ghost" onClick={() => setEditing(null)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to list
          </button>

          <div className="admin-grid">
            <label>ID (permanent after creation)<input disabled={!!originalId} value={editing.id} onChange={(e) => setField("id", e.target.value)} placeholder="iit-example" /></label>
            <label>Name<input value={editing.name} onChange={(e) => setField("name", e.target.value)} /></label>
            <label>City / location<input value={editing.city} onChange={(e) => setField("city", e.target.value)} /></label>
            <label>Type<input value={editing.type} onChange={(e) => setField("type", e.target.value)} /></label>
            <label>Accent colour<input value={editing.accent} onChange={(e) => setField("accent", e.target.value)} placeholder="#38bdf8" /></label>
            <label>Tagline<input value={editing.tagline} onChange={(e) => setField("tagline", e.target.value)} /></label>
            <label>Image URL (hero ~1100px)<input value={editing.image} onChange={(e) => setField("image", e.target.value)} /></label>
            <label>Thumb URL (~320px)<input value={editing.thumb} onChange={(e) => setField("thumb", e.target.value)} /></label>
          </div>

          <label className="admin-full">Specialities (one per line)
            <textarea rows={4} value={specialityText}
              onChange={(e) => setSpecialityText(e.target.value)} />
          </label>

          <h4 className="admin-sub">Comparison factors</h4><p className="section-sub">Packages are in LPA; fees in lakhs. Leave unpublished numbers blank. Ratings use 1–3 stars.</p>
          <div className="admin-grid">
            {FACTORS.map((f) => (
              <label key={f.key}>
                {f.label}{f.unit ? ` (${f.unit})` : ""}{f.type === "stars" ? " (1–3)" : ""}
                <input
                  type={f.type === "text" ? "text" : "number"}
                  step="any"
                  value={editing.factors[f.key] ?? ""}
                  onChange={(e) => setFactor(f.key, f.type === "text" ? e.target.value : (e.target.value === "" ? null : Number(e.target.value)))}
                />
              </label>
            ))}
            <label>Fees range label (e.g. ₹8–10 L)
              <input value={editing.factors.feesRange ?? ""} onChange={(e) => setFactor("feesRange", e.target.value)} />
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save college"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
