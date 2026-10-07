import Stripe from 'stripe';

export const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzWuWbZNa7ylcJz7jrqMjnRS2PfLPzZO-1ptAoyb3KBR4incAnPCkqsFt_gquSFkOnJVQ/exec';

export const APPS_SCRIPT_SECRET =
  process.env.APPS_SCRIPT_SECRET || 'le-herisson-lave-les-jantes-en-77-secondes!';

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    })
  : null;

// Execution helper for Google Apps Script with 25s timeout and 3 retries
export async function executeServerAppsScriptPush(orderPayload: any): Promise<{
  success: boolean;
  numero?: string;
  error?: string;
  attempts: number;
}> {
  const MAX_ATTEMPTS = 3;
  const TIMEOUT_MS = 25000; // >= 20s demandées
  const DELAY_MS = 3000;

  const payload = {
    secret: APPS_SCRIPT_SECRET,
    nom:
      orderPayload.customerName ||
      orderPayload.nom ||
      (orderPayload.customer
        ? `${orderPayload.customer.firstName || ''} ${orderPayload.customer.lastName || ''}`.trim()
        : ''),
    tel: orderPayload.customerPhone || orderPayload.tel || orderPayload.customer?.phone || '',
    email: orderPayload.customerEmail || orderPayload.email || orderPayload.customer?.email || '',
    mode:
      orderPayload.deliveryMode ||
      orderPayload.mode ||
      orderPayload.carrier?.name ||
      'Retrait Atelier sur RDV (27)',
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
    port:
      orderPayload.shippingCost !== undefined
        ? orderPayload.shippingCost
        : (orderPayload.port !== undefined ? orderPayload.port : 0),
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
    console.log(`[AppsScript Serverless] Tentative ${attempt}/${MAX_ATTEMPTS} pour ${payload.nom} (${payload.email})...`);
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
          console.log(`[AppsScript Serverless] SUCCÈS : Commande enregistrée sous le numéro officiel ${numero}`);
          return { success: true, numero, attempts: attempt };
        }

        lastError = data?.error || 'Le script a répondu sans numéro officiel';
      }
    } catch (err: any) {
      clearTimeout(timer);
      lastError =
        err.name === 'AbortError'
          ? 'Délai d\'attente dépassé (> 25s)'
          : (err.message || 'Erreur réseau');
    }

    console.warn(`[AppsScript Serverless] Tentative ${attempt}/${MAX_ATTEMPTS} échouée : ${lastError}`);

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
