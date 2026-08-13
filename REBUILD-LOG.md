# NYTRC LMS — Rebuild Log

What was broken, and what we did about it. Updated 13 Aug 2026.

**Repos:** work happens in `Vaibhav-Bhav/nytrc-lms`. The reference marketing site is
`nytrc/nytrc-web-lms`.

---

## FIXED

### 1. The app couldn't be deployed at all
`vite.config.ts` never told Nitro to build for Node. The build wrote to `dist/`, but
`npm start` runs `.output/server/index.mjs` — a file that didn't exist. The app could
never have started under PM2.

**Fix:** added `nitro({ preset: 'node-server' })` and `server: { entry: 'server' }` to
`vite.config.ts`. The build now produces `.output/`, and the server boots and serves.

### 2. Two apps were starting at once (the hydration errors)
The repo had both startups running: the correct SSR one (`client.tsx` + `__root.tsx`) and
a leftover SPA one from the Figma export (`index.html` → `main.tsx` → `App.tsx`).
`App.tsx` made a *second* `QueryClient` and a *second* `RouterProvider`.

That is what caused "useRouter must be used inside a RouterProvider", "No QueryClient set",
and the hydration mismatches.

**Fix:** the team had already deleted `index.html`. We deleted `main.tsx` and `App.tsx`
too, so only one startup path remains. Console is now clean.

### 3. React types didn't match React
Runtime was React 18.3, but the type packages were React 19. TypeScript was checking
against the wrong version.

**Fix:** moved `@types/react` and `@types/react-dom` down to 18.x and into
`devDependencies`.

*Note: React 18 itself is fine — TanStack Start supports it. We first thought this was the
cause of the hydration errors. It wasn't.*

### 4. Login was completely broken
Two separate problems stacked:

- Supabase rejected the key hardcoded in `src/lib/supabase.ts` — "Unregistered API key".
- **Nothing loaded `.env`.** `dotenv` was only imported in `scripts/`, never in `src/`. So
  the built server ignored any `.env` file. Adding a correct key would have changed nothing.

**Fix:** `import "dotenv/config"` at the top of `src/server.ts`, moved `dotenv` to
`dependencies`, and deleted the hardcoded key. Missing config now fails with a clear
message instead of a mystery 500. Login works.

### 5. The marketing site had been rewritten, not extended
The LMS was built as a separate project from the Figma export, and the marketing pages
were pasted into it and then rewritten — new hero text, different colours, hero artwork
dropped. Five files were never copied across at all.

**Fix:** restored from the marketing repo — `index`, `about`, `services`, `contact`,
`book`, `styles.css`, `Nav`, `Footer`, `lib/links`, `lib/booking`, `lib/india-districts`,
the session video and poster, and the PWA icons.

Kept: all LMS routes, plus `terms.tsx` and `refund-policy.tsx` (needed for Razorpay).
Added a LOGIN button to the nav, since the marketing site has none.

**Not copied on purpose:** `__root.tsx`. The team added `DarkProvider` there — copying it
over would have broken LMS dark mode. Only the two missing icon links were added by hand.

### 6. The logo was broken in production
`src/assets/nytrc-logo.png.asset.json` was a Lovable placeholder pointing at
`/__l5e/assets-v1/…`, which only Lovable's own dev server can serve. In production it 404'd.

**Fix:** copied the real `nytrc-logo.png` from the marketing repo.

### 7. Google Fonts kept 404ing
Google changed its Public Sans filenames. Browsers holding the old CSS asked for files
that no longer exist. Clearing one browser's cache doesn't fix it for visitors.

**Fix:** self-hosted the fonts. 12 files (428 KB) in `public/fonts`, `src/fonts.css`
generated, Google Fonts link removed. Same three typefaces, so nothing looks different.

*The live marketing site has this same problem and should get the same fix.*

### 8. The favicon was Lovable's
`public/favicon.ico` was still the scaffold default — and technically poor, a single
256×256 image that browsers squash down to 16px.

**Fix:** copied the marketing repo's proper 16/32/48 NYtrc icon set.

### 9. `.env.example` had a real key in it
A working-format Supabase service-role key was committed to the example file on purpose.

**Fix:** blanked the value. **The key itself still needs revoking in Supabase — see
"Needs you" below.**

---

## CHECKED — NOT ACTUALLY BROKEN

Worth recording so nobody re-investigates these.

- **Razorpay webhook signature.** Correct. Reads the raw body before parsing, which is the
  usual trap.
- **Payment fulfilment.** Correct. Access and invoices are granted on the webhook, not the
  browser callback, and replays don't double-grant.
- **GST invoice breakdown.** Correct. Tax is worked backwards from the total, and the
  CGST/SGST vs IGST split by state works. (The *order total* is still wrong — see D-2.)
- **Two-device limit.** Working. 89 session rows but only 3 live, and nobody over the limit.
- **Layering.** Routes → services → repositories → schemas is clean and consistent.

---

## OPEN — SECURITY

### C-2. Payment endpoints have no login check
`/api/payments/order` and `/api/payments/verify` still carry a "TODO: add auth" comment
even though the auth middleware now exists. Anyone can call them and pass any `student_id`.

