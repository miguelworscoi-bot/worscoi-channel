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
  const { user, loading: authLoading, isAdmin } = useAuth();
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
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

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
      }, 5000);
    } else {
      setFailoverNotice(
        'Sinal temporariamente instável neste canal. Tente recarregar ou escolha outro canal.'
      );
    }
  };

  const handleManualStreamChange = (newIndex: number) => {
    setStreamIndex(newIndex);
    setFailoverNotice(null);
  };

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

  if (!user) {
    return <AuthModal />;
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
              onNextCanal={handleNextCanal}
              onPrevCanal={handlePrevCanal}
              onOpenPaymentPlans={() => setIsPaymentModalOpen(true)}
              onOpenRedeemToken={() => setIsRedeemModalOpen(true)}
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
          onNextCanal={handleNextCanal}
          onPrevCanal={handlePrevCanal}
        />
      )}

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
    </main>
  );
}
