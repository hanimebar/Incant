# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What It Is

**Incant** is a consumer voice-to-app platform. Users speak or type an idea; Claude picks the best template from a library of 21, customises it (name, colours, fields, config), and deploys it as a hosted PWA at `/u/[username]/[slug]`.

- Domain: `incant.actvli.com` (Vercel)
- Brand: magic/spell metaphor — apps = "spells", dashboard = "spellbook", creating = "casting"
- Colour palette: deep indigo `#0f0a2e` + electric gold `#f5c518`

---

## Commands

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build (validates types + lint)
npm run lint      # ESLint only
```

No test suite — validate via `npm run build`.

---

## Architecture

### Request Flow

1. User types/speaks on `/cast`
2. POST `/api/cast` → auth check → tier limit check → Claude claude-sonnet-4-6 classifies input → returns `{ templateId, config, confidence }`
3. If `confidence < 0.35`, returns 422 with a friendly message
4. Spell saved to `spells` table → user redirected to `/u/[username]/[slug]`
5. Spell page lazy-loads the correct template component and renders it

### Template System

All 21 templates live in `src/templates/`. Each is a `"use client"` component accepting `{ config: TemplateConfig, spellId: string }`. They use `localStorage` keyed by `incant-${spellId}-*` for data persistence (no server-side storage of user app data).

`src/templates/index.ts` — the master map from `TemplateId` to lazy-loaded component. **When adding a template, update all four locations:**
1. `src/types/index.ts` — add to `TemplateId` union
2. `src/templates/index.ts` — add lazy import to `TEMPLATE_COMPONENTS`
3. `src/app/u/[username]/[slug]/SpellRenderer.tsx` — add to `TEMPLATE_MAP`
4. `src/app/api/cast/route.ts` — add description to `TEMPLATE_DESCRIPTIONS` prompt

Each template wraps its content in `<TemplateShell config={config}>` (provides the header with name/description). `TemplateShell` does **not** accept `spellId` — that's only on `TemplateProps`.

### Supabase Client Pattern

Two clients, always use the right one:

| Client | File | Use for |
|--------|------|---------|
| `createClient()` | `src/lib/supabase/server.ts` | Reading auth'd user, respects RLS |
| `createServiceClient()` | `src/lib/supabase/server.ts` | All writes, bypasses RLS |
| `createClient()` | `src/lib/supabase/client.ts` | Browser-only (dashboard mutations) |

`src/middleware.ts` runs on every request to refresh the Supabase session cookie — required for auth to persist across navigations.

### Auth Flow

- Magic link + Google OAuth + GitHub OAuth → all redirect to `/auth/callback?redirect=...`
- `callbackUrl` in login page uses `NEXT_PUBLIC_APP_URL` env var (not `window.location.origin`) to avoid localhost redirects in production
- Supabase trigger `handle_new_user()` auto-creates a `profiles` row on signup with a deduplicated username derived from the email

### Stripe

- `src/lib/stripe.ts` exports `getStripe()` (lazy singleton) and `PLANS` constant with price IDs
- Stripe API version: `"2026-01-28.clover"`
- Webhook at `/api/stripe/webhook` handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Tier is stored on `profiles.tier` and updated via webhook — `stripe_customer_id` is the join key

### Tier Limits

Defined in `src/types/index.ts` as `TIER_LIMITS`:
- `free`: 2 apps, branding shown on shared spells
- `caster`: unlimited, no branding, custom slugs
- `wizard`: everything + code export

`profiles.app_count` is maintained by a Postgres trigger (`update_app_count`) on `INSERT`/`DELETE` of spells rows.

### Database Schema

`supabase/schema.sql` — run this in the Supabase SQL editor to initialise. Tables: `profiles`, `spells`, `templates` (static reference). All have RLS enabled; service role client bypasses RLS for API writes.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All shared types: `Profile`, `Spell`, `TemplateId`, `TemplateConfig`, `CastResult`, `TIER_LIMITS` |
| `src/app/api/cast/route.ts` | Core generation endpoint — Claude call, confidence check, slug generation, spell insert |
| `src/templates/index.ts` | Master template registry |
| `src/app/u/[username]/[slug]/SpellRenderer.tsx` | Client renderer — lazy-loads template, share button, TopNav, HomeScreenBanner |
| `src/middleware.ts` | Supabase session refresh on every request |
| `src/components/TopNav.tsx` | Navigation bar used on `/cast` (dark variant) and spell pages (light variant) |
| `src/components/HomeScreenBanner.tsx` | iOS/Android "Add to Home Screen" prompt — shown once, dismissed to localStorage |

---

## Environment Variables

All required in `.env.local` (and Vercel environment settings):

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

`ANTHROPIC_API_KEY` is checked at request time inside the handler (not module scope) — missing key returns 503 with a JSON error rather than crashing the route.

---

## Conventions

- All API routes: `export const runtime = "nodejs"`
- Pages that fetch from Supabase at request time: `export const dynamic = "force-dynamic"`
- `@/*` path alias resolves to `./src/*`
- No analytics SDK calls — Vercel Analytics injected via `<Analytics />` in `src/app/layout.tsx`
- Resend email client must be lazily initialised (never at module scope)
- Git branch: `Incant` (not `main`)
