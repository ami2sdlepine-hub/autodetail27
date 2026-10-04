import blueGlassImg from '../assets/images/bulbee_blue_glass_real_1790974766071.jpg';
import easyPlastImg from '../assets/images/bulbee_easy_plast_real_1790974782615.jpg';
import hydroWashImg from '../assets/images/bulbee_hydro_wash_real_1790974827509.jpg';
import multiWashImg from '../assets/images/bulbee_multi_wash_real_1790974750104.jpg';
import sacocheImg from '../assets/images/bulbee_sacoche_real_1790974851655.jpg';
import sacocheNueImg from '../assets/images/bulbee_sacoche_nue_1791016827651.jpg';
import springFreshImg from '../assets/images/bulbee_spring_fresh_real_1790974813712.jpg';
import mintFreshImg from '../assets/images/bulbee_mint_fresh_1791102869845.jpg';
import ginFreshImg from '../assets/images/bulbee_gin_fresh_1791102885611.jpg';
import bubbleFreshImg from '../assets/images/bulbee_bubble_fresh_1791102850461.jpg';
import tireShineImg from '../assets/images/bulbee_tire_shine_real_1790974796646.jpg';
import wheelReactImg from '../assets/images/bulbee_wheel_react_real_1790974840669.jpg';
import cutImg from '../assets/images/bulbee_cut_real_1791116517194.jpg';
import correctImg from '../assets/images/bulbee_correct_real_1791116536517.jpg';
import waxImg from '../assets/images/bulbee_wax_real_1791116550540.jpg';
import bugCleanerImg from '../assets/images/bulbee_bug_cleaner_1791102780899.jpg';
import instantShineImg from '../assets/images/bulbee_instant_shine_1791102796128.jpg';

export interface Product {
  id: string;
  code: string;
  name: string;
  volume: string;
  refNumber: string;
  price: number;
  costPrice?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'backorder';
  stockCount?: number;
  incomingCount?: number;
  badge?: string;
  usage: string;
  detail: string;
  conseils: [string, string, string];
  image: string;
  colorAccent: string;
  category: 'interieur' | 'lavage' | 'jantes_pneus' | 'kits' | 'parfums' | 'polish_cires' | 'accessoires';
  isHidden?: boolean;
}

