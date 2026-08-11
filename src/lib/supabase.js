import { createClient } from "@supabase/supabase-js";

// ── Supabase connection ───────────────────────────────────────────────
// Paste your project's values below (Supabase dashboard → Settings → API).
// The anon/public key is SAFE to keep in client code — your data is protected
// by Row-Level Security (see supabase/schema.sql). NEVER put the service_role
// key here; that one is a real secret.
const SUPABASE_URL = "https://clribazrtqivckjkinqz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fJ1qzkzmsMzufZ3fhP0ycg_WhvMYpAW";

// The only account allowed into the admin panel.
export const ADMIN_EMAIL = "rayanrayanhussain9@gmail.com";

// True once real credentials are filled in above.
export const isConfigured = SUPABASE_URL.startsWith("http");

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
