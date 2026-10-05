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

export const DEFAULT_APPS_SCRIPT_SECRET = 'le-herisson-lave-les-jantes-en-77-secondes';

export function getAppsScriptUrl(): string {
  try {
    return localStorage.getItem('autodetail_appscript_url') || DEFAULT_APPS_SCRIPT_URL;
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
    return localStorage.getItem('autodetail_appscript_secret') || DEFAULT_APPS_SCRIPT_SECRET;
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

/**
 * Envoie une commande validée dans Google Sheets (onglet CommandesWeb de LP SYSTEME)
 */
export async function pushOrderToAppsScript(orderData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMode: string;
  shippingAddress: string;
  noteClient?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: Array<{
    code: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}): Promise<{ success: boolean; numero?: string }> {
  const url = getAppsScriptUrl();
  const secret = getAppsScriptSecret();
  if (!url) return { success: false };

  const payload = {
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
    items: orderData.items.map((it) => ({
      ref: it.code,
      nom: it.name,
      qty: it.quantity,
      pu: it.price,
    })),
  };

  try {
    // We send payload as text/plain to avoid CORS preflight options blocking
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      return result;
    }
    return { success: true };
  } catch (err) {
    // If browser CORS triggers an opaque result, fallback to no-cors beacon
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch {
      console.warn('Apps Script order push failed:', err);
      return { success: false };
    }
  }
}
