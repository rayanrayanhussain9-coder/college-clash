import { useCallback, useEffect, useState } from "react";
import { COLLEGES } from "../data/colleges.js";
import { supabase, isConfigured } from "./supabase.js";

const byRanking = (a, b) =>
  (a.factors?.ranking ?? 999) - (b.factors?.ranking ?? 999);

// Loads colleges from Supabase, falling back to the bundled data when Supabase
// isn't configured yet or a request fails — so the site always renders.
export function useColleges() {
  const [colleges, setColleges] = useState(COLLEGES);
  const [source, setSource] = useState(isConfigured ? "loading" : "local");

  const reload = useCallback(async () => {
    if (!isConfigured || !supabase) {
      setColleges(COLLEGES);
      setSource("local");
      return;
    }
    const { data, error } = await supabase.from("colleges").select("*");
    if (error || !data) {
      setColleges(COLLEGES);
      setSource("fallback");
    } else {
      setColleges([...data].sort(byRanking));
      setSource("supabase");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { colleges, source, reload };
}
