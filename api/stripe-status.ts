export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  res.status(200).json({
    configured: Boolean(stripeSecretKey && stripeSecretKey.startsWith('sk_')),
    mode: stripeSecretKey.startsWith('sk_live_') ? 'live' : stripeSecretKey.startsWith('sk_test_') ? 'test' : 'none',
  });
}
