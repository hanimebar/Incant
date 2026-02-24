# Incant — CLAUDE.md

## What It Is

**Incant** is a consumer voice-to-app platform. You speak (or type) an idea for a personal micro-app, and it appears — instantly, live, shareable, and usable on your phone as a PWA.

Brand story: *You cast an incantation. Your app appears.*
Tagline candidates:
- *"Cast your idea into an app."*
- *"Just say it. We'll build it."*
- *"Speak. Cast. Done."*

Domain target: `incant.app`

---

## Status

**Stage:** Pre-build — architecture decisions pending (see below).
**Name confirmed:** Incant
**Folder created:** `/home/hani-mebar/Incant`

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Name | Incant |
| Brand angle | Magic/spell — speaking = casting an incantation |
| Output format | PWA hosted on Incant with shareable URLs |
| Viral loop | Users share their app links → others discover Incant |
| Revenue target | €12,000/month within 3 months of launch |

---

## Decisions Pending (answer before build starts)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | **Input method** | Voice + text fallback / Text only (voice later) | Voice + text — voice IS the product |
| 2 | **Generation approach** | Template + AI customization / Free-form LLM generation | Template-based for launch (reliable); free-form as v2 |
| 3 | **App hosting** | Incant-hosted with shareable URLs / Code export | Incant-hosted — drives virality |

---

## Proposed Tech Stack

Consistent with other Äctvli projects:

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase (Postgres + RLS) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Voice input | Web Speech API (browser-native, free) + Whisper API fallback |
| Payments | Stripe |
| Hosting | Vercel |
| Email | Resend (reachout@actvli.com) |

---

## Proposed App Generation Model (Template-based)

Rather than generating arbitrary code (unreliable), Claude:
1. Parses voice/text input
2. Identifies the closest app template from a library of ~20
3. Customizes the template (fields, labels, colors, logic, name)
4. Deploys as a hosted PWA at a unique URL

### Initial Template Library (~20 apps)

| Category | Templates |
|----------|-----------|
| Trackers | Habit tracker, Water intake, Mood tracker, Workout log, Sleep tracker |
| Finance | Expense logger, Tip calculator, Bill splitter, Savings goal tracker |
| Productivity | To-do list, Reading list, Link saver, Daily journal, Goal tracker |
| Social/Fun | Quiz builder, Countdown timer, Simple form/survey, Flashcard deck |
| Custom | Simple table/data entry, Custom reminder |

---

## Proposed Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | €0 | 2 apps, Incant branding on shared links |
| Caster | €7/month | Unlimited apps, custom URL slugs, no branding |
| Wizard | €14/month | Everything + code export, priority generation, early access to new templates |

**Revenue path to €12k/month:**
- ~1,715 users on Caster plan, OR
- Mix of ~1,200 Caster + ~200 Wizard

---

## Proposed App URL Structure

```
incant.app/u/[username]/[app-slug]     # Shared app (public)
incant.app/dashboard                   # User's app library ("spellbook")
incant.app/cast                        # Create new app (voice/text input)
incant.app/explore                     # Public gallery of shared apps
```

---

## Brand / UX Notes

- Apps = **"spells"** or **"casts"** (TBD)
- User's app collection = **"spellbook"**
- Creating an app = **"casting"**
- Generation animation = wand/sparkle effect
- Color palette: deep indigo/purple + electric gold — mystical but modern
- Mobile-first — the experience should feel native on iOS/Android

---

## Shared Conventions (from parent CLAUDE.md)

- Path alias: `@/*` → `./src/*`
- API routes: `export const runtime = 'nodejs'`
- Dark mode: `next-themes` with class strategy
- Email: Resend, lazy initialization, never at module scope
- Service role Supabase client for server-side writes, anon client for browser

---

## Next Steps (in order)

1. Confirm the 3 pending decisions above
2. Initialize Next.js project + install dependencies
3. Set up Supabase schema (users, apps, templates)
4. Build the voice/text input + Claude parsing layer
5. Build template engine (20 templates)
6. Build PWA deployment/hosting layer
7. Build dashboard ("spellbook")
8. Stripe integration
9. Public explore/gallery page
10. Launch
