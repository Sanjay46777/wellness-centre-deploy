# Deployment Guide (100% Free Tier)

This guide deploys the Wellness Centre with three always-free services (no credit card required, limits verified for 2026):

| Piece | Service | Free-tier offer |
|---|---|---|
| Frontend (React/Vite) | **Vercel** (Hobby) | Static hosting, free TLS, 100 GB bandwidth/mo |
| Backend API (Express) | **Render** (Free web service) | 512 MB RAM, 0.1 CPU, 750 instance-hours/mo |
| Database (MySQL) | **Aiven** (free MySQL) | 1 GB storage, 1 GB RAM, 1 CPU, always-free, SSL required |

> Alternatives: Netlify for the frontend; Railway/Fly.io (paid after trial) for the API; Layerbase MariaDB (MySQL wire-compatible) or TiDB Cloud Serverless (MySQL compatible) for the database.

## Architecture

```
Browser ──► Vercel (static React build, dist/)
                │  VITE_API_BASE_URL=https://<api>.onrender.com/api
                ▼
           Render (Express API, backend/dist/index.js)
                │  DB_SSL=true
                ▼
           Aiven MySQL (wellness_centre)
```

## 1. Database — Aiven free MySQL

1. Create a free account at [aiven.io](https://aiven.io) (no credit card).
2. **Create service** → MySQL → pick a free plan → choose a region.
3. In the service **Overview** tab, copy the connection details:
   - `Host`, `Port`, `Database` (e.g. `defaultdb`), `User`, `Password`.
   - Aiven MySQL is **SSL/TLS required** — this project supports it via `DB_SSL=true`.
4. Create the schema and seed data from your machine:

```bash
mysql --ssl-mode=REQUIRED -h <HOST> -P <PORT> -u <USER> -p < database/schema.sql
mysql --ssl-mode=REQUIRED -h <HOST> -P <PORT> -u <USER> -p < database/seed.sql
```

> In `schema.sql`, replace `CREATE DATABASE ...` / `USE ...` with the actual database name Aiven created (or run `CREATE DATABASE wellness_centre;` first and connect with `-D wellness_centre`). Run `seed.sql` the same way.

## 2. Backend API — Render free web service

1. Push the repo to GitHub.
2. On [render.com](https://render.com) → **New** → **Web Service** → connect the repo.
3. **Free instance type**; use these settings:

   - **Build command:** `pnpm install && pnpm run build:backend`
   - **Start command:** `node backend/dist/index.js`
   - **Root directory:** leave empty (repo root)

4. **Environment variables** (all from `.env.example`):

   ```env
   NODE_ENV=production
   PORT=3001
   DB_HOST=<aiven-host>
   DB_PORT=<aiven-port>
   DB_USER=<aiven-user>
   DB_PASSWORD=<aiven-password>
   DB_NAME=<aiven-database>
   DB_SSL=true
   JWT_SECRET=<generate a long random string, e.g. openssl rand -hex 32>
   JWT_EXPIRES_IN=1h
   AUTH_RATE_LIMIT_MAX=5
   FRONTEND_URL=https://<your-frontend>.vercel.app
   # Optional email (for password resets); omit to log reset links
   # SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=... SMTP_FROM=...
   ```

5. Deploy. Render gives you a URL like `https://wellness-api.onrender.com`.
   - Verify: `curl https://wellness-api.onrender.com/api/health`

### Render free-tier caveats

- Services **spin down after ~15 min** of no traffic and take 30–60 s to cold-start. Acceptable for demos; consider an uptime monitor (e.g. UptimeRobot) if you want it kept warm.
- 750 instance-hours/month and 500 build-minutes/month shared across the account.

## 3. Frontend — Vercel

1. On [vercel.com](https://vercel.com) → **New Project** → import the repo.
2. **Framework preset:** `Vite`.
3. **Build command:** `pnpm run build` — **Output directory:** `dist`.
4. Set the build-time environment variable (Vite bakes it in at build time):

   ```env
   VITE_API_BASE_URL=https://wellness-api.onrender.com/api
   ```

5. Deploy. The app is available at `https://<your-frontend>.vercel.app`.

### Vercel caveats

- The Hobby plan is for personal, non-commercial projects. 100 GB bandwidth/month.
- On the deployed site, the API is reached via `VITE_API_BASE_URL` (no Vite dev proxy).

## 4. Post-deploy checklist

- [ ] `https://<api>.onrender.com/api/health` returns `200`.
- [ ] Log in with the demo **Admin** account; confirm counsellors + analytics load.
- [ ] Log in with the demo **Student** account; submit feedback and see it in admin analytics.
- [ ] QR code for a counsellor links to `https://<frontend>.vercel.app/feedback?cid=<id>` (driven by `FRONTEND_URL`).
- [ ] `JWT_SECRET` is a fresh random value, never the placeholder.
- [ ] `NODE_ENV=production` is set on Render.
- [ ] CORS is working: the frontend origin matches `FRONTEND_URL`.

## 5. Optional automation and maintenance

### GitHub Actions CI
A free GitHub Actions pipeline was added at `.github/workflows/ci.yml`. It runs on push and pull request to `main`/`master` and performs:

- dependency install with `pnpm`
- backend TypeScript build
- frontend Vite build
- backend and frontend type checking

This validates changes before deploy and keeps the repo production-ready.

### GitHub Actions deploy workflow
A deploy workflow stub was added at `.github/workflows/deploy.yml`. It is triggered on push to `main`/`master` and can optionally deploy both frontend and backend when provider secrets are configured.

Supported deployment steps:
- Build backend and frontend artifacts.
- Deploy to Vercel using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Trigger Render deploy using `RENDER_API_KEY` and `RENDER_SERVICE_ID`.

#### Secrets configuration

Do not store credentials in code. Use GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

These are configured in GitHub under `Settings > Secrets and variables > Actions`.

> No GitHub Actions workflow should contain actual email addresses or passwords. Provider credentials are kept in secrets only.

### Free deployment maintenance

- **Render** and **Vercel** both provide always-free hosting tiers; automatic redeploys happen on every merge to the connected branch.
- **Aiven MySQL** is the managed free database. It is maintained by the provider, including backups and SSL access.
- If you prefer a fully local free setup, use `docker-compose up -d` to run MySQL locally and `pnpm run dev` for development.

### Recommended uptime monitor

Because Render free instances can scale to sleep, use a free uptime monitor like UptimeRobot or Cronitor to ping your API health endpoint periodically:

```text
https://<api>.onrender.com/api/health
```

This keeps the app responsive during light usage.

## Production security reminders

- Change `JWT_SECRET` and all demo passwords before real use.
- `AUTH_RATE_LIMIT_MAX` throttles brute-force attempts on auth endpoints.
- `DB_SSL=true` is mandatory for Aiven; your backend `env.ts` maps it to the mysql2 `ssl` option.
- Keep `.env`/secrets out of the repository (already covered by `.gitignore`).
- For stricter production, run the backend behind HTTPS (Render provides TLS automatically).

## Running locally in production mode

```bash
pnpm run build:backend
pnpm run start:backend
```

Then serve `dist/` with any static host. In production the backend is API-only; it does not serve the frontend.
