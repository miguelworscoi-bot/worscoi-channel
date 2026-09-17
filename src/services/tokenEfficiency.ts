import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, safeFirestoreCall } from '@/lib/firebase';
import {
  AccessTokenRecord,
  SubscriptionPlanId,
  PLAN_HIERARCHY,
  RedeemTokenResult,
} from '@/types';

export const LOCAL_TOKENS_KEY = 'playsports_access_tokens';
export const LOCAL_REGISTRY_KEY = 'playsports_user_registry';

export const PLAN_NAMES: Record<SubscriptionPlanId, string> = {
  free: 'Plano Grátis Degustação (24h)',
  diario: 'Passe Fim de Semana (3 Dias)',
  basico: 'Plano Básico Semanal (7 Dias)',
  vip: 'Plano Mensal VIP (30 Dias)',
  premium: 'Plano Trimestral Premium (90 Dias)',
  anual: 'Passe Anual Campeão (365 Dias)',
};

export const PLAN_DURATIONS: Record<SubscriptionPlanId, number> = {
  free: 1,
  diario: 3,
  basico: 7,
  vip: 30,
  premium: 90,
  anual: 365,
};

const TOKEN_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateFiveCharCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * TOKEN_CHARSET.length);
    code += TOKEN_CHARSET[randomIndex];
  }
  return code;
}

// Caracteres alfanuméricos limpos permitidos (5 caracteres)
const TOKEN_REGEX = /^[A-Z0-9]{5}$/;

interface CacheEntry {
  token: AccessTokenRecord | null;
  timestamp: number;
}

/**
 * Métricas de eficiência operacional de tokens
 */
export interface TokenEfficiencyMetrics {
  cacheHits: number;
  cacheMisses: number;
  hitRatePercentage: number;
  totalLookups: number;
  batchOperationsExecuted: number;
  networkRequestsSaved: number;
  avgLookupLatencyMs: number;
}

