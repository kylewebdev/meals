# Build Plan

## Status
Phases 0–6 complete. Last updated: 2026-03-03

## Schema Summary (18 tables)
**Auth:** user, session, account, verification
**App:** households, extra_people, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, recipe_comments, notifications, invites, swap_settings, grocery_lists, grocery_items
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0022

## Routes
| Tab | Route | Purpose |
|-----|-------|---------|
| Up Next | `/up-next` | Default landing — your cook, this week's swap, recent cooks |
| Recipes | `/recipes` | Catalog, mine, workshop, review (admin) |
| Co-op | `/co-op` | Household roster, swap settings, invites |
| — | `/admin/*` | Swap config, recipe review, ratings, rotation, users, households |
| — | `/week/[weekId]` | Week detail + edit |
| — | `/profile` | User settings |

Legacy redirects: `/dashboard` → `/up-next`, `/schedule` → `/up-next`, `/household` → `/co-op`

## Remaining Work
- [ ] Headcount-based household filtering (meals math per swap day)
- [x] PWA (Serwist service worker, manifest, offline caching)
