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

// Save or update product in Cloud Firestore
export async function updateProductInCloud(product: Product): Promise<void> {
  const docRef = doc(db, 'products', product.id);
  await setDoc(docRef, product, { merge: true });
}

// Add new product in Cloud Firestore
export async function addProductToCloud(product: Product): Promise<void> {
  const docRef = doc(db, 'products', product.id);
  await setDoc(docRef, product);
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
