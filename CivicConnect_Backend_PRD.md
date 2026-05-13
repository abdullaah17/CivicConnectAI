# CivicConnect — Backend Product Requirements Document
### AUREX AI 2026 | Web Development Track | Bahria University, BSEAS

---

> **Document Type:** Phase 3 — Backend PRD
> **Derived From:** CivicConnect Master Documentation v1.0 + Frontend PRD v1.0
> **Version:** 1.0
> **Date:** 13 May 2026
> **Audience:** Backend Engineering Team
> **Status:** Ready for Implementation
> **Classification:** Team Internal — Competition Use Only

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [API Design Philosophy](#2-api-design-philosophy)
3. [Endpoint Definitions](#3-endpoint-definitions)
4. [Request & Response Structures](#4-request--response-structures)
5. [Authentication & Authorization Strategy](#5-authentication--authorization-strategy)
6. [Database Schema Design](#6-database-schema-design)
7. [Data Models](#7-data-models)
8. [Business Logic Breakdown](#8-business-logic-breakdown)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Logging & Monitoring](#10-logging--monitoring)
11. [Security Design](#11-security-design)
12. [Scalability & Performance Strategy](#12-scalability--performance-strategy)
13. [Suggested Tech Stack](#13-suggested-tech-stack)
14. [Environment Variables](#14-environment-variables)
15. [Directory Structure](#15-directory-structure)
16. [Assumptions](#16-assumptions)

---

## 1. System Architecture

### 1.1 High-Level Architecture Overview

CivicConnect follows a **three-tier, API-first architecture**. The backend is a stateless RESTful service that acts as the sole authority for business logic, data access, and real-time event distribution. The frontend never directly contacts the database or any third-party service that holds sensitive data.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│   Next.js / React SPA (Vercel CDN)                                   │
│   Resident Portal | Staff Dashboard | Admin Console | Super Admin    │
└────────────────────────┬────────────────────┬────────────────────────┘
                         │ HTTPS REST          │ WebSocket (Socket.io)
                         ▼                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                              │
│   Node.js + Express  ·  /api/v1/*                                    │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐               │
│  │  Auth MW   │  │  RBAC MW     │  │  Validation MW │               │
│  │  (JWT)     │  │  (Role Guard)│  │  (Zod)         │               │
│  └────────────┘  └──────────────┘  └────────────────┘               │
│                                                                      │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐  │
│  │  Auth    │ │ Tickets │ │ Permits │ │Announc.  │ │ Analytics  │  │
│  │ Router   │ │ Router  │ │ Router  │ │& Events  │ │ Router     │  │
│  └──────────┘ └─────────┘ └─────────┘ └──────────┘ └────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Email Service│  │ Notification │  │ SLA Monitor (node-cron)  │   │
│  │ (Nodemailer) │  │ Service      │  │ runs every 5 min         │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Socket.io Server  (same Node process, upgradeable)          │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌───────────────┐  ┌────────────────────┐
│   PostgreSQL    │  │  Cloudinary   │  │  Mailtrap / SendGrid│
│   (Neon)        │  │  (File CDN)   │  │  (SMTP sandbox)    │
└─────────────────┘  └───────────────┘  └────────────────────┘
```

### 1.2 Deployment Topology

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | CDN-distributed, auto-HTTPS |
| Backend API | Render / Railway | Always-on Node.js process, managed HTTPS |
| Database | Neon (PostgreSQL) | Serverless-compatible, connection pooling built-in |
| File Storage | Cloudinary | Free tier sufficient for competition; signed URLs for private documents |
| Email | Mailtrap sandbox (dev) / SendGrid free tier (prod) | Non-blocking async dispatch |
| WebSocket | Socket.io on same backend process | Can be extracted to separate service at scale |
| Cron | node-cron (in-process) | SLA monitoring every 5 minutes |

### 1.3 Request Lifecycle

```
Client Request
    │
    ▼
Rate Limiter (express-rate-limit)       ← Applied to /auth/* only
    │
    ▼
Helmet.js Headers                       ← All routes
    │
    ▼
CORS Check                              ← Explicit allowedOrigins whitelist
    │
    ▼
Body Parser + Request Size Limit        ← JSON: 1MB; multipart handled by multer
    │
    ▼
JWT Authentication Middleware           ← Extracts & verifies token → req.user
    │
    ▼
RBAC Authorization Middleware           ← authorize(['resident','staff',...])
    │
    ▼
Zod Schema Validation                   ← Reject malformed payloads before business logic
    │
    ▼
Controller (Business Logic)
    │
    ├──▶ Prisma ORM → PostgreSQL
    ├──▶ Cloudinary SDK (file ops)
    ├──▶ Email Service (async, non-blocking)
    ├──▶ Socket.io emit (real-time push)
    └──▶ Audit Log write (super admin actions)
    │
    ▼
Structured JSON Response
```

---

## 2. API Design Philosophy

### 2.1 Core Principles

| Principle | Implementation |
|---|---|
| **Versioned** | All routes prefixed `/api/v1/` — future breaking changes go to `/api/v2/` without removing v1 |
| **Stateless** | No server-side sessions. All auth state lives in JWT. Horizontal scaling requires zero coordination |
| **Resource-Oriented** | URLs name resources (nouns), HTTP verbs define action: `GET /tickets` not `GET /getTickets` |
| **Consistent Envelope** | Every response — success or error — returns the same top-level JSON structure |
| **Role-Enforced** | RBAC checked at middleware layer, not inside controllers. Frontend RBAC is cosmetic only |
| **Fail Fast** | Validation runs before any DB query. Invalid input is rejected at the boundary |
| **Idempotent Mutations** | `PUT` and `PATCH` are safe to retry. Ticket status updates are guarded against duplicate transitions |

### 2.2 URL Naming Conventions

```
Collection:       GET    /api/v1/tickets
Single resource:  GET    /api/v1/tickets/:id
Create:           POST   /api/v1/tickets
Partial update:   PATCH  /api/v1/tickets/:id
Replace:          PUT    /api/v1/tickets/:id        (rare; used for permit form_data)
Delete/archive:   DELETE /api/v1/tickets/:id
Sub-resource:     GET    /api/v1/tickets/:id/comments
Action:           PATCH  /api/v1/tickets/:id/status (status is a sub-resource, PATCH transitions it)
```

### 2.3 Standard Response Envelope

```json
// SUCCESS
{
  "success": true,
  "data": { /* resource or collection */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "totalPages": 8
  }
}

// ERROR
{
  "success": false,
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket with ID INF-2026-00047 does not exist.",
    "details": []       // Array of field-level errors for validation failures
  }
}
```

---

## 3. Endpoint Definitions

### 3.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Roles Permitted | Rate Limited |
|---|---|---|---|---|
| `POST` | `/auth/register` | Resident self-registration | Public | Yes (5/15min) |
| `POST` | `/auth/verify-otp` | Verify email OTP after registration | Public | Yes (5/15min) |
| `POST` | `/auth/resend-otp` | Resend OTP to email | Public | Yes (3/15min) |
| `POST` | `/auth/login` | Unified login for all roles | Public | Yes (5/15min) |
| `POST` | `/auth/2fa/setup` | Generate TOTP QR code (admin first login) | `dept_admin`, `super_admin` | No |
| `POST` | `/auth/2fa/verify` | Verify TOTP code and complete login | `dept_admin`, `super_admin` | Yes (5/15min) |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token | Public (cookie) | No |
| `POST` | `/auth/logout` | Invalidate refresh token server-side | Authenticated | No |
| `POST` | `/auth/forgot-password` | Send password reset OTP | Public | Yes (3/15min) |
| `POST` | `/auth/reset-password` | Apply new password using OTP | Public | Yes (5/15min) |

### 3.2 Users (`/api/v1/users`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/users/me` | Get current user's profile | All authenticated |
| `PATCH` | `/users/me` | Update display name, profile photo | All authenticated |
| `PATCH` | `/users/me/password` | Change password (requires current password) | All authenticated |
| `GET` | `/users` | List all users (paginated, filterable by role/dept) | `super_admin` |
| `POST` | `/users/staff` | Create staff or admin account | `super_admin`, `dept_admin` |
| `PATCH` | `/users/:id/status` | Activate or deactivate user account | `super_admin` |
| `PATCH` | `/users/:id/role` | Change user role or department assignment | `super_admin` |
| `GET` | `/users/staff` | List staff in caller's department | `dept_admin` |

### 3.3 Tickets / CRMS (`/api/v1/tickets`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/tickets` | List tickets — filtered by role scope | All authenticated |
| `POST` | `/tickets` | Submit new civic request | `resident` |
| `GET` | `/tickets/:id` | Get single ticket with full detail | Scoped by role |
| `PATCH` | `/tickets/:id/status` | Transition ticket status | `staff`, `dept_admin`, `super_admin` |
| `PATCH` | `/tickets/:id/assign` | Assign or reassign to staff member | `dept_admin`, `super_admin` |
| `GET` | `/tickets/:id/comments` | List all comments on a ticket | Scoped (internal hidden from resident) |
| `POST` | `/tickets/:id/comments` | Add comment or note | `resident`, `staff`, `dept_admin`, `super_admin` |
| `GET` | `/tickets/:id/history` | Full status transition history | All roles (with auth) |
| `GET` | `/tickets/:id/attachments` | List file attachments | All authenticated |
| `POST` | `/tickets/upload` | Upload attachment file to Cloudinary | `resident` |
| `GET` | `/tickets/my` | Resident's own tickets (shorthand) | `resident` |
| `GET` | `/tickets/stats` | KPI summary scoped to authenticated user's role/dept | `staff`, `dept_admin`, `super_admin` |

### 3.4 Permits (`/api/v1/permits`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/permits` | List permit applications — scoped by role | All authenticated |
| `GET` | `/permits/types` | List permit types with fee schedules (for PermitTypeSelector) | All authenticated |
| `POST` | `/permits` | Create/start permit application | `resident` |
| `GET` | `/permits/:id` | Get single application with all details | Scoped |
| `PATCH` | `/permits/:id/draft` | Save or update draft form data (auto-save every 30s) | `resident` |
| `POST` | `/permits/:id/submit` | Finalize and submit draft application | `resident` |
| `PATCH` | `/permits/:id/status` | Advance application through review stages | `dept_admin`, `super_admin` |
| `POST` | `/permits/:id/documents` | Upload supporting document | `resident` |
| `GET` | `/permits/:id/certificate` | Download approved permit PDF certificate | `resident`, `dept_admin` |
| `GET` | `/permits/:id/receipt` | Download payment receipt PDF | `resident` |
| `GET` | `/permits/verify/:permitNumber` | Public permit verification (no auth) | Public |

### 3.5 Announcements (`/api/v1/announcements`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/announcements` | List active announcements (paginated, filterable) | All authenticated |
| `POST` | `/announcements` | Create new announcement | `dept_admin`, `super_admin` |
| `GET` | `/announcements/:id` | Get single announcement | All authenticated |
| `PATCH` | `/announcements/:id` | Edit unpublished or active announcement | `dept_admin`, `super_admin` |
| `DELETE` | `/announcements/:id` | Archive announcement (soft delete) | `dept_admin`, `super_admin` |
| `POST` | `/announcements/:id/read` | Mark announcement as read for current user | `resident` |
| `GET` | `/announcements/unread-count` | Get unread count for current user | `resident` |
| `GET` | `/announcements/archive` | List expired/archived announcements | All authenticated |

### 3.6 Events (`/api/v1/events`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/events` | List events (filterable by category, date, dept) | Public + All authenticated |
| `POST` | `/events` | Create new event | `dept_admin`, `super_admin` |
| `GET` | `/events/:id` | Get single event with registration count | All |
| `PATCH` | `/events/:id` | Edit event | `dept_admin`, `super_admin` |
| `DELETE` | `/events/:id` | Cancel/delete event | `dept_admin`, `super_admin` |
| `POST` | `/events/:id/register` | Register current resident for event | `resident` |
| `DELETE` | `/events/:id/register` | Cancel own event registration | `resident` |
| `GET` | `/events/:id/registrations` | List all registrants | `dept_admin`, `super_admin` |

### 3.7 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/notifications` | Get current user's notifications (paginated) | All authenticated |
| `PATCH` | `/notifications/:id/read` | Mark single notification as read | All authenticated |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | All authenticated |
| `GET` | `/notifications/unread-count` | Get current unread count | All authenticated |

> **Implementation Note:** `GET /notifications` also returns `X-Unread-Count: {n}` as a response header, so the frontend can update the bell badge without a separate request. This matches Frontend PRD §7.7: "returns unread count in headers."

### 3.8 Analytics (`/api/v1/analytics`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/analytics/tickets` | Ticket summary: counts by status, avg resolution time, SLA breach rate (query: `dept_id`, `date_from`, `date_to`) | `dept_admin`, `super_admin` |
| `GET` | `/analytics/tickets/summary` | Alias for `/analytics/tickets` — backward compatible | `dept_admin`, `super_admin` |
| `GET` | `/analytics/permits` | Permit pipeline funnel: application counts per stage | `dept_admin`, `super_admin` |
| `GET` | `/analytics/sla` | SLA breach rate and breach history (query: `dept_id`, date range) | `dept_admin`, `super_admin` |
| `GET` | `/analytics/top-issues` | Top 5 issues by category and count (last 30 days default) | `dept_admin`, `super_admin` |
| `GET` | `/analytics/heatmap` | Location-grouped complaint counts for map/table visualization | `dept_admin`, `super_admin` |
| `GET` | `/analytics/export-csv` | Stream CSV export for any data table (query: `dataset`, `dept_id`, date range) | `dept_admin`, `super_admin` |
| `GET` | `/analytics/export-pdf` | Generate and return PDF report binary (query: `dept_id`, date range) | `dept_admin`, `super_admin` |

### 3.9 Departments (`/api/v1/departments`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/departments` | List all departments | All authenticated |
| `GET` | `/departments/:id` | Get department details and SLA config | All authenticated |
| `PATCH` | `/departments/:id` | Update SLA hours per priority level | `super_admin` |
| `GET` | `/departments/:id/staff` | List staff in department | `dept_admin`, `super_admin` |

### 3.10 Audit Logs (`/api/v1/audit`)

| Method | Endpoint | Description | Roles Permitted |
|---|---|---|---|
| `GET` | `/audit` | Paginated audit log (filterable by actor, action, date) | `super_admin` |

---

## 4. Request & Response Structures

### 4.1 POST `/auth/register`

**Request:**
```json
{
  "name": "Ayesha Tariq",
  "email": "ayesha@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "profile_photo": "[optional base64 or multipart file — uploaded to Cloudinary on register]"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful. OTP sent to your email.",
    "user_id": "uuid-here",
    "email": "ayesha@example.com"
  }
}
```

### 4.2 POST `/auth/login`

**Request:**
```json
{
  "identifier": "ayesha@example.com",
  "password": "SecurePass123!"
}
```

**Response `200` (Resident — no 2FA, OTP already verified):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "full_name": "Ayesha Tariq",
      "email": "ayesha@example.com",
      "role": "resident",
      "department_id": null,
      "profile_photo_url": "https://res.cloudinary.com/...",
      "otp_verified": true
    }
  }
}
```

> **Note:** `refresh_token` is set as an `httpOnly` cookie, not in the response body. The `POST /auth/verify-otp` endpoint (used after registration) also returns `{ access_token, user }` — it is the mechanism by which a newly registered resident receives their first token.

**Response `200` (Admin — requires 2FA):**
```json
{
  "success": true,
  "data": {
    "requires2FA": true,
    "temp_token": "short-lived-token-for-2fa-step"
  }
}
```

### 4.3 POST `/tickets`

**Request (`multipart/form-data`):**
```
department_id:    "dept-infra-uuid"
title:            "Broken street light on Canal Road"
description:      "The street light near F-7 sector has been non-functional for 3 days..."
category:         "street_lighting"
location:         "Canal Road, near Sector F-7, Islamabad"
priority:         "medium"
attachments[]:    [File, File]   ← up to 5 files, 10MB each
```

> **ASSUMPTION [B-A01]:** Files are uploaded via a pre-flight `POST /tickets/upload` call that returns Cloudinary URLs, which are then passed as `attachment_urls[]` strings in the ticket creation body. This avoids holding large multipart payloads in the ticket endpoint handler.

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticket_number": "INF-2026-00047",
    "title": "Broken street light on Canal Road",
    "status": "submitted",
    "priority": "medium",
    "department": { "id": "uuid", "name": "Infrastructure", "code": "INF" },
    "category": "street_lighting",
    "location": "Canal Road, near Sector F-7, Islamabad",
    "sla_deadline": "2026-05-15T09:00:00Z",
    "attachments": [
      { "id": "att-uuid", "file_url": "https://res.cloudinary.com/...", "file_type": "image/jpeg" }
    ],
    "created_at": "2026-05-13T09:00:00Z"
  }
}
```

### 4.4 PATCH `/tickets/:id/status`

**Request:**
```json
{
  "status": "in_progress",
  "public_note": "Dispatched Team B to Canal Road site."
}
```

> **Note:** The `public_note` field is visible to the resident. Staff who wish to add an internal-only note use `POST /tickets/:id/comments` with `{ body, is_internal: true }` separately. This separation keeps the status transition payload minimal and aligns with the Frontend PRD's `CommentThread` architecture.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "ticket-uuid",
    "ticket_number": "INF-2026-00047",
    "status": "in_progress",
    "updated_at": "2026-05-13T12:00:00Z",
    "history_entry": {
      "from_status": "assigned",
      "to_status": "in_progress",
      "changed_by": { "id": "staff-uuid", "name": "Khalid Mahmood" },
      "changed_at": "2026-05-13T12:00:00Z",
      "note": "Dispatched Team B to Canal Road site."
    }
  }
}
```

### 4.5 GET `/analytics/tickets/summary`

**Query Parameters:**
```
?department_id=uuid   (optional; super_admin can omit for system-wide)
&start_date=2026-05-01
&end_date=2026-05-13
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2026-05-01", "end": "2026-05-13" },
    "department": "Infrastructure",
    "by_status": {
      "submitted":    14,
      "under_review": 8,
      "assigned":     12,
      "in_progress":  19,
      "resolved":     67,
      "closed":       43
    },
    "total": 163,
    "sla_breach_rate": 0.073,
    "avg_resolution_hours": 26.4
  }
}
```

---

## 5. Authentication & Authorization Strategy

### 5.1 Token Architecture

| Token | Type | Storage | Expiry | Purpose |
|---|---|---|---|---|
| Access Token | JWT (RS256 or HS256) | Memory (frontend store) | 15 minutes | Authorizes API requests via `Authorization: Bearer` header |
| Refresh Token | Opaque UUID (stored in DB) | `httpOnly`, `Secure`, `SameSite=Strict` cookie | 7 days | Exchanges for new access token |
| OTP | 6-digit numeric | DB (`otp_hash`, `otp_expires_at`) | 10 minutes | Email verification, password reset |
| 2FA Temp Token | Short-lived JWT | Response body (frontend holds momentarily) | 5 minutes | Bridges credential check to TOTP verification for admins |
| TOTP Secret | Base32 string | DB (encrypted at rest) | Permanent (until reset) | Google Authenticator-compatible TOTP for admins |

### 5.2 JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "role": "dept_admin",
  "department_id": "dept-permits-uuid",
  "email": "sara@civicconnect.city",
  "iat": 1715594400,
  "exp": 1715595300
}
```

### 5.3 Refresh Token Rotation

```
1. Client sends expired access token → 401 Unauthorized
2. Client automatically calls POST /auth/refresh (cookie sent automatically)
3. Server validates refresh token against DB record (hash match + not revoked + not expired)
4. Server issues new access token + new refresh token cookie
5. Old refresh token is marked revoked in DB (prevents token reuse attacks)
6. If refresh token is invalid/expired → 401, client redirects to login
```

### 5.4 RBAC Matrix

| Resource Action | `resident` | `staff` | `dept_admin` | `super_admin` |
|---|:---:|:---:|:---:|:---:|
| Submit ticket | ✅ | ❌ | ❌ | ❌ |
| View own tickets | ✅ | ❌ | ❌ | ❌ |
| View dept tickets | ❌ | ✅ (own dept) | ✅ (own dept) | ✅ (all) |
| Update ticket status | ❌ | ✅ | ✅ | ✅ |
| Reassign ticket | ❌ | ❌ | ✅ (own dept) | ✅ (all) |
| Add public comment | ✅ | ✅ | ✅ | ✅ |
| Add internal note | ❌ | ✅ | ✅ | ✅ |
| Submit permit application | ✅ | ❌ | ❌ | ❌ |
| Review permit | ❌ | ❌ | ✅ (own dept) | ✅ |
| Create announcement | ❌ | ❌ | ✅ | ✅ |
| Emergency broadcast | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ (own dept) | ✅ (all) |
| Manage staff | ❌ | ❌ | ✅ (own dept) | ✅ (all) |
| Configure departments | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

### 5.5 Authorization Middleware Pattern

```javascript
// middleware/authorize.js
const authorize = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' }
    });
  }
  next();
};

// middleware/departmentScope.js
// Applied to dept_admin calls — enforces same-department-only access
const enforceDeptScope = (req, res, next) => {
  if (req.user.role === 'dept_admin') {
    req.scopedDepartmentId = req.user.department_id;
  }
  next();
};
```

### 5.6 Super Admin IP Restriction

```javascript
// middleware/ipRestrict.js
const ALLOWED_IPS = process.env.SUPER_ADMIN_ALLOWED_IPS?.split(',') ?? [];

const ipRestrict = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  if (req.user?.role === 'super_admin' && !ALLOWED_IPS.includes(clientIp)) {
    auditLog({ actor: req.user.id, action: 'LOGIN_BLOCKED_IP', ip: clientIp });
    return res.status(403).json({ success: false, error: { code: 'IP_RESTRICTED' } });
  }
  next();
};
```

### 5.7 OTP Strategy

- Generated as 6-digit numeric string using `crypto.randomInt(100000, 999999)`
- Stored as bcrypt hash in `users.otp_hash` with expiry in `users.otp_expires_at`
- Max 3 failed attempts → account temporary lock for 15 minutes
- Resend cooldown: 60 seconds enforced at API level (checked against `otp_sent_at` timestamp)

---

## 6. Database Schema Design

### 6.1 Entity Relationship Overview

```
users ─────────────────┐
  │ (dept_id FK)        │
  ▼                     │
departments             │
  │ (sla_config JSONB)  │
  │                     │
tickets ───────────────┘
  │ resident_id FK ──── users.id
  │ assigned_to FK ──── users.id
  │ department_id FK ── departments.id
  │
  ├── ticket_attachments (ticket_id FK)
  ├── ticket_comments    (ticket_id FK, author_id FK)
  └── ticket_status_history (ticket_id FK, changed_by FK)

permit_applications
  │ applicant_id FK ──── users.id
  │
  ├── permit_documents   (application_id FK)
  └── permit_certificates (application_id FK, one-to-one)

announcements
  │ author_id FK ──── users.id
  │
  └── announcement_reads (announcement_id + user_id, composite PK)

events
  │ created_by FK ──── users.id
  │ department_id FK ── departments.id
  │
  └── event_registrations (event_id + user_id, composite PK)

notifications (user_id FK ──── users.id)
audit_logs    (actor_id FK ──── users.id)
```

### 6.2 Full SQL Schema (PostgreSQL)

```sql
-- ══════════════════════════════════════
-- EXTENSIONS
-- ══════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Trigram index for full-text search

-- ══════════════════════════════════════
-- ENUM TYPES
-- ══════════════════════════════════════
CREATE TYPE user_role AS ENUM ('resident', 'staff', 'dept_admin', 'super_admin');

CREATE TYPE ticket_status AS ENUM (
  'submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed'
);

CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'emergency');

CREATE TYPE permit_type AS ENUM (
  'construction_permit', 'event_permit', 'business_license_renewal'
);

CREATE TYPE permit_status AS ENUM (
  'draft', 'submitted', 'document_verification',
  'field_inspection_scheduled', 'approved', 'rejected'
);

CREATE TYPE announcement_priority AS ENUM ('normal', 'urgent', 'emergency');

CREATE TYPE notification_type AS ENUM (
  'ticket_status_change', 'ticket_comment', 'ticket_assigned',
  'permit_status_change', 'permit_approved', 'permit_rejected',
  'announcement_published', 'sla_breach_alert', 'event_registration_confirmed'
);

-- ══════════════════════════════════════
-- DEPARTMENTS
-- ══════════════════════════════════════
CREATE TABLE departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  code            CHAR(3) NOT NULL UNIQUE,   -- 'INF', 'PER', 'SAF'
  description     TEXT,
  sla_config      JSONB NOT NULL DEFAULT '{
    "low": 72, "medium": 48, "high": 24, "emergency": 4
  }',                                         -- hours per priority level
  escalation_threshold_hours INT NOT NULL DEFAULT 2,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- USERS
-- ══════════════════════════════════════
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name             VARCHAR(150) NOT NULL,
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         VARCHAR(255) NOT NULL,
  role                  user_role NOT NULL DEFAULT 'resident',
  department_id         UUID REFERENCES departments(id) ON DELETE SET NULL,
  profile_photo_url     TEXT,
  otp_hash              VARCHAR(255),
  otp_expires_at        TIMESTAMPTZ,
  otp_attempts          SMALLINT NOT NULL DEFAULT 0,
  otp_locked_until      TIMESTAMPTZ,
  otp_sent_at           TIMESTAMPTZ,
  otp_verified          BOOLEAN NOT NULL DEFAULT FALSE,
  totp_secret           TEXT,                -- Encrypted at rest (admin/super_admin only)
  totp_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  refresh_token_hash    VARCHAR(255),        -- Last valid refresh token (hash)
  refresh_token_expires TIMESTAMPTZ,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at         TIMESTAMPTZ,
  last_login_ip         VARCHAR(45),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);

-- ══════════════════════════════════════
-- TICKETS
-- ══════════════════════════════════════
CREATE TABLE tickets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number           VARCHAR(20) NOT NULL UNIQUE,  -- e.g. INF-2026-00047
  title                   VARCHAR(150) NOT NULL,
  description             TEXT NOT NULL,
  category                VARCHAR(100) NOT NULL,
  priority                ticket_priority NOT NULL DEFAULT 'medium',
  status                  ticket_status NOT NULL DEFAULT 'submitted',
  location                TEXT,
  location_lat            DECIMAL(9,6),                 -- BONUS: map pin support
  location_lng            DECIMAL(9,6),
  department_id           UUID NOT NULL REFERENCES departments(id),
  resident_id             UUID NOT NULL REFERENCES users(id),
  assigned_to             UUID REFERENCES users(id),
  sla_deadline            TIMESTAMPTZ NOT NULL,
  escalation_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  ai_suggested_dept       VARCHAR(100),                 -- BONUS: AI categorization
  ai_suggested_category   VARCHAR(100),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_department_id ON tickets(department_id);
CREATE INDEX idx_tickets_resident_id ON tickets(resident_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline)
  WHERE status NOT IN ('resolved', 'closed');  -- Partial index for SLA cron

-- ══════════════════════════════════════
-- TICKET SEQUENCE COUNTER (for ID generation)
-- ══════════════════════════════════════
CREATE TABLE ticket_sequences (
  department_code CHAR(3) PRIMARY KEY,
  year            SMALLINT NOT NULL,
  last_seq        INT NOT NULL DEFAULT 0
);

INSERT INTO ticket_sequences (department_code, year) VALUES
  ('INF', 2026), ('PER', 2026), ('SAF', 2026);

-- ══════════════════════════════════════
-- TICKET ATTACHMENTS
-- ══════════════════════════════════════
CREATE TABLE ticket_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(100) NOT NULL,  -- MIME type
  file_name       VARCHAR(255) NOT NULL,
  file_size_bytes INT NOT NULL,
  cloudinary_id   VARCHAR(255),           -- For deletion from Cloudinary if needed
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- ══════════════════════════════════════
-- TICKET COMMENTS / NOTES
-- ══════════════════════════════════════
CREATE TABLE ticket_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = staff-only; FALSE = public
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id, created_at);

-- ══════════════════════════════════════
-- TICKET STATUS HISTORY
-- ══════════════════════════════════════
CREATE TABLE ticket_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_status   ticket_status,
  to_status     ticket_status NOT NULL,
  changed_by    UUID NOT NULL REFERENCES users(id),
  note          TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket ON ticket_status_history(ticket_id, changed_at);

-- ══════════════════════════════════════
-- PERMIT APPLICATIONS
-- ══════════════════════════════════════
CREATE TABLE permit_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id    UUID NOT NULL REFERENCES users(id),
  permit_type     permit_type NOT NULL,
  status          permit_status NOT NULL DEFAULT 'draft',
  form_data       JSONB NOT NULL DEFAULT '{}',  -- Flexible per permit type
  fee_amount      DECIMAL(10,2),
  rejection_reason TEXT,
  resubmission_of UUID REFERENCES permit_applications(id),  -- Links to original if re-submitted
  draft_saved_at  TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permits_applicant ON permit_applications(applicant_id);
CREATE INDEX idx_permits_status ON permit_applications(status);
CREATE INDEX idx_permits_type ON permit_applications(permit_type);

-- ══════════════════════════════════════
-- PERMIT DOCUMENTS
-- ══════════════════════════════════════
CREATE TABLE permit_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  file_type       VARCHAR(100) NOT NULL,
  file_size_bytes INT NOT NULL,
  cloudinary_id   VARCHAR(255),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permit_docs_application ON permit_documents(application_id);

-- ══════════════════════════════════════
-- PERMIT CERTIFICATES
-- ══════════════════════════════════════
CREATE TABLE permit_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL UNIQUE REFERENCES permit_applications(id),
  permit_number   VARCHAR(30) NOT NULL UNIQUE,  -- e.g. PER-2026-00089
  certificate_url TEXT NOT NULL,                -- Cloudinary URL of generated PDF
  qr_code_url     TEXT NOT NULL,                -- URL embedded in QR
  expiry_date     DATE NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- ANNOUNCEMENTS
-- ══════════════════════════════════════
CREATE TABLE announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID NOT NULL REFERENCES users(id),
  department_id UUID REFERENCES departments(id),  -- NULL = city-wide
  title         VARCHAR(200) NOT NULL,
  body          TEXT NOT NULL,
  category      VARCHAR(50) NOT NULL,  -- 'health','infrastructure','culture','emergency','general'
  priority      announcement_priority NOT NULL DEFAULT 'normal',
  is_emergency  BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_date   DATE,
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_expiry ON announcements(expiry_date)
  WHERE is_archived = FALSE;
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- ══════════════════════════════════════
-- ANNOUNCEMENT READS (per-user tracking)
-- ══════════════════════════════════════
CREATE TABLE announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX idx_ann_reads_user ON announcement_reads(user_id);

-- ══════════════════════════════════════
-- EVENTS
-- ══════════════════════════════════════
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID NOT NULL REFERENCES users(id),
  department_id   UUID REFERENCES departments(id),
  title           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  category        VARCHAR(50) NOT NULL,
  event_date      TIMESTAMPTZ NOT NULL,
  location        TEXT NOT NULL,
  capacity        INT NOT NULL,
  is_cancelled    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);

-- ══════════════════════════════════════
-- EVENT REGISTRATIONS
-- ══════════════════════════════════════
CREATE TABLE event_registrations (
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_reg_user ON event_registrations(user_id);

-- ══════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id    UUID,         -- ID of the related resource (ticket, permit, announcement)
  reference_type  VARCHAR(50),  -- 'ticket', 'permit', 'announcement', 'event'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ══════════════════════════════════════
-- AUDIT LOGS
-- ══════════════════════════════════════
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100) NOT NULL,   -- 'USER_DEACTIVATED', 'DEPT_SLA_UPDATED', etc.
  resource_type   VARCHAR(50),
  resource_id     UUID,
  payload         JSONB,                   -- Snapshot of changed fields (before/after)
  ip_address      VARCHAR(45) NOT NULL,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
```

---

## 7. Data Models

### 7.1 Ticket ID Generation Logic

```javascript
// utils/generateTicketId.js
// Uses a DB sequence counter to guarantee uniqueness without UUID collisions in display
async function generateTicketId(departmentCode, prisma) {
  const year = new Date().getFullYear();

  const updated = await prisma.$queryRaw`
    UPDATE ticket_sequences
    SET last_seq = last_seq + 1,
        year = ${year}
    WHERE department_code = ${departmentCode}
    RETURNING last_seq
  `;

  const seq = updated[0].last_seq;
  return `${departmentCode}-${year}-${String(seq).padStart(5, '0')}`;
  // Output: INF-2026-00047
}
```

### 7.2 SLA Deadline Calculation

```javascript
// utils/slaUtils.js
function calculateSlaDeadline(departmentSlaConfig, priority, createdAt) {
  const hours = departmentSlaConfig[priority]; // e.g. { low: 72, medium: 48, high: 24, emergency: 4 }
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

function getSlaStatus(deadline) {
  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const totalSlaMs = deadlineMs - now;

  if (totalSlaMs < 0) return 'breached';
  if (totalSlaMs < 2 * 60 * 60 * 1000) return 'critical';  // < 2 hours
  if (totalSlaMs < 8 * 60 * 60 * 1000) return 'warning';   // < 8 hours
  return 'healthy';
}
```

### 7.3 Permit Fee Calculation

```javascript
// services/permitFeeService.js
// ASSUMPTION [B-A02]: Fee rules are hardcoded per permit type.
// In production these would be in a DB config table.
const FEE_RULES = {
  construction_permit: (formData) => {
    const base = 5000;
    const sqft = formData.area_sqft || 0;
    return base + Math.floor(sqft / 100) * 500;     // PKR 500 per 100 sqft
  },
  event_permit: (formData) => {
    const crowds = { small: 2000, medium: 5000, large: 10000 };
    return crowds[formData.crowd_size_category] ?? 5000;
  },
  business_license_renewal: () => 3500,              // Flat fee
};

function calculateFee(permitType, formData) {
  const calculator = FEE_RULES[permitType];
  return calculator ? calculator(formData) : 0;
}
```

### 7.4 Permit Certificate Generation

```javascript
// services/certificateService.js (uses pdfkit + qrcode)
async function generatePermitCertificate(application, permitNumber) {
  const qrData = `${process.env.FRONTEND_URL}/verify/${permitNumber}`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 150 });

  const pdfBuffer = await buildPDF({
    permitNumber,
    applicantName: application.applicant.full_name,
    permitType: application.permit_type,
    expiryDate: calculateExpiryDate(application.permit_type),
    qrBuffer,
    departmentSeal: getDepartmentSeal(application.permit_type),
  });

  const cloudinaryResult = await cloudinary.uploader.upload_stream(
    { folder: 'certificates', resource_type: 'raw', public_id: permitNumber }
  );
  // Returns cloudinary URL → stored in permit_certificates.certificate_url
}
```

---

## 8. Business Logic Breakdown

### 8.1 Ticket Status Transition Rules

Valid status transitions are enforced at the controller level, not left to the client.

```
VALID TRANSITIONS:
submitted      → under_review                  (staff, dept_admin, super_admin)
under_review   → assigned                      (dept_admin, super_admin)
assigned       → in_progress                   (staff [if self-assigned], dept_admin, super_admin)
in_progress    → resolved                      (staff, dept_admin, super_admin)
resolved       → closed                        (dept_admin, super_admin)
any_status     → under_review                  (dept_admin, super_admin — escalation/rollback)

INVALID (rejected with 422):
Any backward jump not listed above
Closing a ticket that is not yet resolved (skip resolved)
```

```javascript
// controllers/ticketController.js
const TRANSITION_MAP = {
  submitted:    ['under_review'],
  under_review: ['assigned', 'under_review'],  // dept_admin can re-review
  assigned:     ['in_progress', 'under_review'],
  in_progress:  ['resolved', 'assigned'],
  resolved:     ['closed'],
  closed:       [],
};

function isValidTransition(currentStatus, newStatus, role) {
  const allowed = TRANSITION_MAP[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) return false;
  if (newStatus === 'closed' && !['dept_admin','super_admin'].includes(role)) return false;
  return true;
}

// After a valid transition, push real-time update:
// io.to(`user:${ticket.resident_id}`).emit('ticket:status_updated', {
//   ticket_id: ticket.id, ticket_number: ticket.ticket_number,
//   new_status: newStatus, updated_at: new Date()
// });
// This triggers React Query cache invalidation on the frontend (see Frontend PRD §6.5)
```

### 8.2 SLA Monitoring Cron Job

```javascript
// services/slaService.js
import cron from 'node-cron';

cron.schedule('*/5 * * * *', async () => {
  const now = new Date();
  const warningWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  const breachingTickets = await prisma.tickets.findMany({
    where: {
      status: { notIn: ['resolved', 'closed'] },
      sla_deadline: { lte: warningWindow },
      escalation_sent: false,
    },
    include: { department: true, resident: true },
  });

  for (const ticket of breachingTickets) {
    // Find dept admin(s) for this department
    const admins = await prisma.users.findMany({
      where: { role: 'dept_admin', department_id: ticket.department_id, is_active: true }
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'sla_breach_alert',
        title: 'SLA Breach Imminent',
        message: `Ticket ${ticket.ticket_number} expires in less than 2 hours.`,
        referenceId: ticket.id,
        referenceType: 'ticket',
      });
      await sendEmail({
        to: admin.email,
        subject: `[URGENT] SLA Breach Alert — ${ticket.ticket_number}`,
        template: 'sla_breach_alert',
        data: { ticket, admin },
      });
      // Push via Socket.io to admin's room
      io.to(`user:${admin.id}`).emit('sla:breach_alert', { ticket_number: ticket.ticket_number, sla_deadline: ticket.sla_deadline });
    }

    // Mark escalation sent to prevent duplicate alerts
    await prisma.tickets.update({
      where: { id: ticket.id },
      data: { escalation_sent: true },
    });
  }
});
```

### 8.3 Notification Dispatch Strategy

All notification events follow this flow. Email is always async (fire-and-forget) to prevent API latency.

```javascript
// services/notificationService.js
async function dispatchNotification({ userId, type, title, message, referenceId, referenceType }) {
  // 1. Persist to DB
  const notification = await prisma.notifications.create({
    data: { user_id: userId, type, title, message, reference_id: referenceId, reference_type: referenceType }
  });

  // 2. Real-time push via Socket.io (if user is connected)
  // Frontend useNotificationStore listens for 'notification:new' → incrementUnread + prepend
  io.to(`user:${userId}`).emit('notification:new', {
    id: notification.id,
    type, title, message, referenceId, referenceType,
    created_at: notification.created_at,
  });

  // 3. Update unread badge count (pushed to frontend)
  const unreadCount = await prisma.notifications.count({
    where: { user_id: userId, is_read: false }
  });
  io.to(`user:${userId}`).emit('unread_count', { count: unreadCount });

  return notification;
}
```

### 8.4 Emergency Broadcast

```javascript
// controllers/announcementController.js
async function createAnnouncement(req, res) {
  const { title, body, category, priority, expiry_date, department_id } = req.body;
  const isEmergency = priority === 'emergency';

  const announcement = await prisma.announcements.create({
    data: { author_id: req.user.id, title, body, category, priority, is_emergency: isEmergency,
            expiry_date, department_id: department_id || null }
  });

  if (isEmergency) {
    // Broadcast to ALL connected resident sessions (no room filter)
    // Frontend useUIStore listens for 'announcement:emergency' → showEmergencyBanner()
    io.emit('announcement:emergency', {
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      created_at: announcement.created_at,
    });
  }

  res.status(201).json({ success: true, data: announcement });
}
```

### 8.5 Permit Re-submission Logic

When a permit is rejected, the applicant can re-submit with corrections. The re-submission creates a new `permit_application` record with `resubmission_of` pointing to the original. This preserves the full audit trail.

```javascript
async function resubmitPermit(req, res) {
  const original = await prisma.permit_applications.findUnique({ where: { id: req.params.id } });

  if (original.status !== 'rejected') {
    return res.status(422).json({
      success: false,
      error: { code: 'INVALID_RESUBMISSION', message: 'Only rejected applications can be resubmitted.' }
    });
  }

  const newApplication = await prisma.permit_applications.create({
    data: {
      applicant_id: req.user.id,
      permit_type: original.permit_type,
      form_data: req.body.form_data,  // Updated data from applicant
      status: 'submitted',
      resubmission_of: original.id,
      submitted_at: new Date(),
    }
  });
  // ... dispatch notification, return response
}
```

### 8.6 Event Registration Capacity Enforcement

```javascript
async function registerForEvent(req, res) {
  const event = await prisma.events.findUnique({ where: { id: req.params.id } });
  if (!event || event.is_cancelled) {
    return res.status(404).json({ success: false, error: { code: 'EVENT_NOT_FOUND' } });
  }

  const registrationCount = await prisma.event_registrations.count({
    where: { event_id: req.params.id }
  });

  if (registrationCount >= event.capacity) {
    return res.status(409).json({
      success: false,
      error: { code: 'EVENT_FULL', message: 'This event has reached maximum capacity.' }
    });
  }

  // Check duplicate registration
  const existing = await prisma.event_registrations.findUnique({
    where: { event_id_user_id: { event_id: req.params.id, user_id: req.user.id } }
  });
  if (existing) {
    return res.status(409).json({ success: false, error: { code: 'ALREADY_REGISTERED' } });
  }

  await prisma.event_registrations.create({
    data: { event_id: req.params.id, user_id: req.user.id }
  });

  res.status(201).json({ success: true, data: { message: 'Successfully registered for event.' } });
}
```

---

### 8.7 Backend Zod Validation Schemas

All Zod schemas mirror the frontend validation rules exactly (Frontend PRD §8). This is the single authoritative server-side enforcement layer.

```javascript
// schemas/auth.schema.js
const registerSchema = z.object({
  name:             z.string().min(2).max(80).regex(/^[a-zA-Z\s]+$/),
  email:            z.string().email().transform(s => s.toLowerCase()),
  password:         z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                      'Password must contain uppercase, number, and special character'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match', path: ['confirm_password']
});

// schemas/ticket.schema.js
const createTicketSchema = z.object({
  title:          z.string().min(10).max(150),
  description:    z.string().min(20).max(1000),
  department_id:  z.string().uuid(),
  category:       z.string().min(1).max(100),
  location:       z.string().min(5).max(300),
  priority:       z.enum(['low', 'medium', 'high', 'emergency']),
  attachment_urls: z.array(z.string().url()).max(5).optional(),
});

const statusUpdateSchema = z.object({
  status:      z.enum(['submitted','under_review','assigned','in_progress','resolved','closed']),
  public_note: z.string().max(2000).optional(),
});

const commentSchema = z.object({
  body:        z.string().min(5).max(2000),
  is_internal: z.boolean().default(false),
});

// schemas/permit.schema.js  (form_data is flexible JSONB; top-level fields validated)
const createPermitSchema = z.object({
  permit_type: z.enum(['construction_permit','event_permit','business_license_renewal']),
  form_data:   z.record(z.unknown()).default({}),
});

// schemas/announcement.schema.js
const createAnnouncementSchema = z.object({
  title:         z.string().min(5).max(200),
  body:          z.string().min(20).max(5000),
  category:      z.enum(['health','infrastructure','culture','emergency','general']),
  priority:      z.enum(['normal','urgent','emergency']),
  expiry_date:   z.string().date().optional()
                   .refine(d => !d || new Date(d) > new Date(), 'Expiry date must be in the future'),
  department_id: z.string().uuid().optional(),
});

// schemas/event.schema.js
const createEventSchema = z.object({
  title:         z.string().min(3).max(200),
  description:   z.string().min(10),
  category:      z.enum(['health','infrastructure','culture','emergency','general']),
  event_date:    z.string().datetime().refine(d => new Date(d) > new Date(), 'Event date must be in the future'),
  location:      z.string().min(5),
  capacity:      z.number().int().min(1).max(100000),
  department_id: z.string().uuid().optional(),
});

// schemas/slaConfig.schema.js
const slaConfigSchema = z.object({
  low:       z.number().int().min(24).max(720),
  medium:    z.number().int().min(8).max(168),
  high:      z.number().int().min(2).max(48),
  emergency: z.number().int().min(1).max(4),
});
```

---

## 9. Error Handling Strategy

### 9.1 Error Code Registry

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Zod schema validation failed; `details[]` contains field-level errors |
| `400` | `INVALID_STATUS_TRANSITION` | Requested ticket status jump is not permitted |
| `400` | `OTP_INVALID` | OTP code does not match or has expired |
| `400` | `WEAK_PASSWORD` | Password does not meet complexity requirements |
| `401` | `UNAUTHORIZED` | No token provided or token is invalid |
| `401` | `TOKEN_EXPIRED` | Access token has expired; client should refresh |
| `401` | `INVALID_CREDENTIALS` | Email/password combination is incorrect |
| `401` | `OTP_NOT_VERIFIED` | Account email not yet verified |
| `401` | `2FA_REQUIRED` | Credentials valid but TOTP code required |
| `403` | `FORBIDDEN` | Authenticated but role is not permitted for this action |
| `403` | `IP_RESTRICTED` | Super Admin login from non-whitelisted IP |
| `403` | `ACCOUNT_DEACTIVATED` | User account has been disabled by admin |
| `404` | `TICKET_NOT_FOUND` | Ticket ID does not exist or is out of scope |
| `404` | `PERMIT_NOT_FOUND` | Permit application not found |
| `404` | `USER_NOT_FOUND` | User ID does not exist |
| `404` | `EVENT_NOT_FOUND` | Event not found or cancelled |
| `409` | `EMAIL_ALREADY_EXISTS` | Registration email already in use |
| `409` | `ALREADY_REGISTERED` | Resident already registered for this event |
| `409` | `EVENT_FULL` | Event has reached capacity |
| `413` | `FILE_TOO_LARGE` | Uploaded file exceeds 10 MB limit |
| `415` | `UNSUPPORTED_FILE_TYPE` | MIME type not in allowed list |
| `422` | `INVALID_RESUBMISSION` | Permit re-submission on non-rejected application |
| `422` | `MAX_ATTACHMENTS_EXCEEDED` | More than 5 files submitted on a single ticket |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests on auth endpoint |
| `500` | `INTERNAL_SERVER_ERROR` | Unhandled server error (generic; never exposes stack trace) |
| `503` | `SERVICE_UNAVAILABLE` | External service (Cloudinary, email) temporarily unreachable |

### 9.2 Global Error Handler

```javascript
// middleware/errorHandler.js
function globalErrorHandler(err, req, res, next) {
  // Log full error internally (never expose to client)
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.path,
    method: req.method,
    userId: req.user?.id,
    requestId: req.id,
  });

  // Prisma known error handling
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'A record with these details already exists.' }
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }
    });
  }

  // Multer file errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'File exceeds the 10 MB limit.' }
    });
  }

  // Default — never expose internal details
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.errorCode || 'INTERNAL_SERVER_ERROR',
      message: err.isOperational ? err.message : 'An unexpected error occurred. Please try again.'
    }
  });
}
```

### 9.3 Async Error Wrapper

All route handlers are wrapped to avoid unhandled promise rejections crashing the server.

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Usage in router
router.post('/tickets', authenticate, authorize(['resident']), asyncHandler(ticketController.create));
```

---

## 10. Logging & Monitoring

### 10.1 Logging Strategy

**Tool:** `pino` (structured JSON logging — fast, compatible with Render/Railway log drains)

| Log Level | When Used |
|---|---|
| `info` | Request received, successful DB operations, email sent, WebSocket events emitted |
| `warn` | Auth failures (wrong password, expired OTP), rate limit approaching, soft errors |
| `error` | Unhandled exceptions, DB connection failures, Cloudinary errors, email delivery failures |
| `debug` | Query parameters, response times (development only — disabled in production) |

**Log Format:**
```json
{
  "level": "info",
  "time": "2026-05-13T09:00:00.000Z",
  "requestId": "req-uuid",
  "method": "POST",
  "path": "/api/v1/tickets",
  "statusCode": 201,
  "responseTimeMs": 143,
  "userId": "user-uuid",
  "role": "resident"
}
```

### 10.2 Request ID Middleware

Every request is tagged with a unique UUID for end-to-end tracing across logs.

```javascript
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

### 10.3 Audit Log Events (Super Admin)

The following Super Admin actions are written to the `audit_logs` table:

| Action Code | Trigger |
|---|---|
| `USER_CREATED` | Super Admin creates staff or admin account |
| `USER_DEACTIVATED` | Account set to inactive |
| `USER_ROLE_CHANGED` | Role or department assignment updated |
| `DEPT_SLA_UPDATED` | SLA configuration changed for a department |
| `EMERGENCY_BROADCAST_SENT` | Emergency announcement published |
| `SYSTEM_REPORT_EXPORTED` | CSV/PDF report downloaded |
| `SUPER_ADMIN_LOGIN` | Successful Super Admin login |
| `SUPER_ADMIN_LOGIN_FAILED` | Failed login attempt (captured before auth succeeds) |
| `LOGIN_BLOCKED_IP` | Login rejected due to IP restriction |

### 10.4 Health Check Endpoint

```
GET /health

Response 200:
{
  "status": "ok",
  "timestamp": "2026-05-13T09:00:00Z",
  "db": "connected",
  "uptime_seconds": 3600
}
```

---

## 11. Security Design

### 11.1 Transport Security

- HTTPS enforced by deployment platform (Render/Railway); all HTTP redirects to HTTPS
- `Strict-Transport-Security` header set by Helmet.js
- Cookies: `httpOnly`, `Secure`, `SameSite=Strict`

### 11.2 Helmet.js Configuration

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
      connectSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,  // Required for Cloudinary image loads
}));
```

### 11.3 CORS Policy

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],  // e.g. 'https://civicconnect.vercel.app'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,           // Required for httpOnly cookie (refresh token)
  maxAge: 86400,               // Preflight cache for 24 hours
};
app.use(cors(corsOptions));
```

