# Putting Vente online, step by step

For someone doing this for the first time. Plan about 2 hours. Everything
here is free.

**Golden rule:** keys and passwords never go in a chat, a screenshot, an
email or GitHub. They only go in two places: the `.env.local` file on your
Mac and Vercel's settings. Claude doesn't need any of them.

Keep a password manager (or a private note) open: you'll collect 5 values
along the way.

| Value | Where it comes from | Where it goes |
|---|---|---|
| `SUPABASE_URL` | Supabase | `.env.local` + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | `.env.local` + Vercel |
| `APP_SECRET` | you generate it | `.env.local` (one) + Vercel (a different one) |
| `RESEND_API_KEY` | Resend | Vercel only |
| Supabase database password | Supabase | nowhere, just keep it safe |

---

## 1. GitHub (where the code lives)

Vercel deploys from GitHub, so the code has to be there.

1. Create an account at github.com.
2. Easiest way to upload: install **GitHub Desktop** (desktop.github.com), sign in.
3. File → Add Local Repository → choose the `vente` folder.
4. Click **Publish repository**. Keep **"Keep this code private" ticked**.

Done when you see the repo at github.com/<your-user>/vente.

## 2. Supabase (the database)

1. Go to supabase.com → **Start your project** → sign in with GitHub.
2. **New project**:
   - Name: `vente`
   - Database password: click **Generate**, save it in your password manager.
     The app doesn't use it, but you'll want it if you ever need direct access.
   - Region: **Central EU (Frankfurt)**. This matters for privacy (EU data)
     and speed (Vercel runs in Frankfurt too).
   - Plan: Free.
3. Wait 1–2 minutes while it sets up.
4. Turn on the scheduler for the daily clean-up: left menu **Database →
   Extensions**, search `pg_cron`, switch it on.
5. Create the tables: left menu **SQL Editor → New query**.
   - Open `supabase/migrations/0001_init.sql` from the project, copy
     everything, paste, click **Run**. It should say "Success".
   - New query again, same with `0002_province_counts.sql`.
   - Check: left menu **Table Editor** shows `cities`, `postcodes`,
     `quiz_attempts`, `signups`.
6. Copy the two values:
   - **Project URL**: Project Settings (gear icon) → **Data API** (or **API**).
     Looks like `https://abcdefgh.supabase.co`.
   - **Secret key**: Project Settings → **API Keys**. Use a **secret** key
     (starts with `sb_secret_`). If your dashboard shows **Legacy API keys**
     instead, use the one called `service_role`. **Not** the `anon` /
     `publishable` one.

   The secret key can read and delete everything. Treat it like a bank password.

Note: free projects pause after a week with no visits. If that happens,
open the dashboard and click **Restore**. Once people use the site it stays
awake.

## 3. Your local `.env.local`

In the Terminal, inside the `vente` folder:

```bash
cp .env.example .env.local
openssl rand -base64 32
```

The second command prints a random string: that's your `APP_SECRET`.

Open `.env.local` in any text editor and fill in:

```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
APP_SECRET=the-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_EMAIL=hola@vengavente.com
RESEND_API_KEY=
EMAIL_FROM="Vente <hola@vengavente.com>"
```

Leave `RESEND_API_KEY` empty on your Mac: locally you don't want real emails.
`.env.local` is ignored by git, so it never gets uploaded.

## 4. Load the cities and postcodes (once)

```bash
npm run import:geo
```

It takes a few minutes and ends with "¡Listo!". Check in Supabase → Table
Editor: `cities` has about 41,500 rows, `postcodes` about 430,000.

Then restart the app (`npm run dev`). The "Modo demo" note under the sign-up
form is gone: you're on the real database now. Do the quiz, sign up, and
check the row appears in Supabase → `signups`.

## 5. Email: Resend + Namecheap

Two jobs here: let Vente **send** emails (Resend), and let you **receive**
emails at hola@vengavente.com (ImprovMX, forwards to your Gmail).

### 5a. Resend

1. resend.com → sign up.
2. **Domains → Add Domain** → `vengavente.com`, region **Ireland (eu-west-1)**.
3. Resend shows a list of DNS records (keep this tab open). Usually:
   - TXT `resend._domainkey` (a long value starting with `p=`)
   - MX `send` (something like `feedback-smtp.eu-west-1.amazonses.com`)
   - TXT `send` (`v=spf1 include:amazonses.com ~all`)
   - optional TXT `_dmarc` (`v=DMARC1; p=none;`). Add it too.

### 5b. ImprovMX (receiving hola@vengavente.com)

1. improvmx.com → type `vengavente.com` → forward `hola` to your Gmail.
2. It asks for two MX records and one TXT. You'll add them in the next step.

### 5c. Namecheap

