import { useEffect, useState } from "react";
import CollegeImage from "./CollegeImage.jsx";

// Fixed, full-screen carousel behind the hero + story content.
// All slides stay mounted (images preloaded) and we crossfade between them
// purely with CSS opacity — no load-on-transition lag, GPU-smooth.
export default function BackgroundCarousel({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <div className="bg-carousel" aria-hidden="true">
      {slides.map((s, i) => (
        <div key={s.id} className={`bg-slide ${i === index ? "active" : ""}`}>
          <CollegeImage college={s} className="fill" eager />
        </div>
      ))}

      <div className="bg-scrim" />

      <div className="bg-label">
        <span className="bg-label-name">{current.name}</span>
        <span className="bg-label-loc">{current.city}</span>
      </div>
    </div>
  );
}
