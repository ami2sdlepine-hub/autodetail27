import React, { useState, useRef, useEffect } from 'react';
import { CATALOG, Product } from '../data/products';
import { X, Upload, Camera, Check, RefreshCw, AlertCircle, ImageIcon } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { compressImage } from '../utils/imageCompressor';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  customPhotos: { [productId: string]: string };
  onUpdatePhotos: (photos: { [productId: string]: string }) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  customPhotos,
  onUpdatePhotos,
}) => {
  const productList = products && products.length > 0 ? products : CATALOG;
  const [photos, setPhotos] = useState<{ [productId: string]: string }>(customPhotos);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(customPhotos);
  }, [customPhotos, isOpen]);

  if (!isOpen) return null;

  const detectProductId = (fileName: string): string | null => {
    const lower = fileName.toLowerCase().replace(/[-_\s]/g, '');
    if (lower.includes('multiclean') || lower.includes('multiwash')) return 'MC500';
    if (lower.includes('blueglass')) return 'BG500';
    if (lower.includes('easyplast')) return 'EP500';
    if (lower.includes('wheelreact')) return 'WR500';
    if (lower.includes('tireshine')) return 'TS150';

    if (
      lower.includes('sacochenue') ||
      lower.includes('sacochebulbeenue') ||
      lower.includes('sacocheseule') ||
      lower.includes('sacochevide')
    ) return 'SBN';

    if (
      lower.includes('pack') ||
      lower.includes('kitcomplet') ||
      lower.includes('sacochebulbee') ||
      lower.includes('sacochekit') ||
      lower.includes('sacochepack') ||
      lower.includes('coffret') ||
      lower.includes('bulbeekit') ||
      lower.includes('kitbulbee')
    ) return 'SB';

    if (lower.includes('kit')) return 'SB';
    if (lower.includes('sacoche')) return 'SBN';

    if (lower.includes('mintfresh')) return 'MF150';
    if (lower.includes('ginfresh')) return 'GF150';
    if (lower.includes('bubblefresh')) return 'BF150';
    if (lower.includes('springfresh')) return 'SF150';
    if (lower.includes('hydrowash')) return 'HW500';
    if (lower.includes('bugcleaner')) return 'BC500';
    if (lower.includes('instantshine')) return 'IS500';
    if (lower.includes('finition') || lower.includes('wax')) return 'WAX500';
    if (lower.includes('hologramme') || lower.includes('correct')) return 'CORRECT500';
    if (lower.includes('abrasif') || lower.includes('cut')) return 'CUT500';
    if (lower.includes('applicateur') || lower.includes('tampon') || lower.includes('art5306') || lower.includes('pneu')) return 'ART-5306';

    // Search by product name in dynamic productList
    const dynamicMatch = productList.find(
      (p) => lower.includes(p.name.toLowerCase().replace(/[-_\s]/g, '')) || lower.includes(p.id.toLowerCase())
    );
    if (dynamicMatch) return dynamicMatch.id;

    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const updated = { ...photos };
    let matchedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const detectedId = detectProductId(file.name);
      if (detectedId) {
        matchedCount++;
        const compressed = await compressImage(file, 900, 900, 0.82);
        if (compressed) {
          updated[detectedId] = compressed;
        }
      }
    }

    if (matchedCount > 0) {
      setPhotos(updated);
      onUpdatePhotos(updated);
      soundManager.playCashRegister();
      setNotification(`${matchedCount} photo(s) reconnue(s), optimisée(s) et synchronisée(s) !`);
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification('Nom de fichier non reconnu. Cliquez sur l\'icône de flacon spécifique ci-dessous.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSingleUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 900, 900, 0.82);
      if (compressed) {
        const updated = { ...photos, [productId]: compressed };
        setPhotos(updated);
        onUpdatePhotos(updated);
        soundManager.playPschitt();
      }
    }
  };

  const handleResetPhotos = () => {
    soundManager.playClick();
    setPhotos({});
    onUpdatePhotos({});
    setNotification('Photos réinitialisées aux visuels officiels par défaut.');
    setTimeout(() => setNotification(null), 2500);
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
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              Gestionnaire de <span className="nacre-text">Photos Réelles</span>
            </h3>
            <p className="text-xs text-[#8b949e]">
              Glissez-déposez vos vraies photos pour remplacer les visuels de la boutique en direct.
            </p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 mb-8 ${
            dragOver
              ? 'border-[#3ee6d8] bg-[#3ee6d8]/10 scale-[1.01]'
              : 'border-[#232a35] bg-[#151a22]/60 hover:border-[#3ee6d8]/60 hover:bg-[#151a22]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 rounded-full bg-[#10141b] border border-[#232a35] text-[#3ee6d8] mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <div className="font-plate text-base text-[#eef1f4] mb-1">
            Glissez vos photos ici ou cliquez pour parcourir
          </div>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">
            Déposez vos fichiers <code className="text-[#3ee6d8]">blue-glass-500ml.jpg</code>, <code className="text-[#3ee6d8]">pack-complet.jpg</code>, <code className="text-[#3ee6d8]">sacoche-nue.jpg</code>, etc. Ils sont détectés automatiquement !
          </p>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-[#3ddc97]/15 border border-[#3ddc97]/40 text-[#3ddc97] text-xs font-semibold mb-6 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-plate uppercase text-[#3ee6d8]">
              État des références catalogue ({productList.length})
            </span>
            <button
              onClick={handleResetPhotos}
              className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[44vh] overflow-y-auto pr-1">
            {productList.map((product) => {
              const activeImage = photos[product.id] || product.image;
              const hasCustom = Boolean(photos[product.id]);

              return (
                <div
                  key={product.id}
                  className="p-3 rounded-xl bg-[#151a22] border border-[#232a35] flex items-center justify-between gap-3"
                >
                  <div className="w-12 h-12 rounded-lg img-visu p-1 border border-[#232a35] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-plate text-xs text-[#eef1f4] truncate">
                      {product.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#8b949e]">
                      {product.code} • #{product.refNumber}
                    </div>
                    {hasCustom ? (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold text-[#3ddc97] bg-[#3ddc97]/15">
                        Photo réelle active
                      </span>
                    ) : (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] text-[#8b949e]">
                        Photo officielle
                      </span>
                    )}
                  </div>

                  <label className="cursor-pointer p-1.5 rounded-lg bg-[#232a35] hover:bg-[#323b4b] text-[#eef1f4] text-xs">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSingleUpload(product.id, e)}
                    />
                    <Upload className="w-3.5 h-3.5" />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
