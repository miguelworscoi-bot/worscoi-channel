'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  KeyRound,
  History,
  Plus,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  Clock,
  Sparkles,
  X,
  RefreshCw,
  Edit3,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  AccessTokenRecord,
  SubscriberUser,
  SubscriptionPlanId,
} from '@/types';
import { SubscriberGrowthChart } from '@/components/SubscriberGrowthChart';
import {
  PLANS,
  getAccessTokens,
  createAccessTokens,
  revokeAccessToken,
  getSubscribers,
  updateSubscriberPlan,
} from '@/services/subscriptionService';

interface SubscribersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'subscribers' | 'generator' | 'history' | 'growth';

export function SubscribersModal({ isOpen, onClose }: SubscribersModalProps) {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('subscribers');

  // Estados dos assinantes
  const [subscribers, setSubscribers] = useState<SubscriberUser[]>([]);
  const [searchSubscriber, setSearchSubscriber] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Estados de edição de plano de assinante
  const [editingSubscriber, setEditingSubscriber] = useState<SubscriberUser | null>(null);
  const [newSelectedPlan, setNewSelectedPlan] = useState<SubscriptionPlanId>('vip');
  const [newPlanDuration, setNewPlanDuration] = useState<number>(30);
  const [savingPlanEdit, setSavingPlanEdit] = useState(false);

  // Estados dos tokens
  const [tokens, setTokens] = useState<AccessTokenRecord[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [searchToken, setSearchToken] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'revoked'>('all');

  // Estados do gerador
  const [genPlan, setGenPlan] = useState<SubscriptionPlanId>('vip');
  const [genQuantity, setGenQuantity] = useState<number>(1);
  const [genDuration, setGenDuration] = useState<number>(30);
  const [genNotes, setGenNotes] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [recentlyGenerated, setRecentlyGenerated] = useState<AccessTokenRecord[]>([]);

  // Feedback de cópia
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Carrega dados quando modal abre
  useEffect(() => {
    if (isOpen) {
      loadSubscribersData();
      loadTokensData();
    }
  }, [isOpen]);

  const loadSubscribersData = async () => {
    setLoadingSubscribers(true);
    try {
      const data = await getSubscribers();
      setSubscribers(data);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const loadTokensData = async () => {
    setLoadingTokens(true);
    try {
      const data = await getAccessTokens();
      setTokens(data);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Atualiza duração padrão ao selecionar plano no gerador
  const handleGenPlanChange = (plan: SubscriptionPlanId) => {
    setGenPlan(plan);
    setGenDuration(PLANS[plan].durationDays || 30);
  };

  // Gerar novos tokens com 5 caracteres alfanuméricos
  const handleGenerateTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setFeedbackMsg(null);

    try {
      const newTokens = await createAccessTokens({
        plan: genPlan,
        quantity: Number(genQuantity) || 1,
        durationDays: Number(genDuration) || PLANS[genPlan].durationDays,
        notes: genNotes,
        creatorEmail: user?.email || 'admin@playsports.com',
      });

      setRecentlyGenerated(newTokens);
      setGenNotes('');
      // Atualiza lista geral de tokens
      await loadTokensData();
      setFeedbackMsg(
        `${newTokens.length} token(s) de 5 caracteres gerado(s) e adicionado(s) ao histórico com sucesso!`
      );
    } catch {
      setFeedbackMsg('Erro ao gerar tokens.');
    } finally {
      setGenerating(false);
    }
  };

  // Revogar token
  const handleRevokeToken = async (code: string) => {
    if (window.confirm(`Deseja revogar o código ${code}? Ele não poderá mais ser utilizado.`)) {
      await revokeAccessToken(code);
      await loadTokensData();
    }
  };

  // Salvar alteração manual de plano do assinante
  const handleSavePlanEdit = async () => {
    if (!editingSubscriber) return;
    setSavingPlanEdit(true);

    try {
      await updateSubscriberPlan(
        editingSubscriber.id,
        editingSubscriber.email,
        newSelectedPlan,
        newPlanDuration
      );
      await loadSubscribersData();
      setEditingSubscriber(null);
      setFeedbackMsg(`Plano de ${editingSubscriber.email} atualizado com sucesso!`);
    } catch {
      setFeedbackMsg('Erro ao atualizar o plano do assinante.');
    } finally {
      setSavingPlanEdit(false);
    }
  };

  // Filtros de assinantes
  const filteredSubscribers = subscribers.filter((sub) => {
    const q = searchSubscriber.toLowerCase();
    const matchesSearch =
      sub.email.toLowerCase().includes(q) ||
      sub.displayName.toLowerCase().includes(q);
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  // Filtros de tokens
  const filteredTokens = tokens.filter((tok) => {
    const q = searchToken.toLowerCase();
    const matchesSearch =
      tok.code.toLowerCase().includes(q) ||
      tok.planName.toLowerCase().includes(q) ||
      (tok.usedByEmail && tok.usedByEmail.toLowerCase().includes(q)) ||
      (tok.notes && tok.notes.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' || tok.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Métricas rápidas
  const totalSubscribers = subscribers.length;
  const activePaidSubscribers = subscribers.filter((s) => s.plan !== 'free').length;
  const availableTokensCount = tokens.filter((t) => t.status === 'active').length;
  const usedTokensCount = tokens.filter((t) => t.status === 'used').length;

  if (!isOpen) return null;
  if (!isAdmin) return null;

  return (
    <div
      id="subscribers-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="subscribers-modal"
        className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO COM LOGO E ABAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-850">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Central de Assinantes & Tokens
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Painel Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Gerenciamento de usuários, geração de tokens com 5 dígitos e histórico de validações.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                loadSubscribersData();
                loadTokensData();
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-zinc-400 hover:text-white text-xs font-bold"
            >
              OK
            </button>
          </div>
        )}

        {/* MÉTRICAS EM DESTAQUE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Usuários
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {totalSubscribers}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Cadastrados no site</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Assinantes Ativos
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              {activePaidSubscribers}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Planos pagos ativos</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Tokens Disponíveis
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {availableTokensCount}
            </div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Prontos para resgate</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-850">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Tokens Resgatados
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-300 mt-1">
              {usedTokensCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">No histórico validado</div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('subscribers')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Meus Assinantes ({subscribers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Gerador de Tokens (5 Dígitos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico ({tokens.length})</span>
          </button>

          <button
            type="button"
            id="tab-growth-chart"
            onClick={() => setActiveTab('growth')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'growth'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Crescimento (30 Dias)</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="mt-5">
          {/* ============================================================ */}
          {/* ABA 1: LISTA DE ASSINANTES E SEUS PLANOS ATIVOS               */}
          {/* ============================================================ */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              {/* Barra de Filtros de Assinantes */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchSubscriber}
                    onChange={(e) => setSearchSubscriber(e.target.value)}
                    placeholder="Buscar assinante por nome ou e-mail..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 py-2 px-3 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">Todos os Planos</option>
                    <option value="free">Plano Gratuito</option>
                    <option value="basico">Básico Esportes</option>
                    <option value="vip">VIP Esportes HD</option>
                    <option value="premium">Premium Ultra 4K</option>
                    <option value="anual">Passe Anual Campeão</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Assinantes */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-850 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Usuário</th>
                      <th className="py-3 px-4">Papel</th>
                      <th className="py-3 px-4">Tipo de Plano Ativo</th>
                      <th className="py-3 px-4">Validade</th>
                      <th className="py-3 px-4">Token Ativado</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {loadingSubscribers ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          Carregando lista de assinantes...
                        </td>
                      </tr>
                    ) : filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          Nenhum assinante encontrado para o filtro aplicado.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => {
                        const planInfo = PLANS[sub.plan] || PLANS.free;
                        const isExpired =
                          sub.planExpiresAt && new Date(sub.planExpiresAt).getTime() < Date.now();

                        return (
                          <tr key={sub.id} className="hover:bg-zinc-850/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center font-bold text-xs text-white">
                                  {sub.displayName?.[0]?.toUpperCase() ||
                                    sub.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{sub.displayName}</div>
                                  <div className="text-[11px] text-zinc-400 font-mono">
                                    {sub.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                  sub.role === 'admin'
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                }`}
                              >
                                {sub.role === 'admin' ? 'ADMIN' : 'USUÁRIO'}
                              </span>
                            </td>

                            {/* TIPO DE PLANO ATIVO */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black border ${planInfo.badgeBg} ${planInfo.badgeText} ${planInfo.badgeBorder}`}
                                >
                                  {planInfo.name}
                                </span>
                                {isExpired && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                    Expirado
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* VALIDADE */}
                            <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                              {sub.planExpiresAt ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                  <span>
                                    {new Date(sub.planExpiresAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-500">Ilimitado / Sem expiração</span>
                              )}
                            </td>

                            {/* TOKEN ATIVADO */}
                            <td className="py-3 px-4 font-mono text-zinc-300">
                              {sub.activatedToken ? (
                                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                                  {sub.activatedToken}
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>

                            {/* AÇÕES */}
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSubscriber(sub);
                                  setNewSelectedPlan(sub.plan);
                                  setNewPlanDuration(PLANS[sub.plan]?.durationDays || 30);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-amber-400" />
                                <span>Alterar Plano</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: GERADOR DE TOKENS DE ACESSO (5 DÍGITOS 100% VÁLIDOS)   */}
          {/* ============================================================ */}
          {activeTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* FORMULÁRIO DO GERADOR (COL-SPAN 6) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
                  <Sparkles className="w-5 h-5 text-[#00E676]" />
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Gerar Tokens de Acesso Oficiais
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Gera combinações únicas de 5 caracteres alfanuméricos salvas no banco de dados.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGenerateTokens} className="space-y-4">
                  {/* Seleção do Plano Alvo */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Tipo de Plano que o Token Concede
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['diario', 'basico', 'vip', 'premium', 'anual'] as SubscriptionPlanId[]).map(
                        (planId) => {
                          const p = PLANS[planId];
                          const isSelected = genPlan === planId;
                          return (
                            <button
                              key={planId}
                              type="button"
                              onClick={() => handleGenPlanChange(planId)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00E676]/15 border-[#00E676] text-white shadow-sm'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <div className="font-extrabold text-xs flex items-center justify-between">
                                <span>{p.name}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black ${p.badgeBg} ${p.badgeText}`}
                                >
                                  {p.badge}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1">
                                {p.durationDays} dias de validade
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Duração & Quantidade */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Duração (Dias)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={genDuration}
                        onChange={(e) => setGenDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Quantidade de Tokens
                      </label>
                      <select
                        value={genQuantity}
                        onChange={(e) => setGenQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00E676] cursor-pointer"
                      >
                        <option value={1}>1 Token</option>
                        <option value={3}>3 Tokens</option>
                        <option value={5}>5 Tokens</option>
                        <option value={10}>10 Tokens</option>
                      </select>
                    </div>
                  </div>

                  {/* Observação / Identificador do Cliente */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Observação / Identificador (Opcional)
                    </label>
                    <input
                      type="text"
                      value={genNotes}
                      onChange={(e) => setGenNotes(e.target.value)}
                      placeholder="Ex: Cliente João - PIX #9201"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  {/* Botão de Ação */}
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full py-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00E676]/20"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Gerando e Validando Tokens...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>
                          Gerar {genQuantity > 1 ? `${genQuantity} Códigos` : 'Código'} de 5 Dígitos
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* CARD DE TOKENS RECÉM GERADOS (COL-SPAN 6) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white">
                      Códigos Gerados Prontos para Entrega
                    </h3>
                  </div>
                  {recentlyGenerated.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="text-[11px] font-bold text-[#00E676] hover:underline"
                    >
                      Ver no Histórico Completo &rarr;
                    </button>
                  )}
                </div>

                {recentlyGenerated.length === 0 ? (
                  <div className="py-12 px-4 rounded-xl border border-dashed border-zinc-800 text-center">
                    <KeyRound className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <div className="text-xs font-bold text-zinc-400">
                      Nenhum token gerado nesta sessão ainda
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                      Preencha o formulário ao lado e clique em &quot;Gerar Código&quot;. Os tokens
                      aparecerão aqui com o botão de cópia rápida.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {recentlyGenerated.map((tok) => {
                      const p = PLANS[tok.plan] || PLANS.vip;
                      const isCopied = copiedCode === tok.code;

                      return (
                        <div
                          key={tok.code}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg font-black tracking-widest text-[#00E676]">
                                {tok.code}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${p.badgeBg} ${p.badgeText} ${p.badgeBorder}`}
                              >
                                {p.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-1">
                              Validade: {tok.durationDays} dias • {tok.notes}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(tok.code)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
                  <strong>Proteção Contra Chutes Aleatórios:</strong> Os tokens são gravados
                  diretamente no registro autorizado. Qualquer usuário que tente adivinhar
                  combinações aleatórias no modal de resgate será sumariamente recusado.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: HISTÓRICO COMPLETO DE TOKENS E VALIDAÇÕES             */}
          {/* ============================================================ */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Barra de Busca e Filtro de Status */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchToken}
                    onChange={(e) => setSearchToken(e.target.value)}
                    placeholder="Buscar por código, plano ou e-mail..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'all' | 'active' | 'used' | 'revoked')
                    }
                    className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 py-2 px-3 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">🟢 Disponíveis (Válidos)</option>
                    <option value="used">🔵 Resgatados / Utilizados</option>
                    <option value="revoked">🔴 Revogados</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Histórico */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-850 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Código (5 Dígitos)</th>
                      <th className="py-3 px-4">Plano Vinculado</th>
                      <th className="py-3 px-4">Duração</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Resgatado Por</th>
                      <th className="py-3 px-4">Data de Criação</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {loadingTokens ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          Carregando histórico de tokens...
                        </td>
                      </tr>
                    ) : filteredTokens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          Nenhum token encontrado no histórico.
                        </td>
                      </tr>
                    ) : (
                      filteredTokens.map((tok) => {
                        const p = PLANS[tok.plan] || PLANS.vip;
                        const isCopied = copiedCode === tok.code;

                        return (
                          <tr key={tok.code} className="hover:bg-zinc-850/50 transition-colors">
                            {/* CÓDIGO */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black tracking-widest text-[#00E676] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                  {tok.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(tok.code)}
                                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copiar código"
                                >
                                  {isCopied ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* PLANO VINCULADO */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${p.badgeBg} ${p.badgeText} ${p.badgeBorder}`}
                              >
                                {p.name}
                              </span>
                            </td>

                            {/* DURAÇÃO */}
                            <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                              {tok.durationDays} dias
                            </td>

                            {/* STATUS */}
                            <td className="py-3 px-4">
                              {tok.status === 'active' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Disponível
                                </span>
                              )}
                              {tok.status === 'used' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                  Resgatado
                                </span>
                              )}
                              {tok.status === 'revoked' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                                  Revogado
                                </span>
                              )}
                            </td>

                            {/* RESGATADO POR */}
                            <td className="py-3 px-4 text-[11px] font-mono">
                              {tok.status === 'used' ? (
                                <div>
                                  <div className="text-zinc-200 font-bold">{tok.usedByEmail}</div>
                                  <div className="text-[10px] text-zinc-500">
                                    {tok.usedAt
                                      ? new Date(tok.usedAt).toLocaleString('pt-BR')
                                      : 'Recentemente'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>

                            {/* DATA DE CRIAÇÃO */}
                            <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                              {tok.createdAt
                                ? new Date(tok.createdAt).toLocaleDateString('pt-BR')
                                : '—'}
                            </td>

                            {/* AÇÕES */}
                            <td className="py-3 px-4 text-right">
                              {tok.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeToken(tok.code)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title="Revogar este token"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 4: GRÁFICO RECHARTS DE CRESCIMENTO DOS ÚLTIMOS 30 DIAS    */}
          {/* ============================================================ */}
          {activeTab === 'growth' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <SubscriberGrowthChart
                initialSubscribers={subscribers}
                onOpenSubscribersModal={() => setActiveTab('subscribers')}
              />
            </div>
          )}
        </div>

        {/* MODAL DE EDIÇÃO DE PLANO DO ASSINANTE */}
        {editingSubscriber && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setEditingSubscriber(null)}
          >
            <div
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <div>
                  <h3 className="text-sm font-black text-white">Alterar Plano do Assinante</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {editingSubscriber.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSubscriber(null)}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Selecione o Novo Plano
                  </label>
                  <div className="space-y-1.5">
                    {(['free', 'diario', 'basico', 'vip', 'premium', 'anual'] as SubscriptionPlanId[]).map(
                      (pid) => {
                        const p = PLANS[pid];
                        const isSel = newSelectedPlan === pid;
                        return (
                          <button
                            key={pid}
                            type="button"
                            onClick={() => {
                              setNewSelectedPlan(pid);
                              setNewPlanDuration(p.durationDays || 30);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                              isSel
                                ? 'bg-amber-400/15 border-amber-400 text-white font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{p.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black ${p.badgeBg} ${p.badgeText}`}
                            >
                              {p.badge}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {newSelectedPlan !== 'free' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Validade (Dias a contar de hoje)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={newPlanDuration}
                      onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubscriber(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingPlanEdit}
                  onClick={handleSavePlanEdit}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black text-xs font-black transition-colors cursor-pointer"
                >
                  {savingPlanEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
