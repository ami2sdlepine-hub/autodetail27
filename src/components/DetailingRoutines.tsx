import React from 'react';
import { Product } from '../data/products';
import { DetailingPack } from '../data/packs';
import { Sparkles, ShieldCheck, Plus, Settings, EyeOff } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface DetailingRoutinesProps {
  packs: DetailingPack[];
  allProducts: Product[];
  onAddMultipleToCart: (products: Product[]) => void;
  onAddPackToCart?: (pack: DetailingPack, prods: Product[], finalPrice: number) => void;
  isAdmin?: boolean;
  onOpenPackManager?: () => void;
}

export const DetailingRoutines: React.FC<DetailingRoutinesProps> = ({
  packs,
  allProducts,
  onAddMultipleToCart,
  onAddPackToCart,
  isAdmin,
  onOpenPackManager,
}) => {
  // Filter visible packs for visitors, but show all with indicator for admin
  const visiblePacks = isAdmin ? packs : packs.filter((p) => !p.isHidden);

  if (visiblePacks.length === 0 && !isAdmin) return null;

  return (
    <section id="packs" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Rituels de soin recommandés
          </div>
          <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
            Composez votre <span className="nacre-text">Routine Detailing</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-xl">
            Des associations calibrées de flacons complémentaires pour un résultat professionnel sans compromis.
          </p>
        </div>

        {isAdmin && onOpenPackManager && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPackManager();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#152e28] border border-[#3ddc97]/50 hover:border-[#3ddc97] text-xs font-plate uppercase tracking-wider text-[#3ddc97] hover:bg-[#3ddc97]/10 transition-all shadow-sm cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Gérer & modifier les Packs</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {visiblePacks.map((routine) => {
          const prods = (routine.productIds || [])
            .map((id) => allProducts.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p));

          const rawTotal = prods.reduce((acc, curr) => acc + curr.price, 0);
          const discount = routine.discountPercent ?? 10;
          const computedPrice = rawTotal * (1 - discount / 100);
          const finalPrice = routine.customPrice ?? computedPrice;

          return (
            <div
              key={routine.id}
              className={`conic-border-card p-6 sm:p-8 flex flex-col justify-between relative ${
                routine.isHidden ? 'border-red-500/40 opacity-75' : ''
              }`}
            >
              {routine.isHidden && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  <span>Masqué aux clients</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#3ee6d8] font-bold">
                    {routine.tag}
                  </span>
                  <span className="text-xs font-mono text-[#3ddc97] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {prods.length} flacons inclus
                  </span>
                </div>

                <h3 className="font-plate text-2xl sm:text-3xl text-[#eef1f4] mb-3">
                  {routine.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] mb-6 leading-relaxed">
                  {routine.desc}
                </p>

                {/* Product miniatures included in routine */}
                <div className="space-y-3 mb-8">
                  {prods.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-2xl bg-[#10141b] border border-[#232a35] flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-black/40 p-1 flex items-center justify-center flex-shrink-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#3ee6d8] font-bold">
                            #{prod.refNumber}
                          </span>
                          <span className="text-xs font-plate text-[#eef1f4] truncate">
                            {prod.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8b949e] block font-mono">
                          {prod.volume} • {prod.price.toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-6 border-t border-[#232a35] flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-[#8b949e] uppercase block">
                    {routine.badge || 'Offre Pack'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-plate text-2xl sm:text-3xl text-[#3ee6d8]">
                      {finalPrice.toFixed(2).replace('.', ',')} €
                    </span>
                    {rawTotal > finalPrice && (
                      <span className="text-xs font-mono line-through text-[#8b949e]">
                        {rawTotal.toFixed(2).replace('.', ',')} €
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playCashRegister();
                    if (onAddPackToCart) {
                      onAddPackToCart(routine, prods, finalPrice);
                    } else {
                      onAddMultipleToCart(prods);
                    }
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Ajouter le Pack</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
