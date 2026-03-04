# Conventions

## File Organization

```
src/
  app/
    (auth)/               # Login, register
    (app)/                # Authenticated routes
      admin/              #   swap-config, recipe-review, recipe-ratings, rotation, users, households
      co-op/              #   Household roster, swap settings
      up-next/            #   Default landing — your cook, swap, recent cooks
      profile/
      recipes/            #   catalog, [recipeId], [recipeId]/edit, mine, new, workshop
      week/[weekId]/      #   detail + edit
      dashboard/          #   redirect → /up-next
      household/          #   redirect → /co-op
      schedule/           #   redirect → /up-next
    api/                  # Auth catch-all, invite accept
  components/
    ui/                   # Primitives (Button, Card, Input, Dialog, Toast, etc.)
    admin/                # Role select, delete/reset user
    contributions/        # Cards, lists, headcount, nutrition chart
    grocery/              # Grocery list tab, ingredient/grocery tabs
    dashboard/            # Upcoming cooks widget
    household/            # CRUD, invites, members, extra people, meals
    layout/               # App shell, nav, user menu, opt-out banner, providers
    notifications/        # Bell, item, list
    profile/              # Meals form (per-meal count)
    recipe/               # Form, card, grid, search, ingredients, review, ratings, scaling, discussion, nav, instruction checklist, nutrition chart, status badge, tags
    schedule/             # Week list, month nav, settings, recipe/household order
    swap/                 # Swap day form, info, section
    up-next/              # Your cook, this week's swap, recent cooks
  lib/
    db/
      schema.ts           # 18 tables, single source of truth
      index.ts            # Neon serverless client
      migrations/         # 0000–0022
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

## Layout

- `<main>` provides padding only (`p-4 md:p-6`) — no max-width constraint
- Each page's outermost `<div>` applies `mx-auto max-w-5xl` (or a wider max for sidebar layouts)
- Pages that need a sidebar (e.g. household) can widen to `2xl:max-w-[83.5rem]` and use `2xl:flex` to place a sidebar beside the top card
- Header is sticky (`sticky top-0 z-40`)

## Recipe Workflow

`submitted → pending_review → approved`. Admin can send back or demote to `submitted`.
- Any member can edit/comment non-approved recipes; only admin edits approved
- All notifications go through `src/lib/notifications.ts` (batch inserts for multi-recipient)

## Toast Feedback

- `ToastProvider` wraps the app in `src/components/layout/providers.tsx`
- Use `useToast()` hook in client components: `const { toast } = useToast()`
- Call `toast('message')` on successful mutations; variants: `success` (default), `error`, `info`
- Auto-dismisses after 3 seconds; renders bottom-right fixed
