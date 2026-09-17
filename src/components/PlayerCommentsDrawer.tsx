'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Trash2 } from 'lucide-react';
import {
  ChannelComment,
  formatRelativeTime,
} from '@/services/channelInteractionsService';

interface PlayerCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canalNome: string;
  comments: ChannelComment[];
  onSendComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isSubmitting: boolean;
  currentUserId: string;
  isAdmin?: boolean;
}

export function PlayerCommentsDrawer({
  isOpen,
  onClose,
  canalNome,
  comments,
  onSendComment,
  onDeleteComment,
  isSubmitting,
  currentUserId,
  isAdmin = false,
}: PlayerCommentsDrawerProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fecha com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll suave para a lista ao abrir ou receber novo comentário
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, comments.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;
    setInputText('');
    await onSendComment(trimmed);
  };

  return (
    <div
      id="player-comments-backdrop"
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        id="player-comments-drawer"
        className="w-full sm:w-96 max-w-full h-full bg-[#0e0f14] border-l border-zinc-800/90 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[#ed3c5c] shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Comentários ao Vivo</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700">
                  {comments.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-[210px]">
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

        {/* LISTA DE COMENTÁRIOS */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
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
                Participe da conversa em tempo real enviando sua mensagem abaixo.
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const isOwner = c.userId === currentUserId || isAdmin;
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700/80 transition group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {c.userPhoto ? (
                        <img
                          src={c.userPhoto}
                          alt={c.userName}
                          className="w-5 h-5 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ed3c5c] to-purple-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
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

                    <div className="flex items-center gap-1 shrink-0">
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

                  <p className="text-xs text-zinc-300 leading-relaxed pl-7 break-words">
                    {c.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* FORMULÁRIO DE ENVIO */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/80 shrink-0"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              id="player-comment-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escreva um comentário..."
              maxLength={400}
              disabled={isSubmitting}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#ed3c5c] focus:ring-1 focus:ring-[#ed3c5c]/40 transition pr-10"
            />
            <button
              type="submit"
              id="player-comment-submit-btn"
              disabled={!inputText.trim() || isSubmitting}
              className="absolute right-1.5 p-2 rounded-lg bg-[#ed3c5c] text-white hover:bg-[#d82a4a] disabled:opacity-40 disabled:hover:bg-[#ed3c5c] transition cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
              title="Enviar comentário"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-zinc-500">
            <span>Pressione Enter para enviar</span>
            <span>{inputText.length}/400</span>
          </div>
        </form>
      </div>
    </div>
  );
}
