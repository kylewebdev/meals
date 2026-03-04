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

- **Node.js 22+** (recommended — uses React 19 / Next.js 16 features)
- **pnpm** — install with `npm install -g pnpm` if you don't have it
- A **[Neon](https://neon.tech)** Postgres database (free tier works fine)
- A **Cloudflare R2** bucket for recipe image uploads

### 1. Clone and install

```bash
git clone <repo-url>
cd meals
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

| Variable | Required | How to get it |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon dashboard → your project → Connection string (use the pooled connection string) |
| `BETTER_AUTH_SECRET` | Yes | Run `openssl rand -base64 32` to generate a random secret |
| `BETTER_AUTH_URL` | Yes | Already set to `http://localhost:3000` — leave as-is for local dev |
| `R2_ACCOUNT_ID` | Yes | Cloudflare dashboard → R2 → Account ID |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 → Manage R2 API Tokens |
| `R2_SECRET_ACCESS_KEY` | Yes | Same R2 API token page |
| `R2_BUCKET_NAME` | Yes | Name of your R2 bucket (default: `meals`) |
| `R2_PUBLIC_URL` | Yes | Public URL for your R2 bucket |

<details>
<summary><strong>Setting up Neon (database)</strong></summary>

1. Sign up at [neon.tech](https://neon.tech) — the free tier is plenty
2. Click **New Project**, pick a name and the region closest to you
3. On the project dashboard, find the **Connection string** — make sure **Pooled connection** is toggled on
4. Copy the full string (starts with `postgresql://`) and paste it as your `DATABASE_URL`

That's it — Drizzle migrations will create all the tables for you.

</details>

<details>
<summary><strong>Setting up Cloudflare R2 (image storage)</strong></summary>

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) — R2 has a generous free tier (10 GB storage, 10 million reads/month)
2. In the sidebar, go to **R2 Object Storage** → **Create bucket** — name it `meals` (or whatever you like)
3. Enable public access for the bucket:
   - Go to your bucket → **Settings** → **Public access**
   - Enable and note the public URL — this is your `R2_PUBLIC_URL`
4. Grab your **Account ID** from the R2 overview page (right sidebar) → this is `R2_ACCOUNT_ID`
5. Create an API token:
   - Go to **R2 Overview** → **Manage R2 API Tokens** → **Create API Token**
   - Give it **Object Read & Write** permissions, scoped to your `meals` bucket
   - Save the **Access Key ID** → `R2_ACCESS_KEY_ID`
   - Save the **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

</details>

### 3. Set up the database

```bash
# Run all migrations to create tables
pnpm db:migrate

# (Optional) Seed with sample recipes — requires R2 for images
pnpm db:seed
```

You can browse your database anytime with:

```bash
pnpm db:studio
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the login page. Register a new account to get started. The first user can be promoted to admin via Drizzle Studio (`pnpm db:studio`) by setting their role to `admin` in the `user` table.

### First-time setup (in the app)

1. **Register** an account at `/register`
2. **Create a household** — go to Household and set one up
3. **Invite others** — share the invite link with your co-op members
4. **Admin setup** — if you're the admin, head to `/admin` to configure swap days, locations, and start the rotation

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