namecheap.com → **Domain List** → **Manage** next to vengavente.com →
**Advanced DNS** tab.

In the **Host** box, Namecheap wants only the part before the domain:
`send`, not `send.vengavente.com`. `@` means the domain itself.

1. **Mail Settings** (lower half): change the dropdown from "Email
   Forwarding" to **Custom MX**. Then add:
   - MX, Host `@`, Value `mx1.improvmx.com`, Priority `10`
   - MX, Host `@`, Value `mx2.improvmx.com`, Priority `20`
   - MX, Host `send`, Value *(from Resend)*, Priority `10`
2. **Host Records** (upper half), **Add New Record**:
   - TXT, Host `@`, Value `v=spf1 include:spf.improvmx.com ~all`
     (there must be only **one** TXT starting with `v=spf1` on `@`)
   - TXT, Host `resend._domainkey`, Value *(the long one from Resend)*
   - TXT, Host `send`, Value *(from Resend)*
   - TXT, Host `_dmarc`, Value `v=DMARC1; p=none;`
3. Click the green tick / **Save all changes**.
4. Wait 10–30 minutes, then click **Verify** in Resend and **Check** in
   ImprovMX. Both should turn green. Send a test email to
   hola@vengavente.com from another account: it should reach your Gmail.

Don't touch the parking records (`www` CNAME, `@` URL redirect) yet: that's
step 7.

### 5d. Resend API key

Resend → **API Keys → Create API Key**: name `vente-production`, permission
**Sending access**, domain `vengavente.com`. It's shown **once**: save it in
your password manager. This one only goes in Vercel.

## 6. Vercel (the website)

1. vercel.com → sign up **with GitHub**. Plan: **Hobby** (free).
2. **Add New… → Project** → import the `vente` repo. It detects Next.js.
3. Before clicking Deploy, open **Environment Variables** and add these
   (one per line, name on the left, value on the right):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | same as `.env.local` |
   | `SUPABASE_SERVICE_ROLE_KEY` | same as `.env.local` |
   | `APP_SECRET` | **a new one**: run `openssl rand -base64 32` again |
   | `NEXT_PUBLIC_SITE_URL` | `https://vengavente.com` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | `hola@vengavente.com` |
   | `RESEND_API_KEY` | the key from 5d |
   | `EMAIL_FROM` | `Vente <hola@vengavente.com>` |

4. **Deploy**. After ~2 minutes you get a `vente-xxx.vercel.app` link. Open it
   on your phone.

Note: Vercel's free Hobby plan is for non-commercial projects. If Vente ever
makes money (ads, paid features), move to Pro.

## 7. Connect vengavente.com to Vercel

1. Vercel → your project → **Settings → Domains** → add `vengavente.com`.
   Accept adding `www.vengavente.com` too (it redirects to the main one).
2. Vercel shows the records it wants, usually:
   - A record, `@` → an IP like `76.76.21.21`
   - CNAME, `www` → something like `cname.vercel-dns.com`

   Use **exactly** what Vercel shows, not these examples.
3. Namecheap → Advanced DNS → Host Records:
   - **Delete** the `www` CNAME to `parkingpage.namecheap.com`.
   - **Delete** the `@` URL Redirect Record.
   - **Add** the A and CNAME records from Vercel.
   - Save.
4. Wait (usually 10–60 minutes, rarely a few hours). Vercel shows
   "Valid Configuration" and sets up HTTPS on its own.

## 8. Test the real thing

On your phone, at https://vengavente.com:

1. Do the quiz and pass.
2. Sign up with your own email → the confirmation email arrives (check spam
   the first time and mark it "not spam").
3. Click the link → you land on the map, and your city has a dot.
4. Supabase → `signups`: your row has `confirmed_at` filled.
5. /privacidad → "Borrar mis datos" with your email → link arrives → your
   row disappears.

## 9. Before you post the link on TikTok

- Put the name of the person responsible for the data in
  `src/app/privacidad/page.tsx` (the `RESPONSABLE` line). It's a legal
  requirement. Ask Claude to do it if you like.
- Review and add quiz questions in `src/content/questions.ts`. 20 leak fast.
- Optional but wise: have someone check the privacy page.

## If something goes wrong

- **Vercel build fails:** Vercel → Deployments → the failed one → Logs.
  Copy the red error text (not your keys) to Claude.
- **"Faltan las claves de Supabase en producción":** an environment variable
  is missing or misspelt in Vercel. Fix it, then Deployments → Redeploy.
- **No emails:** Resend → Domains must say Verified, and `RESEND_API_KEY` must
  be set in Vercel. Resend → Emails shows every attempt and why it failed.
- **A key leaked** (pasted somewhere by mistake): create a new one in that
  service, delete the old one, update `.env.local` and Vercel, redeploy.
