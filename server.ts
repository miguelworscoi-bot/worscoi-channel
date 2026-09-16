import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Stripe client
let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

// ============================================================================
// API ROUTES FOR STRIPE INTEGRATION
// ============================================================================

// 1. Check Stripe configuration and public key
app.get('/api/stripe/config', (_req: Request, res: Response) => {
  const publishableKey =
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    '';
  const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY);

  res.json({
    publishableKey,
    hasSecretKey,
    isConfigured: hasSecretKey && Boolean(publishableKey),
    mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
      ? 'test'
      : process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')
      ? 'live'
      : 'demo',
  });
});

// Plan prices in USD/EUR cents for Stripe processing (with fallback calculation from AOA)
const PLAN_PRICES_CENTS: Record<string, { usdCents: number; eurCents: number; aoa: number; durationDays: number }> = {
  free: { usdCents: 0, eurCents: 0, aoa: 0, durationDays: 1 },
  diario: { usdCents: 199, eurCents: 189, aoa: 1500, durationDays: 3 },
  basico: { usdCents: 349, eurCents: 329, aoa: 2500, durationDays: 30 },
  vip: { usdCents: 499, eurCents: 479, aoa: 4000, durationDays: 30 },
  premium: { usdCents: 999, eurCents: 949, aoa: 8500, durationDays: 90 },
  anual: { usdCents: 3499, eurCents: 3299, aoa: 30000, durationDays: 365 },
};

// 2. Create PaymentIntent
app.post('/api/stripe/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const {
      planId,
      planName,
      currency = 'usd',
      userEmail,
      userId,
      userName,
    } = req.body;

    const planConfig = PLAN_PRICES_CENTS[planId] || PLAN_PRICES_CENTS.vip;
    const targetCurrency = (currency || 'usd').toLowerCase();
    const amount = targetCurrency === 'eur' ? planConfig.eurCents : planConfig.usdCents;

    const stripe = getStripe();

    if (!stripe) {
      // Graceful fallback for preview / demo mode if API key not provided in settings
      return res.json({
        success: true,
        isDemoMode: true,
        clientSecret: `demo_secret_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        paymentIntentId: `pi_demo_${Date.now()}`,
        amount,
        currency: targetCurrency,
        planId,
        planName,
        message: 'Modo demonstração ativo (configure STRIPE_SECRET_KEY no .env para modo real).',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: targetCurrency,
      description: `Assinatura PLAYSPORTS Worscoi - ${planName || planId} (${planConfig.durationDays} dias)`,
      receipt_email: userEmail || undefined,
      metadata: {
        planId: String(planId),
        planName: String(planName || planId),
        durationDays: String(planConfig.durationDays),
        userId: String(userId || 'anonymous'),
        userName: String(userName || 'Assinante'),
        app: 'PLAYSPORTS_WORSCOI',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.json({
      success: true,
      isDemoMode: false,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: targetCurrency,
    });
  } catch (err: any) {
    console.error('Error creating Stripe PaymentIntent:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao criar intenção de pagamento no Stripe.',
    });
  }
});

// 3. Create Stripe Checkout Session (for hosted payment checkout)
app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const {
      planId,
      planName,
      currency = 'usd',
      userEmail,
      userId,
      successUrl,
      cancelUrl,
    } = req.body;

    const planConfig = PLAN_PRICES_CENTS[planId] || PLAN_PRICES_CENTS.vip;
    const targetCurrency = (currency || 'usd').toLowerCase();
    const amount = targetCurrency === 'eur' ? planConfig.eurCents : planConfig.usdCents;

    const stripe = getStripe();

    if (!stripe) {
      return res.json({
        success: true,
        isDemoMode: true,
        url: null,
        message: 'Stripe Secret Key não configurada. Use o pagamento via cartão integrado.',
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const origin = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetCurrency,
            product_data: {
              name: `PLAYSPORTS Worscoi - ${planName || planId}`,
              description: `Acesso ilimitado a canais ao vivo e filmes (${planConfig.durationDays} dias)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail || undefined,
      metadata: {
        planId: String(planId),
        planName: String(planName || planId),
        durationDays: String(planConfig.durationDays),
        userId: String(userId || 'anonymous'),
      },
      success_url: successUrl || `${origin}/?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: cancelUrl || `${origin}/?stripe_status=cancelled`,
    });

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('Error creating Stripe Checkout session:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao criar sessão de checkout no Stripe.',
    });
  }
});

// 4. Verify & Confirm Stripe Payment (Generates activation token and updates plan)
app.post('/api/stripe/verify-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, planId, userId, userEmail } = req.body;

    const planConfig = PLAN_PRICES_CENTS[planId] || PLAN_PRICES_CENTS.vip;
    const stripe = getStripe();

    let verified = false;

    if (!stripe || (paymentIntentId && paymentIntentId.startsWith('pi_demo_'))) {
      // Demo mode verification
      verified = true;
    } else if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      verified = pi.status === 'succeeded' || pi.status === 'processing';
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Pagamento não confirmado ou pendente no Stripe.',
      });
    }

    // Generate unique 5-char token for the confirmed payment
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let tokenCode = '';
    for (let i = 0; i < 5; i++) {
      tokenCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const durationDays = planConfig.durationDays || 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    return res.json({
      success: true,
      verified: true,
      tokenCode,
      planId,
      durationDays,
      expiresAt,
      message: 'Pagamento aprovado via Stripe! Assinatura liberada com sucesso.',
    });
  } catch (err: any) {
    console.error('Error verifying Stripe payment:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao verificar pagamento do Stripe.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripeReady: Boolean(process.env.STRIPE_SECRET_KEY),
  });
});

// ============================================================================
// VITE MIDDLEWARE (DEV) & STATIC FILE SERVING (PROD)
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PLAYSPORTS Worscoi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
