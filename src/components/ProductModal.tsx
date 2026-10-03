import React from 'react';
import { Product } from '../data/products';
import { X, CheckCircle2, ShieldCheck, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer la fiche produit"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] hover:border-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Left: Product Image on Pedestal */}
          <div className="sm:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square rounded-2xl p-4 img-visu flex items-center justify-center border border-white/20 shadow-xl relative overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
            </div>
            <span className="text-[11px] font-mono text-[#8b949e] mt-2">
              Réf : {product.code} • #{product.refNumber}
            </span>
          </div>

          {/* Right: Info, Price, Description */}
          <div className="sm:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#151a22] text-[#3ee6d8] border border-[#232a35] font-bold">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-plate uppercase bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-black">
                    {product.badge}
                  </span>
                )}
              </div>

              <h2 className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
                {product.name}
              </h2>
              <p className="text-xs font-mono text-[#8b949e] mt-0.5">
                Contenance : {product.volume}
              </p>

              <div className="mt-4 text-2xl sm:text-3xl font-plate text-[#eef1f4]">
                {product.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                <span className="text-xs font-mono text-[#8b949e] ml-2">TTC</span>
              </div>

              {/* Stock notice */}
              <div className="mt-2 text-xs flex items-center gap-1.5 text-[#3ddc97]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {product.stockStatus === 'in_stock'
                    ? `En stock (${product.stockCount} unités dispo immédiate)`
                    : product.stockStatus === 'low_stock'
                    ? `Stock limité (${product.stockCount} unités restantes)`
                    : 'Sur commande (réapprovisionnement rapide)'}
                </span>
              </div>
            </div>

            {/* Quick Add CTA */}
            <div className="mt-6">
              <button
                onClick={(e) => {
                  soundManager.playPschitt();
                  onAddToCart(product, e);
                  onClose();
                }}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter au panier ({product.price.toFixed(2).replace('.', ',')} €)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-8 pt-6 border-t border-[#232a35] space-y-4">
          <div>
            <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-2">
              Fiche technique & formulation
            </h4>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              {product.detail}
            </p>
          </div>

          {/* 3 Application tips */}
          <div>
            <h4 className="font-plate text-xs text-[#eef1f4] uppercase tracking-wider mb-3">
              Conseils d'application du préparateur
            </h4>
            <div className="space-y-2">
              {product.conseils.map((conseil, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#151a22] border border-[#232a35] flex items-start gap-2.5 text-xs text-[#8b949e]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#3ee6d8]/20 text-[#3ee6d8] flex items-center justify-center font-mono font-bold flex-shrink-0 text-[10px]">
                    0{idx + 1}
                  </span>
                  <span className="leading-snug text-[#eef1f4]">{conseil}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
