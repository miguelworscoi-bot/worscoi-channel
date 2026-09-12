'use client';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Star,
  Plus,
  RefreshCw,
  Server,
  Trash2,
  X,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { CANAIS_PADRAO } from '@/app/api/canais/route';

export type FiltroAtivo =
  | 'Todos'
  | 'Favoritos'
  | 'Meus Canais'
  | 'beIN Sports'
  | 'ZAP Angola'
  | 'SuperSport'
  | 'Vivo TV'
  | 'Brasil'
  | 'Esportes'
  | 'Notícias'
  | 'Lazer';

export interface Canal {
  id?: string;
  nome: string;
  logo: string;
  url: string;
  backupUrls?: string[];
  categoria?: 'Esportes' | 'Notícias' | 'Lazer';
  pais?: 'BR' | 'AO' | 'Global';
  rede?: 'beIN Sports' | 'ZAP' | 'SuperSport' | 'Vivo' | 'Personalizado' | 'Geral';
  grupo?: string;
  isCustom?: boolean;
}

const LOCAL_STORAGE_FAVORITES_KEY = 'playsports_favorites';
const LOCAL_STORAGE_CUSTOM_KEY = 'playsports_custom_channels';

const FILTROS: Array<{ id: FiltroAtivo; label: string; icon: string }> = [
  { id: 'Todos', label: 'Todos', icon: '⚡' },
  { id: 'Favoritos', label: 'Favoritos', icon: '⭐' },
  { id: 'Meus Canais', label: 'Meus Canais', icon: '📡' },
  { id: 'beIN Sports', label: 'beIN Sports', icon: '🟣' },
  { id: 'ZAP Angola', label: 'ZAP Angola', icon: '🇦🇴' },
  { id: 'SuperSport', label: 'SuperSport', icon: '🏆' },
  { id: 'Vivo TV', label: 'Vivo TV', icon: '📱' },
  { id: 'Brasil', label: 'Brasil', icon: '🇧🇷' },
  { id: 'Esportes', label: 'Esportes', icon: '⚽' },
  { id: 'Notícias', label: 'Notícias', icon: '📰' },
  { id: 'Lazer', label: 'Lazer', icon: '🍿' },
];

