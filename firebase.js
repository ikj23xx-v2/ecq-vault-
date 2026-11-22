/**
 * Epic Card Quest — Firebase Firestore Bridge (ES Module, zero-build CDN)
 *
 * Reads credentials from window.ECQ_VAULT_CONFIG.firebase (configured in config.js).
 * - Saves vault submissions to `vault_submissions`
 * - Marks orders paid on /thank-you
 * - Upserts customers & newsletter preferences into `customers/{email}`
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

function getFirebaseConfig() {
  const cfg = window.ECQ_VAULT_CONFIG && window.ECQ_VAULT_CONFIG.firebase;
  if (!cfg || !cfg.apiKey || !cfg.projectId) return null;
  if (
    String(cfg.apiKey).includes('YOUR_') ||
    String(cfg.projectId).includes('YOUR_')
  ) {
    return null;
  }
  return cfg;
}

let cachedDb = null;

export function getDb() {
  if (cachedDb) return cachedDb;
  const firebaseConfig = getFirebaseConfig();
  if (!firebaseConfig) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  cachedDb = getFirestore(app);
  return cachedDb;
}

export async function saveVaultSubmission(formData) {
  const db = getDb();
  if (!db) return null;

  const collectionName =
    (window.ECQ_VAULT_CONFIG &&
      window.ECQ_VAULT_CONFIG.firebase &&
      window.ECQ_VAULT_CONFIG.firebase.collection) ||
    'vault_submissions';

  const docRef = await addDoc(collection(db, collectionName), {
    customerName: formData.name,
    email: formData.email.toLowerCase(),
    phone: formData.phone || null,
    category: formData.category || 'sports',
    tierId: formData.tierId || null,
    tier: formData.tier,
    japaneseAddon: Boolean(formData.japaneseAddon),
    expectedTotal: formData.totalAmount,
    monthlyRate: formData.monthlyRate,
    preferences: formData.preferences,
    vipCode: formData.vipCode,
    paymentStatus: 'pending', // Updates to "paid" after Square
    fulfilled: false,
    sourceSubdomain: 'vault.epiccard.quest',
    createdAt: serverTimestamp(),
  });

  try {
    localStorage.setItem('pendingSubmissionId', docRef.id);
  } catch (_) {}

  return docRef.id;
}

export async function markSubmissionPaid(submissionId) {
  if (!submissionId) return false;
  const db = getDb();
  if (!db) return false;

  const collectionName =
    (window.ECQ_VAULT_CONFIG &&
      window.ECQ_VAULT_CONFIG.firebase &&
      window.ECQ_VAULT_CONFIG.firebase.collection) ||
    'vault_submissions';

  await updateDoc(doc(db, collectionName, submissionId), {
    paymentStatus: 'paid',
    paidAt: serverTimestamp(),
  });

  return true;
}

export async function upsertCustomerFromOrder(orderData) {
  const db = getDb();
  if (!db || !orderData || !orderData.email) return false;

  const emailKey = orderData.email.trim().toLowerCase();
  if (!emailKey) return false;

  await setDoc(
    doc(db, 'customers', emailKey),
    {
      customerName: orderData.customerName || orderData.full_name || '',
      email: emailKey,
      phone: orderData.phone || '',
      newsletterSubscribed: true, // Default opt-in from Vault purchase
      source: 'ECQ Vault Checkout',
      lastOrderTier: orderData.tier || orderData.preferred_tier || '',
      totalOrders: increment(1),
      totalSpent: increment(Number(orderData.expectedTotal || orderData.monthly_rate || 0)),
      lastOrderAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

export async function saveCustomerNewsletterPrefs(email, { newsletterSubscribed, favoriteCategory }) {
  const db = getDb();
  if (!db || !email) return false;

  const emailKey = email.trim().toLowerCase();
  await setDoc(
    doc(db, 'customers', emailKey),
    {
      newsletterSubscribed: Boolean(newsletterSubscribed),
      favoriteCategory: (favoriteCategory || '').trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

// Expose bridge to inline scripts in index.html & thank-you.html
window.ECQ_FIREBASE = {
  isConfigured: () => Boolean(getFirebaseConfig()),
  saveVaultSubmission,
  markSubmissionPaid,
  upsertCustomerFromOrder,
  saveCustomerNewsletterPrefs,
};
