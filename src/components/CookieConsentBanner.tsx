'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, ChevronRight, X } from 'lucide-react';

export const COOKIE_CONSENT_STORAGE_KEY = 'worscoi_cookie_consent';

export interface CookiePreferences {
  accepted: boolean;
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  timestamp: number;
}

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export function CookieConsentBanner({ onOpenPrivacyPolicy }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!stored) {
        // Exibe com uma transição suave após carregar a página
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      accepted: true,
      essential: true,
      preferences: true,
      analytics: true,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignora
    }
    setIsVisible(false);
  };

  const handleAcceptEssentialOnly = () => {
    const preferences: CookiePreferences = {
      accepted: true,
      essential: true,
      preferences: false,
      analytics: false,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignora
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="cookie-consent-banner"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0e1017]/95 backdrop-blur-xl border border-zinc-800/90 p-4 sm:p-5 shadow-2xl shadow-black/80 ring-1 ring-white/10">
            {/* Gradiente sutil decorativo */}
            <div className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 w-32 h-32 bg-[#FF2D55]/10 rounded-full blur-2xl" />

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 shadow-sm">
                <Cookie className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Privacidade & Uso de Cookies
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-[#00E676] border border-emerald-500/30">
                      LGPD / RGPD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptEssentialOnly}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    title="Fechar banner e usar apenas essenciais"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  Utilizamos cookies essenciais e tecnologias locais para manter sua sessão autenticada, lembrar canais favoritos, otimizar a latência dos streams e garantir proteção contra ataques DDoS e saturação de requisições.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    id="cookie-btn-accept-all"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>Aceitar Todos</span>
                  </button>

                  <button
                    type="button"
                    id="cookie-btn-essential-only"
                    onClick={handleAcceptEssentialOnly}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Apenas Necessários
                  </button>

                  <button
                    type="button"
                    id="cookie-btn-terms-modal"
                    onClick={() => {
                      onOpenPrivacyPolicy();
                    }}
                    className="px-3 py-2 rounded-xl text-zinc-400 hover:text-[#00E676] text-xs font-medium transition-colors flex items-center gap-1 hover:underline cursor-pointer ml-auto"
                  >
                    <span>Ver Termos & Detalhes</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
