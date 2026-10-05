import React, { useState, useEffect } from 'react';
import { CATALOG, Product, tireApplicatorImg } from './data/products';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InfiniteTicker } from './components/InfiniteTicker';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { DetailingRoutines } from './components/DetailingRoutines';
import { PolishingTrilogy } from './components/PolishingTrilogy';
import { BeforeAfterComparator } from './components/BeforeAfterComparator';
import { SacocheShowcase } from './components/SacocheShowcase';
import { HowToOrder } from './components/HowToOrder';
import { FaqAccordion } from './components/FaqAccordion';
import { Footer, LegalModalType } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FlyingBottleAnimation } from './components/FlyingBottleAnimation';
import { LegalModals } from './components/LegalModals';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { CatalogManagerModal } from './components/CatalogManagerModal';
import { PhotoManagerModal } from './components/PhotoManagerModal';
import { PriceEditorModal } from './components/PriceEditorModal';
import { BusinessSettingsModal, BusinessSettings } from './components/BusinessSettingsModal';
import { QRCodeGuideModal } from './components/QRCodeGuideModal';
import { PackManagerModal } from './components/PackManagerModal';
import { OrderSuccessModal, OrderDetails } from './components/OrderSuccessModal';
import { DetailingPack, INITIAL_PACKS } from './data/packs';
import { TrilogyConfig, DEFAULT_TRILOGY_CONFIG } from './data/trilogy';
import { LuxuryIntro } from './components/LuxuryIntro';
import { CarrierType } from './utils/shippingCalculator';
import { soundManager } from './utils/soundEffects';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  subscribeToProducts,
  subscribeToAuth,
  subscribeToDisplaySettings,
  saveDisplaySettingsToCloud,
  subscribeToGlobalSettings,
  subscribeToBusinessSettings,
  updateProductInCloud,
  addProductToCloud,
  toggleProductVisibilityInCloud,
  saveSettingsToCloud,
} from './services/firebaseService';
import { Sparkles, Camera } from 'lucide-react';
import { fetchStockFromAppsScript } from './services/appsScriptSync';

