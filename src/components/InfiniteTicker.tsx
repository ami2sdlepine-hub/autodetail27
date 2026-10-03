import React from 'react';
import { Sparkles, ShieldCheck, Droplets, CheckCircle, Flame, Star } from 'lucide-react';

export const InfiniteTicker: React.FC = () => {
  const items = [
    { text: 'FORMULATIONS HAUTE CONCENTRATION', icon: Flame },
    { text: 'EFFET DÉPERLANT SIO2 IMMÉDIAT', icon: Droplets },
    { text: 'EXPÉDITION SOIGNÉE 48H PARTOUT EN FRANCE', icon: ShieldCheck },
    { text: 'FINI SATINÉ NON GRAS & SANS REFLET', icon: Sparkles },
    { text: 'REMISE EN MAIN PROPRE À HEUBÉCOURT-HARICOURT (27)', icon: CheckCircle },
    { text: 'PORT OFFERT DÈS 39 € TTC', icon: Star },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-[#10141b] border-y border-[#232a35] py-3 group">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...items, ...items, ...items].map((it, idx) => {
          const Icon = it.icon;
          return (
            <div key={idx} className="flex items-center gap-2.5 mx-6 select-none">
              <Icon className="w-3.5 h-3.5 text-[#3ee6d8]" />
              <span className="font-plate text-xs text-[#8b949e] tracking-widest uppercase">
                {it.text}
              </span>
              <span className="text-[#232a35] ml-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
