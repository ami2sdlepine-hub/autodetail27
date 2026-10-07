import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripeSecretKey } from './_shared.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    configured: Boolean(stripeSecretKey && stripeSecretKey.startsWith('sk_')),
    mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : stripeSecretKey.startsWith('sk_test_') ? 'test' : 'none',
  });
}
