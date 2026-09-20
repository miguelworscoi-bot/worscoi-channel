import React, { useState } from 'react';
import { CustomPage } from '@/services/customPagesService';
import { Canal } from '@/types';
import {
  Share2,
  Copy,
  Check,
  Tv,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface ChannelShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  canal: Canal | null;
  customPages?: CustomPage[];
  onNavigateToCustomPage?: (slug: string) => void;
}

export const ChannelShareModal: React.FC<ChannelShareModalProps> = ({
  isOpen,
  onClose,
  canal,
  customPages = [],
  onNavigateToCustomPage,
}) => {
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedPageSlug, setCopiedPageSlug] = useState<string | null>(null);

  if (!isOpen || !canal) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const channelIdentifier = canal.id || canal.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const directChannelUrl = `${origin}/?canal=${encodeURIComponent(channelIdentifier)}`;

  const handleCopyDirect = () => {
    navigator.clipboard.writeText(directChannelUrl).then(() => {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2200);
    });
  };

  const handleCopyCustomPageUrl = (slug: string) => {
    const pageUrl = `${origin}/pagina/${slug}?canal=${encodeURIComponent(channelIdentifier)}`;
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopiedPageSlug(slug);
      setTimeout(() => setCopiedPageSlug(null), 2000);
    });
  };

  return (
    <div
      id="share-channel-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="share-channel-modal-card"
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Compartilhar Transmissão
              </h3>
              <p className="text-xs text-zinc-400">
                Links diretos e páginas personalizadas para "{canal.nome}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* LINK DIRETO DO CANAL */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>Link Personalizado Direto do Canal</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Ao Vivo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directChannelUrl}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyDirect}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shrink-0"
            >
              {copiedGeneral ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Qualquer usuário que abrir esse link iniciará diretamente a transmissão deste canal no player.
          </p>
        </div>

        {/* PÁGINAS PERSONALIZADAS QUE CONTÊM ESSE CANAL OU ESTÃO ATIVAS */}
        {customPages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Páginas com Links Personalizados Ativas ({customPages.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {customPages.map((page) => (
                <div
                  key={page.id}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 text-xs transition"
                >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{page.titulo}</span>
                        {page.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {page.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">/pagina/{page.slug}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyCustomPageUrl(page.slug)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition"
                        title="Copiar link desta página"
                      >
                        {copiedPageSlug === page.slug ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{copiedPageSlug === page.slug ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      {onNavigateToCustomPage && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToCustomPage(page.slug);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 hover:text-black text-cyan-400 transition"
                          title="Abrir página"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