export const CATALOG: Product[] = [
  // 1. Multi Clean 500 ml (MC500)
  {
    id: 'MC500',
    code: 'MC500',
    name: 'Multi Clean',
    volume: '500 ml',
    refNumber: '95',
    price: 14.95,
    costPrice: 5.04,
    stockStatus: 'in_stock',
    stockCount: 4,
    badge: 'Le best-seller',
    category: 'interieur',
    colorAccent: '#3ee6d8',
    usage: 'Nettoyant multi-usages intérieur — dégraissant polyvalent : plastiques, tissus, moquettes',
    detail: 'Formulation active professionnelle haute efficacité calibrée pour l\'habitacle automobile. Élimine film gras, poussières incrustées, résidus de boisson et traces d\'usure sur l\'ensemble des plastiques moussés, skaï, tapis et sièges sans ternir ni agresser les textures d\'origine.',
    conseils: [
      'Pulvériser directement sur la zone à traiter ou sur une microfibre propre.',
      'Frotter à l\'aide d\'une brosse douce ou d\'un pinceau detailing pour émulsionner la saleté.',
      'Essuyer avec une microfibre sèche sans rinçage pour un fini net et mat.'
    ],
    image: multiWashImg,
  },

  // 2. Blue Glass 500 ml (BG500)
  {
    id: 'BG500',
    code: 'BG500',
    name: 'Blue Glass',
    volume: '500 ml',
    refNumber: '97',
    price: 11.95,
    costPrice: 3.82,
    stockStatus: 'in_stock',
    stockCount: 1,
    badge: 'Anti-traces',
    category: 'lavage',
    colorAccent: '#38bdf8',
    usage: 'Nettoyant vitres & pare-brise — clarté cristalline sans reflet ni traces',
    detail: 'Nettoyant spécifique vitres à évaporation instantanée sans ammoniaque. Dissout le film routier gras, les résidus de nicotine et les projections d\'insectes sans laisser aucun reflet gênant la vision de nuit.',
    conseils: [
      'Pulvériser 1 à 2 fois sur la vitre ou sur une microfibre gaufrée dédiée.',
      'Nettoyer en mouvements croisés (horizontalement puis verticalement).',
      'Retourner la microfibre sur sa face sèche pour le buffing final éclatant.'
    ],
    image: blueGlassImg,
  },

  // 3. Easy Plast 500 ml (EP500)
  {
    id: 'EP500',
    code: 'EP500',
    name: 'Easy Plast',
    volume: '500 ml',
    refNumber: '100',
    price: 16.95,
    costPrice: 7.74,
    stockStatus: 'backorder',
    category: 'interieur',
    colorAccent: '#b485ff',
    usage: 'Rénovateur cuir & plastiques — nourrit, ravive, fini satiné non gras',
    detail: 'Lait de soin protecteur et nourrissant haut de gamme. Pénètre les polymères et le cuir pour restaurer la profondeur de teinte d\'origine tout en déposant un filtre barrière anti-UV qui prévient les craquelures et la décoloration.',
    conseils: [
      'Appliquer sur une surface préalablement dépoussiérée et dégraissée (avec Multi Clean).',
      'Déposer une noisette de produit sur un applicateur mousse ou une microfibre douce.',
      'Étaler uniformément sans surcharger, puis lustrer après 2 minutes pour un toucher soyeux non gras.'
    ],
    image: easyPlastImg,
  },

  // 4. Wheel React 500 ml (WR500)
  {
    id: 'WR500',
    code: 'WR500',
    name: 'Wheel React',
    volume: '500 ml',
    refNumber: '98',
    price: 13.50,
    costPrice: 6.73,
    stockStatus: 'backorder',
    category: 'jantes_pneus',
    colorAccent: '#d946ef',
    usage: 'Nettoyant jantes déferrant — réaction pourpre instantanée',
    detail: 'Nettoyant jantes au pH équilibré qui cible spécifiquement la poussière de frein incrustée et les particules métalliques. La formule vire au violet foncé au contact du fer pour signaler son action dissolvante avant rinçage.',
    conseils: [
      'Pulvériser copieusement sur jante sèche et froide.',
      'Laisser agir 2 à 3 minutes jusqu\'à apparition de la réaction pourpre vif.',
      'Agiter à l\'aide d\'un pinceau de jante sur les recoins difficiles puis rincer abondamment à haute pression.'
    ],
    image: wheelReactImg,
  },

  // 5. Tire Shine 150 ml (TS150)
  {
    id: 'TS150',
    code: 'TS150',
    name: 'Tire Shine',
    volume: '150 ml',
    refNumber: '102',
    price: 6.00,
    costPrice: 2.81,
    stockStatus: 'backorder',
    category: 'jantes_pneus',
    colorAccent: '#f43f5e',
    usage: 'Brillant pneus longue tenue — noir profond & protection hydrofuge',
    detail: 'Formule enrichie en agents hydrophobes fixateurs. Redonne aux flancs de pneus ce noir ébène intense caractéristique des livraisons de concessions et des paddocks, résistant aux averses sans projection sur les ailes.',
    conseils: [
      'Dégraisser soigneusement le flanc du pneu au préalable pour une accroche maximale.',
      'Déposer le produit sur un tampon applicateur galbé pour épouser la courbure du pneu.',
      'Laisser pénétrer 10 minutes avant de prendre la route pour sceller la finition.'
    ],
    image: tireShineImg,
  },

  // 6. Sacoche Bulbee kit complet (SB)
  {
    id: 'SB',
    code: 'SB',
    name: 'Sacoche Bulbee (Kit complet)',
    volume: 'Kit complet',
    refNumber: 'KIT',
    price: 75.00,
    costPrice: 37.80,
    stockStatus: 'backorder',
    badge: 'Le kit complet',
    category: 'kits',
    colorAccent: '#3ee6d8',
    usage: '4 produits (Wheel React, Hydro Wash, Blue Glass, Multi Clean) + gant + 2 microfibres pro',
    detail: 'L\'arsenal complet du detailer dans sa sacoche renforcée avec poignée de transport et logo Bulbee brodé. Contient tout le nécessaire pour mener une rénovation complète intérieure et extérieure selon les règles de l\'art.',
    conseils: [
      'Commencer par le prélavage et les jantes avec Wheel React sur roues sèches.',
      'Enchaîner avec le lavage aux 2 seaux carrosserie au gant Hydro Wash.',
      'Finir par l\'habitacle avec Multi Clean et les vitres avec Blue Glass et la microfibre dédiée.'
    ],
    image: sacocheImg,
  },

  // 7. Sacoche Bulbee nue (SBN)
  {
    id: 'SBN',
    code: 'SBN',
    name: 'Sacoche Bulbee nue',
    volume: 'Sacoche vide',
    refNumber: 'SBN',
    price: 22.00,
    costPrice: 10.79,
    stockStatus: 'backorder',
    badge: 'À composer',
    category: 'kits',
    colorAccent: '#eef1f4',
    usage: 'Sacoche vide renforcée avec séparateurs pour composer votre kit sur-mesure',
    detail: 'Sacoche de detailing officielle Bulbee vendue vide. Dotée d\'une poignée ergonomique renforcée, de compartiments modulables pour 4 à 6 flacons et d\'une pochette transparente avant pour accessoires et microfibres.',
    conseils: [
      'Parfaite pour ranger et protéger vos flacons dans le coffre sans risque de renversement.',
      'Idéale pour composer votre pack personnalisé avec vos produits préférés.',
      'Matière nylon hydrofuge lavable à l\'éponge.'
    ],
    image: sacocheNueImg,
  },

  // 8. Mint Fresh 150 ml (MF150)
  {
    id: 'MF150',
    code: 'MF150',
    name: 'Mint Fresh',
    volume: '150 ml',
    refNumber: '94',
    price: 9.95,
    costPrice: 4.88,
    stockStatus: 'backorder',
    category: 'parfums',
    colorAccent: '#10b981',
    usage: 'Parfum d\'ambiance habitacle — menthe poivrée vivifiante',
    detail: 'Parfum d\'ambiance concentré haute rémanence. Neutralise durablement les mauvaises odeurs incrustées (tabac, humidité, animaux) et diffuse une fraîcheur pure de menthe givrée sans solvants agressifs.',
    conseils: [
      'Vaporiser 2 à 3 impulsions sous les sièges ou sur les surtapis textiles.',
      'Ne pas pulvériser directement sur les écrans tactiles ou compteurs numériques.',
      'Renouveler toutes les 2 à 3 semaines pour maintenir une signature olfactive premium.'
    ],
    image: mintFreshImg,
  },

  // 9. Gin Fresh 150 ml (GF150)
  {
    id: 'GF150',
    code: 'GF150',
    name: 'Gin Fresh',
    volume: '150 ml',
    refNumber: '92',
    price: 9.95,
    costPrice: 4.88,
    stockStatus: 'backorder',
    category: 'parfums',
    colorAccent: '#06b6d4',
    usage: 'Parfum d\'ambiance habitacle — genièvre & agrumes raffinés',
    detail: 'Senteur hespéridée et boisée inspirée des distilleries artisanales. Les baies de genièvre apportent un sillage élégant et frais qui rappelle les cockpits de grand tourisme.',
    conseils: [
      'Appliquer sur les moquettes de sol dans les puits de ventilation.',
      'Laisser l\'habitacle fermé 5 minutes pour une diffusion homogène.',
      'Conserver le flacon à l\'abri des fortes chaleurs dans la boîte à gants.'
    ],
    image: ginFreshImg,
  },

  // 10. Bubble Fresh 150 ml (BF150)
  {
    id: 'BF150',
    code: 'BF150',
    name: 'Bubble Fresh',
    volume: '150 ml',
    refNumber: '91',
    price: 9.95,
    costPrice: 4.88,
    stockStatus: 'backorder',
    category: 'parfums',
    colorAccent: '#ec4899',
    usage: 'Parfum d\'ambiance habitacle — bubble gum gourmand & sucré',
    detail: 'Une signature sucrée et festive qui évoque le chewing-gum authentique. Couvre instantanément les odeurs tenaces pour créer une atmosphère joyeuse et conviviale.',
    conseils: [
      'Pulvériser 1 à 2 fois dans le coffre et sous les sièges arrière.',
      'Idéal avant un long trajet pour une sensation de propreté immédiate.',
      'Formule base aqueuse ne tachant pas les textiles.'
    ],
    image: bubbleFreshImg,
  },

  // 11. Spring Fresh 150 ml (SF150)
  {
    id: 'SF150',
    code: 'SF150',
    name: 'Spring Fresh',
    volume: '150 ml',
    refNumber: '93',
    price: 9.95,
    costPrice: 4.88,
    stockStatus: 'in_stock',
    stockCount: 1,
    badge: 'Printanier',
    category: 'parfums',
    colorAccent: '#84cc16',
    usage: 'Parfum d\'ambiance habitacle — figue méditerranéenne & fleurs sauvages',
    detail: 'Accord subtil de feuilles de figuier et de fleurs de printemps. Une ambiance chaleureuse, relaxante et haut de gamme conçue pour les longs trajets.',
    conseils: [
      'Vaporiser sur les tissus d\'assise à environ 30 cm de distance.',
      'Active la fraîcheur lorsque la climatisation se déclenche.',
      'Formule sans allergènes volatils nocifs.'
    ],
    image: springFreshImg,
  },

  // 12. Hydro Wash 500 ml (HW500)
  {
    id: 'HW500',
    code: 'HW500',
    name: 'Hydro Wash',
    volume: '500 ml',
    refNumber: '96',
    price: 19.50,
    costPrice: 8.64,
    stockStatus: 'in_stock',
    stockCount: 1,
    badge: 'Céramique SiO2',
    category: 'lavage',
    colorAccent: '#6366f1',
    usage: 'Shampoing carrosserie haut de gamme SiO2 hydrophobe — effet déperlant',
    detail: 'Shampoing de lavage manuel enrichi en polymères de céramique SiO2. Au-delà d\'un pouvoir nettoyant extrême et lubrifiant anti-tourbillons, il dépose un film protecteur auto-nettoyant au beading exceptionnel.',
    conseils: [
      'Diluer 30 à 40 ml dans un seau de 10 litres d\'eau tiède.',
      'Laver de haut en bas avec un gant en microfibre chenille sans appuyer.',
      'Rincer à jet libre pour observer la nappe d\'eau s\'évacuer d\'elle-même.'
    ],
    image: hydroWashImg,
  },

  // 13. Bug Cleaner 500 ml (BC500)
  {
    id: 'BC500',
    code: 'BC500',
    name: 'Bug Cleaner',
    volume: '500 ml',
    refNumber: '99',
    price: 13.50,
    costPrice: 5.86,
    stockStatus: 'backorder',
    category: 'lavage',
    colorAccent: '#eab308',
    usage: 'Démoustiquant enzymatique — dissout insectes séchés & fientes sans frotter',
    detail: 'Formule alcaline douce ciblant les protéines séchées et la sève d\'arbre. Décolle les impacts d\'insectes sur le bouclier avant, le capot et les rétroviseurs sans agresser les cires ni les plastiques.',
    conseils: [
      'Pulvériser sur surfaces froides à l\'ombre avant le shampoing.',
      'Laisser agir 2 minutes sans laisser sécher le produit au soleil.',
      'Rincer directement au nettoyeur haute pression.'
    ],
    image: bugCleanerImg,
  },

  // 14. Instant Shine 500 ml (IS500)
  {
    id: 'IS500',
    code: 'IS500',
    name: 'Instant Shine',
    volume: '500 ml',
    refNumber: '101',
    price: 14.95,
    costPrice: 7.74,
    stockStatus: 'backorder',
    badge: 'Finition Showroom',
    category: 'lavage',
    colorAccent: '#0ea5e9',
    usage: 'Quick detailer de finition lustrante — brillance miroir & effet antistatique',
    detail: 'Le spray d\'entretien ultime entre deux lavages. Élimine les traces d\'eau résiduelles et la poussière volatile tout en rehaussant la profondeur de la laque avec un toucher lisse comme de la soie.',
    conseils: [
      'Travailler élément par élément sur carrosserie préalablement lavée et sèche.',
      'Pulvériser un léger brouillard puis essuyer avec une microfibre dense.',
      'Lustrer avec une deuxième microfibre pour une brillance miroir immédiate.'
    ],
    image: instantShineImg,
  },

  // 15. Cut 500 ml (CUT500)
  {
    id: 'CUT500',
    code: 'CUT500',
    name: 'Polish abrasif Cut',
    volume: '500 ml',
    refNumber: '103',
    price: 24.95,
    costPrice: 11.23,
    stockStatus: 'backorder',
    badge: 'Étape 1 • Abrasif Fort',
    category: 'polish_cires',
    colorAccent: '#ef4444',
    usage: 'Polish de correction (étape 1) — polish abrasif fort pour rayures franches & défauts sévères',
    detail: 'Polish abrasif fort haute performance (formule n° 103). Élimine les rayures marquées, l\'oxydation sévère et prépare la surface avant la passe de finition anti-hologrammes.',
    conseils: [
      'Utiliser sur polisseuse orbitale ou rotative avec un pad en mousse dure ou laine.',
      'Travailler par zones de 40x40 cm à vitesse moyenne jusqu\'à transparence du film.',
      'Essuyer le résidu avec un cleaner d\'inspection IPA et une microfibre douce.'
    ],
    image: cutImg,
  },

  // 16. Correct 500 ml (CORRECT500)
  {
    id: 'CORRECT500',
    code: 'CORRECT500',
    name: 'Polish Correct',
    volume: '500 ml',
    refNumber: '104',
    price: 23.50,
    costPrice: 10.42,
    stockStatus: 'backorder',
    badge: 'Étape 2 • Anti-Hologrammes',
    category: 'polish_cires',
    colorAccent: '#f59e0b',
    usage: 'Polish anti-hologrammes (étape 2) — polish abrasif fin & finition brillante miroir',
    detail: 'Polish de finition anti-hologrammes ultra-fin (formule n° 104). Supprime les voiles de polissage et micro-hologrammes pour une clarté miroir absolue sans reflet.',
    conseils: [
      'Appliquer avec un pad mousse intermédiaire ou souple.',
      'Faire monter la vitesse de la polisseuse pour décomposer les micro-grains.',
      'Parfait en étape 2 de polissage avant la pose de la cire de finition Wax.'
    ],
    image: correctImg,
  },

  // 17. Wax 500 ml (WAX500)
  {
    id: 'WAX500',
    code: 'WAX500',
    name: 'Cire de finition Wax',
    volume: '500 ml',
    refNumber: '105',
    price: 26.90,
    costPrice: 11.95,
    stockStatus: 'backorder',
    badge: 'Étape 3 • Finition Brillante',
    category: 'polish_cires',
    colorAccent: '#10b981',
    usage: 'Cire de finition brillante (étape 3) — protection durable & brillance showroom',
    detail: 'Cire liquide de finition brillante haute protection (formule n° 105). Dépose un film déperlant protecteur anti-UV qui scelle l\'éclat showroom de la carrosserie pour plusieurs mois.',
    conseils: [
      'Appliquer en couche très fine et uniforme avec un tampon mousse doux.',
      'Laisser sécher (haze) 10 à 15 minutes selon l\'hygrométrie ambiante.',
      'Essuyer sans pression avec une microfibre épaisse pour libérer l\'éclat.'
    ],
    image: waxImg,
  }
];
