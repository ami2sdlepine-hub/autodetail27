export interface DetailingPack {
  id: string;
  title: string;
  desc: string;
  tag: string;
  color?: string;
  productIds: string[]; // Products included in this pack
  discountPercent?: number; // Discount % applied if computed from items
  customPrice?: number; // Fixed custom price for pack
  badge?: string;
  isHidden?: boolean;
}

export const INITIAL_PACKS: DetailingPack[] = [
  {
    id: 'pack-interieur',
    title: 'Pack Habitacle Parfait',
    desc: 'Dégraissage en profondeur des plastiques et tissus + protection satinée anti-UV + parfum vivifiant.',
    tag: 'Intérieur Showroom',
    color: '#3ee6d8',
    productIds: ['MC500', 'EP500', 'SF150'],
    discountPercent: 10,
    badge: 'Pack Économique',
    isHidden: false,
  },
  {
    id: 'pack-lavage',
    title: 'Pack Lavage & Finition Miroir',
    desc: 'Prélavage décontaminant jantes + shampoing céramique SiO2 + quick detailer lustrant express.',
    tag: 'Extérieur & Carrosserie',
    color: '#7b61ff',
    productIds: ['WR500', 'HW500', 'IS500'],
    discountPercent: 12,
    badge: 'Best-Seller',
    isHidden: false,
  },
  {
    id: 'pack-jantes',
    title: 'Duo Rénovation Jantes & Pneus',
    desc: 'Décontamination ferreuse réactive des jantes + dressing nourrissant noir mat anti-craquelure pour pneus.',
    tag: 'Jantes & Gommes',
    color: '#3ee6d8',
    productIds: ['WR500', 'PC500'],
    discountPercent: 10,
    badge: 'Duo Essentiel',
    isHidden: false,
  },
];
