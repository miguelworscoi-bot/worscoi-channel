'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Canal, FiltroAtivo } from '@/types';
import { CANAIS_PADRAO } from '@/app/api/canais/route';
import { Header } from '@/components/Header';
import { PlayerHero } from '@/components/PlayerHero';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { NowPlayingRail } from '@/components/NowPlayingRail';
import { CinemaPlayer } from '@/components/CinemaPlayer';
import { AddChannelModal } from '@/components/AddChannelModal';

const LOCAL_STORAGE_FAVORITES_KEY = 'playsports_favorites';
const LOCAL_STORAGE_CUSTOM_KEY = 'playsports_custom_channels';

export default function Home() {
  const [canais, setCanais] = useState<Canal[]>(CANAIS_PADRAO);
  const [customChannels, setCustomChannels] = useState<Canal[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<Canal | null>(CANAIS_PADRAO[0] || null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Carrega lista atualizada de canais da API (com fallback nos canais padrão já montados)
  useEffect(() => {
    fetch('/api/canais')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCanais(data);
          setCanalAtivo((prev) => prev || data[0]);
        }
      })
      .catch(() => {
        // Mantém CANAIS_PADRAO já carregados
      });
  }, []);

  // Combina canais personalizados com os canais da API
  const todosCanais = [...customChannels, ...canais];

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

  // Failover automático quando o player dispara erro
  const handlePlayerError = () => {
    if (!canalAtivo) return;
    const streams = [canalAtivo.url, ...(canalAtivo.backupUrls || [])];
    const nextIndex = streamIndex + 1;

    if (nextIndex < streams.length) {
      setFailoverNotice(
        `Servidor ${streamIndex + 1} indisponível. Alternando para o servidor reserva (${nextIndex + 1}/${streams.length})...`
      );
      setStreamIndex(nextIndex);
      setTimeout(() => {
        setFailoverNotice(null);
      }, 6000);
    } else {
      setFailoverNotice(
        'Todos os servidores alternativos falharam. Ative o "Proxy Seguro" ou tente recarregar.'
      );
    }
  };

  const handleManualStreamChange = (newIndex: number) => {
    setStreamIndex(newIndex);
    setFailoverNotice(null);
  };

  // Salvar novo canal personalizado
  const handleAddCustomChannel = (novoCanal: Canal) => {
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

  // Excluir canal personalizado
  const handleDeleteCustomChannel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const isCurrentCanalFavorited = isCanalFavorited(canalAtivo);
  const totalFavoritos = todosCanais.filter((c) => isCanalFavorited(c)).length;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans antialiased selection:bg-[#00E676] selection:text-black">
      {/* 🚀 HEADER FIXO COM BUSCA, FAVORITOS E NOVO CANAL */}
      <Header
        filtroAtivo={filtroAtivo}
        onSelectFiltro={setFiltroAtivo}
        totalFavoritos={totalFavoritos}
        onOpenAddChannel={() => setIsModalOpen(true)}
        todosCanais={todosCanais}
        onSelectCanal={handleSelectCanal}
      />

      {/* 📺 PÁGINA PRINCIPAL DO PLAYER AO VIVO: HIERARQUIA HERÓI (~67%) + SIDEBAR (~33%) + CONTEXT RAIL */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status de reprodução */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Transmissão Ao Vivo
            </h1>
          </div>

          <span className="text-xs text-zinc-500 hidden sm:inline">
            Canal em reprodução: <strong className="text-zinc-300">{canalAtivo?.nome}</strong>
          </span>
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
              onEnterCinemaMode={() => setIsCinemaMode(true)}
              isFavorited={isCurrentCanalFavorited}
              onToggleFavorite={() => canalAtivo && toggleFavorite(canalAtivo)}
              failoverNotice={failoverNotice}
              onClearFailoverNotice={() => setFailoverNotice(null)}
              onPlayerError={handlePlayerError}
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

      {/* 🎭 MODO CINEMA (TELA CHEIA IMERSIVA) */}
      {isCinemaMode && canalAtivo && (
        <CinemaPlayer
          canalAtivo={canalAtivo}
          streamIndex={streamIndex}
          onStreamChange={handleManualStreamChange}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          useProxy={useProxy}
          onClose={() => setIsCinemaMode(false)}
          failoverNotice={failoverNotice}
          onClearFailoverNotice={() => setFailoverNotice(null)}
          onPlayerError={handlePlayerError}
        />
      )}

      {/* 📝 MODAL DE ADICIONAR CANAL PRÓPRIO */}
      <AddChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddChannel={handleAddCustomChannel}
      />
    </main>
  );
}
