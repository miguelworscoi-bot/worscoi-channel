import React from 'react';

interface WorscoiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDot?: boolean;
  className?: string;
}

export function WorscoiLogo({ size = 'md', showDot = false, className = '' }: WorscoiLogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Cursive handwritten Worscoi brand typography */}
      <span
        style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
        className={`${sizeClasses[size]} font-bold tracking-wide text-[#FF2D55] drop-shadow-[0_0_12px_rgba(255,45,85,0.4)] transition-all`}
      >
        Worscoi
      </span>
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse drop-shadow-[0_0_6px_rgba(255,45,85,0.8)]" />
      )}
    </div>
  );
}
