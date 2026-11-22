window.ECQ_VAULT_CONFIG = {
  customLogoPath: "./assets/ecq-v1.jpeg",

  // Firebase Firestore (Existing ECQ CRM database -> `vault_submissions` collection)
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    collection: "vault_submissions"
  },

  // Optional Supabase fallback / mirror
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  supabaseTable: "vault_waitlist",

  // Optional webhook mirror
  webhookUrl: "",

  // Square Payment Links (when populated, form redirects to checkout after saving to Firestore;
  // when empty, displays the instant VIP Founder Pass confirmation UI)
  squareCheckoutLinks: {
    starter: "",
    pro: "",
    questMaster: "",
    portalUrl: ""
  }
};
