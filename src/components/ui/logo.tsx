// The Tournex mark: two seeds converging into a winner, lime on dark.

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#ADFF2F" fillOpacity="0.12" />
      <path
        d="M8 10h4v4H8zM8 18h4v4H8zM16 14h8v4H16z"
        fill="#ADFF2F"
      />
      <path
        d="M12 12h4v2h-4zM12 20h4v2h-4z"
        fill="#ADFF2F"
        opacity="0.5"
      />
    </svg>
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="text-lg font-bold tracking-tight">Tournex</span>
    </span>
  );
}
