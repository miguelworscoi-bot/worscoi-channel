'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Cookie,
  Lock,
  Server,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { COOKIE_CONSENT_STORAGE_KEY, CookiePreferences } from '@/components/CookieConsentBanner';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'cookies';
}

export function PrivacyPolicyModal({
  isOpen,
  onClose,
  defaultTab = 'terms',
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'cookies'>(defaultTab);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    accepted: true,
    essential: true,
    preferences: true,
    analytics: true,
    timestamp: Date.now(),
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSavedSuccess(false);
      try {
        const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({
            accepted: true,
            essential: true,
            preferences: parsed.preferences !== false,
            analytics: parsed.analytics !== false,
            timestamp: parsed.timestamp || Date.now(),
          });
        }
      } catch {
        // Ignora
      }
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Ignora
    }
  };

  return (
    <div
      id="privacy-policy-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="privacy-policy-modal"
        className="relative w-full max-w-3xl bg-[#0c0e14] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 ring-1 ring-white/10 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00E676] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Termos de Uso & Política de Privacidade
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-[#00E676] border border-emerald-500/30">
                  Worscoi TV
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Transparência total sobre privacidade, proteção de dados e cookies
              </p>
            </div>
          </div>

          <button
            type="button"
            id="privacy-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer group"
            title="Fechar"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="mt-3.5 flex items-center gap-2 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shrink-0">
          <button
            type="button"
            id="tab-privacy-terms"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso & Privacidade</span>
          </button>

          <button
            type="button"
            id="tab-privacy-cookies"
            onClick={() => setActiveTab('cookies')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cookies'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Preferências de Cookies</span>
          </button>
        </div>

        {/* FEEDBACK DE SALVAMENTO */}
        {savedSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Preferências de cookies salvas com sucesso no seu navegador!</span>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL COM SCROLL */}
        <div className="flex-1 overflow-y-auto mt-3.5 pr-1.5 space-y-4 text-xs text-zinc-300 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              {/* SEÇÃO 1 */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#00E676] flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Aceitação dos Termos & Natureza do Serviço</span>
                </div>
                <p>
                  Ao acessar a plataforma <strong>Worscoi Channel / Worscoi TV</strong>, você concorda expressamente em cumprir estes Termos de Serviço e com todas as leis aplicáveis de proteção de dados (incluindo a LGPD e o Regulamento Geral de Proteção de Dados - RGPD).
                </p>
                <p>
                  A plataforma funciona como um reprodutor e agregador avançado de canais de transmissão pública, listas autorizadas e conteúdos sob demanda para uso estritamente pessoal e não comercial. É estritamente proibida a retransmissão pública, venda de acessos não autorizada ou engenharia reversa.
                </p>
              </div>

              {/* SEÇÃO 2 */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#00E676] flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Privacidade e Proteção de Dados Pessoais</span>
                </div>
                <p>
                  A Worscoi TV preza pela confidencialidade dos dados dos assinantes. Os únicos dados processados são:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
                  <li><strong>Identificação e Acesso:</strong> Endereço de e-mail e identificadores de sessão criptografados via Firebase Authentication.</li>
                  <li><strong>Status da Assinatura:</strong> Identificador do plano ativo (Free, Semanal, Mensal, Trimestral, Anual), validade e tokens de ativação resgatados.</li>
                  <li><strong>Logs Técnicos Operacionais:</strong> Relatórios de estabilidade de reprodução para execução automática de rotas de failover quando um sinal primário cair.</li>
                </ul>
                <p className="text-emerald-400/90 font-medium">
                  Seus dados nunca serão comercializados, repassados a terceiros para marketing ou utilizados para fins externos.
                </p>
              </div>

              {/* SEÇÃO 3: PROTEÇÃO TÉCNICA E MENU DE CONTEXTO */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#00E676] flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Proteção Técnica da Mídia e Desativação do Botão Direito</span>
                </div>
                <p>
                  Para preservar a integridade da transmissão, prevenir a extração não autorizada de mídias e assegurar uma experiência imersiva de televisão sem menus contextuais indesejados, <strong>o uso do botão direito do mouse (menu de contexto) é desativado em toda a interface</strong>.
                </p>
                <p>
                  Esta medida técnica é estritamente protetiva e silenciosa, garantindo que o reprodutor funcione de maneira fluida e segura em telas sensíveis ao toque, computadores e Smart TVs.
                </p>
              </div>

              {/* SEÇÃO 4: LIMITS OF REQUESTS */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#00E676] flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Controle de Taxa de Requisições (Limits of Requests)</span>
                </div>
                <p>
                  Para impedir ataques de negação de serviço distribuídos (DDoS), saturação de banda nos servidores de stream e raspagem automática de dados, a plataforma aplica limitação dinâmica de requisições por endereço IP em janelas de 60 segundos. O uso regular do reprodutor e navegação pelo catálogo operam confortavelmente dentro dos limites estipulados.
                </p>
              </div>

              {/* SEÇÃO 5 */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#00E676] flex items-center justify-center text-xs">
                    5
                  </span>
                  <span>Seus Direitos como Titular de Dados</span>
                </div>
                <p>
                  Você tem o direito de solicitar a qualquer momento a visualização, retificação ou exclusão permanente dos seus dados cadastrais, bem como revogar o consentimento de cookies não essenciais através da aba de configurações.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                  <Cookie className="w-4 h-4 text-amber-400" />
                  <span>Como a Worscoi TV utiliza Cookies e Armazenamento Local</span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-400">
                  Os cookies são pequenos arquivos armazenados no seu navegador para reconhecer sua sessão e manter suas personalizações entre visitas. Você pode controlar abaixo quais categorias autoriza:
                </p>
              </div>

              {/* CARD COOKIES ESSENCIAIS */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#00E676]" />
                    <h4 className="text-sm font-bold text-white">Cookies Estritamente Necessários</h4>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                      Obrigatórios
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Indispensáveis para autenticação com Firebase, manutenção da conta do assinante, validação de tokens ativos e proteção anti-ataques DDoS pelo Limits of Requests.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 text-xs font-semibold shrink-0 cursor-not-allowed border border-zinc-700/50">
                  Sempre Ativo
                </div>
              </div>

              {/* CARD COOKIES DE PREFERÊNCIAS */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">Cookies de Preferências do Reprodutor</h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Guardam seu último canal assistido, modo de latência selecionado (Economia de Dados vs Ultra-Baixa), volume, canais favoritos e modo cinema.
                  </p>
                </div>
                <button
                  type="button"
                  id="toggle-cookie-preferences"
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, preferences: !prev.preferences }))
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    preferences.preferences
                      ? 'bg-[#00E676] text-black border-[#00E676]'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {preferences.preferences ? 'Ativado' : 'Desativado'}
                </button>
              </div>

              {/* CARD COOKIES ANALÍTICOS */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/70 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">Telemetria de Estabilidade de Stream</h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Auxiliam o reprodutor a detectar fragmentos de vídeo corrompidos e alternar automaticamente para o servidor reserva sem interrupção para o usuário.
                  </p>
                </div>
                <button
                  type="button"
                  id="toggle-cookie-analytics"
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    preferences.analytics
                      ? 'bg-[#00E676] text-black border-[#00E676]'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {preferences.analytics ? 'Ativado' : 'Desativado'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-500 hidden sm:block">
            Última atualização: Setembro de 2026 • Em conformidade com LGPD
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'cookies' && (
              <button
                type="button"
                id="btn-save-cookie-settings"
                onClick={handleSavePreferences}
                className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Salvar Preferências
              </button>
            )}

            <button
              type="button"
              id="btn-close-privacy-modal"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Entendido / Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
