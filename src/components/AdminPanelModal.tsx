'use client';
import React, { useState } from 'react';
import {
  Crown,
  Tv,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Users,
  Activity,
} from 'lucide-react';
import { Canal } from '@/types';
import { useAuth, UserRole } from '@/context/AuthContext';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  todosCanais: Canal[];
  customChannels: Canal[];
  onOpenAddChannel: () => void;
  onRemoveCustomChannel: (channelId: string) => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  todosCanais,
  customChannels,
  onOpenAddChannel,
  onRemoveCustomChannel,
}: AdminPanelModalProps) {
  const { user, userProfile, role, isAdmin, switchRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleToggle = async (newRole: UserRole) => {
    setSwitching(true);
    setFeedback(null);
    try {
      await switchRole(newRole);
      setFeedback(`Sessão alterada com sucesso para: ${newRole === 'admin' ? 'Administrador' : 'Usuário Normal'}`);
    } catch {
      setFeedback('Erro ao alternar o papel da sessão.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      id="admin-panel-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-panel-modal"
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Painel de Administração
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {role === 'admin' ? 'Acesso Total' : 'Modo Espectador'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Controle de sessões, gerenciamento de canais e permissões do sistema.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* CARD DE SESSÃO ATIVA & ALTERNADOR RÁPIDO */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Sessão Conectada
              </span>
              <div className="text-sm font-bold text-white mt-0.5">
                {userProfile?.displayName || user?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-zinc-400">{user?.email}</div>
            </div>

            {/* TOGGLE INTERATIVO DE SESSÃO */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                id="role-switch-user"
                disabled={switching}
                onClick={() => handleRoleToggle('user')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'user'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Usuário Normal
              </button>
              <button
                type="button"
                id="role-switch-admin"
                disabled={switching}
                onClick={() => handleRoleToggle('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Administrador
              </button>
            </div>
          </div>
        </div>

        {/* MATRIZ COMPARATIVA DE PERMISSÕES */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Matriz de Permissões das Sessões
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Bloco Usuário Normal */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Sessão: Usuário Normal</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assistir transmissões HLS ao vivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Alternar áudios e servidores espelho</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Favoritar e filtrar canais esportivos</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <XCircle className="w-3.5 h-3.5 text-red-500/80" />
                  <span>Adicionar ou remover canais da grade</span>
                </li>
              </ul>
            </div>

            {/* Bloco Administrador */}
            <div className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Sessão: Administrador</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Todas as permissões do usuário comum</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cadastrar novos canais M3U8</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excluir canais adicionados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acesso ao Painel Admin e diagnósticos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* GESTÃO DE CANAIS */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-[#00E676]" />
              Grade de Canais ({todosCanais.length} ativos)
            </h3>
            {isAdmin && (
              <button
                type="button"
                id="admin-btn-add-channel"
                onClick={() => {
                  onClose();
                  onOpenAddChannel();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Canal</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {customChannels.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center text-xs text-zinc-500">
                Nenhum canal customizado adicionado ainda. Os {todosCanais.length} canais padrão estão carregados.
              </div>
            ) : (
              customChannels.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">{c.nome}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {c.categoria || 'Geral'}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveCustomChannel(c.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Excluir canal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* STATUS DO AMBIENTE */}
        <div className="mt-5 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Motor HLS e Firestore: Operacionais</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700/60 transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