### 11.4 Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,
  standardHeaders: true,       // Sends RateLimit-* headers (RFC 6585); frontend reads Retry-After
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 15 minutes.' } },
  keyGenerator: (req) => req.ip,
});

const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3 });

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/resend-otp', otpLimiter);
app.use('/api/v1/auth/forgot-password', otpLimiter);
```

### 11.5 Input Sanitization

```javascript
// middleware/sanitize.js
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = JSON.parse(JSON.stringify(req.body), (key, value) =>
      typeof value === 'string' ? DOMPurify.sanitize(value.trim()) : value
    );
  }
  next();
}
```

All DB writes use **Prisma ORM parameterized queries exclusively** — raw SQL is used only for the ticket sequence counter under controlled conditions.

### 11.6 File Upload Security

```javascript
// middleware/upload.js (multer configuration)
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf'
];

const upload = multer({
  storage: multer.memoryStorage(),    // Buffer in memory; pass to Cloudinary
  limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB hard limit
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_FILE_TYPE'), false);
    }
    cb(null, true);
  },
});
```

> **Note:** MIME type is validated from the parsed file buffer header, not from the client-supplied `Content-Type`, to prevent MIME sniffing attacks.

### 11.7 Environment Variable Validation at Startup

```javascript
// config/validateEnv.js
const REQUIRED_ENV_VARS = [
  'DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS',
  'FRONTEND_URL', 'ALLOWED_ORIGINS', 'SUPER_ADMIN_ALLOWED_IPS',
];

