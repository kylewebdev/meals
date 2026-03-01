# Family Meal Co-op — Product Requirements Document

## 1. Overview

A web app that helps an extended family coordinate a weekly meal prep rotation. Each week, one household is responsible for preparing lunch and dinner for the entire family. The rotation cycles through 5–6 households. The app provides scheduling, a curated recipe catalog with full nutritional data, RSVP tracking, and logistics coordination.

---

## 2. Core Concepts

### Households (Groups)

- A **household** is the basic unit of the rotation. Each household takes a turn cooking for the full week.
- Each household contains one or more **individual members**, each with their own login.
- Each household has a designated **head of household** who manages membership for their household.

### Rotation Cycle

- The rotation is a repeating weekly schedule across all participating households (5–6 groups).
- A full cycle lasts 5–6 weeks before repeating.
- The admin can reorder the rotation, add new households, or remove households at any time.

### Recipe Catalog

- Admins maintain a **curated recipe catalog** — the set of approved meals that households rotate through.
- Each recipe includes full **nutritional facts** (per-ingredient and per-recipe summary), preparation instructions, and serving details.
- The catalog is the single source of truth for what can be planned each week.

### Weekly Responsibility

- The assigned household preps **lunch and dinner** for the entire family for that week.
- They **select meals from the recipe catalog** when posting their weekly plan.
- They may **modify a recipe** for their week (e.g., swap an ingredient, add a side), but must document the changes and update the nutritional facts. The household that modifies a recipe accepts the additional ingredient costs.

---

## 3. User Roles

### Admin

- One designated user (or a small number) who manages the system.
- **Can:** Create/remove households, set/modify the rotation order, manage the recipe catalog, designate heads of household, resolve disputes, manage system settings.

### Head of Household

- One designated member per household who manages that household's membership.
- **Can (in addition to member abilities):** Invite members to their household, remove members from their household.

### Household Member

- Any individual within a household.
- **Can:** Log in, browse the recipe catalog, view the schedule.

### Cooking Group (role is temporary — assigned by the rotation)

- The household currently on cooking duty for the week.
- **Can (in addition to member abilities):** Select recipes for the week's meal plan, note any recipe modifications (with updated nutrition), post pickup/delivery notes, mark meals as complete.

---

## 4. Features

### 4.1 Schedule / Calendar View

- A clear calendar or timeline view showing:
  - **Which household** is cooking each week
  - **What meals** are planned (once the cooking group posts their plan)
  - **Current week** highlighted
- Users can look ahead to see upcoming weeks and look back at past weeks.
- The rotation auto-generates future weeks based on the set order.

### 4.2 Recipe Catalog (Admin-Managed)

- Admins create and maintain a catalog of approved recipes.
- Each recipe includes:
  - **Name** and **description**
  - **Ingredients list** — each ingredient with quantity, unit, and nutritional data (calories, protein, carbs, fat)
  - **Nutrition summary** — computed from ingredients or manually overridden per recipe (calories, protein, carbs, fat per serving)
  - **Servings** — how many people the recipe feeds as written
  - **Prep time** and **cook time** (optional)
  - **Instructions** — preparation steps
  - **Tags/categories** (optional) — e.g., "vegetarian", "quick", "comfort food"
- Only admins can add, edit, or remove recipes from the catalog.
- All members can browse the catalog at any time.

### 4.3 Weekly Meal Plan

- Each week has a dedicated page/card where the cooking group posts their plan.
- Fields per day (Monday–Sunday):
  - **Lunch** — selected from the recipe catalog
  - **Dinner** — selected from the recipe catalog
- The cooking group can update the plan throughout the week if things change.
- Past weeks' meal plans remain visible as a history/reference.

### 4.4 Recipe Modifications

- When posting their meal plan, the cooking household may **modify a recipe** for a specific day.
- Modifications must include:
  - **What changed** — free-text description of ingredient swaps, additions, or removals
  - **Updated nutrition** — the modified nutritional facts reflecting the changes
- The original recipe in the catalog is never altered — modifications are tied to that specific meal plan entry.
- The household making modifications accepts any additional ingredient costs incurred by deviating from the planned recipe.

### 4.5 Household Headcount

- Headcount is **derived from household membership** — each household's member count determines their portion.
- No manual RSVP headcount is needed. The cooking group sees the total number of people across all households.
- Also a household should be able to elect if they have a kid or another member that's not going to have an account for that household as an additional person for a meal.
- Optional: a household can mark themselves as **out for the week** if they won't be participating.

### 4.6 Dietary Restrictions & Allergies

- Each individual member can set dietary info on their profile:
  - Allergies (e.g., peanuts, shellfish, dairy)
  - Dietary preferences (e.g., vegetarian, halal, gluten-free)
  - Free-text notes (e.g., "doesn't like spicy food")
- The cooking group sees an **aggregated dietary summary** when planning their week — a quick-glance list of everything they need to accommodate across all participating households.

### 4.7 Pickup / Delivery Notes

