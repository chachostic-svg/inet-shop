export default function PartGlyph({ type, color = "#C4783A", className = "h-16 w-16" }) {
  const stroke = color;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {type === "cpu" && (
        <>
          <rect x="16" y="16" width="32" height="32" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="22" y="22" width="20" height="20" fill={stroke} opacity="0.35" />
          <path d="M16 20H10M16 32H8M16 44H10M48 20H54M48 32H56M48 44H54M20 16V10M32 16V8M44 16V10M20 48V54M32 48V56M44 48V54" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {type === "motherboard" && (
        <>
          <rect x="8" y="10" width="48" height="44" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="14" y="16" width="14" height="14" fill={stroke} opacity="0.4" />
          <rect x="34" y="16" width="16" height="6" fill={stroke} />
          <rect x="34" y="26" width="16" height="6" fill={stroke} opacity="0.6" />
          <circle cx="18" cy="44" r="4" fill="none" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {type === "ram" && (
        <>
          <rect x="10" y="18" width="12" height="28" fill={stroke} opacity="0.85" />
          <rect x="26" y="18" width="12" height="28" fill={stroke} opacity="0.55" />
          <rect x="42" y="22" width="12" height="24" fill="none" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {type === "cooler" && (
        <>
          <circle cx="32" cy="32" r="18" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="32" cy="32" r="6" fill={stroke} />
          <path d="M32 14L38 32 32 50 26 32Z" fill={stroke} opacity="0.35" />
        </>
      )}
      {type === "gpu" && (
        <>
          <rect x="6" y="22" width="52" height="20" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="10" y="26" width="28" height="12" fill={stroke} opacity="0.4" />
          <rect x="42" y="26" width="12" height="12" fill={stroke} />
        </>
      )}
      {type === "storage" && (
        <>
          <rect x="12" y="20" width="40" height="24" rx="2" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M18 28H46M18 36H34" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {type === "psu" && (
        <>
          <rect x="10" y="16" width="44" height="32" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="24" cy="32" r="8" fill="none" stroke={stroke} strokeWidth="2" />
          <rect x="38" y="24" width="10" height="16" fill={stroke} />
        </>
      )}
      {type === "case" && (
        <>
          <path d="M18 10H42L50 18V54H18V10Z" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M42 10V18H50" stroke={stroke} strokeWidth="2" />
          <rect x="24" y="24" width="18" height="22" fill={stroke} opacity="0.3" />
        </>
      )}
    </svg>
  );
}
