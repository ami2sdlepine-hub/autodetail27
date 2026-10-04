export interface TrilogyStep {
  id: string; // Product id
  num: string; // '01', '02', '03'
  title: string;
  tag: string;
  color: string;
  desc: string;
  image?: string;
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
      title: 'Polish abrasif Cut — Étape 1',
      tag: 'Correction Lourde',
      color: '#ef4444',
      desc: 'Polish abrasif fort n°103. Élimine les rayures franches, l\'oxydation marquée et prépare la surface avant la finition.',
    },
    {
      id: 'CORRECT500',
      num: '02',
      title: 'Polish Correct — Étape 2',
      tag: 'Anti-Hologrammes',
      color: '#f59e0b',
      desc: 'Polish anti-hologrammes n°104. Supprime les voiles de lustrage et affine le vernis pour une clarté miroir absolue sans reflet.',
    },
    {
      id: 'WAX500',
      num: '03',
      title: 'Cire de finition Wax — Étape 3',
      tag: 'Finition Brillante',
      color: '#10b981',
      desc: 'Cire de finition brillante n°105. Scelle l\'éclat showroom, dépose un bouclier hydrophobe et protège durablement le vernis.',
    },
  ],
  bundleTag: 'Offre Rénovation Complète Vernis',
  bundleTitle: 'La Trilogie Complète (3 flacons 500 ml)',
  bundleDesc: 'Cut + Correct + Wax : Le trio indispensable pour corriger et protéger votre carrosserie.',
  discountPercent: 0,
};
