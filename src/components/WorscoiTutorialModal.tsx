'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  PlayCircle,
  Radio,
  Heart,
  Film,
  Crown,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Maximize2,
  ListFilter,
  Flame,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';

export interface WorscoiTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

interface StepItem {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  highlights: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
  tip?: string;
}

export function WorscoiTutorialModal({
  isOpen,
  onClose,
  userName,
}: WorscoiTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: StepItem[] = [
    {
      id: 0,
      badge: 'Passo 1 de 5 • Boas-vindas',
      title: `Bem-vindo à Worscoi TV${userName ? `, ${userName}` : ''}!`,
      subtitle:
        'Sua nova experiência para assistir a transmissões ao vivo em HD, jogos de futebol e entretenimento sem interrupções.',
      icon: Sparkles,
      highlights: [
        {
          title: 'Transmissões em Alta Definição',
          description:
            'Acesso instantâneo a canais de desporto, notícias e cinema com sinal otimizado em tempo real.',
          icon: Tv,
        },
        {
          title: 'Zero Anúncios Invasivos',
          description:
            'Interface projetada para velocidade e foco total na sua programação favorita.',
          icon: Zap,
        },
        {
          title: 'Acesso Rápido em Qualquer Aparelho',
          description:
            'Compatível com computadores, telemóveis e tablets com layout responsivo e dinâmico.',
          icon: ShieldCheck,
        },
      ],
      tip: 'Dica: Você pode usar as setas do teclado (← e →) para navegar por este guia a qualquer momento.',
    },
    {
      id: 1,
      badge: 'Passo 2 de 5 • Player & Sinal',
      title: 'Player Worscoi PRO & Controles de Transmissão',
      subtitle:
        'Tecnologia de ponta com failover de sinal e controle de qualidade para você nunca perder um lance.',
      icon: PlayCircle,
      highlights: [
        {
          title: 'Modos de Latência Personalizados',
          description:
            'Alterne entre "Econômico" para poupar dados, "Estável" para sinal robusto ou "Baixa Latência" para transmissões sem atraso.',
          icon: Zap,
        },
        {
          title: 'Failover Automático de Servidores',
          description:
            'Se um link sofrer instabilidade na rede, o player comuta automaticamente para servidores de contingência.',
          icon: ShieldCheck,
        },
        {
          title: 'Modo Cinema & Tela Cheia',
          description:
            'Oculte o restante da interface com um único toque para focar 100% no jogo ou programa.',
          icon: Maximize2,
        },
      ],
      tip: 'Dica: O botão no player com ícone de engrenagem permite ajustar o modo de conexão a qualquer momento.',
    },
    {
      id: 2,
      badge: 'Passo 3 de 5 • Canais & Favoritos',
      title: 'Guia Completo de Canais & Favoritos',
      subtitle:
        'Explore dezenas de canais organizados por gênero e personalize a sua lista com os seus preferidos.',
      icon: Radio,
      highlights: [
        {
          title: 'Filtro por Categorias',
          description:
            'Encontre rapidamente canais de Desporto, Futebol Nacional (Girabola), Notícias, Variedades e Filmes.',
          icon: ListFilter,
        },
        {
          title: 'Favoritos com 1 Toque',
          description:
            'Clique no coração no cartão de qualquer canal para fixá-lo no topo da sua lista de acesso rápido.',
          icon: Heart,
        },
        {
          title: 'Histórico de Canais Recentes',
          description:
            'Acesse de imediato os últimos canais assistidos sem precisar pesquisar novamente.',
          icon: Flame,
        },
      ],
      tip: 'Dica: No menu lateral você encontra a aba "Favoritos" sempre acessível com apenas um clique.',
    },
    {
      id: 3,
      badge: 'Passo 4 de 5 • Filmoteca',
      title: 'Filmoteca Worscoi & Catálogo On-Demand',
      subtitle:
        'Além de transmissões esportivas ao vivo, tenha um acervo completo de produções sob demanda.',
      icon: Film,
      highlights: [
        {
          title: 'Catálogo Organizado por Gênero',
          description:
            'Navegue por títulos de Ação, Aventura, Ficção, Drama e Animações com capas em alta definição.',
          icon: Film,
        },
        {
          title: 'Sinopses & Avaliações IMDb',
          description:
            'Consulte resumos da trama, notas oficiais e elenco antes de escolher o que assistir.',
          icon: ShieldCheck,
        },
        {
          title: 'Trailers & Reprodução Imediata',
          description:
            'Assista prévias diretamente na plataforma com suporte a player imersivo.',
          icon: PlayCircle,
        },
      ],
      tip: 'Dica: Acesse a aba "Filmoteca" no menu superior ou lateral para explorar todos os títulos disponíveis.',
    },
    {
      id: 4,
      badge: 'Passo 5 de 5 • Conta & Assinatura',
      title: 'Sua Assinatura, Cronômetro & Tokens',
      subtitle:
        'Controle total da sua conta com contagem regressiva em tempo real e recibo oficial emitido em PDF.',
      icon: Crown,
      highlights: [
        {
          title: 'Cronômetro ao Vivo',
          description:
            'Acompanhe no topo da tela os dias, horas e minutos exatos restantes do seu plano contratado.',
          icon: Zap,
        },
        {
          title: 'Ativação Rápida por Chave Token',
          description:
            'Recebeu uma Chave de 5 caracteres? Resgate no botão "Chave Token" para ativação instantânea.',
          icon: KeyRound,
        },
        {
          title: 'Recibos Oficiais em PDF',
          description:
            'Baixe seus comprovativos de pagamento e recibos com chave token integrada com design oficial Worscoi.',
          icon: CheckCircle2,
        },
      ],
      tip: 'Pronto! Você já conhece todas as funções essenciais. Clique em "Começar a Assistir" para iniciar.',
    },
  ];

  // Navegação por teclado
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [isOpen, steps.length, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div
      id="worscoi-tutorial-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="worscoi-tutorial-modal"
        className="relative w-full max-w-2xl bg-[#0b0c12] border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/95 text-white my-auto select-none ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO SUPERIOR DO MODAL */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/70">
          <div className="flex items-center gap-3">
            <WorscoiLogo size="sm" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ed3c5c]/10 text-[#ed3c5c] border border-[#ed3c5c]/25 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-[#ed3c5c]" />
              <span>Guia de Início Worscoi</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="worscoi-tutorial-skip-btn"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
            >
              Pular Tutorial
            </button>
            <button
              type="button"
              id="worscoi-tutorial-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              title="Fechar guia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BARRAS DE PROGRESSO DO TUTORIAL (CLICÁVEIS) */}
        <div className="grid grid-cols-5 gap-1.5 pt-4 pb-2">
          {steps.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className="group flex flex-col gap-1 py-1 text-left cursor-pointer focus:outline-none"
                title={`Ir para o ${s.badge}`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#ed3c5c] shadow-xs shadow-[#ed3c5c]/50'
                      : isCompleted
                      ? 'bg-[#ed3c5c]/60'
                      : 'bg-zinc-800 group-hover:bg-zinc-700'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO PRINCIPAL COM TRANSIÇÃO ANIMADA */}
        <div className="min-h-[320px] sm:min-h-[340px] flex flex-col justify-between py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* TÍTULO & SUBTÍTULO DO PASSO */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ed3c5c]/15 border border-[#ed3c5c]/30 flex items-center justify-center text-[#ed3c5c] shrink-0">
                    <StepIcon className="w-4 h-4 text-[#ed3c5c]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#ed3c5c]">
                      {step.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                      {step.title}
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed pl-10">
                  {step.subtitle}
                </p>
              </div>

              {/* CARDS DE DESTAQUES / RECURSOS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {step.highlights.map((h, i) => {
                  const ItemIcon = h.icon;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/70 flex items-center justify-center text-zinc-300 group-hover:text-[#ed3c5c] group-hover:border-[#ed3c5c]/40 transition">
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white transition">
                          {h.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* DICA INFORMATIVA DE RODAPÉ DO PASSO */}
              {step.tip && (
                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[11px] text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ed3c5c] shrink-0" />
                  <span>{step.tip}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RODAPÉ INFERIOR: NAVEGAÇÃO & AÇÕES */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/70">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span className="text-zinc-300 font-bold">{currentStep + 1}</span>
            <span>de</span>
            <span>{steps.length} etapas</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                id="worscoi-tutorial-prev-btn"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            <button
              type="button"
              id="worscoi-tutorial-next-btn"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#ed3c5c] hover:bg-[#ff4567] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-[#ed3c5c]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{isLastStep ? 'Começar a Assistir' : 'Avançar'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
