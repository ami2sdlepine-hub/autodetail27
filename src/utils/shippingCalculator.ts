import { Product } from '../data/products';

export type CarrierType = 'mondial_relay' | 'colissimo' | 'pickup';

export interface ShippingOption {
  id: CarrierType;
  name: string;
  subtitle: string;
  delay: string;
  price: number;
  isFree: boolean;
}

// Estimate weight per product in kg
export function getProductWeightKg(product: Product): number {
  const id = product.id.toUpperCase();
  const vol = (product.volume || '').toLowerCase();

  if (id === 'SB' || id.includes('KIT')) return 2.85; // Sacoche complete pack
  if (id === 'SBN' || id.includes('SACOCHE')) return 0.45; // Sacoche nue
  if (id.startsWith('PACK') || id.includes('PACK') || id.includes('ROUTINE')) {
    if (vol.includes('4')) return 2.45;
    if (vol.includes('3')) return 1.95;
    return 2.2;
  }
  if (vol.includes('150') || id.includes('FRESH') || id === 'TS150') return 0.25; // 150ml spray
  if (vol.includes('500') || vol.includes('500ml')) return 0.65; // 500ml flacon + bouchon/spray
  if (vol.includes('1l') || vol.includes('1000')) return 1.15;

  return 0.6; // Default
}

// Compute total parcel weight with packaging box & protective cushioning (0.15 kg base)
export function calculateParcelWeightKg(cart: { [productId: string]: number }, catalog: Product[]): number {
  let productWeight = 0;
  const catalogMap = new Map(catalog.map((p) => [p.id, p]));

  Object.entries(cart).forEach(([id, qty]) => {
    if (qty > 0) {
      const prod = catalogMap.get(id);
      if (prod) {
        productWeight += getProductWeightKg(prod) * qty;
      }
    }
  });

  if (productWeight === 0) return 0;
  return Math.round((productWeight + 0.15) * 100) / 100; // Adding packing material
}

// Compute rates based on weight brackets
export function calculateCarrierRates(
  weightKg: number,
  subtotal: number,
  freeShippingThreshold: number = 100.0
): ShippingOption[] {
  const isFree = subtotal >= freeShippingThreshold;

  // 1. Mondial Relay weight brackets
  let mrPrice = 4.40;
  if (weightKg > 3.0) mrPrice = 8.90;
  else if (weightKg > 2.0) mrPrice = 7.50;
  else if (weightKg > 1.0) mrPrice = 6.50;
  else if (weightKg > 0.5) mrPrice = 4.95;
  else mrPrice = 4.40;

  // 2. Colissimo Domicile 48h weight brackets
  let colissimoPrice = 5.95;
  if (weightKg > 3.0) colissimoPrice = 14.50;
  else if (weightKg > 2.0) colissimoPrice = 11.95;
  else if (weightKg > 1.0) colissimoPrice = 9.95;
  else if (weightKg > 0.5) colissimoPrice = 7.95;
  else colissimoPrice = 5.95;

  return [
    {
      id: 'mondial_relay',
      name: 'Mondial Relay',
      subtitle: 'En Point Relais ou Locker sécurisé',
      delay: '3 à 4 jours ouvrés',
      price: isFree ? 0 : mrPrice,
      isFree,
    },
    {
      id: 'colissimo',
      name: 'Colissimo La Poste',
      subtitle: 'Livraison suivie à domicile sans signature',
      delay: '48 h partout en France',
      price: isFree ? 0 : colissimoPrice,
      isFree,
    },
    {
      id: 'pickup',
      name: 'Retrait Atelier sur RDV',
      subtitle: '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt',
      delay: 'Disponible sous 24 h',
      price: 0,
      isFree: true,
    },
  ];
}