REQUIRED_ENV_VARS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);   // Refuse to start with missing config
  }
});
```

---

## 12. Scalability & Performance Strategy

### 12.1 Database Performance

| Optimization | Detail |
|---|---|
| **Indexed columns** | All FK columns, `status`, `created_at DESC`, `sla_deadline` (partial), `email` — see schema above |
| **Partial index on SLA cron** | `WHERE status NOT IN ('resolved', 'closed')` dramatically reduces rows scanned per cron cycle |
| **JSONB for permit form_data** | Variable permit fields stored as JSONB avoid schema migrations per permit type addition |
| **Prisma connection pooling** | Prisma's built-in pool manages connections efficiently for serverless (Neon) environments |
| **Read-optimized analytics queries** | Analytics endpoints use aggregate SQL directly (`COUNT`, `AVG`, `GROUP BY`) rather than loading full records into memory |
| **Pagination on all list endpoints** | Default `limit=20`, max `limit=100`; cursor-based pagination available for high-volume tables |

### 12.2 API Performance

| Optimization | Detail |
|---|---|
| **Async email dispatch** | `emailService.send()` is non-blocking — response returns before email is sent |
| **Stateless architecture** | No server-side sessions; backend can scale horizontally behind a load balancer with zero coordination |
| **Targeted SELECT** | Prisma `select: {}` clauses limit returned fields — never `SELECT *` in list queries |
| **Compression** | `compression` middleware applied to all JSON responses |
| **Response caching** | Analytics endpoints that are computationally expensive can add a 60-second in-memory cache (simple `node-cache`) without Redis |

### 12.3 WebSocket Scalability

- Socket.io rooms named `user:{userId}` for targeted delivery
- Emergency broadcasts use `io.emit()` (all connected clients)
- Department events use `io.to('dept:{departmentId}').emit()` for dept-scoped pushes
- **ASSUMPTION [B-A03]:** In the competition environment, a single Socket.io instance is sufficient. For production scale, Socket.io Redis adapter would enable multi-process coordination.

### 12.4 File Storage

- All files are uploaded to Cloudinary immediately (not stored on disk)
- Cloudinary CDN handles delivery, resizing, and global distribution
- Permit documents are served via Cloudinary signed URLs (expiry: 1 hour) to prevent unauthorized access

### 12.5 Target Performance Benchmarks

| Metric | Target |
|---|---|
| Standard CRUD endpoint (GET/POST ticket) | < 200ms p95 |
| Analytics summary query | < 500ms p95 |
| File upload (10 MB) | < 5 seconds |
| WebSocket event delivery | < 100ms after server emit |
| SLA cron cycle (full execution) | < 3 seconds |

---

## 13. Suggested Tech Stack

### 13.1 Core Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Widely supported, excellent async I/O, massive ecosystem |
| **Framework** | Express.js 4.x | Minimal, flexible, well-understood; fastest to scaffold in a 6-hour sprint |
| **ORM** | Prisma 5.x | Type-safe queries, auto-generated client, excellent PostgreSQL support, migrations built-in |
| **Database** | PostgreSQL 16 (Neon) | Relational integrity for complex joins; JSONB for flexible permit data; Neon is serverless-compatible |
| **Real-time** | Socket.io 4.x | Reliable WebSocket library with room support, auto-fallback to long polling |
| **Validation** | Zod 3.x | TypeScript-first schema validation; shares type contracts with frontend |
| **Authentication** | jsonwebtoken + bcrypt | Industry standard; bcrypt cost factor 12 |
| **2FA** | speakeasy + qrcode | TOTP generation + QR code for Authenticator apps |
| **File Upload** | multer + cloudinary-node | Streaming upload to Cloudinary; no disk writes |
| **PDF Generation** | pdfkit | Lightweight PDF generation for certificates and receipts |
| **QR Code** | qrcode | QR code buffer generation for embedding in PDFs |
| **Email** | nodemailer | SMTP-based email; sandbox-compatible |
| **Cron** | node-cron | Lightweight in-process scheduler for SLA monitoring |
| **Logging** | pino + pino-http | Structured JSON logs; low overhead |
| **Security** | helmet + cors + express-rate-limit | Security headers, CORS policy, rate limiting |
| **Sanitization** | DOMPurify (JSDOM) | XSS-safe string sanitization on all inputs |
| **Testing** | Jest + Supertest | Unit and integration tests for controllers and middleware |

### 13.2 DevDependencies

| Tool | Purpose |
|---|---|
| TypeScript (optional) | Type safety; Prisma types make this highly valuable |
| ESLint + Prettier | Code quality and consistency |
| Nodemon | Development auto-restart |
| dotenv | Environment variable loading |
| cross-env | Cross-platform env variable setting |

### 13.3 Package.json Scripts

```json
{
  "scripts": {
    "dev":        "nodemon src/index.js",
    "start":      "node src/index.js",
    "migrate":    "prisma migrate deploy",
    "migrate:dev":"prisma migrate dev",
    "seed":       "node prisma/seed.js",
    "db:reset":   "prisma migrate reset --force && node prisma/seed.js",
    "lint":       "eslint src/",
    "test":       "jest --runInBand"
  }
}
```

---

## 14. Environment Variables

```bash
# .env.example (backend)
# ─── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=production                         # 'development' | 'production' | 'test'
FRONTEND_URL=https://civicconnect.vercel.app
ALLOWED_ORIGINS=https://civicconnect.vercel.app

