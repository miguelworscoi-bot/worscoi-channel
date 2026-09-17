'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Trash2,
  Heart,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import {
  ChannelComment,
  formatRelativeTime,
  formatInteractionCount,
} from '@/services/channelInteractionsService';

interface PlayerCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canalNome: string;
  comments: ChannelComment[];
  onSendComment: (
    text: string,
    parentId?: string | null,
    replyToUserName?: string | null
  ) => Promise<void>;
  onToggleCommentAdoro: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isSubmitting: boolean;
  currentUserId: string;
  isAdmin?: boolean;
}

interface ReplyingToState {
  commentId: string;
  userName: string;
  rootParentId: string;
}

const QUICK_REACTIONS = ['❤️ Adoro', '👏 Top', '🔥 Show', '😍 Demais', '🇧🇷 Brasil'];

export function PlayerCommentsDrawer({
  isOpen,
  onClose,
  canalNome,
  comments,
  onSendComment,
  onToggleCommentAdoro,
  onDeleteComment,
  isSubmitting,
  currentUserId,
  isAdmin = false,
}: PlayerCommentsDrawerProps) {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyingToState | null>(null);
  const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (replyingTo) {
          setReplyingTo(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, replyingTo]);

  // Scroll suave para a lista ao abrir ou receber novo comentário
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, comments.length]);

  // Foca no input ao iniciar uma resposta
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  // Organiza comentários em tópicos principais e respostas
  const { rootComments, repliesMap } = useMemo(() => {
    const roots: ChannelComment[] = [];
    const replies: Record<string, ChannelComment[]> = {};

    for (const c of comments) {
      if (!c.parentId) {
        roots.push(c);
      } else {
        if (!replies[c.parentId]) {
          replies[c.parentId] = [];
        }
        replies[c.parentId].push(c);
      }
    }

    // Se houver respostas órfãs (cujo comentário pai não está na lista), exibe no feed principal
    for (const c of comments) {
      if (c.parentId && !roots.some((r) => r.id === c.parentId)) {
        roots.push(c);
      }
    }

    // Ordena respostas em ordem cronológica (conversa natural)
    for (const parentId in replies) {
      replies[parentId].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return { rootComments: roots, repliesMap: replies };
  }, [comments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    const parentId = replyingTo?.rootParentId || null;
    const replyToUserName = replyingTo?.userName || null;

    setInputText('');
    setReplyingTo(null);
    await onSendComment(trimmed, parentId, replyToUserName);
  };

  const handleStartReply = (comment: ChannelComment) => {
    // Se o comentário já é uma resposta, o pai principal da conversa é o parentId dele
    const rootId = comment.parentId || comment.id;
    setReplyingTo({
      commentId: comment.id,
      userName: comment.userName,
      rootParentId: rootId,
    });
  };

  const handleHeartClick = async (commentId: string) => {
    setAnimatingHeartId(commentId);
    setTimeout(() => {
      setAnimatingHeartId((prev) => (prev === commentId ? null : prev));
    }, 450);
    await onToggleCommentAdoro(commentId);
  };

  const handleQuickReaction = (emoji: string) => {
    setInputText((prev) => (prev ? `${prev} ${emoji}` : emoji));
    inputRef.current?.focus();
  };

  return (
    <div
      id="player-comments-backdrop"
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="player-comments-drawer"
        className="w-full sm:w-[420px] max-w-full h-full bg-[#0e0f14] border-l border-zinc-800/90 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[#ed3c5c] shrink-0 shadow-inner">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Comentários ao Vivo</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700">
                  {comments.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-[230px]">
                {canalNome || 'Canal'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="player-comments-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
            title="Fechar comentários (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LISTA DE COMENTÁRIOS E RESPOSTAS */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar"
        >
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
                <MessageCircle className="w-6 h-6 text-zinc-500" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-200 mb-1">
                Nenhum comentário ainda
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Participe da conversa em tempo real! Envie seu comentário ou reaja aos canais ao vivo.
              </p>
            </div>
          ) : (
            rootComments.map((c) => {
              const isOwner = c.userId === currentUserId || isAdmin;
              const hasAdorado = Boolean(c.adorosBy?.includes(currentUserId));
              const adoros = c.adorosCount || c.adorosBy?.length || 0;
              const threadReplies = repliesMap[c.id] || [];

              return (
                <div key={c.id} className="space-y-2">
                  {/* COMENTÁRIO PRINCIPAL */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/90 transition group">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {c.userPhoto ? (
                          <img
                            src={c.userPhoto}
                            alt={c.userName}
                            className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ed3c5c] to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                            {c.userName ? c.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {c.userName}
                        </span>
                        {c.userPlan && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0 font-medium uppercase tracking-wider">
                            {c.userPlan}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-zinc-500">
                          {formatRelativeTime(c.createdAt)}
                        </span>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => onDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition cursor-pointer"
                            title="Excluir comentário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed pl-8 break-words select-text">
                      {c.text}
                    </p>

                    {/* BARRA DE AÇÕES DO COMENTÁRIO (ADORO E RESPONDER) */}
                    <div className="mt-2.5 pl-8 flex items-center gap-2">
                      {/* BOTÃO ADORO */}
                      <button
                        type="button"
                        id={`comment-adoro-btn-${c.id}`}
                        onClick={() => handleHeartClick(c.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                          hasAdorado
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                            : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/60 hover:text-rose-400 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                        title={hasAdorado ? 'Remover adoro' : 'Adorar este comentário'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-transform ${
                            hasAdorado ? 'fill-rose-500 text-rose-500' : ''
                          } ${animatingHeartId === c.id ? 'scale-130' : 'scale-100'}`}
                        />
                        <span>{adoros > 0 ? formatInteractionCount(adoros) : 'Adoro'}</span>
                      </button>

                      {/* BOTÃO RESPONDER */}
                      <button
                        type="button"
                        id={`comment-reply-btn-${c.id}`}
                        onClick={() => handleStartReply(c)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 text-zinc-400 bg-zinc-800/50 border border-zinc-700/60 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition cursor-pointer"
                        title={`Responder a ${c.userName}`}
                      >
                        <CornerDownRight className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Responder</span>
                      </button>

                      {threadReplies.length > 0 && (
                        <span className="text-[10px] text-zinc-500 ml-auto font-medium">
                          {threadReplies.length}{' '}
                          {threadReplies.length === 1 ? 'resposta' : 'respostas'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* THREAD DE RESPOSTAS INDENTADA */}
                  {threadReplies.length > 0 && (
                    <div className="ml-5 pl-3.5 border-l-2 border-rose-500/25 space-y-2 pt-0.5">
                      {threadReplies.map((reply) => {
                        const isReplyOwner = reply.userId === currentUserId || isAdmin;
                        const hasReplyAdorado = Boolean(reply.adorosBy?.includes(currentUserId));
                        const replyAdoros = reply.adorosCount || reply.adorosBy?.length || 0;

                        return (
                          <div
                            key={reply.id}
                            className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/70 transition group"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {reply.userPhoto ? (
                                  <img
                                    src={reply.userPhoto}
                                    alt={reply.userName}
                                    className="w-5 h-5 rounded-full object-cover border border-zinc-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                    {reply.userName ? reply.userName.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                                <span className="text-xs font-semibold text-zinc-300 truncate">
                                  {reply.userName}
                                </span>
                                {reply.userPlan && (
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0 font-medium uppercase">
                                    {reply.userPlan}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] text-zinc-500">
                                  {formatRelativeTime(reply.createdAt)}
                                </span>
                                {isReplyOwner && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteComment(reply.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition cursor-pointer"
                                    title="Excluir resposta"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed pl-6.5 break-words select-text">
                              {reply.replyToUserName && (
                                <span className="text-rose-400 font-semibold mr-1.5 select-none">
                                  @{reply.replyToUserName}
                                </span>
                              )}
                              {reply.text}
                            </p>

                            {/* AÇÕES DA RESPOSTA */}
                            <div className="mt-2 pl-6.5 flex items-center gap-2">
                              <button
                                type="button"
                                id={`reply-adoro-btn-${reply.id}`}
                                onClick={() => handleHeartClick(reply.id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition cursor-pointer border ${
                                  hasReplyAdorado
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:text-rose-400 hover:bg-zinc-800'
                                }`}
                                title={hasReplyAdorado ? 'Remover adoro' : 'Adorar resposta'}
                              >
                                <Heart
                                  className={`w-3 h-3 transition-transform ${
                                    hasReplyAdorado ? 'fill-rose-500 text-rose-500' : ''
                                  } ${animatingHeartId === reply.id ? 'scale-130' : 'scale-100'}`}
                                />
                                <span>
                                  {replyAdoros > 0 ? formatInteractionCount(replyAdoros) : 'Adoro'}
                                </span>
                              </button>

                              <button
                                type="button"
                                id={`reply-to-reply-btn-${reply.id}`}
                                onClick={() => handleStartReply(reply)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 text-zinc-400 bg-zinc-800/40 border border-zinc-700/50 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                                title={`Responder a ${reply.userName}`}
                              >
                                <CornerDownRight className="w-3 h-3 text-zinc-400" />
                                <span>Responder</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* REAÇÕES RÁPIDAS */}
        <div className="px-4 py-2 bg-zinc-950/90 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mr-1 shrink-0">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Reagir:</span>
          </span>
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleQuickReaction(emoji)}
              className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 hover:border-zinc-700 shrink-0 cursor-pointer transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* FORMULÁRIO DE ENVIO COM BANNER DE RESPOSTA */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/95 shrink-0"
        >
          {/* BANNER INFORMATIVO SE ESTIVER RESPONDENDO */}
          {replyingTo && (
            <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <CornerDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs text-zinc-300 truncate">
                  Respondendo a <strong className="text-rose-400">@{replyingTo.userName}</strong>
                </span>
              </div>
              <button
                type="button"
                id="player-cancel-reply-btn"
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Cancelar resposta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              id="player-comment-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Responder a @${replyingTo.userName}...`
                  : 'Escreva um comentário ao vivo...'
              }
              maxLength={400}
              disabled={isSubmitting}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#ed3c5c] focus:ring-1 focus:ring-[#ed3c5c]/40 transition pr-10"
            />
            <button
              type="submit"
              id="player-comment-submit-btn"
              disabled={!inputText.trim() || isSubmitting}
              className="absolute right-1.5 p-2 rounded-lg bg-[#ed3c5c] text-white hover:bg-[#d82a4a] disabled:opacity-40 disabled:hover:bg-[#ed3c5c] transition cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
              title={replyingTo ? 'Enviar resposta' : 'Enviar comentário'}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-zinc-500">
            <span>
              {replyingTo ? 'Enter para enviar resposta' : 'Pressione Enter para enviar'}
            </span>
            <span>{inputText.length}/400</span>
          </div>
        </form>
      </div>
    </div>
  );
}
