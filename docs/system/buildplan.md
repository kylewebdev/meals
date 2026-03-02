# Build Plan

## Status
Phases 0–4 complete. Last updated: 2026-03-01

## What's Built
- **Phase 0:** Auth, scaffold, Drizzle + Neon, invite-based signup
- **Phase 1:** Households, recipes (CRUD + ingredients + nutrition), dietary profiles, notifications, app shell
- **Phase 2:** Swap model (weeks, swap_days, contributions, opt-outs)
- **Phase 3:** Dashboard, schedule calendar, recipe submissions (member submit → admin review), admin swap config
- **Phase 3.5:** Auto-schedule engine — Latin-square recipe rotation, auto-populated weeks, per-contribution recipe assignment
- **Phase 4:** Per-household recipe ratings (love/fine/dislike), admin ratings report

## Remaining TODOs

### Headcount filtering bug
`getHeadcount` in `src/lib/queries/contributions.ts` counts all users including those without a household. Needs `WHERE household_id IS NOT NULL`.

### Notification improvements
- `notifyContributionReminder` exists but has no trigger (needs cron or admin action)
- 3 stale enum values in schema (`cooking_reminder`, `meal_plan_posted`, `opt_out_reset`) — never sent, leftover from old model
- `notifyContributionPosted` is obsolete (contributions are auto-generated)

### PWA support
Service worker, web manifest, installable on mobile, offline viewing.

### Nice-to-haves (Post-MVP)
Grocery list generation, photo sharing, recipe import, push notifications, per-day opt-out, cost sharing, sort/filter recipes by rating.

## Schema Summary (15 tables)
**Auth:** user, session, account, verification
**App:** households, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, notifications, invites, week_opt_outs, swap_settings
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0012 (14 files)
