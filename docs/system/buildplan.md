# Build Plan

## Status
MVP complete (Phases 0–5). Phase 6 complete. Last updated: 2026-03-03

## Schema Summary (18 tables)
**Auth:** user, session, account, verification
**App:** households, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, recipe_comments, notifications, invites, swap_settings, grocery_lists, grocery_items
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0019

---

## Phase 6 — Navigation Restructure ✓

**No database changes.** UI restructure and routing only.

### Overview
Consolidated four tabs into three with clearer purpose and better information density.

| Previous | New | Route |
|----------|-----|-------|
| My Cooks (`/dashboard`) | Up Next (`/up-next`) | `/up-next` (default authenticated landing) |
| Schedule (`/schedule`) | *(merged into Up Next)* | redirect → `/up-next` |
| Recipes (`/recipes`) | Recipes (`/recipes`) | `/recipes` (unchanged) |
| Household (`/household`) | Co-op (`/co-op`) | `/co-op` |

### Step 1 — Routing & Redirects ✓
- [x] Created `src/app/(app)/up-next/page.tsx`
- [x] Created `src/app/(app)/co-op/page.tsx`
- [x] `/dashboard` → redirect to `/up-next`
- [x] `/schedule` → redirect to `/up-next`
- [x] `/household` → redirect to `/co-op`
- [x] `/` → redirect to `/up-next`
- [x] Updated middleware, login, register redirects

### Step 2 — Navigation Bar ✓
- [x] Desktop nav: Up Next · Recipes · Co-op (in `app-shell.tsx`)
- [x] Admin badge on Recipes (pending_review count)
- [x] Dot indicator on Up Next (upcoming cook)
- [x] Mobile bottom tab bar with icons (CalendarDays, BookOpen, Users)
- [x] Badge/dot indicators on mobile tabs
- [x] NavLink extended with `badge` and `dot` props

### Step 3 — Up Next Page ✓
- [x] Two-column layout (`md:grid md:grid-cols-2`)
- [x] Left: Your Cook — next cook card, recipe link, shopping list, upcoming cooks
- [x] Right: This Week's Swap — all households, recipes, servings
- [x] Below: Recent Cooks — last cooks with rating aggregates
- [x] Empty states for no weeks, no cooks, no recipes
- [x] New query: `getRecentCooksForHousehold()`

### Step 4 — Recipes Enhancements ✓
- [x] Admin-only "Review" tab in RecipeNav (links to `/admin/recipe-review`)
- [x] `pendingReview` count in RecipeNavCounts
- [x] `isAdmin` prop threaded through all recipe sub-pages

### Step 5 — Co-op Page ✓
- [x] Swap time/location header from swap_settings
- [x] User's household pinned (editable, highlighted border)
- [x] Other households roster (read-only cards with headcount)
- [x] New component: `HouseholdRosterCard`
- [x] Reused: MemberList, InviteForm, PendingInviteList, ExtraPeopleForm, HouseholdReviews

### Step 6 — Cleanup ✓
- [x] Old routes kept as redirects (dashboard, schedule, household)
- [x] All `revalidatePath()` calls updated to new routes
- [x] All notification `linkUrl` references updated
- [x] All hardcoded route links updated across admin pages, auth pages, week detail
- [x] Middleware updated
- [x] `pnpm build` passes clean
