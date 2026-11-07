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

- All interface text in **Spanish from Spain**, informal "tú", plain and
  direct. **No emojis, no jokey asides or punch lines** tacked onto sentences
  (owner's rule; it overrides the earlier "playful, Tuenti wink" brief).
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
- Copy tone: Spain Spanish, "tú", plain. No emojis, no punch lines.

## v1 base (built first)

1. **Quiz** — 5 random questions from `src/content/questions.ts`, 10 s each,
   multiple choice. Server-only scoring: questions are served one at a time
   with no answer, and the time limit is checked on the server. Pass mark is
   **4/5** (`QUIZ` in `src/lib/config.ts`). Attempts are rate-limited per hashed IP.
2. **Result screen** — made to screenshot and share ("He sacado 4/5 en
   Vente"). Shows which questions you missed, but never the correct answers.
3. **Sign-up** (only after passing, via a single-use signed cookie): email,
   current city (search box), optional postcode, hometown in Spain (municipio).
   We store the city centre and the postcode area's centre, never an address.
   Double opt-in: the email link confirms the sign-up; only confirmed
   sign-ups count on the map.
4. **Map, unlocked by email** — locked until you pass the quiz **and** leave
   your email **and confirm it** (signed `vente_mapa` cookie, 1 year, set
   by the confirmation link or `/entrar`). Locked visitors get a blurred map and only the totals
   ("Hay 198 españoles en 24 ciudades"); `/api/map` never sends details
   without the cookie. Two tries per person (`QUIZ.maxChances`), counted by
   hashed connection and a browser cookie; after that, write to hola@.
   The owner can then send an **entry link** from `/admin` (signed, 7 days,
   one sign-up): a passed attempt with no questions, so it isn't counted
   as a test. Questions must be known all over Spain and by every age:
   regional or generational ones made real Spaniards fail (35 % pass rate
   until 7 Nov 2026).
   No individual people. Zoomed out: one dot per city, sized
   by count. Zoomed in: one dot per postcode area (shown even with 1 person),
   coloured from light red (1) to very dark red (100+).
5. **Owner tools** — `/admin?clave=ADMIN_KEY` (private numbers; wrong or
   missing key ⇒ 404, data never sent). Vercel Web Analytics for visits.
   `/entrar` ("Ya estoy apuntado"): email link that opens the map on a new
   device without the quiz; same answer whether or not the email exists.
   Email-sending forms (`/entrar`, deletion) are limited to 5/day per
   hashed connection and 3/day per hashed address (`email_sends`,
   migration 0004, rows kept 2 days).
6. **City chat** (`/chat`, built before launch instead of roadmap order) —
   one group chat per metro area (your city + cities abroad within 40 km,
   `CHAT.areaKm`), for confirmed members (signed `vente_sesion`
   cookie, set at sign-up, confirmation and `/entrar`). Nickname + pueblo,
   never the email. Text only, no links, 500 chars, 50 messages/day.
   Polling every 4 s through `/api/chat` (the browser never talks to
   Supabase). Reports go to `/admin`, where the owner hides messages or
   bans people (`banned_at`). Tables in migration 0003.
7. **Privacy page** (`/privacidad`) — what is stored and why, and how to
   request deletion.

## Roadmap (in order, one at a time; originally "not in v1")

1. **Distances as Spanish routes** — never show a distance as a number; say
   "a un Alicante–Murcia de ti". Editable routes data file (two places in
   Spain, region, coordinates; distances computed, never hand-written). Covers
   every scale from walks inside a city to the longest routes in Spain, with
   multiples beyond that ("dos Madrid–Tenerife"). Several routes per autonomous
   community. Choose the closest route, preferring the reader's home region,
   then nationally famous routes. First use: on the map, how far the reader's
   city is from other cities with Spaniards.
   Decisions: routes mix modes (a pie, coche, AVE, tren, ferry, avión) but
   distances are always straight-line from coordinates. The reader's city and
   region come from a `vente_yo` cookie set at sign-up, or a picker for
   visitors (stored only in their browser).
   **Status: built.** Data in `src/content/rutas.ts` (125 routes, edit
   freely), logic in `src/lib/rutas.ts` (`distanciaEnRuta`), check with
   `npm run check:rutas`. Used in map popups and the "Tu ciudad" panel.
2. **Hometown emphasis** — highlight people from your own place, strongest
   first: same pueblo, a pueblo within 15 km of yours ("de al lado", e.g.
   San Javier and San Pedro del Pinatar), same provincia, everyone else.
   Pueblo names are **members-only** (they can identify people), so before
   accounts exist this works at provincia level only.
   **Status: provincia level built.** Demonyms in `src/content/provincias.ts`
   ("3 murcianos"). City popups list where people are from; cities with
   people from your provincia get a yellow ring; after sign-up: "Ya hay 14
   murcianos en Vente". View `city_province_counts` (migration 0002). The
   pueblo and "de al lado" levels arrive with accounts (feature 3).
3. **Accounts and vouching** — email-link sign-in (no passwords). Passing the
   quiz makes you "pendiente". You become "verificado" when two verified
   members vouch for you, or when you join through a verified member's invite
   link. Limited vouches per member; who vouched for whom is recorded. Admin
   page to verify the first members by hand and to remove people. Also turns
   on pueblo-level emphasis for verified members.
4. **Individual dots, fuzzy and opt-in** — off by default; verified members
   toggle their own dot. Only verified, signed-in members see individual dots.
   Store and send only a neighbourhood-level blurred position with a stable
   per-person offset; exact coordinates never stored or sent. Distances via
   routes. Block and report on every profile.
5. **Private chat with people nearby** (the city group chat already exists) — a nearby grid of verified members with their
   dot on ("en tu zona", "en tu ciudad", "cerca"), distances as routes, never
   metres; paisanos (same pueblo, de al lado, provincia) highlighted first.
   One-to-one text chat: you can send one message, and the chat opens when
   they reply. Block/report, daily message limit, text only at first. Never
   GPS: "near" comes from the fuzzy dots.
6. **Quedadas** (last) — verified members post plans (title, city, date,
   public venue, max people); others join. Shown on the map and in a list per
   city. Private homes are not allowed as venues.

Still out of scope: payments.
