import React from 'react';
import { Sparkles, Gift, Tag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { GameDeal, FreeGiveaway, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/constants';

interface HeroBannerProps {
  topDeal?: GameDeal;
  topGiveaway?: FreeGiveaway;
  currency: CurrencyCode;
  onSelectDeal: (deal: GameDeal) => void;
  onGoToFreebies: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  topDeal,
  topGiveaway,
  currency,
  onSelectDeal,
  onGoToFreebies,
}) => {
  return (
    <div id="hero-banner" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-5 sm:p-7 mb-8 shadow-xl">
      {/* Background glow dots */}
      <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Heading & Value props */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Monitoramento em Tempo Real de Preços</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3 font-['Space_Grotesk']">
            Compare preços, ache descontos e nunca mais perca um <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">jogo grátis</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5 max-w-xl">
            Rastreamos as maiores lojas digitais (Steam, Epic Games Store, GOG, Humble Store, Fanatical e consoles). Economize com histórico de menores preços e alertas de promoção.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Apenas lojas oficiais & chaves legítimas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Conversão automática de moedas</span>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Cards (Giveaway & Best Deal) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          {/* Top Giveaway Highlight */}
          {topGiveaway && (
            <div 
              id="highlight-giveaway-card"
              onClick={onGoToFreebies}
              className="group cursor-pointer bg-slate-950/80 hover:bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-3.5 transition-all duration-200 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                      100% Grátis • {topGiveaway.store}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate mt-0.5">
                    {topGiveaway.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Economize {formatCurrency(topGiveaway.worth, currency)}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Top Deal Highlight */}
          {topDeal && (
            <div 
              id="highlight-deal-card"
              onClick={() => onSelectDeal(topDeal)}
              className="group cursor-pointer bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all duration-200 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded">
                      Destaque • -{topDeal.savings}%
                    </span>
                    <span className="text-[10px] text-slate-400">{topDeal.storeName}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate mt-0.5">
                    {topDeal.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-semibold truncate">
                    {formatCurrency(topDeal.salePrice, currency)}{' '}
                    <span className="line-through text-slate-500 text-[10px] font-normal">
                      {formatCurrency(topDeal.normalPrice, currency)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
