# Deployment Guide

## Overview

This application is split into two deployable artifacts:

1. **Frontend** — a static React + Vite build that can be served by any CDN or static host.
2. **Backend** — a Node.js/Express server that connects to a MySQL database.

## Production Environment Variables

Create a `.env` file for production with strong values:

```env
# Backend
PORT=3001
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-strong-db-password
DB_NAME=wellness_centre
JWT_SECRET=long-random-secret-min-32-characters
JWT_EXPIRES_IN=1h
FRONTEND_URL=https://your-domain.com

# Frontend
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://your-domain.com/api
```

## Build the Application

### Frontend

```bash
pnpm run build
```

This produces a `dist/` folder with optimized static assets.

### Backend

```bash
pnpm run build:backend
```

This compiles the backend TypeScript into `backend/dist/`.

## Deploy the Backend

### Option A: Node.js Server

1. Copy the `backend/` folder to your server.
2. Install dependencies with `pnpm install --prod`.
3. Set environment variables.
4. Run the compiled server:

```bash
node backend/dist/index.js
```

Use a process manager like **PM2** or **systemd** to keep the service alive:

```bash
pm2 start backend/dist/index.js --name wellness-api
```

### Option B: Docker

You can containerize the backend with a Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install -g pnpm && pnpm install --prod
COPY backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Deploy the Frontend

Upload the contents of `dist/` to your static hosting provider:

- **Vercel:** `vercel --prod` or drag the `dist/` folder into the dashboard.
- **Netlify:** `netlify deploy --prod --dir=dist`
- **AWS S3 + CloudFront:** Upload `dist/` to an S3 bucket configured for static hosting.
- **Nginx:** Copy `dist/` to your web root and serve the files.

### Nginx Example

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/wellness/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Database Considerations

- Use a managed MySQL instance (e.g., AWS RDS, Google Cloud SQL, Azure Database for MySQL) for production.
- Enable automated backups and point-in-time recovery.
- Create a dedicated database user with limited privileges.
- Keep the connection pool size appropriate for your deployment.

## Security Checklist

- [ ] Use a strong, unique `JWT_SECRET`.
- [ ] Run the backend behind HTTPS.
- [ ] Set `NODE_ENV=production`.
- [ ] Configure CORS to allow only the production frontend domain.
- [ ] Use a reverse proxy or load balancer for SSL termination.
- [ ] Enable rate limiting and review logs regularly.
- [ ] Keep dependencies updated.

## Monitoring & Logs

- Backend logs are written to the console using Winston.
- In production, redirect logs to a centralized logging system (e.g., Datadog, CloudWatch, or Grafana Loki).
- Monitor the `/api/health` endpoint for uptime checks.

## Rollback

Keep the previous build artifacts so you can revert quickly if a deployment fails. For zero-downtime deployments, use a blue-green or rolling deployment strategy.

## Post-Deployment

1. Verify the frontend loads at `https://your-domain.com`.
2. Test login with demo credentials.
3. Submit a test feedback entry.
4. Confirm exports generate correctly.
5. Review the error logs for any issues.
