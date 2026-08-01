# Installation Guide

## Prerequisites

- Node.js 20+ (project targets Node 24)
- pnpm 8+
- MySQL 8+ server running on port `3306`

## 1. Clone the Repository

```bash
git clone <repo-url>
cd wellness-centre-project
```

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
# Backend
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wellness_centre
DB_SSL=false
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRES_IN=1h
AUTH_RATE_LIMIT_MAX=1000
FRONTEND_URL=http://localhost:50000

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
```

## 4. Set Up MySQL

### Option A: Docker (Recommended for Local Development)

```bash
cp .env.example .env
docker-compose up -d
```

This starts a MySQL 8 container on port `3306` with credentials from `.env`.

### Option B: Existing MySQL Server

Create the database manually:

```sql
CREATE DATABASE wellness_centre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Option A: Docker (Recommended for Local Development)

```bash
docker-compose up -d
```

This starts a MySQL 8 container on port `3306` with `root` password `password`.

### Option B: Existing MySQL Server

Create the database manually:

```sql
CREATE DATABASE wellness_centre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Run Migrations

```bash
pnpm run migrate
```

This applies the schema in `database/schema.sql`.

## 6. Seed Sample Data

```bash
pnpm run seed
```

This inserts the default admin, head counsellor, student, and sample counsellors.

## 7. Start the App

Start both backend and frontend together:

```bash
pnpm run dev
```

Or in two terminals:

```bash
pnpm run dev:backend    # API on http://localhost:3001
pnpm run dev:frontend   # web app on http://localhost:50000
```

## Verify the Installation

1. Open `http://localhost:50000` in a browser.
2. Use the demo credentials from `README.md` to log in.
3. Confirm the dashboards load and analytics are displayed.

## Troubleshooting

### Backend fails to connect to MySQL

- Check the database is running and the credentials in `.env` are correct.
- Ensure the database `wellness_centre` exists.
- Verify `DB_PORT` matches the running server (local service: `3306`).
- If MySQL rejects the root password, reset it (see below).

### Reset a forgotten local MySQL root password (Windows)

1. Stop the service: `net stop MySQL80` (as Administrator).
2. Create a text file, e.g. `C:\mysql-init.txt`, containing:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'your_new_password';
   FLUSH PRIVILEGES;
   ```
3. Start the server with the init file:
   ```powershell
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file=C:\mysql-init.txt
   ```
4. Connect with the new password, shut down cleanly, delete the init file, then start the service normally: `net start MySQL80`.

> Do **not** use `--skip-grant-tables` on Windows: it disables TCP networking (the server starts on port 0 and aborts). The `--init-file` method above is the supported route.

### Frontend cannot reach the backend

- Confirm `VITE_API_BASE_URL` points to the correct backend URL.
- Check the backend is running and no firewall is blocking port `3001`.

### bcrypt native module error

The project uses `bcryptjs` (pure JavaScript) instead of `bcrypt`, so native compilation is not required.
