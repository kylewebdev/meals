# Conventions

## Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Database:** Postgres (hosted via Neon or Supabase Postgres)
- **ORM:** Drizzle ORM
- **Auth:** Better Auth or Auth.js — magic link + email/password, invite-only signup
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel
- **Package manager:** pnpm

## Code Style

- TypeScript strict mode enabled
- Use `const` by default; `let` only when reassignment is needed; never `var`
- Prefer arrow functions for callbacks and inline functions
- Use named exports, not default exports (exception: Next.js page/layout files which require default exports)
- Prefer early returns over nested conditionals
- Use template literals over string concatenation
- Max line length: 100 characters (soft limit, don't break readability to enforce)
- Use ESLint (Next.js default config) + Prettier for formatting
- Single quotes for strings, trailing commas, semicolons

## File Organization

```
src/
  app/                    # Next.js App Router pages and layouts
    (auth)/               # Auth route group (login, register, etc.)
    (app)/                # Authenticated app route group
      dashboard/
      schedule/
      week/[weekId]/
      suggestions/
      household/
      admin/
    api/                  # API routes (if needed beyond server actions)
    layout.tsx
    page.tsx
  components/
    ui/                   # Generic reusable UI primitives (Button, Card, Input, etc.)
    [feature]/            # Feature-specific components (e.g., components/schedule/)
  lib/
    db/
      schema.ts           # Drizzle schema definitions
      index.ts            # Drizzle client/connection
      migrations/         # Drizzle migration files
    auth.ts               # Auth configuration
    utils.ts              # Shared utility functions
  actions/                # Server actions, organized by domain
    households.ts
    meals.ts
    rsvp.ts
    suggestions.ts
    weeks.ts
  types/                  # Shared TypeScript types (beyond what Drizzle infers)
```

- **Pages/layouts** go in `src/app/` following Next.js App Router conventions
- **Server actions** go in `src/actions/`, grouped by domain — not co-located in page files
- **Components** go in `src/components/` — `ui/` for generic primitives, feature folders for the rest
- **Database schema** lives in `src/lib/db/schema.ts` as a single source of truth
- **Tests** live next to source files with a `.test.ts` or `.test.tsx` suffix
- Environment variables in `.env.local` (never committed); `.env.example` committed as a template

## Naming

- **Files/folders:** kebab-case (`meal-plan-card.tsx`, `use-headcount.ts`)
- **React components:** PascalCase (`MealPlanCard`, `RSVPForm`)
- **Variables/functions:** camelCase (`getMealPlan`, `headCount`)
- **Types/interfaces:** PascalCase, no `I` prefix (`Household`, not `IHousehold`)
- **Database tables:** snake_case plural (`households`, `meal_plan_entries`)
- **Database columns:** snake_case (`start_date`, `household_id`)
- **Drizzle schema objects:** camelCase matching the table (`households`, `mealPlanEntries`)
- **Server actions:** verb-first camelCase (`createHousehold`, `updateRsvp`, `deleteWeek`)
- **Environment variables:** UPPER_SNAKE_CASE (`DATABASE_URL`, `NEXTAUTH_SECRET`)
- **Route groups:** parenthesized lowercase (`(auth)`, `(app)`)

## Patterns

### Data Fetching
- Use **server components** for initial data loading (direct DB queries via Drizzle)
- Use **server actions** for mutations (forms, button actions)
- Client-side fetching only when needed for real-time or interactive features
- Keep data fetching close to where data is consumed (fetch in the page/layout, pass via props)

### Error Handling
- Server actions return `{ success: true, data }` or `{ success: false, error }` — no thrown errors for expected failures
- Use `notFound()` and `redirect()` from `next/navigation` for page-level errors
- Validate all user input at the server action boundary with Zod

### Auth & Authorization
- Protect routes via middleware or layout-level auth checks
- Server actions must verify the session before performing any mutation
- Role checks (admin, cooking group) happen in server actions, not in the UI

### Database
- All schema changes go through Drizzle migrations — never modify the DB directly
- Use Drizzle's relational query API for reads; insert/update/delete use the core API
- Foreign keys and constraints enforced at the DB level, not just in application code
