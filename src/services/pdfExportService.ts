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
  // 1. CABEÇALHO PRINCIPAL COM FAIXA SUPERIOR
  // ==========================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Detalhe de acento esmeralda
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 37, pageWidth, 2, 'F');

  // Marca / Logo Worscoi TV
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 9, 14, 14, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('W', margin + 7, 18.5, { align: 'center' });

  // Nome e subtítulo da empresa
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('WORSCOI TV', margin + 18, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Plataforma Digital de Streaming & Canais ao Vivo', margin + 18, 21);
  doc.text('Luanda, Angola  |  Suporte WhatsApp: +244 942 472 983', margin + 18, 26);

  // Selo de Comprovativo Oficial no topo direito
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('COMPROVATIVO OFICIAL', pageWidth - margin, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Recibo: ${cleanTextForPdf(receipt.receiptNumber)}`, pageWidth - margin, 21, { align: 'right' });
  doc.text(`${cleanTextForPdf(receipt.date)} às ${cleanTextForPdf(receipt.time)}`, pageWidth - margin, 26, { align: 'right' });

  let cursorY = 48;

  // ==========================================
  // 2. STATUS DO PAGAMENTO (DISTINTIVO)
  // ==========================================
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('STATUS: PAGO & VALIDADO COM SUCESSO', margin + 5, cursorY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Acesso liberado aos canais digitais', pageWidth - margin - 5, cursorY + 9, { align: 'right' });

  cursorY += 20;

  // ==========================================
  // 3. BOX DE DADOS DO CLIENTE & PAGAMENTO
  // ==========================================
  const boxHeight = 32;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 2, 2, 'FD');

  // Coluna 1: Dados do Assinante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('DADOS DO ASSINANTE', margin + 6, cursorY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(cleanTextForPdf(receipt.customerName || 'Assinante Worscoi'), margin + 6, cursorY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Telefone / WhatsApp: ${cleanTextForPdf(receipt.customerPhone || 'Nao informado')}`, margin + 6, cursorY + 20);
  doc.text(`Identificador: ${cleanTextForPdf(receipt.id || 'WRC-CLI')}`, margin + 6, cursorY + 26);

  // Linha divisória vertical interna
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 90, cursorY + 4, margin + 90, cursorY + boxHeight - 4);

  // Coluna 2: Dados do Pagamento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FORMA DE LIQUIDACAO', margin + 96, cursorY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const paymentLabels: Record<string, string> = {
    mcx: 'Multicaixa Express (MCX)',
    paypay: 'PayPay Africa',
    transfer: 'Transferencia Bancaria (IBAN)',
    cash: 'Dinheiro Direto / Balcao',
  };
  doc.text(paymentLabels[receipt.paymentMethod] || 'Multicaixa Express', margin + 96, cursorY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref. Transacao: ${cleanTextForPdf(receipt.paymentReference || 'TX-OFICIAL')}`, margin + 96, cursorY + 20);
  doc.text(`Emissor: ${cleanTextForPdf(receipt.issuedBy || 'Administracao Worscoi TV')}`, margin + 96, cursorY + 26);

  cursorY += boxHeight + 10;

  // ==========================================
  // 4. TABELA DE ITENS / DISCRIMINAÇÃO
  // ==========================================
  // Cabeçalho da tabela
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, cursorY, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRICAO DO SERVICO DIGITAL', margin + 4, cursorY + 5.5);
  doc.text('QTD', margin + 115, cursorY + 5.5, { align: 'center' });
  doc.text('DURACAO', margin + 140, cursorY + 5.5, { align: 'center' });
  doc.text('VALOR', pageWidth - margin - 4, cursorY + 5.5, { align: 'right' });

  cursorY += 8;

  // Linha da tabela
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Assinatura ${cleanTextForPdf(receipt.planName)}`, margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Acesso ilimitado a todos os canais de esportes, filmes e entretenimento HD', margin + 4, cursorY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1', margin + 115, cursorY + 8, { align: 'center' });
  doc.text('Ativo', margin + 140, cursorY + 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrencyPdf(receipt.planPriceFormatted || receipt.planPrice), pageWidth - margin - 4, cursorY + 8, { align: 'right' });

  cursorY += 16;

  // Linha de Total Geral
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, contentWidth, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('TOTAL GERAL LIQUIDADO:', margin + 4, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(formatCurrencyPdf(receipt.planPriceFormatted || receipt.planPrice), pageWidth - margin - 4, cursorY + 8, { align: 'right' });

  cursorY += 18;

  // ==========================================
  // 5. BLOCO DESTACADO: CHAVE TOKEN DE ATIVAÇÃO
  // ==========================================
  if (receipt.tokenCode) {
    const tokenCodeClean = cleanTextForPdf(receipt.tokenCode).toUpperCase();
    doc.setFillColor(15, 23, 42); // Fundo escuro premium slate-900
    doc.setDrawColor(16, 185, 129); // Borda esmeralda
    doc.roundedRect(margin, cursorY, contentWidth, 34, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text('CHAVE TOKEN OFICIAL DE ATIVACAO (5 CARACTERES)', margin + 8, cursorY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('Insira este codigo na tela inicial da Worscoi TV para liberar o sinal imediatamente:', margin + 8, cursorY + 15);

    // Caixinha para o código
    doc.setFillColor(2, 6, 23); // slate-950
    doc.setDrawColor(52, 211, 153);
    doc.roundedRect(margin + 8, cursorY + 18, 55, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(52, 211, 153);
    doc.text(tokenCodeClean, margin + 35.5, cursorY + 26, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Aviso: esta chave e de uso unico. Uma vez resgatada, perde o poder de ativacao.', margin + 68, cursorY + 24.5);

    cursorY += 40;
  }

  // ==========================================
  // 6. INSTRUÇÕES & TERMOS DE USO
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('INSTRUCOES PARA ACESSO:', margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Acesse a plataforma oficial Worscoi TV no seu computador, celular ou Smart TV.', margin, cursorY);
  cursorY += 4;
  doc.text('2. Clique no botao "Ativar Codigo" no topo da tela inicial.', margin, cursorY);
  cursorY += 4;
  doc.text('3. Digite a Chave Token informada acima para desbloquear todos os canais do seu plano.', margin, cursorY);
  cursorY += 4;
  doc.text('4. Em caso de duvidas ou suporte tecnico, envie mensagem para o WhatsApp Oficial: +244 942 472 983.', margin, cursorY);
  cursorY += 12;

  // ==========================================
  // 7. CARIMBO E AUTENTICIDADE DIGITAL
  // ==========================================
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  doc.setLineDashPattern([], 0); // reset

  cursorY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('AUTENTICACAO DIGITAL WORSCOI TV', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const authCode = `AUTH-${receipt.receiptNumber.replace('WRC-', '')}-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Codigo de Seguranca: ${authCode}`, margin, cursorY + 4);
  doc.text('Documento oficial emitido eletronicamente. Dispensa assinatura fisica.', margin, cursorY + 8);

  // Rodapé da página
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Worscoi TV (c) Todos os direitos reservados. Plataforma de Streaming de Alta Definicao.',
    pageWidth / 2,
    288,
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
  name: string;
  email: string;
  plan?: string;
  planId?: string;
  planExpiresAt?: string;
  validity?: string;
  status?: string;
  role?: string;
  avatar?: string;
}

export function exportSubscribersReportToPdf(params: {
  subscribers: (SubscriberUser | ReportSubscriberItem)[];
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
  const activeSubs = subscribers.filter((s) => s.status === 'active' || s.isActive).length;
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
