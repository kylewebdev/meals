# Family Meal Co-op — Product Requirements Document

## 1. Overview

A web app that helps an extended family coordinate a weekly meal-swap co-op. Every household cooks one dish (or two in dual-swap weeks) and they all meet up to swap, so each family goes home with a variety of meals. The app coordinates scheduling, swap logistics, a shared recipe catalog with nutritional data, and contribution tracking across 5–6 households.

---

## 2. Core Concepts

### Households (Groups)

- A **household** is the basic unit of the co-op. Every household participates every week.
- Each household contains one or more **individual members**, each with their own login.
- Each household has a designated **head of household** who manages membership for their household.

### Swap Model

- **Every household cooks every week.** There is no rotation — everyone contributes.
- Each household prepares one dish per swap day and brings it to the swap meetup.
- The week's **swap mode** determines how many swap days occur:
  - **Single swap:** One swap day (Sunday) covers the full week (Mon–Fri). Each household makes 1 dish.
  - **Dual swap:** Two swap days. Saturday swap covers Mon–Tue; Wednesday swap covers Wed–Fri. Each household makes 2 dishes total (one per swap day).
- At the swap, households exchange portions so everyone goes home with a variety of meals for the covered days.

### Recipe Rotation

- The admin configures a **recipe rotation order** — an ordered list of approved recipes.
- Recipes cycle deterministically through this order across swap days: each new swap day gets the next recipe in the sequence.
- When the rotation completes, it wraps around to the beginning.

### Household Order

- The admin configures a **household display order** — all households cook every swap day.
- The order can be **fixed** (manually arranged) or **random** (shuffled by admin).
- This controls the display order on schedule and week views.

### Contributions (Auto-Assigned)

- A **contribution** represents a household's assignment for a specific swap day — auto-generated, not manually posted.
- Contributions are created automatically when weeks are populated, with the recipe from the rotation assigned to each.
- All households get the same assigned recipe per swap day.
- Contributions include optional admin-editable notes and serving count.

### Swap Days

- A **swap day** is a scheduled meetup within a week where households physically exchange food.
- Each swap day has logistics info: location, time, and notes (managed by the admin).
- Swap days define a coverage range (e.g., "covers Mon–Fri" or "covers Mon–Tue").

### Recipe Catalog

- A shared **recipe catalog** of approved meals that any household can choose from when posting their contribution.
- Each recipe includes full **nutritional facts** (per-ingredient and per-recipe summary), preparation instructions, and serving details.
- Using a catalog recipe for a contribution is optional — households can also enter a free-text dish name.

---

## 3. User Roles

### Admin

- One designated user (or a small number) who manages the system.
- **Can:** Create/remove households, configure swap days and swap mode for each week, manage the recipe catalog, designate heads of household, resolve disputes, manage system settings.

### Head of Household

- One designated member per household who manages that household's membership.
- **Can (in addition to member abilities):** Invite members to their household, remove members from their household.

### Household Member

- Any individual within a household.
- **Can:** Log in, browse the recipe catalog, view the schedule, post their household's contribution for the week.

---

## 4. Features

### 4.1 Schedule / Calendar View

- A clear calendar or timeline view showing:
  - **Swap mode** for each week (single or dual)
  - **Swap day details** — when and where the swap meetups happen
  - **Contributions** — what each household is bringing (once posted)
  - **Current week** highlighted
- Users can look ahead to see upcoming weeks and look back at past weeks.

### 4.2 Recipe Catalog

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

### 4.3 Weekly Contributions (Auto-Assigned)

- Contributions are **auto-generated** when weeks are created — every household gets a contribution for every swap day.
- The assigned **recipe** comes from the admin-configured recipe rotation order.
- All households cook the same recipe for a given swap day.
- One contribution per household per swap day (enforced by unique constraint).
- Admins can override a contribution's recipe or details if needed.
- Past weeks' contributions remain visible as history/reference.

### 4.4 Swap Day Logistics

- Each swap day has logistics info managed by the admin:
  - **Location** (e.g., "123 Oak St — Aunt Maria's house")
  - **Time** (e.g., "5:00 PM")
  - **Notes** (e.g., "Bring your own containers", "Park in the back")
- This info is displayed prominently on the weekly view.

### 4.5 Household Headcount

- Headcount is **derived from household membership** — each household's member count determines their portion.
- No manual RSVP headcount is needed. Each household knows how many portions to prepare based on total family size.
- A household should be able to indicate if they have a kid or another member that's not going to have an account for that household as an additional person for a meal.
- Optional: a household can mark themselves as **out for the week** if they won't be participating (week opt-outs).

### 4.6 Dietary Restrictions & Allergies

- Each individual member can set dietary info on their profile:
  - Allergies (e.g., peanuts, shellfish, dairy)
  - Dietary preferences (e.g., vegetarian, halal, gluten-free)
  - Free-text notes (e.g., "doesn't like spicy food")
- All households see an **aggregated dietary summary** when planning their contribution — a quick-glance list of everything they need to accommodate across all participating households.

### 4.7 Week Nutrition Summary

