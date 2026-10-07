import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeServerAppsScriptPush } from './_shared';

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
    const { orderPayload } = req.body || {};
    if (!orderPayload) {
      return res.status(400).json({ success: false, error: 'Données de commande manquantes' });
    }

    const result = await executeServerAppsScriptPush(orderPayload);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Erreur submit-order:', err);
    return res.status(500).json({ success: false, error: err.message, attempts: 3 });
  }
}
