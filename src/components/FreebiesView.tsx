import React, { useState } from 'react';
import { Gift, ExternalLink, Clock } from 'lucide-react';
import { FreeGiveaway, CurrencyCode } from '@/types';
import { formatCurrency } from '@/utils/constants';

interface FreebiesViewProps {
  giveaways: FreeGiveaway[];
  currency: CurrencyCode;
}

export const FreebiesView: React.FC<FreebiesViewProps> = ({ giveaways, currency }) => {
  const [selectedStore, setSelectedStore] = useState<string>('all');

  const stores = ['all', 'Epic Games', 'Steam', 'GOG', 'Prime Gaming'];

  const filtered = giveaways.filter((gw) => {
    if (selectedStore === 'all') return true;
    return gw.store === selectedStore;
  });

  const totalWorth = giveaways.reduce((acc, curr) => acc + curr.worth, 0);

  return (
    <div id="freebies-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Jogos 100% Gratuitos & Giveaways Oficiais</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
              Jogos Grátis para Resgatar e Guardar para Sempre
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Acompanhamos semanalmente os jogos distribuídos gratuitamente pelas lojas oficiais (Epic Games Store, Steam, GOG e Prime Gaming).
            </p>
          </div>

          {/* Stat Box */}
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 text-center flex-shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Economia Total Disponível</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(totalWorth, currency)}
            </span>
            <span className="text-[10px] text-slate-500 block">em jogos gratuitos hoje</span>
          </div>
        </div>
      </div>

      {/* Store Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Filtrar por:
        </span>
        {stores.map((s) => (
          <button
            key={s}
            id={`filter-freebie-${s.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setSelectedStore(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStore === s
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {s === 'all' ? 'Todas as Distribuições' : s}
          </button>
        ))}
      </div>

      {/* Grid of Giveaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            id={`giveaway-card-${item.id}`}
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded shadow">
                  100% OFF
                </div>

                <div className="absolute top-2.5 right-2.5 bg-slate-950/80 border border-slate-700 text-slate-200 font-semibold text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {item.store}
                </div>

                {item.status === 'EXPIRING_SOON' && (
                  <div className="absolute bottom-2.5 left-2.5 bg-rose-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <Clock className="w-3 h-3" />
                    <span>Acaba em Breve</span>
                  </div>
                )}
                {item.status === 'UPCOMING' && (
                  <div className="absolute bottom-2.5 left-2.5 bg-sky-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <Clock className="w-3 h-3" />
                    <span>Em Breve</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">{item.platforms}</span>
                  <span className="text-xs text-slate-500 line-through">
                    {formatCurrency(item.worth, currency)}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {item.instructions && (
                  <div className="text-[11px] text-slate-500 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-semibold text-slate-300">Como pegar: </span>
                    {item.instructions}
                  </div>
                )}
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 pt-2 border-t border-slate-800/80">
              <a
                id={`claim-giveaway-btn-${item.id}`}
                href={item.openGiveawayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Resgatar Jogo Grátis</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
