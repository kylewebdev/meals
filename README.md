# Meals

A web app for managing a family meal-swap co-op. Every household cooks one or two dishes each week, the families meet to swap, and everyone goes home with variety. Coordinates scheduling, swap logistics, recipes with nutrition tracking, and contributions across households.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Neon Postgres, Drizzle ORM
- **Auth:** Better Auth v1.5
- **Validation:** Zod v4
- **Charts:** Recharts
- **Package Manager:** pnpm
- **Hosting:** Vercel

## Features

- **Households** — Create and manage co-op households with members and a designated head
- **Swap Scheduling** — Single mode (one swap day) or dual mode (two swap days per week) with configurable locations and times
- **Recipe Catalog** — Submit, review, and browse recipes with ingredients, nutrition info, and images
- **Rotation** — Latin-square based recipe rotation so each household gets a different dish each week
- **Contributions** — Auto-generated per household per swap day, with portion scaling based on headcount
- **Headcount** — Portions calculated from user settings and household extras
- **Recipe Ratings** — Per-household 3-tier ratings (love / fine / dislike)
- **Grocery Lists** — Generated shopping lists scaled to household size
- **Notifications** — In-app notification system
- **Roles** — Admin, Head of Household, and Member roles with scoped permissions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Neon](https://neon.tech) Postgres database

### Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. Run database migrations and seed data:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `pnpm dev`         | Start development server       |
| `pnpm build`       | Build for production            |
| `pnpm start`       | Start production server         |
| `pnpm lint`        | Run ESLint                      |
| `pnpm format`      | Format code with Prettier       |
| `pnpm db:generate` | Generate Drizzle schema changes |
| `pnpm db:migrate`  | Run database migrations         |
| `pnpm db:studio`   | Open Drizzle Studio             |
| `pnpm db:seed`     | Seed database with sample data  |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register
│   ├── (app)/               # Authenticated routes
│   │   ├── admin/           # Swap config, recipe review, rotation, users
│   │   ├── dashboard/       # My Cooks overview
│   │   ├── household/       # Household management
│   │   ├── recipes/         # Recipe catalog and CRUD
│   │   ├── schedule/        # Weekly schedule / calendar
│   │   └── week/[weekId]/   # Week detail and editing
│   └── api/                 # API routes (auth, invites)
├── actions/                 # Server actions by domain
├── components/
│   ├── ui/                  # Hand-rolled UI primitives
│   └── [domain]/            # Feature-specific components
└── lib/
    ├── db/
    │   ├── schema.ts        # Single source of truth (all tables)
    │   └── migrations/      # Drizzle migrations
    ├── queries/             # Read-only queries by domain
    ├── auth.ts              # Better Auth server config
    └── validators.ts        # Zod schemas
```
