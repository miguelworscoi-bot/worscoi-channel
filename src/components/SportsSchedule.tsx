import React from 'react';
import { Clock, Tv, ChevronRight, Trophy } from 'lucide-react';
import { Canal } from '@/types';

export interface Jogo {
  id: number;
  campeonato: string;
  hora: string;
  timeCasa: string;
  timeFora: string;
  logoCasa: string;
  logoFora: string;
  canalSugerido: string;
  status?: 'AO VIVO' | 'HOJE' | 'ENCERRADO';
}

interface SportsScheduleProps {
  jogos: Jogo[];
  onSintonizarJogo: (canalSugerido: string) => void;
  canalAtivo: Canal | null;
}

export function SportsSchedule({ jogos, onSintonizarJogo, canalAtivo }: SportsScheduleProps) {
  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
              <span>Agenda de Jogos de Hoje</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Clique em uma partida para ver onde assistir e filtrar os canais correspondentes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono uppercase tracking-wider">Ao Vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {jogos.map((jogo) => {
          const isSelected =
            canalAtivo &&
            (canalAtivo.nome.toLowerCase().includes(jogo.canalSugerido.toLowerCase()) ||
              (canalAtivo.rede &&
                canalAtivo.rede.toLowerCase().includes(jogo.canalSugerido.toLowerCase())));

          return (
            <div
              key={jogo.id}
              onClick={() => onSintonizarJogo(jogo.canalSugerido)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-emerald-500/10 border-[#00E676]/50 shadow-lg shadow-[#00E676]/10 ring-1 ring-[#00E676]/30'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Top: Campeonato & Horário */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                  {jogo.campeonato}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded-md shrink-0">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{jogo.hora}</span>
                </div>
              </div>

              {/* Middle: Clubes frente a frente */}
              <div className="flex items-center justify-between gap-2 my-1">
                {/* Time Casa */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={jogo.logoCasa}
                    alt={jogo.timeCasa}
                    className="w-7 h-7 rounded-full object-contain bg-zinc-900 border border-zinc-800 p-0.5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.iconify.design/lucide:shield.svg?color=%2300E676';
                    }}
                  />
                  <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                    {jogo.timeCasa}
                  </span>
                </div>

                <span className="text-[10px] font-black text-zinc-500 px-1 shrink-0">VS</span>

                {/* Time Fora */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                  <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                    {jogo.timeFora}
                  </span>
                  <img
                    src={jogo.logoFora}
                    alt={jogo.timeFora}
                    className="w-7 h-7 rounded-full object-contain bg-zinc-900 border border-zinc-800 p-0.5 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.iconify.design/lucide:shield.svg?color=%2300E676';
                    }}
                  />
                </div>
              </div>

              {/* Bottom: Canal sugerido e ação sintonizar */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Tv className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-semibold text-zinc-300">{jogo.canalSugerido}</span>
                </div>

                <div
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    isSelected
                      ? 'bg-[#00E676] text-black font-extrabold shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 group-hover:bg-[#00E676] group-hover:text-black border border-zinc-800 group-hover:border-[#00E676]'
                  }`}
                >
                  <span>Onde Assistir</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