# ─── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/civicconnect?sslmode=require

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=your-access-token-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d

# ─── Authentication ───────────────────────────────────────
BCRYPT_ROUNDS=12
TOTP_ISSUER=CivicConnect

# ─── Super Admin IP Whitelist ─────────────────────────────
SUPER_ADMIN_ALLOWED_IPS=127.0.0.1,::1        # Comma-separated; add your IP

# ─── Cloudinary ───────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Email (SMTP) ─────────────────────────────────────────
SMTP_HOST=sandbox.smtp.mailtrap.io           # Use Mailtrap for development
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM_NAME=CivicConnect
SMTP_FROM_EMAIL=noreply@civicconnect.city

# ─── AI (Bonus Feature) ───────────────────────────────────
OPENAI_API_KEY=your_openai_api_key           # Or ANTHROPIC_API_KEY for Claude

# ─── Rate Limiting ────────────────────────────────────────
AUTH_RATE_LIMIT_WINDOW_MS=900000             # 15 minutes
AUTH_RATE_LIMIT_MAX=5
```

---

## 15. Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma               # Prisma data model (mirrors SQL schema above)
│   ├── migrations/                 # Chronological migration files
│   │   ├── 20260513000001_init_schema/
│   │   └── 20260513000002_seed_departments/
│   └── seed.js                     # Seeds: departments, roles, sample users, tickets
├── src/
│   ├── index.js                    # Entry point: app init, server start, Socket.io attach
│   ├── app.js                      # Express app setup: middleware stack, router mounting
│   ├── config/
│   │   ├── validateEnv.js          # Required env var check at startup
│   │   ├── corsOptions.js          # CORS configuration
│   │   ├── jwtConfig.js            # JWT sign/verify helpers
│   │   ├── cloudinary.js           # Cloudinary SDK initialization
│   │   └── email.js                # Nodemailer transporter
│   ├── routes/
│   │   ├── index.js                # Mounts all routers under /api/v1
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── tickets.routes.js
│   │   ├── permits.routes.js
│   │   ├── announcements.routes.js
│   │   ├── events.routes.js
│   │   ├── notifications.routes.js
│   │   ├── analytics.routes.js
│   │   ├── departments.routes.js
│   │   └── audit.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── tickets.controller.js
│   │   ├── permits.controller.js
│   │   ├── announcements.controller.js
│   │   ├── events.controller.js
│   │   ├── notifications.controller.js
│   │   ├── analytics.controller.js
│   │   └── departments.controller.js
│   ├── middleware/
│   │   ├── authenticate.js         # JWT verification → req.user
│   │   ├── authorize.js            # RBAC role check
│   │   ├── departmentScope.js      # Enforces dept_admin same-dept constraint
│   │   ├── ipRestrict.js           # Super admin IP whitelist check
│   │   ├── sanitize.js             # DOMPurify input sanitization
│   │   ├── upload.js               # Multer config for file uploads
│   │   ├── rateLimiter.js          # Auth endpoint rate limits
│   │   ├── requestId.js            # UUID injection on each request
│   │   └── errorHandler.js         # Global async error handler
│   ├── services/
│   │   ├── emailService.js         # Nodemailer wrapper with HTML templates
│   │   ├── notificationService.js  # DB write + Socket.io push
│   │   ├── slaService.js           # Cron job + SLA deadline calculation
│   │   ├── certificateService.js   # PDF generation + Cloudinary upload
│   │   ├── pdfReportService.js     # Analytics PDF export
│   │   ├── csvExportService.js     # Analytics CSV stream export
│   │   └── aiCategorizationService.js  # BONUS: LLM API call for ticket categorization
│   ├── utils/
│   │   ├── asyncHandler.js         # try/catch wrapper for controllers
│   │   ├── generateTicketId.js     # Sequential ticket ID generation
│   │   ├── generatePermitNumber.js # Sequential permit number generation
│   │   ├── slaUtils.js             # Deadline calc, getSlaStatus
│   │   ├── permitFeeService.js     # Fee calculation per permit type
│   │   ├── hashUtils.js            # bcrypt helpers
│   │   └── logger.js               # Pino logger instance
│   ├── schemas/                    # Zod validation schemas (one per route group)
│   │   ├── auth.schema.js
│   │   ├── ticket.schema.js
│   │   ├── permit.schema.js
│   │   ├── announcement.schema.js
│   │   └── event.schema.js
│   ├── sockets/
│   │   └── index.js                # Socket.io event registration + room management
│   └── templates/
│       └── email/                  # HTML email templates
│           ├── otp-verification.html
│           ├── ticket-status-update.html
│           ├── permit-status-update.html
│           ├── sla-breach-alert.html
│           └── permit-approval.html
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── package.json
└── README.md
```

