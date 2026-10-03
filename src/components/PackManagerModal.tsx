import React, { useState } from 'react';
import { X, Sparkles, Layers, Eye, EyeOff, Plus, Trash2, Edit3, Check, SlidersHorizontal, Package, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailingPack } from '../data/packs';
import { Product } from '../data/products';
import { soundManager } from '../utils/soundEffects';

interface PackManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  packs: DetailingPack[];
  allProducts: Product[];
  onSavePacks: (packs: DetailingPack[]) => void;
  showPacksSection: boolean;
  onTogglePacksSection: (visible: boolean) => void;
  showBeforeAfterSection: boolean;
  onToggleBeforeAfterSection: (visible: boolean) => void;
}

export const PackManagerModal: React.FC<PackManagerModalProps> = ({
  isOpen,
  onClose,
  packs,
  allProducts,
  onSavePacks,
  showPacksSection,
  onTogglePacksSection,
  showBeforeAfterSection,
  onToggleBeforeAfterSection,
}) => {
  const [localPacks, setLocalPacks] = useState<DetailingPack[]>(packs);
  const [editingPack, setEditingPack] = useState<DetailingPack | null>(null);
  const [activeTab, setActiveTab] = useState<'packs' | 'sections'>('packs');

  // Sync when opened
  React.useEffect(() => {
    setLocalPacks(packs);
  }, [packs, isOpen]);

  if (!isOpen) return null;

  const handleToggleHidePack = (packId: string) => {
    soundManager.playClick();
    const updated = localPacks.map((p) =>
      p.id === packId ? { ...p, isHidden: !p.isHidden } : p
    );
    setLocalPacks(updated);
    onSavePacks(updated);
  };

  const handleDeletePack = (packId: string) => {
    soundManager.playClick();
    const updated = localPacks.filter((p) => p.id !== packId);
    setLocalPacks(updated);
    onSavePacks(updated);
    if (editingPack?.id === packId) {
      setEditingPack(null);
    }
  };

  const handleStartCreatePack = () => {
    soundManager.playClick();
    const newPack: DetailingPack = {
      id: `pack-${Date.now()}`,
      title: 'Nouveau Pack Sur-Mesure',
      desc: 'Description des avantages et de l\'utilisation de ce pack de flacons.',
      tag: 'Pack Spécial',
      productIds: allProducts.slice(0, 2).map((p) => p.id),
      discountPercent: 10,
      badge: 'Nouveau',
      isHidden: false,
    };
    setEditingPack(newPack);
  };

  const handleSaveEditingPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPack) return;

    soundManager.playCashRegister();
    const exists = localPacks.some((p) => p.id === editingPack.id);
    const updated = exists
      ? localPacks.map((p) => (p.id === editingPack.id ? editingPack : p))
      : [editingPack, ...localPacks];

    setLocalPacks(updated);
    onSavePacks(updated);
    setEditingPack(null);
  };

  const toggleProductInEditingPack = (productId: string) => {
    if (!editingPack) return;
    const current = editingPack.productIds || [];
    const exists = current.includes(productId);

    const nextIds = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    // Ensure at least 1 product
    if (nextIds.length === 0) return;

    setEditingPack({
      ...editingPack,
      productIds: nextIds,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#10141b] border border-[#232a35] text-[#eef1f4] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#232a35] flex items-center justify-between flex-shrink-0 bg-[#0c0f15]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
                Gestionnaire des Packs & Sections
              </h3>
              <p className="text-xs text-[#8b949e]">
                Masquer ou modifier les packs, duos et la section Avant / Après
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Sections Visibility Switches */}
        <div className="p-4 sm:p-6 bg-[#131821] border-b border-[#232a35] flex-shrink-0">
          <span className="text-[11px] font-mono text-[#3ee6d8] uppercase tracking-wider font-bold block mb-3">
            Affichage des sections sur la boutique
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Avant / Après Switch */}
            <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1b222c] flex items-center justify-center text-[#3ee6d8]">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-plate text-sm text-[#eef1f4]">
                    Section "Avant / Après"
                  </h4>
                  <p className="text-[11px] text-[#8b949e]">
                    Curseur comparatif carrosserie
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onToggleBeforeAfterSection(!showBeforeAfterSection);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-plate uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  showBeforeAfterSection
                    ? 'bg-[#3ddc97]/20 border border-[#3ddc97]/50 text-[#3ddc97]'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}
              >
                {showBeforeAfterSection ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Masqué</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Packs & Rituels Switch */}
            <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1b222c] flex items-center justify-center text-[#7b61ff]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-plate text-sm text-[#eef1f4]">
                    Section "Packs & Rituels"
                  </h4>
                  <p className="text-[11px] text-[#8b949e]">
                    Offres combinées et duos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onTogglePacksSection(!showPacksSection);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-plate uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  showPacksSection
                    ? 'bg-[#3ddc97]/20 border border-[#3ddc97]/50 text-[#3ddc97]'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}
              >
                {showPacksSection ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Masqué</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {editingPack ? (
            /* Pack Editor Form */
            <form onSubmit={handleSaveEditingPack} className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#232a35]">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#3ee6d8]" />
                  <span className="font-plate text-sm text-[#eef1f4]">
                    Configuration du Pack : {editingPack.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPack(null)}
                  className="text-xs text-[#8b949e] hover:text-[#eef1f4] cursor-pointer"
                >
                  Annuler
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">
                    Titre du Pack :
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPack.title}
                    onChange={(e) => setEditingPack({ ...editingPack, title: e.target.value })}
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-plate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">
                    Badge promo (Optionnel) :
                  </label>
                  <input
                    type="text"
                    value={editingPack.badge || ''}
                    placeholder="Ex: Best-Seller, Économique, -15%"
                    onChange={(e) => setEditingPack({ ...editingPack, badge: e.target.value })}
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Description / Phrase d'accroche :
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingPack.desc}
                  onChange={(e) => setEditingPack({ ...editingPack, desc: e.target.value })}
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl p-3 text-xs text-[#eef1f4] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">
                    Prix fixe personnalisé (€ TTC) :
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Laisser vide pour calcul automatique"
                    value={editingPack.customPrice ?? ''}
                    onChange={(e) =>
                      setEditingPack({
                        ...editingPack,
                        customPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#8b949e] mt-1 block">
                    Si vide, le prix est la somme des flacons avec la remise ci-contre.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">
                    Remise appliquée en pourcentage (%) :
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingPack.discountPercent ?? 10}
                    onChange={(e) =>
                      setEditingPack({
                        ...editingPack,
                        discountPercent: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Product Selector Multi-Select Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#3ee6d8] uppercase font-bold">
                    Flacons inclus dans ce pack ({editingPack.productIds.length} sélectionnés) :
                  </label>
                  <span className="text-[11px] text-[#8b949e]">
                    Cochez ou décochez les flacons à inclure
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-2 bg-[#0c0f15] border border-[#232a35] rounded-2xl">
                  {allProducts.map((p) => {
                    const isSelected = editingPack.productIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductInEditingPack(p.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#152e28] border-[#3ddc97] text-[#eef1f4]'
                            : 'bg-[#151a22] border-[#232a35] text-[#8b949e] opacity-60 hover:opacity-100 hover:border-white/20'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-black/40 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-[#3ee6d8] font-bold">
                              #{p.refNumber}
                            </span>
                            <span className="text-xs font-plate truncate">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-[#8b949e] font-mono">
                            {p.price.toFixed(2).replace('.', ',')} € • {p.volume}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#3ddc97] text-[#0a0d12]'
                              : 'border border-[#232a35]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#232a35]">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Enregistrer les modifications du Pack
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPack(null)}
                  className="px-5 py-3 rounded-xl bg-[#151a22] border border-[#232a35] text-xs font-plate uppercase text-[#8b949e] hover:text-[#eef1f4] cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            /* Packs List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8b949e]">
                  {localPacks.length} packs configurés
                </span>
                <button
                  type="button"
                  onClick={handleStartCreatePack}
                  className="px-3.5 py-2 rounded-xl bg-[#152e28] border border-[#3ddc97]/50 hover:border-[#3ddc97] text-xs font-plate uppercase tracking-wider text-[#3ddc97] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Créer un nouveau Pack</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {localPacks.map((pack) => {
                  const prods = pack.productIds
                    .map((id) => allProducts.find((p) => p.id === id))
                    .filter((p): p is Product => Boolean(p));

                  const rawTotal = prods.reduce((acc, curr) => acc + curr.price, 0);
                  const discount = pack.discountPercent ?? 10;
                  const computedPrice = rawTotal * (1 - discount / 100);
                  const finalPrice = pack.customPrice ?? computedPrice;

                  return (
                    <div
                      key={pack.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        pack.isHidden
                          ? 'bg-[#151a22]/50 border-red-500/30 opacity-70'
                          : 'bg-[#151a22] border-[#232a35] hover:border-[#3ee6d8]/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#10141b] text-[#3ee6d8] border border-[#232a35] font-semibold">
                              {pack.tag}
                            </span>
                            {pack.badge && (
                              <span className="text-[10px] font-plate uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-black">
                                {pack.badge}
                              </span>
                            )}
                            {pack.isHidden && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                Masqué aux clients
                              </span>
                            )}
                          </div>

                          <h4 className="font-plate text-lg text-[#eef1f4]">
                            {pack.title}
                          </h4>
                          <p className="text-xs text-[#8b949e] line-clamp-2">
                            {pack.desc}
                          </p>

                          {/* Included product pills */}
                          <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                            <span className="text-[10px] font-mono text-[#8b949e]">Contient :</span>
                            {prods.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] font-mono bg-[#10141b] border border-[#232a35] px-2 py-0.5 rounded-md text-[#eef1f4]"
                              >
                                #{p.refNumber} {p.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#232a35]">
                          <div className="text-right">
                            <div className="font-plate text-xl text-[#3ee6d8]">
                              {finalPrice.toFixed(2).replace('.', ',')} €
                            </div>
                            {rawTotal > finalPrice && (
                              <span className="text-[11px] font-mono line-through text-[#8b949e]">
                                {rawTotal.toFixed(2).replace('.', ',')} €
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleHidePack(pack.id)}
                              title={pack.isHidden ? 'Rendre visible' : 'Masquer ce pack'}
                              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                                pack.isHidden
                                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                  : 'bg-[#10141b] border-[#232a35] text-[#8b949e] hover:text-[#3ee6d8]'
                              }`}
                            >
                              {pack.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playClick();
                                setEditingPack(pack);
                              }}
                              title="Modifier les flacons et tarifs de ce pack"
                              className="px-3 py-2 rounded-xl bg-[#10141b] hover:bg-[#1a212b] border border-[#232a35] hover:border-[#3ee6d8] text-xs font-plate uppercase text-[#3ee6d8] flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePack(pack.id)}
                              title="Supprimer ce pack"
                              className="p-2 rounded-xl bg-[#10141b] hover:bg-red-500/20 border border-[#232a35] hover:border-red-500/40 text-[#8b949e] hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#232a35] flex items-center justify-between bg-[#0c0f15] flex-shrink-0">
          <span className="text-xs font-mono text-[#8b949e]">
            Les modifications sont synchronisées instantanément dans le Cloud.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#151a22] hover:bg-[#1a212c] border border-[#232a35] text-xs font-plate uppercase text-[#eef1f4] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
