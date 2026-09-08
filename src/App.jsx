import { useMemo, useState } from "react";
import { buildComparison } from "./lib/scoring.js";
import { useColleges } from "./lib/useColleges.js";
import { useAuth } from "./lib/useAuth.js";
import BackgroundCarousel from "./components/BackgroundCarousel.jsx";
import Hero from "./components/Hero.jsx";
import ScrollStory from "./components/ScrollStory.jsx";
import CompareBuilder from "./components/CompareBuilder.jsx";
import CollegePicker from "./components/CollegePicker.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";
import Cutoffs from "./components/Cutoffs.jsx";
import Specialities from "./components/Specialities.jsx";
import Verdict from "./components/Verdict.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import BrandMark from "./components/BrandMark.jsx";

const MARQUEE_IDS = ["iit-mandi", "nit-surathkal", "iit-bombay", "bits-pilani", "iit-guwahati", "iit-roorkee"];
const MAX = 4;

export default function App() {
  const { colleges, reload } = useColleges();
  const { isAdmin } = useAuth();
  const [selection, setSelected] = useState([]);
  const selected = useMemo(() => selection.map((item) => colleges.find((c) => c.id === item.id)).filter(Boolean), [selection, colleges]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const marquee = MARQUEE_IDS.map((id) => colleges.find((c) => c.id === id)).filter(Boolean);
  const available = colleges.filter((c) => !selected.some((s) => s.id === c.id));
  const comparison = useMemo(() => buildComparison(selected), [selected]);

  const addCollege = (college) => {
    setSelected((prev) => (prev.length >= MAX ? prev : [...prev, college]));
    setPickerOpen(false);
  };
  const removeCollege = (id) => setSelected((prev) => prev.filter((c) => c.id !== id));
  const clearAll = () => setSelected([]);
  const goCompare = () => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" });

  // Hidden admin entry: clicking "CollegeClash" in the footer.
  const openAdmin = () => (isAdmin ? setAdminOpen(true) : setLoginOpen(true));

  return (
    <>
      <BackgroundCarousel slides={marquee.length ? marquee : colleges.slice(0, 6)} />

      <div className="content">
        <nav className="nav">
          <a className="brand" href="#home" aria-label="CollegeClash home">
            <BrandMark />
            <span>College<b>Clash</b></span>
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#compare">Compare</a>
          </div>
        </nav>

        <Hero onStart={goCompare} />
        <ScrollStory />

        <main className="solid" id="compare">
          <CompareBuilder
            selected={selected}
            onAdd={() => setPickerOpen(true)}
            onRemove={removeCollege}
            onClear={clearAll}
          />

          {selected.length >= 2 ? (
            <>
              <ComparisonTable selected={selected} comparison={comparison} />
              <Cutoffs selected={selected} />
              <Specialities selected={selected} />
              <Verdict comparison={comparison} />
            </>
          ) : (
            <div className="empty-state">
              <p>Add at least <strong>2 colleges</strong> above to reveal the full comparison, specialities and winner.</p>
            </div>
          )}
        </main>

        <footer className="footer">
          <span>
            <button className="footer-brand" onClick={openAdmin} title="Admin login" aria-label="CollegeClash admin login">
              <BrandMark size={24} />
              <span>College<b>Clash</b></span>
            </button>
            {" · comparison data is curated and approximate — verify with official sources before deciding."}
          </span>
        </footer>
      </div>

      {pickerOpen && (
        <CollegePicker available={available} onPick={addCollege} onClose={() => setPickerOpen(false)} />
      )}

      {loginOpen && (
        <AdminLogin
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setLoginOpen(false); setAdminOpen(true); }}
        />
      )}

      {adminOpen && isAdmin && (
        <AdminPanel
          colleges={colleges}
          onClose={() => setAdminOpen(false)}
          onChanged={reload}
        />
      )}
    </>
  );
}
