import React from 'react';
import { Product } from '../data/products';
import { Plus, Minus, Check, Sparkles, Clock } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product, event: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails,
}) => {
  const isBackorder = (product.stockCount !== undefined && product.stockCount <= 0) || product.stockStatus === 'backorder';
  const hasIncoming = isBackorder && Boolean(product.incomingCount && product.incomingCount > 0);
  const isLowStock = !isBackorder && ((product.stockCount !== undefined && product.stockCount <= 3) || product.stockStatus === 'low_stock');

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-[#10141b] border border-[#232a35] hover:border-[#3ee6d8]/50 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-[#3ee6d8]/10 hover:-translate-y-1">
      {/* Top Tag & Stock Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono uppercase bg-[#151a22] text-[#8b949e] border border-[#232a35] px-2.5 py-0.5 rounded-full font-semibold">
              #{product.refNumber}
            </span>
            {product.badge && (
              <span className="text-[10px] font-plate uppercase tracking-wider bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] px-2 py-0.5 rounded-full font-black">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock Chip */}
          {isBackorder ? (
            hasIncoming ? (
              <span className="text-[10px] font-mono text-[#3ee6d8] bg-[#3ee6d8]/15 border border-[#3ee6d8]/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Réassort en cours — bientôt de retour</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md font-semibold">
                Rupture
              </span>
            )
          ) : isLowStock ? (
            <span className="text-[10px] font-mono text-[#f59e0b] bg-[#f59e0b]/15 border border-[#f59e0b]/40 px-2 py-0.5 rounded-md font-bold">
              Plus que {product.stockCount} en stock
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#3ddc97] bg-[#3ddc97]/10 border border-[#3ddc97]/30 px-2 py-0.5 rounded-md">
              En stock ({product.stockCount})
            </span>
          )}
        </div>

        {/* Clickable Image Container */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenDetails(product);
          }}
          className="relative w-full aspect-square rounded-2xl p-4 img-visu flex items-center justify-center cursor-pointer overflow-hidden border border-white/20 mb-4 group-hover:border-[#3ee6d8]/40 transition-colors"
          role="button"
          tabIndex={0}
          aria-label={`Voir les caractéristiques de ${product.name}`}
        >
          <img
            src={product.image}
            alt={`${product.name} ${product.volume}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-108 transition-transform duration-500"
          />
        </div>

        {/* Title, Volume & Short Usage */}
        <div
          onClick={() => {
            soundManager.playClick();
            onOpenDetails(product);
          }}
          className="cursor-pointer"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-plate text-lg sm:text-xl text-[#eef1f4] group-hover:text-[#3ee6d8] transition-colors truncate">
              {product.name}
            </h3>
            <span className="text-xs font-mono text-[#8b949e] flex-shrink-0">
              {product.volume}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
            {product.usage}
          </p>
        </div>
      </div>

      {/* Bottom Pricing & Cart Action */}
      <div className="mt-6 pt-4 border-t border-[#232a35] flex items-center justify-between gap-3">
        <div>
          <div className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
            {product.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <span className="text-[10px] font-mono text-[#8b949e]">TTC • unitaire</span>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-1.5 bg-[#151a22] border border-[#232a35] rounded-xl p-1">
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateQuantity(product.id, quantity - 1);
              }}
              className="w-7 h-7 rounded-lg bg-[#10141b] hover:bg-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center transition-colors"
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center font-mono text-xs font-bold text-[#eef1f4]">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                if (product.stockCount !== undefined && quantity >= product.stockCount) return;
                onAddToCart(product, e);
              }}
              disabled={product.stockCount !== undefined && quantity >= product.stockCount}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                product.stockCount !== undefined && quantity >= product.stockCount
                  ? 'bg-[#151a22] text-[#8b949e] opacity-40 cursor-not-allowed'
                  : 'bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12]'
              }`}
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              if (isBackorder) return;
              onAddToCart(product, e);
            }}
            disabled={isBackorder}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-plate font-black uppercase tracking-wider transition-all duration-200 ${
              isBackorder
                ? hasIncoming
                  ? 'bg-[#151a22] border border-[#3ee6d8]/40 text-[#3ee6d8] opacity-80 cursor-not-allowed'
                  : 'bg-[#151a22] border border-red-500/30 text-red-400 opacity-60 cursor-not-allowed'
                : 'bg-[#151a22] hover:bg-[#3ee6d8] border border-[#232a35] hover:border-[#3ee6d8] text-[#eef1f4] hover:text-[#0a0d12] active:scale-95 cursor-pointer'
            }`}
          >
            {!isBackorder && <Plus className="w-3.5 h-3.5 stroke-[3]" />}
            <span>
              {isBackorder
                ? hasIncoming
                  ? 'Bientôt de retour'
                  : 'Rupture'
                : 'Ajouter'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
