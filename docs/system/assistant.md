# Assistant Instructions

## Stack
Next.js 16 (App Router), TypeScript, Tailwind v4, Drizzle ORM, Neon Postgres, Better Auth v1.5, Zod v4, Recharts, pnpm, Vercel

## Reference Docs
- `docs/system/conventions.md` — file tree, naming, code patterns
- `docs/system/buildplan.md` — implementation status and remaining TODOs
- `docs/system/context/PRD.md` — product requirements (read on demand)

## Key Rules
- Single quotes, trailing commas, semicolons, 100 char soft limit
- Named exports (except page/layout defaults)
- kebab-case files, PascalCase components, camelCase vars, snake_case DB
- Server components for reads, server actions for mutations
- Actions return `{ success: true, data }` or `{ success: false, error }`
- Validate inputs with Zod at the action boundary
- Schema changes via Drizzle migrations only
- Update buildplan.md when completing a step
