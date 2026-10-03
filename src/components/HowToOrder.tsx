import React from 'react';
import { ShoppingBag, CreditCard, PackageCheck, MapPin } from 'lucide-react';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Sélectionnez vos flacons',
      desc: 'Composez votre panier parmi les 17 références professionnelles ou choisissez le kit complet avec sacoche brodée.',
      icon: ShoppingBag,
    },
    {
      num: '02',
      title: 'Paiement sécurisé SumUp',
      desc: 'Réglez en toute sérénité en ligne par carte bancaire avec la passerelle française sécurisée SumUp.',
      icon: CreditCard,
    },
    {
      num: '03',
      title: 'Livraison 48 h ou Retrait atelier',
      desc: 'Colis ultra-protégé expédié sous 48 h ouvrées ou retrait gratuit en main propre à Heubécourt-Haricourt (27, sur RDV).',
      icon: PackageCheck,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          Comment commander chez <span className="nacre-text">AUTODETAIL</span> ?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#8b949e] max-w-lg mx-auto">
          Un processus simple, transparent et sécurisé du panier jusqu'à la prise en main de vos flacons.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-[#10141b] border border-[#232a35] hover:border-[#3ee6d8]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] text-[#3ee6d8] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-plate text-3xl text-[#232a35]">
                    {st.num}
                  </span>
                </div>

                <h3 className="font-plate text-xl text-[#eef1f4] mb-3">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
