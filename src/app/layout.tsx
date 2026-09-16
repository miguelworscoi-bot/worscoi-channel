import React, { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-[#FF2D55] selection:text-white relative overflow-x-hidden">
      {/* Luz ambiente superior suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-[#FF2D55]/10 via-indigo-950/5 to-transparent blur-[140px] -z-10"
      />
      {children}
    </div>
  );
}
