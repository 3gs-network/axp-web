import { BrandMark } from "@/components/layout/BrandMark";

/**
 * The left half of /register: what HomeReady is, at a glance. The drawing is
 * a placeholder illustration (inline SVG, no asset to load) until the brand
 * team supplies artwork; swap the <svg> for an <img> when they do.
 */
export function RegisterShowcase() {
  return (
    <aside className="register-showcase" aria-label="About HomeReady">
      <div className="register-showcase-glow" aria-hidden="true" />
      <div className="register-showcase-top">
        <BrandMark inverse />
      </div>

      <div className="register-showcase-body">
        <p className="eyebrow eyebrow--gold">HomeReady™</p>
        <p className="register-showcase-title">
          Your path to a home of your own <em>starts here.</em>
        </p>

        <HomeIllustration />

        <ol className="register-steps">
          <li>
            <span aria-hidden="true">1</span>Tell us about you
          </li>
          <li>
            <span aria-hidden="true">2</span>Confirm your email
          </li>
          <li>
            <span aria-hidden="true">3</span>A HomeReady officer calls you
          </li>
        </ol>
      </div>
    </aside>
  );
}

function HomeIllustration() {
  return (
    <svg className="register-illustration" viewBox="0 40 420 256" aria-hidden="true" focusable="false">
      {/* sun: the halo and the core breathe slightly out of step */}
      <circle className="ill-sun-halo" cx="318" cy="78" r="38" fill="rgba(212,160,42,.16)" />
      <circle className="ill-sun" cx="318" cy="78" r="24" fill="#D4A02A" />
      {/* ground: soft ellipses, so the drawing has no hard edge */}
      <ellipse cx="216" cy="262" rx="200" ry="30" fill="rgba(255,255,255,.05)" />
      <ellipse cx="216" cy="258" rx="140" ry="18" fill="rgba(255,255,255,.07)" />
      {/* path to the door */}
      <path d="M198 288 C202 274 205 262 208 252 L224 252 C228 262 234 274 242 288Z" fill="rgba(212,160,42,.3)" />
      {/* house */}
      <rect x="132" y="150" width="168" height="102" fill="#F5F3ED" />
      <path d="M118 158 L216 84 L314 158" fill="none" stroke="#D4A02A" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="262" y="96" width="18" height="38" fill="#F5F3ED" />
      {/* door */}
      <rect x="200" y="196" width="32" height="56" rx="3" fill="#1A233D" />
      <circle cx="225" cy="226" r="2.6" fill="#D4A02A" />
      {/* windows */}
      <rect x="150" y="176" width="34" height="30" rx="2" fill="#1A233D" />
      <rect x="248" y="176" width="34" height="30" rx="2" fill="#1A233D" />
      <path d="M167 176 V206 M150 191 H184 M265 176 V206 M248 191 H282" stroke="rgba(212,160,42,.55)" strokeWidth="2" />
      {/* key: floats (outer group animates, inner group keeps its pose) */}
      <g className="ill-key">
        <g transform="translate(66 92) rotate(-28)">
          <circle cx="0" cy="0" r="17" fill="none" stroke="#D4A02A" strokeWidth="6" />
          <path d="M17 0 H68 M54 0 V12 M64 0 V9" stroke="#D4A02A" strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>
      {/* sparkles: twinkle at staggered times */}
      <path className="ill-star ill-star--1" d="M362 160 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4Z" fill="#e9c66c" />
      <path className="ill-star ill-star--2" d="M92 196 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" fill="#e9c66c" />
      <path className="ill-star ill-star--3" d="M262 62 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5Z" fill="#e9c66c" />
    </svg>
  );
}
