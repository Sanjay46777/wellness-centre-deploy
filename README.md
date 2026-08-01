# Wellness Centre — Web Application

A modern, responsive web application for the IIT Madras Wellness Centre. It replaces the previous Android app with a professional web experience for collecting student feedback, managing counsellors, and analyzing session outcomes.

## Features

- Role-based access: students, head counsellors, and admins.
- Student feedback form with 10-question rating scale, recommendation, and comments.
- QR-code generation linking directly to a counsellor's feedback form.
- Institution and per-counsellor analytics dashboards.
- Counsellor management (create, edit, activate/deactivate) for admins.
- Pending head-counsellor registration approvals.
- Export reports as PPT, PDF, or Excel.
- Responsive design with light/dark mode support.
- Editorial aesthetic: refined typography, restrained deep-red accent, generous whitespace.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Authentication:** JWT + bcryptjs
- **API:** RESTful JSON

## Project Structure

```
/workspace/app-dcgdau70ia69
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── config/          # Database and env configuration
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route modules
│   │   ├── services/        # Analytics and export logic
│   │   └── index.ts         # Server entry point
│   ├── database/            # Schema, seed, and migration scripts
│   └── docker-compose.yml   # Local MySQL setup
├── src/                     # React frontend
│   ├── app/                 # App entry and router
│   ├── components/          # UI components and layouts
│   ├── lib/                 # Utilities, analytics, export helpers
│   ├── pages/               # Page-level route components
│   ├── stores/              # Zustand state stores
│   └── types/               # TypeScript types
├── docs/                    # PRD, design docs, API docs, ADRs
└── dist/                    # Production frontend build
```

## Quick Start

1. **Install dependencies**

```bash
pnpm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

3. **Start the database**

If you have Docker:

```bash
docker-compose up -d
```

Otherwise, ensure a MySQL server is running and create the database:

```sql
CREATE DATABASE wellness_centre CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Run database migrations and seed**

```bash
pnpm run db:migrate
pnpm run db:seed
```

5. **Start the backend**

```bash
pnpm run dev:backend
```

6. **Start the frontend**

```bash
pnpm run dev
```

The frontend will be available at `http://localhost:50000` and the backend at `http://localhost:3001`.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start the Vite development server |
| `pnpm run dev:backend` | Start the Express backend with hot reload |
| `pnpm run build` | Build the frontend for production |
| `pnpm run build:backend` | Compile the backend TypeScript |
| `pnpm run lint` | Run ESLint on the frontend code |
| `pnpm run db:migrate` | Run MySQL migrations |
| `pnpm run db:seed` | Seed the database with sample data |
| `pnpm run preview` | Preview the production frontend build |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `wellness1@smail.iitm.ac.in` | `0&nMlqX3&yFkkHVx` |
| Head Counsellor | `wo@smail.iitm.ac.in` | `6hxkTs&1*CuE&ot@` |
| Student | `student-demo@wellness.local` | `StudentDemo1!` |

## Mock API Mode

For frontend development without a running backend, set the following in your `.env`:

```env
VITE_USE_MOCK_API=true
```

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Design System](docs/DESIGN.md)
- [API Documentation](docs/API.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Decision Records](docs/decisions/)

## License

Internal project — IIT Madras Wellness Centre.
