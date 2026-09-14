import React from 'react';
import { Heart, Trash2, ExternalLink, Bell, ArrowRight } from 'lucide-react';
import { WishlistItem, CurrencyCode } from '@/types';
import { formatCurrency } from '@/utils/constants';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  currency: CurrencyCode;
  onRemoveItem: (id: string) => void;
  onClearWishlist: () => void;
  onGoToDeals: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  currency,
  onRemoveItem,
  onClearWishlist,
  onGoToDeals,
}) => {
  const totalCost = wishlist.reduce((acc, curr) => acc + curr.currentPrice, 0);
  const totalRetail = wishlist.reduce((acc, curr) => acc + curr.normalPrice, 0);
  const totalSavings = totalRetail - totalCost;

  if (wishlist.length === 0) {
    return (
      <div id="empty-wishlist-state" className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Sua Lista de Desejos está vazia
        </h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Clique no ícone de coração nos jogos que você quer monitorar. Avisaremos quando entrarem em promoção ou atingirem o menor preço histórico!
        </p>
        <button
          id="explore-deals-empty-btn"
          onClick={onGoToDeals}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40"
        >
          <span>Explorar Promoções</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div id="wishlist-view-container" className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 font-semibold text-xs mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>{wishlist.length} {wishlist.length === 1 ? 'jogo salvo' : 'jogos salvos'}</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Sua Lista de Desejos e Alertas
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Todos os jogos salvos são mantidos no seu navegador para acompanhamento de preços.
            </p>
          </div>

          {/* Action buttons & Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 px-4 text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Economia Total Atual</span>
              <span className="text-xl font-black text-emerald-400">
                {formatCurrency(totalSavings, currency)}
              </span>
            </div>

            <button
              id="clear-all-wishlist-btn"
              onClick={onClearWishlist}
              className="p-2.5 bg-slate-950 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 rounded-xl text-xs font-semibold transition-colors"
              title="Limpar todos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {wishlist.map((item) => (
          <div
            key={item.id}
            id={`wishlist-item-${item.id}`}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          >
            {/* Game Info */}
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={item.thumb}
                alt={item.title}
                className="w-16 h-20 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.storeName}
                  </span>
                  {item.savings > 0 && (
                    <span className="text-xs font-bold text-emerald-400">
                      -{item.savings}% OFF
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white truncate">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Adicionado em {item.addedAt}</span>
                  {item.targetPrice && (
                    <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                      <Bell className="w-3 h-3" />
                      Alerta: {formatCurrency(item.targetPrice, currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-left sm:text-right">
                {item.savings > 0 && (
                  <span className="text-xs text-slate-500 line-through block">
                    {formatCurrency(item.normalPrice, currency)}
                  </span>
                )}
                <span className="text-lg font-black text-white">
                  {formatCurrency(item.currentPrice, currency)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.cheapshark.com/redirect?dealID=${item.dealID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Comprar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  id={`remove-wishlist-${item.id}`}
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
