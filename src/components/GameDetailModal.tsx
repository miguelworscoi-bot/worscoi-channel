import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  X,
  ExternalLink,
  Flame,
  Heart,
  ThumbsUp,
  Store,
  CheckCircle2,
  Bell,
  Loader2,
  Play,
} from 'lucide-react';
import { GameDeal, StoreDealComparison, CurrencyCode } from '@/types';
import { formatCurrency, KNOWN_STORES } from '@/utils/constants';
import { fetchStoreComparisons } from '@/services/gamesApi';
import { getGameTrailer } from '@/utils/trailers';

interface GameDetailModalProps {
  deal: GameDeal | null;
  onClose: () => void;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: (deal: GameDeal, targetPrice?: number) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  deal,
  onClose,
  currency,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'trailer'>('prices');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [comparisons, setComparisons] = useState<StoreDealComparison[]>([]);
  const [loadingComparisons, setLoadingComparisons] = useState<boolean>(false);
  const [customAlertPrice, setCustomAlertPrice] = useState<string>('');
  const [alertSaved, setAlertSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!deal) return;
    setVideoError(false);

    // Fetch comparison prices for this game across stores
    setLoadingComparisons(true);
    fetchStoreComparisons(deal.title)
      .then((res) => {
        setComparisons(res);
      })
      .catch(() => {
        setComparisons([]);
      })
      .finally(() => {
        setLoadingComparisons(false);
      });

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deal, onClose]);

  if (!deal) return null;

  const storeMeta = KNOWN_STORES[deal.storeID];
  const directStoreUrl = deal.dealID
    ? `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
    : storeMeta?.url || 'https://store.steampowered.com';

  const handleSaveAlert = () => {
    const val = parseFloat(customAlertPrice);
    if (!isNaN(val) && val > 0) {
      onToggleWishlist(deal, val);
      setAlertSaved(true);
      setTimeout(() => setAlertSaved(false), 3000);
    }
  };

  return (
    <div
      id="game-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="game-detail-modal-content"
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-950 overflow-hidden">
          <img
            src={deal.banner || deal.thumb}
            alt={deal.title}
            className="w-full h-full object-cover opacity-60 filter blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating game cover & title inside banner */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-700 flex-shrink-0 shadow-2xl">
              <img src={deal.thumb} alt={deal.title} className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  -{deal.savings}% OFF
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {deal.storeName}
                </span>
                {deal.isHistoricalLow && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/90 border border-amber-600/60 px-2.5 py-0.5 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Menor Preço Histórico
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight truncate">
                {deal.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Price Box & Call to action */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Melhor Preço Encontrado Agora</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {deal.salePrice === 0 ? 'GRÁTIS' : formatCurrency(deal.salePrice, currency)}
                </span>
                {deal.savings > 0 && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatCurrency(deal.normalPrice, currency)}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-bold">
                  Economia de {formatCurrency(deal.normalPrice - deal.salePrice, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="modal-wishlist-btn"
                onClick={() => onToggleWishlist(deal)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title={isWishlisted ? 'Na Lista de Desejos' : 'Adicionar à Lista'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span className="text-xs font-semibold sm:hidden">Desejos</span>
              </button>

              <a
                id="modal-buy-direct-btn"
                href={directStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40"
              >
                <span>Ir para {deal.storeName}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Ratings & Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Metacritic</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                    (deal.metacriticScore || 0) >= 75
                      ? 'bg-emerald-600 text-white'
                      : (deal.metacriticScore || 0) >= 50
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deal.metacriticScore || '-'}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {deal.metacriticScore ? `${deal.metacriticScore}/100` : 'Sem nota'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Avaliações Steam</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-sky-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{deal.steamRatingPercent ? `${deal.steamRatingPercent}% Positivas` : 'Positivas'}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Menor Histórico</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {formatCurrency(deal.historicalLowPrice || deal.salePrice, currency)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">Status da Loja</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chave Oficial</span>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              id="tab-btn-prices"
              onClick={() => setActiveTab('prices')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'prices'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Comparativo de Lojas</span>
            </button>
            <button
              id="tab-btn-trailer"
              onClick={() => setActiveTab('trailer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trailer'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Trailer Oficial & Gameplay</span>
            </button>
          </div>

          {activeTab === 'trailer' ? (
            <div className="space-y-3">
              {(() => {
                const trailer = getGameTrailer(deal.title);
                return (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Play className="w-4 h-4 text-emerald-400" />
                        <span>Trailer Oficial &bull; {deal.title}</span>
                      </h4>
                      <a
                        href={trailer.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        <span>Assistir no YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner relative flex items-center justify-center">
                      {videoError ? (
                        <div className="text-center p-6 space-y-3">
                          <p className="text-sm text-slate-300 font-medium">
                            Não foi possível reproduzir o vídeo embutido diretamente.
                          </p>
                          <a
                            href={trailer.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-rose-950/50"
                          >
                            <span>Assistir Trailer no YouTube</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <ReactPlayer
                          src={trailer.videoUrl}
                          width="100%"
                          height="100%"
                          controls
                          onError={() => setVideoError(true)}
                        />
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            /* Store Price Comparison Table */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Comparativo de Preços entre Lojas Digitais</span>
                </h4>
                <span className="text-xs text-slate-400">Atualizado recentemente</span>
              </div>

              {loadingComparisons ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Consultando lojas oficiais em tempo real...</span>
                </div>
              ) : comparisons.length > 0 ? (
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/50">
                  {comparisons.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                          item.isBestPrice ? 'bg-emerald-950/30' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-bold text-slate-200">{item.storeName}</span>
                          {item.isBestPrice && (
                            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Melhor Preço
                            </span>
                          )}
                          {item.savings > 0 && (
                            <span className="text-emerald-400 font-semibold">-{item.savings}%</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-white text-sm">
                              {formatCurrency(item.price, currency)}
                            </span>
                            {item.retailPrice > item.price && (
                              <span className="text-[10px] text-slate-500 line-through block">
                                {formatCurrency(item.retailPrice, currency)}
                              </span>
                            )}
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                              item.isBestPrice
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            <span>Acessar</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhuma outra loja encontrada para este jogo no momento.
                </p>
              )}
            </div>
          )}

          {/* Price Alert Box */}
          <div className="bg-gradient-to-r from-slate-950 to-emerald-950/20 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Criar Alerta de Preço</h5>
                <p className="text-[11px] text-slate-400">
                  Defina um valor desejado para monitorar quedas de preço na sua lista
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-36">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  {currency === 'BRL' ? 'R$' : currency === 'EUR' ? '€' : '$'}
                </span>
                <input
                  id="target-price-input"
                  type="number"
                  step="0.01"
                  value={customAlertPrice}
                  onChange={(e) => setCustomAlertPrice(e.target.value)}
                  placeholder={String((deal.salePrice * 0.8).toFixed(2))}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="save-alert-btn"
                onClick={handleSaveAlert}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap transition-colors"
              >
                {alertSaved ? 'Salvo!' : 'Salvar Alerta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
