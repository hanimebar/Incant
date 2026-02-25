# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What It Is

**Incant** is a consumer voice-to-app platform. Users speak or type an idea; Claude classifies it against a library of 65 templates, customises the config (name, colours, fields), and deploys it as a hosted PWA at `/u/[username]/[slug]`.

- Domain: `incant.actvli.com` (Vercel)
- Brand: magic/spell metaphor — apps = "spells", dashboard = "spellbook", creating = "casting"
- Colour palette: deep indigo `#0f0a2e` + electric gold `#f5c518`
- Git branch: `Incant` (not `main`)

---

## Commands

```bash
npm run dev    # Dev server on localhost:3000
npm run build  # Production build — validates types + catches runtime errors
npm run lint   # ESLint only
```

No test suite. Validate all changes with `npm run build`.

---

## Architecture

### Request Flow

1. User types/speaks on `/cast` → `POST /api/cast`
2. Auth check → tier limit check → Claude `claude-sonnet-4-6` classifies input → returns `{ templateId, config, confidence }`
3. If `confidence < 0.35`, returns 422
4. Spell saved to `spells` table → redirect to `/u/[username]/[slug]`
5. Spell page lazy-loads the matching template component and renders it

### Template System (65 templates)

All templates live in `src/templates/`. Each is a `"use client"` component that accepts `TemplateProps` (`config`, `spellId`, `readOnly?`) and wraps its content in `<TemplateShell config={config}>`. Templates persist user data to `localStorage` keyed by `incant-${spellId}-*` — there is no server-side storage of app data.

**When adding a template, update all four locations:**
1. `src/types/index.ts` — add to `TemplateId` union
2. `src/templates/index.ts` — add `lazy()` import to `TEMPLATE_COMPONENTS`
3. `src/app/u/[username]/[slug]/SpellRenderer.tsx` — add `lazy()` import to `TEMPLATE_MAP`
4. `src/app/api/cast/route.ts` — add description to `TEMPLATE_DESCRIPTIONS` prompt

`TemplateShell` does **not** accept `spellId`. `TEMPLATE_COMPONENTS` (used by SpellRenderer) and `TEMPLATE_MAP` (used by the spell page) are kept in sync manually — they contain the same 65 entries.

### Supabase Client Pattern

| Client | File | Use for |
|--------|------|---------|
| `createClient()` | `src/lib/supabase/server.ts` | Auth reads, respects RLS |
| `createServiceClient()` | `src/lib/supabase/server.ts` | All writes, bypasses RLS |
| `createClient()` | `src/lib/supabase/client.ts` | Browser-only mutations (dashboard) |

`src/middleware.ts` refreshes the Supabase session cookie on every request — required for auth to persist across navigations.

### Auth

- Magic link + Google OAuth + GitHub OAuth → all land at `/auth/callback`
- `callbackUrl` uses `NEXT_PUBLIC_APP_URL` (not `window.location.origin`) to avoid localhost URLs in production
- Supabase trigger `handle_new_user()` auto-creates a `profiles` row on signup with a deduplicated username

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/cast` | POST | Core generation: Claude call, slug gen, spell insert |
| `/api/spells/[id]` | PATCH | Edit spell name/config — auth + ownership check, allowlisted fields only |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe events, update `profiles.tier` |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/account` | DELETE | Delete account + all spells |

### Stripe

- `src/lib/stripe.ts` exports `getStripe()` (lazy singleton) and `PLANS` constant
- Stripe API version: `"2026-01-28.clover"`
- Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Tier stored on `profiles.tier`; `stripe_customer_id` is the join key

### Tier Limits (`src/types/index.ts` → `TIER_LIMITS`)

- `free`: 2 apps, branding shown on shared spells
- `caster`: unlimited, no branding, custom slugs
- `wizard`: everything + code export

`profiles.app_count` is maintained by a Postgres trigger (`update_app_count`) on INSERT/DELETE to `spells`.

### PWA / Service Worker

- `public/sw.js` — precaches `/`, `/cast`, icons on install; network-first strategy for all page requests; skips `/api/` and `/_next/` entirely
- `src/components/ServiceWorkerRegistrar.tsx` — null-rendering client component that registers the SW on mount; mounted in `layout.tsx`
- `public/manifest.json` — icons split into separate `"any"` and `"maskable"` entries (combined entries break some Android Chrome versions)
- `src/components/HomeScreenBanner.tsx` — shown to mobile users not in standalone mode; Android tries `beforeinstallprompt` first (one-tap install), falls back to a numbered step modal; iOS shows a Safari-specific step modal

### Database

`supabase/schema.sql` — run in Supabase SQL editor to initialise. Tables: `profiles`, `spells`, `templates` (static reference). All have RLS; service role client bypasses it.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All shared types + `TIER_LIMITS` constant |
| `src/app/api/cast/route.ts` | Core generation endpoint |
| `src/templates/index.ts` | Master template registry (`TEMPLATE_COMPONENTS`) |
| `src/app/u/[username]/[slug]/SpellRenderer.tsx` | Spell renderer (`TEMPLATE_MAP`) + share UI |
| `src/components/TemplateShowcase.tsx` | Landing page tab grid — 65 templates with example prompts and "Cast this →" links to `/cast?prompt=` |
| `src/components/EditSpellModal.tsx` | Post-cast editing modal (name, colour, conditional fields) |
| `src/middleware.ts` | Supabase session refresh on every request |
| `src/lib/supabase/server.ts` | `createClient()` + `createServiceClient()` |
| `public/sw.js` | Service worker — cache strategy + install precache |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://incant.actvli.com
ANTHROPIC_API_KEY
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_CASTER_PRICE_ID
STRIPE_WIZARD_PRICE_ID
```

`ANTHROPIC_API_KEY` is validated inside the handler at request time — missing key returns 503 rather than crashing the route module.

---

## Conventions

- All API routes: `export const runtime = "nodejs"`
- Pages that fetch Supabase at request time: `export const dynamic = "force-dynamic"`
- `@/*` resolves to `./src/*`
- `useSearchParams()` requires a `<Suspense>` boundary — see `/cast` page for the pattern (inner component + Suspense wrapper in the page default export)
- Resend email client: lazily initialised, never at module scope
- Service worker cache version: bump `CACHE = 'incant-vN'` in `public/sw.js` after deployments that require cache invalidation
