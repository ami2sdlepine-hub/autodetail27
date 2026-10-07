import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { stripeSecretKey } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!stripeSecretKey) {
    return res.status(200).json({
      needsConfig: true,
      message: 'STRIPE_SECRET_KEY non configuré dans les variables d\'environnement Vercel.',
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any,
  });

  try {
    const { items, customerEmail, shippingCost, carrierName, originUrl, orderPayload } = req.body || {};

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

    const host = originUrl || (req.headers?.origin as string) || 'https://www.autodetail27.fr';

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      metadata: {
        carrier: carrierName || '',
        customerName: orderPayload?.customerName || '',
      },
      success_url: `${host}/?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${host}/?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
