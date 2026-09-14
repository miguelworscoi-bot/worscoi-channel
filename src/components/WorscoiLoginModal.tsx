'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';
import { useAuth } from '@/context/AuthContext';
import { WorscoiPlanSelectionFlow } from './WorscoiPlanSelectionFlow';
import { SubscriptionPlanId } from '@/types';

interface WorscoiLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onCelebration?: (data: {
    userName?: string;
    planName?: string;
    message?: string;
  }) => void;
}

export function WorscoiLoginModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onCelebration,
}: WorscoiLoginModalProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  // Etapas do cadastro: 'credentials' (nome, email, senha) -> 'plans-flow' (telas 7, 8, 9, 10)
  const [registerStep, setRegisterStep] = useState<'credentials' | 'plans-flow'>('credentials');

  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de submissão
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setRegisterStep('credentials');
      setErrorMsg(null);
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Ação ao clicar em "Avançar" no primeiro passo do cadastro simples
  const handleAdvanceToPlans = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanName) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Por favor, informe seu e-mail ou número de telefone.');
      return;
    }
    if (cleanPass.length < 3) {
      setErrorMsg('A palavra-passe deve ter pelo menos 3 caracteres.');
      return;
    }

    // Avança para a etapa de seleção dos planos (Imagem 7)
    setRegisterStep('plans-flow');
  };

  // Submissão do Login direto
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Por favor, informe seu e-mail ou número de telefone.');
      }
      if (!password.trim()) {
        throw new Error('Por favor, informe sua palavra-passe.');
      }

      await signInWithEmail(email, password);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao efetuar login. Verifique suas credenciais.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Callback quando o usuário escolhe o plano grátis de 1 dia na Imagem 7
  const handleSelectFreePlan = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await signUpWithEmail(
        email,
        password,
        name,
        'user',
        'free',
        'Plano Gratuito (Teste 24h)',
        null,
        null
      );

      onClose();

      // Dispara notificação de parabéns exigida na instrução
      if (onCelebration) {
        onCelebration({
          userName: name.trim() || 'Usuário',
          planName: 'Plano Grátis de 1 Dia (24 Horas)',
          message:
            'O seu plano gratuito de 1 dia foi ativado com sucesso! Aproveite todas as transmissões ao vivo em HD.',
        });
      }
    } catch (err: unknown) {
      // Se houver erro (ex: dispositivo ou email já usou teste), volta para plans-flow e exibe erro
      const msg = err instanceof Error ? err.message : 'Não foi possível ativar o plano gratuito.';
      setErrorMsg(msg);
      setRegisterStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  // Callback quando o usuário insere e valida com sucesso a chave token na Imagem 10
  const handleTokenValidated = async (params: {
    plan: SubscriptionPlanId;
    planName: string;
    token: string;
    expiresAt: string | null;
  }) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await signUpWithEmail(
        email,
        password,
        name,
        'user',
        params.plan,
        params.planName,
        params.token,
        params.expiresAt
      );

      onClose();

      // Notificação de parabéns pela ativação do plano pago com token
      if (onCelebration) {
        onCelebration({
          userName: name.trim() || 'Usuário',
          planName: params.planName,
          message:
            'A sua chave token foi validada com sucesso e seu plano foi ativado! Aproveite todo o conteúdo sem limites.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar com a chave token validada.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="worscoi-login-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="worscoi-login-modal-card"
        className={`relative w-full bg-[#050507] border border-zinc-900 rounded-3xl shadow-2xl shadow-black overflow-hidden my-auto transition-all duration-300 ${
          isRegister && registerStep === 'plans-flow'
            ? 'max-w-md sm:max-w-lg min-h-[600px]'
            : 'max-w-md'
        }`}
      >
        {/* ========================================================================= */}
        {/* FLUXO DE PLANOS DURANTE O CADASTRO (IMAGENS 7, 8, 9, 10)                  */}
        {/* ========================================================================= */}
        {isRegister && registerStep === 'plans-flow' ? (
          <WorscoiPlanSelectionFlow
            mode="register"
            userData={{
              name: name.trim(),
              email: email.trim(),
            }}
            onClose={onClose}
            onBackToPreviousStep={() => setRegisterStep('credentials')}
            onSelectFreePlan={handleSelectFreePlan}
            onTokenValidated={handleTokenValidated}
          />
        ) : (
          /* ========================================================================= */
          /* FORMULÁRIO BÁSICO: LOGIN OU CADASTRO ETAPA 1 (NOME, EMAIL, SENHA)        */
          /* ========================================================================= */
          <div className="p-6 sm:p-8 flex flex-col">
            {/* TOPO: LOGOMARCA WORSCOI + BOTÃO FECHAR */}
            <div className="flex items-center justify-between mb-6">
              <WorscoiLogo size="md" showDot />
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SELETOR DE MODO: ENTRAR / CRIAR CONTA */}
            <div className="flex bg-zinc-900/90 p-1 rounded-2xl mb-6 border border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  !isRegister
                    ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setRegisterStep('credentials');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isRegister
                    ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </button>
            </div>

            {/* TÍTULO E SUBTÍTULO */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isRegister ? 'Criar sua Conta Worscoi' : 'Acesse sua Conta'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {isRegister
                  ? 'Preencha seus dados para escolher seu plano em seguida.'
                  : 'Informe seus dados cadastrados para continuar assistindo.'}
              </p>
            </div>

            {/* MENSAGEM DE ERRO SE HOUVER */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORMULÁRIO */}
            <form
              onSubmit={isRegister ? handleAdvanceToPlans : handleLoginSubmit}
              className="space-y-4"
            >
              {/* CAMPO: NOME COMPLETO (APENAS CADASTRO) */}
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55] transition"
                    />
                  </div>
                </div>
              )}

              {/* CAMPO: E-MAIL OU TELEFONE */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  E-mail ou Telemóvel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com ou 942..."
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55] transition"
                  />
                </div>
              </div>

              {/* CAMPO: PALAVRA-PASSE */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 3 caracteres"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL DE SUBMISSÃO */}
              <div className="pt-2">
                {isRegister ? (
                  // Botão Avançar para os Planos
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Avançar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  // Botão Entrar
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#FF2D55] hover:bg-[#ff1744] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#FF2D55]/30 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Entrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Entrar</span>
                        <LogIn className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* RODAPÉ INFORMATIVO */}
            <div className="text-center mt-6 pt-4 border-t border-zinc-900">
              {isRegister ? (
                <p className="text-xs text-zinc-400">
                  Já possui uma conta ativa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setErrorMsg(null);
                    }}
                    className="text-[#FF2D55] font-bold hover:underline cursor-pointer"
                  >
                    Entrar agora
                  </button>
                </p>
              ) : (
                <p className="text-xs text-zinc-400">
                  Novo por aqui?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setRegisterStep('credentials');
                      setErrorMsg(null);
                    }}
                    className="text-[#FF2D55] font-bold hover:underline cursor-pointer"
                  >
                    Criar conta e escolher plano
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
