'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Tv,
  Layers,
  Search,
  Crown,
  KeyRound,
  User,
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface WorscoiFloatingTourProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

interface TourStep {
  id: string;
  targetId: string;
  mobileTargetId?: string;
  title: string;
  description: string;
  tip?: string;
  icon: React.ElementType;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
  badge: string;
}

export function WorscoiFloatingTour({
  isOpen,
  onClose,
  userName,
}: WorscoiFloatingTourProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    borderRadius?: number;
  } | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  }>({
    top: 0,
    left: 0,
    placement: 'center',
  });

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reinicia o passo inicial ao abrir
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const steps: TourStep[] = useMemo(
    () => [
      {
        id: 'step-player',
        targetId: 'tour-player-screen',
        title: 'Reprodutor de TV ao Vivo em HD',
        badge: 'Passo 1 de 7 • Transmissão',
        description: `Bem-vindo${userName ? `, ${userName}` : ''}! Aqui você assiste a canais esportivos, de notícias e entretenimento ao vivo com sinal otimizado em alta definição.`,
        tip: 'Passe o mouse sobre a tela para acessar os atalhos rápidos: Áudio (M), Picture-in-Picture (P) e Modo Cinema (C).',
        icon: Tv,
        preferredPlacement: 'bottom',
      },
      {
        id: 'step-channel-bar',
        targetId: 'player-channel-bar',
        title: 'Informações & Interações ao Vivo',
        badge: 'Passo 2 de 7 • Interação',
        description: 'Acompanhe o status do sinal em tempo real. Você pode reagir com o botão "Adoro", interagir nos comentários ao vivo e alternar entre servidores de sinal alternativos se necessário.',
        tip: 'Clique no botão Adoro para enviar reações com partículas animadas na transmissão.',
        icon: Heart,
        preferredPlacement: 'top',
      },
      {
        id: 'step-categories',
        targetId: 'tour-categories-filter',
        mobileTargetId: 'tour-mobile-menu-btn',
        title: 'Categorias & Filtros Rápidos',
        badge: 'Passo 3 de 7 • Categorias',
        description: 'Filtre instantaneamente por Esportes, SuperSport, TNT Sports, Premier League, LaLiga, ZAP Angola, Portugal, Filmes, Novelas e Desenhos.',
        tip: 'Selecione "Favoritos" ou "Recentes" para voltar imediatamente aos canais que você mais assiste.',
        icon: Layers,
        preferredPlacement: 'right',
      },
      {
        id: 'step-search',
        targetId: 'tour-sidebar-search',
        mobileTargetId: 'tour-mobile-menu-btn',
        title: 'Busca Inteligente de Emissoras',
        badge: 'Passo 4 de 7 • Busca',
        description: 'Digite o nome do canal, país ou liga desejada para encontrá-lo em milissegundos sem precisar rolar toda a lista.',
        tip: 'Digite por exemplo "Premier", "ZAP", "ESPN" ou "Notícias" para filtrar na hora.',
        icon: Search,
        preferredPlacement: 'right',
      },
      {
        id: 'step-plans',
        targetId: 'tour-plans-btn',
        title: 'Planos VIP & Tempo Restante',
        badge: 'Passo 5 de 7 • Assinatura',
        description: 'Consulte em tempo real a contagem regressiva da sua assinatura ou do seu período de teste grátis de 24h. Clique aqui para renovar ou escolher seu plano.',
        tip: 'Planos VIP oferecem sinal com prioridade total, servidores ultra-rápidos e zero anúncios.',
        icon: Crown,
        preferredPlacement: 'bottom',
      },
      {
        id: 'step-redeem',
        targetId: 'tour-redeem-btn',
        mobileTargetId: 'tour-plans-btn',
        title: 'Resgate de Chave ou Voucher',
        badge: 'Passo 6 de 7 • Ativação',
        description: 'Se você recebeu um código de acesso, token de recarga ou voucher de revendedor, clique aqui para ativá-lo e liberar sua conta instantaneamente.',
        tip: 'A ativação do plano é automática e entra em vigor no mesmo segundo.',
        icon: KeyRound,
        preferredPlacement: 'bottom',
      },
      {
        id: 'step-profile',
        targetId: 'tour-profile-btn',
        title: 'Perfil, Ajuda & Configurações',
        badge: 'Passo 7 de 7 • Conclusão',
        description: 'Acesse os dados da sua conta, consulte informações de privacidade e segurança, ou reabra este tutorial interativo a qualquer momento clicando em "Guia de Uso".',
        tip: 'Tudo pronto! Aproveite ao máximo a melhor programação ao vivo na Worscoi TV.',
        icon: User,
        preferredPlacement: 'bottom',
      },
    ],
    [userName]
  );

  const currentStep = steps[currentStepIndex] || steps[0];
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Localiza e mede o elemento na página
  const updateTargetPosition = useCallback(() => {
    if (!isOpenRef.current) return;
    const activeStep = currentStepRef.current;
    if (!activeStep) return;

    let targetEl: HTMLElement | null = null;

    // Tenta o targetId principal
    if (activeStep.targetId) {
      targetEl = document.getElementById(activeStep.targetId);
      // Se não estiver visível (ex: display: none ou offsetParent null), tenta o mobileTargetId
      if (targetEl && targetEl.offsetParent === null && activeStep.mobileTargetId) {
        targetEl = document.getElementById(activeStep.mobileTargetId);
      }
    }

    // Se ainda não encontrou e tem mobileTargetId
    if ((!targetEl || targetEl.offsetParent === null) && activeStep.mobileTargetId) {
      targetEl = document.getElementById(activeStep.mobileTargetId);
    }

    if (!targetEl || targetEl.offsetParent === null) {
      // Elemento não encontrado na viewport atual: posiciona o card no centro
      setTargetRect((prev) => (prev === null ? prev : null));
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = Math.min(380, viewportWidth - 32);
      const centerTop = Math.max(20, (viewportHeight - 320) / 2);
      const centerLeft = (viewportWidth - cardWidth) / 2;

      setPopoverPos((prev) => {
        if (
          Math.abs(prev.top - centerTop) < 1 &&
          Math.abs(prev.left - centerLeft) < 1 &&
          prev.placement === 'center'
        ) {
          return prev;
        }
        return {
          top: centerTop,
          left: centerLeft,
          placement: 'center',
        };
      });
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const style = window.getComputedStyle(targetEl);
    const rawRadius = parseFloat(style.borderRadius) || 12;

    const padding = 6;
    const computedRect = {
      top: Math.round(Math.max(0, rect.top - padding)),
      left: Math.round(Math.max(0, rect.left - padding)),
      width: Math.round(rect.width + padding * 2),
      height: Math.round(rect.height + padding * 2),
      borderRadius: Math.min(24, rawRadius + 4),
    };

    setTargetRect((prev) => {
      if (
        prev &&
        prev.top === computedRect.top &&
        prev.left === computedRect.left &&
        prev.width === computedRect.width &&
        prev.height === computedRect.height &&
        prev.borderRadius === computedRect.borderRadius
      ) {
        return prev;
      }
      return computedRect;
    });

    // Mede dimensões do popover card
    const popoverWidth = Math.min(380, window.innerWidth - 32);
    const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 280;

    let chosenPlacement = activeStep.preferredPlacement || 'bottom';
    let top = 0;
    let left = 0;

    const spaceBottom = window.innerHeight - (computedRect.top + computedRect.height);
    const spaceTop = computedRect.top;
    const spaceRight = window.innerWidth - (computedRect.left + computedRect.width);
    const spaceLeft = computedRect.left;

    // Determina a melhor posição com base no espaço disponível
    if (chosenPlacement === 'bottom' && spaceBottom < popoverHeight + 16 && spaceTop > popoverHeight + 16) {
      chosenPlacement = 'top';
    } else if (chosenPlacement === 'top' && spaceTop < popoverHeight + 16 && spaceBottom > popoverHeight + 16) {
      chosenPlacement = 'bottom';
    } else if (chosenPlacement === 'right' && spaceRight < popoverWidth + 16) {
      chosenPlacement = spaceBottom >= popoverHeight + 16 ? 'bottom' : 'top';
    } else if (chosenPlacement === 'left' && spaceLeft < popoverWidth + 16) {
      chosenPlacement = spaceBottom >= popoverHeight + 16 ? 'bottom' : 'top';
    }

    if (chosenPlacement === 'bottom') {
      top = computedRect.top + computedRect.height + 12;
      left = computedRect.left + computedRect.width / 2 - popoverWidth / 2;
    } else if (chosenPlacement === 'top') {
      top = computedRect.top - popoverHeight - 12;
      left = computedRect.left + computedRect.width / 2 - popoverWidth / 2;
    } else if (chosenPlacement === 'right') {
      top = computedRect.top + computedRect.height / 2 - popoverHeight / 2;
      left = computedRect.left + computedRect.width + 12;
    } else if (chosenPlacement === 'left') {
      top = computedRect.top + computedRect.height / 2 - popoverHeight / 2;
      left = computedRect.left - popoverWidth - 12;
    }

    // Garante que o card fique dentro da tela com margem de segurança de 16px
    left = Math.round(Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left)));
    top = Math.round(Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, top)));

    setPopoverPos((prev) => {
      if (
        Math.abs(prev.top - top) < 1 &&
        Math.abs(prev.left - left) < 1 &&
        prev.placement === chosenPlacement
      ) {
        return prev;
      }
      return {
        top,
        left,
        placement: chosenPlacement,
      };
    });
  }, []);

  // Rola o elemento suavemente para a visualização ao mudar de passo
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStepIndex];
    if (!step) return;

    let targetEl: HTMLElement | null = null;
    if (step.targetId) {
      targetEl = document.getElementById(step.targetId);
      if (targetEl && targetEl.offsetParent === null && step.mobileTargetId) {
        targetEl = document.getElementById(step.mobileTargetId);
      }
    }
    if ((!targetEl || targetEl.offsetParent === null) && step.mobileTargetId) {
      targetEl = document.getElementById(step.mobileTargetId);
    }

    if (targetEl && targetEl.offsetParent !== null) {
      try {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      } catch {
        // Ignora navegadores antigos
      }
    }

    // Atualiza após a transição
    updateTargetPosition();
    const t1 = setTimeout(updateTargetPosition, 80);
    const t2 = setTimeout(updateTargetPosition, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, currentStepIndex, steps, updateTargetPosition]);

  // Listener contínuo de resize e scroll com requestAnimationFrame
  useEffect(() => {
    if (!isOpen) return;

    let rafId: number | null = null;
    const handleResizeOrScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateTargetPosition();
      });
    };

    window.addEventListener('resize', handleResizeOrScroll, { passive: true });
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [isOpen, updateTargetPosition]);

  // Atalhos de teclado (Esc para fechar, setas para navegar)
  useEffect(() => {
    if (!isOpen) return;

    const totalSteps = steps.length;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => {
          if (prev < totalSteps - 1) return prev + 1;
          onClose();
          return prev;
        });
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, steps.length, onClose]);

  if (!mounted || !isOpen) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const StepIcon = currentStep.icon;

  return createPortal(
    <div
      id="worscoi-floating-tour-root"
      className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none font-sans"
    >
      {/* SPOTLIGHT OVERLAY DE ALTA DEFINIÇÃO:
          Destaque no elemento real através de box-shadow massiva com anel pulsante */}
      {targetRect ? (
        <div
          className="fixed transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            borderRadius: `${targetRect.borderRadius ?? 16}px`,
            boxShadow: '0 0 0 9999px rgba(3, 3, 5, 0.78)',
          }}
        >
          {/* Anel de foco vibrante pulsante ao redor do item atual */}
          <div
            className="w-full h-full border-2 border-[#FF2D55] ring-4 ring-[#FF2D55]/30 shadow-[0_0_24px_rgba(255,45,85,0.7)] animate-pulse"
            style={{ borderRadius: `${targetRect.borderRadius ?? 16}px` }}
          />
        </div>
      ) : (
        /* Se não há target detectado, escurece a tela suavemente */
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] pointer-events-auto" />
      )}

      {/* CLIQUE NO FUNDO PERMITE AVANÇAR OU MANTER O FOCO */}
      <div
        className="fixed inset-0 cursor-default"
        onClick={(e) => {
          // Se o clique foi fora do balão, avança para o próximo passo
          if (e.target === e.currentTarget) {
            if (isLastStep) {
              onClose();
            } else {
              setCurrentStepIndex((prev) => prev + 1);
            }
          }
        }}
      />

      {/* BALÃO FLUTUANTE (POPOVER TOOLTIP) ANCORADO AO ELEMENTO */}
      <motion.div
        ref={popoverRef}
        key={`tour-popover-step-${currentStepIndex}`}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          width: 'min(380px, calc(100vw - 32px))',
        }}
        className="z-10 rounded-2xl bg-[#0e0e14] border border-zinc-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(255,45,85,0.25)] p-5 text-zinc-100 flex flex-col gap-3.5 backdrop-blur-xl relative"
      >
        {/* SETA INDICADORA DIRECIONADA AO ELEMENTO EM DESTAQUE */}
        {targetRect && popoverPos.placement === 'bottom' && (
          <div className="absolute -top-1.5 left-8 w-3 h-3 rotate-45 bg-[#0e0e14] border-t border-l border-zinc-700/80" />
        )}
        {targetRect && popoverPos.placement === 'top' && (
          <div className="absolute -bottom-1.5 left-8 w-3 h-3 rotate-45 bg-[#0e0e14] border-b border-r border-zinc-700/80" />
        )}
        {targetRect && popoverPos.placement === 'right' && (
          <div className="absolute -left-1.5 top-8 w-3 h-3 rotate-45 bg-[#0e0e14] border-b border-l border-zinc-700/80" />
        )}
        {targetRect && popoverPos.placement === 'left' && (
          <div className="absolute -right-1.5 top-8 w-3 h-3 rotate-45 bg-[#0e0e14] border-t border-r border-zinc-700/80" />
        )}

        {/* CABEÇALHO COM BADGE DO PASSO E BOTÃO PULAR */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF2D55]/15 border border-[#FF2D55]/40 flex items-center justify-center text-[#FF2D55] shrink-0">
              <StepIcon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              {currentStep.badge}
            </span>
          </div>

          <button
            type="button"
            id="tour-btn-skip"
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-800/60 cursor-pointer"
            title="Pular tutorial e fechar"
          >
            <span>Pular</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TÍTULO E DESCRIÇÃO DO ITEM ATUAL */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white tracking-tight leading-snug flex items-center gap-2">
            <span>{currentStep.title}</span>
          </h3>
          <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* DICA DE OURO / ATALHO */}
        {currentStep.tip && (
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{currentStep.tip}</span>
          </div>
        )}

        {/* BARRA INFERIOR COM PONTOS DE PROGRESSO E BOTÕES DE NAVEGAÇÃO */}
        <div className="flex items-center justify-between pt-1 gap-2 border-t border-zinc-800/80">
          {/* PONTOS DE PROGRESSO (DOTS) */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  idx === currentStepIndex
                    ? 'w-5 h-1.5 bg-[#FF2D55] shadow-[0_0_8px_#FF2D55]'
                    : idx < currentStepIndex
                    ? 'w-1.5 h-1.5 bg-zinc-500 hover:bg-zinc-400'
                    : 'w-1.5 h-1.5 bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Ir para ${s.title}`}
              />
            ))}
          </div>

          {/* BOTÕES ANTERIOR E PRÓXIMO */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                id="tour-btn-prev"
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              id="tour-btn-next"
              onClick={() => {
                if (isLastStep) {
                  onClose();
                } else {
                  setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                }
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-[#ed3c5c] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-[#FF2D55]/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{isLastStep ? 'Concluir Guia' : 'Próximo'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
