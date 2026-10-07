/**
 * Service de synchronisation en temps réel avec Google Sheets via Google Apps Script
 * - Lecture du stock et des arrivages (doGet)
 * - Écriture des commandes dans l'onglet CommandesWeb de LP SYSTEME (doPost)
 * - Vérification du jeton secret de sécurité anti-spam
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

export const DEFAULT_APPS_SCRIPT_SECRET = 'le-herisson-lave-les-jantes-en-77-secondes!';

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

export function getAppsScriptSecret(): string {
  try {
    const stored = localStorage.getItem('autodetail_appscript_secret');
    if (!stored || stored.includes('8zt') || stored.includes('CHANGE-MOI') || stored.trim() === '') {
      return DEFAULT_APPS_SCRIPT_SECRET;
    }
    return stored;
  } catch {
    return DEFAULT_APPS_SCRIPT_SECRET;
  }
}

export function setAppsScriptSecret(secret: string): void {
  try {
    localStorage.setItem('autodetail_appscript_secret', secret.trim());
  } catch (e) {
    console.error('Error saving appscript secret:', e);
  }
}

/**
 * Teste la validité du jeton secret auprès du script Google Apps Script (doPost)
 */
export async function verifyAppsScriptSecret(
  secret: string,
  customUrl?: string
): Promise<{ valid: boolean; message: string }> {
  const url = customUrl || getAppsScriptUrl();
  if (!url) {
    return { valid: false, message: 'URL Google Apps Script non configurée.' };
  }
  if (!secret || !secret.trim()) {
    return { valid: false, message: 'Veuillez saisir un jeton secret.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        secret: secret.trim(),
        testPing: true,
      }),
    });

    if (!res.ok) {
      return {
        valid: false,
        message: `Erreur serveur HTTP ${res.status}. Vérifiez le déploiement de votre script.`,
      };
    }

    const data = await res.json();
    if (data && data.error === 'non autorisé') {
      return {
        valid: false,
        message: 'Jeton secret refusé par le script (erreur: non autorisé). Vérifiez le SECRET configuré dans votre script Google Apps Script.',
      };
    }

    // Le script a répondu et le secret a été accepté (ex: 'commande incomplète' car test de ping)
    return {
      valid: true,
      message: 'Jeton secret validé avec succès par Google Apps Script !',
    };
  } catch (err: any) {
    return {
      valid: false,
      message:
        'Impossible de joindre le script en POST. Vérifiez que "Qui a accès" est configuré sur "Tout le monde" dans Google Apps Script.',
    };
  }
}

/**
 * Récupère les stocks et les arrivages en direct depuis Google Sheets (doGet)
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

    // Optional cost prices map from sheet (prix d'achat)
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
 * Déclenche une alerte par email et sur le serveur contenant le JSON complet de la commande
 * en cas d'échec définitif des 3 tentatives de transmission vers Google Apps Script.
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

  // 2. Notification serveur pour journalisation et transmission
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
 * Effectue un appel unique vers l'URL Google Apps Script avec un délai d'attente d'au moins 20s (ici 25s).
 */
async function executeSinglePush(
  url: string,
  payload: any,
  timeoutMs: number = 25000
): Promise<{ success: boolean; numero?: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, error: `Erreur HTTP ${res.status}` };
    }

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `Réponse non-JSON du script: ${text.slice(0, 120)}` };
    }

    if (data && data.success === true && typeof data.numero === 'string' && data.numero.trim() !== '') {
      return { success: true, numero: data.numero.trim() };
    }

    return {
      success: false,
      error: data?.error || 'Le script a répondu sans confirmer de numéro de commande officiel.',
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { success: false, error: 'Délai d\'attente dépassé (> 25 secondes sans réponse du script Google).' };
    }
    return { success: false, error: err.message || 'Erreur réseau de communication.' };
  }
}

/**
 * Envoie une commande vers Google Sheets (onglet CommandesWeb de LP SYSTEME)
 * - Délai d'attente d'au moins 20 secondes par tentative (25s)
 * - 3 tentatives espacées de 3 secondes en cas d'échec ou d'absence de numéro officiel
 * - Ne renvoie JAMAIS de faux succès si le numéro n'a pas été attribué
 * - Inclut le champ stripeId pour rapprocher commande et paiement
 */
export async function pushOrderToAppsScript(
  orderData: OrderPayload,
  customUrl?: string,
  customSecret?: string
): Promise<OrderPushResult> {
  const url = customUrl || getAppsScriptUrl();
  const secret = customSecret || getAppsScriptSecret();

  if (!url) {
    const err = 'URL Google Apps Script non configurée.';
    await triggerTransmissionFailureAlert(orderData, err, orderData.stripeId);
    return { success: false, error: err };
  }

  const payload: Record<string, any> = {
    secret,
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

  // 1. Tenter d'abord via le proxy backend serveur s'il est disponible (évite tout problème CORS navigateur)
  try {
    const proxyRes = await fetch('/api/submit-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderPayload: payload }),
    });

    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData && proxyData.success === true && typeof proxyData.numero === 'string') {
        return {
          success: true,
          numero: proxyData.numero,
          stripeId: orderData.stripeId,
          attempts: proxyData.attempts || 1,
        };
      }
    }
  } catch (proxyErr) {
    console.warn('[AppsScript] Proxy serveur non sollicitable, exécution directe client:', proxyErr);
  }

  // 2. Boucle de transmission directe robuste : 3 tentatives espacées de 3 secondes
  const MAX_ATTEMPTS = 3;
  const TIMEOUT_MS = 25000; // 25 secondes (> 20s demandées)
  const DELAY_MS = 3000;    // 3 secondes d'espacement

  let lastError = 'Échec de transmission';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[AppsScript] Transmission tentative ${attempt}/${MAX_ATTEMPTS}...`);
    const res = await executeSinglePush(url, payload, TIMEOUT_MS);

    if (res.success && res.numero) {
      console.log(`[AppsScript] Succès : Commande enregistrée sous le numéro ${res.numero} (tentative ${attempt})`);
      return {
        success: true,
        numero: res.numero,
        attempts: attempt,
        stripeId: orderData.stripeId,
      };
    }

    lastError = res.error || 'Aucune réponse du script Google';
    console.warn(`[AppsScript] Tentative ${attempt}/${MAX_ATTEMPTS} échouée : ${lastError}`);

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // 3. Si les 3 tentatives échouent : déclenchement de l'alerte d'urgence
  console.error(`[AppsScript] ÉCHEC DÉFINITIF après ${MAX_ATTEMPTS} tentatives.`);
  await triggerTransmissionFailureAlert(orderData, lastError, orderData.stripeId);

  return {
    success: false,
    error: lastError,
    attempts: MAX_ATTEMPTS,
    stripeId: orderData.stripeId,
    rawPayload: payload,
  };
}
