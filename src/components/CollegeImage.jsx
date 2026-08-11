import { useState } from "react";

// Renders a college photo with an always-present coloured gradient behind it.
// `small` uses the pre-resized 320px thumbnail (picker/chips/cards); otherwise
// the ~1100px hero image. Both are direct, browser-cached CDN URLs. If a photo
// fails or is missing, the gradient simply shows through — nothing looks broken.
export default function CollegeImage({ college, className = "", style = {}, eager = false, small = false }) {
  const [failed, setFailed] = useState(false);
  const src = small && college.thumb ? college.thumb : college.image;
  const gradient = `radial-gradient(120% 90% at 20% 10%, ${college.accent}cc 0%, transparent 55%), radial-gradient(120% 90% at 95% 90%, ${college.accent}66 0%, transparent 55%), linear-gradient(160deg, #14122b, #070912)`;

  return (
    <div className={`college-image ${className}`} style={{ background: gradient, ...style }}>
      {!failed && src && (
        <img
          src={src}
          alt={college.name}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      )}
      <div className="college-image-grid" aria-hidden="true" />
    </div>
  );
}
