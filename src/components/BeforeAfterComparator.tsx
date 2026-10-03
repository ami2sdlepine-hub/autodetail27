import React, { useState, useRef } from 'react';
import beforeImg from '../assets/images/car_before_dirty_1790974048331.jpg';
import afterImg from '../assets/images/car_after_clean_1790974060887.jpg';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const BeforeAfterComparator: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

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
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Preuve d'efficacité en atelier
        </div>
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          Avant / Après <span className="nacre-text">Traitement Bulbee</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-lg mx-auto">
          Faites glisser le curseur central pour comparer la carrosserie contaminée et le résultat après polissage & cire de protection.
        </p>
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
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] rounded-3xl overflow-hidden border border-[#232a35] shadow-2xl cursor-ew-resize select-none"
      >
        {/* After Image (Background) */}
        <img
          src={afterImg}
          alt="Après traitement detailing lustrage Bulbee"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImg}
            alt="Avant traitement carrosserie sale"
            className="absolute top-0 left-0 h-full object-cover pointer-events-none max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Vertical Divider Line with handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(62,230,216,0.8)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0a0d12] border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold pointer-events-auto cursor-grab active:cursor-grabbing">
            ↔
          </div>
        </div>

        {/* Badges Left / Right */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#0a0d12]/80 border border-white/20 text-xs font-plate uppercase tracking-wider text-[#eef1f4] backdrop-blur-md">
          Avant (Terne & micro-rayé)
        </div>
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#3ee6d8]/90 text-[#0a0d12] text-xs font-plate uppercase tracking-wider font-bold shadow-md">
          Après (Showroom Bulbee)
        </div>
      </div>
    </section>
  );
};
