export interface TrilogyStep {
  id: string; // Product id
  num: string; // '01', '02', '03'
  title: string;
  tag: string;
  color: string;
  desc: string;
}

export interface TrilogyConfig {
  sectionTag: string;
  sectionTitle: string;
  sectionDesc: string;
  steps: TrilogyStep[];
  bundleTitle: string;
  bundleDesc: string;
  bundleTag: string;
  customPrice?: number;
  discountPercent?: number;
}

export const DEFAULT_TRILOGY_CONFIG: TrilogyConfig = {
  sectionTag: 'Protocole de correction complet',
  sectionTitle: 'La Trilogie Cut, Correct, Wax',
  sectionDesc: 'Le processus en 3 étapes adopté par les ateliers de lustrage professionnel pour éliminer les défauts et sceller un éclat showroom pérenne.',
  steps: [
    {
      id: 'CUT500',
      num: '01',
      title: 'Cut — Correction Lourde',
      tag: 'Étape 1',
      color: '#ef4444',
      desc: 'Compound dégressif haute intensité. Élimine les rayures franches, tourbillons sévères et oxydation P1500.',
    },
    {
      id: 'CORRECT500',
      num: '02',
      title: 'Correct — Finition & Brillant',
      tag: 'Étape 2',
      color: '#f59e0b',
      desc: 'Polish moyen ultra-fin. Supprime les hologrammes, affine le vernis pour une clarté miroir absolue sans défaut.',
    },
    {
      id: 'WAX500',
      num: '03',
      title: 'Wax — Protection Hybride',
      tag: 'Étape 3',
      color: '#10b981',
      desc: 'Cire liquide hybride Carnauba + polymères synthétiques. Bloque les UV et les agressions extérieures pendant 6 mois.',
    },
  ],
  bundleTag: 'Offre Rénovation Complète Vernis',
  bundleTitle: 'La Trilogie Complète (3 flacons 500 ml)',
  bundleDesc: 'Cut + Correct + Wax : Le trio indispensable pour corriger et protéger votre carrosserie.',
  discountPercent: 0,
};
