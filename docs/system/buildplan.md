# Build Plan

## Status
MVP complete (Phases 0–5). Now in refinement mode. Last updated: 2026-03-03

## Completed Features
- **Recipe Collaboration** — Communal workshop flow: `submitted → pending_review → approved`. Any member can edit/comment on non-approved recipes. Admin sends back or demotes with feedback. Discussion threads on workshop recipes.

## Future Ideas
_Brainstorm bigger features here as they come up._

## Schema Summary (18 tables)
**Auth:** user, session, account, verification
**App:** households, weeks, swap_days, contributions, recipes, recipe_ingredients, recipe_ratings, recipe_comments, notifications, invites, swap_settings, grocery_lists, grocery_items
**Enums:** user_role, week_status, swap_mode, recipe_status, household_order_mode, notification_type, recipe_rating_value
**Migrations:** 0000–0019
