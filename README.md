# Wellness Centre — Web Application

A modern, responsive web application for the IIT Madras Wellness Centre. It replaces the previous Android app with a professional web experience for collecting student feedback, managing counsellors, and analyzing session outcomes. Runs entirely on **free-tier** services.

## Features

- Role-based access: students, head counsellors, and admins.
- Student feedback form with 10-question rating scale, recommendation, and optional anonymity.
- QR-code generation linking directly to a counsellor's feedback form.
- Institution and per-counsellor analytics dashboards.
- Counsellor management (create, edit, activate/deactivate) for admins.
- Pending head-counsellor registration approvals.
- Export reports as PPT, PDF, or Excel.
- Responsive design with light/dark mode support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | MySQL 8 (mysql2 pooled connections) |
| Auth | JWT + bcryptjs, role-based access control |
| Validation | Zod (request body + query) |
| Charts / Animation | Recharts, Framer Motion |
| State | Zustand |
| API | RESTful JSON |

## Project Structure

```
wellness-centre-project
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # Env schema + MySQL connection pool
│   │   ├── middleware/       # Auth (JWT/RBAC), validation, error handling
│   │   ├── routes/           # auth, counsellors, feedback, analytics, admin, exports, qr
│   │   ├── services/         # Analytics and export logic
│   │   ├── scripts/          # migrate.ts, seed.ts
│   │   └── index.ts          # Server entry point
│   └── package.json
├── database/
│   ├── schema.sql            # MySQL schema (auto-loaded by Docker)
│   └── seed.sql              # Sample data (auto-loaded by Docker)
├── src/                      # React frontend
│   ├── components/           # UI components, layouts, charts
│   ├── lib/                  # API client, export helpers, utilities
│   ├── pages/                # Route-level components (lazy loaded)
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript types
├── mobile/                   # React Native companion app
├── docs/                     # PRD, API docs, ADRs
├── docker-compose.yml        # Local MySQL 8 setup
├── render.yaml               # Backend deployment blueprint (Render, free tier)
└── vercel.json               # Frontend deployment config (Vercel, free tier)
```

## Database (MySQL)

You have two options. Both are free.

### Option A — Aiven free MySQL (cloud, recommended)

[Aiven](https://aiven.io/free-mysql-database) offers a **free forever** managed MySQL 8 service — no trial, no expiry, no credit card required. It includes a **web console** where you can watch your tables, run SQL, and see feedback submissions appear in real time as the app writes them.

1. Create a free account (GitHub/Google sign-in is fine).
2. Create a new **MySQL** service — choose the **Free (Hobbyist)** plan (`free-1-5gb`).
3. Copy the connection details from the **Overview** tab (host, port, user, password, database name).
4. In the **Connection info** panel the SSL certificate/ca is bundled with the host; enable `DB_SSL=true` below.

```env
DB_HOST=wellness-centre-xxxx.aivencloud.com
DB_PORT=24143
DB_USER=avnadmin
DB_PASSWORD=<your-password>
DB_NAME=defaultdb
DB_SSL=true
```

### Option B — Local Docker MySQL (recommended for development)

```bash
docker-compose up -d
```

This starts MySQL 8 on `localhost:3306` (root password `password`, database `wellness_centre`) and automatically applies `database/schema.sql` and `database/seed.sql`.

For any MySQL server, create the schema and seed manually with:

```bash
pnpm run migrate
pnpm run seed
```

> The backend refuses to start if it cannot connect to MySQL, so ensure the database is up before `dev:backend`.

## Quick Start

1. **Install dependencies**

```bash
pnpm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret. See [Environment Variables](#environment-variables).

3. **Start the database** (Docker or Aiven — see above)

4. **Start the backend**

```bash
pnpm run dev:backend
```

5. **Start the frontend**

```bash
pnpm run dev
```

The frontend runs at `http://localhost:50000` (Vite proxies `/api` to `http://localhost:3001`), backend at `http://localhost:3001/api`.

## Environment Variables

All configuration is read from `.env` (see `.env.example`).

### Backend

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `3001` |
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(empty)* |
| `DB_NAME` | MySQL database name | `wellness_centre` |
| `DB_SSL` | `true` for cloud MySQL (Aiven requires it) | `false` |
| `JWT_SECRET` | Secret used to sign JWT tokens (min 16 chars) | `change_me_in_production` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` | `1h` |
| `FRONTEND_URL` | Allowed CORS origin for the frontend | `http://localhost:50000` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Optional SMTP for password-reset emails; reset links are logged to the console if unset | *(empty)* |

### Frontend

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Public base URL of the backend API. In production this is your Render backend URL, e.g. `https://your-app.onrender.com/api` | `http://localhost:3001/api` |

> `VITE_*` variables are inlined at **build time** — set them in your hosting platform before `pnpm run build`.

## Deployment (100% free tier)

### Database

- Use the **Aiven free MySQL** plan (Option A above). It is persistent, has automatic backups, and never expires.

### Backend — Render (free web service)

1. Push this repository to GitHub.
2. On [Render](https://render.com), click **New → Blueprint** and select the repo. `render.yaml` is detected automatically (free plan).
3. Render builds the backend (`pnpm install && tsc -p backend/tsconfig.json`), runs the DB migration on deploy (`preDeployCommand`), and starts it.
4. Fill in the secret env vars Render asks for: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`. Optionally configure SMTP.
5. Note: the free web service **spins down after ~15 min of inactivity** and wakes on the next request (a few seconds delay). This is expected on the free tier.

### Frontend — Vercel (free Hobby plan)

1. Import the repo into [Vercel](https://vercel.com). `vercel.json` is auto-detected (build command, `dist/` output, SPA rewrites).
2. Set the environment variable `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api`.
3. Deploy. The frontend gets a `.vercel.app` URL automatically.

### Post-deploy

- Set the Render service's `FRONTEND_URL` to your Vercel URL (it is `https://wellness-centre-web.vercel.app` in `render.yaml` — update if you use a different project name).
- Watch your data live: the Aiven console shows every new feedback row the moment it is submitted.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start the frontend and backend together |
| `pnpm run dev:frontend` | Start the Vite dev server only |
| `pnpm run dev:backend` | Start the Express backend with hot reload |
| `pnpm run build` | Type-check and build the frontend |
| `pnpm run build:backend` | Compile the backend TypeScript |
| `pnpm run start:backend` | Run the compiled backend (`backend/dist/index.js`) |
| `pnpm run lint` | Run ESLint (frontend + backend) |
| `pnpm run migrate` | Apply the MySQL schema |
| `pnpm run seed` | Seed the database with sample data |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `wellness1@smail.iitm.ac.in` | `0&nMlqX3&yFkkHVx` |
| Head Counsellor | `wo@smail.iitm.ac.in` | `6hxkTs&1*CuE&ot@` |
| Student | `student-demo@wellness.local` | `StudentDemo1!` |

## Security

- Parameterized SQL queries throughout (no string-concatenated SQL).
- Zod validation on every request body and query.
- JWT authentication with role-based access control middleware.
- bcrypt password hashing; rate limiting on auth/login in production.
- Helmet security headers; strict CORS origin; `DB_SSL` for cloud connections.
- Sensitive values (secrets, DB credentials) live only in environment variables — never in code.

## Documentation

- [Product Requirements Document](docs/prd.md)
- [API Documentation](docs/API.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Architecture Decision Records](docs/decisions/)

## License

Internal project — IIT Madras Wellness Centre.
