import React, { useState, useRef } from 'react';
import beforeImg from '../assets/images/car_before_dirty.jpg';
import afterImg from '../assets/images/car_after_clean.jpg';
import { Sparkles, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface BeforeAfterComparatorProps {
  isVisible: boolean;
  isAdmin?: boolean;
  onToggleVisible?: (visible: boolean) => void;
}

export const BeforeAfterComparator: React.FC<BeforeAfterComparatorProps> = ({
  isVisible,
  isAdmin,
  onToggleVisible,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  // If hidden and not admin, do not render at all
  if (!isVisible && !isAdmin) return null;

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative">
      {/* Admin Notice when Hidden */}
      {!isVisible && isAdmin && (
        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-red-400 text-xs sm:text-sm">
            <EyeOff className="w-5 h-5 flex-shrink-0" />
            <span>
              <strong>Section Avant / Après MASQUÉE aux clients</strong> : Les visiteurs ne voient pas ce comparateur.
            </span>
          </div>
          {onToggleVisible && (
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleVisible(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#3ddc97] text-[#0a0d12] text-xs font-plate uppercase tracking-wider font-black hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rendre visible</span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-10 gap-4">
        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Preuve d'efficacité en atelier
          </div>
          <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
            Avant / Après <span className="nacre-text">Traitement Bulbee</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-lg">
            Faites glisser le curseur central pour comparer la carrosserie contaminée et le résultat après polissage & cire de protection.
          </p>
        </div>

        {/* Admin Quick Toggle Button */}
        {isAdmin && onToggleVisible && isVisible && (
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleVisible(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#151a22] hover:bg-red-500/20 border border-[#232a35] hover:border-red-500/40 text-xs font-plate uppercase text-[#8b949e] hover:text-red-400 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Masquer cette section aux visiteurs"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Masquer cette section</span>
          </button>
        )}
      </div>

      {/* Interactive Slider Container */}
      <div
        ref={containerRef}
        onMouseMove={(e) => {
          if (isDragging.current || e.buttons === 1) handleMove(e.clientX);
        }}
        onMouseDown={(e) => {
          isDragging.current = true;
          handleMove(e.clientX);
        }}
        onMouseUp={() => {
          isDragging.current = false;
        }}
        onTouchMove={handleTouchMove}
        className={`relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] rounded-3xl overflow-hidden border border-[#232a35] shadow-2xl cursor-ew-resize select-none ${
          !isVisible ? 'opacity-40 grayscale-[40%]' : ''
        }`}
      >
        {/* After Image (Background) */}
        <img
          src={afterImg}
          alt="Après traitement detailing lustrage Bulbee"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before Image (Clipped Left Layer) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImg}
            alt="Avant traitement carrosserie contaminée"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#3ee6d8] shadow-[0_0_15px_#3ee6d8] pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 2px)` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#10141b] border-2 border-[#3ee6d8] text-[#3ee6d8] flex items-center justify-center shadow-xl">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute bottom-5 left-5 pointer-events-none bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-plate uppercase tracking-wider text-red-400">
          Avant (Contaminé)
        </div>
        <div className="absolute bottom-5 right-5 pointer-events-none bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-plate uppercase tracking-wider text-[#3ddc97]">
          Après (Miroir Bulbee)
        </div>
      </div>
    </section>
  );
};
