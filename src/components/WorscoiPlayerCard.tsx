'use client';
import React, { useState, useEffect } from 'react';
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
  Trash2,
} from 'lucide-react';
import { Canal, LatencyMode } from '@/types';
import { getChannelHandle, isChannelVerified } from '@/utils/channelUtils';
import { getSafeStreamUrl, isStreamAutoProxied } from '@/utils/streamUtils';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';
import { useAuth } from '@/context/AuthContext';
import {
  getVideoItemSlug,
  subscribeChannelStats,
  toggleChannelAdoro,
  subscribeChannelComments,
  addChannelComment,
  deleteChannelComment,
  formatInteractionCount,
  formatRelativeTime,
  getEffectiveVisitorId,
  ChannelComment,
} from '@/services/channelInteractionsService';

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
  const { userProfile, isAdmin } = useAuth();
  const [liked, setLiked] = useState(false);
  const [adorosCount, setAdorosCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<ChannelComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const streams = [canalAtivo?.url || '', ...(canalAtivo?.backupUrls || [])].filter(Boolean);
  const currentStreamUrl = streams[streamIndex] || canalAtivo?.url || '';

  useEffect(() => {
    if (!canalAtivo) {
      setLiked(false);
      setAdorosCount(0);
      setCommentsCount(0);
      setCommentsList([]);
      return;
    }

    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, currentStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);

    // Consulta em tempo real (onSnapshot) ao Firestore para o vídeo selecionado
    const unsubStats = subscribeChannelStats(videoSlug, effectiveUserId, (stats) => {
      setLiked(stats.userHasAdorado);
      setAdorosCount(stats.adorosCount);
      setCommentsCount(stats.commentsCount);
    });

    const unsubComments = subscribeChannelComments(videoSlug, (comments) => {
      setCommentsList(comments);
    });

    return () => {
      unsubStats();
      unsubComments();
    };
  }, [canalAtivo?.id, canalAtivo?.nome, streamIndex, currentStreamUrl, userProfile?.id]);

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

  const toggleLike = async () => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, currentStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const res = await toggleChannelAdoro(videoSlug, canalAtivo.nome, effectiveUserId);
    setLiked(res.userHasAdorado);
    setAdorosCount(res.adorosCount);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !canalAtivo || isSubmitting) return;

    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, currentStreamUrl);
    const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
    const effectiveUserName =
      userProfile?.displayName ||
      (userProfile?.email ? userProfile.email.split('@')[0] : 'Assinante');
    const effectiveUserPhoto = userProfile?.photoURL || null;
    const effectiveUserPlan = userProfile?.planName || userProfile?.plan || null;

    const text = commentInput.trim();
    setCommentInput('');
    setIsSubmitting(true);

    try {
      await addChannelComment({
        channelSlug: videoSlug,
        channelName: canalAtivo.nome,
        userId: effectiveUserId,
        userName: effectiveUserName,
        userPhoto: effectiveUserPhoto,
        userPlan: effectiveUserPlan,
        text,
      });
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!canalAtivo) return;
    const videoSlug = getVideoItemSlug(canalAtivo, streamIndex, currentStreamUrl);
    try {
      await deleteChannelComment(commentId, videoSlug);
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
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
              <div className="relative cursor-pointer group/avatar transition-transform duration-200 hover:scale-115 active:scale-95">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#FF2D55] via-purple-500 to-amber-400 flex items-center justify-center shadow-lg group-hover/avatar:shadow-[0_0_12px_rgba(255,45,85,0.5)] transition-all duration-200">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                    <img
                      src={getChannelLogo(canalAtivo)}
                      alt={canalAtivo.nome}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover/avatar:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getChannelFallbackLogo(canalAtivo);
                      }}
                    />
                  </div>
                </div>
                {/* Botão seguir (+) pequenino com animação */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF2D55] text-white flex items-center justify-center text-[11px] font-black shadow-md transition-transform duration-200 group-hover/avatar:scale-120 group-hover/avatar:rotate-90">
                  +
                </div>
              </div>

              {/* BOTÃO DE LIKE (CORAÇÃO / ADORO) REAL COM TIKTOK POP */}
              <button
                type="button"
                onClick={toggleLike}
                className="group/btn flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-120 active:scale-90 transition-all duration-200"
                title={liked ? 'Remover Adoro' : 'Dar Adoro'}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    liked
                      ? 'bg-rose-500/25 text-[#FF2D55] border-rose-500/50 shadow-[0_0_12px_rgba(255,45,85,0.4)]'
                      : 'bg-black/60 text-white border-white/15 group-hover/btn:border-white/30 group-hover/btn:bg-black/80'
                  } backdrop-blur-md border transition-all duration-200 group-hover/btn:scale-110`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 group-hover/btn:scale-120 group-hover/btn:rotate-6 ${
                      liked ? 'fill-[#FF2D55] text-[#FF2D55]' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-200 drop-shadow-sm group-hover/btn:text-white transition-colors">
                  {formatInteractionCount(adorosCount)}
                </span>
              </button>

              {/* BOTÃO DE COMENTÁRIOS REAL COM TIKTOK POP */}
              <button
                type="button"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="group/btn flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-120 active:scale-90 transition-all duration-200"
                title="Comentários ao Vivo"
              >
                <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 group-hover/btn:border-white/30 group-hover/btn:bg-black/80 flex items-center justify-center text-white transition-all duration-200 group-hover/btn:scale-110">
                  <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover/btn:scale-120 group-hover/btn:-rotate-6" />
                </div>
                <span className="text-[10px] font-bold text-zinc-200 drop-shadow-sm group-hover/btn:text-white transition-colors">
                  {formatInteractionCount(commentsCount)}
                </span>
              </button>

              {/* BOTÃO DE SALVAR / FAVORITAR COM TIKTOK POP */}
              <button
                type="button"
                onClick={onToggleFavorite}
                className="group/btn flex flex-col items-center gap-0.5 cursor-pointer text-white hover:scale-120 active:scale-90 transition-all duration-200"
                title={isFavorited ? 'Remover dos favoritos' : 'Favoritar canal'}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isFavorited
                      ? 'bg-amber-500/25 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'bg-black/60 text-white border-white/15 group-hover/btn:border-white/30 group-hover/btn:bg-black/80'
                  } backdrop-blur-md border transition-all duration-200 group-hover/btn:scale-110`}
                >
                  <Bookmark
                    className={`w-5 h-5 transition-transform duration-200 group-hover/btn:scale-120 group-hover/btn:rotate-6 ${
                      isFavorited ? 'fill-amber-400 text-amber-400' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-200 drop-shadow-sm group-hover/btn:text-white transition-colors">Salvar</span>
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

        {/* DRAWER / MODAL LATERAL DE COMENTÁRIOS REAIS */}
        {isCommentsOpen && (
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-[#0E0E12]/95 backdrop-blur-xl border-l border-zinc-800 z-30 flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#FF2D55]" />
                <span className="text-xs font-bold text-zinc-200">
                  Comentários ({commentsList.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200 hover:scale-120 hover:rotate-90 active:scale-90 cursor-pointer"
                title="Fechar comentários"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-2.5">
              {commentsList.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-2">
                    <MessageCircle className="w-4 h-4 text-zinc-500" />
                  </div>
                  <p className="text-xs font-medium text-zinc-400">
                    Nenhum comentário ou adoro registrado ainda neste canal.
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Seja o primeiro a interagir ao vivo!
                  </p>
                </div>
              ) : (
                commentsList.map((c) => {
                  const effectiveUserId = getEffectiveVisitorId(userProfile?.id);
                  const isAuthor = c.userId === effectiveUserId || isAdmin;

                  return (
                    <div key={c.id} className="text-xs bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850 group hover:border-zinc-700 transition">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {c.userPhoto ? (
                            <img
                              src={c.userPhoto}
                              alt={c.userName}
                              className="w-5 h-5 rounded-full object-cover border border-zinc-700 transition-transform duration-200 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2D55] to-purple-600 text-white font-bold text-[9px] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                              {c.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-zinc-200 text-[11px]">{c.userName}</span>
                          {c.userPlan && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30 font-bold">
                              {c.userPlan}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-500">{formatRelativeTime(c.createdAt)}</span>
                          {isAuthor && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all duration-200 hover:scale-125 active:scale-90 cursor-pointer"
                              title="Excluir comentário"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-xs pl-6 break-words">{c.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Adicione um comentário..."
                maxLength={400}
                className="flex-1 bg-zinc-900 text-xs text-zinc-200 placeholder-zinc-500 rounded-full px-3.5 py-2 border border-zinc-800 focus:outline-none focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55]/30 transition"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmitting}
                className="w-8 h-8 rounded-full bg-[#FF2D55] text-white hover:bg-rose-600 disabled:opacity-40 transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer shrink-0 flex items-center justify-center shadow-md"
                title="Enviar comentário"
              >
                <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CONTROLES INFERIORES COM ÍCONES ESTILO TIKTOK: MODO CINEMA, POUPAR INTERNET E BOTÕES CHEVRON */}
      <div className="w-full flex items-center justify-between mt-4 px-1">
        {/* LADO ESQUERDO: BOTÃO MODO CINEMA E POUPAR INTERNET */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={onEnterCinemaMode}
            className="group px-4 py-2 rounded-full bg-[#141418] hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center transition-all duration-200 group-hover:scale-120 group-hover:rotate-12">
              <Maximize2 className="w-3 h-3 text-zinc-400 group-hover:text-white" />
            </div>
            <span>Modo Cinema</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleLatencyMode()}
            className={`group px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shadow-sm ${
              latencyMode === 'economy'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50'
                : latencyMode === 'stable'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/50'
            }`}
            title="Alternar economia de internet e latência"
          >
            <span className="w-2 h-2 rounded-full bg-current transition-transform duration-200 group-hover:scale-150 animate-pulse" />
            <span>
              {latencyMode === 'economy'
                ? 'Poupar Internet -75%'
                : latencyMode === 'stable'
                ? 'Modo Estável HD'
                : 'Baixa Latência'}
            </span>
          </button>
        </div>

        {/* LADO DIREITO/CENTRO: BOTÕES CHEVRON < E > PARA ZAPPING DE CANAL COM TIKTOK POP */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevCanal}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer shadow-sm"
            title="Canal anterior"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:scale-110" />
          </button>

          <button
            type="button"
            onClick={onNextCanal}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-90 cursor-pointer shadow-sm"
            title="Próximo canal"
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
}
