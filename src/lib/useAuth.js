import { useEffect, useState } from "react";
import { supabase, isConfigured, ADMIN_EMAIL } from "./supabase.js";

// Tracks the Supabase auth session and whether the logged-in user is the admin.
export function useAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = !!session && session.user?.email === ADMIN_EMAIL;
  return { session, isAdmin };
}
