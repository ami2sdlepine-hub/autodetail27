import React from 'react';
import { MapPin, Mail, Phone, Lock, Unlock, Download, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export type LegalModalType = 'mentions' | 'cgv' | 'confidentialite' | 'livraison' | null;

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
  onOpenExport: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenExport,
  onOpenAdmin,
  isAdmin,
}) => {
  return (
    <footer className="bg-[#0a0d12] border-t border-[#232a35] pt-16 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Atelier */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#151a22] border border-[#232a35] flex items-center justify-center font-plate text-[#3ee6d8]">
              AD
            </div>
            <span className="font-plate text-2xl text-[#eef1f4]">
              AUTO<span className="nacre-text">DETAIL</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#8b949e] max-w-md leading-relaxed mb-4">
            Boutique officielle de produits d'entretien et detailing automobile Bulbee. Préparations de commandes soignées et expédition en 48 h.
          </p>

          <div className="space-y-1.5 text-xs text-[#8b949e] font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>8 Rue Saint Gilles, 27630 Heubécourt-Haricourt (Sur RDV)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>contact@autodetail.fr</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>Micro-entreprise • SIRET en cours d'immatriculation</span>
            </div>
          </div>
        </div>

        {/* Col 2: Infos Légales */}
        <div>
          <h4 className="font-plate text-xs text-[#eef1f4] uppercase tracking-wider mb-4">
            Informations Légales
          </h4>
          <ul className="space-y-2.5 text-xs text-[#8b949e]">
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('mentions')}
                className="hover:text-[#3ee6d8] transition-colors"
              >
                Mentions Légales & SIRET
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('cgv')}
                className="hover:text-[#3ee6d8] transition-colors"
              >
                Conditions Générales de Vente (CGV)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('confidentialite')}
                className="hover:text-[#3ee6d8] transition-colors"
              >
                Politique de Confidentialité
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('livraison')}
                className="hover:text-[#3ee6d8] transition-colors"
              >
                Livraisons, Délais & Retraits (27)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Outils & Accès Pro */}
        <div>
          <h4 className="font-plate text-xs text-[#eef1f4] uppercase tracking-wider mb-4">
            Outils & Espace
          </h4>
          <ul className="space-y-2.5 text-xs text-[#8b949e]">
            <li>
              <button
                type="button"
                onClick={onOpenExport}
                className="hover:text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#7b61ff]" />
                <span>Exporter le site pour mon hébergeur</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hover:text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
              >
                {isAdmin ? (
                  <Unlock className="w-3.5 h-3.5 text-[#3ddc97]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#8b949e]" />
                )}
                <span>{isAdmin ? 'Session Admin (Déverrouillée)' : 'Accès Pro Atelier (PIN)'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#232a35] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
        <div>
          © {new Date().getFullYear()} AUTODETAIL — Tous droits réservés.
        </div>
        <div className="font-mono text-[11px] text-[#8b949e]">
          TVA non applicable, art. 293 B du CGI • Gamme Bulbee Automobile
        </div>
      </div>
    </footer>
  );
};
