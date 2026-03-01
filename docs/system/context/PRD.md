# Family Meal Co-op — Product Requirements Document

## 1. Overview

A web app that helps an extended family coordinate a weekly meal prep rotation. Each week, one household is responsible for preparing lunch and dinner for the entire family. The rotation cycles through 5–6 households. The app provides scheduling, meal suggestions, RSVP tracking, cost logging, and logistics coordination.

---

## 2. Core Concepts

### Households (Groups)

- A **household** is the basic unit of the rotation. Each household takes a turn cooking for the full week.
- Each household contains one or more **individual members**, each with their own login.
- One member per household may be designated the household's primary contact.

### Rotation Cycle

- The rotation is a repeating weekly schedule across all participating households (5–6 groups).
- A full cycle lasts 5–6 weeks before repeating.
- The admin can reorder the rotation, add new households, or remove households at any time.

### Weekly Responsibility

- The assigned household preps **lunch and dinner** for the entire family for that week.
- They have **full autonomy** over the menu — meal suggestions and votes from the family are available as inspiration, not requirements.

---

## 3. User Roles

### Admin

- One designated user (or a small number) who manages the system.
- **Can:** Add/remove households and members, set/modify the rotation order, resolve disputes, manage system settings.

### Household Member

- Any individual within a household.
- **Can:** Log in, RSVP for their household, suggest meals, vote on suggestions, view the schedule, view cost logs.

### Cooking Group (role is temporary — assigned by the rotation)

- The household currently on cooking duty for the week.
- **Can (in addition to member abilities):** Post the week's meal plan, log expenses, post pickup/delivery notes, mark meals as complete.

---

## 4. Features

### 4.1 Schedule / Calendar View

- A clear calendar or timeline view showing:
  - **Which household** is cooking each week
  - **What meals** are planned (once the cooking group posts their plan)
  - **Current week** highlighted
- Users can look ahead to see upcoming weeks and look back at past weeks.
- The rotation auto-generates future weeks based on the set order.

### 4.2 Weekly Meal Plan

- Each week has a dedicated page/card where the cooking group posts their plan.
- Fields per day (Monday–Sunday):
  - **Lunch** — meal name and optional description
  - **Dinner** — meal name and optional description
- The cooking group can update the plan throughout the week if things change.
- Past weeks' meal plans remain visible as a history/reference.

### 4.3 Meal Suggestion & Voting System

- Any member can **suggest a meal** at any time. A suggestion includes:
  - Meal name
  - Optional description or notes (e.g., "Grandma's lasagna recipe" or "something light and healthy")
