import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeServerAppsScriptPush } from './_shared.js';

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { sessionId, orderPayload } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Identifiant de session Stripe manquant' });
    }

    if (!orderPayload) {
      return res.status(200).json({
        success: false,
        error: 'Données de commande introuvables pour cette session.',
        stripeId: sessionId,
      });
    }

    const pushPayload = {
      ...orderPayload,
      stripeId: sessionId,
      paiement: 'en_ligne',
    };

    // Exécution avec délai d'attente 25s et 3 tentatives espacées de 3s
    const result = await executeServerAppsScriptPush(pushPayload);

    if (result.success && result.numero) {
      return res.status(200).json({
        success: true,
        numero: result.numero,
        stripeId: sessionId,
        attempts: result.attempts,
      });
    }

    return res.status(200).json({
      success: false,
      error: result.error || 'Échec de transmission après 3 tentatives',
      stripeId: sessionId,
      customerEmail: pushPayload.customerEmail || pushPayload.email || '',
      attempts: result.attempts,
    });
  } catch (err: any) {
    console.error('[confirm-stripe-order] Erreur inattendue:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erreur serveur',
      stripeId: req.body?.sessionId,
    });
  }
}
