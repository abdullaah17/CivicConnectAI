# CivicConnect — Master Project Documentation
### AUREX AI 2026 | Web Development Track | Bahria University, BSEAS

---

> **Document Status:** Phase 1 — Master Documentation (Single Source of Truth)
> **Version:** 1.0
> **Date:** 13 May 2026
> **Competition Window:** 6 Hours (Full Stack, Deployed, Live URL Required)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Target Users](#4-target-users)
5. [Core Features](#5-core-features)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [System Architecture](#8-system-architecture)
9. [Data Flow](#9-data-flow)
10. [Security Considerations](#10-security-considerations)
11. [Scalability Plan](#11-scalability-plan)
12. [Assumptions](#12-assumptions)
13. [Constraints](#13-constraints)
14. [Innovation Factor](#14-innovation-factor)
15. [Future Improvements](#15-future-improvements)
16. [Conclusion](#16-conclusion)

---

## 1. Project Overview

**CivicConnect** is a multi-role, full-stack Smart City Resident Services Portal designed to digitalize and streamline the complete lifecycle of citizen–government interaction. It replaces fragmented email chains and spreadsheet-based civic management with a unified, real-time web platform that serves residents, department staff, department administrators, and a super administrator.

The platform consolidates four critical city functions: civic request management, permit and licensing applications, city announcements and events, and analytics dashboards — all under a single, secured, role-based system.

| Attribute | Value |
|---|---|
| Project Name | CivicConnect |
| Type | Full-Stack Web Portal (Production-Ready) |
| Frontend Framework | React.js / Next.js (team choice) |
| Backend Runtime | Node.js with Express / Fastify / NestJS |
| Database | PostgreSQL (primary) |
| Authentication | JWT with refresh token rotation + OTP + 2FA |
| Deployment | Vercel (frontend) + Render/Railway (backend) + Neon/Supabase (DB) |
| Competition Duration | 6 Hours |

---

## 2. Problem Statement

A mid-sized smart city of 500,000 residents currently manages all civic operations through:

- A **single generic email inbox** for all resident requests
- **Manual spreadsheets** for request sorting, assignment, and tracking
- **No real-time status tracking** for residents
- **No SLA enforcement** or automated escalation mechanisms
- **No inter-department communication layer**
- **No analytics or reporting** for city administrators

This results in slow response times, lost requests, duplicate submissions, frustrated residents, and overworked city staff with no tools for prioritization or accountability.

**CivicConnect must replace all of this** with a modern, secure, responsive web platform that gives every stakeholder — from the citizen to the super administrator — the tools they need in a single unified system.

---

## 3. Goals & Objectives

### Primary Goals

1. **Digitalize Civic Request Lifecycle** — Provide residents a structured way to submit, track, and follow up on civic service requests across three departments.
2. **Automate Permit Workflows** — Replace paper-based permit applications with a digital multi-step wizard with document upload, review, and digital approval certificates.
3. **Enable Real-Time Communication** — Keep residents informed of every status change via in-app notifications and email, eliminating the communication void of the current system.
4. **Empower Administrators with Data** — Provide department admins and super admins with live analytics dashboards, SLA tracking, heatmaps, and exportable reports.
5. **Enforce Accountability** — Implement SLA timers, automated escalation alerts, and audit logs that make performance measurable and transparent.

### Secondary Goals

1. Deliver a **production-grade**, deployed application — not a prototype.
2. Implement **role-based access control (RBAC)** rigorously at both the API and UI layers.
3. Achieve a **minimum 90/100 Lighthouse accessibility score** on at least one core page.
4. Implement at least **one bonus feature** (AI categorization, WebSockets, or map integration) for competitive differentiation.

---

## 4. Target Users

### 4.1 Resident / Citizen
- **Who:** Any city resident (age 18+) with internet access
- **Needs:** Submit complaints/requests, track their status, register for events, receive updates
- **Auth:** Email + Password, OTP email verification, profile photo upload
- **Volume:** ~500,000 potential users; expect hundreds of concurrent sessions

### 4.2 Department Staff
- **Who:** Frontline city employees assigned to handle requests within their department
- **Needs:** View assigned tickets, update statuses, add notes, escalate critical issues
- **Auth:** Staff ID + Password, role-based dashboard
- **Volume:** Dozens per department, ~100–200 total staff accounts

### 4.3 Department Admin
- **Who:** Managers overseeing one of three departments (Infrastructure, Permits & Licensing, Public Safety)
- **Needs:** Manage staff, configure SLAs, view analytics, reassign tickets, publish announcements
- **Auth:** Admin credentials + mandatory 2FA (TOTP)
- **Volume:** 3–9 admin accounts (up to 3 per department)

### 4.4 Super Admin
- **Who:** City-level system administrator with full access
- **Needs:** Configure departments, manage all users, generate system-wide reports, publish emergency broadcasts
- **Auth:** Super Admin token + IP-restricted login + audit logs
- **Volume:** 1–3 accounts, highly restricted

---

## 5. Core Features

### Module A — Civic Request Management System (CRMS)
The backbone of the platform. Residents submit structured civic service requests; staff process them through a defined pipeline.

**Key Capabilities:**
- Multi-department request submission (Infrastructure, Permits & Licensing, Public Safety)
- Unique auto-generated ticket IDs (e.g., `INF-2026-00412`)
- 6-stage real-time status pipeline: `Submitted → Under Review → Assigned → In Progress → Resolved → Closed`
- File/image attachments (up to 5 files per request)
- In-app + email notifications at every status transition
- Public resident comments + staff internal/public notes
- SLA timers with color-coded urgency (green / amber / red)
- Automated escalation alerts to Department Admins when SLA breach is imminent

### Module B — Permit & Application Portal
Digital replacement for paper permit applications with structured review workflows.

**Key Capabilities:**
- Three permit types: Construction Permit, Event Permit, Business License Renewal
- Multi-step form wizard with auto-save drafts and conditional fields
- Document upload (PDF/images, max 10 MB per file)
- Review workflow: `Submit → Document Verification → Field Inspection Scheduling → Approval/Rejection`
- Mandatory rejection reasons + re-submission capability
- Digital approval certificates (PDF with permit number, QR code, expiry date)
- Payment stub simulation with fee calculation and receipt generation

### Module C — City Announcement & Event Board
Centralized communication hub for city-wide announcements and public events.

**Key Capabilities:**
- Admins publish announcements with priority flags
- Public event listings filterable by category (Health, Infrastructure, Culture, Emergency)
- Event registration with capacity limit enforcement
- Unread badge tracking per resident
- Emergency broadcast: full-screen dismissible alert banner on all active sessions
- Archival system with searchable historical records

### Module D — Analytics & Reporting Dashboard
Data intelligence layer for administrators.

**Key Capabilities:**
- Real-time charts: tickets by status, average resolution time, SLA breach rate
- Geographic heatmap of complaint distribution
- Permit pipeline funnel chart
- Top 5 most reported issues by category and location
- Date range filters and department-level drill-down
- CSV and PDF export for all data tables and charts

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

| Requirement | Details |
|---|---|
| FR-AUTH-01 | Resident registration via email + password with OTP email verification |
| FR-AUTH-02 | Profile photo upload during registration or from profile settings |
| FR-AUTH-03 | Staff login via Staff ID + password |
| FR-AUTH-04 | Department Admin login with mandatory 2FA (TOTP via Authenticator app) |
| FR-AUTH-05 | Super Admin login with IP restriction + audit log of every session |
| FR-AUTH-06 | JWT access tokens (short-lived, 15 min) + refresh token rotation (7-day expiry) |
| FR-AUTH-07 | RBAC enforced at API middleware level — not just frontend |
| FR-AUTH-08 | Rate limiting on all authentication endpoints (login, register, OTP resend) |
| FR-AUTH-09 | Password reset via email OTP link |
| FR-AUTH-10 | Secure logout: invalidates refresh token server-side |

### 6.2 Module A — CRMS

| Requirement | Details |
|---|---|
| FR-CRMS-01 | Resident can submit a request with: title, description, category (from 3 departments), location (map pin or text input), priority (Low / Medium / High / Emergency), and up to 5 file attachments |
| FR-CRMS-02 | System auto-generates a unique ticket ID on submission (format: `{DEPT_CODE}-{YEAR}-{5_DIGIT_SEQ}`) |
| FR-CRMS-03 | Ticket moves through 6 statuses; each transition is logged with timestamp and actor |
| FR-CRMS-04 | Resident receives an in-app notification AND email at every status change |
| FR-CRMS-05 | Resident can add follow-up comments to their own ticket at any time |
| FR-CRMS-06 | Staff can add notes marked as "Internal" (invisible to resident) or "Public" |
| FR-CRMS-07 | Department Staff see only tickets assigned to their department |
| FR-CRMS-08 | Department Admin can reassign tickets between staff members within their department |
| FR-CRMS-09 | SLA deadline is set per department (configurable by Dept Admin); ticket card shows color-coded countdown timer |
| FR-CRMS-10 | When SLA deadline is within 2 hours (configurable), an automated escalation alert is sent to the Department Admin |
| FR-CRMS-11 | Super Admin can view and filter all tickets system-wide |

### 6.3 Module B — Permit Portal

| Requirement | Details |
|---|---|
| FR-PERMIT-01 | Three permit application forms: Construction Permit, Event Permit, Business License Renewal — each with unique field sets |
| FR-PERMIT-02 | Multi-step form wizard; progress is auto-saved as draft every 30 seconds |
| FR-PERMIT-03 | Conditional field logic (e.g., if "outdoor event" is selected, show "expected crowd size" field) |
| FR-PERMIT-04 | Document upload: PDF or image, max 10 MB per file |
| FR-PERMIT-05 | Application moves through: `Submit → Document Verification → Field Inspection Scheduling → Approval / Rejection` |
| FR-PERMIT-06 | Rejection requires mandatory written reason; applicant is notified and can re-submit with corrections |
| FR-PERMIT-07 | On approval, system generates a PDF certificate with: permit number, QR code (linking to verification page), expiry date, and department seal |
| FR-PERMIT-08 | Payment stub: system calculates fee based on permit type and inputs, generates a simulated payment receipt (no real payment gateway) |

### 6.4 Module C — Announcements & Events

| Requirement | Details |
|---|---|
| FR-ANN-01 | Dept Admin and Super Admin can create announcements with: title, body, category, priority flag (Normal / Urgent / Emergency), and expiry date |
| FR-ANN-02 | Residents see unread badge count; announcements marked "read" per user |
| FR-ANN-03 | Emergency announcements trigger a full-screen dismissible banner for all active resident sessions (via WebSocket or polling) |
| FR-ANN-04 | Events have: title, description, category, date/time, location, capacity limit |
| FR-ANN-05 | Residents can register for events; system prevents registration beyond capacity |
| FR-ANN-06 | Announcements are archived after expiry date and remain searchable |
| FR-ANN-07 | Events filterable by category, date, and department |

### 6.5 Module D — Analytics Dashboard

| Requirement | Details |
|---|---|
| FR-ANALYTICS-01 | Dept Admin dashboard shows: ticket volume by status (bar/donut chart), average resolution time (line chart), SLA breach rate (gauge or KPI card) |
| FR-ANALYTICS-02 | Super Admin dashboard aggregates all departments with drill-down capability |
| FR-ANALYTICS-03 | Geographic visualization: heatmap or clustered map of complaint locations |
| FR-ANALYTICS-04 | Permit pipeline funnel chart showing applications at each stage |
| FR-ANALYTICS-05 | Top 5 most reported issues by category and location |
| FR-ANALYTICS-06 | Date range filter (last 7 days / 30 days / 90 days / custom range) |
| FR-ANALYTICS-07 | CSV export for all data tables; PDF export for charts and reports |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- API response time: < 300ms for standard CRUD operations under normal load
- Page initial load: < 3 seconds on 4G connection (target Lighthouse performance score ≥ 80)
- File upload: handle up to 10 MB per file without timeout
- Real-time updates (WebSocket or SSE): latency < 1 second for status pushes

### 7.2 Accessibility
- Minimum **90/100 Lighthouse accessibility score** on at least one core page (resident dashboard)
- ARIA labels on all interactive elements
- Keyboard navigation support throughout the application
- Sufficient color contrast ratios (WCAG 2.1 AA minimum)
- Screen-reader compatible form validation messages

### 7.3 Responsiveness
- Fully functional and visually correct at:
  - Mobile: 320px minimum width
  - Tablet: 768px
  - Desktop: 1280px+
- No horizontal scroll at any breakpoint
- Touch-friendly tap targets (minimum 44x44px)

### 7.4 Security
- All secrets stored in environment variables — zero hardcoded credentials
- Input sanitization on every API endpoint
- SQL injection prevention via parameterized queries / ORM
- XSS prevention via output escaping and Content Security Policy headers
- CORS configured explicitly for allowed origins only
- HTTPS enforced in production (handled by deployment platform)
- Rate limiting on auth endpoints (e.g., max 5 login attempts per IP per 15 minutes)
- 2FA required for all admin-level accounts

### 7.5 Reliability
- Application must function end-to-end on live deployment (no localhost-only features)
- Graceful error handling: all API errors return structured JSON with HTTP status codes and error codes
- Loading states and skeleton screens prevent blank UI during data fetches
- Error boundaries catch frontend component failures without crashing the entire app

### 7.6 Maintainability
- Component-based frontend architecture — no monolithic single-file UIs
- Versioned REST API (`/api/v1/...`)
- Consistent naming conventions across frontend and backend
- No dead code in final submission
- Environment variable usage documented in `.env.example`
- Database migration and seed scripts for reproducible setup

---

## 8. System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React.js / Next.js SPA or SSR App (Vercel)                 │
│  - Resident Portal   - Staff Dashboard                       │
│  - Admin Dashboard   - Super Admin Console                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                        API LAYER                             │
│  Node.js + Express/Fastify (Render / Railway)               │
│  - /api/v1/auth          - /api/v1/tickets                   │
│  - /api/v1/permits       - /api/v1/announcements             │
│  - /api/v1/events        - /api/v1/analytics                 │
│  - /api/v1/users         - /api/v1/departments               │
│  Middleware: JWT Auth → RBAC → Input Validation → Handler    │
└──────────┬───────────────────────────┬───────────────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼─────────────────────┐
│   PRIMARY DATABASE   │   │         FILE STORAGE              │
│   PostgreSQL         │   │  Cloudinary / Supabase Storage   │
│   (Neon / Supabase)  │   │  (attachments, permit docs,      │
│                      │   │   profile photos, certificates)  │
└──────────────────────┘   └──────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   BACKGROUND SERVICES                        │
│  - Email Service (Nodemailer / SendGrid sandbox)            │
│  - SLA Cron Job (checks breaches every 5 minutes)           │
│  - WebSocket Server (ticket status + emergency broadcasts)  │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Button, Input, Modal, Badge, etc.
│   ├── layout/          # Navbar, Sidebar, Footer
│   ├── tickets/         # TicketCard, TicketForm, StatusBadge, SLATimer
│   ├── permits/         # PermitWizard, StepIndicator, DocumentUpload
│   ├── announcements/   # AnnouncementCard, EmergencyBanner
│   └── charts/          # BarChart, DonutChart, HeatMap, FunnelChart
├── pages/ (or app/)     # Route-level components
│   ├── resident/        # Dashboard, SubmitRequest, MyTickets, Events
│   ├── staff/           # AssignedTickets, TicketDetail
│   ├── admin/           # DeptDashboard, Analytics, StaffManagement
│   └── superadmin/      # SystemOverview, Reports, Config
├── contexts/            # AuthContext, NotificationContext, ThemeContext
├── hooks/               # useAuth, useTickets, useWebSocket
├── services/            # api.js (axios instance), socket.js
├── utils/               # formatDate, generateTicketId, validators
└── styles/              # Global CSS, design tokens
```

### 8.3 Backend Architecture

```
backend/
├── src/
│   ├── routes/          # Express route definitions per module
│   │   ├── auth.routes.js
│   │   ├── tickets.routes.js
│   │   ├── permits.routes.js
│   │   ├── announcements.routes.js
│   │   ├── events.routes.js
│   │   ├── analytics.routes.js
│   │   └── users.routes.js
│   ├── controllers/     # Business logic handlers
│   ├── middleware/       # authenticate.js, authorize.js, validate.js, rateLimit.js
│   ├── models/          # DB schema definitions (Prisma / Sequelize / raw pg)
│   ├── services/        # emailService.js, notificationService.js, slaService.js
│   ├── utils/           # generateTicketId.js, generateCertificate.js, pdfGenerator.js
│   └── config/          # db.js, corsOptions.js, jwtConfig.js
├── migrations/          # Database migration files (chronological)
├── seeds/               # Seed data for departments, roles, sample users
├── .env.example
└── README.md
```

### 8.4 Database Schema (Entity Overview)

**Core Entities:**

| Table | Key Fields |
|---|---|
| `users` | id, email, password_hash, role, department_id, otp_verified, profile_photo_url, created_at |
| `departments` | id, name, code (INF/PER/SAF), sla_hours, created_at |
| `tickets` | id, ticket_number, title, description, category, priority, status, location, department_id, resident_id, assigned_staff_id, sla_deadline, created_at, updated_at |
| `ticket_attachments` | id, ticket_id, file_url, file_type, uploaded_at |
| `ticket_comments` | id, ticket_id, author_id, body, is_internal, created_at |
| `ticket_status_history` | id, ticket_id, from_status, to_status, changed_by, changed_at |
| `permit_applications` | id, permit_type, applicant_id, status, form_data (JSONB), fee_amount, draft_saved_at, submitted_at |
| `permit_documents` | id, application_id, file_url, verified, uploaded_at |
| `permit_certificates` | id, application_id, permit_number, qr_code_url, expiry_date, issued_at |
| `announcements` | id, title, body, category, priority, is_emergency, expiry_date, author_id, created_at |
| `announcement_reads` | id, announcement_id, user_id, read_at |
| `events` | id, title, description, category, event_date, location, capacity, created_by, department_id |
| `event_registrations` | id, event_id, user_id, registered_at |
| `notifications` | id, user_id, type, message, is_read, reference_id, reference_type, created_at |
| `audit_logs` | id, actor_id, action, resource_type, resource_id, ip_address, created_at |

**Key Relationships:**
- `users` ↔ `departments` (many-to-one for staff/admin)
- `tickets` ↔ `users` (resident submitter, assigned staff — separate FK)
- `tickets` ↔ `departments` (routed to one department)
- `ticket_status_history` ← `tickets` (one-to-many, full audit trail)
- `permit_applications` ↔ `users` (applicant)
- `permit_applications` ↔ `permit_certificates` (one-to-one on approval)

---

## 9. Data Flow

### 9.1 Resident Submits a Civic Request

```
Resident fills form → Client validates → POST /api/v1/tickets
  → JWT middleware verifies token
  → RBAC confirms "resident" role
  → Input sanitization & validation
  → Files uploaded to Cloudinary → URLs stored
  → Ticket created in DB with unique ID and SLA deadline
  → Notification created for resident (in-app)
  → Email sent to resident (async, via email service)
  → WebSocket event broadcast to relevant dept admin/staff dashboard
  → 201 response with ticket data returned to client
```

### 9.2 Staff Updates Ticket Status

```
Staff selects new status → PATCH /api/v1/tickets/:id/status
  → JWT auth → RBAC (staff or admin of same department)
  → Status transition validated (no backward jumps except admin)
  → ticket_status_history row inserted
  → ticket.status updated
  → Notification dispatched to resident
  → Email sent to resident (async)
  → WebSocket event pushed to resident's active session
  → SLA check: if breach imminent, alert sent to dept admin
```

### 9.3 SLA Breach Monitoring (Cron Job)

```
Cron runs every 5 minutes
  → Queries tickets WHERE status NOT IN ('Resolved', 'Closed')
    AND sla_deadline BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
    AND escalation_alert_sent = false
  → For each matching ticket:
      → Send in-app + email alert to Department Admin
      → Set escalation_alert_sent = true
```

### 9.4 Emergency Broadcast

```
Admin publishes Emergency announcement
  → POST /api/v1/announcements (priority = 'EMERGENCY')
  → Server broadcasts WebSocket event to ALL connected resident sessions
  → Each client renders full-screen dismissible banner
  → Resident dismisses → PATCH /api/v1/announcements/:id/read
```

### 9.5 Permit Approval → Certificate Generation

```
Dept Admin approves application
  → PATCH /api/v1/permits/:id/status { status: 'APPROVED' }
  → Server generates PDF certificate:
      → Unique permit number (PER-2026-{SEQ})
      → QR code pointing to /verify/{permit_number}
      → Expiry date (configurable per permit type)
      → Department seal watermark
  → Certificate stored in Cloudinary
  → permit_certificates row inserted
  → Applicant notified via in-app + email with download link
```

---

## 10. Security Considerations

### 10.1 Authentication Security
- **Password hashing:** bcrypt with minimum cost factor 12
- **JWT:** Short-lived access tokens (15 min) + refresh tokens (7 days) stored in `httpOnly` cookies (not localStorage)
- **OTP expiry:** Email OTP valid for 10 minutes; max 3 attempts before lockout
- **2FA:** TOTP-based (Google Authenticator compatible) for all admin and super admin accounts
- **IP restriction:** Super Admin login validated against a whitelist of allowed IPs stored in environment config

### 10.2 API Security
- **Input sanitization:** All string inputs stripped of dangerous characters before DB insertion; parameterized queries exclusively
- **Validation middleware:** Every route has a dedicated schema validator (Joi / Zod); invalid payloads rejected before business logic runs
- **RBAC at API layer:** Role check performed in dedicated `authorize(roles)` middleware — frontend role-hiding is cosmetic only
- **CORS:** Explicit `allowedOrigins` list in config; no wildcard `*` in production
- **Rate limiting:** `express-rate-limit` applied to `/api/v1/auth/*` endpoints (5 req/15 min per IP)
- **HTTP security headers:** `helmet.js` applied globally (X-Frame-Options, CSP, HSTS, etc.)

### 10.3 File Upload Security
- File type validation by MIME type (not extension alone)
- Maximum file size enforced at middleware level before upload to Cloudinary
- Uploaded files served via Cloudinary signed URLs where sensitive (e.g., permit documents)

### 10.4 Audit & Compliance
- **Audit logs** written to `audit_logs` table for all Super Admin actions
- **Status history** preserved indefinitely — no ticket status can be silently changed
- **No secrets in repository:** `.env.example` contains keys only; `.env` is gitignored
- Environment variable presence validated at startup; server refuses to start if critical vars are missing

---

## 11. Scalability Plan

> Note: Within the 6-hour competition window, we target a working MVP. The following plan reflects sound engineering decisions that allow the system to scale naturally.

### 11.1 Database
- **Indexes** on: `tickets.status`, `tickets.department_id`, `tickets.resident_id`, `tickets.created_at`, `users.email`, `notifications.user_id`
- **JSONB** used for `permit_applications.form_data` to accommodate variable permit fields without schema migrations per permit type
- **Connection pooling** via `pg-pool` or Prisma's built-in pool to handle concurrent requests

### 11.2 Backend
- **Stateless API design** — no server-side session state; enables horizontal scaling behind a load balancer with no sticky sessions
- **Async email dispatch** — all email sends are non-blocking (queued or fire-and-forget) to prevent API latency
- **WebSocket** server uses the same Node.js process in MVP; can be separated to a dedicated Socket.io service at scale
- **Cron job** for SLA monitoring runs as a lightweight in-process scheduler (node-cron); can be extracted to a separate worker process

### 11.3 Frontend
- **Code splitting** per route ensures residents don't load admin bundle and vice versa
- **React Query or SWR** for server state management with automatic caching and revalidation
- **Static assets** on Vercel CDN — globally distributed with zero configuration

### 11.4 File Storage
- **Cloudinary** (or Supabase Storage) handles image transformations, CDN delivery, and scaling independently of the application server

---

## 12. Assumptions

1. **Single City Instance:** The platform is scoped to one city. Multi-tenancy (multiple cities) is out of scope for this competition.
2. **Three Fixed Departments:** Department of Infrastructure, Permits & Licensing, and Public Safety are pre-seeded. Department creation by Super Admin is supported but the three base departments are always present.
3. **No Real Payment Gateway:** The payment stub in Module B is a simulation — fee calculation and receipt generation are real, but no actual money is processed.
4. **Email Delivery:** Nodemailer with a sandbox/test SMTP (Mailtrap or SendGrid sandbox) is used. Real email deliverability to resident inboxes is not guaranteed in the competition environment.
5. **Map/Location:** Location data is stored as text (city address or area name) in MVP. Leaflet.js map pin integration is implemented as a bonus feature if time permits.
6. **File Storage:** Cloudinary free tier is sufficient for competition demo volumes.
7. **QR Code on Certificates:** QR code points to a `/verify/:permit_number` public route that returns permit details — no third-party QR verification service required.
8. **Browser Support:** Modern evergreen browsers only (Chrome, Firefox, Safari, Edge). IE11 is explicitly out of scope.
9. **Seed Data:** The database seed includes 1 Super Admin, 1 Dept Admin per department, 2 Staff per department, and 10 sample residents with 20 sample tickets for demo purposes.
10. **Concurrent Users:** The competition demo involves a handful of judges, not 500,000 residents. Production-scale load testing is out of scope.

---

## 13. Constraints

### Technical Constraints
- **6-hour development window** — architecture must favor simplicity and speed of delivery without sacrificing correctness
- **No no-code/low-code platforms** — Wix, WordPress, Webflow, Lovable, and Bolt are explicitly prohibited and will result in disqualification
- **Live deployment is mandatory** — localhost-only submissions receive zero marks for the deployment criterion
- **Environment variables required** — hardcoded credentials result in disqualification
- **Minimum 15 commits** — bulk commits or single large pushes are prohibited; commit history will be audited

### Framework Constraints
- Frontend: React.js, Next.js, Vue.js, or Svelte only
- Backend: Node.js (Express/Fastify/NestJS), Python (FastAPI/Django), or Go only
- Database: PostgreSQL, MySQL, or MongoDB only

### Time Allocation Constraints (Recommended)
| Phase | Time | Focus |
|---|---|---|
| Setup | 0:00–2:00 | Repo, env, scaffolding, DB schema, Auth system |
| Core Build | 2:00–3:30 | Module A (CRMS) complete, Module B core flow |
| Feature Build | 3:30–5:00 | Module C (Announcements), Module D (Analytics), Notifications |
| Deploy | 5:00–5:30 | Push to production, test live URLs, fix CORS |
| Polish | 5:30–6:00 | README, UI cleanup, demo walkthrough prep |

---

## 14. Innovation Factor

### Mandatory Innovation (Baseline)
- **Automated SLA Escalation:** Proactive alerts before deadlines are breached — not reactive reports after the fact
- **Digital Certificate Generation:** Server-side PDF with QR code for instant permit verification
- **Role-Stratified Dashboards:** Four completely different UI experiences from a single codebase, enforced at API level

### Bonus Feature Strategy (Recommended Priority Order)

1. **AI-Powered Request Categorization** *(highest impact, ~1 hour)*
   - On ticket submission, call an LLM API (Claude/OpenAI) with the request description
   - API returns suggested department and category
   - Display as a smart suggestion — resident can accept or override
   - Demonstrates practical AI integration, directly relevant to the "smart city" theme

2. **Real-Time Updates via WebSockets** *(strong UX impact, ~45 min)*
   - Socket.io on the backend; native WebSocket or socket.io-client on frontend
   - Ticket status changes push instantly to resident without page refresh
   - Emergency broadcasts push to all connected sessions simultaneously

3. **Interactive Map Integration** *(visual wow factor, ~1 hour)*
   - Leaflet.js map for location pinning on ticket submission
   - Heatmap overlay on the analytics dashboard showing complaint density by area

4. **Dark Mode** *(quick win, ~30 min)*
   - CSS variables for all color tokens
   - `prefers-color-scheme` media query + manual toggle
   - Persisted in localStorage

5. **Urdu Internationalization with RTL** *(differentiator for Pakistani context, ~1.5 hours)*
   - i18next for translation strings
   - RTL layout switching when Urdu is selected
   - Particularly resonant given this is Bahria University, Islamabad

### Design Differentiation
- SLA timer as a living, color-shifting component (not just a static label)
- Ticket ID styled as a monospace chip — mimics professional ticketing systems
- Emergency banner with pulsing red border and auto-dismiss countdown
- Analytics dashboard with card-based KPIs before chart deep-dives

---

## 15. Future Improvements

> These are explicitly out of scope for the competition but represent a realistic product roadmap.

1. **Mobile Native Apps (PWA → React Native):** The architecture's API-first design allows a React Native app to consume the same backend with zero changes.
2. **Real Payment Gateway Integration:** Stripe or JazzCash (Pakistan) integration for actual permit fee collection.
3. **Advanced GIS Integration:** Full GIS layer with neighborhood boundary polygons, asset mapping (roads, utility lines), and proximity-based complaint routing.
4. **Machine Learning SLA Prediction:** Train a model on historical ticket data to predict likelihood of SLA breach per ticket type and proactively adjust staffing.
5. **Multi-City / Multi-Tenant Architecture:** Namespace all data by `city_id` to support SaaS deployment for multiple municipalities.
6. **Resident Trust Score:** Reputation system to flag repeat false-report submitters and surface high-quality reporters.
7. **Offline-First PWA:** Service worker caching for form drafts and ticket history; sync on reconnect — ideal for areas with intermittent connectivity.
8. **Public Transparency Dashboard:** A read-only public-facing dashboard showing aggregate city performance metrics — no login required, builds civic trust.
9. **Department Inter-Communication Layer:** Shared internal messaging between departments for cross-department tickets (e.g., a road collapse that involves both Infrastructure and Public Safety).
10. **Automated Daily Digest Emails:** Nodemailer cron sending Dept Admins a morning summary of pending SLA items, new overnight tickets, and resolved count.

---

## 16. Conclusion

CivicConnect addresses a real, high-impact problem in urban governance: the breakdown of communication between residents and city departments. By replacing ad-hoc emails and spreadsheets with a structured, real-time, role-aware platform, it delivers measurable improvements in response time, accountability, and resident satisfaction.

The system is architected to be:
- **Correct** — RBAC enforced at the API layer, not just the UI
- **Complete** — all four mandatory modules implemented end-to-end
- **Secure** — JWT rotation, 2FA, input sanitization, audit logs
- **Maintainable** — clean separation of concerns, versioned API, migration scripts
- **Demonstrable** — seeded with realistic data, deployed live, walkthrough-ready

This document serves as the single source of truth from which all subsequent Phase 2 (Frontend PRD) and Phase 3 (Backend PRD) documentation will be derived. No ambiguity has been left unresolved at this level — every feature, user role, data relationship, security requirement, and deployment constraint is defined here.

**The architecture is chosen to maximize delivery speed within 6 hours while producing a system that can genuinely scale beyond the competition context.**

---

*Document prepared for AUREX AI 2026 — Web Development Track*
*Bahria University, BSEAS | 13 May 2026*
*Classification: Team Internal — Competition Use Only*