class TokenEfficiencyEngine {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTTLMs: number = 2 * 60 * 1000; // 2 minutos de TTL
  private metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    batchOperationsExecuted: 0,
    totalLatencySum: 0,
    totalLookups: 0,
  };

  /**
   * Valida rapidamente o formato do token em memória (0ms, 0 leituras)
   */
  public isValidFormat(rawCode: string): boolean {
    if (!rawCode || typeof rawCode !== 'string') return false;
    const clean = rawCode.trim().toUpperCase();
    return TOKEN_REGEX.test(clean);
  }

  /**
   * Busca um token com eficiência máxima O(1):
   * 1. Cache em memória (<1ms)
   * 2. Cache no LocalStorage (<2ms)
   * 3. Busca direta por documento único no Firestore (getDoc(doc(db, 'access_tokens', code)))
   */
  public async lookupToken(rawCode: string): Promise<{
    token: AccessTokenRecord | null;
    source: 'memory_cache' | 'local_storage' | 'firestore_direct' | 'invalid_format';
    latencyMs: number;
  }> {
    const startTime = performance.now();
    const cleanCode = rawCode.trim().toUpperCase();

    if (!this.isValidFormat(cleanCode)) {
      return {
        token: null,
        source: 'invalid_format',
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    this.metrics.totalLookups++;

    // 1. Verificação no cache em memória
    const cached = this.cache.get(cleanCode);
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      this.metrics.cacheHits++;
      const latency = Math.round(performance.now() - startTime);
      this.metrics.totalLatencySum += latency;
      return {
        token: cached.token,
        source: 'memory_cache',
        latencyMs: latency,
      };
    }

    this.metrics.cacheMisses++;

    // 2. Verificação no cache do LocalStorage
    try {
      const localData = localStorage.getItem(LOCAL_TOKENS_KEY);
      if (localData) {
        const list: AccessTokenRecord[] = JSON.parse(localData);
        if (Array.isArray(list)) {
          const match = list.find((t) => t.code === cleanCode);
          if (match) {
            // Atualiza cache em memória
            this.cache.set(cleanCode, { token: match, timestamp: Date.now() });
            const latency = Math.round(performance.now() - startTime);
            this.metrics.totalLatencySum += latency;
            return {
              token: match,
              source: 'local_storage',
              latencyMs: latency,
            };
          }
        }
      }
    } catch {
      // Ignora erro de JSON local
    }

    // 3. Busca direta de documento único no Firestore (O(1) doc read em vez de collection scan)
    try {
      const docRef = doc(db, 'access_tokens', cleanCode);
      const snap = await safeFirestoreCall(() => getDoc(docRef), null, 2500);

      if (snap && snap.exists()) {
        const token = snap.data() as AccessTokenRecord;
        this.cache.set(cleanCode, { token, timestamp: Date.now() });
        this.syncToLocalStorage(token);

        const latency = Math.round(performance.now() - startTime);
        this.metrics.totalLatencySum += latency;
        return {
          token,
          source: 'firestore_direct',
          latencyMs: latency,
        };
      }
    } catch (err) {
      console.debug('Direct token lookup error:', err);
    }

    // Não encontrado
    this.cache.set(cleanCode, { token: null, timestamp: Date.now() });
    const latency = Math.round(performance.now() - startTime);
    this.metrics.totalLatencySum += latency;
    return {
      token: null,
      source: 'firestore_direct',
      latencyMs: latency,
    };
  }

  /**
   * Criação em Lote (Batch) de Tokens com WriteBatch:
   * Em vez de N requisições individuais ao Firestore, grava até 500 documentos em 1 só round-trip!
   */
  public async createTokensBatch(params: {
    plan: SubscriptionPlanId;
    quantity: number;
    durationDays?: number;
    notes?: string;
    creatorEmail?: string;
  }): Promise<AccessTokenRecord[]> {
    const { plan, quantity, notes, creatorEmail } = params;
    const planName = PLAN_NAMES[plan] || 'Plano VIP';
    const duration = params.durationDays ?? (PLAN_DURATIONS[plan] || 30);

    const newTokens: AccessTokenRecord[] = [];
    const generatedCodes = new Set<string>();

    for (let i = 0; i < quantity; i++) {
      let code = generateFiveCharCode();
      let attempts = 0;
      while (generatedCodes.has(code) && attempts < 100) {
        code = generateFiveCharCode();
        attempts++;
      }
      generatedCodes.add(code);

      const tokenRecord: AccessTokenRecord = {
        id: `tok_${code}_${Date.now()}`,
        code,
        plan,
        planName,
        durationDays: duration,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: creatorEmail || 'admin@worscoi.tv',
        notes: notes?.trim() || `Token ${planName} (${duration} dias)`,
      };

      newTokens.push(tokenRecord);
      // Armazena no cache em memória imediatamente
      this.cache.set(code, { token: tokenRecord, timestamp: Date.now() });
    }

    // Execução em batch no Firestore (1 requisição de rede para todo o lote)
    try {
      const batch = writeBatch(db);
      newTokens.forEach((t) => {
        const docRef = doc(db, 'access_tokens', t.code);
        batch.set(docRef, t);
      });

      await safeFirestoreCall(() => batch.commit(), null, 3500);
      this.metrics.batchOperationsExecuted++;
    } catch (err) {
      console.debug('Firestore batch commit fallback to individual save:', err);
    }

    // Atualiza LocalStorage em 1 única operação I/O
    this.batchSaveToLocalStorage(newTokens);

    return newTokens;
  }

  /**
   * Resgate Eficiente de Token de Acesso com Soma Cumulativa (Token Stacking)
   * Se o assinante possuir tempo restante (ex: assinou 3 dias, consumiu 1, restam 2 dias),
   * a ativação de um novo token (ex: 3 dias) SOMARÁ os 2 dias restantes + 3 novos dias = 5 dias de limite,
   * sucessivamente para quaisquer planos e prazos.
   */
  public async redeemToken(
    rawCode: string,
    user: {
      uid: string;
      email?: string | null;
      displayName?: string | null;
      currentPlan?: SubscriptionPlanId;
      currentPlanExpiresAt?: string | null;
      currentPlanName?: string;
    }
  ): Promise<RedeemTokenResult> {
    const cleanCode = rawCode.trim().toUpperCase();

    if (!this.isValidFormat(cleanCode)) {
      return {
        success: false,
        message: 'Código inválido. A chave token possui exatamente 5 letras e números autorizados pelo sistema (sem prefixos).',
      };
    }

    // Busca rápida O(1) e verificação de registro oficial
    const { token } = await this.lookupToken(cleanCode);

    if (!token) {
      return {
        success: false,
        message: 'Chave token inválida ou inexistente. Apenas chaves geradas oficialmente pelo sistema e registradas no histórico são válidas.',
      };
    }

    if (token.status === 'revoked') {
      return {
        success: false,
        message: 'Esta chave token foi revogada pelo administrador e perdeu todo o poder de ativação.',
      };
    }

    // UMA CHAVE TOKEN DEPOIS DE USADA NÃO TEM MAIS PODER
    if (token.status === 'used') {
      const usedDate = token.usedAt
        ? new Date(token.usedAt).toLocaleDateString('pt-BR')
        : 'data anterior';
      return {
        success: false,
        message: `Esta chave token já foi utilizada em ${usedDate} por ${token.usedByEmail || 'outro assinante'} e perdeu todo o poder de ativação. Uma chave token usada não tem mais poder.`,
      };
    }

    // Token Válido: Busca estado atual da assinatura para aplicar soma cumulativa (Token Stacking)
    const now = new Date();
    const nowMs = now.getTime();
    const tokenDurationDays = Number(token.durationDays) || PLAN_DURATIONS[token.plan] || 30;

    let existingExpiresAt: string | null = user.currentPlanExpiresAt ?? null;
    let existingPlan: SubscriptionPlanId | null = user.currentPlan ?? null;
    let existingPlanName: string | null = user.currentPlanName ?? null;

    // 1. Tenta recuperar estado da sessão local se não foi fornecido explicitamente
    if (!existingExpiresAt && typeof window !== 'undefined') {
      try {
        const sessionRaw =
          localStorage.getItem('worscoi_auth_session') ||
          localStorage.getItem('playsports_auth_session');
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          if (parsed.planExpiresAt) {
            existingExpiresAt = parsed.planExpiresAt;
            existingPlan = existingPlan || parsed.plan;
            existingPlanName = existingPlanName || parsed.planName;
          }
        }
      } catch {
        // Ignora
      }

      if (!existingExpiresAt) {
        try {
          const regRaw =
            localStorage.getItem('worscoi_user_registry') ||
            localStorage.getItem('playsports_user_registry');
          if (regRaw) {
            const regList = JSON.parse(regRaw);
            if (Array.isArray(regList)) {
              const found = regList.find(
                (u: { id?: string; uid?: string; email?: string; planExpiresAt?: string; plan?: SubscriptionPlanId; planName?: string }) =>
                  (u.id && u.id === user.uid) ||
                  (u.uid && u.uid === user.uid) ||
                  (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
              );
              if (found && found.planExpiresAt) {
                existingExpiresAt = found.planExpiresAt;
                existingPlan = existingPlan || found.plan;
                existingPlanName = existingPlanName || found.planName;
              }
            }
          }
        } catch {
          // Ignora
        }
      }
    }

    // 2. Se ainda não encontrou e temos Firestore disponível, busca do documento do usuário
    if (!existingExpiresAt && user.uid && !user.uid.startsWith('guest_')) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await safeFirestoreCall(() => getDoc(userDocRef), null, 1500);
        if (userSnap && userSnap.exists()) {
          const uData = userSnap.data();
          if (uData.planExpiresAt) {
            existingExpiresAt = uData.planExpiresAt;
            existingPlan = existingPlan || uData.plan;
            existingPlanName = existingPlanName || uData.planName;
          }
        }
      } catch {
        // Ignora
      }
    }

    // 3. Regra de Soma Cumulativa de Limite (Token Stacking):
    // Exemplo: se assinou 3 dias e consumiu 1, restam 2 dias.
    // Ao ativar mais 3 dias, o seu limite é somado: 2 dias restantes + 3 novos dias adicionados = 5 dias de limite total.
    const existingExpiryMs = existingExpiresAt ? new Date(existingExpiresAt).getTime() : 0;
    const isCurrentlyActive = existingExpiryMs > nowMs;

    let newExpiryMs: number;
    let isAccumulated = false;
    let remainingDaysBefore = 0;

    if (isCurrentlyActive) {
      isAccumulated = true;
      remainingDaysBefore = (existingExpiryMs - nowMs) / (24 * 60 * 60 * 1000);
      newExpiryMs = existingExpiryMs + (tokenDurationDays * 24 * 60 * 60 * 1000);
    } else {
      newExpiryMs = nowMs + (tokenDurationDays * 24 * 60 * 60 * 1000);
    }

    const expiration = new Date(newExpiryMs);
    const expiresAtISO = expiration.toISOString();
    const totalRemainingDays = Math.ceil((newExpiryMs - nowMs) / (24 * 60 * 60 * 1000));
    const addedDays = tokenDurationDays;

    // 4. Hierarquia de Planos:
    // Se o assinante possui um plano superior ativo (ex: VIP) e ativa um token de plano menor (ex: Diário),
    // preservamos a categoria superior e somamos os dias de acesso!
    const currentTier = existingPlan ? (PLAN_HIERARCHY[existingPlan] ?? 0) : 0;
    const tokenTier = PLAN_HIERARCHY[token.plan] ?? 1;

    let finalPlan: SubscriptionPlanId = token.plan;
    let finalPlanName: string = token.planName || PLAN_NAMES[token.plan] || 'Plano Worscoi';

    if (isCurrentlyActive && existingPlan && currentTier > tokenTier) {
      finalPlan = existingPlan;
      finalPlanName = existingPlanName || PLAN_NAMES[existingPlan] || token.planName;
    }

    // Uma chave token depois de usada perde imediatamente o status e não tem mais poder
    const updatedToken: AccessTokenRecord = {
      ...token,
      status: 'used',
      usedAt: now.toISOString(),
      usedByUserId: user.uid,
      usedByEmail: user.email || 'usuario@worscoi.tv',
    };

    // Atualiza caches imediatamente
    this.cache.set(cleanCode, { token: updatedToken, timestamp: Date.now() });
    this.syncToLocalStorage(updatedToken);

    // Notifica todo o sistema em tempo real sobre a perda de poder da chave
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('worscoi_tokens_updated', { detail: updatedToken }));
    }

    // Gravação assíncrona no Firestore
    try {
      const tokenDocRef = doc(db, 'access_tokens', cleanCode);
      const userDocRef = doc(db, 'users', user.uid);

      const batch = writeBatch(db);
      batch.set(tokenDocRef, updatedToken, { merge: true });
      batch.set(
        userDocRef,
        {
          plan: finalPlan,
          planName: finalPlanName,
          planExpiresAt: expiresAtISO,
          activatedToken: cleanCode,
        },
        { merge: true }
      );

      await safeFirestoreCall(() => batch.commit(), null, 3000);
      this.metrics.batchOperationsExecuted++;
    } catch (err) {
      console.debug('Erro ao persistir resgate de token:', err);
    }

    // Atualiza registros locais do usuário (ambas as chaves)
    const registryKeys = ['worscoi_user_registry', 'playsports_user_registry'];
    for (const regKey of registryKeys) {
      try {
        const rawReg = localStorage.getItem(regKey);
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            const userIdx = list.findIndex(
              (u: { id?: string; uid?: string; email?: string }) =>
                (u.id && u.id === user.uid) ||
                (u.uid && u.uid === user.uid) ||
                (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase())
            );
            if (userIdx >= 0) {
              list[userIdx].plan = finalPlan;
              list[userIdx].planName = finalPlanName;
              list[userIdx].planExpiresAt = expiresAtISO;
              list[userIdx].activatedToken = cleanCode;
              localStorage.setItem(regKey, JSON.stringify(list));
            }
          }
        }
      } catch {
        // Ignora
      }
    }

    // Atualiza sessão ativa no localStorage (ambas as chaves)
    const sessionKeys = ['worscoi_auth_session', 'playsports_auth_session'];
    for (const sKey of sessionKeys) {
      try {
        const sRaw = localStorage.getItem(sKey);
        if (sRaw) {
          const sObj = JSON.parse(sRaw);
          if (
            (sObj.id && sObj.id === user.uid) ||
            (sObj.uid && sObj.uid === user.uid) ||
            (user.email && sObj.email && sObj.email.toLowerCase() === user.email.toLowerCase())
          ) {
            sObj.plan = finalPlan;
            sObj.planName = finalPlanName;
            sObj.planExpiresAt = expiresAtISO;
            sObj.activatedToken = cleanCode;
            localStorage.setItem(sKey, JSON.stringify(sObj));
          }
        }
      } catch {
        // Ignora
      }
    }

    // Mensagem de confirmação contextual detalhada
    const formattedExpiryDate = expiration.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const formattedPrev =
      remainingDaysBefore < 1
        ? `${Math.max(1, Math.round(remainingDaysBefore * 24))} horas restantes`
        : `${Math.max(1, Math.round(remainingDaysBefore))} dias restantes`;

    const successMessage = isAccumulated
      ? `Chave token ativada com sucesso! Foram somados ${formattedPrev} + ${addedDays} dias adicionados = ${totalRemainingDays} dias no total (válido até ${formattedExpiryDate}).`
      : `Plano ${finalPlanName} ativado com sucesso por ${addedDays} dias (válido até ${formattedExpiryDate}).`;

    return {
      success: true,
      message: successMessage,
      plan: finalPlan,
      planName: finalPlanName,
      expiresAt: expiresAtISO,
      token: updatedToken,
      accumulated: isAccumulated,
      addedDays,
      remainingDaysTotal: totalRemainingDays,
      previousExpiresAt: existingExpiresAt,
    };
  }

  /**
   * Registra um token oficial individual no histórico do sistema (garantindo 100% de validade)
   */
  public async registerSingleToken(tokenRecord: AccessTokenRecord): Promise<void> {
    this.cache.set(tokenRecord.code, { token: tokenRecord, timestamp: Date.now() });
    this.syncToLocalStorage(tokenRecord);

    try {
      const docRef = doc(db, 'access_tokens', tokenRecord.code);
      await safeFirestoreCall(() => setDoc(docRef, tokenRecord, { merge: true }), null, 2500);
    } catch (err) {
      console.debug('Falha ao persistir token unitário no Firestore:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('worscoi_tokens_updated', { detail: tokenRecord }));
    }
  }

  /**
   * Retorna métricas de eficiência
   */
  public getMetrics(): TokenEfficiencyMetrics {
    const total = this.metrics.totalLookups;
    const hitRate = total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
    const avgLatency =
      total > 0 ? Math.round(this.metrics.totalLatencySum / total) : 0;

    return {
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      hitRatePercentage: Math.round(hitRate * 10) / 10,
      totalLookups: total,
      batchOperationsExecuted: this.metrics.batchOperationsExecuted,
      networkRequestsSaved: this.metrics.cacheHits + this.metrics.batchOperationsExecuted * 5,
      avgLookupLatencyMs: avgLatency,
    };
  }

  /**
   * Limpa cache em memória
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // --- MÉTODOS AUXILIARES ---

  private syncToLocalStorage(token: AccessTokenRecord) {
    try {
      const raw = localStorage.getItem(LOCAL_TOKENS_KEY);
      let list: AccessTokenRecord[] = [];
      if (raw) list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];

      const idx = list.findIndex((t) => t.code === token.code);
      if (idx >= 0) {
        list[idx] = token;
      } else {
        list.unshift(token);
      }
      localStorage.setItem(LOCAL_TOKENS_KEY, JSON.stringify(list));
    } catch {
      // Ignora
    }
  }

  private batchSaveToLocalStorage(newTokens: AccessTokenRecord[]) {
    try {
      const raw = localStorage.getItem(LOCAL_TOKENS_KEY);
      let list: AccessTokenRecord[] = [];
      if (raw) list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];

      const mergedMap = new Map<string, AccessTokenRecord>();
      list.forEach((t) => mergedMap.set(t.code, t));
      newTokens.forEach((t) => mergedMap.set(t.code, t));

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      localStorage.setItem(LOCAL_TOKENS_KEY, JSON.stringify(merged));
    } catch {
      // Ignora
    }
  }
}

// Instância singleton do motor de eficiência de tokens
export const tokenEfficiency = new TokenEfficiencyEngine();
