import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import CollegeImage from "./CollegeImage.jsx";

const MAX = 4;

export default function CompareBuilder({ selected, onAdd, onRemove, onClear }) {
  const emptySlots = Math.max(0, MAX - selected.length);

  return (
    <div className="builder">
      <div className="builder-head">
        <div>
          <h2>Build your comparison</h2>
          <p className="builder-sub">Pick 2 to 4 colleges to put head-to-head.</p>
        </div>
        {selected.length > 0 && (
          <button className="btn ghost" onClick={onClear}>Clear all</button>
        )}
      </div>

      <div className="builder-row">
        <AnimatePresence mode="popLayout">
          {selected.map((c) => (
            <motion.div
              key={c.id}
              layout
              className="chip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button className="chip-remove" aria-label={`Remove ${c.name}`} onClick={() => onRemove(c.id)}>
                <X size={16} />
              </button>
              <CollegeImage college={c} className="chip-img" small eager />
              <div className="chip-name">{c.name}</div>
              <div className="chip-loc">{c.city}</div>
              <div className="chip-bar" style={{ background: `linear-gradient(90deg, ${c.accent}, #00e0ff)` }} />
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({ length: emptySlots }).map((_, i) => (
          <button key={`add-${i}`} className="add-card" onClick={onAdd}>
            <span className="add-plus"><Plus size={26} /></span>
            <span>Add a college</span>
          </button>
        ))}
      </div>

      <div className="builder-meta">
        <span>Pick up to {MAX} colleges</span>
        <span>{selected.length} / {MAX} selected</span>
      </div>
    </div>
  );
}
