import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Crown } from "lucide-react";

function Stars({ n }) {
  if (n == null) return <span className="not-reported">Not reported</span>;
  return (
    <span className="stars" aria-label={`${n} of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "star on" : "star off"}>★</span>
      ))}
    </span>
  );
}

export default function ComparisonTable({ selected, comparison }) {
  return (
    <div className="table-section">
      <div className="section-head">
        <h2>The head-to-head</h2>
        <p className="section-sub">
          Best value in each scored row glows <span className="hl-good">green</span>, worst glows{" "}
          <span className="hl-bad">red</span>. Grey rows are info-only or have unpublished official data.
        </p>
      </div>

      <div className="table-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="corner">Factor</th>
              {selected.map((c) => (
                <th key={c.id} style={{ borderTopColor: c.accent }}>
                  <span className="th-name">{c.name}</span>
                  <span className="th-type">{c.type}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.factors.map((factor, ri) => (
              <motion.tr
                key={factor.key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(ri * 0.03, 0.3) }}
              >
                <td className="factor-cell">
                  <span className="factor-label">{factor.label}</span>
                  <span className="factor-dir">
                    {factor.scored ? (
                      <>
                        {factor.higherIsBetter ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {factor.type === "stars" && <em>★ / 3</em>}
                        {factor.unit && <em>{factor.unit}</em>}
                      </>
                    ) : (
                      <em>info</em>
                    )}
                  </span>
                </td>

                {factor.cells.map((cell) =>
                  factor.scored ? (
                    <td
                      key={cell.collegeId}
                      className={`val-cell ${cell.isBest ? "best" : ""} ${cell.isWorst ? "worst" : ""}`}
                      style={{
                        background: cell.color.bg,
                        boxShadow: cell.isBest
                          ? "inset 0 0 0 1.5px rgba(47,210,122,.7)"
                          : cell.isWorst
                          ? "inset 0 0 0 1.5px rgba(255,90,110,.6)"
                          : "none",
                        color: factor.type === "stars" ? undefined : cell.color.text,
                      }}
                    >
                      {cell.isBest && <Crown size={13} className="best-crown" />}
                      {factor.type === "stars" ? <Stars n={cell.value} /> : cell.display}
                    </td>
                  ) : (
                    <td key={cell.collegeId} className="info-cell">
                      {cell.display}
                    </td>
                  )
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