export default function App() {
  // Cinema intro state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('autodetail_intro_seen');
    } catch {
      return false;
    }
  });

  // Admin lock state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('autodetail_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Cart state
  const [cart, setCart] = useState<{ [productId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('autodetail_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom prices override
  const [customPrices, setCustomPrices] = useState<{ [productId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('autodetail_custom_prices');
      const parsed = saved ? JSON.parse(saved) : {};
      if (parsed.SB === 85 || parsed.SB === 75 || parsed.SB === 76) {
        parsed.SB = 80.0;
        try {
          localStorage.setItem('autodetail_custom_prices', JSON.stringify(parsed));
        } catch {}
      }
      return parsed;
    } catch {
      return {};
    }
  });

  // Custom photos override
  const [customPhotos, setCustomPhotos] = useState<{ [productId: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('autodetail_custom_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Hidden products state
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autodetail_hidden_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Extra user added products
  const [extraProducts, setExtraProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('autodetail_extra_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Product text/price/badge overrides
  const [productOverrides, setProductOverrides] = useState<{ [id: string]: Partial<Product> }>(() => {
    try {
      const saved = localStorage.getItem('autodetail_product_overrides');
      const parsed = saved ? JSON.parse(saved) : {};
      if (parsed.SB && (parsed.SB.price === 85 || parsed.SB.price === 75 || parsed.SB.price === 76)) {
        parsed.SB.price = 80.0;
      }
      // Purge any legacy base64 images from overrides
      Object.keys(parsed).forEach((k) => {
        if (parsed[k]?.image && typeof parsed[k].image === 'string' && parsed[k].image.startsWith('data:image')) {
          delete parsed[k].image;
        }
      });
      try {
        localStorage.setItem('autodetail_product_overrides', JSON.stringify(parsed));
      } catch {}
      return parsed;
    } catch {
      return {};
    }
  });

  const [shippingCost, setShippingCost] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autodetail_shipping_cost');
      return saved ? parseFloat(saved) : 4.95;
    } catch {
      return 4.95;
    }
  });

  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autodetail_free_shipping_threshold');
      return saved ? parseFloat(saved) : 100.0;
    } catch {
      return 100.0;
    }
  });

  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDeliveryMode, setCheckoutDeliveryMode] = useState<CarrierType>('mondial_relay');
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState<boolean>(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem('autodetail_business_settings');
      return saved
        ? JSON.parse(saved)
        : {
            siret: '88914433300024',
            legalStatus: 'Micro-entreprise (Entreprise Individuelle)',
            ownerName: 'Pauline Pourrier',
            brandName: 'AUTODETAIL',
            address: '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt',
            phone: '06 14 06 44 48',
            email: 'contact@autodetail27.fr',
          };
    } catch {
      return {
        siret: '88914433300024',
        legalStatus: 'Micro-entreprise (Entreprise Individuelle)',
        ownerName: 'Pauline Pourrier',
        brandName: 'AUTODETAIL',
        address: '8 Rue Saint Gilles, 27630 Heubécourt-Haricourt',
        phone: '06 14 06 44 48',
        email: 'contact@autodetail27.fr',
      };
    }
  });
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);
  const [isPackManagerOpen, setIsPackManagerOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [qrModalProduct, setQrModalProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cartPopping, setCartPopping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flyingBottle, setFlyingBottle] = useState<{ image: string; rect: DOMRect } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successOrderRef, setSuccessOrderRef] = useState<string>('');
  const [successOrderDetails, setSuccessOrderDetails] = useState<OrderDetails | null>(null);

  // Section visibility states (configurable by admin)
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autodetail_show_before_after') !== 'false';
    } catch {
      return true;
    }
  });

  const [showPacksSection, setShowPacksSection] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autodetail_show_packs_section') !== 'false';
    } catch {
      return true;
    }
  });

  const [showTrilogySection, setShowTrilogySection] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autodetail_show_trilogy_section') !== 'false';
    } catch {
      return true;
    }
  });

  const [packManagerTab, setPackManagerTab] = useState<'packs' | 'trilogy'>('packs');

  // Trilogy configuration state (customizable steps, titles, products, prices)
  const [trilogyConfig, setTrilogyConfig] = useState<TrilogyConfig>(() => {
    try {
      const saved = localStorage.getItem('autodetail_trilogy_config');
      return saved ? JSON.parse(saved) : DEFAULT_TRILOGY_CONFIG;
    } catch {
      return DEFAULT_TRILOGY_CONFIG;
    }
  });

  // Packs state (fully customizable products, prices, discounts)
  const [packs, setPacks] = useState<DetailingPack[]>(() => {
    try {
      const saved = localStorage.getItem('autodetail_packs');
      return saved ? JSON.parse(saved) : INITIAL_PACKS;
    } catch {
      return INITIAL_PACKS;
    }
  });

  // All products base with overrides applied
  const allRawProducts = [...CATALOG, ...extraProducts].map((p) => {
    const override = productOverrides[p.id] || {};
    let img = customPhotos[p.id] || override.image || p.image;
    if (!img || img === '') {
      if (p.id.includes('5306') || p.code?.includes('EA229')) {
        img = tireApplicatorImg;
      }
    }

    return {
      ...p,
      ...override,
      price: customPrices[p.id] ?? override.price ?? p.price,
      costPrice: override.costPrice !== undefined ? override.costPrice : p.costPrice,
      image: img || p.image,
    };
  });

  // Dynamic catalog reflecting custom prices, genuine photos and online visibility
  const currentCatalog: Product[] = allRawProducts.filter(
    (p) => !hiddenProductIds.includes(p.id)
  );

  // Real-time Cloud Firebase synchronizer
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      const allowedEmails = ['ami2s.d.lepine@gmail.com', 'contact@autodetail27.fr'];
      if (user && user.email && allowedEmails.includes(user.email.toLowerCase().trim())) {
        setIsAdmin(true);
        sessionStorage.setItem('autodetail_is_admin', 'true');
      } else {
        setIsAdmin(false);
        sessionStorage.removeItem('autodetail_is_admin');
      }
    });

    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        const cloudPrices: { [id: string]: number } = {};
        const cloudPhotos: { [id: string]: string } = {};
        const cloudHidden: string[] = [];
        const cloudExtra: Product[] = [];

        cloudProducts.forEach((p: any) => {
          if (p.price) cloudPrices[p.id] = p.price;
          if (p.image && (p.image.startsWith('data:image') || p.image.startsWith('http'))) {
            cloudPhotos[p.id] = p.image;
          }
          if (p.isHidden) cloudHidden.push(p.id);
          if (!CATALOG.some((catP) => catP.id === p.id)) {
            cloudExtra.push(p);
          }
        });

        if (Object.keys(cloudPrices).length > 0) {
          setCustomPrices((prev) => ({ ...prev, ...cloudPrices }));
        }
        if (Object.keys(cloudPhotos).length > 0) {
          setCustomPhotos((prev) => {
            const next = { ...prev, ...cloudPhotos };
            try {
              localStorage.setItem('autodetail_custom_photos', JSON.stringify(next));
            } catch {}
            return next;
          });
        }
        if (cloudHidden.length > 0) {
          setHiddenProductIds((prev) => Array.from(new Set([...prev, ...cloudHidden])));
        }
        if (cloudExtra.length > 0) {
          setExtraProducts(cloudExtra);
        }
      }
    });

    const unsubDisplay = subscribeToDisplaySettings((cloudDisplay) => {
      if (cloudDisplay) {
        if (cloudDisplay.showBeforeAfter !== undefined) {
          setShowBeforeAfter(cloudDisplay.showBeforeAfter);
          try {
            localStorage.setItem('autodetail_show_before_after', String(cloudDisplay.showBeforeAfter));
          } catch {}
        }
        if (cloudDisplay.showTrilogySection !== undefined) {
          setShowTrilogySection(cloudDisplay.showTrilogySection);
          try {
            localStorage.setItem('autodetail_show_trilogy_section', String(cloudDisplay.showTrilogySection));
          } catch {}
        }
        if (cloudDisplay.showPacksSection !== undefined) {
          setShowPacksSection(cloudDisplay.showPacksSection);
          try {
            localStorage.setItem('autodetail_show_packs_section', String(cloudDisplay.showPacksSection));
          } catch {}
        }
        if (cloudDisplay.hiddenProductIds && Array.isArray(cloudDisplay.hiddenProductIds)) {
          setHiddenProductIds(cloudDisplay.hiddenProductIds);
          try {
            localStorage.setItem('autodetail_hidden_products', JSON.stringify(cloudDisplay.hiddenProductIds));
          } catch {}
        }
        if (cloudDisplay.packs && Array.isArray(cloudDisplay.packs) && cloudDisplay.packs.length > 0) {
          setPacks(cloudDisplay.packs);
          try {
            localStorage.setItem('autodetail_packs', JSON.stringify(cloudDisplay.packs));
          } catch {}
        }
        if (cloudDisplay.trilogyConfig) {
          setTrilogyConfig(cloudDisplay.trilogyConfig);
          try {
            localStorage.setItem('autodetail_trilogy_config', JSON.stringify(cloudDisplay.trilogyConfig));
          } catch {}
        }
        if (cloudDisplay.customPhotos && Object.keys(cloudDisplay.customPhotos).length > 0) {
          setCustomPhotos((prev) => {
            const merged = { ...prev, ...cloudDisplay.customPhotos };
            try {
              localStorage.setItem('autodetail_custom_photos', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    });

    const unsubGlobal = subscribeToGlobalSettings((cloudGlobal) => {
      if (cloudGlobal) {
        if (cloudGlobal.shippingCost !== undefined) {
          setShippingCost(cloudGlobal.shippingCost);
          try {
            localStorage.setItem('autodetail_shipping_cost', cloudGlobal.shippingCost.toString());
          } catch {}
        }
        if (cloudGlobal.freeShippingThreshold !== undefined) {
          setFreeShippingThreshold(cloudGlobal.freeShippingThreshold);
          try {
            localStorage.setItem('autodetail_free_shipping_threshold', cloudGlobal.freeShippingThreshold.toString());
          } catch {}
        }
      }
    });

    const unsubBusiness = subscribeToBusinessSettings((cloudBusiness) => {
      if (cloudBusiness) {
        setBusinessSettings((prev) => {
          const merged = { ...prev, ...cloudBusiness };
          try {
            localStorage.setItem('autodetail_business_settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => {
      unsubAuth();
      unsubProducts();
      unsubDisplay();
      unsubGlobal();
      unsubBusiness();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderRef = params.get('order_ref');
    if (payment === 'success' && orderRef) {
      soundManager.playCashRegister();
      setCart({});
      try {
        localStorage.removeItem('autodetail_cart');
      } catch (e) {
        console.error(e);
      }

      // Retrieve full order details from storage for instant rich display
      let details: OrderDetails | null = null;
      try {
        const saved =
          localStorage.getItem('autodetail_pending_order_' + orderRef) ||
          localStorage.getItem('autodetail_last_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          details = {
            orderRef,
            customerName: `${parsed.customer?.firstName || ''} ${parsed.customer?.lastName || ''}`.trim(),
            customerEmail: parsed.customer?.email,
            customerPhone: parsed.customer?.phone,
            shippingAddress: parsed.customer?.address
              ? `${parsed.customer.address}, ${parsed.customer.postalCode || ''} ${parsed.customer.city || ''}`
              : '',
            carrierName: parsed.carrier?.name,
            deliveryMode: parsed.carrier?.name,
            subtotal: parsed.subtotal || 0,
            shippingCost: parsed.shippingCost || 0,
            total: parsed.total || 0,
            items: parsed.items || [],
          };
        }
      } catch (err) {
        console.warn('Error reading order details:', err);
      }

      setSuccessOrderRef(orderRef);
      setSuccessOrderDetails(details);
      setIsSuccessModalOpen(true);

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      showToast('Paiement annulé. Vos articles sont toujours dans votre panier.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveBusinessSettings = (newSettings: BusinessSettings) => {
    setBusinessSettings(newSettings);
    try {
      localStorage.setItem('autodetail_business_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
    const docRef = doc(db, 'settings', 'business');
    setDoc(docRef, newSettings, { merge: true }).catch((err) => {
      console.warn('Sync business settings notice:', err);
    });
    showToast('Coordonnées de l\'entreprise enregistrées !');
  };

  const handleToggleHideProduct = (id: string) => {
    const isCurrentlyHidden = hiddenProductIds.includes(id);
    const nextHidden = !isCurrentlyHidden;

    const updated = isCurrentlyHidden ? hiddenProductIds.filter((x) => x !== id) : [...hiddenProductIds, id];
    setHiddenProductIds(updated);
    try {
      localStorage.setItem('autodetail_hidden_products', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    saveDisplaySettingsToCloud({ hiddenProductIds: updated }).catch(() => {});
    toggleProductVisibilityInCloud(id, nextHidden).catch((err) => {
      console.warn('Sync Cloud notice:', err);
    });

    showToast(nextHidden ? 'Article masqué aux clients (synchronisé Cloud)' : 'Article réaffiché (synchronisé Cloud)');
  };

  const handleAddProduct = (newProduct: Product) => {
    setExtraProducts((prev) => {
      const updated = [newProduct, ...prev];
      try {
        localStorage.setItem('autodetail_extra_products', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    addProductToCloud(newProduct).catch((err) => {
      console.warn('Sync Cloud notice:', err);
    });

    showToast(`Article "${newProduct.name}" publié dans le Cloud Firebase !`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProductOverrides((prev) => {
      const next = { ...prev, [updated.id]: updated };
      try {
        localStorage.setItem('autodetail_product_overrides', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setExtraProducts((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        try {
          localStorage.setItem('autodetail_extra_products', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      }
      return prev;
    });

    setCustomPrices((prev) => {
      const next = { ...prev, [updated.id]: updated.price };
      try {
        localStorage.setItem('autodetail_custom_prices', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (updated.image) {
      setCustomPhotos((prev) => {
        const next = { ...prev, [updated.id]: updated.image };
        try {
          localStorage.setItem('autodetail_custom_photos', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    updateProductInCloud(updated).catch((err) => {
      console.warn('Sync Cloud notice:', err);
    });

    showToast(`Article "${updated.name}" mis à jour dans le Cloud !`);
  };

  const handleDeleteProduct = (id: string) => {
    setExtraProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('autodetail_extra_products', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    handleToggleHideProduct(id);
    showToast('Article retiré du catalogue');
  };

  const handleResetCatalog = () => {
    setHiddenProductIds([]);
    setExtraProducts([]);
    setProductOverrides({});
    try {
      localStorage.removeItem('autodetail_hidden_products');
      localStorage.removeItem('autodetail_extra_products');
      localStorage.removeItem('autodetail_product_overrides');
    } catch (e) {
      console.error(e);
    }
    showToast('Catalogue 17 articles officiel rétabli');
  };

  const handleUpdateSinglePhoto = (productId: string, imageBase64: string) => {
    const updated = { ...customPhotos, [productId]: imageBase64 };
    setCustomPhotos(updated);
    try {
      localStorage.setItem('autodetail_custom_photos', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    saveDisplaySettingsToCloud({ customPhotos: updated }).catch(() => {});
    const prod = allRawProducts.find((p) => p.id === productId);
    if (prod) {
      updateProductInCloud({ ...prod, image: imageBase64 }).catch(() => {});
    }
    showToast('Photo mise à jour pour ce flacon !');
  };

  const handleUpdatePhotos = (newPhotos: { [id: string]: string }) => {
    const merged = { ...customPhotos, ...newPhotos };
    setCustomPhotos(merged);
    try {
      localStorage.setItem('autodetail_custom_photos', JSON.stringify(merged));
    } catch (e) {
      console.error(e);
    }

    saveDisplaySettingsToCloud({ customPhotos: merged }).catch(() => {});
    Object.entries(newPhotos).forEach(([id, img]) => {
      const prod = allRawProducts.find((p) => p.id === id);
      if (prod) {
        updateProductInCloud({ ...prod, image: img }).catch(() => {});
      }
    });

    showToast('Photos réelles appliquées et synchronisées dans le Cloud !');
  };

  const handleSavePrices = (
    newPrices: { [id: string]: number },
    newShipping: number,
    newThreshold: number,
    newCosts?: { [id: string]: number }
  ) => {
    setCustomPrices(newPrices);
    setShippingCost(newShipping);
    setFreeShippingThreshold(newThreshold);
    try {
      localStorage.setItem('autodetail_custom_prices', JSON.stringify(newPrices));
      localStorage.setItem('autodetail_shipping_cost', newShipping.toString());
      localStorage.setItem('autodetail_free_shipping_threshold', newThreshold.toString());
      if (newCosts) {
        localStorage.setItem('autodetail_custom_costs', JSON.stringify(newCosts));
      }
    } catch (e) {
      console.error(e);
    }

    saveSettingsToCloud(newShipping, newThreshold).catch(() => {});
    Object.entries(newPrices).forEach(([id, pr]) => {
      const prod = allRawProducts.find((p) => p.id === id);
      if (prod) {
        const cost = (newCosts && newCosts[id] !== undefined) ? newCosts[id] : prod.costPrice;
        updateProductInCloud({ ...prod, price: pr, costPrice: cost }).catch(() => {});
      }
    });

    showToast('Tarifs et paramètres de rentabilité enregistrés !');
  };

  const handleToggleBeforeAfter = (visible: boolean) => {
    setShowBeforeAfter(visible);
    try {
      localStorage.setItem('autodetail_show_before_after', String(visible));
    } catch {}
    saveDisplaySettingsToCloud({ showBeforeAfter: visible }).catch(() => {});
    showToast(visible ? 'Section "Avant / Après" affichée' : 'Section "Avant / Après" masquée aux clients');
  };

  const handleTogglePacksSection = (visible: boolean) => {
    setShowPacksSection(visible);
    try {
      localStorage.setItem('autodetail_show_packs_section', String(visible));
    } catch {}
    saveDisplaySettingsToCloud({ showPacksSection: visible }).catch(() => {});
    showToast(visible ? 'Section "Packs & Rituels" affichée' : 'Section "Packs & Rituels" masquée aux clients');
  };

  const handleSavePacks = (newPacks: DetailingPack[]) => {
    setPacks(newPacks);
    try {
      localStorage.setItem('autodetail_packs', JSON.stringify(newPacks));
    } catch {}
    const hasVisible = newPacks.some((p) => !p.isHidden);
    saveDisplaySettingsToCloud({ packs: newPacks, showPacksSection: hasVisible }).catch(() => {});
    showToast('Packs et compositions mis à jour avec succès !');
  };

  const handleToggleTrilogySection = (visible: boolean) => {
    setShowTrilogySection(visible);
    try {
      localStorage.setItem('autodetail_show_trilogy_section', String(visible));
    } catch {}
    saveDisplaySettingsToCloud({ showTrilogySection: visible }).catch(() => {});
    showToast(visible ? 'Section "Trilogie Polissage" affichée' : 'Section "Trilogie Polissage" masquée aux clients');
  };

  const handleSaveTrilogyConfig = (newConfig: TrilogyConfig) => {
    setTrilogyConfig(newConfig);
    try {
      localStorage.setItem('autodetail_trilogy_config', JSON.stringify(newConfig));
    } catch {}
    saveDisplaySettingsToCloud({ trilogyConfig: newConfig }).catch(() => {});
    showToast('Configuration de la Trilogie Polissage enregistrée !');
  };

  const handleApplyStocksFromSheet = (
    stocks: { [code: string]: number },
    arrivages?: { [code: string]: number },
    couts?: { [code: string]: number },
    showNotice = true
  ) => {
    let updatedCount = 0;
    const newOverrides = { ...productOverrides };

    Object.entries(stocks).forEach(([codeOrRef, qty]) => {
      const cleanInput = codeOrRef.toUpperCase().replace(/[-_\s]/g, '');
      const target = allRawProducts.find(
        (p) => {
          const pId = p.id.toUpperCase().replace(/[-_\s]/g, '');
          const pCode = (p.code || '').toUpperCase().replace(/[-_\s]/g, '');
          const pRef = (p.refNumber || '').toUpperCase().replace(/[-_\s]/g, '');

          return (
            p.id.toUpperCase() === codeOrRef.toUpperCase() ||
            p.code.toUpperCase() === codeOrRef.toUpperCase() ||
            p.refNumber.toUpperCase() === codeOrRef.toUpperCase() ||
            pId === cleanInput ||
            pCode === cleanInput ||
            pRef === cleanInput ||
            // Match EA229P to applicateur pneu
            (cleanInput.includes('EA229') && (pId.includes('5306') || pCode.includes('5306') || p.name.toUpperCase().includes('APPLICATEUR')))
          );
        }
      );

      if (target) {
        updatedCount++;
        const currentOverride = newOverrides[target.id] || {};
        const newStatus = qty <= 0 ? 'backorder' : qty <= 2 ? 'low_stock' : 'in_stock';
        
        let incoming = 0;
        if (arrivages) {
          const cleanArrivages: { [k: string]: number } = {};
          Object.entries(arrivages).forEach(([k, v]) => {
            cleanArrivages[k.toUpperCase().replace(/[-_\s]/g, '')] = Number(v) || 0;
          });

          const targetIdClean = target.id.toUpperCase().replace(/[-_\s]/g, '');
          const targetCodeClean = (target.code || '').toUpperCase().replace(/[-_\s]/g, '');
          const targetRefClean = (target.refNumber || '').toUpperCase().replace(/[-_\s]/g, '');

          incoming =
            cleanArrivages[cleanInput] ??
            cleanArrivages[targetCodeClean] ??
            cleanArrivages[targetIdClean] ??
            cleanArrivages[targetRefClean] ??
            (cleanInput.includes('EA229') || targetIdClean.includes('5306') ? (cleanArrivages['EA229P'] || cleanArrivages['EA229'] || 0) : 0);
        }

        if (incoming === 0 && currentOverride.incomingCount) {
          incoming = currentOverride.incomingCount;
        }

        let costPrice = currentOverride.costPrice;
        if (couts) {
          const cleanCouts: { [k: string]: number } = {};
          Object.entries(couts).forEach(([k, v]) => {
            cleanCouts[k.toUpperCase().replace(/[-_\s]/g, '')] = Number(v) || 0;
          });
          const targetIdClean = target.id.toUpperCase().replace(/[-_\s]/g, '');
          const targetCodeClean = (target.code || '').toUpperCase().replace(/[-_\s]/g, '');
          const targetRefClean = (target.refNumber || '').toUpperCase().replace(/[-_\s]/g, '');
          const c =
            cleanCouts[cleanInput] ??
            cleanCouts[targetCodeClean] ??
            cleanCouts[targetIdClean] ??
            cleanCouts[targetRefClean] ??
            (cleanInput.includes('EA229') || targetIdClean.includes('5306') ? (cleanCouts['EA229P'] || cleanCouts['EA229'] || 0) : 0);
          if (c > 0) {
            costPrice = c;
          }
        }

        newOverrides[target.id] = {
          ...currentOverride,
          stockCount: qty,
          stockStatus: newStatus,
          incomingCount: incoming,
          costPrice: costPrice !== undefined ? costPrice : currentOverride.costPrice,
        };

        // Also push to Cloud Firestore
        updateProductInCloud({
          ...target,
          stockCount: qty,
          stockStatus: newStatus,
          incomingCount: incoming,
          costPrice: costPrice !== undefined ? costPrice : target.costPrice,
        }).catch(() => {});
      }
    });

    setProductOverrides(newOverrides);
    try {
      localStorage.setItem('autodetail_product_overrides', JSON.stringify(newOverrides));
    } catch {}

    if (showNotice) {
      showToast(`${updatedCount} références synchronisées en direct depuis LP SYSTEME !`);
    }
  };

  // Initial stock fetch from Google Sheets API on boutique load
  useEffect(() => {
    fetchStockFromAppsScript()
      .then((res) => {
        if (res.success && res.stocks && Object.keys(res.stocks).length > 0) {
          handleApplyStocksFromSheet(res.stocks, res.arrivages, res.couts, false);
        }
      })
      .catch((err) => {
        console.warn('Auto stock sync notice:', err);
      });
  }, []);

  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    soundManager.playPschitt();
    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFlyingBottle({ image: product.image, rect });
      setTimeout(() => setFlyingBottle(null), 700);
    }

    setCart((prev) => {
      const next = { ...prev, [product.id]: (prev[product.id] || 0) + 1 };
      try {
        localStorage.setItem('autodetail_cart', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setCartPopping(true);
    setTimeout(() => setCartPopping(false), 350);
  };

  const handleAddMultipleToCart = (productsToAdd: Product[]) => {
    soundManager.playPschitt();
    setCart((prev) => {
      const next = { ...prev };
      productsToAdd.forEach((p) => {
        next[p.id] = (next[p.id] || 0) + 1;
      });
      try {
        localStorage.setItem('autodetail_cart', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    setCartPopping(true);
    setTimeout(() => setCartPopping(false), 350);
    showToast(`Pack ajouté au panier (${productsToAdd.length} articles) !`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      try {
        localStorage.setItem('autodetail_cart', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
    try {
      localStorage.removeItem('autodetail_cart');
    } catch (e) {
      console.error(e);
    }
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const filteredCatalog =
    categoryFilter === 'all'
      ? currentCatalog
      : currentCatalog.filter((p) => p.category === categoryFilter);

  const bestSeller = currentCatalog.find((p) => p.id === 'MC500') || currentCatalog[0];

  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#eef1f4] flex flex-col font-sans selection:bg-[#3ee6d8]/20 selection:text-[#3ee6d8]">
      {/* Optional Cinema Luxury Intro */}
      {showIntro && (
        <LuxuryIntro
          onComplete={() => {
            setShowIntro(false);
            try {
              sessionStorage.setItem('autodetail_intro_seen', 'true');
            } catch {}
          }}
        />
      )}

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#151a22] border border-[#3ee6d8] text-[#3ee6d8] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Flying bottle animation on add to cart */}
      {flyingBottle && (
        <FlyingBottleAnimation image={flyingBottle.image} startRect={flyingBottle.rect} />
      )}

      {/* 1. Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenPrices={() => setIsPriceModalOpen(true)}
        onOpenPhotos={() => setIsPhotoModalOpen(true)}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
        onOpenPackManager={() => setIsPackManagerOpen(true)}
        onOpenBusinessSettings={() => setIsBusinessSettingsOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
        cartPopping={cartPopping}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          bestSeller={bestSeller}
          onScrollToCatalog={() => {
            const el = document.getElementById('gamme');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenBestSeller={() => setActiveModalProduct(bestSeller)}
          onOpenPhotos={isAdmin ? () => setIsPhotoModalOpen(true) : undefined}
        />

        {/* Infinite Ticker Bar */}
        <InfiniteTicker />

        {/* 3. Catalog Section with Category Filter Pills */}
        <section id="gamme" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151a22] border border-[#232a35] text-xs font-semibold text-[#3ee6d8] uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Qualité Concessionnaire • Utilisé chez Volkswagen & BMW
              </div>
              <h2 className="text-3xl sm:text-5xl font-plate text-[#eef1f4]">
                La gamme <span className="nacre-text">Bulbee</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#8b949e] max-w-lg">
                Des formulations professionnelles également adoptées et utilisées au quotidien en concession par des préparateurs Volkswagen et BMW.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#152e28] border border-[#3ddc97]/50 hover:border-[#3ddc97] text-xs font-plate uppercase tracking-wider text-[#3ddc97] hover:bg-[#3ddc97]/10 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Glisser-déposer mes photos réelles</span>
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center flex-wrap gap-2 mb-10">
            {[
              { id: 'all', label: `Tous (${currentCatalog.length})` },
              { id: 'interieur', label: 'Habitacle' },
              { id: 'lavage', label: 'Lavage & Finition' },
              { id: 'jantes_pneus', label: 'Jantes & Pneus' },
              { id: 'kits', label: 'Kits & Duos' },
              { id: 'parfums', label: 'Parfums (4 fragrances)' },
              { id: 'polish_cires', label: 'Polish & Cires' },
              { id: 'accessoires', label: 'Accessoires & Microfibres' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setCategoryFilter(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-plate uppercase tracking-wider transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[#3ee6d8] text-[#0a0d12] font-black shadow-[0_0_15px_rgba(62,230,216,0.3)]'
                    : 'bg-[#151a22] border border-[#232a35] text-[#8b949e] hover:text-[#eef1f4] hover:border-[#3ee6d8]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] || 0}
                onAddToCart={(prod, e) => handleAddToCart(prod, e)}
                onUpdateQuantity={(id, q) => handleUpdateQuantity(id, q)}
                onOpenDetails={(prod) => setActiveModalProduct(prod)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <span className="text-xs font-mono text-[#8b949e] bg-[#10141b] border border-[#232a35] px-4 py-2 rounded-xl inline-block">
              TVA non applicable, art. 293 B du CGI • Port offert dès {freeShippingThreshold.toFixed(2).replace('.', ',')} € TTC
            </span>
          </div>
        </section>

        {/* 4. Rituels de soin recommandés (Packs & Duos) */}
        {(showPacksSection || isAdmin || packs.some((p) => !p.isHidden)) && (
          <DetailingRoutines
            packs={packs}
            allProducts={allRawProducts}
            onAddMultipleToCart={handleAddMultipleToCart}
            isAdmin={isAdmin}
            onOpenPackManager={() => setIsPackManagerOpen(true)}
          />
        )}

        {/* 5. Trilogie Polissage Cut Correct Wax */}
        <PolishingTrilogy
          config={trilogyConfig}
          allProducts={allRawProducts}
          onAddMultipleToCart={handleAddMultipleToCart}
          onOpenDetails={(prod) => setActiveModalProduct(prod)}
          isVisible={showTrilogySection}
          isAdmin={isAdmin}
          onToggleVisible={handleToggleTrilogySection}
          onOpenEdit={() => {
            setPackManagerTab('trilogy');
            setIsPackManagerOpen(true);
          }}
          onUpdateProductPhoto={handleUpdateSinglePhoto}
        />

        {/* 6. Comparateur Avant / Après interactif */}
        <BeforeAfterComparator
          isVisible={showBeforeAfter}
          isAdmin={isAdmin}
          onToggleVisible={handleToggleBeforeAfter}
        />

        {/* 7. La Sacoche Bulbee Showcase (Kit complet & Sacoche nue) */}
        <SacocheShowcase
          product={currentCatalog.find((p) => p.id === 'SB')}
          onAddToCart={(prod, e) => handleAddToCart(prod, e)}
          onOpenDetails={(prod) => setActiveModalProduct(prod)}
        />

        {/* 8. Comment commander (3 étapes) */}
        <HowToOrder />

        {/* 9. FAQ Accordéon (4 questions) */}
        <FaqAccordion />
      </main>

      {/* 10. Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdmin={isAdmin}
        businessSettings={businessSettings}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        catalog={allRawProducts}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        shippingCost={shippingCost}
        freeShippingThreshold={freeShippingThreshold}
        onProceedToCheckout={(mode) => {
          setCheckoutDeliveryMode(mode);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Real Checkout Modal (Customer info, Delivery/Pickup RDV, Stripe / Onsite payment) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        catalog={allRawProducts}
        deliveryCarrier={checkoutDeliveryMode}
        shippingCost={shippingCost}
        freeShippingThreshold={freeShippingThreshold}
        onOrderCompleted={() => {
          handleClearCart();
          showToast('Commande confirmée avec succès !');
        }}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenQRCode={(p) => setQrModalProduct(p)}
      />

      {/* QR Code Application Guide Modal */}
      <QRCodeGuideModal
        product={qrModalProduct}
        onClose={() => setQrModalProduct(null)}
      />

      {/* Legal Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        businessSettings={businessSettings}
      />

      {/* Price & Shipping Editor Modal */}
      <PriceEditorModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        products={allRawProducts}
        customPrices={customPrices}
        shippingCost={shippingCost}
        freeShippingThreshold={freeShippingThreshold}
        onSave={handleSavePrices}
      />

      {/* Photo Manager Modal */}
      <PhotoManagerModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        products={allRawProducts}
        customPhotos={customPhotos}
        onUpdatePhotos={handleUpdatePhotos}
      />

      {/* Catalog Manager (Add / Edit / Remove / Toggle Visibility / Duos / Promos) */}
      <CatalogManagerModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        products={allRawProducts}
        hiddenProductIds={hiddenProductIds}
        onToggleHideProduct={handleToggleHideProduct}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetCatalog={handleResetCatalog}
      />

      {/* Pack & Sections Manager Modal */}
      <PackManagerModal
        isOpen={isPackManagerOpen}
        onClose={() => setIsPackManagerOpen(false)}
        packs={packs}
        allProducts={allRawProducts}
        onSavePacks={handleSavePacks}
        showPacksSection={showPacksSection}
        onTogglePacksSection={handleTogglePacksSection}
        showBeforeAfterSection={showBeforeAfter}
        onToggleBeforeAfterSection={handleToggleBeforeAfter}
        showTrilogySection={showTrilogySection}
        onToggleTrilogySection={handleToggleTrilogySection}
        trilogyConfig={trilogyConfig}
        onSaveTrilogyConfig={handleSaveTrilogyConfig}
        initialTab={packManagerTab}
      />

      {/* Admin PIN & Firebase Unlock Modal */}
      <AdminUnlockModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={(identifier) => {
          setIsAdmin(true);
          try {
            sessionStorage.setItem('autodetail_is_admin', 'true');
          } catch {}
          showToast(`Connecté : ${identifier || 'Administrateur'} (Cloud Firebase actif)`);
        }}
        onLogout={() => {
          setIsAdmin(false);
          try {
            sessionStorage.removeItem('autodetail_is_admin');
          } catch {}
          showToast('Session administrateur verrouillée');
        }}
      />

      {/* Dedicated Order Success / Recap Modal after Stripe or Checkout */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderRef={successOrderRef}
        orderDetails={successOrderDetails}
      />

      {/* Business Settings Modal */}
      <BusinessSettingsModal
        isOpen={isBusinessSettingsOpen}
        onClose={() => setIsBusinessSettingsOpen(false)}
        settings={businessSettings}
        onSave={handleSaveBusinessSettings}
        onApplyStocks={handleApplyStocksFromSheet}
      />
    </div>
  );
}
