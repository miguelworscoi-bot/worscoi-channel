import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccessTokenRecord, PlanInfo, SubscriberUser, SubscriptionPlanId } from '@/types';

export const LOCAL_TOKENS_KEY = 'playsports_access_tokens';
export const LOCAL_REGISTRY_KEY = 'playsports_user_registry';

// Configurações e detalhes visuais dos planos de assinatura adaptados com Kwanza (Kz/AOA)
export const PLANS: Record<SubscriptionPlanId, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Plano Gratuito (Teste 24h)',
    badge: 'TESTE 1 DIA',
    badgeBg: 'bg-zinc-800/80',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-700',
    durationDays: 1, // Exatamente 1 dia (24 horas)
    priceFormatted: 'Grátis (1 Dia)',
    priceAOA: 0,
    description: 'Acesso de degustação por 1 dia (24 horas). Após 24 horas, a sessão expira e requer ativação.',
    features: [
      'Degustação por 1 Dia (24 Horas)',
      'Acesso aos canais esportivos',
      'Sessão expira automaticamente após 24h',
      'Suporte a múltiplos dispositivos',
    ],
  },
  diario: {
    id: 'diario',
    name: 'Passe Fim de Semana (3 Dias)',
    badge: '3 DIAS ⚽',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    durationDays: 3,
    priceFormatted: '1.500 Kz / 3 dias',
    priceAOA: 1500,
    description: 'Perfeito para os clássicos e jogos decisivos de sexta a domingo da Champions, Premier e La Liga.',
    features: [
      '3 Dias de Acesso Total e Ilimitado',
      'Transmissão Full HD 1080p',
      'Sem Anúncios ou Travamentos',
      'Ativação imediata via Token 5 Dígitos',
    ],
  },
  basico: {
    id: 'basico',
    name: 'Básico Esportes (30 Dias)',
    badge: 'BÁSICO',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/40',
    durationDays: 30,
    priceFormatted: '2.500 Kz / 30 dias',
    priceAOA: 2500,
    description: 'Acesso completo de 1 mês aos principais canais esportivos nacionais e internacionais em HD.',
    features: [
      'Grade Esportiva Essencial (30 dias)',
      'Transmissão HD Estável',
      'Áudio Duplo & Servidores Otimizados',
      'Suporte Básico',
    ],
  },
  vip: {
    id: 'vip',
    name: 'VIP Esportes HD (30 Dias)',
    badge: 'MAIS POPULAR ⭐',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    durationDays: 30,
    popular: true,
    priceFormatted: '4.000 Kz / 30 dias',
    priceAOA: 4000,
    description: 'O plano mais vendido! Todos os canais esportivos, ZAP, SuperSport e canais internacionais sem cortes.',
    features: [
      'Todos os Canais Liberados (ZAP & SuperSport)',
      'Zero Anúncios & Sem Travamentos',
      'Modo Cinema & Failover Inteligente',
      'Suporte VIP Prioritário via WhatsApp',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium Ultra 4K (90 Dias)',
    badge: 'PREMIUM 4K 🔥',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/40',
    durationDays: 90,
    priceFormatted: '9.500 Kz / 90 dias',
    priceAOA: 9500,
    description: '3 meses de esportes ao vivo com economia de 2.500 Kz. Máxima prioridade de servidor e qualidade 4K.',
    features: [
      '90 Dias de Acesso Contínuo',
      'Economia de 2.500 Kz',
      'Resolução Ultra HD 4K',
      'Servidores Espelho Dedicados',
    ],
  },
  anual: {
    id: 'anual',
    name: 'Passe Anual Campeão (365 Dias)',
    badge: 'ANUAL 👑',
    badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
    badgeText: 'text-yellow-300',
    badgeBorder: 'border-yellow-500/50',
    durationDays: 365,
    priceFormatted: '30.000 Kz / 365 dias',
    priceAOA: 30000,
    description: '1 ano completo de futebol e esportes ao vivo sem se preocupar. Inclui tokens de cortesia para convidados.',
    features: [
      '365 Dias de Acesso Total Irrestrito',
      'Todas as Ligas, Copas & Torneios Mundiais',
      '2 Tokens Bônus de Cortesia para Amigos',
      'Atendimento Exclusivo Dedicado',
    ],
  },
};

