export default function Hero({ onStart }) {
  return (
    <header className="hero" id="home">
      <div className="eyebrow">Recognized colleges of India</div>
      <h1>
        Don't guess. <span className="grad">Compare.</span>
      </h1>
      <p>
        College Clash helps students compare colleges side-by-side across placements,
        fees, rankings, infrastructure, and campus life. By presenting verified data and
        honest reviews in one place, we simplify your college search—replacing confusion
        and scattered research with clarity, confidence, and informed decisions for your future.
      </p>
      <div className="hero-cta">
        <button className="btn primary" onClick={onStart}>
          Start comparing
        </button>
        <a className="btn" href="#how">How it works</a>
      </div>
      <div className="scroll-cue">scroll ↓</div>
    </header>
  );
}
