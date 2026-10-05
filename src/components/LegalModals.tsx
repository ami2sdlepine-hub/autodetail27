import React from 'react';
import { X, ShieldCheck, FileText, Lock, Truck } from 'lucide-react';
import { LegalModalType } from './Footer';
import { BusinessSettings } from './BusinessSettingsModal';

interface LegalModalsProps {
  type: LegalModalType;
  onClose: () => void;
  businessSettings?: BusinessSettings;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ type, onClose, businessSettings }) => {
  if (!type) return null;

  const brand = businessSettings?.brandName || 'AUTODETAIL';
  const owner = businessSettings?.ownerName || 'Alexandre DE LEPINE';
  const address = businessSettings?.address || '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt, France';
  const email = businessSettings?.email || 'contact@autodetail27.fr';
  const legal = businessSettings?.legalStatus || 'Micro-entreprise (Entreprise Individuelle)';
  const siret = `SIRET : ${businessSettings?.siret || '88914433300024'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'mentions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ee6d8]">
              <FileText className="w-5 h-5" />
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">Mentions Légales</h3>
            </div>
            <div className="text-xs sm:text-sm text-[#8b949e] space-y-3 leading-relaxed">
              <p>
                <strong>Éditeur du site :</strong> {brand} — {legal}.
              </p>
              <p>
                <strong>Siège social / Atelier :</strong> {address}.
              </p>
              <p>
                <strong>Responsable de la publication :</strong> {owner} ({email}).
              </p>
              <p>
                <strong>Identifiant légal & fiscal :</strong> {siret}. TVA non applicable, art. 293 B du CGI.
              </p>
              <p>
                <strong>Hébergement :</strong> Google Cloud Platform (Région Europe-West).
              </p>
            </div>
          </div>
        )}

        {type === 'cgv' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ee6d8]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">Conditions Générales de Vente (CGV)</h3>
            </div>
            <div className="text-xs sm:text-sm text-[#8b949e] space-y-3 leading-relaxed">
              <p>
                <strong>Article 1 — Champ d'application :</strong> Les présentes CGV s'appliquent à toutes les ventes conclues sur la boutique en ligne AUTODETAIL portant sur la gamme de produits d'entretien automobile Bulbee.
              </p>
              <p>
                <strong>Article 2 — Prix et TVA :</strong> Les prix sont indiqués en Euros TTC. Conformément à l'article 293 B du CGI, la TVA n'est pas applicable. Les frais de livraison sont offerts dès 100,00 € TTC d'achats (ou 4,95 € pour les paniers inférieurs).
              </p>
              <p>
                <strong>Article 3 — Commande et Paiement :</strong> Le règlement s'effectue en ligne par carte bancaire (CB, Visa, Mastercard, Apple Pay, Google Pay) via la passerelle de paiement sécurisée Stripe. La commande est validée après confirmation de l'autorisation bancaire.
              </p>
              <p>
                <strong>Article 4 — Droit de rétractation :</strong> Conformément à l'article L. 221-18 du Code de la consommation, le client dispose d'un délai de 14 jours francs pour exercer son droit de rétractation à compter de la réception de la marchandise, sous réserve que les flacons soient intacts, scellés et non ouverts.
              </p>
            </div>
          </div>
        )}

        {type === 'confidentialite' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ee6d8]">
              <Lock className="w-5 h-5" />
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">Politique de Confidentialité</h3>
            </div>
            <div className="text-xs sm:text-sm text-[#8b949e] space-y-3 leading-relaxed">
              <p>
                AUTODETAIL accorde la plus haute importance à la protection de vos données personnelles. Les données collectées (nom, adresse postale, email, téléphone) sont strictement réservées au traitement de votre commande et à son acheminement.
              </p>
              <p>
                Aucune donnée n'est revendue ou cédée à des tiers. Les coordonnées de carte bancaire sont traitées directement de manière chiffrée par la passerelle agréée Stripe (avec certification PCI-DSS niveau 1) sans jamais transiter par nos serveurs.
              </p>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en écrivant à contact@autodetail27.fr.
              </p>
            </div>
          </div>
        )}

        {type === 'livraison' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#3ee6d8]">
              <Truck className="w-5 h-5" />
              <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">Livraisons & Retrait Atelier</h3>
            </div>
            <div className="text-xs sm:text-sm text-[#8b949e] space-y-3 leading-relaxed">
              <p>
                <strong>Expédition 48h Colissimo / Relais :</strong> Les colis sont expédiés sous 48 heures ouvrées avec emballage renforcé anti-choc et protections étanches spéciales flacons liquides.
              </p>
              <p>
                <strong>Frais de port :</strong> 4,95 € pour les commandes inférieures à 100 €. <strong>GRATUIT (0 €)</strong> dès 100,00 € TTC de commande.
              </p>
              <p>
                <strong>Retrait à l'atelier (27) :</strong> Retrait gratuit à l'atelier AUTODETAIL (8 Rue Saint Gilles, 27630 Heubécourt-Haricourt) exclusivement sur rendez-vous après confirmation de préparation de commande.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
