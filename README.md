# Wellness Centre — Web Application

A modern, responsive web application for the IIT Madras Wellness Centre. It replaces the previous Android app with a professional web experience for collecting student feedback, managing counsellors, and analyzing session outcomes.

## Features

- Role-based access: students, head counsellors, and admins.
- Student feedback form with a 10-question rating scale, recommendation, and comments.
- QR-code generation linking directly to a counsellor's feedback form.
- Institution and per-counsellor analytics dashboards.
- Counsellor management (create, edit, activate/deactivate) for admins.
- Pending head-counsellor registration approvals.
- Export reports as PPT, PDF, or Excel.
- Responsive design with light/dark mode support.
- Production-safe API: JWT auth, input validation, rate limiting, parameterized SQL, connection pooling.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Charts / Export | Recharts, jsPDF, pptxgenjs, SheetJS |
| State / Forms | Zustand, React Hook Form + Zod |
| Backend | Node.js + Express (TypeScript) |
| Database | MySQL 8+ (`mysql2` with pooling) |
| Auth | JWT + bcryptjs |
| Validation | Zod (request body/query schemas) |
| Security | helmet, CORS (env-controlled), express-rate-limit |

## Project Structure

```
wellness-centre-project
├── backend/                 # Express REST API (TypeScript)
│   ├── src/
│   │   ├── config/          # env schema (Zod) + DB connection pool
│   │   ├── middleware/      # auth + role guard, validation, error handler
│   │   ├── routes/          # auth, counsellors, feedback, admin, analytics, exports, qr
│   │   ├── services/        # analytics, email, export logic
│   │   ├── utils/           # logger
│   │   └── index.ts         # server entry point
│   └── scripts/             # migrate.ts, seed.ts
├── database/                # schema.sql, seed.sql, full DB export
├── src/                     # React frontend
│   ├── app/                 # app entry and router
│   ├── components/          # UI components and layouts
│   ├── lib/                 # API client, analytics, export helpers
│   ├── pages/               # page-level route components
│   ├── stores/              # Zustand state stores
│   └── types/               # TypeScript types
├── docs/                    # PRD, API, design, installation, deployment, ADRs
├── docker-compose.yml       # Local MySQL container (optional)
└── e2e-test.mjs / e2e-full.mjs  # API end-to-end test scripts
```

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- MySQL 8+ server running locally on port `3306`

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set your MySQL credentials and a strong `JWT_SECRET` (16+ chars). Defaults assume a local root user.

### 3. Prepare the database

Create the database locally or use Docker Compose:

Option A: Docker Compose

```bash
cp .env.example .env
docker-compose up -d
```

Option B: Local MySQL

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wellness_centre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Migrate and seed

```bash
pnpm run migrate
pnpm run seed
```

### 5. Start the app

```bash
pnpm run dev
```

`pnpm run dev` starts the backend (port `3001`) and the frontend (port `50000`) together. Open `http://localhost:50000`.

## Environment Variables

All variables are defined in `.env.example`.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend API port |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `wellness_centre` | Database name |
| `DB_SSL` | `false` | Set `true` when the DB requires SSL (e.g. managed cloud MySQL) |
| `JWT_SECRET` | *(required)* | Signing secret, 16+ characters |
| `JWT_EXPIRES_IN` | `1h` | Token lifetime |
| `AUTH_RATE_LIMIT_MAX` | `5` | Max auth requests per minute per IP |
| `FRONTEND_URL` | `http://localhost:50000` | Allowed CORS origin + QR feedback URL base |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | *(optional)* | Email delivery for password resets; omitted = reset links are logged |
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Frontend → backend base URL (baked in at build time) |

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start frontend (Vite) + backend (tsx watch) together |
| `pnpm run dev:frontend` | Start only the Vite dev server |
| `pnpm run dev:backend` | Start only the backend with hot reload |
| `pnpm run build` | Type-check and build the frontend to `dist/` |
| `pnpm run build:backend` | Compile the backend to `backend/dist/` |
| `pnpm run start:backend` | Run the compiled backend |
| `pnpm run lint` | ESLint on the frontend code |
| `pnpm run migrate` | Apply the schema (see `database/schema.sql`) |
| `pnpm run seed` | Insert demo users + counsellors (see `database/seed.sql`) |
| `pnpm run ci` | Run the GitHub Actions CI locally via `act` or inspect `.github/workflows/ci.yml` |

## Continuous Integration

A GitHub Actions workflow is included at `.github/workflows/ci.yml` to build and validate the project automatically on each push or pull request to `main`/`master`.

This ensures that frontend and backend code remain deployable and that database-related changes are checked before merging.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `wellness1@smail.iitm.ac.in` | `0&nMlqX3&yFkkHVx` |
| Head Counsellor | `wo@smail.iitm.ac.in` | `6hxkTs&1*CuE&ot@` |
| Student | `student-demo@wellness.local` | `StudentDemo1!` |

## Security

- All SQL is executed with prepared statements (`pool.execute` with `?` placeholders) — no string interpolation.
- Passwords are hashed with bcryptjs.
- JWT auth with per-route role guards (`admin`, `head_counsellor`, `student`).
- Request bodies/queries validated against Zod schemas before touching the DB.
- Rate limiting on auth endpoints, helmet headers, and CORS restricted to `FRONTEND_URL`.
- `.env` is gitignored; never commit secrets.

## Testing

Run the API end-to-end suites against a running backend:

```bash
node e2e-test.mjs     # core flows (auth, feedback, analytics, 401s)
node e2e-full.mjs     # extended coverage
```

## Deployment (free tier)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a step-by-step, zero-cost production deployment (Vercel/Netlify for the frontend, Render free tier for the API, and a free managed MySQL instance).

## Documentation

- [Product Requirements Document](docs/prd.md)
- [API Documentation](docs/API.md)
- [Design System](docs/DESIGN.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide (free tier)](docs/DEPLOYMENT.md)
- [Architecture Decision Records](docs/decisions/)

## License

Internal project — IIT Madras Wellness Centre.
