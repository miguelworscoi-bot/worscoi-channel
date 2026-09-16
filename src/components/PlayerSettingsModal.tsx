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
  Leaf,
  Smartphone,
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
        className="w-full max-w-xl bg-[#121214] border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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
                <span>Conexão & Economia de Internet</span>
                {quality && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-[#00E676] border border-[#00E676]/30">
                    {quality}
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                {canalNome ? `Canal: ${canalNome}` : 'Ajustes para evitar alto consumo de internet'}
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
          {/* SELETOR RÁPIDO SOLICITADO: ALTERNAR ENTRE MODO ESTÁVEL E MODO BAIXA LATÊNCIA */}
          <div className="p-4 bg-zinc-950/90 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00E676]" />
                <span>Modo de Desempenho da Rede</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {latencyMode === 'stable'
                  ? 'Modo Estável'
                  : latencyMode === 'low-latency'
                  ? 'Baixa Latência'
                  : 'Poupança de Dados'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="quick-toggle-modo-estavel"
                onClick={() => onSelectLatencyMode('stable')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  latencyMode === 'stable'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Modo Estável</span>
              </button>

              <button
                type="button"
                id="quick-toggle-modo-baixa-latencia"
                onClick={() => onSelectLatencyMode('low-latency')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  latencyMode === 'low-latency'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-950/40 ring-1 ring-amber-400/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Modo Baixa Latência</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-start gap-2">
              {latencyMode === 'stable' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-cyan-300">Modo Estável selecionado:</strong> Otimizado para redes lentas ou instáveis. Amplia o buffer do sinal para evitar pausas e congelamentos na transmissão.
                  </p>
                </>
              ) : latencyMode === 'low-latency' ? (
                <>
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-amber-300">Modo Baixa Latência selecionado:</strong> Transmissão imediata com atraso mínimo em tempo real. Ideal para redes de alta velocidade e Fibra Óptica.
                  </p>
                </>
              ) : (
                <>
                  <Leaf className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-emerald-300">Economia de Dados ativa:</strong> Reduz drasticamente o consumo de pacotes móveis (3G/4G/Unitel).
                  </p>
                </>
              )}
            </div>
          </div>

          {/* BANNER DE POUPANÇA ATIVA SE ESTIVER NO MODO ECONOMIA */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              latencyMode === 'economy'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  latencyMode === 'economy'
                    ? 'bg-emerald-500/20 text-[#00E676]'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Modo Economia de Dados</span>
                  {latencyMode === 'economy' && (
                    <span className="text-[9px] bg-[#00E676] text-black font-black px-1.5 py-0.2 rounded uppercase">
                      Ativo
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {latencyMode === 'economy'
                    ? 'Você está poupando até 75% da sua internet móvel.'
                    : 'Ative para reduzir drasticamente o consumo de dados.'}
                </p>
              </div>
            </div>

            {latencyMode !== 'economy' ? (
              <button
                type="button"
                onClick={() => onSelectLatencyMode('economy')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                Ativar Poupança
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs font-bold text-[#00E676]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">-75% Dados</span>
              </div>
            )}
          </div>

          {/* SEÇÃO 1: SELEÇÃO DOS MODOS DE TRANSMISSÃO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00E676]" />
                <span>Escolha a Intensidade de Uso da Internet</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">
                3 perfis disponíveis
              </span>
            </div>

            <div className="space-y-2.5">
              {/* OPÇÃO 1: MODO ECONOMIA (POUPANÇA MÁXIMA) */}
              <button
                type="button"
                id="select-mode-economy"
                onClick={() => onSelectLatencyMode('economy')}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                  latencyMode === 'economy'
                    ? 'bg-emerald-500/10 border-[#00E676] ring-1 ring-[#00E676]/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      latencyMode === 'economy'
                        ? 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Economia de Dados (Poupança Máxima)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Poupa até 75%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                      Buffer curto de 5s, resolução otimizada e conexão rápida. Não faz download de dezenas de megabytes ao trocar de canal.
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
                      <span className="text-emerald-400 font-semibold">Consumo: ~350 MB / hora</span>
                      <span>•</span>
                      <span>Ideal para Unitel, Movicel, 3G/4G</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {latencyMode === 'economy' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-700" />
                  )}
                </div>
              </button>

              {/* OPÇÃO 2: MODO ESTÁVEL (BUFFER ESTENDIDO PARA REDES LENTAS) */}
              <button
                type="button"
                id="select-mode-stable"
                onClick={() => onSelectLatencyMode('stable')}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                  latencyMode === 'stable'
                    ? 'bg-cyan-500/10 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/20'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      latencyMode === 'stable'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Modo Estável (Buffer Estendido)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Melhor p/ Redes Lentas
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                      Buffer estendido de 14s. Estabiliza o sinal e absorve lentidões ou oscilações de conexão, prevenindo travamentos durante a transmissão.
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
                      <span className="text-cyan-400 font-semibold">Consumo: ~900 MB / hora</span>
                      <span>•</span>
                      <span>Recomendado p/ conexões lentas ou instáveis</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {latencyMode === 'stable' ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-700" />
                  )}
                </div>
              </button>

              {/* OPÇÃO 3: MODO BAIXA LATÊNCIA (TEMPO REAL / FIBRA) */}
              <button
                type="button"
                id="select-mode-low-latency"
                onClick={() => onSelectLatencyMode('low-latency')}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                  latencyMode === 'low-latency'
                    ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50 shadow-lg shadow-amber-950/20'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      latencyMode === 'low-latency'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Modo Baixa Latência (Tempo Real)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Ao Vivo 2s
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                      Sincronização imediata no limite do sinal com mínimo atraso (delay). Recomendado apenas para redes rápidas ou fibra óptica sem oscilação.
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
                      <span className="text-amber-400 font-semibold">Consumo: ~1.8 GB / hora</span>
                      <span>•</span>
                      <span>Fibra Óptica / Conexões Rápidas</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {latencyMode === 'low-latency' ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-700" />
                  )}
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
                  <h4 className="text-xs sm:text-sm font-bold text-white">Proxy Seguro de Aceleração</h4>
                  <p className="text-[11px] text-zinc-400">
                    Contorna bloqueios de provedores e acelera a entrega de pacotes de vídeo
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

          {/* DICA DE ECONOMIA */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5 text-[11px] text-zinc-300">
            <Smartphone className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white block">
                Dica para economizar seus dados móveis:
              </span>
              <p>
                Ao assistir via dados móveis (Unitel, Movicel ou 4G), mantenha sempre o <strong className="text-[#00E676]">Modo Economia de Dados</strong> ligado. Ele reduz o tamanho dos fragmentos de vídeo e evita que o player continue baixando gigabytes de vídeo se você apenas estiver navegando pelos canais.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" />
            <span>Configuração salva automaticamente no navegador</span>
          </div>
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
