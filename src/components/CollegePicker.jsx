import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import CollegeImage from "./CollegeImage.jsx";

// Modal that lists every college not already selected, with live search.
export default function CollegePicker({ available, onPick, onClose }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }, [query, available]);

  return (
    <div className="picker-overlay" onClick={onClose}>
      <motion.div
        className="picker"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="picker-head">
          <h3>Add a college</h3>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="picker-search">
          <Search size={18} />
          <input
            autoFocus
            placeholder="Search by name, city or type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="picker-list">
          {results.map((c) => (
            <button key={c.id} className="picker-item" onClick={() => onPick(c)}>
              <CollegeImage college={c} className="thumb" small eager />
              <div className="picker-item-info">
                <span className="picker-item-name">{c.name}</span>
                <span className="picker-item-meta">{c.type} · {c.city}</span>
              </div>
              <span className="picker-item-rank">NIRF #{c.factors.ranking}</span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="picker-empty">No colleges match “{query}”.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
