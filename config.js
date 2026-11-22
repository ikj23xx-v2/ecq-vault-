/**
 * Epic Card Quest — Mystery Vault Public Frontend Configuration
 *
 * 1. Create a Supabase project and run:
 *      supabase/migrations/001_create_vault_waitlist.sql
 * 2. Paste your Project URL and Publishable/Anon Key below.
 *    (The anon key is safe for client-side use when Row Level Security is enabled.)
 * 3. Optional: set webhookUrl to mirror leads to Make, Zapier, n8n, or GoHighLevel,
 *    or set customLogoPath to "./assets/ecq-crest.png" to use the raster crest.
 */
window.ECQ_VAULT_CONFIG = {
  // Optional local raster logo path (e.g., "./assets/ecq-crest.png"); leave empty for built-in crisp SVG crest
  customLogoPath: "",

  // Supabase REST API settings for persisting VIP waitlist signups
  supabaseUrl: "", // e.g. "https://your-project-ref.supabase.co"
  supabaseAnonKey: "", // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  supabaseTable: "vault_waitlist",

  // Optional custom webhook URL (e.g. Make, Zapier, n8n, or GoHighLevel inbound webhook)
  webhookUrl: "",

  // Future Square Subscription Checkout & Customer Portal links (for Drop #1 launch)
  squareCheckoutLinks: {
    starter: "", // e.g. "https://square.link/u/..."
    pro: "", // e.g. "https://square.link/u/..."
    questMaster: "", // e.g. "https://square.link/u/..."
    portalUrl: "", // e.g. "https://squareup.com/..."
  },
};
