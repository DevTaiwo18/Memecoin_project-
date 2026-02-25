export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
      {/* Radar arcs */}
      <path d="M16 22 A8 8 0 0 1 8 14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" fill="none" />
      <path d="M16 22 A5 5 0 0 1 11 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" fill="none" />
      <path d="M16 22 A2.5 2.5 0 0 1 13.5 19.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" fill="none" />
      {/* Radar sweep line */}
      <line x1="16" y1="22" x2="22" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      {/* Center dot */}
      <circle cx="16" cy="22" r="2" fill="white" />
      {/* Signal dot at tip */}
      <circle cx="22" cy="11" r="1.5" fill="#67E8F9" />
    </svg>
  );
}
