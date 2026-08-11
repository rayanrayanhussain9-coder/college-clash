import { FACTORS } from "../data/colleges.js";

// Which factor types get scored/coloured. "text" factors (NAAC grade, exam,
// location) are informational only — no best/worst, no winner contribution.
const SCORED = new Set(["number", "money", "stars"]);

function fmtNum(v) {
  if (v == null || Number.isNaN(v)) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// Display a value according to its factor type.
export function formatValue(factor, value) {
  if (value == null || value === "") return "—";
  if (factor.key === "ranking") {
    if (value >= 999) return "Not ranked";
    if (value > 200) return "201–300";
    if (value > 150) return "151–200";
    if (value > 100) return "101–150";
    return `#${value}`;
  }
  if (factor.type === "money") {
    return value >= 100 ? `₹${(value / 100).toFixed(2)} Cr` : `₹${fmtNum(value)} LPA`;
  }
  if (factor.type === "number" && factor.unit === "₹ L") return `₹${fmtNum(value)} L`;
  if (factor.type === "stars") return String(value); // component renders stars
  return typeof value === "number" ? fmtNum(value) : String(value);
}

function lerp(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - a[i]) * t));
}

// Map a normalised score (0 = worst, 1 = best) to a red→amber→green tint.
export function colorForNorm(norm) {
  const red = [255, 90, 110];
  const amber = [245, 196, 81];
  const green = [47, 210, 122];
  let rgb;
  if (norm <= 0.5) rgb = lerp(red, amber, norm / 0.5);
  else rgb = lerp(amber, green, (norm - 0.5) / 0.5);
  const [r, g, b] = rgb;
  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.16)`,
    border: `rgba(${r}, ${g}, ${b}, 0.55)`,
    text: `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`,
  };
}

export function buildComparison(selected) {
  const scoredFactors = FACTORS.filter((f) => SCORED.has(f.type));
  if (!selected || selected.length === 0) {
    return { factors: [], ranking: [], winner: null, scoredCount: scoredFactors.length };
  }

  const totals = Object.fromEntries(selected.map((c) => [c.id, 0]));
  const winCounts = Object.fromEntries(selected.map((c) => [c.id, 0]));

  const factors = FACTORS.map((factor) => {
    // Informational text rows — shown but not scored/coloured.
    if (!SCORED.has(factor.type)) {
      return {
        ...factor,
        scored: false,
        cells: selected.map((c) => ({
          collegeId: c.id,
          value: c.factors[factor.key],
          display: formatValue(factor, c.factors[factor.key]),
        })),
      };
    }

    const values = selected.map((c) => c.factors[factor.key]);

    // Do not turn missing official data into a fake zero. If one of the
    // compared colleges has not published a metric, show the row as
    // information-only and leave it out of the winner calculation.
    if (values.some((value) => value == null || value === "" || Number.isNaN(value))) {
      return {
        ...factor,
        scored: false,
        unavailable: true,
        cells: selected.map((c) => ({
          collegeId: c.id,
          value: c.factors[factor.key],
          display: formatValue(factor, c.factors[factor.key]),
        })),
      };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const tie = min === max;
    const norms = values.map((v) =>
      tie ? 0.5 : factor.higherIsBetter ? (v - min) / (max - min) : (max - v) / (max - min)
    );
    const bestNorm = Math.max(...norms);
    const worstNorm = Math.min(...norms);

    const cells = selected.map((c, i) => {
      const norm = norms[i];
      const isBest = !tie && norm === bestNorm;
      const isWorst = !tie && norm === worstNorm;
      totals[c.id] += norm;
      if (isBest) winCounts[c.id] += 1;
      return {
        collegeId: c.id,
        value: values[i],
        display: factor.key === "fees" ? c.factors.feesRange : formatValue(factor, values[i]),
        norm,
        isBest,
        isWorst,
        color: colorForNorm(norm),
      };
    });

    return { ...factor, scored: true, cells, tie };
  });

  const ranking = selected
    .map((c) => ({
      college: c,
      total: totals[c.id],
      score10: (totals[c.id] / factors.filter((factor) => factor.scored).length) * 10,
      wins: winCounts[c.id],
    }))
    .sort((a, b) => b.total - a.total)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  return {
    factors,
    ranking,
    winner: ranking[0] || null,
    scoredCount: factors.filter((factor) => factor.scored).length,
  };
}
