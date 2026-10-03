import React, { useEffect, useState } from 'react';
import { ArrowRight, X, ShieldCheck, Droplets, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import carShowroomImg from '../assets/images/car_after_clean_1790974060887.jpg';
import hydroWashImg from '../assets/images/bulbee_hydro_wash_real_1790974827509.jpg';
import multiWashImg from '../assets/images/bulbee_multi_wash_real_1790974750104.jpg';

interface LuxuryIntroProps {
  onComplete: () => void;
}

export const LuxuryIntro: React.FC<LuxuryIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#07090d] flex items-center justify-center p-4 sm:p-6 text-center select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Background: Cinematic Showroom Car with Dynamic Laser & Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={carShowroomImg}
          alt="Showroom Automobile Prestige"
          className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-125 scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Deep Dark Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-[#07090d]/80 to-[#07090d]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,#07090d_80%)]" />

        {/* Animated Laser Scanning Line across the car body */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#3ee6d8]/25 to-transparent skew-x-[-20deg] animate-laser"
          />
        </div>

        {/* Floating Ceramic Micro-Droplets */}
        {[
          { size: 10, left: '12%', dur: '7s', delay: '0s' },
          { size: 18, left: '28%', dur: '10s', delay: '1.5s' },
          { size: 8, left: '50%', dur: '6s', delay: '0.5s' },
          { size: 22, left: '72%', dur: '11s', delay: '2s' },
          { size: 12, left: '86%', dur: '8s', delay: '1s' },
        ].map((bubble, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none opacity-40"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              bottom: '-20px',
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(62,230,216,0.3) 60%, rgba(123,97,255,0.4) 100%)',
              boxShadow: '0 0 15px rgba(62,230,216,0.4)',
              animation: `bubble-rise ${bubble.dur} ease-in infinite`,
              animationDelay: bubble.delay,
            }}
          />
        ))}
      </div>

      {/* Top Right Skip Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onComplete();
        }}
        className="absolute top-6 right-6 z-30 px-4 py-2 rounded-xl bg-[#151a22]/90 hover:bg-[#1f2633] border border-[#232a35] hover:border-[#3ee6d8]/60 text-xs font-plate uppercase tracking-wider text-[#8b949e] hover:text-[#eef1f4] transition-all flex items-center gap-2 shadow-2xl backdrop-blur-md"
      >
        <span>Passer</span>
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Floating Real Bulbee Flacons on Left & Right (Desktop & Tablets) */}
      <div
        className={`hidden md:block absolute left-8 lg:left-24 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${
          phase >= 2 ? 'opacity-85 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
      >
        <div
          className="relative w-32 lg:w-44 p-3 rounded-3xl bg-[#10141b]/80 border border-[#232a35] backdrop-blur-md shadow-2xl"
          style={{ animation: 'float-gentle 6s ease-in-out infinite' }}
        >
          <img
            src={hydroWashImg}
            alt="Hydro Wash Bulbee"
            className="w-full h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]"
          />
          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono font-bold text-[#3ee6d8] uppercase">
              Hydro Wash SiO2
            </span>
          </div>
        </div>
      </div>

      <div
        className={`hidden md:block absolute right-8 lg:right-24 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${
          phase >= 2 ? 'opacity-85 translate-x-0' : 'opacity-0 translate-x-12'
        }`}
      >
        <div
          className="relative w-32 lg:w-44 p-3 rounded-3xl bg-[#10141b]/80 border border-[#232a35] backdrop-blur-md shadow-2xl"
          style={{ animation: 'float-gentle 6s ease-in-out infinite', animationDelay: '1.5s' }}
        >
          <img
            src={multiWashImg}
            alt="Multi Clean Bulbee"
            className="w-full h-auto object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]"
          />
          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono font-bold text-[#b485ff] uppercase">
              Multi Clean Pro
            </span>
          </div>
        </div>
      </div>

      {/* Main Central Cinematic Container */}
      <div className="relative z-10 max-w-xl mx-auto space-y-6 sm:space-y-7">
        {/* Animated Central Emblem with Rotating Conic Halo */}
        <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
          {/* Rotating Conic Gradient Halo */}
          <div
            className={`absolute inset-0 rounded-3xl opacity-75 filter blur-lg transition-all duration-1000 ${
              phase >= 1 ? 'scale-125 opacity-90' : 'scale-50 opacity-0'
            }`}
            style={{
              background: 'conic-gradient(from 0deg, #3ee6d8, #7b61ff, #3ee6d8)',
              animation: 'spin-slow 8s linear infinite',
            }}
          />

          <div
            className={`relative z-10 w-full h-full rounded-3xl bg-[#0c1017] border-2 border-[#3ee6d8] shadow-[0_0_50px_rgba(62,230,216,0.5)] flex items-center justify-center transition-all duration-700 transform ${
              phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <span className="font-plate text-3xl sm:text-5xl text-[#3ee6d8] tracking-wider">
              AD
            </span>
          </div>
        </div>

        {/* Brand Headline & Copy */}
        <div
          className={`space-y-3 transition-all duration-700 delay-100 transform ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151a22]/90 border border-[#232a35] text-[11px] font-mono text-[#3ee6d8] uppercase tracking-wider font-semibold shadow-md backdrop-blur-md">
            <Droplets className="w-3.5 h-3.5 text-[#3ee6d8]" />
            <span>Esthétique Automobile de Précision</span>
          </div>

          <h1 className="font-plate text-4xl sm:text-6xl text-[#eef1f4] tracking-tight leading-none drop-shadow-lg">
            AUTO<span className="nacre-text">DETAIL</span>
          </h1>

          <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#8b949e]">
            Gamme Officielle Bulbee Automobile • Normandie (27)
          </p>
        </div>

        {/* Tagline sentence */}
        <div
          className={`transition-all duration-700 delay-200 transform ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-sm sm:text-base text-[#eef1f4]/95 max-w-md mx-auto leading-relaxed drop-shadow">
            Des produits professionnels conçus pour nettoyer, rénover et faire briller votre véhicule sans l'abîmer.
          </p>
        </div>

        {/* Primary CTA Button (Requires click, NO auto-redirect) */}
        <div
          className={`pt-2 transition-all duration-700 delay-300 transform ${
            phase >= 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onComplete();
            }}
            className="group px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#3ee6d8] via-[#5ce1e6] to-[#7b61ff] text-[#0a0d12] font-plate text-sm font-black uppercase tracking-wider shadow-[0_0_40px_rgba(62,230,216,0.55)] hover:shadow-[0_0_60px_rgba(62,230,216,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            <span>Entrer dans la boutique</span>
            <ArrowRight className="w-5 h-5 stroke-[3] group-hover:translate-x-1.5 transition-transform" />
          </button>

          <p className="text-[11px] font-mono text-[#8b949e] mt-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3ddc97]" />
            <span>Retrait à l'atelier sur RDV (27) • Expédition 48 h partout en France</span>
          </p>
        </div>
      </div>
    </div>
  );
};
