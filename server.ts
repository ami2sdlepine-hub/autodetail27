import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzWuWbZNa7ylcJz7jrqMjnRS2PfLPzZO-1ptAoyb3KBR4incAnPCkqsFt_gquSFkOnJVQ/exec';
const APPS_SCRIPT_SECRET =
  process.env.APPS_SCRIPT_SECRET || 'le-herisson-lave-les-jantes-en-77-secondes!';

// Memory caches for orders state (persists across requests during server lifecycle)
const pendingOrders = new Map<string, any>();
const completedOrders = new Map<string, { numero: string; timestamp: number }>();
const failedOrders = new Map<string, { error: string; timestamp: number; payload: any }>();
const inFlightOrders = new Map<string, Promise<{ success: boolean; numero?: string; error?: string; attempts: number }>>();

// Helper for sending order to Google Apps Script with 25s timeout and 3 retries
async function executeServerAppsScriptPush(orderPayload: any): Promise<{ success: boolean; numero?: string; error?: string; attempts: number }> {
  const MAX_ATTEMPTS = 3;
  const TIMEOUT_MS = 25000; // 25s (>= 20s demandées)
  const DELAY_MS = 3000;

  const payload = {
    secret: APPS_SCRIPT_SECRET,
    nom:
      orderPayload.customerName ||
      orderPayload.nom ||
      (orderPayload.customer ? `${orderPayload.customer.firstName || ''} ${orderPayload.customer.lastName || ''}`.trim() : ''),
    tel: orderPayload.customerPhone || orderPayload.tel || orderPayload.customer?.phone || '',
    email: orderPayload.customerEmail || orderPayload.email || orderPayload.customer?.email || '',
    mode: orderPayload.deliveryMode || orderPayload.mode || orderPayload.carrier?.name || 'Retrait Atelier sur RDV (27)',
    adresse:
      orderPayload.shippingAddress ||
      orderPayload.adresse ||
      (orderPayload.customer?.address
        ? `${orderPayload.customer.address}, ${orderPayload.customer.postalCode || ''} ${orderPayload.customer.city || ''}`
        : 'Retrait Atelier (Heubécourt-Haricourt 27)'),
    noteClient:
      orderPayload.noteClient ||
      orderPayload.customer?.relayPointPreference ||
      orderPayload.customer?.pickupDateSlot ||
      '',
    sousTotal: orderPayload.subtotal || orderPayload.sousTotal || 0,
    port: orderPayload.shippingCost !== undefined ? orderPayload.shippingCost : (orderPayload.port !== undefined ? orderPayload.port : 0),
    total: orderPayload.total || 0,
    paiement: orderPayload.paiement || 'en_ligne',
    stripeId: orderPayload.stripeId || undefined,
    items: (orderPayload.items || []).map((it: any) => ({
      ref: it.ref || it.code || it.id || 'PROD',
      nom: it.nom || it.name || 'Produit Bulbee',
      qty: it.qty || it.quantity || 1,
      pu: it.pu !== undefined ? it.pu : (it.price !== undefined ? it.price : 0),
    })),
  };

  let lastError = 'Échec de transmission';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[Server AppsScript] Tentative ${attempt}/${MAX_ATTEMPTS} pour ${payload.nom} (${payload.email})...`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        lastError = `Erreur HTTP ${res.status}`;
      } else {
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          lastError = `Réponse non-JSON: ${text.slice(0, 100)}`;
        }

        if (data && data.success === true && typeof data.numero === 'string' && data.numero.trim() !== '') {
          const numero = data.numero.trim();
          console.log(`[Server AppsScript] SUCCÈS : Commande enregistrée sous le numéro officiel ${numero}`);
          return { success: true, numero, attempts: attempt };
        }

        lastError = data?.error || 'Le script a répondu sans numéro officiel';
      }
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err.name === 'AbortError' ? 'Délai d\'attente dépassé (> 25s)' : (err.message || 'Erreur réseau');
    }

    console.warn(`[Server AppsScript] Tentative ${attempt}/${MAX_ATTEMPTS} échouée : ${lastError}`);

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Échec définitif après 3 tentatives : Journaliser l'alerte d'urgence
  console.error('[CRITIQUE - ALERTE EMAIL AUTO contact@autodetail27.fr] COMMANDE NON TRANSMISE APRÈS 3 TENTATIVES :', JSON.stringify({
    destinataire: 'contact@autodetail27.fr',
    erreur: lastError,
    commande: payload,
    timestamp: new Date().toISOString(),
  }, null, 2));

  return { success: false, error: lastError, attempts: MAX_ATTEMPTS };
}

// 1. Stripe Webhook endpoint
app.get('/api/stripe-webhook', (_req, res) => {
  res.status(405).json({ error: 'Method Not Allowed' });
});

app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    let event: Stripe.Event;
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      try {
        event = JSON.parse(req.body.toString());
      } catch (err: any) {
        return res.status(400).send(`Webhook JSON parse error: ${err.message}`);
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      console.log(`[Stripe Webhook] checkout.session.completed reçu pour la session ${sessionId}`);

      // Vérifier si la commande a déjà été transmise avec succès
      if (!completedOrders.has(sessionId)) {
        const storedOrder = pendingOrders.get(sessionId) || {};
        const pushPayload = {
          ...storedOrder,
          customerEmail: session.customer_details?.email || storedOrder.customerEmail,
          customerName: session.customer_details?.name || storedOrder.customerName,
          stripeId: sessionId,
          paiement: 'en_ligne',
        };

        let pushPromise = inFlightOrders.get(sessionId);
        if (!pushPromise) {
          pushPromise = executeServerAppsScriptPush(pushPayload);
          inFlightOrders.set(sessionId, pushPromise);
        }

        const result = await pushPromise;
        inFlightOrders.delete(sessionId);

        if (result.success && result.numero) {
          completedOrders.set(sessionId, { numero: result.numero, timestamp: Date.now() });
        } else {
          failedOrders.set(sessionId, { error: result.error || 'Échec 3 tentatives', timestamp: Date.now(), payload: pushPayload });
        }
      }
    }

    res.json({ received: true });
  }
);

// All subsequent routes use JSON parser
app.use(express.json());

// Initialize Stripe if key is present in environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    })
  : null;

// API endpoint to get Stripe configuration status (safe, no secret exposed)
app.get('/api/stripe-status', (_req, res) => {
  res.json({
    configured: Boolean(stripeSecretKey),
    mode: stripeSecretKey.includes('_live_') ? 'live' : stripeSecretKey.includes('_test_') ? 'test' : 'none',
  });
});

// API endpoint to create a Stripe Checkout Session with locked amount
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, orderRef, customerEmail, shippingCost, carrierName, originUrl } = req.body;

    if (!stripe) {
      return res.status(200).json({
        needsConfig: true,
        message: 'STRIPE_SECRET_KEY non configuré sur le serveur.',
      });
    }

    const lineItems = (items || []).map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Produit Bulbee AUTODETAIL',
          description: `Réf: ${item.refNumber || item.code || ''}`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    if (shippingCost && Number(shippingCost) > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Frais de livraison (${carrierName || 'Colis suivi'})`,
            description: 'Acheminement sécurisé et soigné par AUTODETAIL',
          },
          unit_amount: Math.round(Number(shippingCost) * 100),
        },
        quantity: 1,
      });
    }

    const host = originUrl || req.headers.origin || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderRef,
      metadata: {
        orderRef: orderRef || '',
        carrier: carrierName || '',
      },
      success_url: `${host}/?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${host}/?payment=cancelled`,
    });

    // Save full order payload in memory so webhook can transmit to Apps Script immediately upon payment completion
    if (req.body.orderPayload) {
      pendingOrders.set(session.id, req.body.orderPayload);
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint called on frontend return (?payment=success&session_id=...)
// Returns the official Apps Script numero (WEB-2026-xxx) or transmits it with 3 retries
app.post('/api/confirm-stripe-order', async (req, res) => {
  try {
    const { sessionId, orderPayload } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID manquant' });
    }

    // 1. Vérifier si le webhook Stripe a déjà finalisé la transmission
    if (completedOrders.has(sessionId)) {
      const completed = completedOrders.get(sessionId)!;
      return res.json({ success: true, numero: completed.numero, stripeId: sessionId });
    }

    // 2. Si un échec définitif a déjà été enregistré par le webhook
    if (failedOrders.has(sessionId)) {
      const failed = failedOrders.get(sessionId)!;
      return res.json({
        success: false,
        error: failed.error,
        stripeId: sessionId,
        customerEmail: failed.payload?.customerEmail || failed.payload?.email || '',
      });
    }

    // 3. Si un appel est déjà en cours (ex: webhook Stripe en cours d'exécution)
    if (inFlightOrders.has(sessionId)) {
      const result = await inFlightOrders.get(sessionId)!;
      if (result.success && result.numero) {
        return res.json({ success: true, numero: result.numero, stripeId: sessionId });
      }
      return res.json({ success: false, error: result.error, stripeId: sessionId });
    }

    // 4. Récupérer les données de la commande
    const payload = orderPayload || pendingOrders.get(sessionId);
    if (!payload) {
      return res.status(200).json({
        success: false,
        error: 'Détails de la commande introuvables pour cette session.',
        stripeId: sessionId,
      });
    }

    const pushPayload = {
      ...payload,
      stripeId: sessionId,
      paiement: 'en_ligne',
    };

    // 5. Lancer la transmission vers Google Apps Script (3 tentatives, 25s timeout)
    const pushPromise = executeServerAppsScriptPush(pushPayload);
    inFlightOrders.set(sessionId, pushPromise);

    const result = await pushPromise;
    inFlightOrders.delete(sessionId);

    if (result.success && result.numero) {
      completedOrders.set(sessionId, { numero: result.numero, timestamp: Date.now() });
      return res.json({ success: true, numero: result.numero, stripeId: sessionId });
    }

    failedOrders.set(sessionId, {
      error: result.error || 'Échec transmission',
      timestamp: Date.now(),
      payload: pushPayload,
    });
    return res.json({
      success: false,
      error: result.error,
      stripeId: sessionId,
      customerEmail: pushPayload.customerEmail || pushPayload.email || '',
    });
  } catch (err: any) {
    console.error('Erreur confirm-stripe-order:', err);
    res.status(500).json({ success: false, error: err.message, stripeId: req.body?.sessionId });
  }
});

// Endpoint de soumission directe pour réservations sur place et commandes boutique
// Exécute la transmission côté serveur avec 3 tentatives espacées de 3s et timeout 25s
app.post('/api/submit-order', async (req, res) => {
  try {
    const { orderPayload } = req.body;
    if (!orderPayload) {
      return res.status(400).json({ success: false, error: 'Données de commande manquantes' });
    }

    const result = await executeServerAppsScriptPush(orderPayload);
    res.json(result);
  } catch (err: any) {
    console.error('Erreur submit-order:', err);
    res.status(500).json({ success: false, error: err.message, attempts: 3 });
  }
});

// Endpoint pour déclencher et journaliser l'alerte d'urgence en cas d'échec
app.post('/api/send-transmission-alert', (req, res) => {
  const alertData = req.body;
  console.error('[ALERTE CRITIQUE - ÉCHEC TRANSMISSION COMMANDE]', JSON.stringify(alertData, null, 2));
  res.json({ acknowledged: true });
});

// Serve frontend: dist in production, Vite middleware in development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
