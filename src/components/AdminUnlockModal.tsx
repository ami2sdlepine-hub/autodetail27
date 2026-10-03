import React, { useState } from 'react';
import { X, Lock, Unlock, KeyRound, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { loginAdminWithFirebase, logoutAdmin } from '../services/firebaseService';

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
  const [pin, setPin] = useState<string>('');
  const [email, setEmail] = useState<string>('ami2s.d.lepine@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [mode, setMode] = useState<'pin' | 'firebase'>('pin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2727' || pin === '0000') {
      soundManager.playLockSound();
      onLogin('Atelier Pro 27');
      setError(null);
      setPin('');
      onClose();
    } else {
      setError('Code PIN incorrect (Indice : département 2727)');
    }
  };

  const handleFirebaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginAdminWithFirebase(email, password);
      soundManager.playLockSound();
      onLogin(user.email || 'Admin Cloud');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Identifiants Firebase invalides');
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
              Espace Administrateur
            </h3>
            <p className="text-xs text-[#8b949e]">
              Gestion du catalogue, photos et prix en direct
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#3ddc97]/10 border border-[#3ddc97]/30 text-[#3ddc97] text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>Session d'administration active. Vous avez accès à tous les boutons d'édition.</span>
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
              Verrouiller l'accès administrateur
            </button>
          </div>
        ) : (
          <div>
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#151a22] border border-[#232a35] rounded-xl text-xs font-plate mb-6">
              <button
                type="button"
                onClick={() => setMode('pin')}
                className={`py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'pin' ? 'bg-[#3ee6d8] text-[#0a0d12] font-black' : 'text-[#8b949e]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Code PIN Rapide</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('firebase')}
                className={`py-2 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'firebase' ? 'bg-[#3ee6d8] text-[#0a0d12] font-black' : 'text-[#8b949e]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Compte Cloud</span>
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">
                    Entrez votre code PIN (4 chiffres) :
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-[#eef1f4] outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#8b949e] mt-1.5 text-center">
                    Indice : Code atelier par défaut <strong className="text-[#3ee6d8]">2727</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider transition-all"
                >
                  Déverrouiller
                </button>
              </form>
            ) : (
              <form onSubmit={handleFirebaseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">Email :</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8b949e] mb-1">Mot de passe :</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? 'Connexion Cloud...' : 'Se connecter au Cloud'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
