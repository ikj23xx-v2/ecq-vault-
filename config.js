/**
 * Epic Card Quest — Public Frontend Configuration
 *
 * 1. Create a Supabase project and run:
 *      supabase/migrations/001_create_vault_waitlist.sql
 * 2. Paste your Project URL and Publishable/Anon Key below.
 *    (The anon key is safe for client-side use when Row Level Security is enabled.)
 * 3. Optional: set WEBHOOK_URL if you also want to mirror submissions to Make, Zapier,
 *    Discord, or a custom serverless endpoint.
 */
window.ECQ_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  SUPABASE_TABLE: 'vault_waitlist',
  WEBHOOK_URL: '' // Optional fallback / mirror webhook URL
};