export default function Home() {
  const [canais, setCanais] = useState<Canal[]>(CANAIS_PADRAO);
  const [customChannels, setCustomChannels] = useState<Canal[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<Canal | null>(CANAIS_PADRAO[0] || null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Fecha o Modo Cinema com a tecla ESC e previne scroll de fundo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }
    };
    if (isCinemaMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCinemaMode]);

  // Modal de Adicionar Canal Próprio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaUrl, setNovaUrl] = useState('');
  const [novoBackup, setNovoBackup] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<'Esportes' | 'Notícias' | 'Lazer'>('Esportes');
  const [novoLogo, setNovoLogo] = useState('');
  const [formError, setFormError] = useState('');

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
    } catch {
      // Ignora erro de acesso ao localStorage
    }
  }, []);

  // Carrega lista de canais da API
  useEffect(() => {
    fetch('/api/canais')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCanais(data);
          // Se ainda não tiver canal ativo, define o primeiro
          setCanalAtivo((prev) => prev || data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Combina canais da API com os canais personalizados cadastrados pelo usuário
  const todosCanais = [...customChannels, ...canais];

  // Garante que haja um canal ativo quando canais personalizados forem adicionados
  useEffect(() => {
    if (!canalAtivo && todosCanais.length > 0) {
      setCanalAtivo(todosCanais[0]);
    }
  }, [todosCanais, canalAtivo]);

  // Lista de fontes/streams disponíveis para o canal ativo
  const streamsDisponiveis: string[] = canalAtivo
    ? [canalAtivo.url, ...(canalAtivo.backupUrls || [])]
    : [];

  const activeRawStreamUrl = streamsDisponiveis[streamIndex] || canalAtivo?.url || '';
  const finalStreamUrl = useProxy
    ? `/api/proxy?url=${encodeURIComponent(activeRawStreamUrl)}`
    : activeRawStreamUrl;

  const isCanalFavorited = (canal?: Canal | null): boolean => {
    if (!canal) return false;
    if (canal.id && favorites.includes(canal.id)) return true;
    if (canal.url && favorites.includes(canal.url)) return true;
    return false;
  };

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
        // Ignora erro de escrita no localStorage
      }
      return nextFavorites;
    });
  };

  const handleSelectCanal = (canal: Canal) => {
    if (canalAtivo?.url !== canal.url || canalAtivo?.id !== canal.id) {
      setIsReady(false);
      setStreamIndex(0);
      setFailoverNotice(null);
      setCanalAtivo(canal);
    }
  };

  // Failover automático quando o player dispara erro
  const handlePlayerError = () => {
    const nextIndex = streamIndex + 1;
    if (nextIndex < streamsDisponiveis.length) {
      setFailoverNotice(
        `Servidor ${streamIndex + 1} offline. Alternando para o servidor reserva (${nextIndex + 1}/${streamsDisponiveis.length})...`
      );
      setStreamIndex(nextIndex);
      setIsReady(false);
      setTimeout(() => {
        setFailoverNotice(null);
      }, 5000);
    } else {
      setFailoverNotice(
        'Todos os servidores alternativos falharam. Ative o "Modo Proxy Seguro" abaixo ou tente reconectar.'
      );
    }
  };

  const handleManualStreamChange = (newIndex: number) => {
    setIsReady(false);
    setStreamIndex(newIndex);
    setFailoverNotice(null);
  };

  // Criação de canal personalizado
  const handleAddCustomChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novaUrl.trim()) {
      setFormError('Por favor preencha o Nome e a URL do stream.');
      return;
    }

    if (!novaUrl.startsWith('http://') && !novaUrl.startsWith('https://')) {
      setFormError('A URL deve começar com http:// ou https://');
      return;
    }

    const backups: string[] = [];
    if (novoBackup.trim()) {
      backups.push(novoBackup.trim());
    }

    const novoCanal: Canal = {
      id: `custom-${Date.now()}`,
      nome: novoNome.trim(),
      url: novaUrl.trim(),
      backupUrls: backups,
      categoria: novaCategoria,
      pais: 'Global',
      rede: 'Personalizado',
      grupo: 'Meus Canais',
      logo:
        novoLogo.trim() ||
        'https://placehold.co/80x80/065f46/ffffff?text=TV',
      isCustom: true,
    };

    const atualizados = [novoCanal, ...customChannels];
    setCustomChannels(atualizados);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
    } catch {
      // Ignora erro
    }

    // Limpa o formulário e fecha o modal
    setNovoNome('');
    setNovaUrl('');
    setNovoBackup('');
    setNovoLogo('');
    setFormError('');
    setIsModalOpen(false);

    // Seleciona o novo canal imediatamente
    setCanalAtivo(novoCanal);
    setStreamIndex(0);
    setFailoverNotice(null);
  };

  const handleDeleteCustomChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const atualizados = customChannels.filter((c) => c.id !== id);
    setCustomChannels(atualizados);
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(atualizados));
    } catch {
      // Ignora erro
    }

    // Se o canal excluído era o que estava ativo, seleciona o próximo
    if (canalAtivo?.id === id) {
      const proximo = atualizados[0] || canais[0] || null;
      setCanalAtivo(proximo);
      setStreamIndex(0);
    }
  };

  const canaisFiltrados = todosCanais.filter((canal) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca =
      canal.nome.toLowerCase().includes(termoBusca) ||
      (canal.grupo && canal.grupo.toLowerCase().includes(termoBusca)) ||
      (canal.rede && canal.rede.toLowerCase().includes(termoBusca));

    let matchFiltro = true;

    if (filtroAtivo === 'Favoritos') {
      matchFiltro = isCanalFavorited(canal);
    } else if (filtroAtivo === 'Meus Canais') {
      matchFiltro = canal.isCustom === true;
    } else if (filtroAtivo === 'beIN Sports') {
      matchFiltro =
        canal.rede === 'beIN Sports' ||
        canal.nome.toLowerCase().includes('bein');
    } else if (filtroAtivo === 'ZAP Angola') {
      matchFiltro =
        canal.rede === 'ZAP' ||
        canal.pais === 'AO' ||
        canal.nome.toLowerCase().includes('zap') ||
        canal.nome.toLowerCase().includes('angola') ||
        canal.nome.toLowerCase().includes('zimbo');
    } else if (filtroAtivo === 'SuperSport') {
      matchFiltro =
        canal.rede === 'SuperSport' ||
        canal.nome.toLowerCase().includes('supersport') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('supersport'));
    } else if (filtroAtivo === 'Vivo TV') {
      matchFiltro =
        canal.rede === 'Vivo' ||
        canal.nome.toLowerCase().includes('vivo') ||
        (canal.grupo && canal.grupo.toLowerCase().includes('vivo'));
    } else if (filtroAtivo === 'Brasil') {
      matchFiltro = canal.pais === 'BR';
    } else if (filtroAtivo !== 'Todos') {
      matchFiltro = canal.categoria === filtroAtivo;
    }

    return matchBusca && matchFiltro;
  });

  const isCurrentCanalFavorited = isCanalFavorited(canalAtivo);
  const totalFavoritos = todosCanais.filter((c) => isCanalFavorited(c)).length;

  return (
    <main className="min-h-screen bg-[#09090b] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-zinc-100 p-4 md:p-8 font-sans antialiased">
      {/* 🚀 HEADER PREMIUM COM GLASSMORPHISM */}
      <header
        id="main-header"
        className="max-w-7xl mx-auto mb-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-lg shadow-black/40"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-black p-2 rounded-xl font-black shadow-md shadow-emerald-500/20 tracking-tighter text-sm">
            TV
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              PLAY<span className="text-emerald-500">SPORTS</span>
            </h1>
            <p className="text-[11px] text-zinc-500 font-medium hidden md:block">
              beIN Sports &bull; ZAP Angola &bull; SuperSport &bull; Vivo TV &bull; Servidores Redundantes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão para Adicionar Canal Próprio (Garantia de que nunca perde canais) */}
          <button
            type="button"
            id="open-add-channel-modal-btn"
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Canal</span>
          </button>

          {/* Botão de Favoritos */}
          <button
            type="button"
            id="filter-header-favorites"
            onClick={() => setFiltroAtivo('Favoritos')}
            className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
              filtroAtivo === 'Favoritos'
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-zinc-950/60 text-amber-300 border-amber-900/50 hover:border-amber-600'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filtroAtivo === 'Favoritos'
                  ? 'fill-black text-black'
                  : 'fill-amber-400 text-amber-400'
              }`}
            />
            <span>Favoritos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                filtroAtivo === 'Favoritos'
                  ? 'bg-black/20 text-black'
                  : 'bg-amber-950/80 text-amber-400'
              }`}
            >
              {totalFavoritos}
            </span>
          </button>

          {/* Indicador de Status do HLS com Failover Ativo */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase flex items-center gap-1">
              <span>Failover Ativo</span>
            </span>
          </div>
        </div>
      </header>

      <div
        className={`max-w-7xl mx-auto ${
          isCinemaMode ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-8'
        } items-start`}
      >
        {/* 📺 COLUNA DA ESQUERDA: PLAYER PRINCIPAL */}
        <div className={isCinemaMode ? 'w-full' : 'lg:col-span-2 space-y-5'}>
          {canalAtivo ? (
            <div
              id="video-player-container"
              className={
                isCinemaMode
                  ? 'fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden'
                  : 'group relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl shadow-black/80 ring-1 ring-zinc-700/30 transition-all duration-300 hover:ring-emerald-500/30'
              }
            >
              {React.createElement(
                ReactPlayer as unknown as React.ComponentType<
                  Record<string, unknown>
                >,
                {
                  key: `${canalAtivo.id || canalAtivo.url}-${streamIndex}-${useProxy ? 'proxy' : 'direct'}-${isCinemaMode ? 'cinema' : 'normal'}`,
                  url: finalStreamUrl,
                  src: finalStreamUrl,
                  playing: isReady,
                  muted: isMuted,
                  controls: true,
                  width: '100%',
                  height: '100%',
                  playsinline: true,
                  config: { file: { forceHLS: true } },
                  onReady: () => setIsReady(true),
                  onError: handlePlayerError,
                }
              )}

              {/* Controles Flutuantes Superiores: Modo Cinema vs Modo Padrão */}
              {isCinemaMode ? (
                <div
                  id="cinema-mode-top-bar"
                  className="absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between gap-4 pointer-events-auto transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={canalAtivo.logo}
                      alt={canalAtivo.nome}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-contain bg-zinc-900 border border-zinc-700/80 p-1 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/80x80/222222/ffffff?text=TV';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                          Ao Vivo
                        </span>
                        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                          Modo Cinema
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                        {canalAtivo.nome}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Seletor rápido de rota no Modo Cinema */}
                    {streamsDisponiveis.length > 1 && (
                      <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full px-2.5 py-1 text-xs">
                        <span className="text-zinc-400 text-[11px] mr-1 flex items-center gap-1">
                          <Server className="w-3 h-3 text-zinc-500" />
                          <span>Rota:</span>
                        </span>
                        {streamsDisponiveis.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleManualStreamChange(idx)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              streamIndex === idx
                                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {idx === 0 ? 'Principal' : `Reserva ${idx}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {isMuted && (
                      <button
                        type="button"
                        onClick={() => setIsMuted(false)}
                        className="bg-zinc-900/90 hover:bg-black text-amber-300 text-xs px-3 py-1.5 rounded-full border border-amber-500/40 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <span>🔇 Ativar áudio</span>
                      </button>
                    )}

                    {/* Botão de fechar dentro do player para retornar ao layout original */}
                    <button
                      type="button"
                      id="close-cinema-mode-btn"
                      onClick={() => setIsCinemaMode(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/90 hover:bg-red-500 text-white text-xs sm:text-sm font-bold backdrop-blur-md border border-zinc-600/80 hover:border-red-500 transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95 group"
                      title="Fechar Modo Cinema (ESC)"
                    >
                      <Minimize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                      <span>Fechar Modo Cinema</span>
                      <span className="hidden sm:inline-block text-[10px] text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded ml-1 border border-zinc-700">
                        ESC
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Botão flutuante de Modo Cinema no player de vídeo */
                <button
                  type="button"
                  id="video-player-cinema-btn"
                  onClick={() => setIsCinemaMode(true)}
                  className="absolute top-4 left-4 z-10 bg-black/80 hover:bg-black text-zinc-200 hover:text-white text-xs px-3.5 py-1.5 rounded-full border border-zinc-700 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-emerald-500/50 group-hover:opacity-100 opacity-90"
                  title="Ativar Modo Cinema (Expandir tela cheia)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modo Cinema</span>
                </button>
              )}

              {/* Botão flutuante para Desmutar o Áudio (quando em modo normal) */}
              {isMuted && !isCinemaMode && (
                <button
                  type="button"
                  id="unmute-button"
                  onClick={() => setIsMuted(false)}
                  className="absolute top-4 right-4 z-10 bg-black/80 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-full border border-zinc-700 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>🔇 Clique para ativar áudio</span>
                </button>
              )}

              {/* Banner flutuante de Notificação de Troca para Servidor Reserva */}
              {failoverNotice && (
                <div
                  id="failover-notification-banner"
                  className="absolute bottom-4 left-4 right-4 z-20 bg-zinc-900/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-fade-in"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{failoverNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFailoverNotice(null)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              id="video-player-placeholder"
              className="aspect-video bg-zinc-950/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-dashed border-zinc-800 text-zinc-500 animate-pulse"
            >
              <p className="text-sm font-medium">Buscando transmissões ativas...</p>
            </div>
          )}

          {/* Painel de Controle de Redundância e Detalhes do Canal */}
          {canalAtivo && (
            <div
              id="active-channel-details"
              className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4 shadow-md space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Ao Vivo
                    </span>

                    {canalAtivo.isCustom && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>Canal Personalizado</span>
                      </span>
                    )}

                    {canalAtivo.rede === 'beIN Sports' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-purple-500/15 text-purple-300 border-purple-500/30 flex items-center gap-1">
                        <span>🟣</span>
                        <span>beIN Sports</span>
                      </span>
                    )}
                    {(canalAtivo.rede === 'ZAP' || canalAtivo.pais === 'AO') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-orange-500/15 text-orange-400 border-orange-500/30 flex items-center gap-1">
                        <span>🇦🇴</span>
                        <span>ZAP Angola</span>
                      </span>
                    )}
                    {canalAtivo.rede === 'SuperSport' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-indigo-500/15 text-indigo-400 border-indigo-500/30">
                        SuperSport
                      </span>
                    )}
                    {canalAtivo.rede === 'Vivo' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30">
                        Vivo TV
                      </span>
                    )}
                    {canalAtivo.pais === 'BR' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                        🇧🇷 Brasil
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                    {canalAtivo.nome}
                  </h2>
                </div>

                {/* Botões de Ação do Canal (Modo Cinema e Favoritos) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="details-cinema-mode-btn"
                    onClick={() => setIsCinemaMode(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                    title="Ocultar lateral e expandir player para a tela inteira"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Modo Cinema</span>
                  </button>

                  <button
                    type="button"
                    id="active-channel-favorite-btn"
                    onClick={() => toggleFavorite(canalAtivo)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isCurrentCanalFavorited
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                    title={
                      isCurrentCanalFavorited
                        ? 'Remover canal dos favoritos'
                        : 'Marcar canal como favorito'
                    }
                  >
                    <Star
                      className={`w-4 h-4 transition-transform active:scale-125 ${
                        isCurrentCanalFavorited
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-current'
                      }`}
                    />
                    <span>
                      {isCurrentCanalFavorited ? 'Favorito' : 'Favoritar'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 🛡️ SELEÇÃO DE SERVIDORES DE BACKUP / REDUNDÂNCIA */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Servidor / Rota:</span>
                  </span>

                  {streamsDisponiveis.map((_, idx) => {
                    const isSelected = streamIndex === idx;
                    const label =
                      idx === 0
                        ? 'Principal'
                        : `Reserva ${idx}`;

                    return (
                      <button
                        key={idx}
                        id={`stream-source-selector-${idx}`}
                        type="button"
                        onClick={() => handleManualStreamChange(idx)}
                        className={`px-2.5 py-1 rounded-md border font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                            : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-3 h-3 text-black" />
                        )}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Opções Avançadas: Recarregar e Modo Proxy Anti-Bloqueio */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="toggle-safe-proxy-btn"
                    onClick={() => {
                      setUseProxy((prev) => !prev);
                      setIsReady(false);
                    }}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      useProxy
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                    title="Contorna bloqueios de CORS e restrições de User-Agent via servidor"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Proxy Seguro: {useProxy ? 'Ativado' : 'Direto'}</span>
                  </button>

                  <button
                    type="button"
                    id="reload-stream-btn"
                    onClick={() => {
                      setIsReady(false);
                      setFailoverNotice(null);
                    }}
                    className="p-1 rounded-md bg-zinc-950/60 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all cursor-pointer"
                    title="Recarregar transmissão"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔍 COLUNA DA DIREITA: BUSCA E LISTAGEM */}
        {!isCinemaMode && (
          <div
            id="channels-sidebar-panel"
            className="bg-zinc-900/30 backdrop-blur-md p-5 rounded-2xl border border-zinc-800/80 h-[660px] flex flex-col shadow-xl shadow-black/50"
          >
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-zinc-400 text-xs tracking-wider uppercase">
                Filtrar Canais
              </h3>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                {canaisFiltrados.length}{' '}
                {canaisFiltrados.length === 1 ? 'canal' : 'canais'}
              </span>
            </div>

            {/* Chips Roláveis de Filtros Rápidos */}
            <div
              id="filter-buttons-bar"
              className="flex items-center gap-1 p-1 bg-zinc-950/70 rounded-xl border border-zinc-800/80 mb-3 overflow-x-auto custom-scrollbar pb-1"
            >
              {FILTROS.map((filtro) => {
                const count =
                  filtro.id === 'Todos'
                    ? todosCanais.length
                    : filtro.id === 'Favoritos'
                    ? totalFavoritos
                    : filtro.id === 'Meus Canais'
                    ? customChannels.length
                    : filtro.id === 'beIN Sports'
                    ? todosCanais.filter(
                        (c) =>
                          c.rede === 'beIN Sports' ||
                          c.nome.toLowerCase().includes('bein')
                      ).length
                    : filtro.id === 'ZAP Angola'
                    ? todosCanais.filter(
                        (c) =>
                          c.rede === 'ZAP' ||
                          c.pais === 'AO' ||
                          c.nome.toLowerCase().includes('zap') ||
                          c.nome.toLowerCase().includes('angola') ||
                          c.nome.toLowerCase().includes('zimbo')
                      ).length
                    : filtro.id === 'SuperSport'
                    ? todosCanais.filter(
                        (c) =>
                          c.rede === 'SuperSport' ||
                          c.nome.toLowerCase().includes('supersport')
                      ).length
                    : filtro.id === 'Vivo TV'
                    ? todosCanais.filter(
                        (c) =>
                          c.rede === 'Vivo' ||
                          c.nome.toLowerCase().includes('vivo')
                      ).length
                    : filtro.id === 'Brasil'
                    ? todosCanais.filter((c) => c.pais === 'BR').length
                    : todosCanais.filter((c) => c.categoria === filtro.id).length;

                const isSelected = filtroAtivo === filtro.id;

                return (
                  <button
                    key={filtro.id}
                    id={`filter-chip-${filtro.id.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => setFiltroAtivo(filtro.id)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0 select-none ${
                      isSelected
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="text-xs">{filtro.icon}</span>
                    <span>{filtro.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded-full leading-none font-bold ${
                          isSelected
                            ? 'bg-black/20 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* INPUT ESTILIZADO COM FOCO NEON */}
            <div className="relative">
              <input
                id="channel-search-input"
                type="text"
                placeholder="Buscar por emissora ou esporte..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 shadow-inner"
              />
              <span className="absolute left-3.5 top-3 text-zinc-500 text-xs">
                🔍
              </span>
            </div>
          </div>

          {/* LISTA COM EFEITOS DE HOVER E SCROLL ESCONDIDO */}
          <div
            id="channels-scroll-container"
            className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar"
          >
            {loading ? (
              // SKELETON ANIMADO ENQUANTO CARREGA
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full flex items-center gap-4 p-3 bg-zinc-900/40 border border-zinc-800/40 rounded-xl animate-pulse"
                >
                  <div className="w-11 h-11 bg-zinc-800 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-zinc-800 rounded w-2/3"></div>
                    <div className="h-2.5 bg-zinc-800 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : canaisFiltrados.length > 0 ? (
              canaisFiltrados.map((canal, index) => {
                const isActive =
                  canalAtivo?.id && canal.id
                    ? canalAtivo.id === canal.id
                    : canalAtivo?.url === canal.url;
                const isFavorited = isCanalFavorited(canal);
                const uniqueKey =
                  canal.id || `canal-${canal.url}-${canal.nome}-${index}`;

                return (
                  <div
                    key={uniqueKey}
                    id={`channel-card-${index}`}
                    onClick={() => handleSelectCanal(canal)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none group ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                        : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {/* Botão de Estrela (Favoritos) */}
                    <button
                      type="button"
                      id={`channel-favorite-toggle-${index}`}
                      title={
                        isFavorited
                          ? `Remover ${canal.nome} dos favoritos`
                          : `Adicionar ${canal.nome} aos favoritos`
                      }
                      aria-label={
                        isFavorited
                          ? `Remover ${canal.nome} dos favoritos`
                          : `Adicionar ${canal.nome} aos favoritos`
                      }
                      onClick={(e) => toggleFavorite(canal, e)}
                      className={`p-1.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                        isFavorited
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                          : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isFavorited
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]'
                            : 'text-current group-hover:text-zinc-400'
                        }`}
                      />
                    </button>

                    {/* Logo com indicador de ativo */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={canal.logo}
                        alt={canal.nome}
                        className="w-11 h-11 rounded-lg object-contain bg-zinc-950 border border-zinc-800/80 shadow-sm p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/80x80/222222/ffffff?text=TV';
                        }}
                      />
                      {isActive && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="truncate flex-1 min-w-0">
                      <p className="font-semibold text-sm tracking-tight truncate">
                        {canal.nome}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                        {canal.isCustom ? (
                          <span className="text-emerald-400 font-medium">Personalizado</span>
                        ) : canal.rede === 'beIN Sports' ? (
                          <span className="text-purple-400 font-medium">beIN Sports</span>
                        ) : canal.rede === 'ZAP' || canal.pais === 'AO' ? (
                          <span className="text-orange-400 font-medium">ZAP Angola</span>
                        ) : canal.rede === 'SuperSport' ? (
                          <span className="text-indigo-400 font-medium">SuperSport</span>
                        ) : canal.rede === 'Vivo' ? (
                          <span className="text-fuchsia-400 font-medium">Vivo TV</span>
                        ) : canal.pais === 'BR' ? (
                          <span className="text-yellow-400 font-medium">Brasil TV</span>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                            <span>Fonte Externa</span>
                          </>
                        )}
                        {canal.backupUrls && canal.backupUrls.length > 0 && (
                          <span className="text-emerald-500/80 text-[10px] font-bold">
                            &bull; +{canal.backupUrls.length} backup
                          </span>
                        )}
                        {canal.categoria && (
                          <span className="text-zinc-400 text-[10px]">
                            &bull; {canal.categoria}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Se for canal personalizado, permite excluir */}
                    {canal.isCustom && canal.id && (
                      <button
                        type="button"
                        id={`delete-custom-channel-${index}`}
                        onClick={(e) => handleDeleteCustomChannel(canal.id!, e)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800/80 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir este canal personalizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-zinc-600 text-sm py-12 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">📡</span>
                <p>Nenhum resultado para &quot;{busca}&quot;</p>
                {filtroAtivo !== 'Todos' && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusca('');
                      setFiltroAtivo('Todos');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer mt-1"
                  >
                    Ver todos os canais
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* 📝 MODAL DE ADICIONAR CANAL PERSONALIZADO */}
      {isModalOpen && (
        <div
          id="add-channel-modal-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="add-channel-modal-card"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Adicionar Canal Próprio</h3>
                  <p className="text-xs text-zinc-400">
                    Ficará salvo permanentemente no seu navegador.
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-add-channel-modal-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError('');
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Canal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ESPN Brasil, SporTV, Meu Stream..."
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL da Transmissão (HLS .m3u8) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://exemplo.com/stream/playlist.m3u8"
                  value={novaUrl}
                  onChange={(e) => setNovaUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL do Servidor Reserva / Backup (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://backup.exemplo.com/playlist.m3u8"
                  value={novoBackup}
                  onChange={(e) => setNovoBackup(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Se a URL principal falhar, o aplicativo alternará para esta automaticamente.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) =>
                      setNovaCategoria(
                        e.target.value as 'Esportes' | 'Notícias' | 'Lazer'
                      )
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Esportes">Esportes</option>
                    <option value="Notícias">Notícias</option>
                    <option value="Lazer">Lazer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    URL do Logotipo (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../logo.png"
                    value={novoLogo}
                    onChange={(e) => setNovoLogo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="submit-add-channel-btn"
                  className="px-5 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Salvar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
