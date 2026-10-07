# Vente

Vente connects Spanish people living abroad. Tagline: **"Vente pa'cá"**.
The idea came from a TikTok with 200+ comments asking for it, so almost all
traffic is mobile, arriving from a link in a TikTok bio.

@AGENTS.md

## Working agreement

- Commit in small steps with clear messages. Never commit secrets (`.env*` is
  ignored except `.env.example`).
- Before coding a new feature: show the plan and any new database tables, and
  ask what needs deciding.
- Roadmap features (below) are built **one at a time, in order**. After each:
  commit, explain how to try it, and wait for the owner's OK before starting
  the next one.
- Update this file as scope grows, and update `/privacidad` whenever what we
  store changes.

## Product constraints

- All interface text in **Spanish from Spain**, informal "tú", playful tone,
  with a wink to the Tuenti era.
- **Mobile first.** Must load fast and feel good on a phone. Heavy libraries
  (MapLibre) load only on the pages that need them.
- **Collect the minimum personal data.** Never ask for or store an exact
  location (no browser geolocation, no addresses).
- Basic protection against spam sign-ups and quiz replays.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4, Cache Components on).
  Read `node_modules/next/dist/docs/` before using an API you're unsure of —
  this version differs from older Next.js.
- Supabase (Postgres). The **browser never talks to Supabase**: all access goes
  through route handlers using the service-role key on the server. RLS is
  enabled on every table with no public policies.
- MapLibre GL with OpenFreeMap tiles (OSM-based, free, no key).
- GeoNames data (CC-BY) for cities, Spanish municipios and postcodes.
- Resend for email from `hola@vengavente.com` (`RESEND_API_KEY` empty, e.g.
  in local dev ⇒ no emails; sign-ups are confirmed immediately).
- Domain: **vengavente.com** (Namecheap DNS). Inbound mail to
  `hola@vengavente.com` is forwarded via ImprovMX.
- Deploy target: Vercel free tier.

## Implementation notes

- **Demo mode:** without `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, the
  store (`src/lib/store/`) runs in memory with fake seeded sign-ups. It
  refuses to start on Vercel production. Every data access goes through the
  `Store` interface, so add new queries to both implementations.
- Schema changes: add a new numbered file in `supabase/migrations/` (pasted
  into the Supabase SQL editor by hand). Validate SQL locally with PGlite if
  there's no Postgres.
- Region: Supabase Frankfurt, Vercel functions `fra1` (`vercel.json`),
  Resend EU. Keep them together.
- CSS: component classes (`.btn`, `.card`, `.input`) live in a custom
  `vente` cascade layer declared below `utilities` in `globals.css`, because
  the pipeline strips `@layer components`. Keyframes go inside `@theme`.
- MapLibre's worker is copied to `public/maplibre/` on `postinstall` and set
  with `setWorkerUrl` (Turbopack can't bundle it).
- Next 16 Cache Components: anything reading cookies, `Date.now()` or the DB
  per request needs `<Suspense>` and/or `await connection()`.
- Place data: `data/places.csv` (committed, from GeoNames via
  `scripts/build-places.ts`); `npm run import:geo` loads it plus postcodes.
- Copy tone: Spain Spanish, "tú", playful. Tuenti references should be real
  Tuenti things (privados, etiquetas, estados), not Facebook ones.

## v1 base (built first)

1. **Quiz** — 10 random questions from `src/content/questions.ts`, 5 s each,
   multiple choice. Server-only scoring: questions are served one at a time
   with no answer, and the time limit is checked on the server. Pass mark is
   **8/10**. Attempts are rate-limited per hashed IP.
2. **Result screen** — made to screenshot and share ("He sacado 9/10 en
   Vente"). Shows which questions you missed, but never the correct answers.
3. **Sign-up** (only after passing, via a single-use signed cookie): email,
   current city (search box), optional postcode, hometown in Spain (municipio).
   We store the city centre and the postcode area's centre, never an address.
   Double opt-in: the email link confirms the sign-up; only confirmed
   sign-ups count on the map.
4. **Public map** — no individual people. Zoomed out: one dot per city, sized
   by count. Zoomed in: one dot per postcode area (shown even with 1 person),
   coloured from light red (1) to very dark red (100+).
5. **Privacy page** (`/privacidad`) — what is stored and why, and how to
   request deletion.

## Roadmap (in order, one at a time — originally "not in v1")

1. **Distances as Spanish routes** — never show a distance as a number; say
   "a un Alicante–Murcia de ti". Editable routes data file (two places in
   Spain, region, coordinates; distances computed, never hand-written). Covers
   every scale from walks inside a city to the longest routes in Spain, with
   multiples beyond that ("dos Madrid–Tenerife"). Several routes per autonomous
   community. Choose the closest route, preferring the reader's home region,
   then nationally famous routes. First use: on the map, how far the reader's
   city is from other cities with Spaniards.
2. **Hometown touches** — "3 murcianos en Dublín" when opening a city; after
   sign-up, how many people from your region are already in.
3. **Accounts and vouching** — email-link sign-in (no passwords). Passing the
   quiz makes you "pendiente". You become "verificado" when two verified
   members vouch for you, or when you join through a verified member's invite
   link. Limited vouches per member; who vouched for whom is recorded. Admin
   page to verify the first members by hand and to remove people.
4. **Individual dots, fuzzy and opt-in** — off by default; verified members
   toggle their own dot. Only verified, signed-in members see individual dots.
   Store and send only a neighbourhood-level blurred position with a stable
   per-person offset; exact coordinates never stored or sent. Distances via
   routes. Block and report on every profile.
5. **Quedadas** — verified members post plans (title, city, date, public
   venue, max people); others join. Shown on the map and in a list per city.
   Private homes are not allowed as venues.

Still out of scope: payments.
