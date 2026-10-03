import React from 'react';
import { ShoppingCart, ShieldCheck, MapPin, Tag, Camera, Package, Lock, Unlock, Play } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenPrices: () => void;
  onOpenPhotos: () => void;
  onOpenCatalog: () => void;
  onReplayIntro: () => void;
  cartPopping: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  isAdmin,
  onOpenAdmin,
  onOpenPrices,
  onOpenPhotos,
  onOpenCatalog,
  onReplayIntro,
  cartPopping,
}) => {
  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-[#10141b] border-b border-[#232a35] text-[11px] sm:text-xs text-[#8b949e] py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
        <span>
          Retrait gratuit en main propre à <strong className="text-[#eef1f4]">Heubécourt-Haricourt (27630, sur RDV)</strong> ou expédition soignée 48 h partout en France
        </span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#0a0d12]/90 backdrop-blur-xl border-b border-[#232a35] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#151a22] border border-[#232a35] flex items-center justify-center shadow-lg group">
              <span className="font-plate text-lg sm:text-xl text-[#3ee6d8] group-hover:scale-110 transition-transform">
                AD
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-plate text-xl sm:text-2xl text-[#eef1f4] tracking-tight">
                  AUTO<span className="nacre-text">DETAIL</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-[#151a22] text-[#3ee6d8] border border-[#232a35] px-2 py-0.5 rounded-full font-bold">
                  Bulbee Pro
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#8b949e] tracking-wider uppercase font-semibold">
                Gamme Officielle d'Esthétique Automobile
              </p>
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Intro Replay Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onReplayIntro();
              }}
              title="Revoir la vidéo d'introduction cinématographique"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151a22] border border-[#232a35] text-xs text-[#8b949e] hover:text-[#3ee6d8] hover:border-[#3ee6d8]/50 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Intro</span>
            </button>

            {/* Admin Management Tools (Unlocked) */}
            {isAdmin && (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={onOpenCatalog}
                  title="Gestionnaire du Catalogue (Ajouter / Modifier / Masquer)"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#151a22] border border-[#3ee6d8]/40 hover:border-[#3ee6d8] text-xs text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Articles</span>
                </button>
                <button
                  onClick={onOpenPhotos}
                  title="Gestionnaire de Photos Réelles (Glisser-Déposer)"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#151a22] border border-[#3ee6d8]/40 hover:border-[#3ee6d8] text-xs text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Photos</span>
                </button>
                <button
                  onClick={onOpenPrices}
                  title="Gestionnaire de Tarifs et Frais de Port"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#151a22] border border-[#3ee6d8]/40 hover:border-[#3ee6d8] text-xs text-[#3ee6d8] flex items-center gap-1.5 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prix & Port</span>
                </button>
              </div>
            )}

            {/* Admin PIN Unlock Status Icon */}
            <button
              onClick={onOpenAdmin}
              title={isAdmin ? 'Session Admin Active (Cliquer pour verrouiller)' : 'Espace Administrateur'}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                isAdmin
                  ? 'bg-[#3ee6d8]/10 border-[#3ee6d8] text-[#3ee6d8]'
                  : 'bg-[#151a22] border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] hover:border-white/20'
              }`}
            >
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => {
                soundManager.playClick();
                onOpenCart();
              }}
              className={`relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate text-xs font-black uppercase tracking-wider shadow-lg shadow-[#3ee6d8]/20 transition-all hover:brightness-110 active:scale-95 ${
                cartPopping ? 'animate-cart-pop' : ''
              }`}
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span>Panier</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0a0d12] text-[#3ee6d8] text-[11px] font-mono font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
