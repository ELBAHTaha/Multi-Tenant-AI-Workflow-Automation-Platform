# Multi-Tenant AI Workflow Automation Platform

Run:
1. Copy env: `Copy-Item .env.example .env`
2. `docker-compose up --build`
3. Frontend: `http://localhost`
4. API: `http://localhost/api`

Includes:
- NestJS backend with JWT auth, refresh tokens, RBAC, multi-tenant scoping, BullMQ queue, Socket.IO updates
- Next.js frontend with auth pages, dashboard, Recharts analytics placeholder, React Flow placeholder
- PostgreSQL + Redis + Nginx via Docker Compose
