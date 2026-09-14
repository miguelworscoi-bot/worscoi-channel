'use client';
import React from 'react';

interface WorscoiCardVisualProps {
  variant?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Visual do Cartão Vermelho Worscoi
 * Imagem 7: Vertical com anel giratório pontilhado no topo esquerdo e logotipo 'Worscoi' manuscrito vertical na base esquerda
 * Imagem 8: Horizontal com anel giratório na base esquerda e logotipo 'Worscoi' manuscrito na base direita
 */
export function WorscoiCardVisual({ variant = 'vertical', className = '' }: WorscoiCardVisualProps) {
  if (variant === 'horizontal') {
    return (
      <div
        id="worscoi-card-horizontal"
        className={`relative w-72 h-44 sm:w-80 sm:h-48 md:w-96 md:h-56 rounded-3xl bg-[#FF2D55] text-white p-5 sm:p-6 flex flex-col justify-between shadow-2xl shadow-[#FF2D55]/30 select-none overflow-hidden transition-all duration-300 hover:scale-[1.02] ${className}`}
      >
        {/* Reflexo sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Topo vazio ou limpo como na imagem 8 */}
        <div className="w-full flex justify-between items-start" />

        {/* Rodapé do cartão: Anel giratório na esquerda + Logo Worscoi manuscrito na direita */}
        <div className="w-full flex items-end justify-between relative z-10">
          {/* Anel de pontinhos brancos giratórios */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white animate-spin"
              style={{ animationDuration: '6s' }}
              viewBox="0 0 36 36"
              fill="none"
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray="3 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Logotipo manuscrito Worscoi em branco */}
          <span
            data-logomark="true"
            style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
            className="text-3xl sm:text-4xl text-white font-bold tracking-wide font-logomark logomark-font select-none"
          >
            Worscoi
          </span>
        </div>
      </div>
    );
  }

  // Variant: Vertical (Imagem 7)
  return (
    <div
      id="worscoi-card-vertical"
      className={`relative w-60 h-[380px] sm:w-64 sm:h-[410px] md:w-72 md:h-[450px] rounded-[32px] bg-[#FF2D55] text-white p-6 flex flex-col justify-between shadow-2xl shadow-[#FF2D55]/30 select-none overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Reflexo suave no cartão */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10 pointer-events-none" />

      {/* Topo esquerdo: Anel de pontinhos brancos giratórios (Imagem 7) */}
      <div className="relative z-10">
        <div className="w-9 h-9 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white animate-spin"
            style={{ animationDuration: '6s' }}
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray="3.5 4.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Base esquerda: Logotipo Worscoi em tipografia cursiva virado na vertical (Imagem 7) */}
      <div className="relative z-10 flex items-start pl-1 pb-4">
        <span
          data-logomark="true"
          style={{
            fontFamily: "'Caveat', 'Dancing Script', cursive",
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
          className="text-3xl sm:text-4xl text-white font-bold tracking-wider font-logomark logomark-font select-none"
        >
          Worscoi
        </span>
      </div>
    </div>
  );
}
