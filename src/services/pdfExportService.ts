import { jsPDF } from 'jspdf';
import { ReceiptData } from '@/components/WorscoiReceiptModal';
import { AccessTokenRecord, SubscriberUser } from '@/types';

/**
 * Remove caracteres Unicode não suportados pela fonte padrão (Helvetica) do jsPDF
 * para evitar falhas ou caracteres corrompidos no documento gerado.
 */
function cleanTextForPdf(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ') // Mantém caracteres ASCII e Latin-1 (acentos pt-BR)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formata moeda para PDF limpo
 */
function formatCurrencyPdf(value: number | string): string {
  if (typeof value === 'string' && value.includes('Kz')) {
    return cleanTextForPdf(value);
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0,00 Kz';
  return `${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
}

/**
 * EXPORTAÇÃO OFICIAL DO RECIBO DA WORSCOI TV EM PDF
 * Layout executivo, limpo e profissional sem blocos pesados de tinta.
 */
export function exportReceiptToPdf(receipt: ReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  // ==========================================
  // 1. CABEÇALHO EXECUTIVO E MINIMALISTA
  // ==========================================
  let cursorY = 20;

  // Marca / Logo Worscoi TV (Ícone escuro discreto e elegante)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, cursorY - 3, 11, 11, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('W', margin + 5.5, cursorY + 4.5, { align: 'center' });

  // Nome da Empresa e Subtítulo
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('WORSCOI TV', margin + 15, cursorY + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Tecnologia de Transmissao & Streaming Digital', margin + 15, cursorY + 6.5);
  doc.text('Luanda, Angola  |  Suporte Oficial: +244 942 472 983', margin + 15, cursorY + 10.5);

  // Informações do Documento à Direita
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FATURA-RECIBO', pageWidth - margin, cursorY + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`No: ${cleanTextForPdf(receipt.receiptNumber)}`, pageWidth - margin, cursorY + 6.5, { align: 'right' });
  doc.text(`Data: ${cleanTextForPdf(receipt.date)} as ${cleanTextForPdf(receipt.time)}`, pageWidth - margin, cursorY + 10.5, { align: 'right' });

  // Badge de Status: PAGO & LIQUIDADO
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(pageWidth - margin - 42, cursorY + 13, 42, 6.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.text('STATUS: PAGO & LIQUIDADO', pageWidth - margin - 21, cursorY + 17.5, { align: 'center' });

  cursorY += 25;

  // Divisor sutil
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  cursorY += 6;

  // ==========================================
  // 2. BLOCOS DE INFORMAÇÃO BENTO (CLIENTE & LIQUIDAÇÃO)
  // ==========================================
  const cardWidth = (contentWidth - 6) / 2; // 84mm
  const cardHeight = 28;

  // CARD ESQUERDO: DADOS DO CLIENTE
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('FATURADO A (ASSINANTE)', margin + 5, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(cleanTextForPdf(receipt.customerName || 'Assinante Worscoi'), margin + 5, cursorY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Telefone / WhatsApp: ${cleanTextForPdf(receipt.customerPhone || 'Nao informado')}`, margin + 5, cursorY + 17.5);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text(`ID Cliente: ${cleanTextForPdf(receipt.id || 'WRC-CLI')}`, margin + 5, cursorY + 23);

  // CARD DIREITO: DETALHES DA LIQUIDAÇÃO
  const rightCardX = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, cursorY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('FORMA DE LIQUIDACAO', rightCardX + 5, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const paymentLabels: Record<string, string> = {
    mcx: 'Multicaixa Express (MCX)',
    paypay: 'PayPay Africa',
    transfer: 'Transferencia Bancaria (IBAN)',
    cash: 'Dinheiro / Balcao',
  };
  doc.text(paymentLabels[receipt.paymentMethod] || 'Multicaixa Express', rightCardX + 5, cursorY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref. Transacao: ${cleanTextForPdf(receipt.paymentReference || 'TX-OFICIAL')}`, rightCardX + 5, cursorY + 17.5);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text(`Emissor: ${cleanTextForPdf(receipt.issuedBy || 'Administracao Worscoi')}`, rightCardX + 5, cursorY + 23);

  cursorY += cardHeight + 8;

  // ==========================================
  // 3. TABELA DE ITENS / DISCRIMINAÇÃO
  // ==========================================
  // Cabeçalho da tabela (suave e limpo)
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 7.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('DESCRICAO DO SERVICO', margin + 4, cursorY + 5);
  doc.text('DURACAO', margin + 110, cursorY + 5, { align: 'center' });
  doc.text('QTD', margin + 135, cursorY + 5, { align: 'center' });
  doc.text('VALOR', pageWidth - margin - 4, cursorY + 5, { align: 'right' });

  cursorY += 7.5;

  // Linha da tabela
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Assinatura Worscoi TV ${cleanTextForPdf(receipt.planName)}`, margin + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Acesso irrestrito a todos os canais esportivos, filmes e entretenimento HD', margin + 4, cursorY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Ativo', margin + 110, cursorY + 7.5, { align: 'center' });
  doc.text('1', margin + 135, cursorY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(formatCurrencyPdf(receipt.planPriceFormatted || receipt.planPrice), pageWidth - margin - 4, cursorY + 7.5, { align: 'right' });

  cursorY += 14;

  // Bloco de Totais à direita
  const totalsWidth = 65;
  const totalsX = pageWidth - margin - totalsWidth;

  cursorY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, cursorY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrencyPdf(receipt.planPriceFormatted || receipt.planPrice), pageWidth - margin, cursorY, { align: 'right' });

  cursorY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Impostos / IVA:', totalsX, cursorY);
  doc.setTextColor(15, 23, 42);
  doc.text('0,00 Kz (Isento)', pageWidth - margin, cursorY, { align: 'right' });

  cursorY += 2;
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, cursorY, pageWidth - margin, cursorY);

  cursorY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL LIQUIDADO:', totalsX, cursorY);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrencyPdf(receipt.planPriceFormatted || receipt.planPrice), pageWidth - margin, cursorY, { align: 'right' });

  cursorY += 10;

  // ==========================================
  // 4. CHAVE TOKEN DE ATIVAÇÃO (DESIGN ELEGANTE E CLARO)
  // ==========================================
  if (receipt.tokenCode) {
    const tokenCodeClean = cleanTextForPdf(receipt.tokenCode).toUpperCase();
    const tokenBoxHeight = 24;

    doc.setFillColor(240, 253, 244); // emerald-50 suave
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, cursorY, contentWidth, tokenBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text('CHAVE TOKEN OFICIAL DE ATIVACAO IMEDIATA', margin + 6, cursorY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text('Insira este codigo na tela inicial da Worscoi TV para liberar o seu acesso:', margin + 6, cursorY + 12);
    doc.setFontSize(7);
    doc.setTextColor(74, 222, 128);
    doc.setTextColor(100, 116, 139);
    doc.text('Chave unica vinculada a este recibo e plano contratado.', margin + 6, cursorY + 18);

    // Box do Código Token (branca, nítida com letras espaçadas)
    const tokenPillW = 50;
    const tokenPillH = 12;
    const tokenPillX = pageWidth - margin - tokenPillW - 6;
    const tokenPillY = cursorY + 6;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(tokenPillX, tokenPillY, tokenPillW, tokenPillH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text(tokenCodeClean, tokenPillX + tokenPillW / 2, tokenPillY + 8, { align: 'center' });

    cursorY += tokenBoxHeight + 8;
  }

  // ==========================================
  // 5. INSTRUÇÕES DE ATIVAÇÃO
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('INSTRUCOES DE ACESSO:', margin, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Acesse a plataforma oficial Worscoi TV no seu computador, celular ou Smart TV.', margin, cursorY);
  cursorY += 4;
  doc.text('2. Clique no botao "Ativar Codigo" no topo da tela inicial e introduza a Chave Token acima.', margin, cursorY);
  cursorY += 4;
  doc.text('3. A liberacao dos canais e automatica. Suporte tecnico oficial via WhatsApp: +244 942 472 983.', margin, cursorY);
  cursorY += 9;

  // ==========================================
  // 6. CARIMBO DE SEGURANÇA & VALIDAÇÃO DIGITAL
  // ==========================================
  doc.setDrawColor(226, 232, 240);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  doc.setLineDashPattern([], 0); // reset

  cursorY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('AUTENTICACAO DIGITAL & SEGURANCA', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const authCode = `AUTH-${receipt.receiptNumber.replace('WRC-', '')}-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Codigo de Seguranca: ${authCode}`, margin, cursorY + 4);
  doc.text('Comprovativo emitido digitalmente nos termos vigentes. Dispensa assinatura manuscrita.', margin, cursorY + 8);

  // Rodapé da página fixo na parte inferior
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Worscoi TV (c) Todos os direitos reservados. Plataforma de Streaming de Alta Definicao.',
    pageWidth / 2,
    286,
    { align: 'center' }
  );

  // Salva o arquivo no dispositivo do usuário
  const cleanReceiptNum = receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `Recibo_Worscoi_${cleanReceiptNum || 'Oficial'}.pdf`;
  doc.save(fileName);
}

/**
 * EXPORTAÇÃO DE RELATÓRIO EXECUTIVO DE ASSINANTES E AUDITORIA DE TOKENS EM PDF
 */
export interface ReportSubscriberItem {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  phone?: string;
  plan?: string;
  planName?: string;
  planId?: string;
  planExpiresAt?: string;
  validity?: string;
  status?: string;
  isActive?: boolean;
  role?: string;
  avatar?: string;
}

export type AnyReportSubscriber = SubscriberUser | ReportSubscriberItem;

export function exportSubscribersReportToPdf(params: {
  subscribers: ReportSubscriberItem[];
  tokens?: AccessTokenRecord[];
  title?: string;
  generatedBy?: string;
}): void {
  const {
    subscribers,
    tokens = [],
    title = 'Relatorio Geral de Assinantes & Chaves Token',
    generatedBy = 'Administrador Worscoi TV',
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Cabeçalho
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 31, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('WORSCOI TV — PAINEL ADMINISTRATIVO', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(cleanTextForPdf(title), margin, 20);
  doc.text(`Emitido por: ${cleanTextForPdf(generatedBy)} em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, margin, 26);

  let cursorY = 40;

  // 2. Cards de Métricas Rápidas
  const activeSubs = subscribers.filter((s) => s.status === 'active' || s.isActive || s.validity === 'active').length;
  const activeTokens = tokens.filter((t) => t.status === 'active').length;
  const usedTokens = tokens.filter((t) => t.status === 'used').length;

  const cardWidth = (contentWidth - 6) / 3;

  // Card 1
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, cardWidth, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ASSINANTES', margin + 4, cursorY + 6);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${subscribers.length} (${activeSubs} ativos)`, margin + 4, cursorY + 14);

  // Card 2
  doc.roundedRect(margin + cardWidth + 3, cursorY, cardWidth, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOKENS VALIDOS (100%)', margin + cardWidth + 7, cursorY + 6);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(`${activeTokens} disponiveis`, margin + cardWidth + 7, cursorY + 14);

  // Card 3
  doc.roundedRect(margin + (cardWidth + 3) * 2, cursorY, cardWidth, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOKENS RESGATADOS', margin + (cardWidth + 3) * 2 + 7, cursorY + 6);
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text(`${usedTokens} sem poder`, margin + (cardWidth + 3) * 2 + 7, cursorY + 14);

  cursorY += 25;

  // 3. Tabela de Assinantes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Lista de Assinantes Cadastrados (${subscribers.length})`, margin, cursorY);
  cursorY += 4;

  // Header Tabela Assinantes
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NOME', margin + 3, cursorY + 4.8);
  doc.text('E-MAIL / TELEFONE', margin + 55, cursorY + 4.8);
  doc.text('PLANO', margin + 115, cursorY + 4.8);
  doc.text('STATUS', margin + 155, cursorY + 4.8);

  cursorY += 7;

  // Linhas Assinantes
  const maxSubsToShow = Math.min(subscribers.length, 25);
  for (let i = 0; i < maxSubsToShow; i++) {
    const sub = subscribers[i];
    const isEven = i % 2 === 0;

    if (cursorY > pageHeight - 30) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, cursorY, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const subName = cleanTextForPdf(sub.displayName || sub.name || 'Assinante').slice(0, 26);
    doc.text(subName, margin + 3, cursorY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const contact = cleanTextForPdf(sub.email || sub.phone || '-').slice(0, 32);
    doc.text(contact, margin + 55, cursorY + 4.8);

    const plan = cleanTextForPdf(sub.planName || sub.plan || 'VIP').slice(0, 22);
    doc.text(plan, margin + 115, cursorY + 4.8);

    const isAct = sub.status === 'active' || sub.isActive !== false;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isAct ? 16 : 225, isAct ? 185 : 29, isAct ? 129 : 72);
    doc.text(isAct ? 'ATIVO' : 'EXPIRADO', margin + 155, cursorY + 4.8);

    cursorY += 7;
  }

  cursorY += 8;

  // 4. Se houver tokens, renderizar seção de auditoria de chaves
  if (tokens.length > 0) {
    if (cursorY > pageHeight - 60) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Auditoria de Chaves Token (Total: ${tokens.length})`, margin, cursorY);
    cursorY += 4;

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, cursorY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('CHAVE (5 CHARS)', margin + 3, cursorY + 4.8);
    doc.text('PLANO ATRIBUIDO', margin + 45, cursorY + 4.8);
    doc.text('STATUS', margin + 95, cursorY + 4.8);
    doc.text('CRIADO EM', margin + 130, cursorY + 4.8);

    cursorY += 7;

    const maxTokensToShow = Math.min(tokens.length, 30);
    for (let i = 0; i < maxTokensToShow; i++) {
      const tok = tokens[i];
      const isEven = i % 2 === 0;

      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, cursorY, contentWidth, 6.5, 'FD');

      // Chave Token em negrito mono
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cleanTextForPdf(tok.code), margin + 3, cursorY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(cleanTextForPdf(tok.planName || tok.plan || 'VIP'), margin + 45, cursorY + 4.5);

      // Status
      doc.setFont('helvetica', 'bold');
      if (tok.status === 'active') {
        doc.setTextColor(16, 185, 129);
        doc.text('100% VALIDO', margin + 95, cursorY + 4.5);
      } else if (tok.status === 'used') {
        doc.setTextColor(100, 116, 139);
        doc.text('SEM PODER (USADO)', margin + 95, cursorY + 4.5);
      } else {
        doc.setTextColor(225, 29, 72);
        doc.text('REVOGADO', margin + 95, cursorY + 4.5);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const createdStr = tok.createdAt ? new Date(tok.createdAt).toLocaleDateString('pt-BR') : '-';
      doc.text(createdStr, margin + 130, cursorY + 4.5);

      cursorY += 6.5;
    }
  }

  // Rodapé do relatório
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Relatorio Oficial Worscoi TV - Gerado em ${new Date().toISOString()}`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Relatorio_Worscoi_Assinantes_${dateStr}.pdf`);
}
