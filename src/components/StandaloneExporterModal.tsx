import React, { useState } from 'react';
import { X, Download, Copy, Check, Globe, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface StandaloneExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneExporterModal: React.FC<StandaloneExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyInstructions = () => {
    soundManager.playClick();
    const instructions = `GUIDE DE MISE EN LIGNE AUTODETAIL27.FR :
1. Connectez-vous à votre registrar OVHcloud / hébergeur.
2. Pour lier votre nom de domaine autodetail27.fr, pointez vos enregistrements DNS (Type A et CNAME) vers votre serveur ou déposez les fichiers statiques de /dist sur votre hébergement FTP.
3. Si vous utilisez WordPress, vous pouvez utiliser ce site React soit comme page d'atterrissage principale (index.html à la racine), soit via une redirection de sous-domaine comme boutique.autodetail27.fr.`;

    navigator.clipboard.writeText(instructions).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              Exporter le site pour mon hébergeur
            </h3>
            <p className="text-xs text-[#8b949e]">
              Configuration pour votre nom de domaine et intégration
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3 text-xs leading-relaxed text-[#8b949e]">
          <p className="text-[#eef1f4] font-semibold">
            Comment connecter votre nom de domaine avec votre boutique :
          </p>
          <ul className="list-disc pl-4 space-y-2">
            <li>
              <strong>Nom de domaine personnalisé :</strong> Vous avez créé votre domaine ou configuré votre boîte Gmail professionnelle.
            </li>
            <li>
              <strong>Dossier de production :</strong> Lorsque le projet est compilé (<code className="text-[#3ee6d8]">npm run build</code>), tous les fichiers sont générés dans le dossier <code className="text-[#3ee6d8]">/dist</code> prêts à être déposés sur n'importe quel hébergeur (OVH, Vercel, Netlify, Apache/Nginx).
            </li>
            <li>
              <strong>Liaison WordPress :</strong> Vous pouvez intégrer la boutique sous forme de sous-domaine (ex: <code className="text-[#3ee6d8]">shop.autodetail27.fr</code>) ou déposer directement les fichiers HTML/JS de la boutique à la racine.
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#232a35]">
          <button
            type="button"
            onClick={handleCopyInstructions}
            className="px-4 py-2.5 rounded-xl bg-[#151a22] hover:bg-[#232a35] border border-[#232a35] text-xs font-plate uppercase tracking-wider text-[#eef1f4] flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#3ddc97]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Instructions copiées !' : 'Copier le mémo'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] text-xs font-plate font-black uppercase tracking-wider transition-all"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};