// Configurações Oficiais de Pagamento (Multicaixa Express & PayPay)
export const PAYMENT_CONFIG = {
  phone: '942472983',
  phoneFormatted: '942 472 983',
  internationalPhone: '+244942472983',
  multicaixa: {
    name: 'Multicaixa Express (MCX)',
    shortName: 'MCX Express',
    number: '942472983',
    numberFormatted: '942 472 983',
    beneficiary: 'PLAYSPORTS TV / 942 472 983',
    steps: [
      'Abra o aplicativo Multicaixa Express no seu smartphone.',
      'Selecione a opção "Transferência" ou "Enviar Dinheiro".',
      'Digite o número de telemóvel de destino: 942472983.',
      'Insira o valor exato do plano escolhido e confirme com o seu PIN MCX.',
      'Guarde o comprovativo digital gerado na tela do telemóvel.',
      'Envie o comprovativo pelo WhatsApp para 942472983 para receber seu Código de Acesso de 5 dígitos imediatamente!',
    ],
  },
  paypay: {
    name: 'PayPay Angola',
    shortName: 'PayPay',
    number: '942472983',
    numberFormatted: '942 472 983',
    beneficiary: 'PLAYSPORTS / 942 472 983',
    steps: [
      'Abra o aplicativo PayPay no seu telemóvel.',
      'Selecione a opção "Transferir / Pagar" para contacto telefónico.',
      'Insira o número da conta PayPay: 942472983.',
      'Insira o valor correspondente ao plano e confirme a transação.',
      'Envie o comprovativo pelo WhatsApp para validação imediata do seu Código.',
    ],
  },
  whatsappMessage: (planName: string, price: string) =>
    `https://wa.me/244942472983?text=${encodeURIComponent(
      `Olá! Acabei de efetuar o pagamento do plano *${planName}* (${price}) via Multicaixa Express / PayPay.\n\nEnvio aqui o meu comprovativo para receber o meu Código de Acesso de 5 dígitos.`
    )}`,
};

/**
 * Cria link personalizado do WhatsApp para envio do comprovativo de inscrição
 */
