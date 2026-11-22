# Epic Card Quest — The Vault (`vault.epiccard.quest`)

Coming Soon & VIP Early-Access splash page for **Epic Card Quest**, with two Hagerstown, MD boutiques (**Valley Mall** and **Hagerstown Premium Outlets**).

## Features
- **Dark-mode collector aesthetic**: Obsidian (`#0F172A`), Royal Blue (`#2563EB`), Foil Gold (`#F59E0B`).
- **Tiered Monthly Vault Pricing**: `$25` / `$35` / `$50` for **Sports** and **Chinese/Korean Pokémon**, with an interactive **`+$10/box` Japanese Pokémon** toggle (`$35` / `$45` / `$60`).
- **Instant VIP Founder Pass Generator**: Generates a serialized `ECQ-VLT-XXXXXX` Founder Pass upon waitlist submission.
- **Supabase Backend (`vault_waitlist`)**: Direct REST API integration with Row Level Security (anonymous `INSERT`-only policy) + optional webhook mirror.
- **Social & SMS Preview Ready**: Full Open Graph (`1200x630` `assets/og-card.png`), Twitter Card, and custom SVG/PNG favicons.

## Repository Structure
```text
.
├── index.html                                    # Coming Soon & VIP Early-Access splash page
├── config.js                                     # Public Supabase URL / Anon Key (+ optional webhook)
├── assets/
│   ├── favicon.svg                               # Vector ECQ card crest favicon
│   ├── favicon.png                               # 64x64 PNG favicon
│   ├── apple-touch-icon.png                      # 180x180 iOS home screen icon
│   ├── ecq-crest.png                             # 256x256 ECQ brand crest
│   └── og-card.png                               # 1200x630 Open Graph preview card
├── supabase/
│   └── migrations/
│       └── 001_create_vault_waitlist.sql         # Table schema, indexes & RLS policy
├── site.webmanifest                              # Web app manifest
├── robots.txt                                    # Search crawler directives
├── vercel.json                                   # Vercel headers & clean URLs
└── _headers                                      # Cloudflare Pages security & cache headers
```

## 1. Configure Supabase (`vault_waitlist`)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and go to **SQL Editor**.
2. Paste and run `supabase/migrations/001_create_vault_waitlist.sql`.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon / public** key.
4. Update `config.js`:
   ```js
   window.ECQ_CONFIG = {
     SUPABASE_URL: 'https://your-project-ref.supabase.co',
     SUPABASE_ANON_KEY: 'your-anon-public-key',
     SUPABASE_TABLE: 'vault_waitlist',
     WEBHOOK_URL: ''
   };
   ```

## 2. Push to GitHub
```bash
git add .
git commit -m "Launch Epic Card Quest Vault Coming Soon & VIP Waitlist"
git remote add origin https://github.com/<your-org>/epic-card-quest-vault.git
git push -u origin main
```

## 3. Deploy to Vercel or Cloudflare Pages
- **Vercel**: Import the GitHub repo, leave Framework Preset as **Other** (static site), Output Directory `.`, and add custom domain `vault.epiccard.quest`.
- **Cloudflare Pages**: Connect the GitHub repo, leave Build Command blank, Build Output Directory `/`, and attach `vault.epiccard.quest` in Custom Domains.

## 4. Verify Social / SMS Link Preview
After deploying to `https://vault.epiccard.quest/`, test your preview card in the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and send a test link via iMessage/SMS.
