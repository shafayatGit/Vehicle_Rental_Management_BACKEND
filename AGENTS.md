# AGENTS.md

Express 5 + TypeScript vehicle-rental backend (Knex/Postgres, JWT auth, Joi validation, Multer uploads). Feature layer is in `src/modules/` (routes/controllers/services per feature) — most of it is still to be built.

## Commands

npm scripts exist (see `package.json`): `dev` (tsx watch), `build` (`tsc`), `start`, `typecheck`, `lint`, `format`, `migrate`, `migrate:rollback`, `seed`. The only `test` script is a placeholder — no test framework installed.

- Run the server: `npm run dev`
- Typecheck: `npx tsc --noEmit`
- DB: `npm run migrate` / `npm run seed` — driven via `node --import tsx` because the knex CLI cannot load TS under typescript@7 (no ts-node). Config lives at `src/config/knexfile.ts`.

`npx tsc --noEmit` passes on the current code.

## TypeScript / module gotchas

- `package.json` is `"type": "commonjs"` and tsconfig uses `module: "nodenext"` without `verbatimModuleSyntax`, so ESM syntax in `.ts` files is transpiled to CJS. `esModuleInterop` is on. Keep extensionless relative imports.
- **typescript@7 is the native (Go) compiler with no JS API** — tooling that needs TS's JS API (typescript-eslint, ts-node) does not work here. ESLint flat config (`eslint.config.mjs`) therefore `ignores` all `*.ts` files; Prettier does the TS formatting. Don't try to add typescript-eslint.
- tsconfig sets `"types": ["node"]`, so Node globals (`process`, `Buffer`) resolve in `tsc`.
- `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` are on: object access and optional-property assignment must be written defensively (e.g. `Knex.Config | undefined` when indexing a config record).

## Database / env

- `src/config/env.ts` — validates required vars at import time and exports `envVars`. Requires `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `NODE_ENV`, `PORT`. Throws `AppError` if any are missing.
- `src/config/knexfile.ts` — single knex config (pg + `DATABASE_URL`), typed as `{ development: Knex.Config }`. Note: **the knex CLI runs with cwd = the knexfile's folder**, so migration/seed directories use `path.resolve(__dirname, ...)` — keep that pattern if you add paths here.
- `src/config/database.ts` exports a shared knex instance.
- `src/errors/AppError.ts` — error class taking `(statusCode, message)`.
- Migration and seed directories are configured as `./src/database/migrations` and `./src/database/seeds` — these do **not exist yet**; create them before adding migrations/seeds.
- `.env` is gitignored; `.env.example` is committed — mirror any new vars into it.

## Structure

- `src/app.ts` — Express app (json/urlencoded parsers, routes mounted here, then `globalErrorHandler` + `notFound`). `src/server.ts` — binds `app.listen` to `envVars.PORT` with an optional db connectivity check (currently commented out).
- `src/middleware/` — `auth`, `upload` stubs (empty), `globalErrorHandler.ts`, `notFound.ts`.
- `src/modules/`, `src/utils/` — empty dirs; intended home for per-feature modules and shared utils.
- `src/interfaces/error.interface.ts` — `TErrorSources`, `TErrorResponse` consumed by `globalErrorHandler`.
- `uploads/` is gitignored (only `.gitkeep` kept); `dist/`, `.env`, `node_modules/` ignored.