'use client';
import React, { useState } from 'react';
import { Radio, X, AlertCircle, Plus } from 'lucide-react';
import { Canal } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (canal: Canal) => void;
}

export function AddChannelModal({
  isOpen,
  onClose,
  onAddChannel,
}: AddChannelModalProps) {
  const { isAdmin } = useAuth();
  const [novoNome, setNovoNome] = useState('');
  const [novaUrl, setNovaUrl] = useState('');
  const [novoBackup, setNovoBackup] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<'Esportes' | 'Notícias' | 'Lazer'>('Esportes');
  const [novoLogo, setNovoLogo] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;
  if (!isAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoNome.trim()) {
      setFormError('Por favor, informe o nome do canal.');
      return;
    }

    if (
      !novaUrl.trim() ||
      (!novaUrl.trim().startsWith('http://') && !novaUrl.trim().startsWith('https://'))
    ) {
      setFormError('A URL deve ser válida e começar com http:// ou https://');
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

    onAddChannel(novoCanal);

    // Reset and close
    setNovoNome('');
    setNovaUrl('');
    setNovoBackup('');
    setNovoLogo('');
    setFormError('');
    onClose();
  };

  return (
    <div
      id="add-channel-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="add-channel-modal-card"
        className="bg-[#121214] border border-zinc-800/90 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Adicionar Canal Próprio</h3>
              <p className="text-xs text-zinc-400">
                Transmissão HLS salva no seu navegador com redundância
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-add-modal-btn"
            onClick={() => {
              setFormError('');
              onClose();
            }}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              Nome do Canal *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: ESPN Brasil, SporTV, Premiere, DAZN..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              URL da Transmissão (HLS .m3u8) *
            </label>
            <input
              type="url"
              required
              placeholder="https://servidor.exemplo.com/live/stream.m3u8"
              value={novaUrl}
              onChange={(e) => setNovaUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              URL do Servidor Reserva / Backup (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://backup.exemplo.com/live/stream.m3u8"
              value={novoBackup}
              onChange={(e) => setNovoBackup(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/30 transition-all"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Se o sinal principal oscilar ou cair, o app alterna automaticamente.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Categoria
              </label>
              <select
                value={novaCategoria}
                onChange={(e) =>
                  setNovaCategoria(e.target.value as 'Esportes' | 'Notícias' | 'Lazer')
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#00E676]"
              >
                <option value="Esportes">Esportes</option>
                <option value="Notícias">Notícias</option>
                <option value="Lazer">Lazer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                URL do Logotipo (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://.../logo.png"
                value={novoLogo}
                onChange={(e) => setNovoLogo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setFormError('');
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="save-custom-channel-btn"
              className="px-5 py-2.5 text-xs font-extrabold bg-[#00E676] hover:bg-[#00E676]/90 text-black rounded-xl shadow-lg shadow-[#00E676]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Canal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