- Other members can **upvote** suggestions they'd like to see.
- The cooking group for an upcoming week can browse suggestions sorted by votes for inspiration.
- Suggestions persist across weeks (they're a running wishlist, not tied to a specific week).
- Once a suggestion has been made (cooked), it could optionally be marked as "fulfilled" to keep the list fresh.

### 4.4 RSVP / Headcount

- Each week, every household submits their **headcount** — how many people will be eating that week.
- The cooking group sees a dashboard with:
  - Total headcount for the week
  - Breakdown by household
- Members can update their RSVP up until a configurable cutoff (e.g., the Saturday before the cooking week starts).
- Optional: per-day headcount if some family members won't need meals certain days.

### 4.5 Dietary Restrictions & Allergies

- Each individual member can set dietary info on their profile:
  - Allergies (e.g., peanuts, shellfish, dairy)
  - Dietary preferences (e.g., vegetarian, halal, gluten-free)
  - Free-text notes (e.g., "doesn't like spicy food")
- The cooking group sees an **aggregated dietary summary** when planning their week — a quick-glance list of everything they need to accommodate based on who RSVP'd.

### 4.6 Pickup / Delivery Notes

- Each week, the cooking group posts logistics info:
  - **Pickup location** (e.g., "123 Oak St — Aunt Maria's house")
  - **Pickup times** or schedule (e.g., "Meals ready by 5pm daily" or specific per-day times)
  - **Additional notes** (e.g., "Bring your own containers" or "I'll drop off to anyone who can't pick up")
- This info is displayed prominently on the weekly view.

### 4.7 Expense Logging

- The cooking group logs their **total grocery/ingredient cost** for the week.
- This is a simple log entry: amount spent + optional receipt photo or notes.
- All members can view a **cost history** showing what each household spent during their week.
- **No balance tracking or debt calculation** — this is purely for transparency and fairness visibility.
- Optional: breakdown by category (groceries, supplies, etc.) — but keep it simple initially.

### 4.8 Notifications

- **Reminders to the upcoming cooking group:** "Your cooking week starts in 3 days" (configurable).
- **RSVP reminders:** "Please submit your headcount for next week by [cutoff date]."
- **Meal plan posted:** Alert all members when the cooking group publishes their menu.
- **New meal suggestion:** Optional notification when someone adds a new suggestion.
- Delivery method: In-app notifications at minimum. Email or push notifications as a future enhancement.

---

## 5. User Flows

### 5.1 New Family Onboarding

1. Admin creates the co-op and sets a name (e.g., "The Martinez Family Meals").
2. Admin adds households and sets the rotation order.
3. Admin invites members via email or share link.
4. Each member creates an account, joins their household, and fills out their dietary profile.

### 5.2 Typical Weekly Cycle

| Timeframe                 | Action                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- |
| **Saturday (prior week)** | RSVP cutoff — all households finalize headcounts                                  |
| **Sunday (prior week)**   | Cooking group reviews headcount + dietary summary, browses voted meal suggestions |
| **Sunday–Monday**         | Cooking group posts their meal plan and pickup/delivery details                   |
| **Monday–Sunday**         | Cooking group preps and distributes meals                                         |
| **End of week**           | Cooking group logs expenses                                                       |
| **Next Monday**           | Rotation advances to the next household                                           |

_(These timings are defaults — the admin can configure cutoff days.)_

### 5.3 Suggesting & Voting on Meals

1. Member navigates to the Suggestions board.
2. Taps "Suggest a Meal" → enters name + optional description.
3. Other members browse suggestions and upvote their favorites.
4. Cooking group checks top suggestions when planning their week.

### 5.4 Swap Requests (Future Enhancement)

- If a household can't cook their assigned week, they can request a swap with another household.
- The other household accepts or declines.
- Admin can also manually reassign weeks.

---

## 6. Data Model (Simplified)

### Household

- `id`, `name`, `rotation_position`, `members[]`

### Member (User)

- `id`, `name`, `email`, `household_id`, `role` (admin/member), `dietary_info`

### Week

- `id`, `start_date`, `household_id` (assigned cooking group), `status` (upcoming/active/complete)
- `pickup_notes`, `expense_amount`, `expense_notes`

### Meal Plan Entry

- `id`, `week_id`, `day_of_week`, `meal_type` (lunch/dinner), `name`, `description`

### Suggestion

- `id`, `author_id`, `name`, `description`, `created_at`, `vote_count`, `status` (open/fulfilled)

### Vote

- `id`, `suggestion_id`, `member_id`

### RSVP

- `id`, `week_id`, `household_id`, `headcount`, `notes`

---

## 7. Pages / Screens

1. **Dashboard (Home)** — Current week at a glance: who's cooking, the meal plan, pickup info, your household's RSVP status.
2. **Schedule** — Calendar/timeline view of the full rotation, past and future.
3. **Week Detail** — Full view of a specific week: meal plan, headcount summary, dietary summary, pickup notes, expense log.
4. **Suggestions Board** — List of all meal suggestions, sortable by votes or recency. Add new suggestions here.
5. **Household Profile** — Manage household members, view your upcoming cooking weeks.
6. **Member Profile** — Personal settings, dietary info, notification preferences.
7. **Admin Panel** — Manage households, rotation order, system settings, and member roles.
8. **Cost History** — Simple ledger view of what each household spent on their weeks.

---

## 8. Tech Considerations

### Minimum Viable Product (MVP) Priority

Build in this order:

1. User auth + household setup
2. Rotation schedule + calendar view
3. Weekly meal plan posting
4. RSVP / headcount
5. Meal suggestion + voting
6. Expense logging
7. Pickup/delivery notes
8. Dietary profiles + aggregated summary
9. Notifications

### Platform

- **Web app** (mobile-responsive) as the primary platform.
- Consider a PWA (Progressive Web App) approach so family members can "install" it on their phones without needing an app store.

### Auth

- Email/password or magic link (keep it simple for less tech-savvy family members).
- Invite-based signup — only people invited by the admin can join.

---

## 9. Future Enhancements (Post-MVP)

- **Swap requests** — households can swap weeks with each other.
- **Recipe storage** — cooking groups can attach full recipes to their meal plans, building a family recipe book over time.
- **Grocery list sharing** — cooking group shares their shopping list with the family.
- **Ratings/feedback** — members can rate the week's meals (keep it positive — thumbs up only, not a 1–5 scale, to avoid hurt feelings).
- **Photo sharing** — cooking group or members post photos of the meals.
- **Balance tracking** — optional mode where costs are split proportionally by headcount and running balances are tracked.
- **Push notifications** — via PWA or native app wrapper.
- **Recurring dietary events** — e.g., "Fridays are meatless for Household C."
