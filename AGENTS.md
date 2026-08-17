# AGENTS.md

Scaffold for an Express 5 + TypeScript vehicle-rental backend (Knex/Postgres, JWT auth, Joi validation, Multer uploads). Most source files are empty stubs; only `src/config/env.ts` has content.

## Commands

There are **no npm scripts** (the only `test` script is a placeholder; no test framework installed). Don't guess `npm run dev` / `npm run build` — they don't exist.

- Run the server: `npx tsx src/server.ts` (tsx runs TS directly)
- Typecheck: `npx tsc --noEmit`
- DB migrations/seeds: `npx knex migrate:latest` / `cd . && npx knex seed:run` (uses `knexfile.ts`)

`npx tsc --noEmit` passes on the current code.

## TypeScript / module gotchas

- `package.json` is `"type": "commonjs"` and tsconfig uses `module: "nodenext"` without `verbatimModuleSyntax`, so ESM syntax in `.ts` files is transpiled to CJS. `esModuleInterop` is on. Keep extensionless relative imports.
- tsconfig sets `"types": ["node"]`, so Node globals (`process`, `Buffer`) resolve in `tsc`.
- `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` are on: object access and optional-property assignment must be written defensively.

## Database / env

- Two env readers exist, both loaded via `dotenv`:
  - `src/config/env.ts` — validates required vars at import time and exports `envVars`. Requires `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `NODE_ENV`, `PORT`. Throws `AppError` if any are missing.
  - `knexfile.ts` — still reads the legacy `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` set (kept in `.env`); uses `DATABASE_URL` if you migrate it.
- `src/errors/AppError.ts` — error class taking `(statusCode, message)`; shared by env validation and (intended) the error middleware.
- Migration and seed directories are configured as `./src/database/migrations` and `./src/database/seeds` — these do **not exist yet**; create them before adding migrations/seeds.

## Structure

- `src/app.ts` / `src/server.ts` — Express app + listen; currently empty, entrypoint not wired up yet.
- `src/middleware/` — `auth`, `error`, `upload` stubs (upload intends Multer with `UPLOAD_PATH`).
- `uploads/` is gitignored (only `.gitkeep` kept); `dist/`, `.env`, `node_modules/` ignored.