- Each week shows an aggregated nutrition summary across all contributions.
- Nutrition data comes from linked catalog recipes (contributions with free-text dish names won't have nutrition data unless the recipe is linked).

### 4.8 Notifications

- **Contribution reminder:** "Don't forget to post what you're bringing this week."
- **Contribution posted:** Alert members when a household posts their contribution.
- **New recipe added:** Optional notification when an admin adds a new recipe to the catalog.
- **Opt-out reset:** Notification when a household's opt-out status resets for a new week.
- Delivery method: In-app notifications at minimum. Email or push notifications as a future enhancement.

---

## 5. User Flows

### 5.1 New Family Onboarding

1. Admin creates households and designates a head for each household.
2. Head of household invites their own members via email invite link.
3. Each member creates an account, joins their household, and fills out their dietary profile.

### 5.2 Typical Weekly Cycle

| Timeframe              | Action                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Before swap day**    | Households check their assigned recipe on the dashboard or schedule                         |
| **Before swap day**    | Households prepare the assigned recipe (portions for all participating families)             |
| **Swap day**           | Households meet at the designated location/time and exchange dishes                         |
| **After swap**         | Families enjoy a variety of meals for the covered days                                      |

_(In dual-swap weeks, this cycle happens twice: once for the Saturday swap and once for the Wednesday swap.)_

### 5.3 Viewing Assigned Recipe

1. Household member navigates to the dashboard or current week view.
2. Sees their assigned recipe for each upcoming swap day.
3. Clicks through to the recipe detail for full instructions and nutrition info.

### 5.4 Admin Configuring the Schedule

1. Admin navigates to the swap config page.
2. Sets the start date, swap mode (single/dual), and default logistics (location, time).
3. Configures the recipe rotation order — an ordered list of approved recipes.
4. Configures the household display order (fixed or random).
5. Weeks auto-populate through end of next month on page load.

---

## 6. Data Model (Simplified)

### Household

- `id`, `name`, `head_id` (user), `members[]`

### Member (User)

- `id`, `name`, `email`, `household_id`, `role` (admin/member)
- `allergies[]`, `dietary_preferences[]`, `dietary_notes`

### Recipe

- `id`, `name`, `description`, `instructions`, `servings`, `prep_time_minutes`, `cook_time_minutes`
- `calories`, `protein_g`, `carbs_g`, `fat_g` (per-serving summary — computed from ingredients or manually overridden)
- `tags[]`, `created_by`, `created_at`, `updated_at`

### Recipe Ingredient

- `id`, `recipe_id`, `name`, `quantity`, `unit`
- `calories`, `protein_g`, `carbs_g`, `fat_g` (per the listed quantity)
- `sort_order`

### Week

- `id`, `start_date`, `status` (upcoming/active/complete), `swap_mode` (single/dual)

### Swap Settings (singleton)

- `id`, `start_date`, `swap_mode`, `recipe_order[]`, `household_order[]`, `household_order_mode`
- `default_location`, `default_time`

### Swap Day

- `id`, `week_id`, `day_of_week`, `label`, `covers_from`, `covers_to`
- `recipe_id` (assigned from rotation), `location`, `time`, `notes`

### Contribution

- `id`, `week_id`, `household_id`, `swap_day_id`
- `recipe_id` (auto-assigned from swap day), `dish_name`, `notes`, `servings`

### Week Opt-Out

- `id`, `user_id`, `week_id`, `reset_notified`

---

## 7. Pages / Screens

1. **Dashboard (Home)** — Current week at a glance: swap mode, swap day logistics, all contributions, nutrition summary.
2. **Schedule** — Calendar/timeline view of weeks, past and future, showing swap modes and contribution status.
3. **Week Detail** — Full view of a specific week: swap days with logistics, all household contributions, nutrition breakdown, dietary summary.
4. **Recipe Catalog** — Browsable list of all approved recipes with nutrition info. Admins can add/edit/remove recipes here.
5. **Recipe Detail** — Full recipe view: ingredients with per-ingredient nutrition, total nutrition summary, instructions, prep/cook time.
6. **Household Profile** — Manage household members, view contribution history.
7. **Member Profile** — Personal settings, dietary info, notification preferences.
8. **Admin Panel** — Manage households, swap configuration, recipe catalog, system settings, and member roles.

---

## 8. Tech Considerations

### Minimum Viable Product (MVP) Priority

Build in this order:

1. User auth + household setup
2. Recipe catalog (admin CRUD, ingredients, nutrition)
3. Swap schedule + calendar view (swap mode config, swap days)
4. Contribution posting (link recipe or free-text dish, per swap day)
5. Swap day logistics (location, time, notes)
6. Dietary profiles + aggregated summary
7. Notifications

### Platform

- **Web app** (mobile-responsive) as the primary platform.
- Consider a PWA (Progressive Web App) approach so family members can "install" it on their phones without needing an app store.

### Auth

- Email/password (keep it simple for less tech-savvy family members).
- Invite-based signup — only people invited by an admin or head of household can join.

---

## 9. Future Enhancements (Post-MVP)

- **Grocery list generation** — auto-generate a shopping list from your contribution recipe, scaled to headcount.
- **Photo sharing** — households post photos of their dishes.
- **Recipe import** — import recipes from external sources (URLs, structured data) to speed up catalog building.
- **Push notifications** — via PWA or native app wrapper.
- **Per-day opt-out** — individual members can mark specific days they won't be eating.
- **Ratings / feedback** — thumbs-up ratings on contributions.
- **Cost sharing** — track and split ingredient costs across households.