The price comes from the database and the signature is verified, so this isn't free
courses — but the endpoints can be spammed and orders can be opened against other accounts.

**Fix:** use the session when there is one; keep guest checkout working.

### C-4. A bad password hash returns 500 instead of "wrong password"
`verifyPassword` crashes if a stored hash isn't the exact expected length.

**Fix:** check the length before comparing.

### C-5. Password hashing isn't what the docs asked for
The docs say bcrypt or argon2 from a standard library. The code hand-rolls scrypt with
default settings and no version marker. Not obviously wrong, but undocumented and hard to
upgrade later. **Needs a decision.**

### C-7. Config errors look like crashes
A missing environment variable returns 500. It should return 503 so it's obvious the
problem is configuration, not code.

### E-7. Nothing stops server code reaching the browser
The marketing repo's config fails the build if client code imports a server module. Ours
doesn't, so nothing mechanically prevents the Supabase key ending up in a browser bundle.

**Fix:** turn on `importProtection` and fix whatever it flags.

---

## OPEN — SPEC GAPS

### D-1. There is no 1-year access — access is currently forever
`course_access` has `granted_at` and `revoked_at` but **no `access_start` or `access_end`**.
Confirmed on the live database, not just in the SQL file. So access never expires, and the
"access expired" screen can't be built.

**Do this soon.** There are only 4 rows and all are test data, so migrating is easy now and
gets harder with every real sale.

### D-2. GST is added on top; it should be included
The spec says the shown price includes GST and tax is worked backwards. The code adds 18%
on top, so a ₹12,500 course charges ₹14,750. The checkout screen shows the same, so buyers
aren't surprised — but it's the wrong model.

**Fix:** charge `course.price` exactly. Existing prices were entered pre-tax, so they need
re-checking too.

### D-3. The GST rate is hardcoded
`GST_RATE = 0.18` sits in the code. The docs say it must be a setting, because the
accountant hasn't confirmed the rate.

### D-5. Invoice numbers don't reset each financial year
They run as one continuous sequence. The spec wants a fresh sequence per year. Also, two
payments at the same moment could claim the same number.

### D-6. Uploads go through the server
Videos and PDFs are uploaded to our server, held in memory, then forwarded. The docs say
upload straight from the browser to Bunny/R2, because Cloudflare silently rejects anything
over 100 MB and the droplet only has 2 GB of RAM.

### D-7. PDFs don't use PDF.js
`pdfjs-dist` isn't installed. The spec requires it, because the browser's built-in viewer
has its own download button (defeating view-only) and can't report reading progress.

### D-8. Third device is blocked instead of logging out the oldest
The spec says a third login logs out the oldest device. The code refuses the login and
shows a "choose a device" screen instead. Works, but it's a deviation. **Needs a decision.**

### D-9. No lockout after repeated failed logins
Not built. `login.ts` handles an `ACCOUNT_LOCKED` error that nothing ever throws.

### D-11. `/api/auth/refresh` does nothing
Returns 501. Remove it or build it.

### D-12. The courses in the database are demo data
Four Figma sample courses, including one priced at ₹1. The spec says one real course at
launch.

---

## OPEN — TIDY-UP

### E-1. The UI component library exists twice
`src/components/ui` (46 files) and `src/app/components/ui` (48 files) are near-identical
copies, including two 700-line sidebars. About 7,000 duplicated lines.

### E-4. There are no tests
No test runner. The scripts in `scripts/` are manual, not a suite.

### E-6. The LMS screens use a different design system
`src/styles/` (Inter-based, from the Figma export) is no longer loaded by anything. The LMS
screens now render with the marketing fonts instead. `/login` looks fine, but the
logged-in screens haven't been checked. **Needs a look.**

### E-2. Leftovers from the Figma export
`src/data/mockData.ts`, `src/imports/`, `default_shadcn_theme.css`, `fix.cjs`, and the
orphaned `src/styles/` folder.

### E-3. MUI and Emotion are installed alongside Tailwind
The marketing site doesn't use them. Emotion needs special setup for SSR. If they're barely
used, removing them is easier than configuring them.

---

## NEEDS YOU

1. **Revoke the old Supabase keys.** Two service-role keys were committed to git history.
   Both must be revoked in the dashboard — removing them from the files isn't enough.
2. **Remaining credentials.** `.env` only has Supabase. Razorpay, Resend, Bunny, R2 and the
   GST seller details are missing, so payments, email, video and uploads can't be tested.
3. **Approve the D-1 schema change** — the docs say schema changes need Backend Lead sign-off.
4. **Decide on D-2 pricing, D-8 device limit, C-5 hashing, E-6 fonts, D-12 demo courses.**
5. **Server access.** Nobody has checked `143.110.185.0`. It may still be running the old
   broken build.

---

## NOT YET CHECKED

- The student and admin dashboards, with a real login and the browser console open. This is
  where the team saw the "No QueryClient" error. The cause is fixed, but nobody has watched
  those pages load.
- Whether the live database schema matches `supabase_schema.sql`.
- Payments, uploads and email end to end. The seeded rows show no GST and no leads, so the
  real checkout flow has **never actually run**.
- Anything on the live server.
