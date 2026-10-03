import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Product } from '../data/products';
import { X, QrCode, Download, Sparkles, Droplets, CheckCircle, ShieldAlert, ExternalLink, Printer } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface QRCodeGuideModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QRCodeGuideModal: React.FC<QRCodeGuideModalProps> = ({ product, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!product) return;

    // Direct link to the guide url on mobile or online applet
    const guideUrl = `${window.location.origin}/#guide-${product.id}`;

    QRCode.toDataURL(guideUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0a0d12',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [product]);

  if (!product) return null;

  const handleDownloadQR = () => {
    soundManager.playCashRegister();
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-guide-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

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
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#232a35]">
          <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#3ee6d8] uppercase">
                Guide d'Application Officiel
              </span>
              <span className="text-[#8b949e] text-xs">• Réf: {product.id}</span>
            </div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              {product.name} ({product.volume})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#151a22] border border-[#232a35] text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code Guide ${product.name}`}
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-black font-mono">
                  Génération du QR Code...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-plate uppercase text-[#eef1f4] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3ee6d8]" />
                <span>Scannez avec un smartphone</span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Ouvre instantanément le tutoriel pas-à-pas et la fiche technique atelier
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="px-3.5 py-2 rounded-xl bg-[#10141b] hover:bg-[#1a212c] border border-[#232a35] hover:border-[#3ee6d8] text-xs font-plate uppercase text-[#3ee6d8] flex items-center gap-1.5 transition-all"
                title="Télécharger l'image PNG du QR Code pour imprimer sur vos flacons ou flyers"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger PNG</span>
              </button>
            </div>
          </div>

          {/* Application Instructions & Pro Tips */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-2">
              <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#3ee6d8]" />
                <span>Protocole d'application atelier :</span>
              </h4>
              <p className="text-[#8b949e] leading-relaxed">
                {product.usage ||
                  "Pulvériser directement sur la surface préalablement dépoussiérée ou sur une microfibre adaptée. Étaler uniformément sans excès."}
              </p>
            </div>

            {product.conseils && product.conseils.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-2">
                <h4 className="font-plate text-xs text-[#b485ff] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#b485ff]" />
                  <span>Protocole d'application pas-à-pas :</span>
                </h4>
                <div className="space-y-1.5 text-[#8b949e]">
                  {product.conseils.map((conseil, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#3ee6d8]/20 text-[#3ee6d8] flex items-center justify-center font-mono font-bold flex-shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{conseil}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-[#3ee6d8]/10 border border-[#3ee6d8]/30 text-[#eef1f4] space-y-1">
              <span className="font-plate text-[11px] text-[#3ee6d8] uppercase block">
                Astuce Pro Atelier (AUTODETAIL) :
              </span>
              <p className="text-[11px] text-[#8b949e] leading-snug">
                Toujours travailler à l'ombre sur une carrosserie froide pour éviter le séchage prématuré et garantir un résultat miroir sans trace.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-[#232a35] flex items-center justify-between text-[11px] text-[#8b949e]">
          <span>Gamme Professionnelle Bulbee Automobile</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151a22] hover:bg-[#1a212c] text-xs font-plate uppercase text-[#eef1f4]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
