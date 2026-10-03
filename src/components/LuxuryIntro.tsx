import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface LuxuryIntroProps {
  onComplete: () => void;
}

export const LuxuryIntro: React.FC<LuxuryIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0d12] flex items-center justify-center p-6 text-center select-none overflow-hidden cursor-pointer"
      onClick={() => {
        soundManager.playClick();
        onComplete();
      }}
    >
      {/* Background radial spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(62,230,216,0.15)_0,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        {/* Emblem */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-[#10141b] border-2 border-[#3ee6d8]/60 shadow-[0_0_50px_rgba(62,230,216,0.3)] flex items-center justify-center transition-all duration-1000 transform ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <span className="font-plate text-3xl sm:text-4xl text-[#3ee6d8]">
            AD
          </span>
        </div>

        {/* Brand Text */}
        <div
          className={`space-y-2 transition-all duration-1000 delay-200 transform ${
            phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <h1 className="font-plate text-4xl sm:text-6xl text-[#eef1f4] tracking-tight">
            AUTO<span className="nacre-text">DETAIL</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#8b949e]">
            Gamme Officielle d'Esthétique Automobile Bulbee
          </p>
        </div>

        {/* Tagline */}
        <div
          className={`transition-all duration-1000 delay-500 transform ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151a22] border border-[#232a35] text-xs text-[#3ee6d8] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulations professionnelles haute concentration</span>
          </div>
        </div>

        {/* Skip button hint */}
        <div className="pt-8">
          <span className="text-[11px] font-mono text-[#8b949e] hover:text-[#eef1f4] transition-colors underline">
            Cliquer pour accéder à la boutique immédiatement →
          </span>
        </div>
      </div>
    </div>
  );
};
