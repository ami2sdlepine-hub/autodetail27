import React from 'react';
import { Sparkles, ShieldCheck, Droplets, CheckCircle, Flame, Star } from 'lucide-react';

export const InfiniteTicker: React.FC = () => {
  const items = [
    { text: 'FORMULATIONS HAUTE CONCENTRATION', icon: Flame },
    { text: 'ÉGALEMENT UTILISÉ EN CONCESSIONS VOLKSWAGEN & BMW', icon: ShieldCheck },
    { text: 'EFFET DÉPERLANT SIO2 IMMÉDIAT', icon: Droplets },
    { text: 'EXPÉDITION SOIGNÉE 48H PARTOUT EN FRANCE', icon: ShieldCheck },
    { text: 'FINI SATINÉ NON GRAS & SANS REFLET', icon: Sparkles },
    { text: "RETRAIT À L'ATELIER SUR RDV (HEUBÉCOURT-HARICOURT 27)", icon: CheckCircle },
    { text: 'PORT OFFERT DÈS 100 € TTC', icon: Star },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-[#10141b] border-y border-[#232a35] py-3.5 group select-none">
      <div className="animate-marquee">
        {[...items, ...items].map((it, idx) => {
          const Icon = it.icon;
          return (
            <div key={idx} className="flex items-center gap-2.5 mx-7 flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#3ee6d8] flex-shrink-0" />
              <span className="font-plate text-xs text-[#8b949e] tracking-widest uppercase">
                {it.text}
              </span>
              <span className="text-[#232a35] ml-5">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
