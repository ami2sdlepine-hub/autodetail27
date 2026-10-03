import React from 'react';
import sacocheImg from '../assets/images/bulbee_sacoche_real_1790974851655.jpg';
import { CATALOG, Product } from '../data/products';
import { ShieldCheck, Sparkles, PackageCheck, Plus } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface SacocheShowcaseProps {
  product?: Product;
  onAddToCart: (product: Product, event: React.MouseEvent<HTMLButtonElement>) => void;
  onOpenDetails: (product: Product) => void;
}

export const SacocheShowcase: React.FC<SacocheShowcaseProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const sacocheProduct = product || CATALOG.find((p) => p.id === 'SB') || CATALOG[5];

  const compositionPoints = [
    { title: 'Wheel React (500 ml) #98', desc: 'Décontaminant ferreux & jantes réactif pourpre' },
    { title: 'Hydro Wash (500 ml) #96', desc: 'Shampoing carrosserie haut de gamme SiO2 hydrophobe' },
    { title: 'Blue Glass (500 ml) #97', desc: 'Nettoyant vitres & pare-brise sans reflet ni voile' },
    { title: 'Multi Wash (500 ml) #95', desc: 'Dégraissant polyvalent habitacle (plastiques, tissus, tapis)' },
    { title: 'Gant de lavage pro chenille', desc: 'Microfibre ultra-dense anti-micro-rayures carrosserie' },
    { title: 'Duo microfibres de finition', desc: '1 microfibre carrosserie haute densité + 1 microfibre vitres gaufrée' },
  ];

  return (
    <section id="pack" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
          <PackageCheck className="w-3.5 h-3.5" />
          Kit detailing prêt à l'emploi
        </div>
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          La Sacoche <span className="nacre-text">Bulbee</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-xl mx-auto">
          Tout le nécessaire professionnel dans un coffret de transport haute résistance brodé Bulbee. Idéal pour équiper son coffre.
        </p>
      </div>

      {/* Big card with conic nacre rotating border */}
      <div className="conic-border-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Soft inner glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ee6d8]/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7b61ff]/10 rounded-full filter blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left: Visual with Pedestal */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div
              onClick={() => {
                soundManager.playClick();
                onOpenDetails(sacocheProduct);
              }}
              className="relative w-full aspect-square max-w-md rounded-3xl p-6 img-visu flex items-center justify-center cursor-pointer group shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/20"
              role="button"
              tabIndex={0}
              aria-label="Agrandir les détails de la Sacoche Bulbee"
            >
              <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-plate tracking-wider text-black bg-gradient-to-r from-[#3ee6d8] to-[#99f6e4] shadow-md uppercase font-bold">
                Le kit complet
              </span>

              <img
                src={sacocheProduct.image || sacocheImg}
                alt="Sacoche Bulbee kit complet detailing flacons et sacoche brodée"
                className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute bottom-3 right-3 text-[11px] font-mono text-[#0a0d12] bg-white/90 px-2.5 py-1 rounded-md shadow-sm font-semibold">
                Sacoche zippée noire incluse
              </div>
            </div>
            <p className="text-xs text-[#8b949e] mt-3 text-center">
              Livrée avec sa sacoche noire zippée renforcée brodée Bulbee avec poignée de transport.
            </p>
          </div>

          {/* Right: Composition in 6 points & CTA */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#3ee6d8] font-bold">
                  Pack Rénovation Intégrale
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#3ddc97] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Livraison offerte
                </span>
              </div>

              <h3 className="font-plate text-2xl sm:text-4xl text-[#eef1f4] mb-3">
                6 indispensables + la sacoche
              </h3>

              <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
                Une sélection complète réunissant les références majeures pour l'extérieur et l'intérieur, accompagnée des accessoires de lustrage indispensables.
              </p>

              {/* 6 points composition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {compositionPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#151a22] border border-[#232a35] flex items-start gap-2.5 hover:border-[#3ee6d8]/40 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#3ee6d8]/15 text-[#3ee6d8] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#eef1f4]">{pt.title}</div>
                      <div className="text-[11px] text-[#8b949e] leading-snug">{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart button */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0a0d12]/90 border border-[#232a35] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-plate text-3xl sm:text-4xl text-[#eef1f4]">
                    {sacocheProduct.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  <span className="text-xs text-[#8b949e]">TTC</span>
                </div>
                <div className="text-[11px] text-[#3ddc97] font-medium flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3" /> Port offert inclus
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  soundManager.playPschitt();
                  onAddToCart(sacocheProduct, e);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter la Sacoche au panier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
