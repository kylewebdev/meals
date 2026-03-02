# Family Meal Co-op — Product Requirements

## Overview
Web app for an extended family meal-swap co-op. Every household cooks one dish (or two in dual-swap weeks), they meet to swap, and each family goes home with variety. Coordinates scheduling, swap logistics, recipes with nutrition, and contributions across 5–6 households.

## Core Concepts

**Households** — basic unit of the co-op. Each has members with logins and a designated head who manages membership.

**Swap Model** — every household cooks every week (not a rotation). Swap mode per week:
- **Single:** 1 swap day (Sunday), covers Mon–Fri
- **Dual:** 2 swap days (Saturday covers Mon–Tue, Wednesday covers Wed–Fri)

**Recipe Rotation** — Latin-square: `(globalIndex + householdIndex) % recipeCount`. Each household gets a different recipe on the same swap day. Admin configures the recipe order list.

**Contributions** — auto-generated when weeks populate. One per household per swap day, with recipe from rotation. Admin can override.

**Swap Days** — scheduled meetup with location, time, notes (admin-managed).

**Headcount** — portions-based: `sum(user.portionsPerMeal) + sum(household.extraPortions)`, adjusted for opt-outs.

**Recipe Ratings** — per-household, 3-tier (love/fine/dislike). Admin reviews aggregates to curate rotation.

## Roles
- **Admin:** manage households, swap config, recipe catalog, user roles
- **Head of Household:** invite/remove members in their household
- **Member:** browse recipes, view schedule, submit recipes (pending approval), rate recipes

## Data Model

| Entity | Key Fields |
|--------|-----------|
| Household | id, name, head_id, extra_portions (0–10) |
| User | id, name, email, household_id, role, allergies[], dietary_preferences[], dietary_notes, portions_per_meal (1–3) |
| Recipe | id, name, description, instructions, servings, prep/cook time, tags[], status (pending/approved/rejected), created_by |
| Recipe Ingredient | id, recipe_id, name, quantity, unit, calories, protein_g, carbs_g, fat_g, sort_order |
| Recipe Rating | id, recipe_id, household_id, rating (love/fine/dislike), comment, rated_by; unique(recipe_id, household_id) |
| Week | id, start_date (unique), status, swap_mode |
| Swap Day | id, week_id, day_of_week, label, covers_from, covers_to, location, time, notes |
| Contribution | id, week_id, household_id, swap_day_id, recipe_id, dish_name, notes, servings |
| Swap Settings | singleton: start_date, swap_mode, recipe_order[], household_order[], household_order_mode, defaults |
| Week Opt-Out | id, user_id, week_id |

Nutrition is computed from ingredients at query time (no per-recipe columns).

## Future Enhancements
Grocery list generation, photo sharing, recipe import, push notifications, per-day opt-out, cost sharing.
