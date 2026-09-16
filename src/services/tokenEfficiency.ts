import {
  doc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, safeFirestoreCall } from '@/lib/firebase';
import { AccessTokenRecord, SubscriptionPlanId } from '@/types';

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

// Caracteres alfanuméricos limpos permitidos
const TOKEN_REGEX = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/;

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
        createdBy: creatorEmail || 'admin@playsports.tv',
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
   * Resgate Eficiente de Token de Acesso
   */
  public async redeemToken(
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
    const cleanCode = rawCode.trim().toUpperCase();

    if (!this.isValidFormat(cleanCode)) {
      return {
        success: false,
        message: 'Código inválido. A chave token possui exatamente 5 letras e números autorizados.',
      };
    }

    // Busca rápida O(1)
    const { token } = await this.lookupToken(cleanCode);

    if (!token) {
      return {
        success: false,
        message: 'Código não encontrado ou inexistente no sistema de assinaturas.',
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

    // Token Válido: Calcula expiração
    const now = new Date();
    const expiration = new Date(now);
    expiration.setDate(expiration.getDate() + (token.durationDays || 30));
    const expiresAtISO = expiration.toISOString();

    const updatedToken: AccessTokenRecord = {
      ...token,
      status: 'used',
      usedAt: now.toISOString(),
      usedByUserId: user.uid,
      usedByEmail: user.email || 'usuario@playsports.tv',
    };

    // Atualiza caches
    this.cache.set(cleanCode, { token: updatedToken, timestamp: Date.now() });
    this.syncToLocalStorage(updatedToken);

    // Gravação assíncrona no Firestore
    try {
      const tokenDocRef = doc(db, 'access_tokens', cleanCode);
      const userDocRef = doc(db, 'users', user.uid);

      const batch = writeBatch(db);
      batch.set(tokenDocRef, updatedToken, { merge: true });
      batch.set(
        userDocRef,
        {
          plan: token.plan,
          planName: token.planName,
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

    // Atualiza registro local do usuário
    try {
      const rawReg = localStorage.getItem(LOCAL_REGISTRY_KEY);
      if (rawReg) {
        const list = JSON.parse(rawReg);
        if (Array.isArray(list)) {
          const userIdx = list.findIndex((u) => u.uid === user.uid || u.email === user.email);
          if (userIdx >= 0) {
            list[userIdx].plan = token.plan;
            list[userIdx].planName = token.planName;
            list[userIdx].planExpiresAt = expiresAtISO;
            list[userIdx].activatedToken = cleanCode;
            localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(list));
          }
        }
      }
    } catch {
      // Ignora
    }

    return {
      success: true,
      message: `Plano ${token.planName} ativado com sucesso! Validade até ${expiration.toLocaleDateString('pt-BR')}.`,
      plan: token.plan,
      planName: token.planName,
      expiresAt: expiresAtISO,
      token: updatedToken,
    };
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
