# Conventions

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database:** Postgres (hosted via Neon, serverless driver)
- **ORM:** Drizzle ORM
- **Auth:** Better Auth v1.5 — email/password, invite-only signup
- **Styling:** Tailwind CSS v4
- **Validation:** Zod v4
- **Charts:** Recharts
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
    (auth)/               # Auth route group (login, register)
    (app)/                # Authenticated app route group
      admin/              #   swap-config, recipe-review, users, households
      dashboard/
      household/
      profile/
      recipes/            #   catalog, [recipeId], [recipeId]/edit, mine, new
      schedule/
      week/[weekId]/      #   detail + edit
    api/                  # API routes (auth catch-all, invite accept)
  components/
    ui/                   # Generic reusable UI primitives (Button, Card, Input, etc.)
    admin/                # Admin-specific components (role select, delete/reset user)
    contributions/        # Contribution cards, lists, headcount, nutrition chart
    dashboard/            # Dashboard components (my-tasks)
    household/            # Household CRUD, invites, member list
    layout/               # App shell, nav, user menu, opt-out banner
    notifications/        # Bell, item, list
    profile/              # Dietary form, opt-out toggle
    recipe/               # Recipe form, card, grid, search, ingredients, review
    schedule/             # Week list, month nav, settings form, recipe/household order
    swap/                 # Swap day form, info, section
  lib/
    db/
      schema.ts           # Drizzle schema (15 tables, single source of truth)
      index.ts            # Neon serverless client
      migrations/         # Drizzle migration files (0000–0009)
    queries/              # Read-only query functions, grouped by domain
      contributions.ts
      recipes.ts
      schedule.ts
      swap-settings.ts
    auth.ts               # Better Auth server config
    auth-client.ts        # Better Auth client
    auth-utils.ts         # Session helpers (requireSession, requireAdmin, etc.)
    dietary-options.ts    # Allergy and dietary preference option lists
    notifications.ts      # Notification creation helpers
    schedule-utils.ts     # Week/calendar/rotation utilities
    utils.ts              # cn() utility (clsx + tailwind-merge)
    validators.ts         # Zod validation schemas
  actions/                # Server actions, organized by domain
    contributions.ts
    households.ts
    invites.ts
    members.ts
    notifications.ts
    profile.ts
    recipes.ts
    schedule.ts
    swap-days.ts
    swap-settings.ts
```

- **Pages/layouts** go in `src/app/` following Next.js App Router conventions
- **Server actions** go in `src/actions/`, grouped by domain — not co-located in page files
- **Components** go in `src/components/` — `ui/` for generic primitives, feature folders for the rest
- **Database schema** lives in `src/lib/db/schema.ts` as a single source of truth
- **Tests** live next to source files with a `.test.ts` or `.test.tsx` suffix
- Environment variables in `.env.local` (never committed); `.env.example` committed as a template

## Naming

- **Files/folders:** kebab-case (`recipe-card.tsx`, `swap-settings.ts`)
- **React components:** PascalCase (`RecipeCard`, `WeekList`)
- **Variables/functions:** camelCase (`getRecipes`, `headCount`)
- **Types/interfaces:** PascalCase, no `I` prefix (`Household`, not `IHousehold`)
- **Database tables:** snake_case plural (`households`, `swap_days`)
- **Database columns:** snake_case (`start_date`, `household_id`)
- **Drizzle schema objects:** camelCase matching the table (`households`, `swapDays`)
- **Server actions:** verb-first camelCase (`createHousehold`, `updateContribution`, `deleteWeek`)
- **Environment variables:** UPPER_SNAKE_CASE (`DATABASE_URL`, `BETTER_AUTH_SECRET`)
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
