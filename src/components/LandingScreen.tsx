'use client';
import React, { useState } from 'react';
import {
  Shader,
  DotGrid,
  ChromaFlow,
  LinearGradient,
  CursorRipples,
  FilmGrain,
} from 'shaders/react';
import { Canal } from '@/types';

interface LandingScreenProps {
  onEnterPlayer: (channel?: Canal) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenPlans?: () => void;
  onOpenRedeemToken?: () => void;
  featuredChannels?: Canal[];
}

export function LandingScreen({
  onEnterPlayer,
  onOpenLogin,
  onOpenRegister,
}: LandingScreenProps) {
  const [shaderFailed, setShaderFailed] = useState(false);

  return (
    <main
      className="relative isolate flex flex-col min-h-[100dvh] overflow-hidden bg-[#070708] text-white select-none font-sans"
      style={{
        fontFamily: "'TikTok Sans', ui-sans-serif, system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .reveal {
          opacity: 0;
          transform: translateY(14px);
          animation: revealUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--reveal-delay, 0s);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }

        .cta-group:hover .cta-underline {
          width: 100% !important;
        }
      `}</style>

      {/* SHADER WRAPPER FULL-BLEED */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {!shaderFailed ? (
          <Shader
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            onUnavailable={() => setShaderFailed(true)}
          >
            {/* 1. DotGrid (invisible, driven by ChromaFlow alpha) */}
            <DotGrid
              id="trailDots"
              density={40}
              dotSize={{
                type: 'map',
                source: 'trailFlow',
                channel: 'alpha',
                inputMax: 1,
                inputMin: 0,
                outputMax: 1,
                outputMin: 0,
              }}
              twinkle={0.9}
              visible={false}
            />

            {/* 2. ChromaFlow (invisible cursor-tracking field) */}
            <ChromaFlow
              id="trailFlow"
              intensity={1.4}
              radius={2.9}
              visible={false}
            />

            {/* 3. Base background dark gradient */}
            <LinearGradient
              colorA="#1e1e1f"
              colorB="#070708"
              colorSpace="hsl"
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 1 }}
            />

            {/* 4. Revealing white gradient masked by DotGrid trail */}
            <LinearGradient
              colorA="#000000"
              colorB="#ffffff"
              colorSpace="hsl"
              end={{ x: 1, y: 0 }}
              maskSource="trailDots"
              start={{ x: 0, y: 1 }}
            />

            {/* 5. Cursor ripples chromatic fringes */}
            <CursorRipples />

            {/* 6. Subtle film grain */}
            <FilmGrain strength={0.1} />
          </Shader>
        ) : (
          /* Graceful static fallback if WebGPU is not supported */
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1e1e1f] to-[#070708]" />
        )}
      </div>

      {/* BARRA SUPERIOR DISCRETA DE ACESSO À PLATAFORMA */}
      <header className="relative z-20 flex items-center justify-end px-6 py-4 sm:px-12 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <button
            type="button"
            onClick={() => onEnterPlayer()}
            className="px-4 py-1.5 rounded-full text-white bg-gradient-to-r from-purple-600 to-[#ed3c5c] hover:opacity-90 font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Assistir Agora</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLogin()}
            className="px-3.5 py-1.5 rounded-full text-black bg-white hover:bg-zinc-200 font-bold transition cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* SECTION: CONTACT INVITE */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Question heading */}
        <h2
          className="reveal text-2xl sm:text-3xl font-bold tracking-tight text-white/80"
          style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}
        >
          Tv ao vivo & Filmoteca só na
        </h2>

        {/* Giant CTA link with center-out underline */}
        <a
          href="#entrar"
          id="cursor-trail-cta-link"
          data-logomark="true"
          onClick={(e) => {
            e.preventDefault();
            onEnterPlayer();
          }}
          className="reveal cta-group font-logomark inline-block mt-4 max-w-full [overflow-wrap:break-word] text-[clamp(2.8rem,9vw,7.5rem)] leading-[1.05] text-[#ed3c5c] hover:text-[#ed3c5c]/85 transition-colors cursor-pointer"
          style={
            {
              '--reveal-delay': '0.25s',
              fontFamily: "'Brittany Signature', 'Brittany', 'Dancing Script', cursive",
              fontWeight: 400,
            } as React.CSSProperties
          }
          title="Clique para assistir diretamente na Worscoi"
        >
          Worscoi
          <span
            className="cta-underline block h-[3px] w-0 bg-[#ed3c5c]/80 mt-2 mx-auto transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            aria-hidden="true"
          />
        </a>

        {/* Botão de início rápido para a plataforma */}
        <div
          className="reveal mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ '--reveal-delay': '0.35s' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={() => onEnterPlayer()}
            className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          >
            Acessar TV & Filmoteca →
          </button>
          <button
            type="button"
            onClick={() => onOpenRegister()}
            className="px-4 py-2 text-xs text-zinc-300 hover:text-white underline underline-offset-4 cursor-pointer transition font-normal"
          >
            Começar teste grátis de 24h
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="reveal relative z-10 flex flex-wrap items-center justify-end gap-4 px-6 pb-9 sm:px-12 sm:pb-9 text-xs tracking-tight text-zinc-400 font-normal"
        style={
          {
            '--reveal-delay': '0.45s',
          } as React.CSSProperties
        }
      >
        {/* Hint (hidden below 640px) */}
        <p className="hidden sm:block select-none">
          ( move your cursor )
        </p>
      </footer>
    </main>
  );
}
