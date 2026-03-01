# Build Plan — meals

## Status

**Project state: Ready for Phase 0**
Last updated: 2026-03-01

All key decisions are resolved. The project contains scaffolding docs and conventions. No source code yet — ready to bootstrap.

---

## Decisions (Resolved)

| Decision            | Choice                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| **Framework**       | Next.js 15 (App Router) + TypeScript                                     |
| **Database**        | Postgres via Neon                                                        |
| **ORM**             | Drizzle ORM                                                              |
| **Auth**            | Magic link + email/password (Better Auth or Auth.js), invite-only signup |
| **Styling**         | Tailwind CSS v4                                                          |
| **Hosting**         | Vercel                                                                   |
| **Package manager** | pnpm                                                                     |
| **PWA**             | Deferred to Phase 2 — mobile-responsive from day one                     |

Full conventions documented in `docs/system/conventions.md`.

---

## Phase 0 — Project Bootstrap

> Set up the development environment and foundational project structure.

### Step 1: Initialize the project

- [ ] Scaffold Next.js 15 app with TypeScript, Tailwind CSS v4, and pnpm
- [ ] Configure ESLint + Prettier
- [ ] Initialize git repository and make initial commit
- [x] Fill in `docs/system/conventions.md` with chosen patterns

### Step 2: Set up the database and ORM

- [ ] Create Neon project and configure `DATABASE_URL`
- [ ] Install and configure Drizzle ORM + drizzle-kit
- [ ] Define the core schema in `src/lib/db/schema.ts` (households, members, weeks, meal_plan_entries, suggestions, votes, rsvps)
- [ ] Run initial migration

### Step 3: Set up auth

- [ ] Install and configure auth library (Better Auth or Auth.js)
- [ ] Implement magic link + email/password login
- [ ] Implement invite-based signup (admin creates invite → member registers)
- [ ] Role system: admin vs. member (cooking group role is derived from the rotation)
- [ ] Auth middleware to protect `(app)` route group

---

## Phase 1 — MVP

> The minimum usable version: households can see who's cooking, post meals, and RSVP. Follows the priority order from PRD §8.

### Step 4: Household setup & management

- [ ] Admin can create the co-op and name it
- [ ] Admin can add/remove households
- [ ] Admin can add/remove members to households
- [ ] Members can view their household profile

### Step 5: Rotation schedule & calendar view

- [ ] Admin sets the rotation order across households
- [ ] Auto-generate future weeks based on the rotation
- [ ] Calendar/timeline view showing which household cooks each week
- [ ] Current week highlighted

### Step 6: Weekly meal plan posting

- [ ] Cooking group can post lunch & dinner for each day (Mon–Sun)
- [ ] Cooking group can update the plan during the week
- [ ] All members can view current and past meal plans

### Step 7: RSVP / headcount

- [ ] Each household submits a headcount per week
- [ ] Cooking group sees a dashboard with total + per-household breakdown
- [ ] Configurable RSVP cutoff date
- [ ] Members can update RSVP until cutoff

### Step 8: Meal suggestion & voting

- [ ] Any member can suggest a meal (name + optional description)
- [ ] Members can upvote suggestions
- [ ] Suggestions board sorted by votes or recency
- [ ] Optional: mark a suggestion as "fulfilled" once cooked

### Step 9: Expense logging

- [ ] Cooking group logs total grocery cost for their week
- [ ] Optional notes or receipt photo
- [ ] All members can view cost history across weeks

### Step 10: Pickup / delivery notes

- [ ] Cooking group posts pickup location, times, and notes
- [ ] Info displayed prominently on the weekly view

### Step 11: Dietary profiles & aggregated summary

- [ ] Members set allergies, dietary preferences, and free-text notes on their profile
- [ ] Cooking group sees an aggregated dietary summary based on who RSVP'd

### Step 12: Notifications (in-app)

- [ ] Reminder to cooking group before their week starts
- [ ] RSVP reminders to all households
- [ ] Alert when meal plan is posted
- [ ] Optional alert for new meal suggestions

---

## Phase 2 — Enhancements (Post-MVP)

> Features from PRD §9, to be prioritized after MVP launch.

- [ ] **Swap requests** — households can swap cooking weeks
- [ ] **Recipe storage** — attach full recipes to meal plans, building a family recipe book
- [ ] **Grocery list sharing** — cooking group shares their shopping list
- [ ] **Ratings / feedback** — thumbs-up-only ratings on the week's meals
- [ ] **Photo sharing** — cooking group or members post meal photos
- [ ] **Balance tracking** — optional cost splitting proportional to headcount
- [ ] **Push notifications** — via PWA or native wrapper
- [ ] **Per-day RSVP** — headcount varies by day of the week
- [ ] **Recurring dietary events** — e.g., "Fridays are meatless for Household C"

---

## Completed Work

- [x] Project scaffolding — docs structure (`docs/system/`), assistant instructions, PRD, conventions template, build plan template
- [x] AI assistant entry points — `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`
- [x] Tech stack decisions resolved (Next.js 15, Neon Postgres, Drizzle, Tailwind v4, Vercel)
- [x] Conventions documented in `docs/system/conventions.md`

---

## Notes

- The PRD is thorough and stable — see `docs/system/context/PRD.md` for full requirements and data model
- The project is not yet a git repository (no git history detected)
- Next step: Phase 0, Step 1 — scaffold the Next.js app and make the initial commit
