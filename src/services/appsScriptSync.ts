/**
 * Service de transmission des commandes et de synchronisation des stocks.
 * SÉCURITÉ :
 * - Aucun appel direct du navigateur vers Google Apps Script avec le secret.
 * - Le navigateur appelle EXCLUSIVEMENT les fonctions d'API du serveur (/api/submit-order, /api/create-checkout-session, /api/confirm-stripe-order).
 * - Le secret Google Apps Script est stocké et utilisé UNIQUEMENT côté serveur via APPS_SCRIPT_SECRET.
 */

export interface StockSyncResult {
  success: boolean;
  message: string;
  stocks?: { [productCodeOrId: string]: number };
  arrivages?: { [productCodeOrId: string]: number };
  couts?: { [productCodeOrId: string]: number };
}

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzWuWbZNa7ylcJz7jrqMjnRS2PfLPzZO-1ptAoyb3KBR4incAnPCkqsFt_gquSFkOnJVQ/exec';

/**
 * Récupère l'URL publique de lecture des stocks (doGet en lecture seule, ne nécessite aucun secret)
 */
export function getAppsScriptUrl(): string {
  try {
    const stored = localStorage.getItem('autodetail_appscript_url');
    if (!stored || stored.includes('AKfycby') || stored.includes('404') || stored.trim() === '') {
      return DEFAULT_APPS_SCRIPT_URL;
    }
    return stored;
  } catch {
    return DEFAULT_APPS_SCRIPT_URL;
  }
}

export function setAppsScriptUrl(url: string): void {
  try {
    localStorage.setItem('autodetail_appscript_url', url.trim());
  } catch (e) {
    console.error('Error saving appscript url:', e);
  }
}

/**
 * Récupère les stocks et les arrivages en direct depuis Google Sheets (doGet en lecture seule publique)
 */
export async function fetchStockFromAppsScript(customUrl?: string): Promise<StockSyncResult> {
  const url = customUrl || getAppsScriptUrl();
  if (!url) {
    return { success: false, message: 'URL Google Apps Script non configurée.' };
  }

  try {
    const separator = url.includes('?') ? '&' : '?';
    const fetchUrl = `${url}${separator}t=${Date.now()}`;

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message:
          'Autorisation requise (Erreur 401) : Dans votre projet Apps Script, vérifiez que "Qui a accès" est bien réglé sur "Tout le monde" (Anyone).',
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: `Erreur serveur HTTP ${res.status}. Vérifiez votre déploiement Apps Script.`,
      };
    }

    const data = await res.json();

    const stocksMap: { [key: string]: number } = {};
    const arrivagesMap: { [key: string]: number } = {};

    // Stock map
    if (data && data.stocks && typeof data.stocks === 'object') {
      Object.entries(data.stocks).forEach(([k, v]) => {
        stocksMap[k.toUpperCase()] = Math.max(0, Number(v) || 0);
      });
    } else if (Array.isArray(data)) {
      data.forEach((item: any) => {
        const key = item.id || item.code || item.ref || item.refNumber;
        const count = item.stock ?? item.quantity ?? item.stockCount;
        if (key && count !== undefined) {
          stocksMap[String(key).toUpperCase()] = Math.max(0, Number(count) || 0);
        }
      });
    }

    // Arrivages map (commandes fournisseur en cours)
    if (data && data.arrivages && typeof data.arrivages === 'object') {
      Object.entries(data.arrivages).forEach(([k, v]) => {
        arrivagesMap[k.toUpperCase()] = Math.max(0, Number(v) || 0);
      });
    }

    // Cost prices map from sheet (prix d'achat)
    const coutsMap: { [key: string]: number } = {};
    const rawCouts = data.couts || data.costs || data.prixAchat || data.costPrices;
    if (rawCouts && typeof rawCouts === 'object') {
      Object.entries(rawCouts).forEach(([k, v]) => {
        coutsMap[k.toUpperCase()] = Math.max(0, Number(v) || 0);
      });
    }

    const nbRefs = Object.keys(stocksMap).length;
    const nbArrivages = Object.keys(arrivagesMap).filter((k) => arrivagesMap[k] > 0).length;

    return {
      success: true,
      message: `${nbRefs} références de stock récupérées depuis LP SYSTEME${
        nbArrivages > 0 ? ` (dont ${nbArrivages} en réassort fournisseur)` : ''
      } !`,
      stocks: stocksMap,
      arrivages: arrivagesMap,
      couts: Object.keys(coutsMap).length > 0 ? coutsMap : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      message:
        'Impossible de joindre le script. Vérifiez que "Qui a accès" est configuré sur "Tout le monde" dans Google Apps Script.',
    };
  }
}

