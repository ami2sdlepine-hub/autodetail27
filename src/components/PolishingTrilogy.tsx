import React from 'react';
import { CATALOG, Product } from '../data/products';
import { Sparkles, Layers, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface PolishingTrilogyProps {
  onAddMultipleToCart: (products: Product[]) => void;
  onOpenDetails: (product: Product) => void;
}

export const PolishingTrilogy: React.FC<PolishingTrilogyProps> = ({
  onAddMultipleToCart,
  onOpenDetails,
}) => {
  const steps = [
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
  ];

  const trilogyProducts = steps
    .map((s) => CATALOG.find((p) => p.id === s.id))
    .filter((p): p is Product => Boolean(p));

  const totalTrilogyPrice = trilogyProducts.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#7b61ff] uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          Protocole de correction complet
        </div>
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          La Trilogie <span className="nacre-text">Cut, Correct, Wax</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-2xl mx-auto">
          Le processus en 3 étapes adopté par les ateliers de lustrage professionnel pour éliminer les défauts et sceller un éclat showroom pérenne.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {steps.map((st, idx) => {
          const prod = trilogyProducts[idx];
          if (!prod) return null;

          return (
            <div
              key={st.id}
              className="p-6 rounded-3xl bg-[#10141b] border border-[#232a35] hover:border-[#7b61ff]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-plate text-xs text-[#7b61ff] uppercase tracking-widest">
                    {st.tag}
                  </span>
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs"
                    style={{ backgroundColor: `${st.color}20`, color: st.color }}
                  >
                    {st.num}
                  </span>
                </div>

                <div
                  onClick={() => onOpenDetails(prod)}
                  className="w-full aspect-square rounded-2xl img-visu p-4 flex items-center justify-center border border-white/20 mb-4 cursor-pointer group overflow-hidden"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="font-plate text-xl text-[#eef1f4] mb-2">{st.title}</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed mb-4">{st.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#232a35] flex items-center justify-between">
                <span className="font-plate text-lg text-[#eef1f4]">
                  {prod.price.toFixed(2).replace('.', ',')} €
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDetails(prod)}
                  className="text-xs text-[#3ee6d8] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Détails</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trilogy Pack Summary Banner */}
      <div className="conic-border-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ee6d8] uppercase font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Offre Rénovation Complète Vernis</span>
          </div>
          <h4 className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
            La Trilogie Complète (3 flacons 500 ml)
          </h4>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
            Cut + Correct + Wax : Le trio indispensable pour corriger et protéger votre carrosserie.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-right">
            <div className="font-plate text-3xl text-[#eef1f4]">
              {totalTrilogyPrice.toFixed(2).replace('.', ',')} €
            </div>
            <span className="text-[11px] text-[#3ddc97] font-semibold">
              Port offert inclus
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playPschitt();
              onAddMultipleToCart(trilogyProducts);
            }}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ajouter la Trilogie ({totalTrilogyPrice.toFixed(2).replace('.', ',')} €)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
