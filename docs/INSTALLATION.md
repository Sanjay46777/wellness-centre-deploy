# Installation Guide

## Prerequisites

- Node.js 20+ (or the version managed by the project)
- pnpm 8+
- MySQL 8+ server

## 1. Clone the Repository

```bash
git clone <repo-url>
cd wellness-centre-project
```

## 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for the root workspace, the frontend, and the backend.

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
FRONTEND_URL=http://localhost:50000

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
```

## 4. Set Up MySQL

### Option A: Docker (Recommended for Local Development)

```bash
docker-compose up -d
```

This starts a MySQL container using the configuration in `docker-compose.yml`.

### Option B: Existing MySQL Server

Create the database manually:

```sql
CREATE DATABASE wellness_centre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Run Migrations

```bash
pnpm run migrate
```

This executes the schema SQL in `database/schema.sql`.

## 6. Seed Sample Data

```bash
pnpm run seed
```

This inserts the default admin, head counsellor, student, and sample counsellors.

## 7. Start the Backend

```bash
pnpm run dev:backend
```

The server will start on `http://localhost:3001`.

## 8. Start the Frontend

In a new terminal:

```bash
pnpm run dev
```

The web app will be available at `http://localhost:50000`.

## Verify the Installation

1. Open `http://localhost:50000` in a browser.
2. Use the demo credentials from `README.md` to log in.
3. Confirm the dashboard loads and analytics are displayed.

## Troubleshooting

### Backend fails to connect to MySQL

- Check that the database is running and the credentials in `.env` are correct.
- Ensure the database `wellness_centre` exists.
- Verify the `DB_HOST` is accessible from the backend process.

### Frontend cannot reach the backend

- Confirm `VITE_API_BASE_URL` points to the correct backend URL.
- Check that the backend is running and no firewall is blocking port `3001`.

### bcrypt native module error

The project uses `bcryptjs` (pure JavaScript) instead of `bcrypt`, so native compilation is not required.
