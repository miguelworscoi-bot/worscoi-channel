import React, { useState } from 'react';
import {
  CustomPage,
  upsertCustomPage,
  formatSlug,
} from '@/services/customPagesService';
import { X, Globe, AlertCircle } from 'lucide-react';

interface CreateCustomPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (page: CustomPage) => void;
  initialPage?: CustomPage | null;
}

export const CreateCustomPageModal: React.FC<CreateCustomPageModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialPage,
}) => {
  const [titulo, setTitulo] = useState(initialPage?.titulo || '');
  const [slug, setSlug] = useState(initialPage?.slug || '');
  const [descricao, setDescricao] = useState(initialPage?.descricao || '');
  const [badge, setBadge] = useState(initialPage?.badge || '');
  const [icone, setIcone] = useState(initialPage?.icone || 'link');
  const [tipoConteudo, setTipoConteudo] = useState<'links_list' | 'iframe_embed'>(
    initialPage?.tipoConteudo === 'iframe_embed' ? 'iframe_embed' : 'links_list'
  );
  const [embedUrl, setEmbedUrl] = useState(initialPage?.embedUrl || '');
  const [ativoNoMenu, setAtivoNoMenu] = useState(initialPage?.ativoNoMenu ?? true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTituloChange = (val: string) => {
    setTitulo(val);
    if (!initialPage) {
      setSlug(formatSlug(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Por favor, informe o título da página.');
      return;
    }

    const cleanSlug = formatSlug(slug || titulo);
    if (!cleanSlug) {
      setError('Slug inválido. Use letras, números ou hífens.');
      return;
    }

    if (tipoConteudo === 'iframe_embed' && !embedUrl.trim()) {
      setError('Por favor, insira a URL do iframe/conteúdo embed.');
      return;
    }

    const saved = upsertCustomPage({
      id: initialPage?.id,
      titulo: titulo.trim(),
      slug: cleanSlug,
      descricao: descricao.trim() || undefined,
      badge: badge.trim() || undefined,
      icone,
      tipoConteudo,
      embedUrl: embedUrl.trim() || undefined,
      ativoNoMenu,
      links: initialPage?.links || [],
    });

    onCreated(saved);
    onClose();
  };

  return (
    <div
      id="custom-page-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="custom-page-modal-card"
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {initialPage ? 'Editar Página Personalizada' : 'Criar Página com Links Personalizados'}
              </h3>
              <p className="text-xs text-zinc-400">
                Página dedicada com rota amigável e menu integrado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Título da Página *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Agenda de Jogos, Parceiros VIP, Portais..."
              value={titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Slug da URL (Caminho Amigável) *
            </label>
            <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-400 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30">
              <span className="text-zinc-500 mr-1 select-none">/pagina/</span>
              <input
                type="text"
                required
                placeholder="jogos-do-dia"
                value={slug}
                onChange={(e) => setSlug(formatSlug(e.target.value))}
                className="bg-transparent text-cyan-300 font-mono focus:outline-none flex-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Descreva brevemente o conteúdo desta página..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Badge / Etiqueta
              </label>
              <input
                type="text"
                placeholder="Ex: NOVO, VIP, AO VIVO"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Ícone
              </label>
              <select
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="link">Link</option>
                <option value="calendar">Calendário</option>
                <option value="sparkles">Brilho / VIP</option>
                <option value="globe">Globo / Web</option>
                <option value="tv">Transmissão TV</option>
                <option value="star">Estrela</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Tipo de Conteúdo
              </label>
              <select
                value={tipoConteudo}
                onChange={(e) => setTipoConteudo(e.target.value as 'links_list' | 'iframe_embed')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="links_list">Lista de Links</option>
                <option value="iframe_embed">Embed / Iframe</option>
              </select>
            </div>
          </div>

          {tipoConteudo === 'iframe_embed' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                URL para Incorporar (Embed Iframe) *
              </label>
              <input
                type="url"
                required
                placeholder="https://exemplo.com/widget"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={ativoNoMenu}
                onChange={(e) => setAtivoNoMenu(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-800 text-cyan-500 focus:ring-0"
              />
              <span>Exibir automaticamente no menu lateral e atalhos rápidos</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {initialPage ? 'Salvar Alterações' : 'Criar e Ativar Página'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
