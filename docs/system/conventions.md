# Conventions

## File Organization

```
src/
  app/
    (auth)/               # Login, register
    (app)/                # Authenticated routes
      admin/              #   swap-config, recipe-review, recipe-ratings, users, households
      dashboard/
      household/
      profile/
      recipes/            #   catalog, [recipeId], [recipeId]/edit, mine, new
      schedule/
      week/[weekId]/      #   detail + edit
    api/                  # Auth catch-all, invite accept
  components/
    ui/                   # Primitives (Button, Card, Input, Dialog, etc.)
    admin/                # Role select, delete/reset user
    contributions/        # Cards, lists, headcount, nutrition chart
    dashboard/            # My-tasks
    household/            # CRUD, invites, members, extra portions
    layout/               # App shell, nav, user menu, opt-out banner
    notifications/        # Bell, item, list
    profile/              # Opt-out toggle, portions
    recipe/               # Form, card, grid, search, ingredients, review, ratings, scaling
    schedule/             # Week list, month nav, settings, recipe/household order
    swap/                 # Swap day form, info, section
  lib/
    db/
      schema.ts           # 15 tables, single source of truth
      index.ts            # Neon serverless client
      migrations/         # 0000–0012
    queries/              # Read-only, by domain
    auth.ts               # Better Auth server config
    auth-client.ts        # Better Auth client
    auth-utils.ts         # requireSession, requireAdmin, etc.
    schedule-utils.ts     # Week/calendar/rotation math
    quantity-utils.ts     # Ingredient fraction parsing/scaling
    validators.ts         # Zod schemas
    utils.ts              # cn()
  actions/                # Server actions, by domain
```

Placement rules:
- Pages in `src/app/`, actions in `src/actions/`, components in `src/components/` (ui/ for primitives, feature folders for the rest)
- Schema is single source of truth at `src/lib/db/schema.ts`

## Naming

| What | Convention | Example |
|------|-----------|---------|
| Files/folders | kebab-case | `recipe-card.tsx` |
| Components | PascalCase | `RecipeCard` |
| Vars/functions | camelCase | `getRecipes` |
| Types | PascalCase, no `I` prefix | `Household` |
| DB tables | snake_case plural | `swap_days` |
| DB columns | snake_case | `start_date` |
| Drizzle objects | camelCase | `swapDays` |
| Actions | verb-first camelCase | `createHousehold` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |

## Patterns

- Server components for reads (direct Drizzle queries), server actions for mutations
- Actions return `{ success: true, data }` or `{ success: false, error }`
- Validate inputs with Zod at the action boundary
- `notFound()` / `redirect()` for page-level errors
- Auth checks in actions, not UI. Use `requireSession`, `requireAdmin`, etc.
- Drizzle relational API for reads; core API for insert/update/delete
- Schema changes via Drizzle migrations only
