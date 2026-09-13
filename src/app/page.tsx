'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Canal, FiltroAtivo, LatencyMode } from '@/types';
import { LOCAL_STORAGE_LATENCY_KEY } from '@/utils/streamUtils';
import { CANAIS_PADRAO } from '@/app/api/canais/route';
import { Header } from '@/components/Header';
import { PlayerHero } from '@/components/PlayerHero';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { NowPlayingRail } from '@/components/NowPlayingRail';
import { CinemaPlayer } from '@/components/CinemaPlayer';
import { AddChannelModal } from '@/components/AddChannelModal';
import { AdminPanelModal } from '@/components/AdminPanelModal';
import { AuthModal } from '@/components/AuthModal';
import { SubscribersModal } from '@/components/SubscribersModal';
import { RedeemTokenModal } from '@/components/RedeemTokenModal';
import { PaymentPlansModal } from '@/components/PaymentPlansModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { useAuth } from '@/context/AuthContext';

const LOCAL_STORAGE_FAVORITES_KEY = 'playsports_favorites';
const LOCAL_STORAGE_CUSTOM_KEY = 'playsports_custom_channels';

export default function Home() {
  const { loading: authLoading, isAdmin } = useAuth();
  const [canais, setCanais] = useState<Canal[]>(CANAIS_PADRAO);
  const [customChannels, setCustomChannels] = useState<Canal[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<Canal | null>(CANAIS_PADRAO[0] || null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  // Modo Economia como padrão para poupar imediatamente a franquia de internet móvel do espectador
  const [latencyMode, setLatencyMode] = useState<LatencyMode>('economy');
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Estados para transição suave (skeleton / fade-out) e silenciamento preventivo entre players
  const [isTransitioningPlayer, setIsTransitioningPlayer] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'to-cinema' | 'to-hero' | null>(null);
  const [isAudioTransitionMuted, setIsAudioTransitionMuted] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRestoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [busca, setBusca] = useState('');

  // Limpa timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (audioRestoreTimeoutRef.current) clearTimeout(audioRestoreTimeoutRef.current);
    };
  }, []);

  // Carrega favoritos e canais personalizados do localStorage ao inicializar
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
      if (storedFavs) {
        const parsed = JSON.parse(storedFavs);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }

      const storedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KEY);
      if (storedCustom) {
        const parsedCustom = JSON.parse(storedCustom);
        if (Array.isArray(parsedCustom)) {
          setCustomChannels(parsedCustom);
        }
      }

      const storedLatency = localStorage.getItem(LOCAL_STORAGE_LATENCY_KEY) || localStorage.getItem('futebol_ao_vivo_latency_mode');
      if (storedLatency === 'economy' || storedLatency === 'stable' || storedLatency === 'low-latency') {
        setLatencyMode(storedLatency);
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }
  }, []);

  // Carrega lista atualizada de canais da API (com fallback nos canais padrão já montados)
  useEffect(() => {
    fetch('/api/canais')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const seen = new Set<string>();
          const clean: Canal[] = [];
          for (const item of data) {
            const key = (item.id || item.url || '').trim();
            if (key && !seen.has(key)) {
              seen.add(key);
              clean.push(item);
            }
          }
          setCanais(clean);
          setCanalAtivo((prev) => prev || clean[0]);
        }
      })
      .catch(() => {
        // Mantém CANAIS_PADRAO já carregados
      });
  }, []);

  // Combina canais personalizados com os canais da API garantindo que não haja IDs duplicados
  const todosCanais = useMemo(() => {
    const seenIds = new Set<string>();
    const result: Canal[] = [];
    for (const c of [...customChannels, ...canais]) {
      const idKey = (c.id || c.url || '').trim();
      if (idKey && seenIds.has(idKey)) continue;
      if (idKey) seenIds.add(idKey);
      result.push(c);
    }
    return result;
  }, [customChannels, canais]);

  // Garante que haja um canal ativo
  useEffect(() => {
    if (!canalAtivo && todosCanais.length > 0) {
      setCanalAtivo(todosCanais[0]);
    }
  }, [todosCanais, canalAtivo]);

  // Checa se o canal está favoritado
  const isCanalFavorited = useCallback(
    (canal?: Canal | null): boolean => {
      if (!canal) return false;
      if (canal.id && favorites.includes(canal.id)) return true;
      if (canal.url && favorites.includes(canal.url)) return true;
      return false;
    },
    [favorites]
  );

  // Toggle favorito com persistência
  const toggleFavorite = (canal: Canal, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const chave = canal.id || canal.url;
    setFavorites((prev) => {
      const isFav =
        (canal.id && prev.includes(canal.id)) ||
        (canal.url && prev.includes(canal.url));

      const nextFavorites = isFav
        ? prev.filter((u) => u !== canal.id && u !== canal.url)
        : [...prev, chave];

      try {
        localStorage.setItem(
          LOCAL_STORAGE_FAVORITES_KEY,
          JSON.stringify(nextFavorites)
        );
      } catch {
        // Ignora erro de escrita
      }
      return nextFavorites;
    });
  };

  // Troca de canal ativo
  const handleSelectCanal = (canal: Canal) => {
    if (canalAtivo?.url !== canal.url || canalAtivo?.id !== canal.id) {
      setStreamIndex(0);
      setFailoverNotice(null);
      setCanalAtivo(canal);
      // Scroll suave para o player no mobile
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Navegação rápida de canais (Zapping Anterior / Próximo)
  const currentCanalIndex = todosCanais.findIndex(
    (c) => (canalAtivo?.id && c.id === canalAtivo.id) || c.url === canalAtivo?.url
  );

  const handleNextCanal = useCallback(() => {
    if (todosCanais.length === 0) return;
    const nextIdx = (currentCanalIndex + 1) % todosCanais.length;
    handleSelectCanal(todosCanais[nextIdx]);
  }, [currentCanalIndex, todosCanais]);

  const handlePrevCanal = useCallback(() => {
    if (todosCanais.length === 0) return;
    const prevIdx = (currentCanalIndex - 1 + todosCanais.length) % todosCanais.length;
    handleSelectCanal(todosCanais[prevIdx]);
  }, [currentCanalIndex, todosCanais]);

  // Failover inteligente quando o player dispara erro ou timeout
  const handlePlayerError = () => {
    if (!canalAtivo) return;
    const streams = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
    const isYouTube =
      canalAtivo.categoria === 'YouTube' ||
      canalAtivo.rede === 'YouTube' ||
      canalAtivo.url.includes('youtube.com') ||
      canalAtivo.url.includes('youtu.be');

    if (isYouTube) {
      const nextIndex = streamIndex + 1;
      if (nextIndex < streams.length) {
        setFailoverNotice(
          `Alternando para vídeo alternativo do canal (${nextIndex + 1}/${streams.length})...`
        );
        setStreamIndex(nextIndex);
        setTimeout(() => {
          setFailoverNotice(null);
        }, 5000);
      } else {
        setFailoverNotice(
          'Vídeo com restrição de incorporação no YouTube. Utilize o botão para assistir diretamente.'
        );
      }
      return;
    }

    // Se o sinal direto falhou (CORS ou bloqueio de rede), ativa imediatamente o Proxy Seguro
    if (!useProxy) {
      setFailoverNotice(
        'Sinal direto instável. Ativando conexão protegida por Proxy Seguro...'
      );
      setUseProxy(true);
      setTimeout(() => {
        setFailoverNotice(null);
      }, 5000);
      return;
    }

    // Se já estava no proxy e falhou, avança para o próximo servidor reserva
    const nextIndex = streamIndex + 1;
    if (nextIndex < streams.length) {
      setFailoverNotice(
        `Alternando automaticamente para o servidor reserva (${nextIndex + 1}/${streams.length})...`
      );
      setStreamIndex(nextIndex);
      setTimeout(() => {
        setFailoverNotice(null);
      }, 4000);
    } else {
      setFailoverNotice(
        'Sinal deste canal demorando a responder. Conectando automaticamente ao próximo canal...'
      );
      setTimeout(() => {
        setFailoverNotice(null);
        handleNextCanal();
      }, 1800);
    }
  };

  const handleManualStreamChange = (newIndex: number) => {
    setStreamIndex(newIndex);
    setFailoverNotice(null);
  };

  // Reprodução contínua automática para canais do YouTube e playlists de vídeos
  const handleVideoEnded = useCallback(() => {
    if (!canalAtivo) return;

    const isYouTube =
      canalAtivo.categoria === 'YouTube' ||
      canalAtivo.rede === 'YouTube' ||
      canalAtivo.url.includes('youtube.com') ||
      canalAtivo.url.includes('youtu.be');

    const streams = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];

    if (isYouTube) {
      // 1. Se ainda há vídeos na lista deste canal, avança para o próximo vídeo
      if (streamIndex < streams.length - 1) {
        const nextIndex = streamIndex + 1;
        setFailoverNotice(
          `Vídeo finalizado. Reproduzindo próximo vídeo (${nextIndex + 1}/${streams.length})...`
        );
        setStreamIndex(nextIndex);
        setTimeout(() => {
          setFailoverNotice(null);
        }, 4000);
      } else {
        // 2. Concluiu todos os vídeos deste canal: avança automaticamente para o próximo canal do YouTube
        const canaisYoutube = todosCanais.filter(
          (c) =>
            c.categoria === 'YouTube' ||
            c.rede === 'YouTube' ||
            c.url.includes('youtube.com') ||
            c.url.includes('youtu.be')
        );
        const currentIdx = canaisYoutube.findIndex((c) => c.id === canalAtivo.id);
        const nextCanal =
          currentIdx !== -1 && currentIdx < canaisYoutube.length - 1
            ? canaisYoutube[currentIdx + 1]
            : canaisYoutube[0];

        if (nextCanal && nextCanal.id !== canalAtivo.id) {
          setFailoverNotice(
            `Fim dos vídeos deste canal. Sintonizando automaticamente: ${nextCanal.nome}...`
          );
          setTimeout(() => {
            setFailoverNotice(null);
            handleSelectCanal(nextCanal);
          }, 1800);
        } else {
          // Loop contínuo: reinicia do primeiro vídeo
          setFailoverNotice('Reiniciando reprodução contínua do canal...');
          setStreamIndex(0);
          setTimeout(() => {
            setFailoverNotice(null);
          }, 3000);
        }
      }
    } else {
      // Para canais com múltiplos episódios ou gravações
      if (streams.length > 1) {
        const nextIndex = (streamIndex + 1) % streams.length;
        setStreamIndex(nextIndex);
      }
    }
  }, [canalAtivo, streamIndex, todosCanais, handleSelectCanal]);

  // Salvar novo canal personalizado (Permissão exclusiva de Administrador)
  const handleAddCustomChannel = (novoCanal: Canal) => {
    if (!isAdmin) {
      alert('Acesso restrito: Apenas a sessão de Administrador pode adicionar novos canais.');
      return;
    }
    const atualizados = [novoCanal, ...customChannels];
    setCustomChannels(atualizados);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
    } catch {
      // Ignora erro
    }
    // Sintoniza imediatamente
    setCanalAtivo(novoCanal);
    setStreamIndex(0);
    setFailoverNotice(null);
  };

  // Excluir canal personalizado (Permissão exclusiva de Administrador)
  const handleDeleteCustomChannel = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      alert('Acesso restrito: Apenas a sessão de Administrador pode excluir canais.');
      return;
    }
    const atualizados = customChannels.filter((c) => c.id !== id);
    setCustomChannels(atualizados);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
    } catch {
      // Ignora erro
    }

    if (canalAtivo?.id === id) {
      const proximo = atualizados[0] || canais[0] || null;
      setCanalAtivo(proximo);
      setStreamIndex(0);
    }
  };

  const handleToggleLatencyMode = (mode?: LatencyMode) => {
    setLatencyMode((prev) => {
      let next: LatencyMode;
      if (mode) {
        next = mode;
      } else if (prev === 'economy') {
        next = 'stable';
      } else if (prev === 'stable') {
        next = 'low-latency';
      } else {
        next = 'economy';
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_LATENCY_KEY, next);
      } catch {
        // Ignora erro de localStorage
      }
      return next;
    });
  };

  // Transição suave (skeleton + fade-out) e silenciamento preventivo para evitar picos de áudio
  const handleEnterCinemaMode = useCallback(() => {
    if (isCinemaMode || isTransitioningPlayer) return;

    // 1. Silencia imediatamente qualquer áudio ativo para eliminar estalos / picos de áudio
    setIsAudioTransitionMuted(true);
    setIsTransitioningPlayer(true);
    setTransitionDirection('to-cinema');

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (audioRestoreTimeoutRef.current) clearTimeout(audioRestoreTimeoutRef.current);

    // 2. Aguarda o fade-out/skeleton do PlayerHero (220ms) antes de alternar componentes
    transitionTimeoutRef.current = setTimeout(() => {
      setIsCinemaMode(true);

      // 3. Mantém o skeleton no CinemaPlayer até a inicialização estável (320ms)
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioningPlayer(false);
        setTransitionDirection(null);

        // 4. Restaura o estado de áudio do usuário suavemente
        audioRestoreTimeoutRef.current = setTimeout(() => {
          setIsAudioTransitionMuted(false);
        }, 100);
      }, 320);
    }, 220);
  }, [isCinemaMode, isTransitioningPlayer]);

  const handleCloseCinemaMode = useCallback(() => {
    if (!isCinemaMode || isTransitioningPlayer) return;

    // 1. Silencia imediatamente no CinemaPlayer para evitar corte abrupto ou estalo
    setIsAudioTransitionMuted(true);
    setIsTransitioningPlayer(true);
    setTransitionDirection('to-hero');

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (audioRestoreTimeoutRef.current) clearTimeout(audioRestoreTimeoutRef.current);

    // 2. Desativa isCinemaMode permitindo que CinemaPlayer execute sua animação de saída (fade-out)
    setIsCinemaMode(false);

    // 3. Mantém o skeleton no PlayerHero enquanto o novo player se conecta
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioningPlayer(false);
      setTransitionDirection(null);

      // 4. Restaura o áudio do usuário de forma limpa
      audioRestoreTimeoutRef.current = setTimeout(() => {
        setIsAudioTransitionMuted(false);
      }, 100);
    }, 450);
  }, [isCinemaMode, isTransitioningPlayer]);

  const isCurrentCanalFavorited = isCanalFavorited(canalAtivo);
  const totalFavoritos = todosCanais.filter((c) => isCanalFavorited(c)).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center mb-3">
          <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-[#00E676] opacity-30"></span>
          <div className="w-10 h-10 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-semibold text-zinc-400">Verificando credenciais...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans antialiased selection:bg-[#00E676] selection:text-black">
      {/* 🚀 HEADER FIXO COM BUSCA, FAVORITOS E NOVO CANAL */}
      <Header
        filtroAtivo={filtroAtivo}
        onSelectFiltro={setFiltroAtivo}
        totalFavoritos={totalFavoritos}
        onOpenAddChannel={() => setIsModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenSubscribers={() => setIsSubscribersModalOpen(true)}
        onOpenRedeemToken={() => setIsRedeemModalOpen(true)}
        onOpenPaymentPlans={() => setIsPaymentModalOpen(true)}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        todosCanais={todosCanais}
        onSelectCanal={handleSelectCanal}
        latencyMode={latencyMode}
        onToggleLatencyMode={handleToggleLatencyMode}
      />

      {/* 📺 PÁGINA PRINCIPAL DO PLAYER AO VIVO: HIERARQUIA HERÓI (~67%) + SIDEBAR (~33%) + CONTEXT RAIL */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status de reprodução & Economia de Internet */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Transmissão Ao Vivo
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tag / Botão rápido de Economia de Internet */}
            <button
              type="button"
              id="live-status-data-saver-btn"
              onClick={() => handleToggleLatencyMode()}
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                latencyMode === 'economy'
                  ? 'bg-emerald-500/15 border-[#00E676]/40 text-[#00E676] font-bold ring-1 ring-[#00E676]/20'
                  : latencyMode === 'stable'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-semibold'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold'
              }`}
              title="Clique para alternar o modo de conexão e consumo de internet"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>
                {latencyMode === 'economy'
                  ? '🍃 Economia Ativa (-75% Dados)'
                  : latencyMode === 'stable'
                  ? '🛡️ Modo HD Equilibrado'
                  : '⚡ Baixa Latência (Live)'}
              </span>
            </button>

            <span className="text-xs text-zinc-500 hidden md:inline">
              Canal em reprodução: <strong className="text-zinc-300">{canalAtivo?.nome}</strong>
            </span>
          </div>
        </div>

        {/* 🌟 BARRA DE NAVEGAÇÃO DE CATEGORIAS RÁPIDAS */}
        <div
          id="quick-categories-bar"
          className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-0.5 select-none"
        >
          {[
            { id: 'Todos' as FiltroAtivo, label: 'Todos os Canais', icon: '⚡', count: todosCanais.length },
            {
              id: 'Esportes' as FiltroAtivo,
              label: 'Esportes Ao Vivo',
              icon: '⚽',
              badge: 'Libertadores & Champions',
              count: todosCanais.filter((c) => c.categoria === 'Esportes').length,
            },
            {
              id: 'Bonecos' as FiltroAtivo,
              label: 'Bonecos & Animes',
              icon: '🧸',
              badge: 'Nick, Cartoon & Disney',
              count: todosCanais.filter((c) => c.categoria === 'Bonecos').length,
            },
            {
              id: 'Filmes' as FiltroAtivo,
              label: 'Filmes & Séries',
              icon: '🍿',
              badge: 'HBO, Telecine & Ação',
              count: todosCanais.filter((c) => c.categoria === 'Filmes' || c.categoria === 'Lazer').length,
            },
            {
              id: 'Novelas' as FiltroAtivo,
              label: 'Novelas & Dramas',
              icon: '🎭',
              badge: 'ZAP Novelas & Televisa',
              count: todosCanais.filter((c) => c.categoria === 'Novelas').length,
            },
            {
              id: 'Portugal' as FiltroAtivo,
              label: 'Portugal',
              icon: '🇵🇹',
              badge: 'RTP, SIC, TVI & Sport TV',
              count: todosCanais.filter((c) => {
                const cName = c.nome.toLowerCase();
                return (
                  c.pais === 'PT' ||
                  cName.includes('portugal') ||
                  cName.includes('rtp') ||
                  cName.includes('sic') ||
                  cName.includes('tvi') ||
                  (c.grupo && c.grupo.toLowerCase().includes('portugal'))
                );
              }).length,
            },
            {
              id: 'Notícias' as FiltroAtivo,
              label: 'Notícias 24h',
              icon: '📰',
              badge: 'SIC & RTP 3',
              count: todosCanais.filter((c) => c.categoria === 'Notícias').length,
            },
            {
              id: 'Músicas' as FiltroAtivo,
              label: 'Músicas & Shows',
              icon: '🎵',
              badge: 'Afro Music & MTV',
              count: todosCanais.filter((c) => c.categoria === 'Músicas').length,
            },
            { id: 'Favoritos' as FiltroAtivo, label: 'Favoritos', icon: '⭐', count: totalFavoritos },
          ].map((cat) => {
            const isActive = filtroAtivo === cat.id;
            return (
              <button
                key={`quick-cat-${cat.id}`}
                type="button"
                id={`btn-category-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setFiltroAtivo(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#00E676] text-black border-[#00E676] shadow-lg shadow-[#00E676]/25 font-extrabold scale-[1.02]'
                    : 'bg-[#121214] text-zinc-300 border-zinc-800/80 hover:border-zinc-700 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
                {cat.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider hidden md:inline-block ${
                      isActive ? 'bg-black/15 text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* GRID HEROICO: PLAYER (~67% LARGURA) + SIDEBAR (~33% LARGURA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA DO PLAYER HERO (COL-SPAN 8) */}
          <div className="lg:col-span-8 w-full">
            <PlayerHero
              canalAtivo={canalAtivo}
              streamIndex={streamIndex}
              onStreamChange={handleManualStreamChange}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              useProxy={useProxy}
              onToggleProxy={() => setUseProxy((prev) => !prev)}
              latencyMode={latencyMode}
              onToggleLatencyMode={handleToggleLatencyMode}
              isCinemaMode={isCinemaMode}
              onEnterCinemaMode={handleEnterCinemaMode}
              isFavorited={isCurrentCanalFavorited}
              onToggleFavorite={() => canalAtivo && toggleFavorite(canalAtivo)}
              failoverNotice={failoverNotice}
              onClearFailoverNotice={() => setFailoverNotice(null)}
              onPlayerError={handlePlayerError}
              onNextCanal={handleNextCanal}
              onPrevCanal={handlePrevCanal}
              onOpenPaymentPlans={() => setIsPaymentModalOpen(true)}
              onOpenRedeemToken={() => setIsRedeemModalOpen(true)}
              isTransitioning={isTransitioningPlayer}
              transitionDirection={transitionDirection}
              isAudioTransitionMuted={isAudioTransitionMuted}
              onVideoEnded={handleVideoEnded}
            />
          </div>

          {/* COLUNA DA SIDEBAR (COL-SPAN 4) */}
          <div className="lg:col-span-4 w-full">
            <ChannelSidebar
              todosCanais={todosCanais}
              canalAtivo={canalAtivo}
              onSelectCanal={handleSelectCanal}
              filtroAtivo={filtroAtivo}
              onSelectFiltro={setFiltroAtivo}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              customChannels={customChannels}
              onDeleteCustomChannel={handleDeleteCustomChannel}
              totalFavoritos={totalFavoritos}
              isAdmin={isAdmin}
              busca={busca}
              onBuscaChange={setBusca}
            />
          </div>
        </div>

        {/* 🎬 BARRA INFERIOR DE CONTEXTO: AGORA NO AR + FAVORITOS RÁPIDOS + CANAIS RELACIONADOS */}
        <NowPlayingRail
          canalAtivo={canalAtivo}
          todosCanais={todosCanais}
          favorites={favorites}
          onSelectCanal={handleSelectCanal}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      {/* 🎭 MODO CINEMA (TELA CHEIA IMERSIVA COM TRANSIÇÃO SUAVE E ANIMAÇÃO EXIT) */}
      <AnimatePresence>
        {isCinemaMode && canalAtivo && (
          <CinemaPlayer
            key="active-cinema-player-modal"
            canalAtivo={canalAtivo}
            streamIndex={streamIndex}
            onStreamChange={handleManualStreamChange}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            useProxy={useProxy}
            onToggleProxy={() => setUseProxy((prev) => !prev)}
            latencyMode={latencyMode}
            onToggleLatencyMode={handleToggleLatencyMode}
            onClose={handleCloseCinemaMode}
            failoverNotice={failoverNotice}
            onClearFailoverNotice={() => setFailoverNotice(null)}
            onPlayerError={handlePlayerError}
            onNextCanal={handleNextCanal}
            onPrevCanal={handlePrevCanal}
            isTransitioning={isTransitioningPlayer}
            transitionDirection={transitionDirection}
            isAudioTransitionMuted={isAudioTransitionMuted}
            onVideoEnded={handleVideoEnded}
          />
        )}
      </AnimatePresence>

      {/* 📝 MODAL DE ADICIONAR CANAL PRÓPRIO */}
      <AddChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddChannel={handleAddCustomChannel}
      />

      {/* 👑 MODAL DE PAINEL ADMIN E GESTÃO DE SESSÕES */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        todosCanais={todosCanais}
        customChannels={customChannels}
        onOpenAddChannel={() => setIsModalOpen(true)}
        onRemoveCustomChannel={(id) => handleDeleteCustomChannel(id)}
        onOpenSubscribers={() => setIsSubscribersModalOpen(true)}
        onOpenPaymentPlans={() => setIsPaymentModalOpen(true)}
      />

      {/* 👥 MODAL MEUS ASSINANTES & GERADOR DE TOKENS (5 CARACTERES) */}
      <SubscribersModal
        isOpen={isSubscribersModalOpen}
        onClose={() => setIsSubscribersModalOpen(false)}
      />

      {/* 🔑 MODAL DE RESGATE DE TOKEN DE ACESSO */}
      <RedeemTokenModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
      />

      {/* 💳 MODAL DE PLANOS & PAGAMENTOS (MULTICAIXA EXPRESS E PAYPAY: 942472983) */}
      <PaymentPlansModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onOpenRedeemToken={() => {
          setIsPaymentModalOpen(false);
          setIsRedeemModalOpen(true);
        }}
      />

      {/* 👤 MODAL DE PERFIL E PLANO DO ESPECTADOR (NÃO-ADMIN) */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        onOpenPaymentPlans={() => {
          setIsUserProfileModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
        onOpenRedeemToken={() => {
          setIsUserProfileModalOpen(false);
          setIsRedeemModalOpen(true);
        }}
      />

      {/* 🔐 MODAL DE AUTENTICAÇÃO / INSCRIÇÃO / MODO CONVIDADO */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </main>
  );
}
