import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey && stripeSecretKey.startsWith('sk_') ? new Stripe(stripeSecretKey) : null;

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!stripe) {
    return res.status(200).json({
      needsConfig: true,
      message: 'Stripe secret key not configured yet on Vercel environment variables.',
    });
  }

  try {
    const { items, orderRef, customerEmail, shippingCost, carrierName, originUrl } = req.body || {};

    const lineItems = (items || []).map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Produit AUTODETAIL',
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

    const host = originUrl || req.headers?.origin || 'https://www.autodetail27.fr';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderRef,
      metadata: {
        orderRef: orderRef || '',
      },
      success_url: `${host}/?session_id={CHECKOUT_SESSION_ID}&order_ref=${orderRef}&payment=success`,
      cancel_url: `${host}/?order_ref=${orderRef}&payment=cancelled`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
