import { useState } from "react";
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, X } from "lucide-react";
import { FACTORS } from "../data/colleges.js";
import { supabase } from "../lib/supabase.js";
import AdminCutoffs from "./AdminCutoffs.jsx";

const blankFactors = () =>
  Object.fromEntries(FACTORS.map((f) => [f.key, f.type === "text" ? "" : 0]));

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

  const startNew = () => { setMsg(""); setEditing({ ...EMPTY, factors: blankFactors() }); };
  const startEdit = (c) => { setMsg(""); setEditing(JSON.parse(JSON.stringify(c))); };

  const setField = (k, v) => setEditing((e) => ({ ...e, [k]: v }));
  const setFactor = (k, v) => setEditing((e) => ({ ...e, factors: { ...e.factors, [k]: v } }));

  async function save() {
    if (!editing.id.trim() || !editing.name.trim()) { setMsg("ID and name are required."); return; }
    setBusy(true); setMsg("");
    const { error } = await supabase.from("colleges").upsert(editing);
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
          <strong>Admin</strong>
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
          {colleges.map((c) => (
            <div key={c.id} className="admin-row">
              <span className="admin-row-rank">{c.factors?.ranking}</span>
              <span className="admin-row-name">{c.name}</span>
              <span className="admin-row-city">{c.city}</span>
              <button className="icon-btn" aria-label="Edit" onClick={() => startEdit(c)}><Pencil size={16} /></button>
              <button className="icon-btn danger" aria-label="Delete" onClick={() => remove(c)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-form">
          <button className="btn ghost" onClick={() => setEditing(null)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to list
          </button>

          <div className="admin-grid">
            <label>ID (unique, no spaces)<input value={editing.id} onChange={(e) => setField("id", e.target.value)} placeholder="iit-example" /></label>
            <label>Name<input value={editing.name} onChange={(e) => setField("name", e.target.value)} /></label>
            <label>City / location<input value={editing.city} onChange={(e) => setField("city", e.target.value)} /></label>
            <label>Type<input value={editing.type} onChange={(e) => setField("type", e.target.value)} /></label>
            <label>Accent colour<input value={editing.accent} onChange={(e) => setField("accent", e.target.value)} placeholder="#38bdf8" /></label>
            <label>Tagline<input value={editing.tagline} onChange={(e) => setField("tagline", e.target.value)} /></label>
            <label>Image URL (hero ~1100px)<input value={editing.image} onChange={(e) => setField("image", e.target.value)} /></label>
            <label>Thumb URL (~320px)<input value={editing.thumb} onChange={(e) => setField("thumb", e.target.value)} /></label>
          </div>

          <label className="admin-full">Specialities (one per line)
            <textarea rows={4} value={(editing.specialities || []).join("\n")}
              onChange={(e) => setField("specialities", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          </label>

          <h4 className="admin-sub">Factors</h4>
          <div className="admin-grid">
            {FACTORS.map((f) => (
              <label key={f.key}>
                {f.label}{f.unit ? ` (${f.unit})` : ""}{f.type === "stars" ? " (1–3)" : ""}
                <input
                  type={f.type === "text" ? "text" : "number"}
                  step="any"
                  value={editing.factors[f.key] ?? ""}
                  onChange={(e) => setFactor(f.key, f.type === "text" ? e.target.value : (e.target.value === "" ? "" : Number(e.target.value)))}
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
