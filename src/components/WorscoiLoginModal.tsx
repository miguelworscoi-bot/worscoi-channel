'use client';
import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Tv2,
  Crown,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCircle2,
  Copy,
  Smartphone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Clock,
  KeyRound,
  Phone,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  PLANS,
  PAYMENT_CONFIG,
  createWhatsAppPaymentProofLink,
  redeemAccessToken,
} from '@/services/subscriptionService';
import { SubscriptionPlanId } from '@/types';

interface WorscoiLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function WorscoiLoginModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: WorscoiLoginModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest, deviceTrial } = useAuth();
  
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [adminKey, setAdminKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Estados completos do fluxo de planos e pagamento no cadastro
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('free');
  const [activePaymentMethod, setActivePaymentMethod] = useState<'multicaixa' | 'paypay'>('multicaixa');
  const [activationTokenInput, setActivationTokenInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [whatsAppClicked, setWhatsAppClicked] = useState(false);

  if (!isOpen) return null;

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
      userName: name || 'Novo Assinante',
      contact: email || 'Telemóvel',
      paymentMethod: methodLabel,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Por favor, informe seu nome completo.');
        }
        if (password.length < 3) {
          throw new Error('A palavra-passe deve ter pelo menos 3 caracteres.');
        }

        // Validação se o perfil for Administrador
        if (selectedRole === 'admin') {
          const validKeys = ['admin', 'admin123', 'gestor', 'playsports', '2026'];
          const keyNormalized = adminKey.trim().toLowerCase();
          if (adminKey.trim() && !validKeys.includes(keyNormalized)) {
            throw new Error('Chave de Administrador inválida. Deixe em branco para homologação ou insira "admin123".');
          }
          await signUpWithEmail(email, password, name, 'admin');
        } else {
          // FLUXO DE USUÁRIO COM PLANOS
          if (isPaidPlan) {
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
                throw new Error(res.message || 'Código de 5 dígitos inválido ou já utilizado.');
              }
            } else {
              // Usuário escolheu plano pago mas pagará após o cadastro
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
            // Plano gratuito (1 dia de degustação 24h) - AuthContext sincroniza com a regra de 1 vez por aparelho
            await signUpWithEmail(
              email,
              password,
              name,
              'user',
              'free',
              PLANS.free.name,
              null,
              null
            );
          }
        }
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao processar solicitação. Tente novamente.';
      setErrorMsg(message);
      const lower = message.toLowerCase();
      if (lower.includes('bloqueado') || lower.includes('teste gratuito') || lower.includes('degustação')) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao autenticar com Google.';
      setErrorMsg(message);
      const lower = message.toLowerCase();
      if (lower.includes('bloqueado') || lower.includes('teste gratuito') || lower.includes('degustação')) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async (role: UserRole = 'user') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInAsGuest(role);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao entrar como convidado.';
      setErrorMsg(msg);
      const lower = msg.toLowerCase();
      if (lower.includes('bloqueado') || lower.includes('teste gratuito') || lower.includes('degustação')) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (type: 'user' | 'admin' | 'phone') => {
    setErrorMsg(null);
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
      id="worscoi-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none overflow-y-auto"
    >
      <div
        className={`relative flex flex-col items-center w-full ${
          isRegister ? 'max-w-2xl' : 'max-w-md'
        } my-auto transition-all duration-300`}
      >
        {/* BOTÃO DE FECHAR NO TOPO */}
        <button
          type="button"
          onClick={onClose}
          id="close-worscoi-login-modal"
          className="absolute -top-11 right-0 p-2 text-zinc-400 hover:text-white transition cursor-pointer z-20 rounded-full hover:bg-white/10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGO WORSCOI EM CURSIVA VERMELHA */}
        <div className="mb-2">
          <WorscoiLogo size="lg" />
        </div>

        {/* ANEL GIRATÓRIO TRACEJADO VERMELHO */}
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#FF2D55] animate-spin mb-3 drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]" />

        {/* CARD CENTRAL COM BORDA TRACEJADA WORSCOI */}
        <div className="w-full rounded-3xl border border-dashed border-zinc-700/80 bg-[#09090C]/95 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* TÍTULO E ABAS DE NAVEGAÇÃO: LOG IN vs SIGN IN (CADASTRO) */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-3">
              <button
                type="button"
                id="tab-login"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                id="tab-register"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-[#FF2D55] text-white shadow-md shadow-[#FF2D55]/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign in (Cadastro)
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isRegister ? 'Inscrição & Escolha do Plano' : 'Iniciar Sessão Worscoi'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isRegister
                ? 'Escolha seu plano, envie o comprovativo via Multicaixa/PayPay e ative seu acesso.'
                : 'Entre com e-mail, telemóvel angolano (+244) ou acesse como espectador em 1 clique.'}
            </p>
          </div>

          {/* MENSAGEM DE ERRO */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MENSAGEM DE SUCESSO */}
          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ACESSO RÁPIDO INSTANTÂNEO DE 1-CLIQUE NO MODO LOGIN */}
          {!isRegister && (
            <div className="space-y-2">
              <button
                type="button"
                id="btn-quick-guest-login"
                onClick={() => {
                  if (deviceTrial?.hasClaimed && deviceTrial?.isExpired) {
                    setErrorMsg(
                      'O teste gratuito de 1 dia (24h) já expirou neste aparelho. Por favor, faça login com sua conta existente ou cadastre-se escolhendo um de nossos planos.'
                    );
                    setIsRegister(true);
                    setSelectedPlanId('diario');
                    return;
                  }
                  handleGuest('user');
                }}
                disabled={loading}
                className="w-full p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-[#FF2D55]/40 hover:border-[#FF2D55] text-left transition-all cursor-pointer group flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FF2D55]/15 text-[#FF2D55]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FF2D55] transition-colors flex items-center gap-2">
                      <span>Acessar como Espectador</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${
                          deviceTrial?.hasClaimed && deviceTrial?.isExpired
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-[#FF2D55]/20 text-[#FF2D55] border-[#FF2D55]/30'
                        }`}
                      >
                        {deviceTrial?.hasClaimed && deviceTrial?.isExpired
                          ? 'Teste Expirado neste Aparelho'
                          : '1 Dia Grátis'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {deviceTrial?.hasClaimed && deviceTrial?.isExpired
                        ? '1 teste único por dispositivo • Assine um plano para continuar'
                        : 'Entrada imediata para assistir a todas as transmissões'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#FF2D55] group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  {deviceTrial?.hasClaimed && deviceTrial?.isExpired ? 'Ver Planos' : 'Entrar'}{' '}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          )}

          {/* SELETOR DE TIPO DE CONTA (NO CADASTRO) */}
          {isRegister && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                1. Tipo de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-role-user"
                  onClick={() => setSelectedRole('user')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'user'
                      ? 'bg-[#FF2D55]/10 border-[#FF2D55] text-white ring-1 ring-[#FF2D55]/50 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-1.5 rounded-lg bg-zinc-800 text-[#FF2D55]">
                      <Tv2 className="w-4 h-4" />
                    </div>
                    {selectedRole === 'user' && (
                      <span className="text-[9px] font-extrabold bg-[#FF2D55] text-white px-1.5 py-0.5 rounded-md">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Assinante / Espectador</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Acesso completo à programação</div>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-role-admin"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'admin'
                      ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Crown className="w-4 h-4" />
                    </div>
                    {selectedRole === 'admin' && (
                      <span className="text-[9px] font-extrabold bg-amber-400 text-black px-1.5 py-0.5 rounded-md">
                        Gestor
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">Administrador</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Gerenciar canais e assinantes</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ESCOLHA DO PLANO (NO CADASTRO PARA USUÁRIO) */}
          {isRegister && selectedRole === 'user' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  2. Escolha o Plano Desejado
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">Valores em Kwanzas (Kz)</span>
              </div>

              {/* GRADE DE PLANOS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allPlansList.map((planId) => {
                  const plan = PLANS[planId];
                  const isSelected = selectedPlanId === planId;
                  const isFree = planId === 'free';
                  const isFreeUsedOnDevice = isFree && deviceTrial?.hasClaimed && deviceTrial?.isExpired;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        if (isFreeUsedOnDevice) {
                          setErrorMsg(
                            'O teste gratuito de 1 dia (24h) já foi utilizado neste aparelho. Não é permitido criar novas contas gratuitas no mesmo dispositivo. Por favor, selecione um plano a partir de 1.500 Kz.'
                          );
                          setSelectedPlanId('diario');
                          return;
                        }
                        setSelectedPlanId(plan.id);
                        setErrorMsg(null);
                      }}
                      className={`relative cursor-pointer p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                        isFreeUsedOnDevice
                          ? 'opacity-60 bg-zinc-950/80 border-rose-950 hover:border-rose-800'
                          : isSelected
                          ? 'bg-zinc-900 border-[#FF2D55] ring-1 ring-[#FF2D55]/50 shadow-md shadow-[#FF2D55]/20'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-black bg-amber-400 text-black shadow-sm flex items-center gap-0.5">
                          <Sparkles className="w-2 h-2" />
                          POPULAR
                        </div>
                      )}

                      {isFreeUsedOnDevice && (
                        <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-black bg-rose-500 text-white shadow-sm">
                          JÁ USADO
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${plan.badgeBg} ${plan.badgeText} ${plan.badgeBorder}`}
                          >
                            {plan.badge}
                          </span>
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#FF2D55] bg-[#FF2D55] text-white'
                                : 'border-zinc-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="font-bold text-xs text-white line-clamp-1">
                          {plan.name}
                        </div>
                        <div className="text-xs font-extrabold text-[#FF2D55] mt-0.5">
                          {plan.priceFormatted}
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-400">
                        <span>{plan.durationDays} {plan.durationDays === 1 ? 'dia' : 'dias'}</span>
                        <span className={isFree ? (isFreeUsedOnDevice ? 'text-rose-400 font-bold' : 'text-zinc-400') : 'text-amber-400 font-semibold'}>
                          {isFree ? (isFreeUsedOnDevice ? 'Expirado' : 'Sem taxa') : 'MCX Express'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CARD DETALHADO DO PLANO SELECIONADO */}
              {!isPaidPlan ? (
                /* Degustação 1 dia grátis */
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2 text-xs text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FF2D55] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Degustação por 1 Dia (24 Horas):</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Você terá 24 horas completas para experimentar todos os canais esportivos, beIN, SuperSport e filmes sem necessidade de pagamento imediato.
                    </p>
                  </div>
                </div>
              ) : (
                /* Pagamento MCX / PayPay e Comprovativo WhatsApp */
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-[#FF2D55]/40 space-y-3 shadow-lg shadow-black/60">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Smartphone className="w-3.5 h-3.5 text-[#FF2D55]" />
                        <span>Pagamento: {selectedPlan.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Transfira via Multicaixa Express ou PayPay e envie o comprovativo no WhatsApp.
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#FF2D55]">
                      {selectedPlan.priceFormatted}
                    </span>
                  </div>

                  {/* DADOS DE TRANSFERÊNCIA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">
                        Passo 1: Efetue a Transferência
                      </span>
                      {/* Alternador MCX / PayPay */}
                      <div className="flex items-center gap-1 p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setActivePaymentMethod('multicaixa')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                            activePaymentMethod === 'multicaixa'
                              ? 'bg-[#FF2D55] text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          MCX Express
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePaymentMethod('paypay')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                            activePaymentMethod === 'paypay'
                              ? 'bg-[#FF2D55] text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          PayPay
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-zinc-500 font-medium">
                            {activePaymentMethod === 'multicaixa' ? 'Número MCX Express' : 'Número PayPay'}:
                          </div>
                          <div className="text-xs font-black text-white font-mono">
                            {PAYMENT_CONFIG.phoneFormatted}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(PAYMENT_CONFIG.phone, 'phone')}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition border border-zinc-800 cursor-pointer"
                        >
                          {copiedField === 'phone' ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-zinc-500 font-medium">Valor Exato:</div>
                          <div className="text-xs font-black text-[#FF2D55] font-mono">
                            {selectedPlan.priceFormatted}
                          </div>
                        </div>
                        {selectedPlan.priceAOA ? (
                          <button
                            type="button"
                            onClick={() => handleCopy(String(selectedPlan.priceAOA), 'amount')}
                            className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition border border-zinc-800 cursor-pointer"
                          >
                            {copiedField === 'amount' ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* BOTÃO WHATSAPP OFICIAL */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Passo 2: Enviar Comprovativo no WhatsApp
                    </span>

                    <button
                      type="button"
                      onClick={handleOpenWhatsAppProof}
                      className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer active:scale-98"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-black text-[#25D366]" />
                      <span>Enviar Comprovante (+244 942 472 983)</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>

                    {whatsAppClicked && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 text-[11px] text-emerald-400 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Conversa aberta no WhatsApp! Aguarde os toques com o seu código de 5 dígitos.</span>
                      </div>
                    )}
                  </div>

                  {/* CÓDIGO DE ATIVAÇÃO OPCIONAL */}
                  <div className="pt-1.5 border-t border-zinc-800/80">
                    <label className="block text-[10px] font-bold text-zinc-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-400">
                        <KeyRound className="w-3 h-3" />
                        Já recebeu o Código de 5 Dígitos do WhatsApp? (Opcional):
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={activationTokenInput}
                      onChange={(e) => setActivationTokenInput(e.target.value.toUpperCase())}
                      placeholder="Ex: 8J4XK (Deixe vazio para ativar após o cadastro)"
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300 placeholder-zinc-600 font-mono tracking-widest text-center text-xs font-bold focus:outline-none focus:border-amber-400 transition-all uppercase"
                    />
                    <span className="text-[9px] text-zinc-500 block mt-1">
                      Você pode criar sua conta agora e ativar o código a qualquer momento através do botão &quot;Resgatar Chave&quot; no topo.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTÃO GOOGLE */}
          <button
            type="button"
            id="btn-worscoi-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50"
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
            <span>Continuar com Conta Google</span>
          </button>

          {/* DIVISOR */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/80" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase">
              <span className="bg-[#09090C] px-2 text-zinc-500 font-bold tracking-wider">
                {isRegister ? '3. Dados da Sua Conta' : 'Ou entrar com credenciais'}
              </span>
            </div>
          </div>

          {/* FORMULÁRIO DE CREDENCIAIS */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    id="input-full-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#FF2D55] transition"
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
                  id="input-email-phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail ou Telemóvel (ex: 942472983)"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#FF2D55] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Palavra-passe / Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#141418] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#FF2D55] transition"
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

            {/* CHAVE DE ADMIN QUANDO FOR SELECIONADO ADMIN */}
            {isRegister && selectedRole === 'admin' && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 animate-in fade-in">
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Chave de Acesso Admin (Opcional)
                </label>
                <input
                  type="text"
                  id="input-admin-key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ex: admin123 (ou deixe vazio para homologação)"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-amber-500/40 text-amber-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* BOTÃO PRINCIPAL DE SUBMISSÃO */}
            <button
              type="submit"
              id="btn-submit-worscoi-auth"
              disabled={loading}
              className={`w-full py-3 rounded-full text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-98 ${
                isRegister && selectedRole === 'admin'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
                  : 'bg-[#FF2D55] hover:bg-[#FF2D55]/90 shadow-[#FF2D55]/30'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {selectedRole === 'admin'
                      ? 'Cadastrar Administrador'
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
                  <span>Iniciar Sessão (Log in)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ATALHOS RÁPIDOS DE PREENCHIMENTO */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span>Atalhos:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('user')}
                className="text-[#FF2D55] hover:underline cursor-pointer font-semibold"
              >
                Espectador
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('phone')}
                className="text-zinc-300 hover:text-white underline cursor-pointer font-medium flex items-center gap-0.5"
                title="Preencher telemóvel 942472983"
              >
                <Phone className="w-2.5 h-2.5" />
                <span>942472983</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleGuest('user')}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#FF2D55]" />
              <span>Modo Convidado</span>
            </button>
          </div>

          {/* TOGGLE ENTRE LOGIN E CADASTRO */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-xs text-[#FF2D55] hover:underline font-bold cursor-pointer"
            >
              {isRegister
                ? 'Já possui uma conta? Clique aqui para Log in'
                : 'Ainda não tem conta? Clique aqui para Cadastrar-se (Sign in)'}
            </button>
          </div>

          {/* FOOTER BADGE DE SEGURANÇA */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sessão segura com persistência e failover • Suporte WhatsApp: +244 942 472 983</span>
          </div>
        </div>
      </div>
    </div>
  );
}
