import React, { useState } from 'react';
import { CATALOG, Product } from '../data/products';
import { X, Save, RefreshCw, Check, Percent, Tag, Truck } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface PriceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPrices: { [productId: string]: number };
  shippingCost: number;
  freeShippingThreshold: number;
  onSave: (
    newPrices: { [productId: string]: number },
    newShippingCost: number,
    newFreeShippingThreshold: number
  ) => void;
}

export const PriceEditorModal: React.FC<PriceEditorModalProps> = ({
  isOpen,
  onClose,
  customPrices,
  shippingCost,
  freeShippingThreshold,
  onSave,
}) => {
  const [prices, setPrices] = useState<{ [productId: string]: string }>(() => {
    const init: { [productId: string]: string } = {};
    CATALOG.forEach((p) => {
      init[p.id] = (customPrices[p.id] ?? p.price).toFixed(2);
    });
    return init;
  });

  const [shipping, setShipping] = useState<string>(shippingCost.toFixed(2));
  const [threshold, setThreshold] = useState<string>(freeShippingThreshold.toFixed(2));
  const [discountPercent, setDiscountPercent] = useState<string>('');

  if (!isOpen) return null;

  const handlePriceChange = (id: string, value: string) => {
    setPrices((prev) => ({ ...prev, [id]: value }));
  };

  const applyGlobalDiscount = () => {
    const percent = parseFloat(discountPercent);
    if (isNaN(percent) || percent <= 0 || percent > 90) return;

    soundManager.playPschitt();
    const updated: { [productId: string]: string } = {};
    CATALOG.forEach((p) => {
      const current = parseFloat(prices[p.id]) || p.price;
      const discounted = current * (1 - percent / 100);
      updated[p.id] = (Math.round(discounted * 20) / 20).toFixed(2);
    });
    setPrices(updated);
  };

  const handleResetDefaults = () => {
    soundManager.playClick();
    const defPrices: { [productId: string]: string } = {};
    CATALOG.forEach((p) => {
      defPrices[p.id] = p.price.toFixed(2);
    });
    setPrices(defPrices);
    setShipping('4.95');
    setThreshold('39.00');
  };

  const handleSave = () => {
    soundManager.playCashRegister();
    const numericPrices: { [productId: string]: number } = {};
    Object.entries(prices).forEach(([id, val]) => {
      const num = parseFloat(val.replace(',', '.'));
      if (!isNaN(num) && num > 0) {
        numericPrices[id] = num;
      }
    });

    const numShipping = parseFloat(shipping.replace(',', '.')) || 4.95;
    const numThreshold = parseFloat(threshold.replace(',', '.')) || 39.0;

    onSave(numericPrices, numShipping, numThreshold);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              Gestionnaire des Tarifs & Frais de Port
            </h3>
            <p className="text-xs text-[#8b949e]">
              Ajustez vos prix de vente TTC et calculez votre marge brute en direct.
            </p>
          </div>
        </div>

        {/* Global Settings: Shipping and Bulk Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3">
            <div className="flex items-center gap-2 text-xs font-plate text-[#3ee6d8] uppercase">
              <Truck className="w-4 h-4" />
              <span>Paramètres de livraison</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Frais de port (€) :</label>
                <input
                  type="number"
                  step="0.05"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3 py-2 text-[#eef1f4] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[#8b949e] mb-1 font-mono">Port offert dès (€) :</label>
                <input
                  type="number"
                  step="1"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3 py-2 text-[#eef1f4] font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3">
            <div className="flex items-center gap-2 text-xs font-plate text-[#7b61ff] uppercase">
              <Percent className="w-4 h-4" />
              <span>Remise globale catalogue</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Ex: 10"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="flex-1 bg-[#10141b] border border-[#232a35] focus:border-[#7b61ff] rounded-xl px-3 py-2 text-xs text-[#eef1f4] font-mono outline-none"
              />
              <button
                type="button"
                onClick={applyGlobalDiscount}
                className="px-4 py-2 rounded-xl bg-[#7b61ff] hover:bg-[#9278ff] text-white text-xs font-plate uppercase tracking-wider font-bold transition-all"
              >
                Appliquer -%
              </button>
            </div>
            <p className="text-[10px] text-[#8b949e]">
              Baisse automatiquement les 17 prix au prorata (arrondi 5 cts).
            </p>
          </div>
        </div>

        {/* 17 Products Price Table */}
        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-1">
          {CATALOG.map((p) => {
            const currentPrice = parseFloat(prices[p.id]) || p.price;
            const cost = p.costPrice || 0;
            const margin = currentPrice - cost;
            const marginPercent = currentPrice > 0 ? (margin / currentPrice) * 100 : 0;

            return (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[#151a22] border border-[#232a35] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg img-visu p-1 flex items-center justify-center flex-shrink-0">
                    <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-plate text-xs text-[#eef1f4] truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#8b949e]">
                      {p.code} • #{p.refNumber} • {p.volume}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {cost > 0 && (
                    <div className="hidden sm:block text-right text-[11px] font-mono">
                      <div className="text-[#8b949e]">Coût : {cost.toFixed(2)} €</div>
                      <div className="text-[#3ddc97] font-semibold">
                        Marge : +{margin.toFixed(2)} € ({marginPercent.toFixed(0)}%)
                      </div>
                    </div>
                  )}

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.05"
                      value={prices[p.id] || ''}
                      onChange={(e) => handlePriceChange(p.id, e.target.value)}
                      className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-2.5 py-1.5 text-right font-mono text-sm text-[#eef1f4] font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#232a35] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rétablir prix d'origine</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Enregistrer les tarifs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
