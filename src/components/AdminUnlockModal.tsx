import React, { useState } from 'react';
import { X, Lock, Unlock, Mail, AlertCircle, ShieldCheck, Check, KeyRound, UserPlus } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import {
  loginAdminWithFirebase,
  createAdminAccount,
  loginWithGoogle,
  resetAdminPassword,
  logoutAdmin,
} from '../services/firebaseService';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (identifier?: string) => void;
  onLogout: () => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
}) => {
  // Empty by default: visitors cannot see the owner's private email
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const user = await loginWithGoogle();
      soundManager.playLockSound();
      onLogin(user.email || 'Compte Google Admin');
      onClose();
    } catch (err: any) {
      setError(
        err?.message?.includes('popup-closed')
          ? 'Connexion annulée dans la fenêtre popup.'
          : err?.message || 'Erreur lors de la connexion Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isRegisterMode) {
        // Register/initialize account for contact@autodetail27.fr
        const user = await createAdminAccount(email.trim(), password);
        soundManager.playLockSound();
        onLogin(user.email || 'Administrateur');
        onClose();
      } else {
        // Normal login
        const user = await loginAdminWithFirebase(email.trim(), password);
        soundManager.playLockSound();
        onLogin(user.email || 'Administrateur');
        onClose();
      }
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect pour cette adresse.');
      } else if (err?.code === 'auth/user-not-found') {
        setError('Aucun compte existant avec cette adresse. Cliquez sur "Créer / Définir mon mot de passe" ci-dessous.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setError('Cette adresse est déjà enregistrée. Veuillez saisir votre mot de passe habituel ou le réinitialiser.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Le mot de passe doit comporter au moins 6 caractères.');
      } else {
        setError(err?.message || 'Identifiants invalides');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Veuillez d\'abord saisir votre adresse email pour recevoir le lien de réinitialisation.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetAdminPassword(email.trim());
      setInfoMessage(
        `Un lien sécurisé pour définir votre mot de passe vient d'être envoyé à ${email.trim()}. Vérifiez vos emails.`
      );
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation.');
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-md rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
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
            {isAdmin ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              Espace Atelier & Boutique
            </h3>
            <p className="text-xs text-[#8b949e]">
              Connexion sécurisée Cloud Firestore
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>
                Session active. Les prix, textes et photos réelles sont synchronisés en direct.
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                logoutAdmin().catch(() => {});
                onLogout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-plate text-xs uppercase tracking-wider transition-all"
            >
              Verrouiller la session
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-start gap-2">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{infoMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Adresse email :
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@autodetail27.fr"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-[#8b949e]">Mot de passe :</label>
                  {!isRegisterMode && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[10px] font-mono text-[#3ee6d8] hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading
                  ? 'Vérification...'
                  : isRegisterMode
                  ? 'Créer mon mot de passe et me connecter'
                  : 'Se connecter'}
              </button>
            </form>

            {/* Toggle Register / First time login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setInfoMessage(null);
                  setIsRegisterMode(!isRegisterMode);
                }}
                className="text-xs text-[#8b949e] hover:text-[#3ee6d8] transition-colors underline"
              >
                {isRegisterMode
                  ? '← J\'ai déjà un mot de passe (Se connecter)'
                  : 'Première connexion ? Définir mon mot de passe ici'}
              </button>
            </div>

            {/* Google alternative */}
            <div className="pt-3 border-t border-[#232a35]">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#151a22] hover:bg-[#1a212b] border border-[#232a35] hover:border-white/20 text-[#8b949e] hover:text-[#eef1f4] text-xs font-mono flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Ou connexion via Google Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
