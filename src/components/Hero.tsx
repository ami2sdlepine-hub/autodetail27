import React from 'react';
import { Product } from '../data/products';
import { ShieldCheck, Truck, Sparkles, ArrowRight, CheckCircle2, Camera } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface HeroProps {
  bestSeller: Product;
  onScrollToCatalog: () => void;
  onOpenBestSeller: () => void;
  onOpenPhotos?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  bestSeller,
  onScrollToCatalog,
  onOpenBestSeller,
  onOpenPhotos,
}) => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Background Foam Bubbles Rising Slowly */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { size: 14, left: '8%', delay: '0s', dur: '11s' },
          { size: 24, left: '22%', delay: '3s', dur: '14s' },
          { size: 10, left: '42%', delay: '1.5s', dur: '9s' },
          { size: 30, left: '65%', delay: '4.5s', dur: '16s' },
          { size: 18, left: '82%', delay: '2s', dur: '12s' },
          { size: 12, left: '94%', delay: '5s', dur: '10s' },
        ].map((bubble, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              bottom: '-30px',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(62,230,216,0.2) 60%, rgba(123,97,255,0.3) 100%)',
              boxShadow: 'inset 0 0 4px rgba(255,255,255,0.5), 0 0 10px rgba(62,230,216,0.25)',
              animation: `bubble-rise ${bubble.dur} ease-in infinite`,
              animationDelay: bubble.delay,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column: Copy & Proofs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gamme professionnelle de detailing automobile</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-plate text-4xl sm:text-6xl lg:text-7xl text-[#eef1f4] leading-[0.98] tracking-tight mb-6">
            Ta voiture mérite mieux{' '}
            <span className="nacre-text block sm:inline">
              qu'un lavage de station.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#8b949e] max-w-xl mb-8 leading-relaxed">
            Des produits professionnels conçus pour nettoyer, rénover et faire briller votre véhicule sans l'abîmer et sans laisser de traces.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
            <button
              onClick={() => {
                soundManager.playClick();
                onScrollToCatalog();
              }}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#3ee6d8] via-[#5ce1e6] to-[#7b61ff] text-[#0a0d12] font-plate text-sm font-black uppercase tracking-wider shadow-xl shadow-[#3ee6d8]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Découvrir la gamme</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                const el = document.getElementById('pack');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#151a22] hover:bg-[#1a212b] border border-[#232a35] hover:border-[#3ee6d8]/40 text-[#eef1f4] font-plate text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Le pack complet rénovation</span>
            </button>
          </div>

          {/* Reassurance Micro-Proofs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full border-t border-[#232a35] pt-6">
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <CheckCircle2 className="w-4 h-4 text-[#3ddc97] flex-shrink-0" />
              <span>Atelier : retrait sur RDV uniquement (27)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <ShieldCheck className="w-4 h-4 text-[#3ee6d8] flex-shrink-0" />
              <span>Port offert dès 100 €</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <Truck className="w-4 h-4 text-[#7b61ff] flex-shrink-0" />
              <span>Expédié sous 48 h</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real Bottle Visual with Rotating Conic Halo & Light Pedestal */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-square flex items-center justify-center">
            {/* Rotating Conic Halo */}
            <div
              className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, #3ee6d8 0deg, #7b61ff 120deg, #3ee6d8 240deg, #7b61ff 360deg)',
                filter: 'blur(50px)',
                animation: 'spin-slow 15s linear infinite',
              }}
            />

            {/* Glowing Luminous Pedestal at bottom */}
            <div className="absolute bottom-6 w-3/4 h-12 bg-gradient-to-r from-transparent via-[#3ee6d8]/40 to-transparent rounded-full filter blur-xl transform scale-x-125" />
            <div className="absolute bottom-8 w-2/3 h-6 bg-[#3ee6d8]/30 rounded-full filter blur-md" />

            {/* Bottle Card Display with gentle floating */}
            <div
              className="relative z-10 w-72 sm:w-80 aspect-[3/4] rounded-3xl p-6 img-visu border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between cursor-pointer group"
              style={{ animation: 'float-gentle 5s ease-in-out infinite' }}
              onClick={onOpenBestSeller}
              role="button"
              tabIndex={0}
              aria-label={`Découvrir le ${bestSeller.name} Bulbee`}
            >
              {/* Badge best-seller */}
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-plate tracking-wider text-black bg-gradient-to-r from-[#3ee6d8] to-[#99f6e4] shadow-md uppercase font-bold">
                  {bestSeller.badge || `Best-Seller #${bestSeller.refNumber}`}
                </span>
                <span className="text-xs font-mono text-slate-800 font-bold bg-white/80 px-2 py-0.5 rounded">
                  {bestSeller.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € TTC
                </span>
              </div>

              {/* Dynamic Bottle Photo (reflects real user upload) */}
              <div className="w-full flex-1 flex items-center justify-center p-2 relative">
                <img
                  src={bestSeller.image}
                  alt={`${bestSeller.name} ${bestSeller.volume}`}
                  className="max-h-56 sm:max-h-64 object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />

                {onOpenPhotos && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPhotos();
                    }}
                    title="Changer la photo réelle"
                    className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-black/60 hover:bg-black text-[#3ee6d8] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px]"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photo</span>
                  </button>
                )}
              </div>

              {/* Bottom Card Info */}
              <div className="w-full text-center">
                <div className="text-slate-900 font-plate text-lg leading-tight">
                  {bestSeller.name}
                </div>
                <div className="text-slate-600 text-xs font-mono mt-0.5">
                  {bestSeller.volume} • Formulation active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
