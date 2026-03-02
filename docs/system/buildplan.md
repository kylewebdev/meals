# Build Plan

## Status
Phases 0–4 complete. Last updated: 2026-03-01

## What's Built
- **Phase 0:** Auth, scaffold, Drizzle + Neon, invite-based signup
- **Phase 1:** Households, recipes (CRUD + ingredients + nutrition), notifications, app shell
- **Phase 2:** Swap model (weeks, swap_days, contributions, opt-outs)
- **Phase 3:** Dashboard, schedule calendar, recipe submissions (member submit → admin review), admin swap config
- **Phase 3.5:** Auto-schedule engine — Latin-square recipe rotation, auto-populated weeks, per-contribution recipe assignment
- **Phase 4:** Per-household recipe ratings (love/fine/dislike), admin ratings report
- **Polish:** Sticky header, unified max-w-5xl layout, toast feedback on all forms, dashboard stats row

## Remaining TODOs

### Headcount filtering bug
`getHeadcount` in `src/lib/queries/contributions.ts` counts all users including those without a household. Needs `WHERE household_id IS NOT NULL`.

### Notification improvements
- Stale enum values (`cooking_reminder`, `meal_plan_posted`) and dead-code contribution notifications cleaned up (migration 0014)
- `member_joined` notification fires on invite accept and admin household assignment

### PWA support
Service worker, web manifest, installable on mobile, offline viewing.

### Phase 5: Grocery Lists
Per-contribution grocery list with a shopping-optimized UX.

#### Data model
- `grocery_lists` — `id`, `contribution_id` (unique), `created_at`
- `grocery_items` — `id`, `list_id`, `ingredient_name`, `quantity` (scaled), `unit`, `checked`, `sort_order`

#### Scaling logic
- `scale = neededPortions / recipe.servings`
- Multiply each ingredient's quantity by the scale factor
- Ingredients without a numeric quantity pass through unscaled (e.g., "salt to taste")

#### UI: tabbed ingredient/grocery view
- On the contribution detail view (when a recipe is linked), show two tabs:
  - **Ingredients** — recipe ingredients as-is (existing view)
  - **Grocery List** — scaled ingredients with shopping UX
- If no recipe is linked, hide the grocery list tab entirely

#### Grocery list tab — shopping UX
- Auto-generate and persist the list on first visit
- **Big tap targets** — oversized checkboxes, generous row height for easy mobile use
- **Inline formatting** — "2 cups flour" as a single readable line, not columnar
- **Checked items** — strikethrough + dimmed, sorted to bottom of list
- **Progress counter** — "4 of 12" at top so user knows how many items remain
- **Minimal chrome** — list is the whole view, no distracting surrounding UI
- **Re-sync button** — if recipe ingredients or portions change, user can tap to regenerate the list (resets all checkboxes)

#### Steps
1. Migration: add `grocery_lists` and `grocery_items` tables
2. Query: `getGroceryList(contributionId)` — fetch or auto-create list with scaled items
3. Action: `toggleGroceryItem(itemId)` — toggle checked state
4. Action: `resyncGroceryList(listId)` — delete existing items, regenerate from current recipe/portions
5. UI: add tabs to contribution detail, build grocery list tab component

### Nice-to-haves (Post-MVP)
Photo sharing, recipe import, push notifications, per-day opt-out, cost sharing, sort/filter recipes by rating.

## Schema Summary (15 tables, +2 planned)
**Auth:** user, session, account, verification
**App:** households, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, notifications, invites, week_opt_outs, swap_settings
**Planned (Phase 5):** grocery_lists, grocery_items
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0014 (16 files)
