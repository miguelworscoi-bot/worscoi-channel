'use client';
import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Radio,
  KeyRound,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  getSupabaseCredentials,
} from '@/services/supabaseService';

export function SupabaseStatusCard() {
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    channelCount?: number;
  } | null>(null);

  const configured = isSupabaseConfigured();
  const { url } = getSupabaseCredentials();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult({
        tested: true,
        connected: res.connected,
        message: res.message,
        channelCount: res.channelCount,
      });
    } catch {
      setTestResult({
        tested: true,
        connected: false,
        message: 'Falha inesperada ao testar conexão com o Supabase.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyEnvHint = () => {
    navigator.clipboard?.writeText(
      'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-anon-key'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/60 to-zinc-950/80 border border-emerald-500/30 space-y-5 shadow-sm">
      {/* CABEÇALHO DO CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Banco de Dados Supabase (PostgreSQL)
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  configured
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
              >
                {configured ? 'Credenciais Detectadas' : 'Aguardando Configuração'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {configured && url
                ? `Conectado ao endpoint: ${url.replace(/^https?:\/\//, '').split('.')[0]}...`
                : 'Schema SQL e tabelas relacionais preparados para produção.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testing}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
        </button>
      </div>

      {/* FEEDBACK DO TESTE SE DISPARADO */}
      {testResult && testResult.tested && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            testResult.connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}
        >
          {testResult.connected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <p className="font-semibold">{testResult.message}</p>
            {testResult.channelCount !== undefined && (
              <p className="text-[11px] opacity-80">
                Total de canais ativos registrados no PostgreSQL: {testResult.channelCount}
              </p>
            )}
          </div>
        </div>
      )}

      {/* GRADE DE RECURSOS ATIVOS NO SCHEMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            <span>Grade & Realtime</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Tabela <code className="text-emerald-400">public.canais</code> com suporte a contingência HLS e Z Sports.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auth & Profiles</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Trigger <code className="text-emerald-400">on_auth_user_created</code> sincronizado com cargos de admin.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>RPC de Tokens</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Função transacional <code className="text-emerald-400">resgatar_token_acesso</code> com recibo de ativação.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arquivo SQL Local</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Script <code className="text-emerald-400">supabase_schema.sql</code> pronto na raiz do projeto.
          </p>
        </div>
      </div>

      {/* GUIA DE CONFIGURAÇÃO DE VARIÁVEIS */}
      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>Variáveis de Ambiente Necessárias</span>
          </span>
          <p className="text-zinc-400 text-[11px]">
            Para conectar o cliente web diretamente, declare <code className="text-zinc-200">VITE_SUPABASE_URL</code> e <code className="text-zinc-200">VITE_SUPABASE_ANON_KEY</code> nas configurações da plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyEnvHint}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Copiar Variáveis'}</span>
        </button>
      </div>
    </div>
  );
}
