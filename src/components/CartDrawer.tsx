import React, { useState } from 'react';
import { Product } from '../data/products';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Sparkles, MapPin, Truck } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [productId: string]: number };
  catalog: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  shippingCost: number;
  freeShippingThreshold: number;
  onProceedToCheckout: (deliveryMode: 'shipping' | 'pickup') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  catalog,
  onUpdateQuantity,
  onClearCart,
  shippingCost,
  freeShippingThreshold,
  onProceedToCheckout,
}) => {
  const [deliveryMode, setDeliveryMode] = useState<'shipping' | 'pickup'>('shipping');

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = catalog.find((p) => p.id === id);
      return { product: prod, quantity: qty };
    })
    .filter((entry): entry is { product: Product; quantity: number } => Boolean(entry.product));

  const subtotal = cartEntries.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  const isFreeShipping = subtotal >= freeShippingThreshold || deliveryMode === 'pickup';
  const effectiveShipping = deliveryMode === 'pickup' ? 0 : isFreeShipping ? 0 : shippingCost;
  const total = subtotal + effectiveShipping;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    soundManager.playCashRegister();
    onClose();
    onProceedToCheckout(deliveryMode);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#10141b] border-l border-[#232a35] flex flex-col justify-between shadow-2xl text-[#eef1f4]">
          {/* Header */}
          <div className="p-6 border-b border-[#232a35] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-plate text-xl text-[#eef1f4]">Mon Panier</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#151a22] text-[#3ee6d8] border border-[#232a35]">
                {cartEntries.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer le panier"
              className="w-8 h-8 rounded-full bg-[#151a22] hover:bg-[#232a35] border border-[#232a35] flex items-center justify-center text-[#8b949e] hover:text-[#eef1f4] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartEntries.length === 0 ? (
              <div className="py-16 text-center text-[#8b949e] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#151a22] border border-[#232a35] mx-auto flex items-center justify-center text-[#8b949e]">
                  0
                </div>
                <p className="font-plate text-sm text-[#eef1f4]">Votre panier est vide</p>
                <p className="text-xs max-w-xs mx-auto">
                  Découvrez la gamme Bulbee et ajoutez vos produits de detailing pour préparer votre véhicule.
                </p>
              </div>
            ) : (
              <>
                {/* Free shipping progress bar */}
                {deliveryMode === 'shipping' && (
                  <div className="p-3.5 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b949e] flex items-center gap-1.5 font-medium">
                        <Truck className="w-3.5 h-3.5 text-[#3ee6d8]" />
                        {isFreeShipping ? 'Livraison offerte atteinte !' : 'Port offert dès 100 €'}
                      </span>
                      <span className="font-mono font-bold text-[#3ee6d8]">
                        {isFreeShipping ? 'Offert' : `Encore ${remainingForFree.toFixed(2).replace('.', ',')} €`}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#10141b] rounded-full overflow-hidden border border-[#232a35]">
                      <div
                        className="h-full bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#151a22] border border-[#232a35] rounded-xl text-xs font-plate">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setDeliveryMode('shipping');
                    }}
                    className={`py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      deliveryMode === 'shipping'
                        ? 'bg-[#3ee6d8] text-[#0a0d12] font-black shadow-sm'
                        : 'text-[#8b949e] hover:text-[#eef1f4]'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Livraison 48h</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setDeliveryMode('pickup');
                    }}
                    className={`py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      deliveryMode === 'pickup'
                        ? 'bg-[#3ee6d8] text-[#0a0d12] font-black shadow-sm'
                        : 'text-[#8b949e] hover:text-[#eef1f4]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Retrait sur RDV</span>
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {cartEntries.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-between gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl img-visu p-1.5 flex items-center justify-center border border-white/20 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-plate text-xs text-[#eef1f4] truncate">
                          {product.name}
                        </h4>
                        <span className="text-[11px] font-mono text-[#8b949e]">
                          {product.price.toFixed(2).replace('.', ',')} € • {product.volume}
                        </span>

                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onUpdateQuantity(product.id, quantity - 1);
                            }}
                            className="w-6 h-6 rounded-md bg-[#10141b] border border-[#232a35] flex items-center justify-center text-[#8b949e] hover:text-[#eef1f4]"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-bold text-[#eef1f4]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onUpdateQuantity(product.id, quantity + 1);
                            }}
                            className="w-6 h-6 rounded-md bg-[#3ee6d8] text-[#0a0d12] flex items-center justify-center font-bold"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-plate text-sm text-[#eef1f4]">
                          {(product.price * quantity).toFixed(2).replace('.', ',')} €
                        </div>
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onUpdateQuantity(product.id, 0);
                          }}
                          className="text-[10px] text-red-400 hover:underline mt-1"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartEntries.length > 0 && (
            <div className="p-6 border-t border-[#232a35] bg-[#0a0d12]/60 space-y-4">
              <div className="space-y-1.5 text-xs text-[#8b949e] font-mono">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="text-[#eef1f4]">{subtotal.toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison :</span>
                  <span className={effectiveShipping === 0 ? 'text-[#3ddc97] font-bold' : 'text-[#eef1f4]'}>
                    {effectiveShipping === 0 ? 'Offert' : `${effectiveShipping.toFixed(2).replace('.', ',')} €`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-plate text-[#eef1f4] pt-2 border-t border-[#232a35]">
                  <span>Total TTC :</span>
                  <span className="text-[#3ee6d8] text-xl font-bold">
                    {total.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-xl shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Valider la commande ({total.toFixed(2).replace('.', ',')} €)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="text-[10px] text-center text-[#8b949e] flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3ee6d8]" />
                <span>Paiement sécurisé par CB • TVA non applicable, art. 293 B du CGI</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
