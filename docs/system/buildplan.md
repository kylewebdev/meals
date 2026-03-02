Here is the updated build plan:

# Build Plan — meals

## Status

**Project state: Phase 3 complete, Phase 3.5 (auto-schedule) complete — remaining gaps in headcount, notifications, and PWA**
Last updated: 2026-03-01

Phases 0–3 are done. Phase 3.5 restructured the scheduling model: weeks now auto-populate through end of next month, recipes rotate deterministically across swap days, and all households are auto-assigned to cook every swap day. Manual contribution posting removed. Remaining work: non-account household members (headcount gap), notification triggers/preferences, and PWA.

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
| **Scheduling**      | Auto-schedule: recipe rotation + auto-populate through end of next month |
| **Charts**          | Recharts (added in Phase 3 for nutrition charts)                         |
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

## Phase 3 — Polish & Remaining MVP Gaps (IN PROGRESS)

> Fill in remaining gaps, improve UX, and prepare for real-world use.

### Step 1: Dashboard & week detail improvements (COMPLETE)

- [x] Dashboard home page: current week at a glance with swap mode, logistics, contributions
- [x] MyTasks component showing household's pending contributions
- [x] Week detail page (`/week/[weekId]`): full view with all contributions, nutrition breakdown
- [x] PortionDisplay and HeadcountDisplay components
- [x] WeekNutritionChart (Recharts bar chart) on week detail

### Step 2: Schedule calendar (COMPLETE)

- [x] Month grid calendar with swap-day chips and contribution progress
- [x] Month navigation (prev/next)
- [x] Swap day chips showing day-of-week and contribution count

### Step 3: Recipe submissions (COMPLETE)

- [x] Member recipe submission flow (`/recipes/new`)
- [x] Recipe status enum: pending / approved / rejected (migration 0006)
- [x] My Recipes page (`/recipes/mine`) showing user's submitted recipes
- [x] Admin review queue (`/admin/recipe-review`) with approve/reject actions
- [x] Recipe status badge component
- [x] `recipe_reviewed` notification type for submission feedback

### Step 4: Admin swap configuration (COMPLETE)

- [x] Admin can configure swap mode and generate upcoming weeks
- [x] Auto-generate upcoming weeks with default swap day configuration
- [x] Admin UI to set/edit default swap day logistics (location, time)
- [x] Replaced by auto-schedule in Phase 3.5

### Step 5: Headcount & portioning (PARTIAL)

- [x] Derive headcount from user table membership
- [x] Headcount adjusts for week opt-outs
- [x] Show headcount and portion calculation on week view
- [ ] Support additional non-account members per household (e.g., kids) — requires schema change (`extra_members` on households)
- [ ] Filter headcount to only include users with a household (currently counts all users including admin-only accounts)

### Step 6: Notification improvements

- [ ] Wire up `notifyContributionReminder` — currently defined but never triggered (needs cron job or admin action)
- [ ] Alert when all households have posted contributions for a swap day
- [ ] Notification preferences per user
- [ ] Clean up stale notification types from old rotation model (`cooking_reminder`, `meal_plan_posted`, `opt_out_reset` are defined in enum but never sent)

### Step 7: PWA support

- [ ] Service worker + web app manifest
- [ ] Installable on mobile devices
- [ ] Offline-capable for viewing cached data

---

## Phase 3.5 — Auto-Schedule with Recipe Rotation (COMPLETE)

> Replaced manual week generation and contribution posting with automatic scheduling and recipe rotation.

- [x] New `swap_settings` table (singleton) — start date, swap mode, recipe order, household order, defaults
- [x] New `recipe_id` column on `swap_days` — assigned from recipe rotation
- [x] Migration 0007 — swap_settings table and swap_days.recipe_id
- [x] Auto-populate engine: `ensureWeeksExist()` creates weeks through end of next month on page load
- [x] Recipe rotation: deterministic cycling through admin-configured recipe order
- [x] Household auto-assignment: contributions auto-created for every household on every swap day
- [x] Admin settings UI: global config, recipe rotation order, household display order
- [x] Recalculate future weeks when recipe order changes
- [x] Enhanced calendar: swap-day cells show recipe name + household names
- [x] Removed manual contribution posting (ContributionForm, GenerateWeeksButton deleted)
- [x] Dashboard shows assigned recipes instead of "post dish" prompts
- [x] Week detail shows assigned recipe per swap day, edit page is admin logistics only
- [x] PRD updated with auto-assignment model

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
- [x] Phase 3, Step 1 — Dashboard with MyTasks, PortionDisplay, WeekNutritionChart
- [x] Phase 3, Step 2 — Month grid schedule calendar with swap-day chips
- [x] Phase 3, Step 3 — Member recipe submissions with admin review queue
- [x] Phase 3, Step 4 — Admin swap configuration (complete)
- [x] Phase 3, Step 5 (partial) — Basic headcount from user table with opt-out adjustment
- [x] Migration 0006 — recipe_status enum and status column on recipes
- [x] Phase 3.5 — Auto-schedule with recipe rotation (swap_settings, auto-populate, recipe rotation, removed manual contributions)
- [x] Migration 0007 — swap_settings table and swap_days.recipe_id column

---

## Notes

- The PRD has been updated to reflect the swap model — see `docs/system/context/PRD.md`
- Old rotation-based tables and enums have been dropped via migrations 0002 and 0005
- Recharts added as a dependency in Phase 3 for the week nutrition chart
- 3 stale notification enum values (`cooking_reminder`, `meal_plan_posted`, `opt_out_reset`) are leftovers from the rotation model — should be cleaned up in a future migration
- `notifyContributionReminder` function exists in `src/lib/notifications.ts` but is dead code — no trigger calls it
- `getHeadcount` in queries counts all users, not just those in a household — needs filtering
- `setContribution`, `removeContribution` removed from contributions actions — contributions are now auto-generated
- `GenerateWeeksButton` and `ContributionForm` components deleted
- `SwapDayChip` replaced by `SwapDayDetail` showing recipe + households
- Next steps: finish headcount (non-account members), wire up notification triggers, then PWA