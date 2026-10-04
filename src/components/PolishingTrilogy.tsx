import React from 'react';
import { Product } from '../data/products';
import { TrilogyConfig, DEFAULT_TRILOGY_CONFIG } from '../data/trilogy';
import { Sparkles, Layers, ShieldCheck, Plus, ArrowRight, Eye, EyeOff, Settings, Camera } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface PolishingTrilogyProps {
  config?: TrilogyConfig;
  allProducts: Product[];
  onAddMultipleToCart: (products: Product[]) => void;
  onOpenDetails: (product: Product) => void;
  isVisible: boolean;
  isAdmin?: boolean;
  onToggleVisible?: (visible: boolean) => void;
  onOpenEdit?: () => void;
  onUpdateProductPhoto?: (productId: string, image: string) => void;
}

export const PolishingTrilogy: React.FC<PolishingTrilogyProps> = ({
  config = DEFAULT_TRILOGY_CONFIG,
  allProducts,
  onAddMultipleToCart,
  onOpenDetails,
  isVisible,
  isAdmin,
  onToggleVisible,
  onOpenEdit,
  onUpdateProductPhoto,
}) => {
  // If hidden and not admin, do not render at all
  if (!isVisible && !isAdmin) return null;

  const trilogyProducts = config.steps
    .map((s) => allProducts.find((p) => p.id === s.id))
    .filter((p): p is Product => Boolean(p));

  const rawTotal = trilogyProducts.reduce((acc, curr) => acc + curr.price, 0);
  const discount = config.discountPercent || 0;
  const computedPrice = discount > 0 ? rawTotal * (1 - discount / 100) : rawTotal;
  const finalBundlePrice = config.customPrice ?? computedPrice;

  return (
    <section id="trilogie" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto relative">
      {/* Admin Notice when Hidden */}
      {!isVisible && isAdmin && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-red-400 text-xs sm:text-sm">
            <EyeOff className="w-5 h-5 flex-shrink-0" />
            <span>
              <strong>Section "Trilogie Polissage" MASQUÉE aux clients</strong> : Les visiteurs ne voient pas ce protocole.
            </span>
          </div>
          {onToggleVisible && (
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleVisible(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#3ddc97] text-[#0a0d12] text-xs font-plate uppercase tracking-wider font-black hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rendre visible</span>
            </button>
          )}
        </div>
      )}

      {/* Header with Admin controls */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6">
        <div className="text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#7b61ff] uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            {config.sectionTag}
          </div>
          <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
            {config.sectionTitle.includes('Cut, Correct, Wax') ? (
              <>
                La Trilogie <span className="nacre-text">Cut, Correct, Wax</span>
              </>
            ) : (
              config.sectionTitle
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-2xl">
            {config.sectionDesc}
          </p>
        </div>

        {/* Admin Quick Action Buttons */}
        {isAdmin && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onOpenEdit();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#152e28] border border-[#3ddc97]/50 hover:border-[#3ddc97] text-xs font-plate uppercase tracking-wider text-[#3ddc97] hover:bg-[#3ddc97]/10 transition-all shadow-sm cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Modifier cette Trilogie</span>
              </button>
            )}

            {onToggleVisible && isVisible && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onToggleVisible(false);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#151a22] hover:bg-red-500/20 border border-[#232a35] hover:border-red-500/40 text-xs font-plate uppercase text-[#8b949e] hover:text-red-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Masquer cette section aux visiteurs"
              >
                <EyeOff className="w-4 h-4" />
                <span>Masquer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3 Step Cards Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 ${!isVisible ? 'opacity-40 grayscale-[40%]' : ''}`}>
        {config.steps.map((st, idx) => {
          const prod = allProducts.find((p) => p.id === st.id) || trilogyProducts[idx];
          if (!prod) return null;

          return (
            <div
              key={st.id + idx}
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
                  className="relative w-full aspect-square rounded-2xl img-visu p-4 flex items-center justify-center border border-[#232a35] mb-4 group overflow-hidden"
                >
                  <img
                    onClick={() => onOpenDetails(prod)}
                    src={st.image || prod.image}
                    alt={st.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />

                  {isAdmin && onUpdateProductPhoto && (
                    <label
                      title="Changer la photo de ce flacon"
                      className="absolute bottom-2 right-2 p-2 rounded-xl bg-[#10141b]/90 hover:bg-[#3ee6d8] border border-[#232a35] hover:border-[#3ee6d8] text-[#3ee6d8] hover:text-[#0a0d12] shadow-lg transition-all cursor-pointer z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const b64 = ev.target?.result as string;
                              if (b64) onUpdateProductPhoto(prod.id, b64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Camera className="w-4 h-4" />
                    </label>
                  )}
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
                  className="text-xs text-[#3ee6d8] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
      <div className={`conic-border-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 ${!isVisible ? 'opacity-40' : ''}`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#3ee6d8] uppercase font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{config.bundleTag}</span>
          </div>
          <h4 className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
            {config.bundleTitle}
          </h4>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
            {config.bundleDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-right">
            <div className="font-plate text-3xl text-[#3ee6d8]">
              {finalBundlePrice.toFixed(2).replace('.', ',')} €
            </div>
            {rawTotal > finalBundlePrice ? (
              <span className="text-xs font-mono line-through text-[#8b949e] block">
                {rawTotal.toFixed(2).replace('.', ',')} €
              </span>
            ) : (
              <span className="text-[11px] text-[#3ddc97] font-semibold block">
                Port offert inclus
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playCashRegister();
              onAddMultipleToCart(trilogyProducts);
            }}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ajouter la Trilogie ({finalBundlePrice.toFixed(2).replace('.', ',')} €)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