export interface OrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMode: string;
  shippingAddress: string;
  noteClient?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paiement?: 'en_ligne' | 'sur_place';
  stripeId?: string;
  items: Array<{
    code: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderPushResult {
  success: boolean;
  numero?: string;
  error?: string;
  attempts?: number;
  stripeId?: string;
  rawPayload?: any;
}

/**
 * Déclenche une alerte par email et sur le serveur contenant le JSON de la commande
 * en cas d'échec de la transmission.
 */
export async function triggerTransmissionFailureAlert(
  orderData: OrderPayload,
  errorMessage: string,
  stripeId?: string
): Promise<void> {
  const alertData = {
    type: 'TRANSMISSION_FAILED_AFTER_RETRIES',
    timestamp: new Date().toISOString(),
    recipient: 'contact@autodetail27.fr',
    error: errorMessage,
    stripeId: stripeId || orderData.stripeId || null,
    order: orderData,
  };

  console.error('[CRITIQUE - ALERTE TRANSMISSION ÉCHOUÉE]', alertData);

  // 1. Sauvegarde locale de sécurité
  try {
    const existing = JSON.parse(localStorage.getItem('autodetail_failed_orders') || '[]');
    existing.push(alertData);
    localStorage.setItem('autodetail_failed_orders', JSON.stringify(existing.slice(-20)));
  } catch {}

  // 2. Notification serveur pour journalisation
  try {
    await fetch('/api/send-transmission-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
  } catch (err) {
    console.warn('[ALERTE] Échec de transmission au serveur d\'alerte:', err);
  }
}

/**
 * Envoie une commande EXCLUSIVEMENT via la route serveur sécurisée /api/submit-order.
 * Le client navigateur n'effectue AUCUN appel direct vers Apps Script.
 * Le serveur Vercel injecte le jeton secret APPS_SCRIPT_SECRET de manière sécurisée.
 */
export async function pushOrderToAppsScript(orderData: OrderPayload): Promise<OrderPushResult> {
  const payload: Record<string, any> = {
    nom: orderData.customerName,
    tel: orderData.customerPhone,
    email: orderData.customerEmail,
    mode: orderData.deliveryMode,
    adresse: orderData.shippingAddress,
    noteClient: orderData.noteClient || '',
    sousTotal: orderData.subtotal,
    port: orderData.shippingCost,
    total: orderData.total,
    paiement: orderData.paiement || 'en_ligne',
    items: orderData.items.map((it) => ({
      ref: it.code,
      nom: it.name,
      qty: it.quantity,
      pu: it.price,
    })),
  };

  if (orderData.stripeId) {
    payload.stripeId = orderData.stripeId;
  }

  try {
    const res = await fetch('/api/submit-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderPayload: payload }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success === true && typeof data.numero === 'string' && data.numero.trim() !== '') {
        return {
          success: true,
          numero: data.numero.trim(),
          stripeId: orderData.stripeId,
          attempts: data.attempts || 1,
        };
      }
      const errMsg = data?.error || 'Le serveur n\'a pas validé de numéro de commande officiel.';
      await triggerTransmissionFailureAlert(orderData, errMsg, orderData.stripeId);
      return { success: false, error: errMsg, attempts: data?.attempts || 1 };
    }

    const errorText = await res.text();
    const errMsg = `Erreur serveur HTTP ${res.status}: ${errorText.slice(0, 150)}`;
    await triggerTransmissionFailureAlert(orderData, errMsg, orderData.stripeId);
    return { success: false, error: errMsg, attempts: 1 };
  } catch (err: any) {
    const errMsg = err.message || 'Erreur réseau de communication avec le serveur.';
    await triggerTransmissionFailureAlert(orderData, errMsg, orderData.stripeId);
    return { success: false, error: errMsg, attempts: 1 };
  }
}
