import React, { useState } from 'react';
import { X, Building2, Save, CreditCard, ShieldCheck, Phone, Mail, MapPin, Check, ExternalLink, RefreshCw, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import {
  getAppsScriptUrl,
  setAppsScriptUrl,
  getAppsScriptSecret,
  setAppsScriptSecret,
  fetchStockFromAppsScript,
  verifyAppsScriptSecret,
  StockSyncResult,
} from '../services/appsScriptSync';

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
    arrivages?: { [productCode: string]: number }
  ) => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onApplyStocks,
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
  const [phone, setPhone] = useState<string>(settings.phone || '');
  const [email, setEmail] = useState<string>(settings.email || 'contact@autodetail27.fr');

  // Google Apps Script state
  const [appsScriptUrl, setAppsScriptUrlState] = useState<string>(getAppsScriptUrl());
  const [appsScriptSecret, setAppsScriptSecretState] = useState<string>(getAppsScriptSecret());
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<StockSyncResult | null>(null);

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

    setAppsScriptUrl(appsScriptUrl);
    setAppsScriptSecret(appsScriptSecret);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestAppsScript = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    soundManager.playClick();

    // Étape 1 : Vérification stricte du jeton SECRET auprès du script (doPost)
    const secretCheck = await verifyAppsScriptSecret(appsScriptSecret, appsScriptUrl);
    if (!secretCheck.valid) {
      setSyncLoading(false);
      setSyncResult({
        success: false,
        message: secretCheck.message,
      });
      return;
    }

    // Étape 2 : Récupération des stocks et arrivages réels (doGet)
    const res = await fetchStockFromAppsScript(appsScriptUrl);
    setSyncLoading(false);

    if (res.success) {
      soundManager.playCashRegister();
      setSyncResult({
        ...res,
        message: `✓ Jeton secret validé ! ${res.message}`,
      });
      if (res.stocks && onApplyStocks) {
        onApplyStocks(res.stocks, res.arrivages);
      }
    } else {
      setSyncResult(res);
    }
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
              Paramètres Entreprise & Connexions
            </h3>
            <p className="text-xs text-[#8b949e]">
              Coordonnées de l'entreprise et synchronisation Google Sheets / Apps Script
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
          {/* Section 1: Google Sheets / Apps Script Integration */}
          <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-plate uppercase text-[#3ee6d8]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Synchronisation Google Sheets (Stock en Direct)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3ee6d8]/10 text-[#3ee6d8] border border-[#3ee6d8]/30">
                Temps Réel
              </span>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed">
              Connectez votre projet Google Apps Script pour synchroniser automatiquement les quantités en stock avec votre tableau Google Sheets.
            </p>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                URL du Webhook Apps Script :
              </label>
              <input
                type="url"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrlState(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1 flex items-center justify-between">
                <span>Jeton SECRET de sécurité API (anti-spam) :</span>
                <span className="text-[10px] text-[#3ee6d8]">Configuré dans votre script</span>
              </label>
              <input
                type="text"
                value={appsScriptSecret}
                onChange={(e) => setAppsScriptSecretState(e.target.value)}
                placeholder="CHANGE-MOI-lp-autodetail-2026"
                className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestAppsScript}
                disabled={syncLoading}
                className="px-4 py-2 rounded-xl bg-[#1b2533] hover:bg-[#233145] border border-[#3ee6d8]/40 hover:border-[#3ee6d8] text-[#3ee6d8] text-xs font-plate uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                <span>{syncLoading ? 'Connexion en cours...' : 'Tester & Synchroniser le stock'}</span>
              </button>
            </div>

            {/* Sync Test Result Feedback */}
            {syncResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                  syncResult.success
                    ? 'bg-[#3ddc97]/10 border-[#3ddc97]/40 text-[#3ddc97]'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {syncResult.success ? (
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="leading-snug font-medium">{syncResult.message}</p>
                  {!syncResult.success && (
                    <div className="text-[11px] text-[#8b949e] pt-1 space-y-1">
                      <p className="text-white font-semibold">Comment activer l'accès public dans Google :</p>
                      <p>1. Ouvrez votre script dans Google Apps Script.</p>
                      <p>2. Cliquez en haut à droite sur <strong>Déployer</strong> &gt; <strong>Gérer les déploiements</strong>.</p>
                      <p>3. Cliquez sur le crayon (Modifier), et dans <strong>« Qui a accès »</strong>, choisissez <strong>« Tout le monde » (Anyone)</strong>.</p>
                      <p>4. Validez en cliquant sur <strong>Déployer</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mentions Légales & SIRET */}
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
                  maxLength={17}
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="Ex: 921 456 789 00012"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Statut juridique :
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

          {/* Section 4: Contact & Atelier Details */}
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
                  Téléphone de contact :
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 XX XX XX XX"
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
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Enregistrer les informations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
