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

app.use(express.json());

// Initialize Stripe if key is present in environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// API endpoint to get Stripe configuration status (safe, no secret exposed)
app.get('/api/stripe-status', (_req, res) => {
  res.json({
    configured: Boolean(stripeSecretKey && stripeSecretKey.startsWith('sk_')),
    mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : stripeSecretKey.startsWith('sk_test_') ? 'test' : 'none',
  });
});

// API endpoint to create a Stripe Checkout Session with locked amount
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, orderRef, customerEmail, shippingCost, carrierName, originUrl } = req.body;

    if (!stripe) {
      return res.status(200).json({
        needsConfig: true,
        message: 'Stripe secret key not configured yet.',
      });
    }

    const lineItems = (items || []).map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
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
            name: `Frais de livraison (${carrierName || 'Transporteur'})`,
            description: 'Livraison sécurisée avec suivi',
          },
          unit_amount: Math.round(Number(shippingCost) * 100),
        },
        quantity: 1,
      });
    }

    const host = originUrl || req.headers.origin || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderRef,
      metadata: {
        orderRef,
      },
      success_url: `${host}/?session_id={CHECKOUT_SESSION_ID}&order_ref=${orderRef}&payment=success`,
      cancel_url: `${host}/?order_ref=${orderRef}&payment=cancelled`,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({ error: error.message });
  }
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
