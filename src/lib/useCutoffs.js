import { useEffect, useState } from "react";
import { supabase, isConfigured } from "./supabase.js";

// Round ordering: 'final' beats numbered rounds; otherwise numeric.
const roundRank = (r) => (r === "final" ? 99 : parseInt(r, 10) || 0);

// Fetches cutoff rows for the selected colleges (latest year in the data),
// keeping only each (college, branch, category, quota, gender)'s LAST round.
// Returns { data: { [collegeId]: { exam, rows: { [branch]: { [category]: row } } } }, ready }
export function useCutoffs(collegeIds) {
  const [state, setState] = useState({ data: {}, ready: false });
  const key = collegeIds.slice().sort().join(",");

  useEffect(() => {
    let cancelled = false;
    if (!isConfigured || !supabase || collegeIds.length === 0) {
      setState({ data: {}, ready: true });
      return;
    }
    (async () => {
      const { data: rows, error } = await supabase
        .from("cutoffs")
        .select("*")
        .in("college_id", collegeIds);
      if (cancelled) return;
      if (error || !rows || rows.length === 0) {
        setState({ data: {}, ready: true });
        return;
      }
      const latestYear = Math.max(...rows.map((r) => r.year));
      const best = new Map(); // dedupe key → row of last round
      for (const r of rows) {
        if (r.year !== latestYear) continue;
        const k = [r.college_id, r.branch, r.category, r.quota, r.gender].join("|");
        const prev = best.get(k);
        if (!prev || roundRank(r.round) > roundRank(prev.round)) best.set(k, r);
      }
      const data = {};
      for (const r of best.values()) {
        const c = (data[r.college_id] ||= { exam: r.exam, year: r.year, rows: {} });
        ((c.rows[r.branch] ||= {})[r.category] = r);
      }
      setState({ data, ready: true });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
