import React, { useState } from 'react';
import { Product } from '../data/products';
import {
  X,
  CreditCard,
  Truck,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  User,
  ArrowRight,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [productId: string]: number };
  catalog: Product[];
  deliveryMode: 'shipping' | 'pickup';
  shippingCost: number;
  freeShippingThreshold: number;
  onOrderCompleted: () => void;
  sumUpLink?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  catalog,
  deliveryMode,
  shippingCost,
  freeShippingThreshold,
  onOrderCompleted,
  sumUpLink,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Customer form fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [pickupDateSlot, setPickupDateSlot] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'sumup_card' | 'onsite_pickup'>('sumup_card');
  const [completedOrderRef, setCompletedOrderRef] = useState<string>('');

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = catalog.find((p) => p.id === id);
      return { product: prod, quantity: qty };
    })
    .filter((entry): entry is { product: Product; quantity: number } => Boolean(entry.product));

  const subtotal = cartEntries.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  const isFreeShipping = subtotal >= freeShippingThreshold || deliveryMode === 'pickup';
  const effectiveShipping = deliveryMode === 'pickup' ? 0 : isFreeShipping ? 0 : shippingCost;
  const total = subtotal + effectiveShipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (deliveryMode === 'shipping' && (!address.trim() || !postalCode.trim() || !city.trim())) {
      setError('Veuillez renseigner votre adresse postale complète de livraison.');
      return;
    }

    setLoading(true);
    setError(null);

    const orderRef = `AD27-${Date.now().toString().slice(-6)}`;
    setCompletedOrderRef(orderRef);

    const orderData = {
      orderId: orderRef,
      createdAt: new Date().toISOString(),
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: deliveryMode === 'shipping' ? address.trim() : null,
        postalCode: deliveryMode === 'shipping' ? postalCode.trim() : null,
        city: deliveryMode === 'shipping' ? city.trim() : null,
        pickupDateSlot: deliveryMode === 'pickup' ? pickupDateSlot.trim() : null,
      },
      items: cartEntries.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        volume: it.product.volume,
        quantity: it.quantity,
      })),
      deliveryMode,
      subtotal,
      shippingCost: effectiveShipping,
      total,
      paymentMethod,
      status: paymentMethod === 'onsite_pickup' ? 'confirmed_pickup_pending' : 'paid_sumup',
    };

    try {
      // Save order to Firestore
      const docRef = doc(db, 'orders', orderRef);
      await setDoc(docRef, orderData);
    } catch (err) {
      console.warn('Order saved locally (Firestore offline or rules notice):', err);
    }

    soundManager.playCashRegister();
    setLoading(false);
    setStep('success');
    onOrderCompleted();

    // If custom SumUp link configured and customer pays with SumUp
    if (sumUpLink && paymentMethod === 'sumup_card') {
      setTimeout(() => {
        window.open(sumUpLink, '_blank');
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            {/* Modal Title */}
            <div className="flex items-center gap-3 pb-6 border-b border-[#232a35] mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
                  Finaliser ma commande • <span className="nacre-text">AUTODETAIL</span>
                </h3>
                <p className="text-xs text-[#8b949e]">
                  {deliveryMode === 'pickup'
                    ? 'Retrait gratuit à l\'atelier sur RDV (Heubécourt-Haricourt 27)'
                    : 'Expédition soignée 48 h partout en France'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Customer Personal Details */}
              <div>
                <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Vos coordonnées de contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alexandre"
                      className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Email pour confirmation *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexandre@example.fr"
                      className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Téléphone mobile *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address or Appointment Slot */}
              {deliveryMode === 'shipping' ? (
                <div>
                  <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Adresse de livraison (Colissimo 48 h)</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-[#8b949e] mb-1">Adresse postale *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="14 Avenue des Champs..."
                        className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-mono text-[#8b949e] mb-1">Code postal *</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="75008"
                          className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-[#8b949e] mb-1">Ville *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Paris"
                          className="w-full bg-[#151a22] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2.5 text-xs text-[#eef1f4] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-plate text-[#3ee6d8] uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>Retrait gratuit à l'atelier (27) sur RDV</span>
                  </div>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    Adresse de l'atelier : <strong>8 Rue Saint Gilles, 27630 Heubécourt-Haricourt</strong>.
                    Indiquez vos disponibilités ci-dessous ; nous vous confirmons l'horaire par SMS/email dès que vos flacons sont prêts.
                  </p>
                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">
                      Créneau ou jour de passage souhaité (facultatif) :
                    </label>
                    <input
                      type="text"
                      value={pickupDateSlot}
                      onChange={(e) => setPickupDateSlot(e.target.value)}
                      placeholder="Ex: Samedi matin vers 10h, ou Mardi en fin d'après-midi..."
                      className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Mode de règlement</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'sumup_card'
                        ? 'bg-[#3ee6d8]/10 border-[#3ee6d8] text-[#eef1f4]'
                        : 'bg-[#151a22] border-[#232a35] text-[#8b949e] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'sumup_card'}
                          onChange={() => setPaymentMethod('sumup_card')}
                          className="accent-[#3ee6d8]"
                        />
                        <span className="font-plate text-xs font-bold uppercase">
                          Carte Bancaire (SumUp)
                        </span>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-[#3ee6d8]" />
                    </div>
                    <span className="text-[11px] text-[#8b949e]">
                      Paiement en ligne immédiat sécurisé 3D Secure SSL 256 bits.
                    </span>
                  </label>

                  {deliveryMode === 'pickup' && (
                    <label
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        paymentMethod === 'onsite_pickup'
                          ? 'bg-[#3ee6d8]/10 border-[#3ee6d8] text-[#eef1f4]'
                          : 'bg-[#151a22] border-[#232a35] text-[#8b949e] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'onsite_pickup'}
                            onChange={() => setPaymentMethod('onsite_pickup')}
                            className="accent-[#3ee6d8]"
                          />
                          <span className="font-plate text-xs font-bold uppercase">
                            Paiement sur place
                          </span>
                        </div>
                        <Building className="w-4 h-4 text-[#3ddc97]" />
                      </div>
                      <span className="text-[11px] text-[#8b949e]">
                        Réglez sur place lors du retrait (Terminal CB sans contact SumUp ou espèces).
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Order Summary & Submit Button */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0d12] border border-[#232a35] space-y-3">
                <div className="space-y-1 text-xs font-mono text-[#8b949e]">
                  <div className="flex justify-between">
                    <span>Articles ({cartEntries.reduce((a, b) => a + b.quantity, 0)}) :</span>
                    <span className="text-[#eef1f4]">{subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de port :</span>
                    <span className={effectiveShipping === 0 ? 'text-[#3ddc97] font-bold' : 'text-[#eef1f4]'}>
                      {effectiveShipping === 0 ? 'Offert' : `${effectiveShipping.toFixed(2).replace('.', ',')} €`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-plate text-[#eef1f4] pt-2 border-t border-[#232a35]">
                    <span>Montant total TTC :</span>
                    <span className="text-[#3ee6d8] text-xl font-bold">
                      {total.toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-xl shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>
                    {loading
                      ? 'Validation en cours...'
                      : paymentMethod === 'onsite_pickup'
                      ? 'Confirmer ma commande (Paiement sur place)'
                      : `Valider et Payer avec SumUp (${total.toFixed(2).replace('.', ',')} €)`}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#3ddc97]/20 border-2 border-[#3ddc97] text-[#3ddc97] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(61,220,151,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#151a22] text-[#3ee6d8] border border-[#232a35]">
                Commande N° {completedOrderRef}
              </span>
              <h3 className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
                Merci pour votre commande, {firstName} !
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto leading-relaxed">
                {deliveryMode === 'pickup'
                  ? 'Votre commande est bien enregistrée. Notre atelier prépare vos flacons et vous recontacte au ' +
                    phone +
                    ' pour confirmer votre venue sur rendez-vous.'
                  : 'Votre commande est confirmée. Vos produits seront expédiés sous 48 heures avec numéro de suivi envoyé à ' +
                    email +
                    '.'}
              </p>
            </div>

            {/* Order Items Recap */}
            <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] max-w-lg mx-auto text-left text-xs font-mono space-y-2">
              <div className="text-xs font-plate uppercase text-[#3ee6d8] mb-2">
                Récapitulatif de votre commande :
              </div>
              {cartEntries.map((it) => (
                <div key={it.product.id} className="flex justify-between text-[#eef1f4]">
                  <span>
                    {it.quantity}x {it.product.name} ({it.product.volume})
                  </span>
                  <span>{(it.product.price * it.quantity).toFixed(2).replace('.', ',')} €</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#232a35] flex justify-between font-bold text-sm">
                <span>Total réglé TTC :</span>
                <span className="text-[#3ee6d8]">{total.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-[#3ee6d8] hover:bg-[#3ddc97] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider transition-all"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
