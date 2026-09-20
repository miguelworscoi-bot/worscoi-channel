import React, { useState } from 'react';
import {
  CustomPage,
  CustomLinkItem,
  addLinkToPage,
  removeLinkFromPage,
} from '@/services/customPagesService';
import { Canal } from '@/types';
import {
  Tv,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Sparkles,
  ArrowLeft,
  Calendar,
  Star,
  Link as LinkIcon,
  Layers,
} from 'lucide-react';

interface CustomPageViewProps {
  page: CustomPage;
  isAdmin: boolean;
  todosCanais: Canal[];
  onPlayChannel: (canal: Canal) => void;
  onBackToExplore: () => void;
  onPageUpdated?: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  isAdmin,
  todosCanais,
  onPlayChannel,
  onBackToExplore,
  onPageUpdated,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPageUrl, setCopiedPageUrl] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  // Formulário de novo link
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaUrl, setNovaUrl] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Geral');
  const [novoIcone, setNovoIcone] = useState('link');
  const [novoDestaque, setNovoDestaque] = useState(false);

  const handleCopyPageUrl = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/pagina/${page.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPageUrl(true);
      setTimeout(() => setCopiedPageUrl(false), 2200);
    });
  };

  const handleCopyItemUrl = (id: string, url: string) => {
    const fullUrl = url.startsWith('/') && typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const handleLinkClick = (item: CustomLinkItem) => {
    // Se for link interno para canal (?canal=slug ou /?canal=id)
    if (item.url.includes('canal=')) {
      const match = item.url.match(/canal=([^&]+)/);
      if (match && match[1]) {
        const canalSlugOrId = decodeURIComponent(match[1]).toLowerCase();
        const found = todosCanais.find(
          (c) =>
            (c.id && c.id.toLowerCase() === canalSlugOrId) ||
            (c.nome && c.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') === canalSlugOrId) ||
            (c.nome && c.nome.toLowerCase().includes(canalSlugOrId))
        );
        if (found) {
          onPlayChannel(found);
          return;
        }
      }
    }

    // Se for link relativo interno da aplicação
    if (item.url.startsWith('/')) {
      window.location.href = item.url;
      return;
    }

    // Link externo
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaUrl.trim()) return;

    addLinkToPage(page.id, {
      titulo: novoTitulo.trim(),
      url: novaUrl.trim(),
      descricao: novaDescricao.trim() || undefined,
      categoria: novaCategoria.trim() || undefined,
      icone: novoIcone,
      destaque: novoDestaque,
    });

    setNovoTitulo('');
    setNovaUrl('');
    setNovaDescricao('');
    setNovaCategoria('Geral');
    setNovoIcone('link');
    setNovoDestaque(false);
    setIsAddLinkOpen(false);

    if (onPageUpdated) onPageUpdated();
  };

  const handleRemoveLink = (linkId: string) => {
    if (confirm('Deseja remover este link personalizado desta página?')) {
      removeLinkFromPage(page.id, linkId);
      if (onPageUpdated) onPageUpdated();
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'star':
        return <Star className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'globe':
        return <Globe className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onBackToExplore}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer shrink-0 mt-0.5"
              title="Voltar para a Grade Ao Vivo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {page.titulo}
                </h1>
                {page.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {page.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {page.descricao || 'Página personalizada com links e atalhos rápidos.'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
                <span>URL Direta:</span>
                <code className="px-2 py-0.5 rounded bg-zinc-950 text-cyan-300 font-mono text-[10px] border border-zinc-800">
                  /pagina/{page.slug}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleCopyPageUrl}
              className="px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
              title="Copiar URL amigável desta página"
            >
              {copiedPageUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Compartilhar Página</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAddLinkOpen(!isAddLinkOpen)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Link</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FORMULÁRIO COLAPSÁVEL DE NOVO LINK (ADMIN) */}
      {isAddLinkOpen && (
        <div className="p-5 rounded-2xl bg-zinc-950 border border-cyan-500/40 shadow-xl animate-in slide-in-from-top-3 duration-150">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Adicionar Novo Link a "{page.titulo}"</span>
          </h3>

          <form onSubmit={handleCreateLink} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Título do Link *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assista ZAP Sports 1, Tabela Oficial..."
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">URL de Destino ou Canal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: /?canal=zap-sports-1 ou https://ge.globo.com"
                  value={novaUrl}
                  onChange={(e) => setNovaUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Descrição Breve</label>
                <input
                  type="text"
                  placeholder="Ex: Transmissão ao vivo em Alta Definição"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Ao Vivo, Tabela, Parceria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Ícone</label>
                <select
                  value={novoIcone}
                  onChange={(e) => setNovoIcone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="tv">Transmissão (TV)</option>
                  <option value="star">Destaque (Estrela)</option>
                  <option value="calendar">Calendário (Jogos)</option>
                  <option value="globe">Portal Web (Globo)</option>
                  <option value="sparkles">VIP (Brilho)</option>
                  <option value="link">Link Padrão</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={novoDestaque}
                  onChange={(e) => setNovoDestaque(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-800 text-cyan-500 focus:ring-0"
                />
                <span>Destacar este link com borda e cor especial</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLinkOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition shadow-sm"
                >
                  Salvar Link
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* EMBED IFRAME (SE FOR UMA PÁGINA EMBEDDED) */}
      {page.tipoConteudo === 'iframe_embed' && page.embedUrl && (
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-video w-full shadow-2xl">
          <iframe
            src={page.embedUrl}
            title={page.titulo}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      {/* GRADE DE LINKS DA PÁGINA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Links e Atalhos Disponíveis ({page.links.length})</span>
          </h2>
        </div>

        {page.links.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 text-zinc-400 space-y-2">
            <LinkIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">Nenhum link adicionado ainda</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Utilize o botão acima para adicionar URLs personalizadas, canais da grade ou portais externos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {page.links.map((item) => {
              const isDirectCanal = item.url.includes('canal=');
              return (
                <div
                  key={item.id}
                  onClick={() => handleLinkClick(item)}
                  className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                    item.destaque
                      ? 'bg-gradient-to-br from-cyan-950/25 via-zinc-900/90 to-zinc-950 border-cyan-500/40 hover:border-cyan-400/80 shadow-cyan-500/5'
                      : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-110 ${
                            item.destaque
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {renderIcon(item.icone)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {item.titulo}
                          </h3>
                          {item.categoria && (
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {item.categoria}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleCopyItemUrl(item.id, item.url)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                          title="Copiar URL deste link"
                        >
                          {copiedLink === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(item.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remover link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {item.descricao && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-mono truncate max-w-[240px]">
                      {item.url}
                    </span>

                    <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>{isDirectCanal ? 'Assistir Agora' : 'Abrir Link'}</span>
                      {isDirectCanal ? (
                        <Tv className="w-3 h-3" />
                      ) : (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
