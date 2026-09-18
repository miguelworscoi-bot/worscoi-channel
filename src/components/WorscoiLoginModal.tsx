'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { WorscoiLogo } from './WorscoiLogo';
import { useAuth } from '@/context/AuthContext';
import { WorscoiPlanSelectionFlow } from './WorscoiPlanSelectionFlow';
import { SubscriptionPlanId } from '@/types';
import {
  validateFullName,
  validateEmailOrPhone,
  validatePassword,
} from '@/utils/authValidation';

interface WorscoiLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess?: () => void;
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
  onLoginSuccess,
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

  // Estados de toque / interação para exibição de validação
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validação dinâmica e reativa
  const nameValidation = useMemo(() => validateFullName(name), [name]);
  const emailValidation = useMemo(() => validateEmailOrPhone(email), [email]);
  const passwordValidation = useMemo(() => validatePassword(password), [password]);

  // Estados de submissão
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setRegisterStep('credentials');
      setErrorMsg(null);
      setLoading(false);
      setNameTouched(false);
      setEmailTouched(false);
      setPasswordTouched(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Ação ao clicar em "Avançar" no primeiro passo do cadastro simples
  const handleAdvanceToPlans = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    const nameCheck = validateFullName(name);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.message || 'Por favor, informe um nome completo autêntico.');
      return;
    }

    const emailCheck = validateEmailOrPhone(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.message || 'Por favor, informe um e-mail ou telemóvel válido.');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setErrorMsg(passCheck.message || 'Por favor, crie uma palavra-passe válida.');
      return;
    }

    // Avança para a etapa de seleção dos planos (Imagem 7)
    setRegisterStep('plans-flow');
  };

  // Submissão do Login direto
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailCheck = validateEmailOrPhone(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.message || 'Por favor, informe um e-mail ou telemóvel válido.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Por favor, informe sua palavra-passe.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmail(email, password);
      onLoginSuccess?.();
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

      onLoginSuccess?.();
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

      onLoginSuccess?.();
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
                  setNameTouched(false);
                  setEmailTouched(false);
                  setPasswordTouched(false);
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
                  setNameTouched(false);
                  setEmailTouched(false);
                  setPasswordTouched(false);
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Nome completo
                    </label>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Nome e sobrenome (sem números)
                    </span>
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="worscoi-register-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!nameTouched) setNameTouched(true);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      onBlur={() => setNameTouched(true)}
                      placeholder="Ex: João Silva ou Manuel Costa"
                      autoComplete="name"
                      className={`w-full pl-10 pr-10 py-3 bg-zinc-900/90 border rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-all duration-200 ${
                        nameTouched
                          ? nameValidation.isValid
                            ? 'border-emerald-500/70 bg-emerald-950/20 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25'
                            : 'border-rose-500/80 bg-rose-950/25 text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                          : 'border-zinc-800 hover:border-zinc-700 focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55]'
                      }`}
                    />
                    {nameTouched && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                        {nameValidation.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {nameTouched && !nameValidation.isValid && (
                    <p className="text-[11px] font-medium text-rose-400 mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{nameValidation.message}</span>
                    </p>
                  )}
                  {nameTouched && nameValidation.isValid && (
                    <p className="text-[11px] font-medium text-emerald-400 mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>Nome autêntico verificado</span>
                    </p>
                  )}
                </div>
              )}

              {/* CAMPO: E-MAIL OU TELEFONE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    E-mail ou Telemóvel
                  </label>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    ex: nome@dominio.com ou 942...
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="worscoi-auth-identifier-input"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!emailTouched) setEmailTouched(true);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="ex: seu.nome@gmail.com ou 942 472 983"
                    autoComplete="username email"
                    className={`w-full pl-10 pr-10 py-3 bg-zinc-900/90 border rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-all duration-200 ${
                      emailTouched
                        ? emailValidation.isValid
                          ? 'border-emerald-500/70 bg-emerald-950/20 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25'
                          : 'border-rose-500/80 bg-rose-950/25 text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55]'
                    }`}
                  />
                  {emailTouched && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                      {emailValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
                {emailTouched && !emailValidation.isValid && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span>{emailValidation.message}</span>
                  </p>
                )}
                {emailTouched && emailValidation.isValid && (
                  <p className="text-[11px] font-medium text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>
                      {emailValidation.type === 'email'
                        ? 'E-mail com formato e domínio válidos'
                        : emailValidation.type === 'phone'
                        ? 'Número de telemóvel angolano válido'
                        : 'Acesso de Administrador reconhecido'}
                    </span>
                  </p>
                )}
              </div>

              {/* CAMPO: PALAVRA-PASSE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Palavra-passe
                  </label>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    Mínimo 6 caracteres seguros
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="worscoi-auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!passwordTouched) setPasswordTouched(true);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    className={`w-full pl-10 pr-16 py-3 bg-zinc-900/90 border rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-all duration-200 ${
                      passwordTouched
                        ? passwordValidation.isValid
                          ? 'border-emerald-500/70 bg-emerald-950/20 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/25'
                          : 'border-rose-500/80 bg-rose-950/25 text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#FF2D55] focus:ring-1 focus:ring-[#FF2D55]'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {passwordTouched && (
                      <div className="pointer-events-none flex items-center">
                        {passwordValidation.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition cursor-pointer"
                      title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordTouched && !passwordValidation.isValid && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span>{passwordValidation.message}</span>
                  </p>
                )}
                {passwordTouched && passwordValidation.isValid && (
                  <p className="text-[11px] font-medium text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>Palavra-passe segura e aprovada</span>
                  </p>
                )}
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
                      setNameTouched(false);
                      setEmailTouched(false);
                      setPasswordTouched(false);
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
                      setNameTouched(false);
                      setEmailTouched(false);
                      setPasswordTouched(false);
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
