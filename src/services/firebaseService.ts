import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Product } from '../data/products';

export interface CloudStoreSettings {
  shippingCost: number;
  freeShippingThreshold: number;
}

// Subscribe to real-time products updates from Firestore
export function subscribeToProducts(callback: (products: Product[]) => void) {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((d) => {
        prods.push(d.data() as Product);
      });
      callback(prods);
    },
    (err) => {
      console.warn('Firestore subscription error (offline/rules):', err.message);
    }
  );
}

function sanitizeProductForFirestore(product: Product): Record<string, any> {
  // Never save bundled local asset paths (e.g. /assets/bulbee_...) to cloud,
  // only save real user-uploaded base64 or external URLs.
  const isCustomImage = Boolean(
    product.image &&
    (product.image.startsWith('data:image') || product.image.startsWith('http'))
  );

  const sanitized: Record<string, any> = {
    id: product.id,
    code: product.code || product.id,
    name: product.name || '',
    volume: product.volume || '500 ml',
    refNumber: product.refNumber || '',
    price: Number(product.price) || 0,
    costPrice: product.costPrice !== undefined ? Number(product.costPrice) : 0,
    stockStatus: product.stockStatus || 'in_stock',
    badge: product.badge ? product.badge.trim() : '',
    category: product.category || 'accessoires',
    colorAccent: product.colorAccent || '#3ee6d8',
    usage: product.usage || '',
    detail: product.detail || '',
    conseils: Array.isArray(product.conseils) ? product.conseils : [],
    image: isCustomImage ? product.image : '',
    isHidden: Boolean(product.isHidden),
  };
  if (product.stockCount !== undefined) {
    sanitized.stockCount = Number(product.stockCount);
  }
  return sanitized;
}

// Save or update product in Cloud Firestore
export async function updateProductInCloud(product: Product): Promise<void> {
  const docRef = doc(db, 'products', product.id);
  await setDoc(docRef, sanitizeProductForFirestore(product), { merge: true });
}

// Add new product in Cloud Firestore
export async function addProductToCloud(product: Product): Promise<void> {
  const docRef = doc(db, 'products', product.id);
  await setDoc(docRef, sanitizeProductForFirestore(product));
}

// Remove or hide product in Cloud Firestore
export async function toggleProductVisibilityInCloud(productId: string, isHidden: boolean): Promise<void> {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, { isHidden });
}

// Save store settings in Cloud Firestore
export async function saveSettingsToCloud(shippingCost: number, freeShippingThreshold: number): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, { shippingCost, freeShippingThreshold }, { merge: true });
}

// Firebase Auth Login Email/Password
export async function loginAdminWithFirebase(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

// Create or initialize admin account with email/password if not existing in Firebase
export async function createAdminAccount(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

// Firebase Auth Google Sign-In (Direct with ami2s.d.lepine@gmail.com)
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

// Send Password Reset / Initialization Email
export async function resetAdminPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Firebase Auth Logout
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

// Listen to Auth State
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
