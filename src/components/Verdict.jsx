import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

export default function Verdict({ comparison }) {
  const { winner, ranking } = comparison;
  if (!winner) return null;

  const topScore = ranking[0].score10;

  return (
    <div className="verdict-section">
      <motion.div
        className="winner-banner"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <div className="winner-tag"><Trophy size={15} /> Winner by total score</div>
        <h2 className="winner-name">{winner.college.name}</h2>
        <p className="winner-stats">
          Tops {winner.wins} of {comparison.scoredCount} factors · overall score{" "}
          <strong>{winner.score10.toFixed(1)} / 10</strong>
        </p>
      </motion.div>

      <div className="section-head" style={{ marginTop: "3rem" }}>
        <h2>Final ranking</h2>
        <p className="section-sub">Equal-weighted across all {comparison.scoredCount} scored factors.</p>
      </div>

      <div className="rank-list">
        {ranking.map((row) => {
          const pct = topScore > 0 ? (row.score10 / topScore) * 100 : 0;
          return (
            <motion.div
              key={row.college.id}
              className={`rank-row ${row.rank === 1 ? "first" : ""}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (row.rank - 1) * 0.08 }}
            >
              <div className="rank-num">
                {row.rank === 1 ? <Medal size={20} /> : `#${row.rank}`}
              </div>
              <div className="rank-main">
                <div className="rank-name">{row.college.name}</div>
                <div className="rank-track">
                  <div
                    className="rank-fill"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${row.college.accent}, #00e0ff)` }}
                  />
                </div>
              </div>
              <div className="rank-score">{row.score10.toFixed(1)}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