- Each week, the cooking group posts logistics info:
  - **Pickup location** (e.g., "123 Oak St — Aunt Maria's house")
  - **Pickup times** or schedule (e.g., "Meals ready by 5pm daily" or specific per-day times)
  - **Additional notes** (e.g., "Bring your own containers" or "I'll drop off to anyone who can't pick up")
- This info is displayed prominently on the weekly view.

### 4.8 Notifications

- **Reminders to the upcoming cooking group:** "Your cooking week starts in 3 days" (configurable).
- **Meal plan posted:** Alert all members when the cooking group publishes their menu.
- **New recipe added:** Optional notification when an admin adds a new recipe to the catalog.
- Delivery method: In-app notifications at minimum. Email or push notifications as a future enhancement.

---

## 5. User Flows

### 5.1 New Family Onboarding

1. Admin creates households, sets the rotation order, and designates a head for each household.
2. Head of household invites their own members via email or share link.
3. Each member creates an account, joins their household, and fills out their dietary profile.

### 5.2 Typical Weekly Cycle

| Timeframe               | Action                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Sunday (prior week)**  | Cooking group reviews household counts + dietary summary, browses recipe catalog           |
| **Sunday–Monday**        | Cooking group selects recipes for the week, notes any modifications, posts pickup details  |
| **Monday–Sunday**        | Cooking group preps and distributes meals                                                  |
| **Next Monday**          | Rotation advances to the next household                                                    |

_(These timings are defaults — the admin can configure cutoff days.)_

### 5.3 Selecting Recipes for the Week

1. Cooking group navigates to the weekly meal plan page.
2. For each day (Mon–Sun), selects a recipe from the catalog for lunch and dinner.
3. If modifying a recipe, notes the changes and updates the nutritional facts.
4. Publishes the plan — all members are notified.

### 5.4 Swap Requests (Future Enhancement)

- If a household can't cook their assigned week, they can request a swap with another household.
- The other household accepts or declines.
- Admin can also manually reassign weeks.

---

## 6. Data Model (Simplified)

### Household

- `id`, `name`, `rotation_position`, `head_id` (user), `members[]`

### Member (User)

- `id`, `name`, `email`, `household_id`, `role` (admin/member), `dietary_info`

### Recipe

- `id`, `name`, `description`, `instructions`, `servings`, `prep_time_minutes`, `cook_time_minutes`
- `calories`, `protein_g`, `carbs_g`, `fat_g` (per-serving summary — computed from ingredients or manually overridden)
- `tags[]`, `created_by` (admin), `created_at`, `updated_at`

### Recipe Ingredient

- `id`, `recipe_id`, `name`, `quantity`, `unit`
- `calories`, `protein_g`, `carbs_g`, `fat_g` (per the listed quantity)
- `sort_order`

### Week

- `id`, `start_date`, `household_id` (assigned cooking group), `status` (upcoming/active/complete)
- `pickup_notes`

### Meal Plan Entry

- `id`, `week_id`, `day_of_week`, `meal_type` (lunch/dinner), `recipe_id`
- `is_modified`, `modification_notes` (what changed)
- `modified_calories`, `modified_protein_g`, `modified_carbs_g`, `modified_fat_g` (updated nutrition if modified)

---

## 7. Pages / Screens

1. **Dashboard (Home)** — Current week at a glance: who's cooking, the meal plan (with recipe details + nutrition), pickup info.
2. **Schedule** — Calendar/timeline view of the full rotation, past and future.
3. **Week Detail** — Full view of a specific week: meal plan with recipes, nutrition breakdown, any modifications noted, dietary summary, pickup notes.
4. **Recipe Catalog** — Browsable list of all approved recipes with nutrition info. Admins can add/edit/remove recipes here.
5. **Recipe Detail** — Full recipe view: ingredients with per-ingredient nutrition, total nutrition summary, instructions, prep/cook time.
6. **Household Profile** — Manage household members, view your upcoming cooking weeks.
7. **Member Profile** — Personal settings, dietary info, notification preferences.
8. **Admin Panel** — Manage households, rotation order, recipe catalog, system settings, and member roles.

---

## 8. Tech Considerations

### Minimum Viable Product (MVP) Priority

Build in this order:

1. User auth + household setup
2. Recipe catalog (admin CRUD, ingredients, nutrition)
3. Rotation schedule + calendar view
4. Weekly meal plan posting (select from recipes, modifications)
5. Pickup/delivery notes
6. Dietary profiles + aggregated summary
7. Notifications

### Platform

- **Web app** (mobile-responsive) as the primary platform.
- Consider a PWA (Progressive Web App) approach so family members can "install" it on their phones without needing an app store.

### Auth

- Email/password or magic link (keep it simple for less tech-savvy family members).
- Invite-based signup — only people invited by the admin can join.

---

## 9. Future Enhancements (Post-MVP)

- **Swap requests** — households can swap weeks with each other.
- **Grocery list generation** — auto-generate a shopping list from selected recipes, scaled to headcount.
- **Photo sharing** — cooking group or members post photos of the meals.
- **Recipe import** — import recipes from external sources (URLs, structured data) to speed up catalog building.
- **Push notifications** — via PWA or native app wrapper.
- **Per-day opt-out** — individual members can mark specific days they won't be eating.
