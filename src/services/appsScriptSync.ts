/**
 * Service de synchronisation en temps réel avec Google Sheets via Google Apps Script
 * - Lecture du stock (doGet)
 * - Écriture des commandes en précommandes PrecosAD & journal Commandes_Web (doPost)
 */

export interface StockSyncResult {
  success: boolean;
  message: string;
  stocks?: { [productCodeOrId: string]: number };
}

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyS57OiPkq4vu2Sl5x-vgEL1d8aAB6CF6pG0kJ-YdQNBLPQ1x-NKetSGVnCHPFxLFxf/exec';

export const DEFAULT_APPS_SCRIPT_SECRET = 'CHANGE-MOI-lp-autodetail-2026';

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
 * Récupère les stocks en direct depuis Google Sheets
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

    if (data && data.stocks && typeof data.stocks === 'object') {
      Object.entries(data.stocks).forEach(([k, v]) => {
        stocksMap[k.toUpperCase()] = Number(v);
      });
    } else if (Array.isArray(data)) {
      data.forEach((item: any) => {
        const key = item.id || item.code || item.ref || item.refNumber;
        const count = item.stock ?? item.quantity ?? item.stockCount;
        if (key && count !== undefined) {
          stocksMap[String(key).toUpperCase()] = Number(count);
        }
      });
    }

    return {
      success: true,
      message: `${Object.keys(stocksMap).length} références de stock récupérées depuis LP SYSTEME !`,
      stocks: stocksMap,
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
 * Envoie une commande validée dans Google Sheets (PrecosAD + Commandes_Web)
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
