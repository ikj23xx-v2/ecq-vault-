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

  // Locked-price Square Payment Links mapped by tierId
  squareLinks: {
    // Sports Tiers
    "sports-25": "https://square.link/u/4UyKo91X", // Sports Vault Starter Tier ($25)
    "sports-35": "https://square.link/u/b1JHcRNn", // Sports Vault Pro Tier ($35)
    "sports-50": "https://square.link/u/ERnlpCPt", // Sports Vault Quest Master Tier ($50)

    // Pokémon Standard Tiers
    "pokemon-25": "https://square.link/u/y3YMqNRA", // Pokémon Vault Starter Tier ($25)
    "pokemon-35": "https://square.link/u/Fl8DSl8u", // Pokémon Vault Pro Tier ($35)
    "pokemon-50": "https://square.link/u/GdBpDjST", // Pokémon Vault Quest Master Tier ($50)

    // Pokémon Tiers + $20 Japanese Add-On
    "pokemon-25-jp": "https://square.link/u/INjYK8XT", // Pokémon Vault Starter Tier Japanese ($45)
    "pokemon-35-jp": "https://square.link/u/r6LrxIHB", // Pokémon Vault Pro Tier Japanese ($55)
    "pokemon-50-jp": "https://square.link/u/Igp1T3tc", // Pokémon Vault Quest Master Tier Japanese ($70)
  }
};
