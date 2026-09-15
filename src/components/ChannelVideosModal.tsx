'use client';
import React, { useState, useMemo } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  Film,
  Zap,
  Sparkles,
  Plus,
  Search,
  Radio,
  MonitorPlay,
  Check,
} from 'lucide-react';
import { Canal } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { getChannelLogo, getChannelFallbackLogo } from '@/utils/channelLogoUtils';

interface ChannelVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  canal: Canal | null;
  streamIndex: number;
  onSelectStream: (index: number) => void;
  onAddStreamUrl?: (url: string) => void;
}

// Extrai o ID do YouTube a partir de qualquer formato de link
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|watch|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

// Títulos conhecidos para vídeos populares de canais do YouTube
const KNOWN_VIDEO_TITLES: Record<string, string> = {
  '0e3GPea1Tyg': '$456,000 Batata Quente / Squid Game na Vida Real',
  '9bqk6ZUsKyA': 'Quarto de Hotel de $1 vs $1,000,000!',
  'gHzuabZUd6c': 'Passagem de Avião de $1 vs $500,000!',
  'kJu5VMN3yow': 'Sobrevivi 50 Horas na Antártida',
  '6Ka3X_wlZLU': 'Desafio Extremo de Minecraft com Amigos',
  'nO2dMO3BUO4': 'Esconde-Esconde Extremo no Parque de Diversões',
  'LVhFuyABxBE': 'Real Life Trick Shots 2 - As Melhores Jogadas',
  'hFZFjoX2cGg': 'World Record Trick Shots - Recordes Mundiais',
  'd1fMvE-f2z8': 'Futebol 1v1 e Desafios de Habilidade em Família',
  '0y4ZT2aaK1k': 'Street Football & Dribles Lendários na Rua',
  '-5DfExCscBE': 'Panna Knock Out & Freestyle Skills de Elite',
  'XqSrz6MKVlk': 'Melhores Momentos e Bastidores do Treino',
  'x6VWj8JeyIU': 'Rap do Anime - Especial Acústico e Clipes',
  'jy0sGTbP3Qs': 'O que Acontece se Você Cair em um Buraco Negro?',
  'aFwcrt0LfjY': 'A Física por Trás das Coisas Mais Estranhas do Universo',
  'zbpK7KTLoLg': 'Desafio 1x1 de Basquete na Quadra dos Sonhos',
};

