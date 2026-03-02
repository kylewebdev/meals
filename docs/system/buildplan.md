# Build Plan — meals

## Status

**Project state: Phases 0–3.5 complete. Remaining: headcount polish, notification triggers, PWA, recipe ratings.**
Last updated: 2026-03-01

---

## Decisions (Resolved)

| Decision            | Choice                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| **Framework**       | Next.js 16 (App Router) + TypeScript                                     |
| **Database**        | Postgres via Neon (serverless driver)                                     |
| **ORM**             | Drizzle ORM                                                              |
| **Auth**            | Email/password (Better Auth v1.5), invite-only signup                    |
| **Styling**         | Tailwind CSS v4 (hand-rolled UI primitives, no external lib)             |
| **Validation**      | Zod v4                                                                   |
| **Charts**          | Recharts                                                                 |
| **Hosting**         | Vercel                                                                   |
| **Package manager** | pnpm                                                                     |
| **Meal model**      | Swap model (everyone cooks, meet to swap) — not rotation                 |
| **Scheduling**      | Auto-schedule: per-household Latin-square recipe rotation                 |
| **PWA**             | Deferred — mobile-responsive from day one                                |

---

## Phase 0 — Project Bootstrap (COMPLETE)

- [x] Scaffold Next.js app with TypeScript, Tailwind CSS v4, pnpm
- [x] Configure ESLint + Prettier
- [x] Initialize git repository
- [x] Create Neon project and configure DATABASE_URL
- [x] Install and configure Drizzle ORM + drizzle-kit
- [x] Define core schema in `src/lib/db/schema.ts`
- [x] Run initial migration (0000)
- [x] Install and configure Better Auth with email/password
- [x] Implement invite-based signup (admin creates invite, member registers)
- [x] Role system: admin vs. member
- [x] Auth middleware to protect `(app)` route group

---

## Phase 1 — MVP Features (COMPLETE)

- [x] Admin can create/remove households
- [x] Admin can designate a head of household
- [x] Head of household can invite/remove members
- [x] Members can view their household profile
- [x] Recipe catalog — CRUD with ingredients, nutrition, tags
- [x] All members can browse/view recipe catalog
- [x] Dietary profiles — allergies, preferences, free-text notes on user profile
- [x] Aggregated dietary summary for meal planning
- [x] In-app notifications (contribution reminders, new recipes, opt-out resets)
- [x] App shell and navigation

---

## Phase 2 — Swap Model Restructure (COMPLETE)

- [x] New schema: `weeks` with `swap_mode` (single/dual)
- [x] New table: `swap_days` — per-week swap day config with logistics
- [x] New table: `contributions` — one per household per swap day
- [x] Dropped old tables: `meal_plan_entries`, `suggestions`, `votes`, `rsvps`
- [x] Contribution posting per household per swap day
- [x] Swap day logistics (admin-managed)
- [x] Week nutrition summary across contributions
- [x] Week opt-outs (households can sit out a week)

---

## Phase 3 — Polish & Remaining MVP Gaps (COMPLETE — except Steps 5–7)

### Step 1: Dashboard & week detail (COMPLETE)

- [x] Dashboard home page: current week at a glance
- [x] MyTasks component showing household's pending contributions
- [x] Week detail page (`/week/[weekId]`)
- [x] PortionDisplay and HeadcountDisplay components
- [x] WeekNutritionChart (Recharts bar chart) on week detail

### Step 2: Schedule view (COMPLETE)

- [x] Week list view with contribution details per swap day
- [x] Month navigation (prev/next/today)

### Step 3: Recipe submissions (COMPLETE)

- [x] Member recipe submission flow (`/recipes/new`)
- [x] Recipe status enum: pending / approved / rejected (migration 0006)
- [x] My Recipes page (`/recipes/mine`)
- [x] Admin review queue (`/admin/recipe-review`)
- [x] Recipe status badge component
- [x] `notifyNewRecipe` and `notifyRecipeReviewed` wired up in recipe actions

### Step 4: Admin swap configuration (COMPLETE)

- [x] Admin can configure swap mode and auto-generate weeks
- [x] Admin UI to set/edit swap day logistics (location, time)
- [x] Replaced by auto-schedule in Phase 3.5

### Step 5: Headcount & portioning (PARTIAL)

- [x] Derive headcount from user table membership
- [x] Headcount adjusts for week opt-outs
- [x] Show headcount and portion calculation on week view
- [ ] Support additional non-account members per household (e.g., kids) — requires `extra_members` column on households
- [ ] Filter headcount to only include users with a household

### Step 6: Notification improvements

- [ ] Wire up `notifyContributionReminder` — defined but never triggered (needs cron or admin action)
- [ ] Alert when all households have posted contributions for a swap day
- [ ] Notification preferences per user
- [ ] Clean up stale notification enum values from old rotation model (`cooking_reminder`, `meal_plan_posted`, `opt_out_reset` — defined but never sent)

### Step 7: PWA support

