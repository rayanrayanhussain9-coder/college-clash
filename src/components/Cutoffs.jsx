import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useCutoffs } from "../lib/useCutoffs.js";

const BRANCHES = [
  ["CSE", "Computer Science"],
  ["ECE", "Electronics & Comm."],
  ["EE", "Electrical"],
  ["ME", "Mechanical"],
  ["CE", "Civil"],
  ["CHE", "Chemical"],
];
const CATEGORIES = ["General", "EWS", "OBC-NCL", "SC", "ST"];

const fmtRank = (n) => n?.toLocaleString("en-IN");

export default function Cutoffs({ selected }) {
  const { data, ready } = useCutoffs(selected.map((c) => c.id));
  const [category, setCategory] = useState("General");

  // Categories that have any data at all (others render disabled).
  const availableCats = useMemo(() => {
    const s = new Set();
    Object.values(data).forEach((c) =>
      Object.values(c.rows).forEach((byCat) => Object.keys(byCat).forEach((k) => s.add(k)))
    );
    return s;
  }, [data]);

  // Branches offered by at least one selected college.
  const branches = BRANCHES.filter(([code]) =>
    selected.some((c) => data[c.id]?.rows[code])
  );

  if (!ready) return null;
  if (Object.keys(data).length === 0) {
    return (
      <div className="cutoff-section">
        <div className="section-head">
          <h2>Admission cutoffs</h2>
          <p className="section-sub">Cutoff data isn't loaded yet — run the latest database update.</p>
        </div>
      </div>
    );
  }

  const year = Object.values(data)[0]?.year;

  return (
    <div className="cutoff-section">
      <div className="section-head">
        <h2>Admission cutoffs</h2>
        <p className="section-sub">
          Closing ranks · {year} final round · lower is better. Ranks are only comparable
          between colleges taking the <em>same exam</em>.
        </p>
      </div>

      <div className="cutoff-cats">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-pill ${category === cat ? "active" : ""}`}
            disabled={!availableCats.has(cat)}
            title={availableCats.has(cat) ? "" : "No data yet for this category"}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="table-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="corner">Branch</th>
              {selected.map((c) => (
                <th key={c.id} style={{ borderTopColor: c.accent }}>
                  <span className="th-name">{c.name}</span>
                  <span className="th-type">
                    {data[c.id]?.exam || "—"}
                    {data[c.id] && selected.length > 1 ? " · closing" : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map(([code, label], ri) => {
              // best (lowest) closing rank per exam group, rank-based only
              const bestByExam = {};
              selected.forEach((c) => {
                const row = data[c.id]?.rows[code]?.[category];
                if (row?.closing_rank != null) {
                  const e = data[c.id].exam;
                  if (!bestByExam[e] || row.closing_rank < bestByExam[e]) bestByExam[e] = row.closing_rank;
                }
              });
              const examGroups = Object.keys(bestByExam).length;
              return (
                <motion.tr
                  key={code}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: Math.min(ri * 0.04, 0.3) }}
                >
                  <td className="factor-cell">
                    <span className="factor-label">{label}</span>
                    <span className="factor-dir"><em>{code}</em></span>
                  </td>
                  {selected.map((c) => {
                    const info = data[c.id];
                    const row = info?.rows[code]?.[category];
                    if (!row || (row.closing_rank == null && row.closing_score == null)) {
                      return <td key={c.id} className="info-cell">—</td>;
                    }
                    const isScore = row.closing_rank == null;
                    const isBest =
                      !isScore &&
                      row.closing_rank === bestByExam[info.exam] &&
                      (examGroups === 1 ? selected.length > 1 : true);
                    return (
                      <td key={c.id} className={`val-cell cutoff-cell ${isBest ? "best" : ""}`}
                        style={isBest ? { boxShadow: "inset 0 0 0 1.5px rgba(47,210,122,.7)", background: "rgba(47,210,122,.12)" } : {}}>
                        {isBest && <Crown size={13} className="best-crown" />}
                        {isScore ? `${row.closing_score} marks` : `#${fmtRank(row.closing_rank)}`}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="cutoff-note">
        JoSAA/JAC/BITSAT {year}, last round, gender-neutral seats; NIT ranks are Other-State
        quota; reserved-category values use category rank. Approximate — verify on josaa.nic.in.
      </p>
    </div>
  );
}
