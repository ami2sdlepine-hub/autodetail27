import React from 'react';
import { CATALOG, Product } from '../data/products';
import { Sparkles, ArrowRight, ShieldCheck, Plus } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface DetailingRoutinesProps {
  onAddMultipleToCart: (products: Product[]) => void;
}

export const DetailingRoutines: React.FC<DetailingRoutinesProps> = ({
  onAddMultipleToCart,
}) => {
  const routines = [
    {
      id: 'routine-int',
      title: 'Pack Habitacle Parfait',
      desc: 'Dégraissage en profondeur des plastiques et tissus + protection satinée anti-UV + parfum vivifiant.',
      productIds: ['MC500', 'EP500', 'SF150'],
      tag: 'Intérieur Showroom',
      color: '#3ee6d8',
    },
    {
      id: 'routine-ext',
      title: 'Pack Lavage & Finition Miroir',
      desc: 'Prélavage décontaminant jantes + shampoing céramique SiO2 + quick detailer lustrant express.',
      productIds: ['WR500', 'HW500', 'IS500'],
      tag: 'Extérieur & Carrosserie',
      color: '#7b61ff',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Rituels de soin recommandés
        </div>
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          Composez votre <span className="nacre-text">Routine Detailing</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-xl mx-auto">
          Des associations calibrées de flacons complémentaires pour un résultat professionnel sans compromis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {routines.map((routine) => {
          const prods = routine.productIds
            .map((id) => CATALOG.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p));

          const totalPrice = prods.reduce((acc, curr) => acc + curr.price, 0);

          return (
            <div
              key={routine.id}
              className="conic-border-card p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#3ee6d8] font-bold">
                    {routine.tag}
                  </span>
                  <span className="text-xs font-mono text-[#3ddc97] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    3 flacons complémentaires
                  </span>
                </div>

                <h3 className="font-plate text-2xl sm:text-3xl text-[#eef1f4] mb-3">
                  {routine.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] mb-6 leading-relaxed">
                  {routine.desc}
                </p>

                {/* 3 mini product cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {prods.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#151a22] border border-[#232a35] flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-xl img-visu p-2 flex items-center justify-center border border-white/20 mb-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      </div>
                      <span className="font-plate text-xs text-[#eef1f4] truncate w-full">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8b949e]">
                        {p.volume}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#3ee6d8] mt-1">
                        {p.price.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Total & Add Pack Button */}
              <div className="pt-4 border-t border-[#232a35] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#8b949e] font-mono">Total du pack :</div>
                  <div className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
                    {totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    <span className="text-xs font-mono text-[#8b949e] ml-1">TTC</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playPschitt();
                    onAddMultipleToCart(prods);
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Ajouter le pack ({totalPrice.toFixed(2).replace('.', ',')} €)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
