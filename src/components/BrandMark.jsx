export default function BrandMark({ size = 34 }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="16" height="34" rx="7" fill="url(#brand-left)" />
      <rect x="22" y="3" width="16" height="34" rx="7" fill="url(#brand-right)" />
      <path d="M23.4 9.5 16.2 30.5" stroke="#0A0B10" strokeWidth="4" strokeLinecap="round" />
      <circle cx="10" cy="12" r="2.2" fill="rgba(255,255,255,.92)" />
      <circle cx="30" cy="28" r="2.2" fill="rgba(255,255,255,.92)" />
      <defs>
        <linearGradient id="brand-left" x1="2" y1="3" x2="20" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CFF" />
          <stop offset="1" stopColor="#5E46E8" />
        </linearGradient>
        <linearGradient id="brand-right" x1="22" y1="3" x2="38" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00E0FF" />
          <stop offset="1" stopColor="#00A6D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