---

## 16. Assumptions

> All assumptions are clearly labeled. Backend decisions derived from ambiguities in the Master Documentation or Frontend PRD are noted here for transparency during judge review.

| ID | Assumption | Rationale |
|---|---|---|
| B-A01 | File uploads are a two-step process: `POST /tickets/upload` returns a Cloudinary URL, which is included in the subsequent `POST /tickets` JSON body as `attachment_urls[]` | Avoids multipart form parsing complexity in the ticket creation handler; aligns with how the Frontend PRD's `AttachmentGallery` and `TicketForm` are structured |
| B-A02 | Permit fee rules are hardcoded in `permitFeeService.js` as named functions per permit type | Master Doc states "fee calculation is real but no payment gateway required." Hardcoded rules are the simplest production-accurate implementation within a 6-hour window |
| B-A03 | Socket.io runs in the same Node.js process as the REST API without a Redis adapter | Competition environment involves a handful of judges, not 500,000 concurrent users. A single process is architecturally sound for demo scale; Redis adapter is the documented upgrade path |
| B-A04 | `staff` accounts cannot self-register — they are created by `dept_admin` or `super_admin` via `POST /users/staff` | Master Doc states "Staff ID + Password" login. The creation flow is admin-initiated, matching the real-world city employment model |
| B-A05 | Department codes are exactly 3 uppercase characters (`INF`, `PER`, `SAF`) and are set at department creation. New departments created by Super Admin must also provide a unique 3-char code | Required for ticket ID generation (`{CODE}-{YEAR}-{SEQ}`) to be consistent |
| B-A06 | `totp_secret` in the `users` table is stored encrypted using AES-256 via Node.js `crypto` module, with the encryption key in `JWT_SECRET`. A production system would use a dedicated secrets vault | Ensures 2FA secrets are not stored in plaintext, while avoiding infrastructure complexity beyond the 6-hour scope |
| B-A07 | The AI categorization endpoint (`/api/v1/tickets/categorize`) is a standalone bonus endpoint; it is not called automatically during `POST /tickets`. The frontend displays AI suggestions, and the user accepts or overrides before submitting | Prevents mandatory dependency on an external LLM API for the core ticket submission flow. Core functionality remains fully offline-capable |
| B-A08 | Announcements and events created without a `department_id` are city-wide and visible to all residents. Those created with a `department_id` are scoped to that department's feed | Logically derived from "Dept Admin and Super Admin can publish city-wide announcements" in FR-ANN-01 |
| B-A09 | The `GET /health` endpoint is unauthenticated and is monitored by the deployment platform (Render/Railway) for uptime checks | Standard operational practice; allows the platform to restart the process if health check fails |
| B-A10 | The public permit verification endpoint `GET /permits/verify/:permitNumber` requires no authentication and returns only non-sensitive fields: permit type, status (valid/expired), expiry date, and applicant name | Matches the QR code use case — a city official scans the QR and should see permit validity without needing an account |