- [ ] Service worker + web app manifest
- [ ] Installable on mobile devices
- [ ] Offline-capable for viewing cached data

---

## Phase 3.5 — Auto-Schedule with Recipe Rotation (COMPLETE)

- [x] `swap_settings` singleton table — start date, swap mode, recipe order, household order, defaults (migration 0007)
- [x] Auto-populate engine: `ensureWeeksExist()` creates weeks through end of next month on page load
- [x] Per-household Latin-square recipe rotation via `computeHouseholdRecipeIndex()` — each household gets a different recipe per swap day
- [x] Contributions auto-created for every household on every swap day
- [x] Admin settings UI: global config, sortable recipe rotation order, sortable household display order
- [x] Recalculate future weeks when recipe order changes
- [x] Schedule view shows recipe name + household name per contribution
- [x] Removed manual contribution posting flow
- [x] Recipes assigned per-contribution (not per swap day) — migration 0008 dropped `swap_days.recipe_id`
- [x] Unique constraint on `weeks.start_date` to prevent duplicate weeks (migration 0009)

---

## Phase 4 — Recipe Ratings

Per-household recipe ratings to curate the rotation. Each household rates a recipe once (upsertable). 3-tier scale: love / fine / dislike. Admin reviews aggregate data to decide which recipes to keep or drop — no auto-exclusion.

### Step 1: Schema & migration (COMPLETE)

- [x] Add `recipe_rating_value` enum (`love`, `fine`, `dislike`)
- [x] Add `recipe_ratings` table: `id`, `recipe_id` (FK → recipes), `household_id` (FK → households), `rating` (enum), `comment` (text, optional), `rated_by` (FK → user), `created_at`, `updated_at`
- [x] Unique constraint on `(recipe_id, household_id)` — one rating per household per recipe
- [x] Indexes on `recipe_id` and `household_id`
- [x] Add Drizzle relations: recipe → ratings, household → ratings, user → ratings (as rater)
- [x] Run migration (0010)

### Step 2: Server actions & queries (COMPLETE)

- [x] `rateRecipe(recipeId, rating, comment?)` server action — upsert rating for the current user's household
- [x] `getRecipeRatings(recipeId)` query — aggregate counts (loves/fines/dislikes) + per-household breakdown with household name and comment
- [x] `getRecipeRatingSummaries()` query — all rated recipes with aggregate scores, for catalog cards and admin report
- [x] Zod validation for rating input

### Step 3: Recipe detail page — rating widget (COMPLETE)

- [x] Rating widget component: 3 buttons (love / fine / dislike) showing current household selection
- [x] Optional comment field (short text input, shown on expand)
- [x] Aggregate display: "X loved · Y fine · Z disliked" breakdown
- [x] Per-household ratings list (who rated what, with comments)
- [x] Wire into existing recipe detail page (`/recipes/[recipeId]`)

### Step 4: Recipe catalog — rating indicators (COMPLETE)

- [x] Show aggregate rating indicator on recipe cards (e.g., "4/5 loved" or a small bar/icon)
- [ ] Optional: sort/filter recipes by rating in the catalog view

### Step 5: Admin ratings report (COMPLETE)

- [x] New admin page or section: `/admin/recipe-ratings`
- [x] Table of all recipes with aggregate rating breakdown (loves / fines / dislikes)
- [x] Sortable by worst-rated to surface removal candidates
- [x] Link to recipe detail for full per-household breakdown

---

## Phase 5 — Other Enhancements (Post-MVP)

- [ ] **Grocery list generation** — auto-generate shopping list from recipe, scaled to headcount
- [ ] **Photo sharing** — households post photos of their dishes
- [ ] **Recipe import** — import recipes from external sources (URLs, structured data)
- [ ] **Push notifications** — via PWA or native wrapper
- [ ] **Per-day opt-out** — individual members can mark specific days they won't be eating
- [ ] **Cost sharing** — track and split ingredient costs across households

---

## Database Schema Summary (16 Tables)

**Auth (Better Auth managed):** `user`, `session`, `account`, `verification`

**Application:** `households`, `weeks` (unique start_date), `swap_days`, `contributions`, `recipes`, `recipe_ingredients`, `recipe_ratings`, `notifications`, `invites`, `week_opt_outs`, `swap_settings`

**Enums:** `user_role`, `week_status`, `swap_mode`, `recipe_status`, `household_order_mode`, `notification_type`, `recipe_rating_value`

**Migrations:** 0000–0010 (11 total)

---

## Notes

- The PRD is in `docs/system/context/PRD.md`
- Old rotation-based tables dropped via migrations 0002 and 0005
- 3 stale notification enum values (`cooking_reminder`, `meal_plan_posted`, `opt_out_reset`) are leftovers from the rotation model
- `notifyContributionReminder` exists in `src/lib/notifications.ts` but has no trigger
- `notifyContributionPosted` is obsolete — contributions are auto-generated now
- `getHeadcount` counts all users, not just those with a household — needs filtering
- Next steps: finish headcount (non-account members), wire up notification triggers, then recipe ratings
