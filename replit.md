# SwasthyaLink

SwasthyaLink is a bilingual, mobile-first personal health record for migrant workers in Kerala.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/swasthyalink` — React/Vite patient app and visual theme
- `artifacts/api-server` — Express API with session auth, profile, and medical record routes
- `lib/api-spec/openapi.yaml` — source of truth for generated API hooks and validation
- `lib/db/src/schema` — Drizzle/PostgreSQL schema for users, sessions, and medical records

## Architecture decisions

- Patient authentication uses opaque, database-backed httpOnly sessions; passwords are hashed with Node's built-in scrypt.
- The QR health card encodes a compact JSON payload of the user's key emergency details and health ID.
- The frontend uses generated OpenAPI hooks so profile and record mutations invalidate or update the visible cache.

## Product

- Register or sign in to receive a health ID
- Maintain name, age, blood group, allergies, emergency contact, and language preference
- Add diagnosis, prescription, and visit records
- View a scannable health card and a high-contrast emergency screen
- Switch the app between English and Malayalam

## User preferences

- Keep the initial version simple and focused on the patient experience; do not add dashboards, AI, or offline sync unless requested.

## Gotchas

- Run API codegen after editing `lib/api-spec/openapi.yaml`.
- Run `pnpm --filter @workspace/db run push` after changing the Drizzle schema.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
