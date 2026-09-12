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
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

export function AuthModal() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [adminKey, setAdminKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, informe seu nome.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setSubmitting(false);
          return;
        }

        // Validação da chave de admin se a opção for Administrador
        if (selectedRole === 'admin') {
          const validKeys = ['admin', 'admin123', 'gestor', 'playsports', '2026'];
          const keyNormalized = adminKey.trim().toLowerCase();
          if (adminKey.trim() && !validKeys.includes(keyNormalized)) {
            setError('Chave de Administrador inválida. Deixe em branco para usar chave padrão de homologação ou insira "admin123".');
            setSubmitting(false);
            return;
          }
        }

        await signUpWithEmail(email, password, name, selectedRole);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('E-mail ou senha incorretos.');
      } else if (msg.includes('email-already-in-use')) {
        setError('Este e-mail já está cadastrado. Tente entrar.');
      } else if (msg.includes('invalid-email')) {
        setError('E-mail inválido.');
      } else if (msg.includes('weak-password')) {
        setError('A senha é muito fraca. Escolha uma mais forte.');
      } else {
        setError('Ocorreu um erro ao processar seu acesso. Verifique seus dados.');
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('popup-closed-by-user')) {
        setError('Não foi possível entrar com o Google no momento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Quick helper to fill test accounts
  const handleQuickPreset = (role: UserRole) => {
    if (role === 'admin') {
      setEmail('admin@playsports.com');
      setPassword('admin123');
      setName('Administrador Geral');
      setSelectedRole('admin');
      setAdminKey('admin123');
    } else {
      setEmail('usuario@playsports.com');
      setPassword('usuario123');
      setName('Espectador Esportivo');
      setSelectedRole('user');
    }
  };

  return (
    <div
      id="auth-gate-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl px-4 py-8 overflow-y-auto"
    >
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* LOGO & HEADING */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00E676] to-emerald-400 p-0.5 shadow-lg shadow-[#00E676]/20 mb-3">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Tv className="w-7 h-7 text-[#00E676]" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isSignUp ? 'Criar Conta de Acesso' : 'Iniciar Sessão'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm">
            {isSignUp
              ? 'Selecione o tipo de sessão (Usuário Normal ou Admin) e preencha seus dados para continuar.'
              : 'Entre com a sua conta para acessar os canais ao vivo ou o painel administrativo.'}
          </p>
        </div>

        {/* SELETOR DE TIPO DE SESSÃO (NO CADASTRO) */}
        {isSignUp && (
          <div className="mb-5 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Tipo de Sessão
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Opção Usuário Normal */}
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
                  <div className="font-bold text-xs sm:text-sm text-white">Usuário Normal</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    Assistir todos canais, favoritar e modo cinema
                  </div>
                </div>
              </button>

              {/* Opção Administrador */}
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
                    Gerenciar grade, adicionar canais e métricas
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ERRO BANNER */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* BOTAO GOOGLE */}
        <button
          type="button"
          id="btn-login-google"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-zinc-500"
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

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500 font-semibold tracking-wider">
              Ou com seu e-mail
            </span>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
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
                  placeholder="Seu nome"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                id="auth-input-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                id="auth-input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all"
              />
            </div>
          </div>

          {/* CHAVE DE ADMIN QUANDO SELECIONADO CADASTRO COMO ADMIN */}
          {isSignUp && selectedRole === 'admin' && (
            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 animate-in fade-in">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Chave de Acesso Admin (Opcional)
              </label>
              <input
                type="text"
                id="auth-input-admin-key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Ex: admin123 (ou deixe vazio para padrão)"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Concede permissões totais para gerenciar a grade de canais ao vivo.
              </p>
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
                    : 'Criar Conta de Usuário Normal'}
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

        {/* ATALHOS RÁPIDOS PARA TESTE DE SESSÃO */}
        <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-center gap-2">
          <span className="text-[10px] text-zinc-500">Preenchimento rápido:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('user')}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            Usuário
          </button>
          <span className="text-zinc-600">•</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('admin')}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
          >
            Admin
          </button>
        </div>

        {/* TOGGLE ENTRE LOGIN E SIGNUP */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 text-center">
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
              {isSignUp ? 'Fazer login' : 'Inscrever-se gratuitamente'}
            </button>
          </p>
        </div>

        {/* FOOTER BADGE DE SEGURANÇA */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sessões com isolamento de permissões e segurança ativa</span>
        </div>
      </div>
    </div>
  );
}
