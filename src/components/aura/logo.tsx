// The AURA mark: the all-seeing eye cradled inside an "A" — gold on dark.

export function AuraMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aura-gold" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#e8cf86" />
          <stop offset="0.5" stopColor="#c9a84c" />
          <stop offset="1" stopColor="#8a6c2a" />
        </linearGradient>
      </defs>
      {/* The A — two strokes rising to a peak */}
      <path
        d="M24 5 L40 41 H33 L24 19 L15 41 H8 L24 5 Z"
        fill="url(#aura-gold)"
      />
      {/* Eye nested in the apex */}
      <path
        d="M16.5 22 C19 18.5 29 18.5 31.5 22 C29 25.5 19 25.5 16.5 22 Z"
        fill="#0a1412"
      />
      <circle cx="24" cy="22" r="3" fill="url(#aura-gold)" />
      <circle cx="24" cy="22" r="1.2" fill="#0a1412" />
    </svg>
  );
}

export function AuraWordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <AuraMark size={size} />
      <span className="text-xl font-semibold tracking-[0.35em] text-[#f4efe0]">
        AURA
      </span>
    </span>
  );
}
