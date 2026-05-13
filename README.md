# CivicConnect Backend API

Node.js + Express REST API for the CivicConnect city government portal.

## Quick Start

1. Copy `.env.example` to `.env` and fill in your values
2. Run `npx prisma migrate dev --name init` to create the database schema
3. Run `npm run seed` to populate seed data
4. Run `npm run dev` to start the development server

## Phase Summary

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation: project setup, Prisma schema, middleware, auth | Complete |
| 2 | Core features: tickets, permits, users, departments | Complete |
| 3 | Community: announcements, events, notifications | Complete |
| 4 | Analytics, audit logs, SLA cron, PDF/CSV export, seed data | Complete |

## Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@civicconnect.city | SuperAdmin@2026 |
| Dept Admin (INF) | admin.infra@civicconnect.city | Admin@2026 |
| Dept Admin (PER) | admin.permits@civicconnect.city | Admin@2026 |
| Dept Admin (SAF) | admin.safety@civicconnect.city | Admin@2026 |
| Staff | staff1.infra@civicconnect.city | Staff@2026 |
| Resident | ayesha@example.com | Resident@2026 |

## API Base URL

`/api/v1/`

## Health Check

`GET /health`
