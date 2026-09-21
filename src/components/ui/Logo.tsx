import React from 'react';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export const FairwayKindLogo: React.FC<LogoProps> = ({ 
  className = "h-10 w-auto", 
  showWordmark = true 
}) => {
  if (!showWordmark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 44 44"
        className={className}
        fill="none"
        aria-label="FairwayKind Mark"
      >
        <rect width="44" height="44" rx="14" fill="#2E5A44" />
        <path
          d="M14 26C14 19.3726 19.3726 14 26 14C32.6274 14 38 19.3726 38 26"
          stroke="#FAF9F5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 28C20 25 22.5 22.5 26 22.5C29.5 22.5 32 25 32 28C32 32.5 26 36 26 36C26 36 20 32.5 20 28Z"
          fill="#D4AF37"
        />
        <circle cx="33" cy="17" r="2.5" fill="#FAF9F5" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 60"
      className={className}
      fill="none"
      aria-label="FairwayKind Logo"
    >
      <g transform="translate(4, 8)">
        <rect width="44" height="44" rx="14" fill="#2E5A44" />
        <path
          d="M14 26C14 19.3726 19.3726 14 26 14C32.6274 14 38 19.3726 38 26"
          stroke="#FAF9F5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 28C20 25 22.5 22.5 26 22.5C29.5 22.5 32 25 32 28C32 32.5 26 36 26 36C26 36 20 32.5 20 28Z"
          fill="#D4AF37"
        />
        <circle cx="33" cy="17" r="2.5" fill="#FAF9F5" />
      </g>
      <text
        x="60"
        y="34"
        fontFamily="'Outfit', system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#181A18"
        letterSpacing="-0.5"
      >
        Fairway<tspan fill="#2E5A44">Kind</tspan>
      </text>
      <text
        x="60"
        y="47"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="#8FAFA0"
        letterSpacing="1.5"
      >
        PLAY • WIN • GIVE BACK
      </text>
    </svg>
  );
};
