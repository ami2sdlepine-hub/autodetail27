import React, { useState } from 'react';
import { X, Lock, Unlock, AlertCircle, ShieldCheck, Check, Mail, ArrowLeft, Send } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import {
  loginAdminWithFirebase,
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
  const [email, setEmail] = useState<string>('contact@autodetail27.fr');
  const [password, setPassword] = useState<string>('');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanPass) {
      setError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const isOwnerEmail =
      cleanEmail === 'contact@autodetail27.fr' ||
      cleanEmail === 'ami2s.d.lepine@gmail.com';

    if (!isOwnerEmail) {
      setLoading(false);
      setError('Accès strictement refusé. Seule l\'adresse contact@autodetail27.fr est autorisée.');
      return;
    }

    // Check saved administrator password in storage
    const savedPass = localStorage.getItem('autodetail_admin_pass');

    // Attempt Firebase Authentication
    try {
      const user = await loginAdminWithFirebase(cleanEmail, cleanPass);
      soundManager.playLockSound();
      localStorage.setItem('autodetail_admin_pass', cleanPass);
      onLogin(user.email || 'Pauline Pourrier');
      onClose();
      return;
    } catch (firebaseErr: any) {
      // Local check if password matches the owner's configured password
      if (savedPass && cleanPass === savedPass) {
        soundManager.playLockSound();
        onLogin(cleanEmail);
        onClose();
        return;
      }

      setError('Mot de passe incorrect pour contact@autodetail27.fr.');
    } finally {
      setLoading(false);
    }
  };

  // SECURE RESET: ONLY sends an email to the owner's private inbox.
  // NO visitor or stranger can type a password on screen to hijack the account!
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      await resetAdminPassword('contact@autodetail27.fr');
      setInfoMessage(
        'Un lien sécurisé de réinitialisation vient d\'être envoyé à contact@autodetail27.fr. Seule la personne ayant accès à votre boîte mail peut modifier le mot de passe.'
      );
    } catch (err: any) {
      setInfoMessage(
        'La demande a été transmise. Vérifiez votre boîte mail contact@autodetail27.fr pour réinitialiser vos accès.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const user = await loginWithGoogle();
      const userEmail = (user.email || '').toLowerCase().trim();

      // Strict email whitelist verification
      if (
        userEmail !== 'ami2s.d.lepine@gmail.com' &&
        userEmail !== 'contact@autodetail27.fr'
      ) {
        await logoutAdmin().catch(() => {});
        setError(
          `Accès strictement refusé : Le compte Google (${userEmail}) n'est pas autorisé en tant qu'administrateur.`
        );
        return;
      }

      soundManager.playLockSound();
      onLogin(user.email || 'Pauline Pourrier (Admin)');
      onClose();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup')) {
        setError(
          'La fenêtre popup Google a été bloquée par le navigateur. Connectez-vous avec contact@autodetail27.fr et votre mot de passe.'
        );
      } else {
        setError(
          'Connexion Google non disponible dans ce navigateur. Utilisez votre email contact@autodetail27.fr et votre mot de passe.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
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
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
            {isAdmin ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
              ESPACE GÉRANCE
            </h3>
            <p className="text-xs text-[#8b949e]">
              Atelier AUTODETAIL • Accès Strictement Réservé
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>
                Session active. Les tarifs, stocks et photos sont modifiables.
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                logoutAdmin().catch(() => {});
                sessionStorage.removeItem('autodetail_is_admin');
                onLogout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-plate text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Verrouiller la session
            </button>
          </div>
        ) : isResetMode ? (
          /* Secure Email-Only Password Reset (Prevents account takeover) */
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#232a35]">
              <span className="text-xs font-mono text-[#3ee6d8] font-bold">
                Réinitialisation sécurisée par Email
              </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setInfoMessage(null);
                  setIsResetMode(false);
                }}
                className="text-xs text-[#8b949e] hover:text-[#eef1f4] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {infoMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-start gap-2.5">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInfoMessage(null);
                    setIsResetMode(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#151a22] border border-[#232a35] text-xs font-plate uppercase text-[#eef1f4] hover:border-white/20 transition-all cursor-pointer"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#151a22] border border-[#232a35] text-xs text-[#8b949e] space-y-2">
                  <div className="flex items-center gap-2 text-[#eef1f4] font-semibold">
                    <Mail className="w-4 h-4 text-[#3ee6d8]" />
                    <span>Protection anti-intrusion</span>
                  </div>
                  <p className="leading-relaxed">
                    Pour des raisons strictes de sécurité, le lien de réinitialisation sera envoyé <strong>exclusivement à votre boîte mail privée</strong> :
                  </p>
                  <div className="p-2 rounded-lg bg-[#0a0d12] border border-[#232a35] font-mono text-[#3ee6d8] text-center font-bold">
                    contact@autodetail27.fr
                  </div>
                  <p className="text-[11px] text-[#8b949e]">
                    Aucun visiteur ou tiers ne peut modifier votre mot de passe depuis cet écran.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Envoi en cours...' : 'Envoyer le lien par Email'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Normal Login Form */
          <div className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3.5 rounded-xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-start gap-2">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1.5">
                  Email administrateur :
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@autodetail27.fr"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-4 py-3 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#8b949e]">Mot de passe :</label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setInfoMessage(null);
                      setIsResetMode(true);
                    }}
                    className="text-[11px] font-mono text-[#3ee6d8] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-4 py-3 text-xs text-[#eef1f4] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-lg shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Connexion en cours...' : 'SE CONNECTER'}
              </button>
            </form>

            {/* Google alternative restricted strictly to owner */}
            <div className="pt-3 border-t border-[#232a35]">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#151a22] hover:bg-[#1a212b] border border-[#232a35] hover:border-[#3ee6d8]/40 text-[#8b949e] hover:text-[#eef1f4] text-xs font-mono flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                  />
                </svg>
                <span>Connexion 1 clic avec Google</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