export function ChannelVideosModal({
  isOpen,
  onClose,
  canal,
  streamIndex,
  onSelectStream,
  onAddStreamUrl,
}: ChannelVideosModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Lista consolidada de vídeos/transmissões do canal
  const videoStreams = useMemo(() => {
    if (!canal) return [];
    const list = [canal.url, ...(canal.backupUrls || [])];
    return list.map((url, idx) => {
      const ytId = extractYouTubeId(url);
      const isYt = Boolean(ytId);
      const knownTitle = ytId ? KNOWN_VIDEO_TITLES[ytId] : undefined;
      const title =
        knownTitle ||
        (idx === 0
          ? `${canal.nome} • Transmissão Principal`
          : `${canal.nome} • Vídeo / Sinal ${idx + 1}`);

      const thumbnail = ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : getChannelLogo(canal);

      return {
        index: idx,
        url,
        isYouTube: isYt,
        youtubeId: ytId,
        title,
        thumbnail,
        isHls: url.includes('.m3u8'),
      };
    });
  }, [canal]);

  // Filtro de busca
  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) return videoStreams;
    const term = searchTerm.toLowerCase();
    return videoStreams.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        (v.youtubeId && v.youtubeId.toLowerCase().includes(term)) ||
        v.url.toLowerCase().includes(term)
    );
  }, [videoStreams, searchTerm]);

  if (!isOpen || !canal) return null;

  const handleSelectVideo = (index: number) => {
    onSelectStream(index);
    setAddedNotice(`Vídeo selecionado! Reproduzindo no player do nosso sistema.`);
    setTimeout(() => {
      setAddedNotice(null);
      onClose();
    }, 700);
  };

  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = customUrlInput.trim();
    if (!cleanUrl) return;

    if (onAddStreamUrl) {
      onAddStreamUrl(cleanUrl);
      setCustomUrlInput('');
      setShowAddForm(false);
      setAddedNotice(`Novo vídeo adicionado! Reproduzindo agora no nosso player.`);
      setTimeout(() => {
        setAddedNotice(null);
        onClose();
      }, 900);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 select-none">
        {/* Backdrop escurecido com blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Card Modal Principal */}
        <motion.div
          id="channel-videos-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[88vh] bg-[#0d0d11] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* TOPO: CABEÇALHO DO CANAL */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-red-950/30 via-zinc-900/60 to-zinc-900/40 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo do canal */}
              <div className="relative shrink-0 p-0.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-md">
                <img
                  src={getChannelLogo(canal)}
                  alt={canal.nome}
                  className="w-11 h-11 rounded-[10px] object-cover bg-zinc-950"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getChannelFallbackLogo(canal);
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                    Vídeos do Canal • {canal.nome}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    <span>{videoStreams.length} {videoStreams.length === 1 ? 'vídeo' : 'vídeos'}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                  <span className="text-zinc-300 font-medium">
                    Reprodução 100% no player do sistema (sem abrir novas abas)
                  </span>
                </p>
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              type="button"
              id="close-channel-videos-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer shrink-0 border border-zinc-700/50"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BARRA DE AÇÕES: BUSCA E BOTÃO DE ADICIONAR VÍDEO DO CANAL */}
          <div className="p-3 sm:px-5 sm:py-3 border-b border-zinc-800/60 bg-zinc-950/50 flex items-center justify-between gap-2.5 flex-wrap shrink-0">
            {/* Campo de pesquisa */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar vídeos deste canal..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Alternador do formulário de link personalizado */}
            {onAddStreamUrl && (
              <button
                type="button"
                id="toggle-add-video-form-btn"
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  showAddForm
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
                }`}
              >
                <Plus className={`w-3.5 h-3.5 text-red-400 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                <span>{showAddForm ? 'Fechar link' : 'Assistir outro link do canal'}</span>
              </button>
            )}
          </div>

          {/* FORMULÁRIO EXPANSÍVEL: ADICIONAR OUTRO VÍDEO DESTE CANAL */}
          {showAddForm && onAddStreamUrl && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddCustomVideo}
              className="p-3 sm:px-5 bg-red-950/20 border-b border-red-500/20 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Cole aqui o link de outro vídeo do YouTube (ex: https://youtube.com/watch?v=...)"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-red-500/40 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition shrink-0"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>Reproduzir no Nosso Player</span>
              </button>
            </motion.form>
          )}

          {/* FEEDBACK DE VÍDEO SELECIONADO */}
          {addedNotice && (
            <div className="px-4 py-2 bg-[#00E676]/15 border-b border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 animate-bounce" />
              <span>{addedNotice}</span>
            </div>
          )}

          {/* LISTA ROLÁVEL DE VÍDEOS */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar bg-[#09090c]">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-10 px-4 text-zinc-500">
                <Film className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                <p className="text-sm font-semibold text-zinc-300">Nenhum vídeo encontrado</p>
                <p className="text-xs text-zinc-500 mt-1">Tente remover o filtro de pesquisa acima.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredVideos.map((video) => {
                  const isCurrentActive = streamIndex === video.index;

                  return (
                    <div
                      key={`video-item-${video.index}`}
                      id={`channel-video-card-${video.index}`}
                      onClick={() => handleSelectVideo(video.index)}
                      className={`group relative rounded-xl border p-3 flex gap-3 transition-all cursor-pointer select-none ${
                        isCurrentActive
                          ? 'bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 border-red-500/70 shadow-lg shadow-red-950/40 ring-1 ring-red-500/50 scale-[1.01]'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-red-500/40 hover:scale-[1.01]'
                      }`}
                    >
                      {/* THUMBNAIL DO VÍDEO */}
                      <div className="relative w-28 h-18 sm:w-32 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                        <img
                          src={video.thumbnail}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getChannelFallbackLogo(canal);
                          }}
                        />

                        {/* Selo No Ar / Ativo */}
                        {isCurrentActive ? (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 text-[#00E676]">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[10px] font-black uppercase">
                              <Radio className="w-3 h-3 text-[#00E676] animate-pulse" />
                              <span>No Ar</span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition">
                            <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Duração ou Badge do Formato */}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-bold text-zinc-300 border border-zinc-700/60">
                          {video.isYouTube ? 'YouTube HD' : 'HD Satélite'}
                        </div>
                      </div>

                      {/* DETALHES DO VÍDEO */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                              #{video.index + 1}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[10px] font-bold text-[#00E676] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Vídeo Atual</span>
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-xs font-bold line-clamp-2 leading-tight transition-colors ${
                              isCurrentActive
                                ? 'text-white'
                                : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            {video.title}
                          </h4>
                        </div>

                        {/* BOTÃO DE AÇÃO */}
                        <div className="mt-2 pt-1 border-t border-zinc-800/60 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-300">
                            {isCurrentActive
                              ? 'Tocando no sistema'
                              : 'Clique para reproduzir'}
                          </span>

                          <button
                            type="button"
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                              isCurrentActive
                                ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                                : 'bg-red-600/90 hover:bg-red-500 text-white shadow-sm'
                            }`}
                          >
                            {isCurrentActive ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Ativo</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-white" />
                                <span>Assistir Aqui</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RODAPÉ INFORMATIVO */}
          <div className="p-3 sm:px-5 sm:py-3 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between gap-2 text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Ao escolher qualquer vídeo, ele carrega instantaneamente no player central.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold cursor-pointer shrink-0 transition"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
