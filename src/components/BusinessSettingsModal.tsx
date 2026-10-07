import React, { useState } from 'react';
import { X, Building2, Save, CreditCard, ShieldCheck, Phone, Mail, MapPin, Check, ExternalLink } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export interface BusinessSettings {
  siret: string;
  legalStatus: string;
  ownerName: string;
  brandName: string;
  address: string;
  phone: string;
  email: string;
}

interface BusinessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSave: (newSettings: BusinessSettings) => void;
  onApplyStocks?: (
    stocks: { [productCode: string]: number },
    arrivages?: { [productCode: string]: number },
    couts?: { [productCode: string]: number }
  ) => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [siret, setSiret] = useState<string>(settings.siret || '88914433300024');
  const [legalStatus, setLegalStatus] = useState<string>(
    settings.legalStatus || 'Micro-entreprise (Entreprise Individuelle)'
  );
  const [ownerName, setOwnerName] = useState<string>(settings.ownerName || 'Pauline Pourrier');
  const [brandName, setBrandName] = useState<string>(settings.brandName || 'AUTODETAIL');
  const [address, setAddress] = useState<string>(
    settings.address || '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt'
  );
  const [phone, setPhone] = useState<string>(settings.phone || '06 73 09 60 24');
  const [email, setEmail] = useState<string>(settings.email || 'contact@autodetail27.fr');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playCashRegister();

    const updated: BusinessSettings = {
      siret: siret.trim(),
      legalStatus: legalStatus.trim(),
      ownerName: ownerName.trim(),
      brandName: brandName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
    };

    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
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
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              Paramètres Entreprise
            </h3>
            <p className="text-xs text-[#8b949e]">
              Coordonnées officielles, mentions légales et contact public
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-[#3ddc97]/15 border border-[#3ddc97]/40 text-[#3ddc97] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Paramètres enregistrés et appliqués avec succès !</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Mentions Légales & SIRET */}
          <div className="space-y-4">
            <div className="text-xs font-plate uppercase text-[#8b949e] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3ee6d8]" />
              <span>Identité de l'entreprise</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Numéro SIRET (14 chiffres) :
                </label>
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="88914433300024"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Forme juridique :
                </label>
                <input
                  type="text"
                  value={legalStatus}
                  onChange={(e) => setLegalStatus(e.target.value)}
                  placeholder="Micro-entreprise (EI)"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Gérante / Responsable :
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Pauline Pourrier"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Nom commercial :
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="AUTODETAIL"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Atelier Details */}
          <div className="space-y-4">
            <div className="text-xs font-plate uppercase text-[#8b949e] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3ee6d8]" />
              <span>Atelier & Coordonnées publiques</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Adresse de l'atelier :
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="8 Rue Saint Gilles, 27630 Heubécourt-Haricourt"
                className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Téléphone de contact (SMS) :
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 73 09 60 24"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Email officiel de contact :
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@autodetail27.fr"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#232a35] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#151a22] hover:bg-[#1f2633] border border-[#232a35] text-xs font-plate uppercase tracking-wider text-[#8b949e] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#3ee6d8]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les coordonnées</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
