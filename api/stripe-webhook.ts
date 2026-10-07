import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { stripe, stripeWebhookSecret, executeServerAppsScriptPush } from './_shared';

// Désactiver le body parser automatique de Vercel pour lire le buffer brut requis par Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 60; // 60 secondes pour les 3 tentatives Google Apps Script

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    if (stripe && stripeWebhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig as string, stripeWebhookSecret);
    } else {
      // Fallback si signature non configurée en mode test
      event = JSON.parse(rawBody.toString('utf-8'));
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Erreur de vérification signature:', err.message);
    return res.status(400).send(`Webhook signature error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    console.log(`[Stripe Webhook] checkout.session.completed pour la session ${sessionId}`);

    try {
      // Reconstituer les informations de commande depuis la session Stripe
      let items: any[] = [];
      if (stripe) {
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 50 });
          items = (lineItems.data || []).map((li) => ({
            ref: li.description || 'PROD',
            nom: li.description || 'Produit Bulbee',
            qty: li.quantity || 1,
            pu: (li.price?.unit_amount || 0) / 100,
          }));
        } catch (liErr) {
          console.warn('[Stripe Webhook] Erreur lecture line_items Stripe:', liErr);
        }
      }

      const pushPayload = {
        nom: session.customer_details?.name || 'Client AUTODETAIL',
        email: session.customer_details?.email || session.customer_email || '',
        tel: session.customer_details?.phone || '',
        mode: (session.metadata?.carrier as string) || 'Colissimo Domicile 48h',
        adresse: session.customer_details?.address
          ? `${session.customer_details.address.line1 || ''} ${session.customer_details.address.line2 || ''}, ${session.customer_details.address.postal_code || ''} ${session.customer_details.address.city || ''}`.trim()
          : 'Adresse confirmée sur Stripe',
        noteClient: '',
        sousTotal: (session.amount_subtotal || session.amount_total || 0) / 100,
        port: 0,
        total: (session.amount_total || 0) / 100,
        paiement: 'en_ligne',
        stripeId: sessionId,
        items,
      };

      const result = await executeServerAppsScriptPush(pushPayload);
      if (result.success && result.numero) {
        console.log(`[Stripe Webhook] Commande enregistrée avec succès sous le numéro ${result.numero}`);
      } else {
        console.error(`[Stripe Webhook] Échec transmission commande pour session ${sessionId} : ${result.error}`);
      }
    } catch (orderErr) {
      console.error('[Stripe Webhook] Erreur lors du traitement de la commande:', orderErr);
    }
  }

  return res.status(200).json({ received: true });
}
