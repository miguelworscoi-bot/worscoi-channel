'use client';
import React, { useEffect, useState } from 'react';
import { Play, X, RotateCcw, ListVideo } from 'lucide-react';
import { QueueVideoItem } from '@/services/autoplayQueueService';

interface NextVideoAutoplayOverlayProps {
  isOpen?: boolean;
  nextItem?: QueueVideoItem | null;
  nextVideo?: QueueVideoItem | null;
  countdownSeconds?: number;
  onPlayNow: (item?: QueueVideoItem) => void;
  onCancel: () => void;
  onOpenQueue?: () => void;
  onReplayCurrent?: () => void;
}

export function NextVideoAutoplayOverlay({
  isOpen,
  nextItem,
  nextVideo,
  countdownSeconds = 6,
  onPlayNow,
  onCancel,
  onOpenQueue,
  onReplayCurrent,
}: NextVideoAutoplayOverlayProps) {
  const target = nextItem ?? nextVideo;
  const isActuallyOpen = typeof isOpen === 'boolean' ? isOpen : Boolean(target);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!isActuallyOpen || !target) return;
    setSecondsLeft(countdownSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onPlayNow(target);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds, onPlayNow, isActuallyOpen, target]);

  if (!isActuallyOpen || !target) return null;

  const progressPercent = ((countdownSeconds - secondsLeft) / countdownSeconds) * 100;

  return (
    <div
      id="autoplay-next-overlay"
      className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="max-w-md w-full bg-[#0e0f15] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-1.5 text-zinc-400 font-normal text-xs">
            <span>Próximo vídeo automático</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
            title="Cancelar reprodução automática"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THUMBNAIL DO PRÓXIMO VÍDEO COM CONTADOR */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4 shadow-inner group">
          <img
            src={target.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 text-left">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700 inline-block mb-1">
                {target.isSameCreator ? 'Mesmo Criador' : 'Recomendado'}
              </span>
              <p className="text-xs font-bold text-white line-clamp-1">
                {target.title}
              </p>
              <p className="text-[11px] text-zinc-400 font-normal">
                {target.creatorName}
              </p>
            </div>
          </div>

          {/* BADGE DE CONTAGEM */}
          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {secondsLeft}s
          </div>
        </div>

        {/* BARRA DE PROGRESSO TEMPORAL */}
        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mb-5">
          <div
            className="bg-white h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => onPlayNow(target)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Assistir Agora ({secondsLeft}s)</span>
          </button>

          {onOpenQueue && (
            <button
              type="button"
              onClick={onOpenQueue}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Ver fila de reprodução"
            >
              <ListVideo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fila</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs transition cursor-pointer"
          >
            Cancelar
          </button>

          {onReplayCurrent && (
            <button
              type="button"
              onClick={onReplayCurrent}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition cursor-pointer"
              title="Repetir vídeo atual"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
