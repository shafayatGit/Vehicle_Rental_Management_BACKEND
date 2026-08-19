# Vehicle Rental Management Backend

A REST API for a vehicle rental company built with **Express 5 + TypeScript**. Staff log in with JWT and manage the vehicle fleet; customer bookings are recorded as **rentals**. A vehicle can't be booked twice for overlapping dates, and the API provides a monthly rental-activity report per vehicle.

## Tech Stack

- **Express 5** – web framework
- **TypeScript 7** (native compiler) – typed throughout, OOP service layer
- **Knex + pg** – query builder and connection pool
- **PostgreSQL** – database
- **JWT** (`jsonwebtoken`) – auth (access + refresh tokens)
- **Joi** – request validation
- **Multer + Cloudinary** – vehicle photo uploads
- **bcryptjs** – password hashing
- **express-rate-limit** – rate limiting on login
- **ESLint + Prettier** – linting and formatting

## Requirements

- Node.js 22+ (developed against Node 24)
- PostgreSQL (or a hosted DB such as Neon)
- A Cloudinary account (for vehicle photo upload)

## Getting Started

```sh
# 1. Clone and install dependencies
git clone <repo-url>
cd vehicle-rental-backend
npm install

# 2. Configure environment variables
cp .env.example .env
# fill in DATABASE_URL, JWT secrets, Cloudinary credentials, etc.

# 3. Run migrations and (optionally) seed the database
npm run migrate
npm run seed    # optional — inserts staff, vehicles, and rentals

# 4. Start the server
npm run dev     # development (tsx watch)
npm run build && npm run start   # production
```

> **Note:** `npm run seed` clears and re-creates the demo data. It inserts a
> rental that **spans a month boundary** (`2026-07-29` → `2026-08-03`) so the
> monthly report's date-proration logic can be verified.

Seed login: `staff@example.com` / `password123`.

## Environment Variables

All variables listed are required — the app throws at startup if any are missing.

| Variable                   | Description                                  |
| -------------------------- | -------------------------------------------- |
| `NODE_ENV`                 | `development` or `production`                |
| `PORT`                     | HTTP port                                    |
| `DATABASE_URL`             | Postgres connection string (e.g. a Neon URL) |
| `DB_POOL_MIN`              | Knex pool: min connections                   |
| `DB_POOL_MAX`              | Knex pool: max connections                   |
| `ACCESS_TOKEN_SECRET`      | JWT access-token signing secret              |
| `REFRESH_TOKEN_SECRET`     | JWT refresh-token signing secret             |
| `ACCESS_TOKEN_EXPIRES_IN`  | e.g. `15m`                                   |
| `REFRESH_TOKEN_EXPIRES_IN` | e.g. `7d`                                    |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name                        |
| `CLOUDINARY_API_KEY`       | Cloudinary API key                           |
| `CLOUDINARY_API_SECRET`    | Cloudinary API secret                        |

## Scripts

| Script                     | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Start server with hot reload (`tsx watch`)            |
| `npm run build`            | Compile TypeScript to `dist/`                         |
| `npm run start`            | Run the built server from `dist/`                     |
| `npm run migrate`          | Run pending knex migrations                           |
| `npm run migrate:rollback` | Roll back the latest migration batch                  |
| `npm run seed`             | Reset and repopulate demo data                        |
| `npm run lint`             | ESLint (JS config only; TS is formatted via Prettier) |
| `npm run format`           | Format all files with Prettier                        |
| `npm run format:check`     | Verify formatting without writing                     |

## Authentication

`POST /auth/login` (`email` + `password`) returns a JWT **access token**, a
**refresh token**, and the staff profile. `POST /auth/refresh` exchanges a
refresh token for a new pair via `refreshToken` in the body.

Almost every route below requires the access token as a bearer header:

```
Authorization: Bearer <accessToken>
```

Login is rate-limited to **20 attempts per 15 minutes per IP** to slow down
brute-force attacks.

## API Endpoints

### Auth

| Method | Path            | Auth | Description                 |
| ------ | --------------- | ---- | --------------------------- |
| POST   | `/auth/login`   | No   | Login with email + password |
| POST   | `/auth/refresh` | No   | Refresh token rotation      |

### Vehicles

| Method | Path            | Auth | Description                                   |
| ------ | --------------- | ---- | --------------------------------------------- |
| GET    | `/vehicles`     | Yes  | Paginated list; filters: `category`, `search` |
| GET    | `/vehicles/:id` | Yes  | Single vehicle                                |
| POST   | `/vehicles`     | Yes  | Create (multipart, `photo` field)             |
| PUT    | `/vehicles/:id` | Yes  | Partial update (multipart, photo replaceable) |
| DELETE | `/vehicles/:id` | Yes  | Soft delete                                   |

Filters for `GET /vehicles`: `page`, `limit`, `category`, `search`.

### Rentals

| Method | Path           | Auth | Description                                                               |
| ------ | -------------- | ---- | ------------------------------------------------------------------------- |
| GET    | `/rentals`     | Yes  | Paginated list; filters: `vehicle_id`, `status`, `start_date`, `end_date` |
| GET    | `/rentals/:id` | Yes  | Single rental                                                             |
| POST   | `/rentals`     | Yes  | Create a booking                                                          |
| PUT    | `/rentals/:id` | Yes  | Partial update (dates, customer fields, `status`)                         |
| DELETE | `/rentals/:id` | Yes  | Hard delete                                                               |

`POST /rentals` body: `vehicle_id`, `customer_name`, `customer_phone`,
`start_date`, `end_date` (strict `YYYY-MM-DD`).

**Business rules**

- `total_amount` is computed server-side = vehicle `daily_rate` × number of
  days (a same-day start/end counts as **1 day**).
- A `409 Conflict` is returned if the vehicle already has an **active**
  (non-`cancelled`) rental whose `[start_date, end_date]` overlaps the
  requested period (`start1 <= end2 AND end1 >= start2`). Cancelled rentals
  never block new bookings.
- Create/update wrap the overlap check and write in a **transaction**; create
  locks the vehicle row (`SELECT ... FOR UPDATE`) so two concurrent
  double-bookings can't both succeed.

### Reports

| Method | Path               | Auth | Description                |
| ------ | ------------------ | ---- | -------------------------- |
| GET    | `/reports/rentals` | Yes  | Monthly per-vehicle report |

Query params: `month` (`YYYY-MM`, defaults to the current month; optional),
`vehicle_id` (optional).

Returns per active vehicle: `id`, `name`, `total_bookings`, `days_rented`,
`revenue`, plus a `topVehicle` (highest revenue that month).

**Proration:** only days inside the requested month count. A rental running
`2026-07-29` → `2026-08-03` contributes **3 days** (Aug 1–3) to the August
report, not all 6.

## Error Handling

All endpoints respond with a consistent envelope:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errorSources": [{ "path": "start_date", "message": "..." }]
}
```

Error mapping: `AppError` → its status/message, `MulterError` → 400, unknown
errors → 500. In development the raw error details are included to aid
debugging.
