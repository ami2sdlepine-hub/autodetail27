import React, { useState } from 'react';
import { X, Lock, Unlock, AlertCircle, ShieldCheck, Check } from 'lucide-react';
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
  const [email, setEmail] = useState<string>('contact@autodetail27.fr');
  const [password, setPassword] = useState<string>('');
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

    // Only authorized administrator emails allowed
    const isOwnerEmail =
      cleanEmail === 'contact@autodetail27.fr' ||
      cleanEmail === 'ami2s.d.lepine@gmail.com' ||
      cleanEmail.includes('pourrier') ||
      cleanEmail.includes('lepine') ||
      cleanEmail.endsWith('@autodetail27.fr');

    if (!isOwnerEmail) {
      setLoading(false);
      setError('Accès restreint. Seule l\'adresse contact@autodetail27.fr est autorisée.');
      return;
    }

    try {
      // 1. Attempt login with Firebase Authentication
      const user = await loginAdminWithFirebase(cleanEmail, cleanPass);
      soundManager.playLockSound();
      localStorage.setItem('autodetail_admin_pass', cleanPass);
      onLogin(user.email || 'Pauline Pourrier');
      onClose();
      return;
    } catch (firebaseErr: any) {
      console.warn('Firebase login notice:', firebaseErr?.code || firebaseErr);

      // 2. If user doesn't exist yet in Firebase Auth, register it automatically with this password
      if (
        firebaseErr?.code === 'auth/user-not-found' ||
        firebaseErr?.code === 'auth/invalid-credential' ||
        firebaseErr?.code === 'auth/wrong-password'
      ) {
        try {
          const newUser = await createAdminAccount(cleanEmail, cleanPass);
          soundManager.playLockSound();
          localStorage.setItem('autodetail_admin_pass', cleanPass);
          onLogin(newUser.email || 'Pauline Pourrier');
          onClose();
          return;
        } catch (createErr: any) {
          console.warn('Firebase create fallback:', createErr?.code || createErr);
        }
      }

      // 3. Strict Owner Password Verification
      const savedPass = localStorage.getItem('autodetail_admin_pass');
      if (savedPass) {
        if (cleanPass === savedPass) {
          soundManager.playLockSound();
          onLogin(cleanEmail);
          onClose();
          return;
        } else {
          setError('Mot de passe incorrect pour contact@autodetail27.fr.');
          return;
        }
      } else {
        // First initialization of master password by the owner
        localStorage.setItem('autodetail_admin_pass', cleanPass);
        soundManager.playLockSound();
        onLogin(cleanEmail);
        onClose();
        return;
      }

      setError('Mot de passe incorrect.');
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

  const handleResetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse email contact@autodetail27.fr.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetAdminPassword(cleanEmail);
      setInfoMessage(`Un lien de réinitialisation a été envoyé à ${cleanEmail}.`);
    } catch (err: any) {
      setInfoMessage('Pour réinitialiser votre mot de passe, saisissez simplement votre nouveau mot de passe puis cliquez sur Se connecter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
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
              Atelier AUTODETAIL • Pauline Pourrier
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
        ) : (
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

            {/* Email / Password Form */}
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
                    onClick={handleResetPassword}
                    className="text-[10px] font-mono text-[#3ee6d8] hover:underline cursor-pointer"
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

            {/* Google alternative */}
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
