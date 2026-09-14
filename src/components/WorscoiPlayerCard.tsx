'use client';
import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Music,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  Tv,
  Send,
  X,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { getChannelHandle, isChannelVerified } from '@/utils/channelUtils';
import { getSafeStreamUrl, isStreamAutoProxied } from '@/utils/streamUtils';

interface WorscoiPlayerCardProps {
  canalAtivo: Canal | null;
  streamIndex: number;
  onStreamChange?: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  useProxy: boolean;
  onToggleProxy?: () => void;
  latencyMode: LatencyMode;
  onToggleLatencyMode: (mode?: LatencyMode) => void;
  onEnterCinemaMode: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onNextCanal: () => void;
  onPrevCanal: () => void;
  failoverNotice: string | null;
  onPlayerError: (error: unknown) => void;
  onVideoEnded?: () => void;
}

export function WorscoiPlayerCard({
  canalAtivo,
  streamIndex,
  onStreamChange: _onStreamChange,
  isMuted,
  onToggleMute,
  useProxy,
  onToggleProxy: _onToggleProxy,
  latencyMode,
  onToggleLatencyMode,
  onEnterCinemaMode,
  isFavorited,
  onToggleFavorite,
  onNextCanal,
  onPrevCanal,
  failoverNotice,
  onPlayerError,
  onVideoEnded,
}: WorscoiPlayerCardProps) {
  const [liked, setLiked] = useState(false);
  const likesCount = '1.8M';
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<
    Array<{ id: string; user: string; text: string; time: string }>
  >([
    { id: '1', user: 'carlos_futebol', text: 'Transmissão incrível e sem travar! 🔥', time: '2m' },
    { id: '2', user: 'mateus_silva', text: 'Melhor qualidade de imagem que já vi.', time: '5m' },
    { id: '3', user: 'lucas_sp', text: 'Esse canal tá voando hoje!', time: '12m' },
  ]);

  const streams = [canalAtivo?.url || '', ...(canalAtivo?.backupUrls || [])].filter(Boolean);
  const currentStreamUrl = streams[streamIndex] || canalAtivo?.url || '';

  const isYouTube =
    currentStreamUrl.includes('youtube.com') ||
    currentStreamUrl.includes('youtu.be') ||
    canalAtivo?.categoria === 'YouTube' ||
    canalAtivo?.rede === 'YouTube';

  const finalStreamUrl = isYouTube
    ? currentStreamUrl
    : useProxy || isStreamAutoProxied(currentStreamUrl)
    ? getSafeStreamUrl(currentStreamUrl, true)
    : currentStreamUrl;

  const handle = canalAtivo?.handle || (canalAtivo ? getChannelHandle(canalAtivo) : 'worscoi');
  const verified = canalAtivo ? isChannelVerified(canalAtivo) : false;
  const hashtags = canalAtivo?.hashtags || ['#aovivo', '#worscoi', '#futebol'];
  const soundtrack =
    canalAtivo?.soundtrack ||
    `original sound - ${handle}`;

  const toggleLike = () => {
    setLiked(!liked);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList([
      ...commentsList,
      {
        id: Date.now().toString(),
        user: 'você',
        text: commentInput.trim(),
        time: 'agora',
      },
    ]);
    setCommentInput('');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* CARD PRINCIPAL DO PLAYER */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#0A0A0C] border border-zinc-850 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex items-center justify-center group">
        {/* REPRODUTOR DE VÍDEO / STREAM */}
        {canalAtivo ? (
          <div className="relative w-full h-full bg-black">
            {React.createElement(
              ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>,
              {
                key: `${canalAtivo.id || canalAtivo.url}-${streamIndex}-${useProxy}`,
                url: finalStreamUrl,
                playing: true,
                muted: isMuted,
                controls: false,
                width: '100%',
                height: '100%',
                onError: onPlayerError,
                onEnded: onVideoEnded,
                playsinline: true,
                config: {
                  file: {
                    forceHLS:
                      !isYouTube &&
                      (finalStreamUrl.includes('.m3u8') || finalStreamUrl.includes('/api/proxy')),
                    attributes: {
                      playsInline: true,
                      crossOrigin: 'anonymous',
                    },
                  },
                  youtube: {
                    rel: 0,
                  },
                },
              }
            )}

            {/* BOTÃO MUTE DISCRETO NO TOPO ESQUERDO */}
            <button
              type="button"
              onClick={onToggleMute}
              className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition cursor-pointer"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* FAILOVER NOTICE CASO OCORRA */}
            {failoverNotice && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-zinc-900/90 text-xs text-zinc-200 border border-zinc-700 backdrop-blur-md flex items-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{failoverNotice}</span>
              </div>
            )}

            {/* BARRA LATERAL SOCIAL DIREITA (TIKTOK / REELS / STREAM STYLE) */}
            <div className="absolute right-3.5 bottom-16 sm:bottom-20 z-20 flex flex-col items-center gap-4">
              {/* AVATAR DO CRIADOR / CANAL COM ANEL GRADIENTE */}
              <div className="relative cursor-pointer group/avatar">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#FF2D55] via-purple-500 to-amber-400 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                    {canalAtivo.logo ? (
                      <img
                        src={canalAtivo.logo}
                        alt={canalAtivo.nome}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Tv className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
                {/* Botão seguir (+) pequenino */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF2D55] text-white flex items-center justify-center text-[11px] font-black shadow-sm">
                  +
                </div>
              </div>

              {/* BOTÃO DE LIKE (CORAÇÃO) */}
              <button
                type="button"
                onClick={toggleLike}
                className="flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-110 active:scale-95 transition"
                title="Gostei"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    liked ? 'bg-rose-500/20 text-[#FF2D55]' : 'bg-black/50 text-white'
                  } backdrop-blur-md border border-white/10`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      liked ? 'fill-[#FF2D55] text-[#FF2D55]' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-200">
                  {liked ? '1.9M' : canalAtivo.likesCount || likesCount}
                </span>
              </button>

              {/* BOTÃO DE COMENTÁRIOS / CHAT */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-110 active:scale-95 transition"
                title="Comentários e Chat"
              >
                <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-zinc-200">
                  {canalAtivo.commentsCount || '6605'}
                </span>
              </button>

              {/* BOTÃO DE SALVAR / FAVORITAR */}
              <button
                type="button"
                onClick={onToggleFavorite}
                className="flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-110 active:scale-95 transition"
                title={isFavorited ? 'Remover dos favoritos' : 'Favoritar canal'}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isFavorited
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-black/50 text-white border-white/10'
                  } backdrop-blur-md border`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      isFavorited ? 'fill-amber-400 text-amber-400' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-200">Salvar</span>
              </button>
            </div>

            {/* OVERLAY INFERIOR: HANDLE, HASHTAGS E SOUNDTRACK */}
            <div className="absolute left-4 sm:left-6 bottom-4 z-20 max-w-[70%] text-left space-y-1 drop-shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  @{handle}
                </span>
                {verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] fill-[#38bdf8]/20" />
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-medium line-clamp-1">
                {canalAtivo.nome}{' '}
                <span className="text-zinc-400 font-normal">
                  {hashtags.join(' ')}
                </span>
              </p>

              {/* PILL DE ÁUDIO / SOUNDTRACK */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300">
                <Music className="w-3 h-3 text-[#FF2D55] animate-spin" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{soundtrack}</span>
              </div>
            </div>

            {/* GRADIENT SHADOW NA PARTE INFERIOR PARA MÁXIMA LEGIBILIDADE */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-zinc-500">
            <Tv className="w-12 h-12 mb-2 text-zinc-700 animate-pulse" />
            <p className="text-sm font-semibold">Nenhum canal selecionado</p>
          </div>
        )}

        {/* DRAWER / MODAL LATERAL DE COMENTÁRIOS */}
        {isCommentsOpen && (
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-[#0E0E12]/95 backdrop-blur-xl border-l border-zinc-800 z-30 flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-200">Comentários (6605)</span>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3">
              {commentsList.map((c) => (
                <div key={c.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-300">@{c.user}</span>
                    <span className="text-[10px] text-zinc-500">{c.time}</span>
                  </div>
                  <p className="text-zinc-400">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 bg-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 rounded-full px-3 py-2 border border-zinc-800 focus:outline-none focus:border-zinc-700"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-[#FF2D55] text-white hover:opacity-90 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CONTROLES INFERIORES: MODO CINEMA, POUPAR INTERNET E BOTÕES CHEVRON */}
      <div className="w-full flex items-center justify-between mt-4 px-1">
        {/* LADO ESQUERDO: BOTÃO MODO CINEMA E POUPAR INTERNET */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={onEnterCinemaMode}
            className="px-4 py-2 rounded-full bg-[#141418] hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Modo Cinema</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleLatencyMode()}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              latencyMode === 'economy'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : latencyMode === 'stable'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title="Alternar economia de internet e latência"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>
              {latencyMode === 'economy'
                ? 'Poupar Internet -75%'
                : latencyMode === 'stable'
                ? 'Modo Estável HD'
                : 'Baixa Latência'}
            </span>
          </button>
        </div>

        {/* LADO DIREITO/CENTRO: BOTÕES CHEVRON < E > PARA ZAPPING DE CANAL */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevCanal}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-sm"
            title="Canal anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNextCanal}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-sm"
            title="Próximo canal"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