export function createWhatsAppPaymentProofLink(params: {
  planName: string;
  priceFormatted: string;
  userName?: string;
  contact?: string;
  paymentMethod?: string;
}): string {
  const { planName, priceFormatted, userName, contact, paymentMethod } = params;
  const lines: string[] = [
    `⚽ *INSCRIÇÃO & COMPROVATIVO DE PAGAMENTO - PLAYSPORTS TV*`,
    ``,
    `Olá equipe PLAYSPORTS TV! Estou a realizar a minha inscrição no site.`,
    `📋 *Plano Selecionado:* ${planName} (${priceFormatted})`,
  ];

  if (userName?.trim()) {
    lines.push(`👤 *Nome do Assinante:* ${userName.trim()}`);
  }
  if (contact?.trim()) {
    lines.push(`📱 *Contacto / Telemóvel:* ${contact.trim()}`);
  }
  if (paymentMethod) {
    lines.push(`💳 *Forma de Pagamento:* ${paymentMethod}`);
  }

  lines.push(
    ``,
    `Acabei de efetuar o pagamento e estou a enviar o comprovativo oficial em anexo.`,
    `Por favor, confirmem o recebimento e enviem o meu *Código de Ativação (Token de 5 dígitos)* com os toques para eu ativar na minha conta. Obrigado!`
  );

  return `https://wa.me/244942472983?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Verifica se o plano do usuário está expirado
 * - Admins nunca expiram
 * - Usuários gratuitos expiram após 1 dia (24 horas)
 * - Usuários com data de expiração comparam com Date.now()
 */
export function isUserPlanExpired(profile?: {
  role?: string;
  plan?: SubscriptionPlanId;
  planExpiresAt?: string | null;
  createdAt?: string;
} | null): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return false;

  // Se já tem data de expiração cadastrada, confere diretamente
  if (profile.planExpiresAt) {
    return new Date(profile.planExpiresAt).getTime() < Date.now();
  }

  // Se for plano gratuito sem expiresAt explicitado, checa 24 horas a partir da criação
  if (profile.plan === 'free' || !profile.plan) {
    if (profile.createdAt) {
      const createdTime = new Date(profile.createdAt).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      return Date.now() > createdTime + oneDayMs;
    }
  }

  return false;
}

/**
 * Retorna o tempo restante formatado para a expiração do plano
 */
export function getRemainingPlanTime(profile?: {
  role?: string;
  plan?: SubscriptionPlanId;
  planExpiresAt?: string | null;
  createdAt?: string;
} | null): { expired: boolean; text: string; hoursLeft: number } {
  if (!profile || profile.role === 'admin') {
    return { expired: false, text: 'Acesso Ilimitado', hoursLeft: 9999 };
  }

  let expiryTime: number;
  if (profile.planExpiresAt) {
    expiryTime = new Date(profile.planExpiresAt).getTime();
  } else if (profile.plan === 'free' || !profile.plan) {
    const createdTime = profile.createdAt ? new Date(profile.createdAt).getTime() : Date.now();
    expiryTime = createdTime + 24 * 60 * 60 * 1000;
  } else {
    return { expired: false, text: 'Ativo', hoursLeft: 999 };
  }

  const diffMs = expiryTime - Date.now();
  if (diffMs <= 0) {
    return { expired: true, text: 'Expirado', hoursLeft: 0 };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursLeft >= 24) {
    const days = Math.floor(hoursLeft / 24);
    return { expired: false, text: `${days}d restantes`, hoursLeft };
  }

  if (hoursLeft > 0) {
    return { expired: false, text: `${hoursLeft}h ${minutesLeft}m restantes`, hoursLeft };
  }

  return { expired: false, text: `${minutesLeft} min restantes`, hoursLeft };
}

// Caracteres alfanuméricos limpos (sem 0/O ou 1/I para evitar confusão de digitação)
const TOKEN_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Gera um código de token de 5 caracteres alfanuméricos válidos
 */
export function generateFiveCharCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * TOKEN_CHARSET.length);
    code += TOKEN_CHARSET[randomIndex];
  }
  return code;
}

/**
 * Recupera tokens do localStorage
 */
function getLocalTokens(): AccessTokenRecord[] {
  try {
    const data = localStorage.getItem(LOCAL_TOKENS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignora
  }
  return [];
}

/**
 * Salva tokens no localStorage
 */
function saveLocalTokens(tokens: AccessTokenRecord[]) {
  try {
    localStorage.setItem(LOCAL_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Ignora
  }
}

/**
 * Carrega a lista completa de tokens (Firestore com fallback para localStorage)
 */
export async function getAccessTokens(): Promise<AccessTokenRecord[]> {
  const localList = getLocalTokens();

  try {
    const colRef = collection(db, 'access_tokens');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remoteTokens: AccessTokenRecord[] = [];
      snap.forEach((d) => {
        remoteTokens.push(d.data() as AccessTokenRecord);
      });

      // Mescla tokens locais e remotos para garantir consistência
      const mergedMap = new Map<string, AccessTokenRecord>();
      localList.forEach((t) => mergedMap.set(t.code, t));
      remoteTokens.forEach((t) => mergedMap.set(t.code, t));

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalTokens(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Firestore access_tokens inacessível, usando registro local:', err);
  }

  // Se não houver nenhum token salvo, inicializa com alguns tokens autorizados para homologação
  if (localList.length === 0) {
    const initialTokens: AccessTokenRecord[] = [
      {
        id: 'token_vip_1',
        code: 'V7K9M',
        plan: 'vip',
        planName: PLANS.vip.name,
        durationDays: 30,
        status: 'active',
        createdAt: new Date().toISOString(),
        notes: 'Token Cortesia VIP de Demonstração',
      },
      {
        id: 'token_prem_2',
        code: 'P4X8R',
        plan: 'premium',
        planName: PLANS.premium.name,
        durationDays: 90,
        status: 'active',
        createdAt: new Date().toISOString(),
        notes: 'Token Premium 90 Dias',
      },
      {
        id: 'token_anual_3',
        code: 'A9W2T',
        plan: 'anual',
        planName: PLANS.anual.name,
        durationDays: 365,
        status: 'active',
        createdAt: new Date().toISOString(),
        notes: 'Passe Anual Campeão 365 Dias',
      },
    ];
    saveLocalTokens(initialTokens);
    return initialTokens;
  }

  return localList;
}

/**
 * Cria novos tokens de acesso com 5 caracteres alfanuméricos garantidamente únicos
 */
export async function createAccessTokens(params: {
  plan: SubscriptionPlanId;
  quantity: number;
  durationDays?: number;
  notes?: string;
  creatorEmail?: string;
}): Promise<AccessTokenRecord[]> {
  const { plan, quantity, notes, creatorEmail } = params;
  const planInfo = PLANS[plan];
  const duration = params.durationDays ?? planInfo.durationDays;

  const currentTokens = await getAccessTokens();
  const existingCodes = new Set(currentTokens.map((t) => t.code));

  const newTokens: AccessTokenRecord[] = [];

  for (let i = 0; i < quantity; i++) {
    let code = generateFiveCharCode();
    // Garante que o código seja 100% único
    let attempts = 0;
    while (existingCodes.has(code) && attempts < 100) {
      code = generateFiveCharCode();
      attempts++;
    }
    existingCodes.add(code);

    const tokenRecord: AccessTokenRecord = {
      id: `tok_${code}_${Date.now()}`,
      code,
      plan,
      planName: planInfo.name,
      durationDays: duration,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: creatorEmail || 'admin@playsports.com',
      notes: notes?.trim() || `Token ${planInfo.name} (${duration} dias)`,
    };

    newTokens.push(tokenRecord);

    // Salva no Firestore
    try {
      await setDoc(doc(db, 'access_tokens', code), tokenRecord);
    } catch (err) {
      console.warn('Erro ao salvar token no Firestore:', err);
    }
  }

  // Atualiza persistência local
  const updatedTokens = [...newTokens, ...currentTokens];
  saveLocalTokens(updatedTokens);

  return newTokens;
}

/**
 * Revoga ou exclui um token da lista de autorizados
 */
export async function revokeAccessToken(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const current = await getAccessTokens();
  const updated = current.map((t) =>
    t.code === cleanCode ? { ...t, status: 'revoked' as const } : t
  );
  saveLocalTokens(updated);

  try {
    await updateDoc(doc(db, 'access_tokens', cleanCode), { status: 'revoked' });
  } catch {
    // Ignora
  }
}

/**
 * Resgata um token de acesso de 5 caracteres.
 * Impede combinações aleatórias conferindo estritamente a lista de tokens autorizados.
 */
export async function redeemAccessToken(
  rawCode: string,
  user: { uid: string; email?: string | null; displayName?: string | null }
): Promise<{
  success: boolean;
  message: string;
  plan?: SubscriptionPlanId;
  planName?: string;
  expiresAt?: string;
  token?: AccessTokenRecord;
}> {
  const code = rawCode.trim().toUpperCase();

  if (code.length !== 5) {
    return {
      success: false,
      message: 'O código deve ter exatamente 5 caracteres (letras e números).',
    };
  }

  // Busca tokens ativos
  const tokens = await getAccessTokens();
  const token = tokens.find((t) => t.code === code);

  // Se não existir no histórico do administrador, barra tentativas aleatórias
  if (!token) {
    return {
      success: false,
      message:
        'Código inválido ou inexistente. Apenas códigos autorizados gerados pelo administrador são aceitos.',
    };
  }

  if (token.status === 'revoked') {
    return {
      success: false,
      message: 'Este código de acesso foi revogado pelo administrador.',
    };
  }

  if (token.status === 'used') {
    const usedDate = token.usedAt
      ? new Date(token.usedAt).toLocaleDateString('pt-BR')
      : 'data anterior';
    return {
      success: false,
      message: `Este código já foi resgatado em ${usedDate} pelo usuário ${token.usedByEmail || 'outro assinante'}.`,
    };
  }

  // Token válido! Calcula data de expiração
  const now = new Date();
  const expiration = new Date(now);
  expiration.setDate(expiration.getDate() + (token.durationDays || 30));
  const expiresAtISO = expiration.toISOString();

  // Marca token como utilizado
  const updatedToken: AccessTokenRecord = {
    ...token,
    status: 'used',
    usedAt: now.toISOString(),
    usedByUserId: user.uid,
    usedByEmail: user.email || 'usuario@playsports.tv',
  };

  // Atualiza lista local
  const updatedList = tokens.map((t) => (t.code === code ? updatedToken : t));
  saveLocalTokens(updatedList);

  // Atualiza no Firestore
  try {
    await setDoc(doc(db, 'access_tokens', code), updatedToken, { merge: true });
  } catch (err) {
    console.warn('Erro ao atualizar token no Firestore:', err);
  }

  // Atualiza o plano do usuário no Firestore
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        plan: token.plan,
        planName: token.planName,
        planExpiresAt: expiresAtISO,
        activatedToken: code,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Erro ao salvar plano do usuário no Firestore:', err);
  }

  // Atualiza o perfil no registro local
  try {
    const registryData = localStorage.getItem(LOCAL_REGISTRY_KEY);
    if (registryData) {
      const registry = JSON.parse(registryData);
      if (Array.isArray(registry)) {
        const userEmail = (user.email || '').toLowerCase();
        const updatedRegistry = registry.map((u) => {
          if (u.id === user.uid || (u.email && u.email.toLowerCase() === userEmail)) {
            return {
              ...u,
              plan: token.plan,
              planName: token.planName,
              planExpiresAt: expiresAtISO,
              activatedToken: code,
            };
          }
          return u;
        });
        localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(updatedRegistry));
      }
    }
  } catch {
    // Ignora
  }

  // Atualiza sessão ativa
  try {
    const sessionData = localStorage.getItem('playsports_auth_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      parsed.plan = token.plan;
      parsed.planName = token.planName;
      parsed.planExpiresAt = expiresAtISO;
      parsed.activatedToken = code;
      localStorage.setItem('playsports_auth_session', JSON.stringify(parsed));
    }
  } catch {
    // Ignora
  }

  return {
    success: true,
    message: `Parabéns! O seu plano foi atualizado para ${token.planName} com sucesso até ${expiration.toLocaleDateString('pt-BR')}.`,
    plan: token.plan,
    planName: token.planName,
    expiresAt: expiresAtISO,
    token: updatedToken,
  };
}

/**
 * Carrega a lista de todos os usuários do site e seus respectivos planos ativos
 */
export async function getSubscribers(): Promise<SubscriberUser[]> {
  const subscribersMap = new Map<string, SubscriberUser>();

  // 1. Carrega do registro local
  try {
    const regData = localStorage.getItem(LOCAL_REGISTRY_KEY);
    if (regData) {
      const parsed = JSON.parse(regData);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          const plan: SubscriptionPlanId = u.plan || (u.role === 'admin' ? 'anual' : 'free');
          subscribersMap.set(u.email.toLowerCase(), {
            id: u.id,
            email: u.email,
            displayName: u.displayName || u.email.split('@')[0],
            photoURL: u.photoURL,
            role: u.role || 'user',
            plan,
            planName: PLANS[plan]?.name || 'Plano Gratuito',
            planExpiresAt: u.planExpiresAt || null,
            activatedToken: u.activatedToken || null,
            createdAt: u.createdAt || new Date().toISOString(),
          });
        });
      }
    }
  } catch {
    // Ignora
  }

  // 2. Carrega do Firestore se disponível
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      snap.forEach((d) => {
        const data = d.data();
        const email = (data.email || '').toLowerCase();
        if (email) {
          const plan: SubscriptionPlanId =
            data.plan || (data.role === 'admin' ? 'anual' : 'free');
          subscribersMap.set(email, {
            id: d.id,
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            photoURL: data.photoURL,
            role: data.role || 'user',
            plan,
            planName: PLANS[plan]?.name || 'Plano Gratuito',
            planExpiresAt: data.planExpiresAt || null,
            activatedToken: data.activatedToken || null,
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  } catch (err) {
    console.warn('Firestore users inacessível para listagem completa de assinantes:', err);
  }

  // 3. Garante usuários padrão se o mapa estiver vazio
  if (subscribersMap.size === 0) {
    const defaultUsers: SubscriberUser[] = [
      {
        id: 'usr_admin',
        email: 'admin@playsports.com',
        displayName: 'Administrador PLAYSPORTS',
        role: 'admin',
        plan: 'anual',
        planName: PLANS.anual.name,
        planExpiresAt: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_espectador',
        email: 'espectador@playsports.tv',
        displayName: 'Espectador Esportivo',
        role: 'user',
        plan: 'vip',
        planName: PLANS.vip.name,
        planExpiresAt: '2026-10-15T00:00:00.000Z',
        activatedToken: 'V7K9M',
        createdAt: '2026-08-10T12:00:00.000Z',
      },
      {
        id: 'usr_marcos',
        email: 'marcos.silva@gmail.com',
        displayName: 'Marcos Silva',
        role: 'user',
        plan: 'free',
        planName: PLANS.free.name,
        planExpiresAt: null,
        createdAt: '2026-09-01T14:30:00.000Z',
      },
    ];
    return defaultUsers;
  }

  return Array.from(subscribersMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Permite ao Administrador atualizar manualmente o plano de qualquer usuário
 */
export async function updateSubscriberPlan(
  userId: string,
  userEmail: string,
  newPlan: SubscriptionPlanId,
  durationDays?: number
): Promise<void> {
  const planInfo = PLANS[newPlan];
  const duration = durationDays ?? planInfo.durationDays;
  let expiresAtISO: string | null = null;

  if (duration > 0) {
    const exp = new Date();
    exp.setDate(exp.getDate() + duration);
    expiresAtISO = exp.toISOString();
  }

  // Atualiza no Firestore
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        plan: newPlan,
        planName: planInfo.name,
        planExpiresAt: expiresAtISO,
      },
      { merge: true }
    );
  } catch {
    // Ignora
  }

  // Atualiza no registro local
  try {
    const regData = localStorage.getItem(LOCAL_REGISTRY_KEY);
    if (regData) {
      const reg = JSON.parse(regData);
      if (Array.isArray(reg)) {
        const updated = reg.map((u) => {
          if (u.id === userId || u.email.toLowerCase() === userEmail.toLowerCase()) {
            return {
              ...u,
              plan: newPlan,
              planName: planInfo.name,
              planExpiresAt: expiresAtISO,
            };
          }
          return u;
        });
        localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(updated));
      }
    }
  } catch {
    // Ignora
  }

  // Se for o usuário ativo logado, atualiza a sessão
  try {
    const sessionData = localStorage.getItem('playsports_auth_session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed.id === userId || parsed.email.toLowerCase() === userEmail.toLowerCase()) {
        parsed.plan = newPlan;
        parsed.planName = planInfo.name;
        parsed.planExpiresAt = expiresAtISO;
        localStorage.setItem('playsports_auth_session', JSON.stringify(parsed));
      }
    }
  } catch {
    // Ignora
  }
}
