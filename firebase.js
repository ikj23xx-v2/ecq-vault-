/**
 * Epic Card Quest — Firebase Firestore Bridge (ES Module, zero-build CDN)
 *
 * Reads credentials from window.ECQ_VAULT_CONFIG.firebase (configured in config.js).
 * Saves submissions to the CRM's `vault_submissions` collection with serverTimestamp()
 * and stores `pendingSubmissionId` in localStorage for post-Square confirmation.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
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
    tier: formData.tier,
    japaneseAddonQty: formData.japaneseAddonQty ?? 0,
    expectedTotal: formData.totalAmount, // Shows in your CRM so you can verify the amount paid
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

  try {
    localStorage.removeItem('pendingSubmissionId');
  } catch (_) {}

  return true;
}

// Expose bridge to inline script in index.html & thank-you.html
window.ECQ_FIREBASE = {
  isConfigured: () => Boolean(getFirebaseConfig()),
  saveVaultSubmission,
  markSubmissionPaid,
};
