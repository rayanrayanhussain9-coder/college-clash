import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "../lib/supabase.js";

const BRANCHES = ["CSE", "ECE", "EE", "ME", "CE", "CHE"];
const CATEGORIES = ["General", "EWS", "OBC-NCL", "SC", "ST"];
const QUOTAS = ["AI", "OS", "HS"];

const NEW_ROW = { branch: "CSE", category: "General", quota: "AI", round: "5", year: 2024, closing_rank: "", closing_score: "" };

export default function AdminCutoffs({ colleges }) {
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || "");
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(null); // new-row form
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const college = colleges.find((c) => c.id === collegeId);

  async function load() {
    if (!collegeId) return;
    const { data, error } = await supabase
      .from("cutoffs").select("*").eq("college_id", collegeId)
      .order("branch").order("category").order("round");
    setMsg(error ? "Error: " + error.message : "");
    setRows(data || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [collegeId]);

  const setCell = (id, field, value) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value, _dirty: true } : r)));

  async function saveRow(row) {
    setBusy(true); setMsg("");
    const payload = {
      closing_rank: row.closing_rank === "" || row.closing_rank == null ? null : Number(row.closing_rank),
      closing_score: row.closing_score === "" || row.closing_score == null ? null : Number(row.closing_score),
    };
    const { error } = await supabase.from("cutoffs").update(payload).eq("id", row.id);
    setBusy(false);
    if (error) { setMsg("Save failed: " + error.message); return; }
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, _dirty: false } : r)));
  }

  async function deleteRow(row) {
    if (!window.confirm(`Delete ${row.branch} · ${row.category} (${row.round})?`)) return;
    setBusy(true); setMsg("");
    const { error } = await supabase.from("cutoffs").delete().eq("id", row.id);
    setBusy(false);
    if (error) { setMsg("Delete failed: " + error.message); return; }
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  }

  async function addRow() {
    setBusy(true); setMsg("");
    const exam = college?.factors?.exam || "JEE Main";
    const payload = {
      college_id: collegeId, exam, gender: "GN",
      year: Number(draft.year) || 2024, round: String(draft.round || "5"),
      branch: draft.branch, category: draft.category, quota: draft.quota,
      closing_rank: draft.closing_rank === "" ? null : Number(draft.closing_rank),
      closing_score: draft.closing_score === "" ? null : Number(draft.closing_score),
    };
    const { error } = await supabase.from("cutoffs")
      .upsert(payload, { onConflict: "college_id,exam,year,round,branch,category,quota,gender" });
    setBusy(false);
    if (error) { setMsg("Add failed: " + error.message); return; }
    setDraft(null);
    load();
  }

  return (
    <div className="admin-form">
      <div className="admin-cutoff-head">
        <label style={{ flex: 1 }}>College
          <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
            {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button className="btn" onClick={() => setDraft({ ...NEW_ROW, quota: college?.factors?.exam === "JEE Main" ? "OS" : "AI" })}>
          <Plus size={16} /> Add cutoff
        </button>
      </div>

      {msg && <p className="admin-error">{msg}</p>}

      {draft && (
        <div className="admin-cutoff-new">
          <select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={draft.quota} onChange={(e) => setDraft({ ...draft, quota: e.target.value })}>
            {QUOTAS.map((q) => <option key={q}>{q}</option>)}
          </select>
          <input type="number" placeholder="Year" value={draft.year} style={{ width: 80 }}
            onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
          <input placeholder="Round" value={draft.round} style={{ width: 70 }}
            onChange={(e) => setDraft({ ...draft, round: e.target.value })} />
          <input type="number" placeholder="Closing rank" value={draft.closing_rank}
            onChange={(e) => setDraft({ ...draft, closing_rank: e.target.value })} />
          <input type="number" placeholder="Score (opt.)" value={draft.closing_score} style={{ width: 100 }}
            onChange={(e) => setDraft({ ...draft, closing_score: e.target.value })} />
          <button className="btn primary" disabled={busy} onClick={addRow}>Add</button>
          <button className="btn ghost" onClick={() => setDraft(null)}>Cancel</button>
        </div>
      )}

      <div className="admin-list">
        {rows.map((r) => (
          <div key={r.id} className="admin-row admin-cutoff-row">
            <span className="admin-row-rank">{r.round}</span>
            <span className="admin-row-name">{r.branch} · {r.category}</span>
            <span className="admin-row-city">{r.exam} · {r.quota} · {r.year}</span>
            <input type="number" value={r.closing_rank ?? ""} placeholder="rank"
              onChange={(e) => setCell(r.id, "closing_rank", e.target.value)} />
            <input type="number" value={r.closing_score ?? ""} placeholder="score"
              onChange={(e) => setCell(r.id, "closing_score", e.target.value)} />
            <button className="icon-btn" aria-label="Save" disabled={!r._dirty || busy}
              style={r._dirty ? { borderColor: "var(--good)", color: "var(--good)" } : {}}
              onClick={() => saveRow(r)}><Save size={16} /></button>
            <button className="icon-btn danger" aria-label="Delete" onClick={() => deleteRow(r)}><Trash2 size={16} /></button>
          </div>
        ))}
        {rows.length === 0 && <p className="picker-empty">No cutoff rows for this college yet.</p>}
      </div>
    </div>
  );
}
