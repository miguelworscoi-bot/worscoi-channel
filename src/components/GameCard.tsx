import React, { useState } from 'react';
import { Heart, Flame, ThumbsUp, Scale } from 'lucide-react';
import { GameDeal, CurrencyCode } from '@/types';
import { formatCurrency, KNOWN_STORES } from '@/utils/constants';

interface GameCardProps {
  deal: GameDeal;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: (deal: GameDeal) => void;
  onOpenDetails: (deal: GameDeal) => void;
  viewMode?: 'grid' | 'list';
}

export const GameCard: React.FC<GameCardProps> = ({
  deal,
  currency,
  isWishlisted,
  onToggleWishlist,
  onOpenDetails,
  viewMode = 'grid',
}) => {
  const [imgSrc, setImgSrc] = useState(
    deal.thumb || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
  );

  const storeMeta = KNOWN_STORES[deal.storeID];
  const storeBadgeClass = storeMeta ? storeMeta.badgeColor : 'bg-slate-800 text-slate-300 border-slate-700';

  if (viewMode === 'list') {
    return (
      <div
        id={`deal-row-${deal.id}`}
        className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 sm:p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {/* Left: Thumbnail & Title Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer" onClick={() => onOpenDetails(deal)}>
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-800">
            <img
              src={imgSrc}
              alt={deal.title}
              onError={() =>
                setImgSrc('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80')
              }
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {deal.savings > 0 && (
              <div className="absolute top-1 left-1 bg-emerald-500 text-slate-950 font-black text-[10px] px-1 py-0.5 rounded shadow">
                -{deal.savings}%
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${storeBadgeClass}`}>
                {deal.storeName}
              </span>
              {deal.isHistoricalLow && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/50 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Menor Histórico
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
              {deal.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              {deal.metacriticScore && deal.metacriticScore > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                  <span
                    className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                      deal.metacriticScore >= 75
                        ? 'bg-emerald-600 text-white'
                        : deal.metacriticScore >= 50
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {deal.metacriticScore}
                  </span>
                  <span>Metascore</span>
                </span>
              )}
              {deal.steamRatingPercent && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <ThumbsUp className="w-3 h-3 text-sky-400" />
                  <span>{deal.steamRatingPercent}% positivas</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Pricing and Action */}
        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="text-left sm:text-right">
            {deal.savings > 0 && (
              <div className="text-xs text-slate-500 line-through">
                {formatCurrency(deal.normalPrice, currency)}
              </div>
            )}
            <div className="text-base sm:text-lg font-extrabold text-white">
              {deal.salePrice === 0 ? (
                <span className="text-emerald-400">GRÁTIS</span>
              ) : (
                formatCurrency(deal.salePrice, currency)
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`wishlist-toggle-${deal.id}`}
              onClick={() => onToggleWishlist(deal)}
              className={`p-2 rounded-lg border transition-colors ${
                isWishlisted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-rose-400 hover:border-slate-700'
              }`}
              title={isWishlisted ? 'Remover dos Desejos' : 'Adicionar aos Desejos'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              id={`details-btn-${deal.id}`}
              onClick={() => onOpenDetails(deal)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode
  return (
    <div
      id={`deal-card-${deal.id}`}
      className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl overflow-hidden transition-all duration-200 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20"
    >
      {/* Thumbnail */}
      <div
        className="relative w-full h-44 bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(deal)}
      >
        <img
          src={imgSrc}
          alt={deal.title}
          onError={() =>
            setImgSrc('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80')
          }
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Discount Badge */}
        {deal.savings > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded shadow-md">
            -{deal.savings}%
          </div>
        )}

        {/* Historical Low Badge */}
        {deal.isHistoricalLow && (
          <div className="absolute top-2.5 right-2.5 bg-amber-950/90 border border-amber-600/60 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm shadow">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Menor Preço</span>
          </div>
        )}

        {/* Wishlist quick button */}
        <button
          id={`wishlist-toggle-grid-${deal.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(deal);
          }}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
            isWishlisted
              ? 'bg-rose-600 text-white'
              : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={isWishlisted ? 'Remover dos Desejos' : 'Adicionar aos Desejos'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Metacritic rating on bottom left */}
        {deal.metacriticScore && deal.metacriticScore > 0 && (
          <div
            className={`absolute bottom-2.5 left-2.5 px-1.5 py-0.5 rounded text-[11px] font-bold text-white shadow ${
              deal.metacriticScore >= 75
                ? 'bg-emerald-600'
                : deal.metacriticScore >= 50
                ? 'bg-amber-600'
                : 'bg-rose-600'
            }`}
            title={`Nota Metacritic: ${deal.metacriticScore}`}
          >
            {deal.metacriticScore}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Store Name Pill */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${storeBadgeClass}`}>
              {deal.storeName}
            </span>
            {deal.steamRatingPercent && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-sky-400" />
                <span>{deal.steamRatingPercent}%</span>
              </span>
            )}
          </div>

          <h3
            onClick={() => onOpenDetails(deal)}
            className="font-bold text-sm text-white hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer mb-2"
            title={deal.title}
          >
            {deal.title}
          </h3>
        </div>

        {/* Pricing Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            {deal.savings > 0 && (
              <span className="text-[11px] text-slate-500 line-through block leading-tight">
                {formatCurrency(deal.normalPrice, currency)}
              </span>
            )}
            <div className="text-base font-extrabold text-white">
              {deal.salePrice === 0 ? (
                <span className="text-emerald-400">GRÁTIS</span>
              ) : (
                formatCurrency(deal.salePrice, currency)
              )}
            </div>
          </div>

          <button
            id={`open-modal-grid-${deal.id}`}
            onClick={() => onOpenDetails(deal)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Ver</span>
          </button>
        </div>
      </div>
    </div>
  );
};
