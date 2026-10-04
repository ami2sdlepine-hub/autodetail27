import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Quels sont les délais et modalités de livraison ?',
      a: 'Toutes les commandes sont emballées avec des calages spécifiques pour flacons de detailing et expédiées sous 48 heures ouvrées par Colissimo ou Mondial Relay partout en France. Les frais de port sont de 4,95 € et deviennent totalement offerts dès 100,00 € TTC de commande.',
    },
    {
      q: 'Comment fonctionne le retrait gratuit à l\'atelier (27) ?',
      a: 'Le retrait s\'effectue directement à notre atelier situé au 8 Rue Saint Gilles, 27630 Heubécourt-Haricourt, exclusivement sur rendez-vous (RDV convenu ensemble au préalable dès que votre commande est préparée).',
    },
    {
      q: 'Les produits Bulbee sont-ils adaptés à toutes les carrosseries et vernis ?',
      a: 'Oui. Les formulations Bulbee sont conçues avec un pH neutre ou contrôlé et des tensioactifs lubrifiants doux de haute technicité. Elles respectent scrupuleusement les cires naturelles préalablement posées, les traitements céramiques appliqués et tous les vernis modernes même tendres (marques allemandes, japonaises, etc.).',
    },
    {
      q: 'Le paiement en ligne par carte bancaire est-il sécurisé ?',
      a: 'Absolument. Nous utilisons un protocole de paiement ultra-sécurisé avec chiffrement SSL 256 bits et authentification 3D Secure (confirmation via votre application bancaire), ainsi que la prise en charge d\'Apple Pay et Google Pay. Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          Foire aux questions
        </div>
        <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
          Questions <span className="nacre-text">Fréquentes</span>
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#151a22] border-[#3ee6d8]/50 shadow-lg shadow-[#3ee6d8]/5'
                  : 'bg-[#10141b] border-[#232a35] hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setOpenIndex(isOpen ? null : idx);
                }}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
              >
                <span className="font-plate text-base sm:text-lg text-[#eef1f4]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#3ee6d8] flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#8b949e] leading-relaxed border-t border-[#232a35] pt-4 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