---

## Appendix A — Seed Data Summary

The `prisma/seed.js` file must produce the following minimum dataset for a reproducible judge demo:

| Entity | Count | Details |
|---|---|---|
| Departments | 3 | Infrastructure (INF), Permits & Licensing (PER), Public Safety (SAF) |
| Super Admin | 1 | `superadmin@civicconnect.city` / `SuperAdmin@2026` |
| Dept Admin | 3 | One per department; 2FA pre-configured with known TOTP secret in seed logs |
| Staff | 6 | Two per department |
| Residents | 10 | Mix of OTP-verified accounts |
| Tickets | 20 | Distribution across all departments, priorities, and statuses (including some SLA-approaching) |
| Permit Applications | 6 | One of each type in various stages including one approved with certificate |
| Announcements | 4 | Mix of normal, urgent, and one past emergency |
| Events | 3 | One upcoming, one full (at capacity), one past |

---

## Appendix B — WebSocket Event Reference

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `notification:new` | Server → Client | `{ id, type, title, message, referenceId, referenceType, created_at }` | New in-app notification (aligns with `useNotificationStore.incrementUnread`) |
| `unread_count` | Server → Client | `{ count: number }` | Updated unread notification badge count |
| `ticket:status_updated` | Server → Client | `{ ticket_id, ticket_number, new_status, updated_at }` | Ticket status changed (triggers React Query cache invalidation on frontend) |
| `sla:breach_alert` | Server → Dept Admin | `{ ticket_number, sla_deadline }` | SLA approaching — triggers persistent toast on admin dashboard |
| `announcement:emergency` | Server → All Residents | `{ id, title, body, created_at }` | Emergency announcement — triggers `showEmergencyBanner()` in `useUIStore` |
| `join_room` | Client → Server | `{ room: 'user:{userId}' }` | Client requests to join personal notification room on socket connect |

---

*Document prepared for AUREX AI 2026 — Web Development Track*
*Bahria University, BSEAS | 13 May 2026*
*Classification: Team Internal — Competition Use Only*
*Derived from: CivicConnect Master Documentation v1.0 + Frontend PRD v1.0*
