/**
 * Large burger illustration in the YEET sticker style, drawn at its display size
 * so stroke weights stay consistent (the 64px icon set is for small sizes only).
 * Framing is centred and front-on to line up with the real burger photograph.
 */
const R = "#DD0303";

export function BurgerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 50 400 400" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="200" cy="418" rx="150" ry="13" fill={R} opacity="0.1" />
      <g stroke={R} strokeLinejoin="round" strokeLinecap="round">
        {/* bottom bun */}
        <path d="M62 330 H338 Q338 396 290 396 H110 Q62 396 62 330 Z" fill="#fff" strokeWidth="8" />
        {/* sauce drips */}
        <path d="M78 326 Q90 356 102 326 Z" fill={R} strokeWidth="4" />
        <path d="M292 326 Q306 360 320 326 Z" fill={R} strokeWidth="4" />
        {/* crispy patty */}
        <rect x="56" y="270" width="288" height="58" rx="29" fill={R} strokeWidth="8" />
        <path d="M112 292 h32 M184 304 h32 M256 292 h32" stroke="#fff" strokeWidth="6" fill="none" />
        {/* cheese */}
        <path d="M58 248 H342 L332 270 H300 L290 292 L280 270 H172 L162 288 L152 270 H68 Z" fill="#fff" strokeWidth="7" />
        {/* lettuce */}
        <path
          d="M50 232 Q66 210 82 232 T114 232 T146 232 T178 232 T210 232 T242 232 T274 232 T306 232 T338 232 T354 232 L348 250 H56 Z"
          fill="#fff"
          strokeWidth="7"
        />
        {/* top bun with glossy highlight, echoing the logo's highlights */}
        <path d="M70 222 C70 124 130 86 200 86 C270 86 330 124 330 222 Z" fill="#fff" strokeWidth="8" />
        <path d="M112 168 Q126 124 172 108" fill="none" strokeWidth="5" />
      </g>
      <g fill={R}>
        <ellipse cx="152" cy="146" rx="8" ry="4.5" transform="rotate(-24 152 146)" />
        <ellipse cx="204" cy="124" rx="8" ry="4.5" />
        <ellipse cx="254" cy="148" rx="8" ry="4.5" transform="rotate(24 254 148)" />
        <ellipse cx="180" cy="182" rx="8" ry="4.5" transform="rotate(-10 180 182)" />
        <ellipse cx="234" cy="184" rx="8" ry="4.5" transform="rotate(12 234 184)" />
      </g>
    </svg>
  );
}
