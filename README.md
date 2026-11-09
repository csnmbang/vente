# Vente · Vente pa'cá

The map of Spaniards living abroad. Pass a 5-question quiz about growing up in
Spain, put yourself on the map. See `CLAUDE.md` for scope and constraints.

## Run it locally (no accounts needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase keys the app runs in **demo mode**:
data lives in memory (lost on restart) and the map is seeded with fake people.

## Edit the quiz and the routes

Questions live in `src/content/questions.ts`. Distance routes ("a un
Alicante–Murcia de ti") live in `src/content/rutas.ts`; run
`npm run check:rutas` after editing. Both files explain their rules.

## Set up for real

First time? Follow the beginner guide in [docs/SETUP.md](docs/SETUP.md). The short version:

### 1. Supabase (database)

1. Create a project at supabase.com. **Region: Central EU (Frankfurt)**.
2. SQL Editor → paste each file in `supabase/migrations/` in order
   (`0001_init.sql`, `0002_province_counts.sql`, `0003_chat.sql`, `0004_email_limits.sql`, …) → Run.
   If it complains about `pg_cron`, enable it under Database → Extensions and
   run the file again.
3. Project Settings → API: copy the **Project URL** and the **service_role**
   key (secret; never put it in client code or commit it).

### 2. Local env

```bash
cp .env.example .env.local
openssl rand -base64 32   # paste as APP_SECRET
```

Fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_SECRET`, and the
`RESEND_API_KEY` if you want emails locally.

### 3. Load places and postcodes (once)

```bash
npm run import:geo
```

Uploads ~41k places and ~430k postcode areas (downloads 20 MB from GeoNames).
Takes a few minutes.

### 4. Resend (emails) — domain vengavente.com

1. resend.com → Domains → Add `vengavente.com` (EU region).
2. Add the DNS records Resend shows in Namecheap → Advanced DNS (Host = the
   part before the domain, e.g. `send`, `resend._domainkey`). The MX record
   needs Mail Settings → Custom MX.
3. Verify, then create an API key with **sending access** only.

### 5. Deploy to Vercel

1. Push this repo to GitHub, then vercel.com → Add New → Project → import it.
2. Environment variables (Production): `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `APP_SECRET` (a new one, not your local one),
   `NEXT_PUBLIC_SITE_URL=https://vengavente.com`,
   `NEXT_PUBLIC_CONTACT_EMAIL=hola@vengavente.com`, `RESEND_API_KEY`,
   `EMAIL_FROM=Vente <hola@vengavente.com>`.
3. Deploy. Functions run in Frankfurt (`vercel.json`).
4. Project → Settings → Domains → add `vengavente.com` and `www.vengavente.com`.
   In Namecheap, delete the parking `www` CNAME and the `@` URL redirect, then
   add exactly the records Vercel shows.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Generate route types + `tsc` |
| `npm run import:geo` | Load places + postcodes into Supabase |
| `npm run check:rutas` | Check `src/content/rutas.ts` and print every route's distance |
| `npm run build:places` | Rebuild `data/places.csv` from GeoNames dumps (rarely needed) |

Data: GeoNames (CC BY 4.0). Map: © OpenStreetMap, OpenMapTiles, OpenFreeMap.
