import React from 'react';

interface BrandLogoProps {
  logoUrl?: string;
  brandName: string;
  primaryColor: string;
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  brandName,
  primaryColor,
  accentColor,
  size = 'md',
}) => {
  const dimensions = {
    sm: 'h-10 text-2xl',
    md: 'h-14 text-4xl',
    lg: 'h-20 text-5xl md:text-6xl',
  }[size];

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={brandName}
        className={`${dimensions} w-auto object-contain mx-auto drop-shadow-sm`}
      />
    );
  }

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div
        className="relative px-5 py-2 rounded-full border-[3px] border-[#2B1E2E] shadow-[4px_4px_0px_#2B1E2E] flex items-center gap-2 transition-transform hover:scale-105"
        style={{ backgroundColor: accentColor }}
      >
        {/* Mancha orgánica estilo vaca artesanal */}
        <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0">
          <circle cx="18" cy="18" r="16" fill="#FFFFFF" stroke="#2B1E2E" strokeWidth="2.5" />
          <path
            d="M10 11 C13 8, 19 9, 18 14 C17 18, 11 19, 9 15 Z"
            fill={primaryColor}
          />
          <path
            d="M21 20 C25 18, 28 23, 25 26 C22 28, 18 25, 21 20 Z"
            fill="#2B1E2E"
          />
        </svg>
        <span
          className={`font-display font-bold tracking-tight ${
            size === 'lg' ? 'text-4xl md:text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl'
          }`}
          style={{ color: '#2B1E2E' }}
        >
          {brandName}
        </span>
      </div>
    </div>
  );
};
