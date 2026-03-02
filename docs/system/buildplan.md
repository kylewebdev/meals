# Build Plan — meals

## Status

**Project state: Phase 2 complete — ready for Phase 3**
Last updated: 2026-03-01

Phases 0–2 are done: Next.js app scaffolded, database schema migrated to Neon, Better Auth configured, full UI built out with households, recipes, dietary profiles, notifications, and the swap model restructure (single/dual swap modes, contributions, swap day logistics, week nutrition summary).

---

## Decisions (Resolved)

| Decision            | Choice                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| **Framework**       | Next.js 16 (App Router) + TypeScript                                     |
| **Database**        | Postgres via Neon                                                        |
| **ORM**             | Drizzle ORM                                                              |
| **Auth**            | Email/password (Better Auth), invite-only signup                         |
| **Styling**         | Tailwind CSS v4                                                          |
| **Hosting**         | Vercel                                                                   |
| **Package manager** | pnpm                                                                     |
| **Meal model**      | Swap model (everyone cooks, meet to swap) — not rotation                 |
| **PWA**             | Deferred — mobile-responsive from day one                                |

Full conventions documented in `docs/system/conventions.md`.

---

## Phase 0 — Project Bootstrap (COMPLETE)

> Set up the development environment and foundational project structure.

- [x] Scaffold Next.js app with TypeScript, Tailwind CSS v4, and pnpm
- [x] Configure ESLint + Prettier
- [x] Initialize git repository and make initial commit
- [x] Fill in `docs/system/conventions.md` with chosen patterns
- [x] Create Neon project and configure `DATABASE_URL`
- [x] Install and configure Drizzle ORM + drizzle-kit
- [x] Define the core schema in `src/lib/db/schema.ts`
- [x] Run initial migration
- [x] Install and configure Better Auth with email/password
- [x] Implement invite-based signup (admin creates invite, member registers)
- [x] Role system: admin vs. member
- [x] Auth middleware to protect `(app)` route group

---

## Phase 1 — MVP Features (COMPLETE)

> Core UI, household management, recipes, dietary profiles, and notifications.

- [x] Admin can create/remove households
- [x] Admin can designate a head of household
- [x] Head of household can invite/remove members
- [x] Members can view their household profile
- [x] Recipe catalog — admin CRUD with ingredients, nutrition, tags
- [x] All members can browse and view the recipe catalog
- [x] Dietary profiles — allergies, preferences, free-text notes on user profile
- [x] Aggregated dietary summary for meal planning
- [x] In-app notifications (contribution reminders, new recipes, opt-out resets)
- [x] App shell and navigation

---

## Phase 2 — Swap Model Restructure (COMPLETE)

> Replaced the old rotation model (one household cooks per week) with the swap model (everyone cooks, meet to swap).

- [x] New schema: `weeks` with `swap_mode` (single/dual), no `household_id`
- [x] New table: `swap_days` — per-week swap day config with logistics (location, time, notes)
- [x] New table: `contributions` — one per household per swap day (recipe or dish_name, notes, servings)
- [x] Dropped old tables: `meal_plan_entries`, `suggestions`, `votes`, `rsvps`
- [x] Dropped old enum: `meal_type`
- [x] Removed `rotation_position` from households
- [x] Contribution posting per household per swap day
- [x] Swap day logistics (admin-managed)
- [x] Week nutrition summary across contributions
- [x] Schedule calendar shows swap mode instead of cooking household
- [x] Week opt-outs (households can sit out a week)

---

## Phase 3 — Polish & Remaining MVP Gaps

> Fill in remaining gaps, improve UX, and prepare for real-world use.

### Step 1: Dashboard & week detail improvements

- [ ] Dashboard home page: current week at a glance with swap mode, logistics, contributions
- [ ] Week detail page: full view with all contributions, nutrition breakdown, dietary summary
- [ ] Quick-add contribution from dashboard

### Step 2: Headcount & portioning

- [ ] Derive headcount from household membership
- [ ] Support additional non-account members per household (e.g., kids)
- [ ] Show total headcount on week view so households know how many servings to prepare

### Step 3: Admin swap configuration UX

- [ ] Admin can configure swap mode and swap days for upcoming weeks
- [ ] Admin can set default swap day logistics
- [ ] Auto-generate upcoming weeks with default swap configuration

### Step 4: Notification improvements

- [ ] Contribution reminder before swap day
- [ ] Alert when all households have posted contributions for a swap day
- [ ] Notification preferences per user

### Step 5: PWA support

- [ ] Service worker + web app manifest
- [ ] Installable on mobile devices
- [ ] Offline-capable for viewing cached data

---

## Phase 4 — Enhancements (Post-MVP)

> Features from PRD §9, to be prioritized after MVP launch.

- [ ] **Grocery list generation** — auto-generate a shopping list from contribution recipe, scaled to headcount
- [ ] **Ratings / feedback** — thumbs-up ratings on contributions
- [ ] **Photo sharing** — households post photos of their dishes
- [ ] **Recipe import** — import recipes from external sources (URLs, structured data)
- [ ] **Push notifications** — via PWA or native wrapper
- [ ] **Per-day opt-out** — individual members can mark specific days they won't be eating
- [ ] **Cost sharing** — track and split ingredient costs across households

---

## Completed Work

- [x] Project scaffolding — docs structure, assistant instructions, PRD, conventions, build plan
- [x] AI assistant entry points — `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`
- [x] Tech stack decisions resolved
- [x] Conventions documented in `docs/system/conventions.md`
- [x] Phase 0 — Project Bootstrap
- [x] Phase 1 — MVP Features (UI, households, recipes, dietary, notifications)
- [x] Phase 2 — Swap Model Restructure (single/dual swap, contributions, swap day logistics)

---

## Notes

- The PRD has been updated to reflect the swap model — see `docs/system/context/PRD.md`
- Old rotation-based tables and enums have been dropped via migrations 0002 and 0005
- Next step: Phase 3 — polish, headcount, admin UX, and PWA
