# Build Plan — meals

## Status

**Project state: Phase 0 complete — ready for Phase 1**
Last updated: 2026-03-01

Phase 0 bootstrap is done: Next.js app scaffolded, database schema migrated to Neon, Better Auth configured with email/password login and invite-based registration.

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

- [x] Scaffold Next.js 15 app with TypeScript, Tailwind CSS v4, and pnpm
- [x] Configure ESLint + Prettier
- [x] Initialize git repository and make initial commit
- [x] Fill in `docs/system/conventions.md` with chosen patterns

### Step 2: Set up the database and ORM

- [x] Create Neon project and configure `DATABASE_URL`
- [x] Install and configure Drizzle ORM + drizzle-kit
- [x] Define the core schema in `src/lib/db/schema.ts` (households, weeks, meal_plan_entries, invites, auth tables)
- [x] Run initial migration

### Step 3: Set up auth

- [x] Install and configure auth library (Better Auth)
- [x] Implement email/password login
- [x] Implement invite-based signup (admin creates invite → member registers)
- [x] Role system: admin vs. member (cooking group role is derived from the rotation)
- [x] Auth middleware to protect `(app)` route group

---

## Phase 1 — MVP

> The minimum usable version: households can browse recipes, see who's cooking, select meals from the catalog, and coordinate logistics. Follows the priority order from PRD §8.

### Step 4: Household setup & management

- [ ] Admin can create/remove households
- [ ] Admin can designate a head of household for each household
- [ ] Head of household can invite members to their household
- [ ] Head of household can remove members from their household
- [ ] Members can view their household profile
- [ ] Schema migration: add `head_id` to households, update invites to support head-of-household invitations

### Step 5: Recipe catalog

- [ ] Schema migration: add `recipes`, `recipe_ingredients` tables
- [ ] Admin can create a recipe (name, description, instructions, servings, prep/cook time)
- [ ] Admin can add ingredients to a recipe (name, quantity, unit, per-ingredient nutrition)
- [ ] Per-recipe nutrition summary (computed from ingredients, with manual override option)
- [ ] Admin can edit and remove recipes
- [ ] Optional tags/categories on recipes (e.g., "vegetarian", "quick")
- [ ] All members can browse and view the recipe catalog

### Step 6: Rotation schedule & calendar view

- [ ] Admin sets the rotation order across households
- [ ] Auto-generate future weeks based on the rotation
- [ ] Calendar/timeline view showing which household cooks each week
- [ ] Current week highlighted

### Step 7: Weekly meal plan posting

- [ ] Schema migration: update `meal_plan_entries` to reference `recipe_id`, add modification fields
- [ ] Cooking household selects recipes from the catalog for lunch & dinner each day (Mon–Sun)
- [ ] Cooking household can note recipe modifications with updated nutrition
- [ ] Cooking household can update the plan during the week
- [ ] All members can view current and past meal plans with recipe details + nutrition
- [ ] Headcount derived from household membership (no manual RSVP)

### Step 8: Pickup / delivery notes

- [ ] Cooking household posts pickup location, times, and notes
- [ ] Info displayed prominently on the weekly view

### Step 9: Dietary profiles & aggregated summary

- [ ] Members set allergies, dietary preferences, and free-text notes on their profile
- [ ] Cooking household sees an aggregated dietary summary across all participating households

### Step 10: Notifications (in-app)

- [ ] Reminder to cooking household before their week starts
- [ ] Alert when meal plan is posted
- [ ] Optional alert when a new recipe is added to the catalog

---

## Phase 2 — Enhancements (Post-MVP)

> Features from PRD §9, to be prioritized after MVP launch.

- [ ] **Swap requests** — households can swap cooking weeks
- [ ] **Grocery list generation** — auto-generate a shopping list from selected recipes, scaled to headcount
- [ ] **Ratings / feedback** — thumbs-up-only ratings on the week's meals
- [ ] **Photo sharing** — cooking group or members post meal photos
- [ ] **Recipe import** — import recipes from external sources (URLs, structured data)
- [ ] **Push notifications** — via PWA or native wrapper

---

## Completed Work

- [x] Project scaffolding — docs structure (`docs/system/`), assistant instructions, PRD, conventions template, build plan template
- [x] AI assistant entry points — `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`
- [x] Tech stack decisions resolved (Next.js 15, Neon Postgres, Drizzle, Tailwind v4, Vercel)
- [x] Conventions documented in `docs/system/conventions.md`
- [x] Phase 0 — Project Bootstrap (Next.js scaffold, Drizzle ORM + Neon, Better Auth)

---

## Notes

- The PRD is thorough and stable — see `docs/system/context/PRD.md` for full requirements and data model
- Schema changes needed: `suggestions`, `votes`, and `rsvps` tables from Phase 0 are no longer in the PRD — remove in the Step 4 migration
- Next step: Phase 1, Step 4 — Household setup & management
