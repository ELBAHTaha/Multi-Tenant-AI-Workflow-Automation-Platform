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

## Prisma Update Commands

Run these commands after pulling latest backend changes:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

## API Test Cases

Use these test cases to validate tenant isolation, permissions, queue processing, and audit logs:

1. Register admin tenant user
   - `POST /api/auth/register`
   - Expect `200`, access+refresh tokens, user tied to created organization.
2. Login existing admin
   - `POST /api/auth/login`
   - Expect `200`, valid JWT payload with `organizationId`.
3. Create workflow with admin role
   - `POST /api/workflows` (Bearer admin token)
   - Expect `201`, workflow created in admin tenant.
4. List workflows tenant-scoped
   - `GET /api/workflows` (Bearer admin token)
   - Expect only workflows for the same organization.
5. Queue workflow execution
   - `POST /api/workflows/:workflowId/runs` (Bearer admin/manager/member token)
   - Expect `202` with `{ status: "accepted", workflowId, jobId }`.
6. Update workflow with manager
   - `PUT /api/workflows/:workflowId` (Bearer manager token)
   - Expect `200`.
7. Delete workflow with manager (forbidden)
   - `DELETE /api/workflows/:workflowId` (Bearer manager token)
   - Expect `403`.
8. Delete workflow with admin
   - `DELETE /api/workflows/:workflowId` (Bearer admin token)
   - Expect `204`.
9. Cross-tenant resource access blocked
   - Access workflow ID from another organization.
   - Expect `403` or `404`.
10. Audit log verification (DB-level)
   - Query `AuditLog` table and confirm entries for `workflow.created`, `workflow.execution.queued`, `workflow.executed|workflow.failed`.

## Frontend Test Cases

1. Login success path
   - Open `/login`, use seeded credentials, expect redirect to `/dashboard` and persisted auth state after refresh.
2. Register success path
   - Open `/register`, create a tenant admin, expect redirect to `/dashboard`.
3. Role-based create/update/delete visibility
   - Admin sees create/update/delete.
   - Manager sees create/update only.
   - Member sees run only.
4. Workflow list is tenant scoped
   - Two users from different organizations should not see each other's workflows.
5. Create workflow validation
   - Empty name or invalid definition JSON shows inline error.
6. Update workflow validation
   - Empty update name shows inline error and request is not sent.
7. Run workflow validation
   - Invalid run input JSON shows inline error and request is not sent.
8. Structured backend errors
   - Trigger a 4xx/5xx and verify `error.message` + `error.details` rendering.
9. Realtime status updates
   - Submit a run and verify status badge transitions via socket event.
10. Logout
   - Click logout, token/user/org stores are cleared and route returns to `/login`.
