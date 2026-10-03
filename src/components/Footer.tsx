import React from 'react';
import { MapPin, Mail, Phone, Lock, Unlock, ShieldCheck, Clock } from 'lucide-react';
import { BusinessSettings } from './BusinessSettingsModal';

export type LegalModalType = 'mentions' | 'cgv' | 'confidentialite' | 'livraison' | null;

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  businessSettings?: BusinessSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenAdmin,
  isAdmin,
  businessSettings,
}) => {
  const siretText = businessSettings?.siret
    ? `SIRET : ${businessSettings.siret}`
    : "Micro-entreprise • SIRET en cours d'immatriculation";

  const addressText =
    businessSettings?.address || '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt';
  const emailText = businessSettings?.email || 'contact@autodetail27.fr';
  const phoneText = businessSettings?.phone;

  return (
    <footer className="bg-[#0a0d12] border-t border-[#232a35] pt-16 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* Col 1: Brand & Atelier */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#151a22] border border-[#232a35] flex items-center justify-center font-plate text-[#3ee6d8]">
              AD
            </div>
            <span className="font-plate text-2xl text-[#eef1f4]">
              AUTO<span className="nacre-text">DETAIL</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#8b949e] max-w-sm leading-relaxed mb-4">
            Boutique officielle de produits d'entretien et esthétique automobile Bulbee. Formulations professionnelles pour préparation showroom.
          </p>

          <div className="space-y-2 text-xs text-[#8b949e] font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>{addressText} (Atelier sur RDV)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>{emailText}</span>
            </div>
            {phoneText && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
                <span>{phoneText}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span>{siretText}</span>
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
                Politique de Confidentialité (RGPD)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('livraison')}
                className="hover:text-[#3ee6d8] transition-colors"
              >
                Livraisons, Délais & Retraits Atelier
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Atelier & Expéditions */}
        <div>
          <h4 className="font-plate text-xs text-[#eef1f4] uppercase tracking-wider mb-4">
            Atelier & Expéditions
          </h4>
          <div className="space-y-3 text-xs text-[#8b949e] leading-relaxed">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#3ee6d8] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#eef1f4] block">Retrait Atelier (27) :</strong>
                Exclusivement sur rendez-vous après confirmation de préparation de commande.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7b61ff] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#eef1f4] block">Expéditions 48h France :</strong>
                Colissimo ou Point Relais avec calages étanches renforcés. Frais de port offerts dès 100 € TTC d'achats.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#232a35] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
        <div>
          © {new Date().getFullYear()} AUTODETAIL — Tous droits réservés.
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-[#8b949e]">
          <span>TVA non applicable, art. 293 B du CGI • Bulbee Automobile</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            title={isAdmin ? 'Session Admin active' : 'Connexion'}
            className="p-1 text-[#8b949e] hover:text-[#3ee6d8] transition-colors"
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5 text-[#3ddc97]" /> : <Lock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </footer>
  );
};
