'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt,
  X,
  Printer,
  Copy,
  Check,
  Share2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  History,
  ArrowLeft,
  Trash2,
  FileDown,
} from 'lucide-react';
import { SubscriptionPlanId } from '@/types';
import { PLANS, generateFiveCharCode, registerSingleAccessToken } from '@/services/subscriptionService';
import { exportReceiptToPdf } from '@/services/pdfExportService';
import { useAuth } from '@/context/AuthContext';

export interface ReceiptData {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  planId: SubscriptionPlanId;
  planName: string;
  planPrice: number;
  planPriceFormatted: string;
  paymentMethod: 'mcx' | 'paypay' | 'transfer' | 'cash';
  paymentReference: string;
  tokenCode?: string;
  issuedBy: string;
  createdAt: string;
}

const LOCAL_STORAGE_RECEIPTS_KEY = 'worscoi_issued_receipts_v1';

interface WorscoiReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillPlanId?: SubscriptionPlanId;
}

export function WorscoiReceiptModal({
  isOpen,
  onClose,
  prefillPlanId = 'vip',
}: WorscoiReceiptModalProps) {
  const { user } = useAuth();
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  // Estados essenciais do formulário
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(prefillPlanId);
  const [paymentMethod, setPaymentMethod] = useState<'mcx' | 'paypay' | 'transfer' | 'cash'>('mcx');
  const [tokenCode, setTokenCode] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  
  // Feedback e visualização
  const [showHistory, setShowHistory] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [receiptHistory, setReceiptHistory] = useState<ReceiptData[]>([]);

  // Gera número de recibo único ao abrir
  const generateNewReceiptNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `WRC-${year}-${random}`;
  };

  // Inicializa dados do recibo
  useEffect(() => {
    if (isOpen) {
      setReceiptNumber(generateNewReceiptNumber());
      const newFiveCode = generateFiveCharCode();
      setTokenCode(newFiveCode);
      setShowHistory(false);
      setCopiedText(false);
      setSavedSuccess(false);

      if (prefillPlanId) {
        setSelectedPlan(prefillPlanId);
      }

      // Registra preventivamente o novo token gerado de 5 caracteres no histórico oficial do sistema
      const targetPlan = prefillPlanId || 'vip';
      const planInfo = PLANS[targetPlan] || PLANS.vip;
      registerSingleAccessToken({
        id: `tok_${newFiveCode}_${Date.now()}`,
        code: newFiveCode,
        plan: targetPlan,
        planName: planInfo.name,
        durationDays: planInfo.durationDays || 30,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'admin@worscoi.tv',
        notes: `Recibo Worscoi Oficial`,
      });

      // Carrega histórico
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY);
        if (stored) {
          setReceiptHistory(JSON.parse(stored));
        }
      } catch {
        // Ignora erro de storage
      }
    }
  }, [isOpen, prefillPlanId, user]);

  // Informações do plano ativo
  const currentPlanInfo = useMemo(() => {
    const found = PLANS[selectedPlan] || PLANS.vip;
    return {
      name: found.name,
      priceAOA: found.priceAOA,
      priceFormatted: `${found.priceAOA.toLocaleString('pt-AO')} Kz`,
      durationDays: found.durationDays,
    };
  }, [selectedPlan]);

  // Label do método de pagamento
  const paymentMethodLabel = useMemo(() => {
    switch (paymentMethod) {
      case 'mcx':
        return 'Multicaixa Express (MCX)';
      case 'paypay':
        return 'PayPay AO';
      case 'transfer':
        return 'Transferência Bancária / IBAN';
      case 'cash':
        return 'Dinheiro / Balcão';
      default:
        return 'Multicaixa Express';
    }
  }, [paymentMethod]);

  // Recibo compilado para exibição e impressão
  const currentReceipt: ReceiptData = useMemo(() => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: receiptNumber,
      receiptNumber,
      date: dateFormatted,
      time: timeFormatted,
      customerName: customerName.trim() || 'Estimado(a) Assinante',
      customerPhone: customerPhone.trim() || '+244 9XX XXX XXX',
      planId: selectedPlan,
      planName: currentPlanInfo.name,
      planPrice: currentPlanInfo.priceAOA,
      planPriceFormatted: currentPlanInfo.priceFormatted,
      paymentMethod,
      paymentReference: `TX-${receiptNumber.replace('WRC-', '')}`,
      tokenCode: tokenCode.trim(),
      issuedBy: user?.displayName || user?.email || 'Worscoi TV Oficial',
      createdAt: now.toISOString(),
    };
  }, [
    receiptNumber,
    customerName,
    customerPhone,
    selectedPlan,
    currentPlanInfo,
    paymentMethod,
    tokenCode,
    user,
  ]);

  // Salva no histórico e garante registro do token no sistema
  const handleSaveReceipt = () => {
    try {
      const updated = [
        currentReceipt,
        ...receiptHistory.filter((r) => r.receiptNumber !== currentReceipt.receiptNumber),
      ];
      setReceiptHistory(updated);
      localStorage.setItem(LOCAL_STORAGE_RECEIPTS_KEY, JSON.stringify(updated.slice(0, 50)));

      // Garante que o token de 5 caracteres gerado pelo sistema esteja 100% ativo no histórico oficial
      const cleanToken = (tokenCode || '').trim().toUpperCase();
      if (cleanToken.length === 5) {
        const planInfo = PLANS[selectedPlan] || PLANS.vip;
        registerSingleAccessToken({
          id: `tok_${cleanToken}_${Date.now()}`,
          code: cleanToken,
          plan: selectedPlan,
          planName: planInfo.name,
          durationDays: planInfo.durationDays || 30,
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: user?.email || 'admin@worscoi.tv',
          notes: `Recibo #${receiptNumber} - ${customerName.trim() || 'Assinante'}`,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      // Ignora erro
    }
  };

  // Imprimir recibo
  const handlePrintReceipt = () => {
    handleSaveReceipt();
    window.print();
  };

  // Exportar Recibo Oficial em PDF
  const handleDownloadPdf = (dataToExport?: ReceiptData) => {
    handleSaveReceipt();
    const target = dataToExport || currentReceipt;
    exportReceiptToPdf(target);
  };

  // Mensagem formatada do WhatsApp
  const whatsappMessage = useMemo(() => {
    return [
      `*━━━━━━━━━━━━━━━━━━━━━━*`,
      `*📺 WORSCOI TV — RECIBO OFICIAL*`,
      `*━━━━━━━━━━━━━━━━━━━━━━*`,
      ``,
      `*Recibo Nº:* \`${currentReceipt.receiptNumber}\``,
      `*Data:* ${currentReceipt.date} às ${currentReceipt.time}`,
      `*Status:* 🟢 *PAGO & VALIDADO*`,
      ``,
      `*ASSINANTE:* ${currentReceipt.customerName}`,
      `*CONTACTO:* ${currentReceipt.customerPhone}`,
      ``,
      `*DETALHES DO ACESSO:*`,
      `• *Plano:* ${currentReceipt.planName}`,
      `• *Valor:* *${currentReceipt.planPriceFormatted}*`,
      `• *Pagamento:* ${paymentMethodLabel}`,
      currentReceipt.tokenCode
        ? `\n*🔑 CHAVE TOKEN DE ATIVAÇÃO:*\n\`${currentReceipt.tokenCode}\`\n_(Insira este código na tela inicial do site Worscoi para liberar o sinal imediatamente)_`
        : '',
      ``,
      `*Worscoi TV — Streaming & Esportes Ao Vivo*`,
      `Suporte WhatsApp: +244 942 472 983`,
      `*━━━━━━━━━━━━━━━━━━━━━━*`,
    ]
      .filter(Boolean)
      .join('\n');
  }, [currentReceipt, paymentMethodLabel]);

  // Copia mensagem do WhatsApp
  const handleCopyWhatsApp = () => {
    handleSaveReceipt();
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  // Abre WhatsApp diretamente com o contato do assinante
  const handleOpenWhatsApp = () => {
    handleSaveReceipt();
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const targetPhone = cleanPhone.length >= 9 ? cleanPhone : '244942472983';
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  // Gerar novo token rápido de 5 caracteres registrado oficialmente
  const handleGenerateFastToken = () => {
    const newFiveCode = generateFiveCharCode();
    setTokenCode(newFiveCode);
    const planInfo = PLANS[selectedPlan] || PLANS.vip;
    registerSingleAccessToken({
      id: `tok_${newFiveCode}_${Date.now()}`,
      code: newFiveCode,
      plan: selectedPlan,
      planName: planInfo.name,
      durationDays: planInfo.durationDays || 30,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'admin@worscoi.tv',
      notes: `Recibo #${receiptNumber} - ${customerName.trim() || 'Assinante'}`,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="worscoi-receipt-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOPO: BARRA DE AÇÕES SUPERIOR */}
          <div className="px-5 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/70 flex items-center justify-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showHistory
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {showHistory ? (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar ao Recibo</span>
                  </>
                ) : (
                  <>
                    <History className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Histórico ({receiptHistory.length})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CORPO DO MODAL (CSS selector 2) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {showHistory ? (
              /* TELA DE HISTÓRICO LIMPA */
              <div className="space-y-4 max-w-2xl mx-auto py-2">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#ed3c5c]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recibos Emitidos Anteriores
                    </h3>
                  </div>
                  {receiptHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptHistory([]);
                        localStorage.removeItem(LOCAL_STORAGE_RECEIPTS_KEY);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpar</span>
                    </button>
                  )}
                </div>

                {receiptHistory.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs space-y-2">
                    <Receipt className="w-8 h-8 mx-auto text-zinc-600" />
                    <p>Nenhum recibo salvo no histórico desta sessão.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {receiptHistory.map((rec) => (
                      <div
                        key={rec.receiptNumber}
                        className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 flex items-center justify-between gap-3 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#ed3c5c]">
                              {rec.receiptNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                              {rec.planName}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-white">
                            {rec.customerName}{' '}
                            <span className="text-zinc-500 text-[11px]">({rec.customerPhone})</span>
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {rec.date} às {rec.time} • {rec.paymentMethod.toUpperCase()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-bold text-[#ed3c5c]">
                              {rec.planPriceFormatted}
                            </div>
                            {rec.tokenCode && (
                              <div className="text-[10px] font-mono text-zinc-400">
                                Token: <span className="text-zinc-200">{rec.tokenCode}</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(rec)}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-[#ed3c5c]/20 hover:text-[#ed3c5c] border border-zinc-700 hover:border-[#ed3c5c]/50 text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                            title="Baixar PDF deste recibo"
                          >
                            <FileDown className="w-3.5 h-3.5 text-[#ed3c5c]" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerName(rec.customerName);
                              setCustomerPhone(rec.customerPhone);
                              setSelectedPlan(rec.planId);
                              setPaymentMethod(rec.paymentMethod);
                              setTokenCode(rec.tokenCode || '');
                              setReceiptNumber(rec.receiptNumber);
                              setShowHistory(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
                          >
                            Carregar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* COMPOSIÇÃO INTEGRADA: FORMULÁRIO RÁPIDO (ESQUERDA) + RECIBO REAL (DIREITA) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: FORMULÁRIO ENXUTO E SEM DISTRAÇÕES (5 COLUNAS) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* 1. DADOS DO ASSINANTE */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#ed3c5c]" />
                        <span>Dados do Assinante</span>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Nome do Assinante
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Manuel dos Santos"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ed3c5c] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          WhatsApp / Telefone
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Ex: 942 472 983"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ed3c5c] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. PLANO DE ASSINATURA */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-2.5">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#ed3c5c]" />
                      <span>Plano de Assinatura</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'diario' as const, label: '3 Dias', price: '1.500 Kz' },
                        { id: 'basico' as const, label: 'Básico (30d)', price: '2.500 Kz' },
                        { id: 'vip' as const, label: 'VIP (30d)', price: '4.000 Kz' },
                        { id: 'premium' as const, label: 'Premium (90d)', price: '9.500 Kz' },
                        { id: 'anual' as const, label: 'Anual (365d)', price: '30.000 Kz' },
                      ].map((p) => {
                        const isSelected = selectedPlan === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlan(p.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-[#ed3c5c] bg-[#ed3c5c]/15 text-white shadow-sm'
                                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{p.label}</div>
                            <div className="text-[10px] font-semibold text-[#ed3c5c] mt-0.5">
                              {p.price}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. FORMA DE PAGAMENTO & TOKEN */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-[#ed3c5c]" />
                        <span>Forma de Pagamento</span>
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'mcx' as const, label: 'MCX Express' },
                          { id: 'paypay' as const, label: 'PayPay AO' },
                          { id: 'transfer' as const, label: 'Transferência' },
                          { id: 'cash' as const, label: 'Dinheiro' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition text-center ${
                              paymentMethod === m.id
                                ? 'border-[#ed3c5c] bg-[#ed3c5c]/15 text-[#ed3c5c] font-bold'
                                : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-[#ed3c5c]" />
                          <span>Chave Token de Acesso</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateFastToken}
                          className="text-[10px] text-[#ed3c5c] hover:text-[#ff4567] font-bold flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Gerar Novo</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={tokenCode}
                        onChange={(e) => setTokenCode(e.target.value)}
                        placeholder="Ex: 84K9M (5 caracteres)"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-[#ed3c5c] focus:outline-none focus:border-[#ed3c5c]"
                      />
                    </div>
                  </div>

                  {/* 4. BOTÕES DE AÇÃO IMEDIATA */}
                  <div className="space-y-2 pt-1">
                    {/* BOTÃO PRINCIPAL: EXPORTAR PDF OFICIAL */}
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf()}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#ed3c5c] hover:bg-[#ff4567] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-[#ed3c5c]/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-white" />
                      <span>Baixar Recibo Oficial em PDF</span>
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handlePrintReceipt}
                        className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Imprimir Recibo"
                      >
                        <Printer className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Imprimir</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenWhatsApp}
                        className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        title="Enviar Recibo pelo WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyWhatsApp}
                        className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Copiar Texto"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#ed3c5c]" />
                            <span className="text-[#ed3c5c]">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {savedSuccess && (
                      <p className="text-[10px] text-center text-[#ed3c5c] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Recibo salvo no histórico com sucesso</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* COLUNA DIREITA: RECIBO OFICIAL AO VIVO (7 COLUNAS) */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-2 text-xs text-zinc-400 px-1">
                    <span className="font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#ed3c5c]" />
                      <span>Visualização em Tempo Real</span>
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {currentReceipt.receiptNumber}
                    </span>
                  </div>

                  {/* DOCUMENTO DO RECIBO (DESIGN EXECUTIVO, LIMPO E PROFISSIONAL) */}
                  <div
                    ref={receiptPrintRef}
                    id="worscoi-printable-receipt"
                    className="w-full bg-white text-zinc-950 p-6 sm:p-8 rounded-2xl shadow-xl border border-zinc-200/90 space-y-6 select-text"
                  >
                    {/* CABEÇALHO SUPERIOR ELEGANTE */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-zinc-200">
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h1
                              data-logomark="true"
                              style={{ fontFamily: "'Brittany Signature', 'Brittany', cursive" }}
                              className="text-2xl sm:text-3xl font-normal tracking-wide text-zinc-950 leading-none font-brittany font-logomark logomark-font select-none"
                            >
                              Worscoi TV
                            </h1>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              FATURA-RECIBO
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                            Tecnologia de Transmissão & Streaming Digital
                          </p>
                        </div>
                        <div className="text-[10px] text-zinc-500 space-y-0.5 pt-0.5">
                          <p>Luanda, Angola • Suporte Oficial: +244 942 472 983</p>
                        </div>
                      </div>

                      {/* STATUS & IDENTIFICAÇÃO DO RECIBO */}
                      <div className="sm:text-right space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ed3c5c]/10 text-[#ed3c5c] border border-[#ed3c5c]/25 text-[10px] font-bold tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ed3c5c]" />
                          <span>PAGO & LIQUIDADO</span>
                        </div>
                        <div className="text-xs font-mono text-zinc-700">
                          Nº: <strong className="text-zinc-950 font-bold">{currentReceipt.receiptNumber}</strong>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Data: {currentReceipt.date} às {currentReceipt.time}
                        </div>
                      </div>
                    </div>

                    {/* DADOS BENTO: CLIENTE E PAGAMENTO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* CARD 1: DADOS DO ASSINANTE */}
                      <div className="p-4 rounded-xl bg-zinc-50/90 border border-zinc-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          Faturado A
                        </span>
                        <p className="text-sm font-bold text-zinc-950 leading-tight">
                          {currentReceipt.customerName}
                        </p>
                        <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                          <span>Telefone / WhatsApp:</span>
                          <strong className="text-zinc-800">{currentReceipt.customerPhone}</strong>
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          ID Cliente: {currentReceipt.id}
                        </p>
                      </div>

                      {/* CARD 2: DADOS DE LIQUIDAÇÃO */}
                      <div className="p-4 rounded-xl bg-zinc-50/90 border border-zinc-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          Forma de Liquidação
                        </span>
                        <p className="text-sm font-bold text-zinc-950 leading-tight">
                          {paymentMethodLabel}
                        </p>
                        <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                          <span>Referência:</span>
                          <strong className="font-mono text-zinc-800">{currentReceipt.paymentReference}</strong>
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Emissor: {currentReceipt.issuedBy}
                        </p>
                      </div>
                    </div>

                    {/* TABELA DE DISCRIMINAÇÃO DO SERVIÇO */}
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50/90 text-zinc-600 border-b border-zinc-200 text-[10px] uppercase font-bold tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Item / Descrição</th>
                            <th className="py-2.5 px-3 text-center">Duração</th>
                            <th className="py-2.5 px-3 text-center">Qtd</th>
                            <th className="py-2.5 px-4 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/70">
                          <tr>
                            <td className="py-3 px-4">
                              <p className="font-bold text-zinc-900 text-xs">
                                Assinatura Worscoi TV {currentReceipt.planName}
                              </p>
                              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                                Acesso irrestrito a todos os canais esportivos, filmes, séries e entretenimento HD.
                              </p>
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-700 font-medium">
                              {currentPlanInfo.durationDays ? `${currentPlanInfo.durationDays} Dias` : 'Ativo'}
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-700 font-medium">1</td>
                            <td className="py-3 px-4 text-right font-bold text-zinc-900">
                              {currentReceipt.planPriceFormatted}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* TOKEN DE ATIVAÇÃO — DESIGN ELEGANTE INTEGRADO AO DOCUMENTO */}
                    {currentReceipt.tokenCode && (
                      <div className="p-4 rounded-xl bg-[#ed3c5c]/5 border border-[#ed3c5c]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#ed3c5c] font-bold text-xs">
                            <KeyRound className="w-3.5 h-3.5 text-[#ed3c5c]" />
                            <span>Chave Token de Ativação do Assinante</span>
                          </div>
                          <p className="text-[11px] text-zinc-600">
                            Insira este código na tela inicial da plataforma para liberar seu acesso imediatamente:
                          </p>
                        </div>
                        <div className="self-start sm:self-auto px-4 py-1.5 rounded-lg bg-white border border-[#ed3c5c]/30 font-mono text-lg font-black tracking-[0.25em] text-[#ed3c5c] shadow-xs">
                          {currentReceipt.tokenCode}
                        </div>
                      </div>
                    )}

                    {/* BLOCO DE TOTAIS */}
                    <div className="pt-2 flex flex-col items-end gap-1 text-xs">
                      <div className="w-full sm:w-64 space-y-1.5">
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-zinc-800">{currentReceipt.planPriceFormatted}</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Impostos / IVA:</span>
                          <span className="font-semibold text-zinc-800">0,00 Kz (Isento)</span>
                        </div>
                        <div className="border-t border-zinc-300 pt-2 flex items-center justify-between">
                          <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-700">
                            Total Liquidado:
                          </span>
                          <span className="text-lg font-black text-zinc-950">
                            {currentReceipt.planPriceFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RODAPÉ & AUTENTICIDADE */}
                    <div className="border-t border-dashed border-zinc-200 pt-3 text-[10px] text-zinc-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#ed3c5c] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Comprovativo emitido digitalmente • Dispensa assinatura física</span>
                      </div>
                      <div className="font-mono text-[9px] text-zinc-400">
                        HASH: WRC-{currentReceipt.receiptNumber.replace('WRC-', '')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default WorscoiReceiptModal;
