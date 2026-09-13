'use client';
import React from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Server,
  Activity,
  Sliders,
  Radio,
  Info,
  HelpCircle,
} from 'lucide-react';
import { LatencyMode } from '@/types';

interface PlayerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  latencyMode: LatencyMode;
  onSelectLatencyMode: (mode: LatencyMode) => void;
  useProxy: boolean;
  onToggleProxy: () => void;
  streamIndex?: number;
  streamsDisponiveis?: string[];
  onSelectStream?: (index: number) => void;
  canalNome?: string;
  quality?: string;
}

export function PlayerSettingsModal({
  isOpen,
  onClose,
  latencyMode,
  onSelectLatencyMode,
  useProxy,
  onToggleProxy,
  streamIndex = 0,
  streamsDisponiveis = [],
  onSelectStream,
  canalNome,
  quality = 'HD',
}: PlayerSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="player-settings-modal-backdrop"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="player-settings-modal-content"
        className="w-full max-w-lg bg-[#121214] border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#00E676] shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Configurações do Player</span>
                {quality && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-[#00E676] border border-[#00E676]/30">
                    {quality}
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                {canalNome ? `Canal: ${canalNome}` : 'Ajustes de reprodução e estabilidade de rede'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="player-settings-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
            title="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SEÇÃO 1: MODO DE LATÊNCIA & DESEMPENHO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00E676]" />
                <span>Modo de Transmissão (Buffer de Rede)</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">
                Alterne conforme a velocidade da sua internet
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OPÇÃO 1: MODO ESTÁVEL */}
              <button
                type="button"
                id="select-mode-stable"
                onClick={() => onSelectLatencyMode('stable')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                  latencyMode === 'stable'
                    ? 'bg-emerald-500/10 border-[#00E676] ring-1 ring-[#00E676]/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        latencyMode === 'stable'
                          ? 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Modo Estável</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        Buffer Estendido (30s)
                      </span>
                    </div>
                  </div>

                  {latencyMode === 'stable' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Pré-carrega o vídeo para evitar travamentos e buffering. Recomendado para{' '}
                  <strong className="text-zinc-200 font-semibold">redes mais lentas</strong>,
                  conexões móveis 3G/4G ou Wi-Fi com oscilação.
                </p>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                  <span>Sem congelamentos de tela</span>
                </div>
              </button>

              {/* OPÇÃO 2: MODO BAIXA LATÊNCIA */}
              <button
                type="button"
                id="select-mode-low-latency"
                onClick={() => onSelectLatencyMode('low-latency')}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                  latencyMode === 'low-latency'
                    ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50 shadow-lg shadow-amber-950/20'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl border ${
                        latencyMode === 'low-latency'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Baixa Latência</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-amber-400">
                        Tempo Real (Ao Vivo)
                      </span>
                    </div>
                  </div>

                  {latencyMode === 'low-latency' ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sincronização imediata no limite do sinal ao vivo (~2s a 4s de atraso). Ideal para{' '}
                  <strong className="text-zinc-200 font-semibold">internet de alta velocidade</strong> (Fibra Óptica) para não ouvir o gol atrasado.
                </p>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Sincronismo máximo com a TV</span>
                </div>
              </button>
            </div>
          </div>

          {/* SEÇÃO 2: PROXY SEGURO & ROTEAMENTO */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Proxy Seguro</h4>
                  <p className="text-[11px] text-zinc-400">
                    Contorna bloqueios de CORS, Mixed-Content HTTP e operadoras
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="modal-toggle-proxy-btn"
                onClick={onToggleProxy}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  useProxy
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
              >
                {useProxy ? 'Ativado' : 'Desativado'}
              </button>
            </div>
          </div>

          {/* SEÇÃO 3: ROTAS DISPONÍVEIS DO CANAL */}
          {streamsDisponiveis.length > 1 && onSelectStream && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-zinc-500" />
                <span>Alternar Servidor / Rota de Transmissão</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {streamsDisponiveis.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectStream(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      streamIndex === idx
                        ? 'bg-[#00E676] text-black border-[#00E676]'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {streamIndex === idx && <CheckCircle2 className="w-3 h-3 text-black" />}
                    <span>{idx === 0 ? 'Servidor Principal' : `Servidor Reserva ${idx}`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DICA DE ATALHOS */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-zinc-300 block">
                Dica para redes móveis ou lentas:
              </span>
              <p>
                Se a transmissão sofrer pequenas pausas, selecione o <strong className="text-white">Modo Estável</strong> e, se necessário, ligue o <strong className="text-white">Proxy Seguro</strong> para garantir carregamento contínuo dos pacotes de vídeo.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Configurações salvas automaticamente</span>
          </span>

          <button
            type="button"
            id="player-settings-confirm-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
