# AGENTS.md

Express 5 + TypeScript vehicle-rental backend (Knex/Postgres, JWT auth, Joi validation, Multer/Cloudinary uploads). Feature layer is in `src/modules/` (routes/controllers/services per feature) — `auth` and `vehicles` are built; `rentals` and `reports` remain.

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
- **Express 5 gotchas:** `req.query` is a getter-only accessor — `validate.middleware.ts` must use `Object.defineProperty(req, "query", { value, writable: true, configurable: true, enumerable: true })` instead of assignment (throws `Cannot set property query of #<IncomingMessage>`). `req.body`/`req.params` are settable normally. `multer-storage-cloudinary` `params` must use the **callback form** `params: () => ({...})` to satisfy its strict `Params` typing.

## Database / env

- `src/config/env.ts` — validates required vars at import time and exports `envVars`. Requires `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `NODE_ENV`, `PORT`, `DB_POOL_MIN`, `DB_POOL_MAX`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Throws `AppError` if any are missing.
- `src/config/knexfile.ts` — single knex config (pg + `DATABASE_URL`), typed as `{ development: Knex.Config }`. Note: **the knex CLI runs with cwd = the knexfile's folder**, so migration/seed directories use `path.resolve(__dirname, ...)` — keep that pattern if you add paths here.
- `src/config/database.ts` exports a shared knex instance.
- `src/errors/AppError.ts` — error class taking `(statusCode, message, errorSources?)`; shared by env validation, auth, and the error middleware.
- Migration and seed directories are `src/database/migrations` and `src/database/seeds`. Migrations: `20260817000001_create_staff`, `...02_create_vehicles`, `...03_create_rentals` (rentals uses a native `rental_status` enum; its `down` drops the type). Seeds: `01_rentals` (clears rentals), `02_staff`, `03_vehicles`, `04_rentals` — order matters (rentals reference vehicles; vehicles are reseeded between them). `04_rentals` fetches vehicles by `id` (ordered, destructured as `swift`/`corolla`/...) and computes `total_amount` from each vehicle's `daily_rate` — never hardcode vehicle ids. Seed logins: `staff@example.com` / `password123`.
- `.env` is gitignored; `.env.example` is committed — mirror any new vars into it.

## Structure

- `src/app.ts` — Express app (json/urlencoded parsers, routes mounted here, then `globalErrorHandler` + `notFound`). `src/server.ts` — binds `app.listen` to `envVars.PORT` with an optional db connectivity check (currently commented out).
- `src/middleware/` — `auth.middleware.ts` (Bearer JWT → `req.user`, throws 401), `validate.middleware.ts` (Joi schema → 400 with `errorSources`; takes a `source` arg — `"body"` (default) | `"query"` | `"params"` — and writes the validated value back to `req`), `upload.middleware.ts` (multer + `CloudinaryStorage`, image-only `fileFilter`, no size limit, single field `"photo"`), `globalErrorHandler.ts` (maps `AppError` → its status/message; `MulterError` → 400; dev vs prod envelope), `notFound.ts`.
- `src/modules/` — one folder per feature (`auth`, `vehicles` built; `rentals`, `reports` empty). Each has `X.route.ts` / `X.controller.ts` / `X.service.ts` / `X.validation.ts`. **Services are classes with a singleton default export** (`export default new XService()`) — controllers call the instance, never functions. Services use the shared knex instance from `src/config/database.ts`; controllers call services and send `{ success, message, data }`; Express 5 auto-forwards async rejections, so controllers use `try/catch → next(error)`.
- `src/utils/jwt.ts` — `signAccessToken`/`signRefreshToken`/`verifyToken` (uses `envVars` secrets/exps). `src/utils/cloudinary.ts` — configured `v2` Cloudinary instance for the upload middleware.
- `src/modules/vehicles/` — `list` (paginated, `category`/`search` filters, `ilike` matching), `getById`, `create`/`update` (photo upload → `photo_path`, plate-number uniqueness → 409, soft delete via `deleted_at`). Routes: `GET /vehicles`, `GET /vehicles/:id`, `POST /vehicles` (multipart, field `photo`), `PUT /vehicles/:id` (multipart, partial update — PUT, not PATCH), `DELETE /vehicles/:id`.
- `src/utils/jwt.ts` — `signAccessToken`/`signRefreshToken`/`verifyToken` (uses `envVars` secrets/exps).
- `src/utils/jwt.ts` — `signAccessToken`/`signRefreshToken`/`verifyToken` (uses `envVars` secrets/exps).
- `src/types/express.d.ts` — augments Express `Request` with `user?: { id, email }`.
- `src/interfaces/error.interface.ts` — `TErrorSources`, `TErrorResponse` consumed by `globalErrorHandler`.
- `uploads/` is gitignored (only `.gitkeep` kept); `dist/`, `.env`, `node_modules/` ignored.