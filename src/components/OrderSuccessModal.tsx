import React from 'react';
import { CheckCircle2, Package, Truck, MapPin, Mail, Phone, ArrowLeft, ShieldCheck, Copy, Check } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export interface OrderItem {
  code: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  orderRef: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  carrierName?: string;
  deliveryMode?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod?: string;
  items: OrderItem[];
  createdAt?: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderRef: string;
  orderDetails?: OrderDetails | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderRef,
  orderDetails,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundManager.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(orderRef).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReturn = () => {
    soundManager.playClick();
    onClose();
  };

  const isPickup =
    orderDetails?.deliveryMode?.toLowerCase().includes('retrait') ||
    orderDetails?.carrierName?.toLowerCase().includes('retrait');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Badge */}
        <div className="text-center pb-6 border-b border-[#232a35]">
          <div className="w-16 h-16 rounded-full bg-[#3ee6d8]/10 border border-[#3ee6d8]/30 flex items-center justify-center mx-auto mb-4 text-[#3ee6d8] shadow-[0_0_25px_rgba(62,230,216,0.3)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-[11px] font-mono text-[#3ee6d8] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isPickup || orderDetails?.paymentMethod === 'onsite_pickup'
              ? 'Réservation confirmée (Règlement sur place)'
              : 'Paiement validé par Stripe'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-plate text-[#eef1f4] tracking-tight">
            Merci pour votre commande !
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-1 max-w-md mx-auto">
            {isPickup || orderDetails?.paymentMethod === 'onsite_pickup'
              ? 'Votre commande a bien été réservée. Le règlement s\'effectuera sur place lors du retrait à l\'atelier.'
              : 'Votre règlement a été confirmé avec succès. Votre colis est pris en charge par notre atelier.'}
          </p>

          {/* Reference Pill */}
          <div className="mt-4 inline-flex items-center gap-2 bg-[#151a22] border border-[#232a35] px-4 py-2 rounded-xl text-xs sm:text-sm font-mono">
            <span className="text-[#8b949e]">RÉFÉRENCE :</span>
            <span className="text-[#3ee6d8] font-bold">{orderRef}</span>
            <button
              onClick={handleCopy}
              className="ml-1 p-1 hover:text-[#3ee6d8] transition-colors"
              title="Copier la référence"
              aria-label="Copier la référence"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6 flex-1">
          {/* Status Alert Box */}
          <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-start gap-3">
            <Package className="w-5 h-5 text-[#3ee6d8] flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-semibold text-[#eef1f4]">
                {isPickup ? 'Préparation pour retrait atelier (Normandie 27)' : 'Préparation & Expédition sous 48h ouvrées'}
              </p>
              <p className="text-[#8b949e] leading-relaxed">
                {isPickup
                  ? 'Pauline vous contactera par SMS / téléphone dès que vos flacons sont prêts pour convenir de votre créneau de passage à l\'atelier.'
                  : 'Vos flacons sont emballés avec calage renforcé anti-chocs. Vous recevrez le numéro de suivi par email.'}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          {orderDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0c0f15] border border-[#232a35] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5 text-[#3ee6d8]" />
                  Mode de livraison
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#eef1f4]">
                  {orderDetails.carrierName || orderDetails.deliveryMode || 'Colissimo Domicile 48h'}
                </p>
                {orderDetails.shippingAddress && (
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    {orderDetails.shippingAddress}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0f15] border border-[#232a35] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-[#3ee6d8]" />
                  Destinataire
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#eef1f4]">
                  {orderDetails.customerName || 'Client AUTODETAIL'}
                </p>
                {orderDetails.customerEmail && (
                  <p className="text-xs text-[#8b949e] truncate">{orderDetails.customerEmail}</p>
                )}
                {orderDetails.customerPhone && (
                  <p className="text-xs text-[#8b949e]">{orderDetails.customerPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Purchased Items List */}
          {orderDetails?.items && orderDetails.items.length > 0 && (
            <div className="rounded-2xl bg-[#0c0f15] border border-[#232a35] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#232a35] bg-[#131821] text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex justify-between">
                <span>Articles commandés ({orderDetails.items.reduce((s, it) => s + it.quantity, 0)})</span>
                <span>Total</span>
              </div>
              <div className="divide-y divide-[#232a35]/60 max-h-48 overflow-y-auto">
                {orderDetails.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                    <div className="pr-3">
                      <span className="font-medium text-[#eef1f4]">{it.name}</span>
                      <span className="text-[#8b949e] ml-2 font-mono">× {it.quantity}</span>
                    </div>
                    <span className="font-mono text-[#eef1f4] font-semibold whitespace-nowrap">
                      {(it.price * it.quantity).toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Recap Footer */}
              <div className="p-4 bg-[#131821] border-t border-[#232a35] space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#8b949e]">
                  <span>Sous-total articles</span>
                  <span className="font-mono">{orderDetails.subtotal.toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between text-[#8b949e]">
                  <span>Frais d'expédition</span>
                  <span className="font-mono">
                    {orderDetails.shippingCost === 0 ? 'Offerts (0,00 €)' : `${orderDetails.shippingCost.toFixed(2).replace('.', ',')} €`}
                  </span>
                </div>
                <div className="flex justify-between text-[#eef1f4] font-bold text-base pt-2 border-t border-[#232a35]">
                  <span>{isPickup || orderDetails.paymentMethod === 'onsite_pickup' ? 'À régler sur place au retrait :' : 'Total payé TTC :'}</span>
                  <span className="font-mono text-[#3ee6d8]">
                    {orderDetails.total.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Need help / contact banner */}
          <div className="p-4 rounded-2xl bg-[#151a22]/60 border border-[#232a35] flex items-center justify-between gap-4 text-xs text-[#8b949e]">
            <div>
              <span className="text-[#eef1f4] font-medium block">Une question sur votre commande ?</span>
              <span>Atelier AUTODETAIL • contact@autodetail27.fr</span>
            </div>
            <a
              href="tel:0614064448"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232a35] hover:bg-[#3ee6d8] hover:text-[#0a0d12] text-[#eef1f4] font-mono transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              06 14 06 44 48
            </a>
          </div>
        </div>

        {/* Action Button: Return to shop (Only client closes) */}
        <div className="pt-4 border-t border-[#232a35]">
          <button
            onClick={handleReturn}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] hover:opacity-95 text-[#0a0d12] font-plate font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(62,230,216,0.3)] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la boutique
          </button>
        </div>
      </div>
    </div>
  );
};
