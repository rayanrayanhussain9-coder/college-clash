import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import CollegeImage from "./CollegeImage.jsx";

export default function Specialities({ selected }) {
  return (
    <div className="spec-section">
      <div className="section-head">
        <h2>What each one is known for</h2>
        <p className="section-sub">Numbers don't capture everything — here's each college's signature strength.</p>
      </div>

      <div className="spec-grid">
        {selected.map((c, i) => (
          <motion.div
            key={c.id}
            className="spec-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
          >
            <CollegeImage college={c} className="spec-img" small eager />
            <div className="spec-body">
              <div className="spec-name">{c.name}</div>
              <div className="spec-tagline">{c.tagline}</div>
              <ul className="spec-list">
                {c.specialities.map((s) => (
                  <li key={s}>
                    <Sparkles size={14} style={{ color: c.accent }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
