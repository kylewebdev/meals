# Build Plan

## Status
Phases 0–5 complete. Last updated: 2026-03-02

## What's Built
- **Phase 0:** Auth, scaffold, Drizzle + Neon, invite-based signup
- **Phase 1:** Households, recipes (CRUD + ingredients + nutrition), notifications, app shell
- **Phase 2:** Swap model (weeks, swap_days, contributions, opt-outs)
- **Phase 3:** Dashboard, schedule calendar, recipe submissions (member submit → admin review), admin swap config
- **Phase 3.5:** Auto-schedule engine — Latin-square recipe rotation, auto-populated weeks, per-contribution recipe assignment
- **Phase 4:** Per-household recipe ratings (love/fine/dislike), admin ratings report
- **Polish:** Sticky header, unified max-w-5xl layout, toast feedback on all forms, dashboard stats row
- **Phase 5:** Per-contribution grocery lists — auto-generated scaled ingredient lists with shopping UX (tabbed view on recipe detail, check-off items, re-sync)

## Remaining TODOs

### Notification improvements
- Stale enum values (`cooking_reminder`, `meal_plan_posted`) and dead-code contribution notifications cleaned up (migration 0014)
- `member_joined` notification fires on invite accept and admin household assignment

### PWA support
Service worker, web manifest, installable on mobile, offline viewing.

### Nice-to-haves (Post-MVP)
Photo sharing, recipe import, push notifications, per-day opt-out, cost sharing, sort/filter recipes by rating.

## Schema Summary (17 tables)
**Auth:** user, session, account, verification
**App:** households, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, notifications, invites, swap_settings, grocery_lists, grocery_items
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0015 + 0012_grocery_lists
