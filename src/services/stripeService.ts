import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import { SubscriptionPlanId } from '@/types';

let stripePromise: Promise<StripeJS | null> | null = null;

export interface StripeConfig {
  publishableKey: string;
  hasSecretKey: boolean;
  isConfigured: boolean;
  mode: 'test' | 'live' | 'demo';
}

export interface PaymentIntentResult {
  success: boolean;
  isDemoMode?: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  verified?: boolean;
  tokenCode?: string;
  planId?: SubscriptionPlanId;
  durationDays?: number;
  expiresAt?: string;
  message?: string;
  error?: string;
}

/**
 * Retorna as configurações do Stripe expostas pelo backend
 */
export async function getStripeConfig(): Promise<StripeConfig> {
  try {
    const res = await fetch('/api/stripe/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.debug('Failed to fetch stripe config from server:', err);
  }

  const pubKey =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_STRIPE_PUBLISHABLE_KEY) ||
    '';

  return {
    publishableKey: pubKey,
    hasSecretKey: false,
    isConfigured: Boolean(pubKey),
    mode: pubKey.startsWith('pk_test_') ? 'test' : 'demo',
  };
}

/**
 * Obtém a instância do Stripe.js inicializada com a chave pública
 */
export function getStripeInstance(customPublishableKey?: string): Promise<StripeJS | null> {
  if (!stripePromise) {
    stripePromise = (async () => {
      const config = await getStripeConfig();
      const key = customPublishableKey || config.publishableKey;
      if (!key) {
        return null;
      }
      return loadStripe(key);
    })();
  }
  return stripePromise;
}

/**
 * Cria uma intenção de pagamento no backend
 */
export async function createStripePaymentIntent(params: {
  planId: SubscriptionPlanId;
  planName: string;
  currency?: 'usd' | 'eur' | 'aoa';
  userId?: string;
  userEmail?: string;
  userName?: string;
}): Promise<PaymentIntentResult> {
  try {
    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha de comunicação com o servidor de pagamentos Stripe.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Inicia checkout hospedado do Stripe (Checkout Session)
 */
export async function createStripeCheckoutSession(params: {
  planId: SubscriptionPlanId;
  planName: string;
  currency?: 'usd' | 'eur';
  userId?: string;
  userEmail?: string;
}): Promise<{ success: boolean; url?: string; isDemoMode?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao iniciar checkout do Stripe.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Confirma o pagamento e gera token de ativação
 */
export async function verifyStripePayment(params: {
  paymentIntentId: string;
  planId: SubscriptionPlanId;
  userId?: string;
  userEmail?: string;
}): Promise<VerifyPaymentResult> {
  try {
    const res = await fetch('/api/stripe/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao validar pagamento no Stripe.';
    return {
      success: false,
      error: message,
    };
  }
}
