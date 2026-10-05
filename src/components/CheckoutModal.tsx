import React, { useState, useEffect } from 'react';
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
  Package,
  Zap,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { calculateParcelWeightKg, calculateCarrierRates, CarrierType } from '../utils/shippingCalculator';
import { pushOrderToAppsScript } from '../services/appsScriptSync';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [productId: string]: number };
  catalog: Product[];
  deliveryCarrier: CarrierType;
  shippingCost: number;
  freeShippingThreshold: number;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  catalog,
  deliveryCarrier,
  shippingCost,
  freeShippingThreshold,
  onOrderCompleted,
}) => {
  const [carrier, setCarrier] = useState<CarrierType>(deliveryCarrier);
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
  const [relayPointPreference, setRelayPointPreference] = useState<string>('');
  const [pickupDateSlot, setPickupDateSlot] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'onsite_pickup'>(
    deliveryCarrier === 'pickup' ? 'onsite_pickup' : 'stripe_card'
  );
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

  const weightKg = calculateParcelWeightKg(cart, catalog);
  const shippingOptions = calculateCarrierRates(weightKg, subtotal, freeShippingThreshold);
  const activeOption = shippingOptions.find((opt) => opt.id === carrier) || shippingOptions[0];
  const effectiveShipping = activeOption.price;
  const total = subtotal + effectiveShipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (carrier !== 'pickup' && (!address.trim() || !postalCode.trim() || !city.trim())) {
      setError('Veuillez renseigner votre adresse postale complète.');
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
        address: carrier !== 'pickup' ? address.trim() : null,
        postalCode: carrier !== 'pickup' ? postalCode.trim() : null,
        city: carrier !== 'pickup' ? city.trim() : null,
        relayPointPreference: carrier === 'mondial_relay' ? relayPointPreference.trim() : null,
        pickupDateSlot: carrier === 'pickup' ? pickupDateSlot.trim() : null,
      },
      items: cartEntries.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        volume: it.product.volume,
        quantity: it.quantity,
      })),
      carrier: {
        id: activeOption.id,
        name: activeOption.name,
        delay: activeOption.delay,
      },
      parcelWeightKg: weightKg,
      subtotal,
      shippingCost: effectiveShipping,
      total,
      paymentMethod,
      status: paymentMethod === 'onsite_pickup' ? 'confirmed_pickup_pending' : 'paid_card',
    };

    // If Stripe chosen, attempt to create Checkout Session with locked amount
    if (paymentMethod === 'stripe_card') {
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartEntries.map((e) => ({
              id: e.product.id,
              code: e.product.code,
              name: e.product.name,
              price: e.product.price,
              quantity: e.quantity,
              refNumber: e.product.refNumber,
            })),
            orderRef,
            customerEmail: email,
            shippingCost: effectiveShipping,
            carrierName: activeOption.name,
            originUrl: window.location.origin,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP_${res.status}`);
        }

        const data = await res.json();
        if (data.url) {
          try {
            const docRef = doc(db, 'orders', orderRef);
            await setDoc(docRef, { ...orderData, status: 'pending_stripe_redirect' });
          } catch (err) {
            console.warn('Order saved locally (Firestore offline notice):', err);
          }

          try {
            localStorage.setItem('autodetail_pending_order_' + orderRef, JSON.stringify(orderData));
            localStorage.setItem('autodetail_last_order', JSON.stringify(orderData));
          } catch {}

          pushOrderToAppsScript({
            customerName: `${firstName} ${lastName}`.trim(),
            customerEmail: email,
            customerPhone: phone,
            deliveryMode: activeOption.name,
            shippingAddress: `${address}, ${postalCode} ${city}${relayPointPreference ? ' (Point Relais : ' + relayPointPreference + ')' : ''}`,
            noteClient: relayPointPreference || '',
            subtotal,
            shippingCost: effectiveShipping,
            total,
            paiement: 'en_ligne',
            items: cartEntries.map((e) => ({
              code: e.product.code || e.product.id,
              name: e.product.name,
              quantity: e.quantity,
              price: e.product.price,
            })),
          }).catch((e) => console.warn('Apps Script sync notice:', e));

          soundManager.playCashRegister();
          onOrderCompleted();
          window.location.href = data.url;
          return;
        }

        if (data.needsConfig) {
          setError(
            'Le paiement par Carte Bancaire en ligne est en cours d\'activation. Aucune somme n\'a été prélevée. Pour finaliser votre commande dès maintenant, veuillez sélectionner « Règlement sur place au retrait » ci-dessus ou contacter Pauline au 06 14 06 44 48.'
          );
          setLoading(false);
          return;
        }

        throw new Error(data.error || 'Erreur lors de la création de la session Stripe');
      } catch (err) {
        console.error('Stripe session creation error:', err);
        setError(
          'Le paiement en ligne par carte bancaire est temporairement indisponible. Aucune somme n\'a été prélevée. Veuillez sélectionner « Règlement sur place au retrait » ci-dessus ou nous contacter au 06 14 06 44 48.'
        );
        setLoading(false);
        return;
      }
    }

    // Only if paymentMethod === 'onsite_pickup' (Retrait Atelier)
    try {
      const docRef = doc(db, 'orders', orderRef);
      await setDoc(docRef, orderData);
    } catch (err) {
      console.warn('Order saved locally (Firestore offline notice):', err);
    }

    try {
      localStorage.setItem('autodetail_last_order', JSON.stringify(orderData));
    } catch {}

    pushOrderToAppsScript({
      customerName: `${firstName} ${lastName}`.trim(),
      customerEmail: email,
      customerPhone: phone,
      deliveryMode: 'Retrait Atelier sur RDV (27)',
      shippingAddress: 'Retrait sur RDV à l\'atelier (Heubécourt-Haricourt 27)',
      noteClient: pickupDateSlot || '',
      subtotal,
      shippingCost: 0,
      total,
      paiement: 'sur_place',
      items: cartEntries.map((e) => ({
        code: e.product.code || e.product.id,
        name: e.product.name,
        quantity: e.quantity,
        price: e.product.price,
      })),
    })
      .then((res) => {
        if (res && res.numero) {
          setCompletedOrderRef(res.numero);
        }
      })
      .catch((err) => {
        console.warn('Apps Script sync notice:', err);
      });

    soundManager.playCashRegister();
    setLoading(false);
    setStep('success');
    onOrderCompleted();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#10141b] border border-[#232a35] p-6 sm:p-8 text-[#eef1f4] shadow-2xl"
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
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#232a35]">
              <div className="w-12 h-12 rounded-2xl bg-[#151a22] border border-[#232a35] flex items-center justify-center text-[#3ee6d8]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-plate text-xl sm:text-2xl text-[#eef1f4]">
                  Finaliser ma commande
                </h3>
                <p className="text-xs text-[#8b949e] flex items-center gap-2 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-[#3ee6d8]" />
                  <span>Colis soigné ({weightKg.toFixed(2).replace('.', ',')} kg) • {activeOption.name}</span>
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
              {/* Carrier Selection */}
              <div>
                <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Mode de livraison sélectionné :</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {shippingOptions.map((opt) => {
                    const isSelected = carrier === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          soundManager.playClick();
                          setCarrier(opt.id);
                          setError(null);
                          if (opt.id === 'pickup') {
                            setPaymentMethod('onsite_pickup');
                          } else if (paymentMethod === 'onsite_pickup') {
                            setPaymentMethod('stripe_card');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#151a22] border-[#3ee6d8] shadow-md shadow-[#3ee6d8]/10'
                            : 'bg-[#10141b] border-[#232a35] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-plate text-xs text-[#eef1f4]">{opt.name}</span>
                          <span className="font-mono text-xs font-bold text-[#3ee6d8]">
                            {opt.isFree || opt.price === 0 ? 'Offert' : `${opt.price.toFixed(2).replace('.', ',')} €`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8b949e] mt-1 leading-snug">{opt.subtitle}</p>
                        <span className="text-[10px] text-[#3ddc97] font-mono mt-1 block">⏱ {opt.delay}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Personal Details */}
              <div>
                <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Vos coordonnées</span>
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
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Email pour le suivi *</label>
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
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Téléphone mobile (SMS suivi) *</label>
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

              {/* Delivery Address or Relais or Workshop Slot */}
              {carrier === 'mondial_relay' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#151a22] border border-[#232a35]">
                  <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Adresse personnelle pour trouver votre Point Relais le plus proche</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Adresse postale *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="14 Rue de la Paix"
                      className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
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
                        className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none font-mono"
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
                        className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">
                      Point Relais ou Locker préféré (facultatif) :
                    </label>
                    <input
                      type="text"
                      value={relayPointPreference}
                      onChange={(e) => setRelayPointPreference(e.target.value)}
                      placeholder="Ex: Locker Station Total, ou Relais Presse Tabac..."
                      className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
                    />
                    <p className="text-[10px] text-[#8b949e] mt-1">
                      Si laissé vide, nous sélectionnons automatiquement le point relais le plus proche de votre code postal.
                    </p>
                  </div>
                </div>
              )}

              {carrier === 'colissimo' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#151a22] border border-[#232a35]">
                  <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Adresse de livraison Colissimo 48 h à domicile</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-mono text-[#8b949e] mb-1">Adresse postale *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="14 Avenue des Champs..."
                      className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
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
                        className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none font-mono"
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
                        className="w-full bg-[#10141b] border border-[#232a35] focus:border-[#3ee6d8] rounded-xl px-3.5 py-2 text-xs text-[#eef1f4] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {carrier === 'pickup' && (
                <div className="p-4 rounded-2xl bg-[#151a22] border border-[#232a35] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-plate text-[#3ee6d8] uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>Retrait gratuit à l'atelier (Heubécourt-Haricourt 27) sur RDV</span>
                  </div>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    Adresse de l'atelier : <strong>8 Rue Saint Gilles, 27630 Heubécourt-Haricourt</strong>.
                    Indiquez vos disponibilités ci-dessous ; nous vous confirmons l'horaire par SMS/email dès que votre commande est prête.
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

              {/* Payment Method Selection */}
              <div>
                <h4 className="font-plate text-xs text-[#3ee6d8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Mode de règlement sécurisé</span>
                </h4>

                <div className="space-y-2.5">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'stripe_card'
                        ? 'bg-[#151a22] border-[#3ee6d8] shadow-lg shadow-[#3ee6d8]/10'
                        : 'bg-[#10141b] border-[#232a35] hover:border-[#3ee6d8]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'stripe_card'}
                      onChange={() => setPaymentMethod('stripe_card')}
                      className="mt-1 accent-[#3ee6d8]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-plate text-[#eef1f4] flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold">Carte Bancaire, Apple Pay & Google Pay</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3ee6d8]/15 text-[#3ee6d8] font-mono font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#3ee6d8]" />
                          100% Sécurisé
                        </span>
                      </div>
                      <p className="text-[#8b949e] mt-1 leading-snug">
                        Paiement sécurisé crypté SSL. Prise en charge des cartes CB, Visa, Mastercard, Apple Pay et Google Pay.
                      </p>
                    </div>
                  </label>

                  {carrier === 'pickup' && (
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'onsite_pickup'
                          ? 'bg-[#151a22] border-[#3ee6d8]'
                          : 'bg-[#10141b] border-[#232a35]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'onsite_pickup'}
                        onChange={() => setPaymentMethod('onsite_pickup')}
                        className="mt-1 accent-[#3ee6d8]"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-plate text-[#eef1f4]">Règlement sur place au retrait</div>
                        <p className="text-[#8b949e] mt-1 leading-snug">
                          Paiement lors de la remise en main propre à l'atelier (CB ou Espèces).
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Order Recap Banner */}
              <div className="p-4 rounded-2xl bg-[#0a0d12] border border-[#232a35] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#8b949e]">
                  <span>Articles ({cartEntries.length}) :</span>
                  <span className="text-[#eef1f4]">{subtotal.toFixed(2).replace('.', ',')} €</span>
                </div>
                <div className="flex justify-between text-[#8b949e]">
                  <span>Expédition ({activeOption.name}) :</span>
                  <span className={effectiveShipping === 0 ? 'text-[#3ddc97] font-bold' : 'text-[#eef1f4]'}>
                    {effectiveShipping === 0 ? 'Offert' : `${effectiveShipping.toFixed(2).replace('.', ',')} €`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#232a35] font-plate text-sm text-[#eef1f4]">
                  <span>Total TTC à régler :</span>
                  <span className="text-[#3ee6d8] text-lg font-bold">
                    {total.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#3ee6d8] to-[#7b61ff] text-[#0a0d12] font-plate font-black uppercase text-xs tracking-wider shadow-xl shadow-[#3ee6d8]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {loading
                    ? 'Initialisation de la commande...'
                    : paymentMethod === 'onsite_pickup'
                    ? `Réserver ma commande (${total.toFixed(2).replace('.', ',')} € à régler sur place)`
                    : `Payer par Carte Bancaire (${total.toFixed(2).replace('.', ',')} €)`}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-5">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              paymentMethod === 'onsite_pickup'
                ? 'bg-[#3ee6d8]/20 border border-[#3ee6d8] text-[#3ee6d8]'
                : 'bg-[#3ddc97]/20 border border-[#3ddc97] text-[#3ddc97]'
            }`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#3ee6d8] uppercase tracking-wider">
                {paymentMethod === 'onsite_pickup'
                  ? 'Réservation confirmée (Règlement sur place)'
                  : 'Paiement Sécurisé Confirmé'}
              </span>
              <h3 className="font-plate text-2xl sm:text-3xl text-[#eef1f4]">
                {paymentMethod === 'onsite_pickup'
                  ? 'Commande réservée avec succès !'
                  : 'Merci pour votre commande !'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto">
                Référence : <strong className="text-[#3ee6d8] font-mono">{completedOrderRef}</strong>. Un email récapitulatif vient d'être généré.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151a22] border border-[#232a35] text-xs text-[#eef1f4] max-w-md mx-auto space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#232a35]">
                <span className="text-xs font-mono text-[#8b949e] uppercase">
                  {paymentMethod === 'onsite_pickup' ? 'À régler sur place au retrait :' : 'Montant total réglé :'}
                </span>
                <span className="font-plate text-2xl font-black text-[#3ee6d8]">
                  {total.toFixed(2).replace('.', ',')} €
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#8b949e]">
                  <span>Mode de livraison :</span>
                  <span className="text-[#eef1f4] font-medium">{activeOption.name}</span>
                </div>
                {paymentMethod === 'onsite_pickup' && (
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Règlement sur place :</span>
                    <span className="text-[#3ee6d8] font-medium">Carte Bancaire ou Espèces</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8b949e]">
                  <span>Destinataire :</span>
                  <span className="text-[#eef1f4] font-medium">{firstName} {lastName}</span>
                </div>
                {email && (
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Email de confirmation :</span>
                    <span className="text-[#3ee6d8] truncate max-w-[200px]">{email}</span>
                  </div>
                )}
              </div>

              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                paymentMethod === 'onsite_pickup'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#3ddc97]/10 border-[#3ddc97]/30 text-[#3ddc97]'
              }`}>
                {paymentMethod === 'onsite_pickup' ? (
                  <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <p className="leading-relaxed">
                  {paymentMethod === 'onsite_pickup'
                    ? 'Vos produits sont réservés à l\'atelier (8 Rue Saint Gilles, 27630 Heubécourt-Haricourt). Nous vous contacterons pour fixer votre heure de passage.'
                    : 'Votre commande a bien été enregistrée et transmise à notre atelier. Nous préparons votre colis avec le plus grand soin.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#151a22] border border-[#232a35] text-xs font-plate uppercase text-[#eef1f4] hover:bg-[#1a212c] transition-all"
            >
              Retourner à la boutique
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
