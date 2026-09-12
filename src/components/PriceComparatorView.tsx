import React, { useState, useEffect } from 'react';
import { Search, Scale, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { CurrencyCode, StoreDealComparison } from '@/types';
import { formatCurrency } from '@/utils/constants';
import { fetchStoreComparisons } from '@/services/gamesApi';

interface PriceComparatorViewProps {
  currency: CurrencyCode;
}

const POPULAR_GAMES_LIST = [
  'Elden Ring',
  'Cyberpunk 2077',
  "Baldur's Gate 3",
  'Resident Evil 4',
  'Red Dead Redemption 2',
  'The Witcher 3',
  'Grand Theft Auto V',
  'Black Myth: Wukong',
  'Hades II',
  'Helldivers 2',
  'Dave the Diver',
  'Hogwarts Legacy',
];

export const PriceComparatorView: React.FC<PriceComparatorViewProps> = ({ currency }) => {
  const [selectedGame, setSelectedGame] = useState<string>('Elden Ring');
  const [searchInput, setSearchInput] = useState<string>('');
  const [comparisons, setComparisons] = useState<StoreDealComparison[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadComparison(selectedGame);
  }, [selectedGame]);

  const loadComparison = async (gameName: string) => {
    setIsLoading(true);
    try {
      const data = await fetchStoreComparisons(gameName);
      setComparisons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedGame(searchInput.trim());
    }
  };

  const bestDeal = comparisons.find((c) => c.isBestPrice) || comparisons[0];
  const maxPrice = Math.max(...comparisons.map((c) => c.price), 1);
  const minPrice = Math.min(...comparisons.map((c) => c.price), 1);
  const potentialSavings = maxPrice - minPrice;

  return (
    <div id="price-comparator-view" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Scale className="w-4 h-4" />
          <span>Comparador Multi-Lojas</span>
        </div>
        <h2 className="text-2xl font-black text-white font-['Space_Grotesk']">
          Compare Preços entre Steam, Epic, GOG e Mais
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Descubra onde comprar seu jogo favorito pelo menor preço garantido, sem pagar a mais por comprar na loja errada.
        </p>

        {/* Search input for comparison */}
        <form onSubmit={handleSearchSubmit} className="mt-5 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="comparator-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Digite o nome de qualquer jogo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            id="comparator-search-btn"
            type="submit"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-colors whitespace-nowrap shadow-md"
          >
            Comparar
          </button>
        </form>

        {/* Popular chips */}
        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Mais buscados:</span>
          {POPULAR_GAMES_LIST.slice(0, 7).map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedGame === game
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Results Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Resultado da comparação para:</span>
            <h3 className="text-xl font-extrabold text-white">{selectedGame}</h3>
          </div>

          {bestDeal && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 px-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 block font-semibold">
                  Melhor Escolha: {bestDeal.storeName}
                </span>
                <span className="text-base font-black text-white">
                  {formatCurrency(bestDeal.price, currency)}
                </span>
                {potentialSavings > 0 && (
                  <span className="text-[11px] text-slate-400 block">
                    (Economia de até {formatCurrency(potentialSavings, currency)})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Store Comparison Grid / Table */}
        <div className="mt-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              <span className="text-sm">Consultando lojas oficiais em tempo real...</span>
            </div>
          ) : comparisons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisons.map((store, idx) => (
                <div
                  key={idx}
                  id={`comparison-store-card-${idx}`}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    store.isBestPrice
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {store.storeName}
                      </span>
                      {store.isBestPrice && (
                        <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Menor Preço
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {store.savings > 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          Desconto de {store.savings}%
                        </span>
                      ) : (
                        <span className="text-slate-400">Preço Padrão</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      {store.retailPrice > store.price && (
                        <span className="text-xs text-slate-500 line-through block">
                          {formatCurrency(store.retailPrice, currency)}
                        </span>
                      )}
                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(store.price, currency)}
                      </span>
                    </div>

                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        store.isBestPrice
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>Ir à Loja</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhuma oferta encontrada para este título no momento. Tente outro nome.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
