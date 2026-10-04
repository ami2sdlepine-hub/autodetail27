import React, { useState } from 'react';
import { Product } from '../data/products';
import {
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Package,
  Edit3,
  Camera,
  Search,
  Percent,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { compressImage } from '../utils/imageCompressor';

interface CatalogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  hiddenProductIds: string[];
  onToggleHideProduct: (productId: string) => void;
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
}

export const CatalogManagerModal: React.FC<CatalogManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  hiddenProductIds,
  onToggleHideProduct,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form state
  const [formId, setFormId] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formVolume, setFormVolume] = useState<string>('500 ml');
  const [formPrice, setFormPrice] = useState<string>('15.00');
  const [formCategory, setFormCategory] = useState<Product['category']>('lavage');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formStockStatus, setFormStockStatus] = useState<Product['stockStatus']>('in_stock');
  const [formStockCount, setFormStockCount] = useState<number>(5);
  const [formUsage, setFormUsage] = useState<string>('');
  const [formDetail, setFormDetail] = useState<string>('');
  const [formConseils, setFormConseils] = useState<[string, string, string]>([
    'Appliquer sur surface propre et froide.',
    'Travailler à l\'aide d\'une microfibre propre.',
    'Lustrer pour un résultat showroom impeccable.',
  ]);
  const [formImage, setFormImage] = useState<string>('');

  if (!isOpen) return null;

  const startEdit = (p: Product) => {
    soundManager.playClick();
    setEditingProduct(p);
    setFormId(p.id);
    setFormName(p.name);
    setFormVolume(p.volume);
    setFormPrice(p.price.toString());
    setFormCategory(p.category);
    setFormBadge(p.badge || '');
    setFormStockStatus(p.stockStatus);
    setFormStockCount(p.stockCount || 5);
    setFormUsage(p.usage);
    setFormDetail(p.detail);
    setFormConseils(p.conseils || [
      'Appliquer sur surface propre et froide.',
      'Travailler à l\'aide d\'une microfibre propre.',
      'Lustrer pour un résultat showroom impeccable.',
    ]);
    setFormImage(p.image);
    setActiveTab('edit');
  };

  const startAdd = () => {
    soundManager.playClick();
    setEditingProduct(null);
    setFormId(`ART-${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormVolume('1 pièce');
    setFormPrice('9.90');
    setFormCategory('accessoires');
    setFormBadge('');
    setFormStockStatus('in_stock');
    setFormStockCount(10);
    setFormUsage('Accessoire d\'esthétique automobile haute précision');
    setFormDetail('Matériel sélectionné par AUTODETAIL pour un rendu irréprochable et sans micro-rayures.');
    setFormConseils([
      'Laver avant première utilisation si textile.',
      'Toujours utiliser propre sur carrosserie.',
      'Rincer et sécher à l\'air libre après chaque detailing.',
    ]);
    setFormImage(products[0]?.image || '');
    setActiveTab('add');
  };

  const handleImageUpload = async (file: File) => {
    const compressed = await compressImage(file, 900, 900, 0.82);
    if (compressed) {
      setFormImage(compressed);
      soundManager.playPschitt();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const priceNum = parseFloat(formPrice.replace(',', '.')) || 15.0;

    const productPayload: Product = {
      id: formId.trim().toUpperCase(),
      code: formId.trim().toUpperCase(),
      name: formName.trim(),
      volume: formVolume.trim() || '500 ml',
      refNumber: formId.slice(0, 3),
      price: priceNum,
      stockStatus: formStockStatus,
      stockCount: formStockCount,
      badge: formBadge.trim() || '',
      category: formCategory,
      usage: formUsage.trim(),
      detail: formDetail.trim(),
      conseils: formConseils,
      image: formImage || products[0]?.image || '',
      colorAccent: formCategory === 'accessoires' ? '#7b61ff' : '#3ee6d8',
    };

    soundManager.playPschitt();

    if (activeTab === 'edit') {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }

    setActiveTab('list');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.badge && p.badge.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232a35] pr-10">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#3ee6d8]" />
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
                Gestionnaire de Boutique • AUTODETAIL
              </h3>
            </div>
            <p className="text-xs text-[#8b949e] mt-1">
              Modifiez vos textes, prix, badges promo, duos et ajoutez vos futurs accessoires (microfibres, pinceaux...).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'list' ? (
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl bg-[#151a22] border border-[#232a35] hover:border-[#3ee6d8] text-xs font-plate uppercase tracking-wider text-[#eef1f4]"
              >
                Retour à la liste
              </button>
            ) : (
              <button
                type="button"
                onClick={startAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] text-xs font-plate font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter un article</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB: EDIT OR ADD FORM */}
        {activeTab !== 'list' ? (
          <form onSubmit={handleSaveForm} className="py-6 space-y-6">
            <div className="flex items-center gap-2 text-sm font-plate text-[#3ee6d8] uppercase tracking-wider">
              {activeTab === 'edit' ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{activeTab === 'edit' ? `Modifier "${formName}"` : 'Créer un nouvel article / Duo / Accessoire'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Nom du produit / Duo *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Microfibre Séchage XXL 1200 GSM, Pack Duo..."
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Code / Référence unique *
                </label>
                <input
                  type="text"
                  required
                  disabled={activeTab === 'edit'}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="MF1200, DUO-01, PIN-01..."
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Prix de vente TTC (€) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="14.95"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Contenance / Format *
                </label>
                <input
                  type="text"
                  required
                  value={formVolume}
                  onChange={(e) => setFormVolume(e.target.value)}
                  placeholder="500 ml, 40x40 cm, Lot de 3, Unité..."
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1 flex items-center justify-between">
                  <span>Badge Promo / Duo (Optionnel)</span>
                  <Percent className="w-3.5 h-3.5 text-[#3ee6d8]" />
                </label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="Ex: PROMO -20%, DUO ESSENTIEL, NOUVEAU"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#3ee6d8] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Catégorie boutique *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
                >
                  <option value="accessoires">Accessoires, Microfibres & Pinceaux</option>
                  <option value="lavage">Lavage & Finition carrosserie</option>
                  <option value="interieur">Habitacle & Plastiques</option>
                  <option value="jantes_pneus">Jantes & Pneus</option>
                  <option value="kits">Kits, Sacoches & Duos</option>
                  <option value="parfums">Parfums d'ambiance</option>
                  <option value="polish_cires">Polish, Cires & Protection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Statut du stock
                </label>
                <select
                  value={formStockStatus}
                  onChange={(e) => setFormStockStatus(e.target.value as Product['stockStatus'])}
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
                >
                  <option value="in_stock">En stock immédiat</option>
                  <option value="low_stock">Stock limité</option>
                  <option value="backorder">Sur commande / Rupture temporaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Quantité disponible
                </label>
                <input
                  type="number"
                  min="0"
                  value={formStockCount}
                  onChange={(e) => setFormStockCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Description courte (résumé d'usage) *
              </label>
              <input
                type="text"
                required
                value={formUsage}
                onChange={(e) => setFormUsage(e.target.value)}
                placeholder="Ex: Microfibre extra-douce 1200 GSM sans couture pour séchage ultra-rapide sans traces"
                className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Description détaillée (Fiche produit complète) *
              </label>
              <textarea
                rows={3}
                required
                value={formDetail}
                onChange={(e) => setFormDetail(e.target.value)}
                placeholder="Présentez les avantages techniques du produit, sa texture, son efficacité et pourquoi le client doit le choisir..."
                className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-sm text-[#eef1f4] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-2 flex items-center justify-between">
                <span>Photo du produit</span>
                <span className="text-[11px] text-[#3ee6d8]">Glissez une photo ou collez une URL</span>
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#151a22] border border-[#232a35]">
                <div className="w-24 h-24 rounded-xl bg-[#10141b] border border-[#232a35] p-2 flex items-center justify-center shrink-0 overflow-hidden">
                  {formImage ? (
                    <img src={formImage} alt="Aperçu" className="w-full h-full object-contain" />
                  ) : (
                    <Camera className="w-8 h-8 text-[#8b949e]" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="URL de l'image (https://...) ou importer ci-dessous"
                    className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232a35] hover:bg-[#3ee6d8] text-[#eef1f4] hover:text-[#0a0d12] text-xs font-plate uppercase tracking-wider transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Choisir une photo locale</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232a35]">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 rounded-xl bg-[#151a22] border border-[#232a35] hover:border-white/40 text-xs font-plate uppercase tracking-wider text-[#8b949e]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] text-xs font-plate font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{activeTab === 'edit' ? 'Enregistrer les modifications' : 'Mettre en ligne l\'article'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, code ou catégorie..."
                className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#eef1f4] outline-none"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#8b949e]" />
            </div>

            <div className="space-y-2.5">
              {filteredProducts.map((p) => {
                const isHidden = hiddenProductIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                      isHidden
                        ? 'bg-[#12161f]/40 border-[#232a35]/40 opacity-60'
                        : 'bg-[#151a22] border-[#232a35] hover:border-[#3ee6d8]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#10141b] border border-[#232a35] p-1 flex items-center justify-center shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-plate text-sm text-[#eef1f4] truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10141b] text-[#3ee6d8] border border-[#232a35]">
                            {p.code}
                          </span>
                          {p.badge && (
                            <span className="text-[10px] font-plate uppercase px-2 py-0.5 rounded bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-black">
                              {p.badge}
                            </span>
                          )}
                          {isHidden && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              Masqué (Non visible client)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#8b949e] flex items-center gap-3 mt-1 font-mono">
                          <span className="text-[#3ee6d8] font-bold">
                            {p.price.toFixed(2).replace('.', ',')} €
                          </span>
                          <span>•</span>
                          <span>{p.volume}</span>
                          <span>•</span>
                          <span className="capitalize">{p.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        title="Modifier le nom, prix, badge, photo ou texte"
                        className="px-3 py-1.5 rounded-xl bg-[#10141b] border border-[#232a35] hover:border-[#3ee6d8] text-xs text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          onToggleHideProduct(p.id);
                        }}
                        title={isHidden ? 'Mettre en ligne sur le site' : 'Masquer temporairement'}
                        className={`p-2 rounded-xl border text-xs flex items-center transition-colors ${
                          isHidden
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-[#10141b] border-[#232a35] text-[#8b949e] hover:text-[#3ddc97]'
                        }`}
                      >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {p.id.startsWith('ART-') || p.id.startsWith('P-') ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            onDeleteProduct(p.id);
                          }}
                          title="Supprimer définitivement cet article"
                          className="p-2 rounded-xl bg-[#10141b] border border-[#232a35] text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#232a35] flex items-center justify-between text-xs text-[#8b949e]">
              <span>{products.length} articles au catalogue ({products.length - hiddenProductIds.length} visibles)</span>
              <button
                type="button"
                onClick={onResetCatalog}
                className="hover:text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser le catalogue d'origine</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
