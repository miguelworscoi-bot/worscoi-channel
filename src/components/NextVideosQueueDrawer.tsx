'use client';
import React from 'react';
import {
  X,
  Play,
  ListVideo,
  History,
  Tv,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Canal } from '@/types';
import {
  AutoplayQueueService,
  QueueVideoItem,
  WatchHistoryEntry,
} from '@/services/autoplayQueueService';

interface NextVideosQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canalAtivo?: Canal | null;
  currentCanal?: Canal | null;
  streamIndex?: number;
  currentStreamIndex?: number;
  queue?: QueueVideoItem[];
  queueItems?: QueueVideoItem[];
  autoplayEnabled?: boolean;
  onToggleAutoplay?: (enabled: boolean) => void;
  onSelectQueueItem: (item: QueueVideoItem) => void;
  onClearHistory?: () => void;
}

export function NextVideosQueueDrawer({
  isOpen,
  onClose,
  canalAtivo,
  currentCanal,
  streamIndex: _streamIndex,
  currentStreamIndex: _currentStreamIndex,
  queue,
  queueItems,
  autoplayEnabled: controlledAutoplay,
  onToggleAutoplay,
  onSelectQueueItem,
  onClearHistory,
}: NextVideosQueueDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<'fila' | 'historico'>('fila');
  const [history, setHistory] = React.useState<WatchHistoryEntry[]>([]);
  const [localAutoplay, setLocalAutoplay] = React.useState<boolean>(() =>
    AutoplayQueueService.isAutoplayEnabled()
  );

  const activeCanal = currentCanal ?? canalAtivo;
  const activeQueue = queueItems ?? queue ?? [];
  const isAutoplayOn = typeof controlledAutoplay === 'boolean' ? controlledAutoplay : localAutoplay;

  const handleToggleAutoplay = () => {
    const nextVal = !isAutoplayOn;
    AutoplayQueueService.setAutoplayEnabled(nextVal);
    setLocalAutoplay(nextVal);
    onToggleAutoplay?.(nextVal);
  };

  const handleClearHistory = () => {
    AutoplayQueueService.clearHistory();
    setHistory([]);
    onClearHistory?.();
  };

  React.useEffect(() => {
    if (isOpen) {
      setHistory(AutoplayQueueService.getWatchHistory());
      setLocalAutoplay(AutoplayQueueService.isAutoplayEnabled());
    }
  }, [isOpen]);

  if (!isOpen || !activeCanal) return null;

  return (
    <div
      id="next-videos-queue-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[85vh] sm:max-h-[80vh] bg-[#0c0d12] border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* CABEÇALHO DA FILA */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-300">
              <ListVideo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Fila de Reprodução</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activeQueue.length} a seguir
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Próximos vídeos selecionados pelo criador e seu histórico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TOGGLE AUTOPLAY */}
            <label className="flex items-center gap-2 cursor-pointer select-none" title="Reproduzir próximo vídeo automaticamente">
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                Autoplay
              </span>
              <button
                type="button"
                onClick={handleToggleAutoplay}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer border ${
                  isAutoplayOn
                    ? 'bg-zinc-100 border-zinc-100'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full transition-transform ${
                    isAutoplayOn
                      ? 'translate-x-4 bg-zinc-950'
                      : 'translate-x-0.5 bg-zinc-400'
                  }`}
                />
              </button>
            </label>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS: A SEGUIR vs HISTÓRICO */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800/60 bg-[#0c0d12]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('fila')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'fila'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListVideo className="w-3.5 h-3.5" />
              <span>A Seguir ({activeQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'historico'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Assistidos Recentemente</span>
            </button>
          </div>

          {activeTab === 'historico' && history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-400 px-2 py-1 rounded-md transition cursor-pointer"
              title="Limpar histórico recente"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* LISTA DE VÍDEOS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {activeTab === 'fila' ? (
            activeQueue.length > 0 ? (
              activeQueue.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectQueueItem(item);
                    onClose();
                  }}
                  className="group flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/70 border border-zinc-800/60 hover:border-zinc-700 transition cursor-pointer select-none"
                >
                  <span className="text-xs font-mono font-medium text-zinc-500 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* THUMBNAIL */}
                  <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.isSameCreator ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Mesmo Criador
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Recomendado
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-400 truncate">
                        {item.creatorName}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0 mr-1 transition-colors" />
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs">
                <Tv className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p>Nenhum vídeo seguinte na fila deste canal.</p>
              </div>
            )
          ) : (
            history.length > 0 ? (
              history.map((hist, idx) => (
                <div
                  key={`${hist.url}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/50"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-zinc-300 truncate">
                      {hist.title}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {hist.creatorName}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs">
                <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p>Seu histórico recente de visualizações está vazio.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
