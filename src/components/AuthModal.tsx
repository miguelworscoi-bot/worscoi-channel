'use client';
import React, { useState } from 'react';
import {
  Tv,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Crown,
  Tv2,
  KeyRound,
  Zap,
  PlayCircle,
  Eye,
  EyeOff,
  X,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  PLANS,
  PAYMENT_CONFIG,
  createWhatsAppPaymentProofLink,
  redeemAccessToken,
} from '@/services/subscriptionService';
import { SubscriptionPlanId } from '@/types';

interface AuthModalProps {
  onClose?: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [adminKey, setAdminKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Novos estados para a escolha de planos na inscrição
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('free');
  const [activePaymentMethod, setActivePaymentMethod] = useState<'multicaixa' | 'paypay'>('multicaixa');
  const [activationTokenInput, setActivationTokenInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [whatsAppClicked, setWhatsAppClicked] = useState(false);

  const selectedPlan = PLANS[selectedPlanId] || PLANS.free;
  const isPaidPlan = selectedPlanId !== 'free';

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenWhatsAppProof = () => {
    setWhatsAppClicked(true);
    const methodLabel = activePaymentMethod === 'multicaixa' ? 'Multicaixa Express' : 'PayPay Angola';
    const link = createWhatsAppPaymentProofLink({
      planName: selectedPlan.name,
      priceFormatted: selectedPlan.priceFormatted,
      userName: name,
      contact: email,
      paymentMethod: methodLabel,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, informe seu nome completo.');
          setSubmitting(false);
          return;
        }
        if (password.length < 3) {
          setError('A senha deve ter pelo menos 3 caracteres.');
          setSubmitting(false);
          return;
        }

        // Validação da chave de admin se a opção for Administrador
        if (selectedRole === 'admin') {
          const validKeys = ['admin', 'admin123', 'gestor', 'playsports', '2026'];
          const keyNormalized = adminKey.trim().toLowerCase();
          if (adminKey.trim() && !validKeys.includes(keyNormalized)) {
            setError('Chave de Administrador inválida. Deixe em branco para homologação ou insira "admin123".');
            setSubmitting(false);
            return;
          }
          await signUpWithEmail(email, password, name, 'admin');
        } else {
          // FLUXO DE USUÁRIO COM PLANOS
          if (isPaidPlan) {
            // Se o usuário já tiver o código de ativação fornecido pelo WhatsApp
            const cleanToken = activationTokenInput.trim().toUpperCase();
            if (cleanToken) {
              const res = await redeemAccessToken(cleanToken, {
                uid: 'temp_' + Date.now(),
                email,
                displayName: name,
              });

              if (res.success && res.plan) {
                await signUpWithEmail(
                  email,
                  password,
                  name,
                  'user',
                  res.plan,
                  res.planName,
                  cleanToken,
                  res.expiresAt
                );
              } else {
                setError(res.message || 'Código de 5 dígitos inválido ou já utilizado.');
                setSubmitting(false);
                return;
              }
            } else {
              // Usuário escolheu plano pago mas ainda não tem o token
              // Criamos a conta com status inicial para que ele possa ativar o token assim que receber no WhatsApp
              await signUpWithEmail(
                email,
                password,
                name,
                'user',
                selectedPlanId,
                selectedPlan.name,
                null,
                null
              );
            }
          } else {
            // Plano gratuito (1 dia de degustação 24h)
            const oneDayExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            await signUpWithEmail(
              email,
              password,
              name,
              'user',
              'free',
              PLANS.free.name,
              null,
              oneDayExpiry
            );
          }
        }
      } else {
        await signInWithEmail(email, password);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar';
      if (msg.includes('wrong-password') || msg.includes('Senha incorreta')) {
        setError('Senha incorreta para esta conta. Verifique sua senha.');
      } else {
        setError(msg || 'Erro ao processar solicitação.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      if (onClose) onClose();
    } catch {
      // Fallback automático já incluso no AuthContext
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectAccess = async (role: UserRole) => {
    setError(null);
    setSubmitting(true);
    try {
      await signInAsGuest(role);
      if (onClose) onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao entrar';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Preenche dados e permite entrada instantânea
  const handleQuickPreset = (type: 'user' | 'admin' | 'phone') => {
    setError(null);
    if (type === 'admin') {
      setEmail('admin@playsports.com');
      setPassword('admin123');
      setName('Administrador Geral');
      setSelectedRole('admin');
      setAdminKey('admin123');
    } else if (type === 'phone') {
      setEmail('942472983');
      setPassword('123456');
      setName('Assinante Multicaixa');
      setSelectedRole('user');
    } else {
      setEmail('espectador@playsports.tv');
      setPassword('123456');
      setName('Espectador Esportivo');
      setSelectedRole('user');
    }
  };

  const allPlansList: SubscriptionPlanId[] = ['free', 'diario', 'basico', 'vip', 'premium', 'anual'];

  return (
    <div
      id="auth-gate-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto"
    >
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative w-full ${
          isSignUp ? 'max-w-2xl' : 'max-w-lg'
        } bg-zinc-950 border border-zinc-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 z-10 animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col`}
      >
        {/* BOTÃO FECHAR SE FOR MODAL SECUNDÁRIO */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800 z-20"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* CONTAINER COM ROLAGEM SUAVE */}
        <div className="overflow-y-auto pr-1 sm:pr-2 custom-scrollbar space-y-4 sm:space-y-5">
          {/* LOGO & HEADING */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#00E676] to-emerald-400 p-0.5 shadow-lg shadow-[#00E676]/20 mb-3 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Tv className="w-6 h-6 sm:w-7 sm:h-7 text-[#00E676]" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isSignUp ? 'Inscrição & Planos de Acesso' : 'Iniciar Sessão'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
              {isSignUp
                ? 'Selecione seu plano esportivo, realize o pagamento se necessário e envie o comprovativo no WhatsApp.'
                : 'Entre com 1-clique, e-mail ou telemóvel (MCX / PayPay) para assistir ao vivo.'}
            </p>
          </div>

          {/* 🚀 BOTÕES DE ACESSO RÁPIDO (1-CLIQUE NO LOGIN) */}
          {!isSignUp && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1 text-[#00E676]">
                  <Zap className="w-3.5 h-3.5" />
                  Acesso Rápido Instantâneo
                </span>
                <span className="text-[10px] text-zinc-500 font-normal">Sem complicação</span>
              </div>

              <div className="flex flex-col gap-2">
                {/* Entrar como Usuário / Espectador */}
                <button
                  type="button"
                  id="btn-quick-login-user"
                  onClick={() => handleDirectAccess('user')}
                  disabled={submitting}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/80 border border-emerald-500/30 hover:border-[#00E676] text-left transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 group disabled:opacity-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-[#00E676]">
                      <Tv2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-[#00E676] transition-colors flex items-center gap-2">
                        <span>Acessar como Espectador</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-extrabold border border-emerald-500/30">
                          1 Dia Grátis
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Assistir a todos os canais esportivos ao vivo imediatamente
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                    Entrar <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SELETOR DE TIPO DE CONTA (NO CADASTRO) */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                1. Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="select-role-user"
                  onClick={() => setSelectedRole('user')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'user'
                      ? 'bg-emerald-950/40 border-[#00E676] text-white ring-1 ring-[#00E676]/50 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-zinc-800/80 text-[#00E676]">
                      <Tv2 className="w-4 h-4" />
                    </div>
                    {selectedRole === 'user' && (
                      <span className="text-[10px] font-extrabold bg-[#00E676] text-black px-1.5 py-0.5 rounded-md">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Assinante / Espectador</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Acesso aos canais esportivos e planos
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  id="select-role-admin"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'admin'
                      ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Crown className="w-4 h-4" />
                    </div>
                    {selectedRole === 'admin' && (
                      <span className="text-[10px] font-extrabold bg-amber-400 text-black px-1.5 py-0.5 rounded-md">
                        Gestor
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Administrador</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Gerenciar canais e assinantes
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 📋 SELEÇÃO DE PLANOS DISPONÍVEIS DO SITE (APENAS PARA USUÁRIO NO CADASTRO) */}
          {isSignUp && selectedRole === 'user' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  2. Escolha o Plano Desejado
                </label>
                <span className="text-[11px] text-zinc-400">Valores em Kwanzas (Kz)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {allPlansList.map((planId) => {
                  const plan = PLANS[planId];
                  const isSelected = selectedPlanId === planId;
                  const isFree = planId === 'free';

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative cursor-pointer p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-zinc-900 border-[#00E676] ring-1 ring-[#00E676]/50 shadow-md shadow-emerald-950/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-black shadow-sm flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          POPULAR
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}
                          >
                            {plan.badge}
                          </span>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#00E676] bg-[#00E676] text-black'
                                : 'border-zinc-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="font-bold text-xs sm:text-sm text-white mt-1 line-clamp-1">
                          {plan.name}
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-[#00E676] mt-0.5">
                          {plan.priceFormatted}
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{plan.durationDays} {plan.durationDays === 1 ? 'dia' : 'dias'}</span>
                        <span className={isFree ? 'text-zinc-400' : 'text-amber-400 font-semibold'}>
                          {isFree ? 'Sem taxa' : 'Comprovativo MCX'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CARD EXPLICATIVO SEGUNDO O PLANO SELECIONADO */}
              {!isPaidPlan ? (
                /* Card do Plano Gratuito */
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Degustação por 1 Dia (24 Horas):</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Você pode se inscrever imediatamente sem pagamento. Terá 24 horas completas para experimentar todos os canais esportivos. Após o teste, poderá adquirir um plano pago.
                    </p>
                  </div>
                </div>
              ) : (
                /* Card de Pagamento & WhatsApp Obrigatórios */
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900 border border-emerald-500/40 space-y-3.5 shadow-lg shadow-emerald-950/20 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Pagamento Exigido: {selectedPlan.name}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Pague via Multicaixa Express ou PayPay e envie o comprovativo no WhatsApp para receber o código.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-extrabold text-[#00E676]">
                        {selectedPlan.priceFormatted}
                      </span>
                    </div>
                  </div>

                  {/* 1. SELEÇÃO DO MÉTODO E DADOS PARA TRANSFERÊNCIA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">
                        Passo 1: Efetue o Pagamento
                      </span>
                      {/* Alternador MCX / PayPay */}
                      <div className="flex items-center gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setActivePaymentMethod('multicaixa')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                            activePaymentMethod === 'multicaixa'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Multicaixa Express
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePaymentMethod('paypay')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                            activePaymentMethod === 'paypay'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          PayPay
                        </button>
                      </div>
                    </div>

                    {/* Caixa com o número e botões de cópia rápida */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-medium">
                            {activePaymentMethod === 'multicaixa' ? 'Número MCX Express' : 'Número PayPay'}:
                          </div>
                          <div className="text-sm font-black text-white font-mono">
                            {PAYMENT_CONFIG.phoneFormatted}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(PAYMENT_CONFIG.phone, 'phone')}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition border border-zinc-800 cursor-pointer"
                        >
                          {copiedField === 'phone' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-medium">Valor Exato:</div>
                          <div className="text-sm font-black text-[#00E676] font-mono">
                            {selectedPlan.priceFormatted}
                          </div>
                        </div>
                        {selectedPlan.priceAOA ? (
                          <button
                            type="button"
                            onClick={() => handleCopy(String(selectedPlan.priceAOA), 'amount')}
                            className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition border border-zinc-800 cursor-pointer"
                          >
                            {copiedField === 'amount' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* 2. BOTÃO OFICIAL WHATSAPP PARA ENVIO DO COMPROVATIVO */}
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Passo 2: Enviar Comprovativo no WhatsApp
                    </span>

                    <button
                      type="button"
                      onClick={handleOpenWhatsAppProof}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4 fill-black text-[#25D366]" />
                      <span>Enviar Comprovante no WhatsApp (+244 942 472 983)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {whatsAppClicked && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Conversa aberta no WhatsApp! Aguarde os toques com o seu código de 5 dígitos.</span>
                      </div>
                    )}

                    <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                      💡 <strong>Como funciona a ativação:</strong> Após enviar o comprovativo no WhatsApp, nossa equipe confirmará a transferência e passará todos os toques com o seu <strong>Código de Ativação de 5 dígitos</strong> para desbloquear a conta!
                    </p>
                  </div>

                  {/* 3. CAMPO OPCIONAL PARA QUEM JÁ RECEBEU O TOKEN NO WHATSAPP */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-400">
                        <KeyRound className="w-3.5 h-3.5" />
                        Já recebeu o Código do WhatsApp? (Opcional):
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">5 dígitos</span>
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={activationTokenInput}
                      onChange={(e) => setActivationTokenInput(e.target.value.toUpperCase())}
                      placeholder="Ex: 8J4XK (Deixe vazio se for pagar após o cadastro)"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300 placeholder-zinc-600 font-mono tracking-widest text-center text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all uppercase"
                    />
                    <span className="text-[10px] text-zinc-500 block mt-1">
                      Se ainda não pagou ou não recebeu o código, não se preocupe! Você pode criar sua conta agora e ativar o token a qualquer momento pelo botão &quot;Ativar Token&quot; no topo da tela.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ERRO BANNER */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* BOTAO GOOGLE */}
          <button
            type="button"
            id="btn-login-google"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-zinc-600"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500 font-semibold tracking-wider">
                {isSignUp ? '3. Dados da Sua Conta' : 'Ou entrar com e-mail / telemóvel'}
              </span>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    id="auth-input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>E-mail ou Telemóvel</span>
                <span className="text-[10px] text-zinc-500 font-normal">Ex: 942472983</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  id="auth-input-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail ou Telemóvel (ex: 942472983)"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="auth-input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CHAVE DE ADMIN NO CADASTRO */}
            {isSignUp && selectedRole === 'admin' && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 animate-in fade-in">
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Chave de Acesso Admin (Opcional)
                </label>
                <input
                  type="text"
                  id="auth-input-admin-key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ex: admin123 (ou deixe vazio para homologação)"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-amber-500/40 text-amber-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={submitting}
              className={`w-full mt-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                isSignUp && selectedRole === 'admin'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20'
                  : 'bg-[#00E676] hover:bg-[#00c864] text-black shadow-[#00E676]/20'
              }`}
            >
              {submitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {selectedRole === 'admin'
                      ? 'Criar Conta de Administrador'
                      : isPaidPlan
                      ? activationTokenInput.trim()
                        ? `Ativar & Concluir (${selectedPlan.name})`
                        : `Concluir Inscrição (${selectedPlan.name})`
                      : 'Concluir Inscrição (1 Dia Grátis)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ATALHOS RÁPIDOS PARA PREENCHER FORMULÁRIO */}
          <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span>Preenchimento:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('user')}
                className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer font-medium"
              >
                Espectador
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('phone')}
                className="text-teal-400 hover:text-teal-300 underline cursor-pointer font-medium flex items-center gap-0.5"
                title="Preencher com telemóvel 942472983"
              >
                <Phone className="w-3 h-3" />
                <span>942472983</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDirectAccess('user')}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Assistir agora sem cadastro"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Modo Convidado (Assistir Agora)</span>
            </button>
          </div>

          {/* TOGGLE ENTRE LOGIN E SIGNUP */}
          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              {isSignUp ? 'Já tem uma conta cadastrada?' : 'Ainda não possui uma conta?'}
              <button
                type="button"
                id="auth-toggle-mode-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="ml-1.5 font-bold text-[#00E676] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Fazer login' : 'Inscrever-se'}
              </button>
            </p>
          </div>

          {/* FOOTER BADGE */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão segura com persistência e failover ativo • WhatsApp Oficial: +244 942 472 983</span>
          </div>
        </div>
      </div>
    </div>
  );
}
