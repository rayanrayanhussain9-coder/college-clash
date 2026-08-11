import { useState } from "react";
import { motion } from "framer-motion";
import { X, Lock } from "lucide-react";
import { supabase, isConfigured, ADMIN_EMAIL } from "../lib/supabase.js";

// Hidden admin login, opened by clicking "CollegeClash" in the footer.
export default function AdminLogin({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!isConfigured || !supabase) {
      setError("Supabase isn't connected yet — add your project URL + anon key in src/lib/supabase.js.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError("This account isn't authorised.");
      return;
    }
    onSuccess?.();
  }

  return (
    <div className="picker-overlay" onClick={onClose}>
      <motion.form
        className="admin-login"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <div className="picker-head">
          <h3><Lock size={16} style={{ verticalAlign: "-2px", marginRight: 7 }} />Admin sign in</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="admin-login-body">
          <input type="email" placeholder="Email" autoComplete="username" autoFocus required
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="admin-error">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
