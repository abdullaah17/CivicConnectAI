# CivicConnect

**Smart City Resident Services Portal** — AUREX AI 2026 | Web Development Track | Bahria University, BSEAS

CivicConnect is a multi-role, full-stack web platform that digitalizes and streamlines citizen–government interaction. It replaces fragmented email chains and spreadsheet-based civic management with a unified, real-time portal serving residents, department staff, department administrators, and a super administrator.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## Features

### Module A — Civic Request Management (CRMS)
- Submit structured civic requests across 3 departments (Infrastructure, Permits & Licensing, Public Safety)
- Auto-generated ticket IDs (e.g. `INF-2026-00047`)
- 6-stage real-time status pipeline: `Submitted → Under Review → Assigned → In Progress → Resolved → Closed`
- File/image attachments (up to 5 files per request)
- In-app + email notifications at every status transition
- SLA timers with color-coded urgency and automated escalation alerts

### Module B — Permit & Application Portal
- Three permit types: Construction Permit, Event Permit, Business License Renewal
- Multi-step form wizard with 30-second auto-save drafts
- Document upload (PDF/images, max 10 MB per file)
- Review workflow with mandatory rejection reasons and re-submission capability
- Digital approval certificates (PDF with permit number, QR code, expiry date)
- Payment stub simulation with fee calculation and receipt generation

### Module C — City Announcements & Events
- Announcements with priority flags (Normal / Urgent / Emergency)
- Emergency broadcast: full-screen dismissible alert banner via WebSocket
- Public event listings with category filters and capacity-enforced registration
- Unread badge tracking per resident

### Module D — Analytics & Reporting
- Real-time charts: tickets by status, average resolution time, SLA breach rate
- Geographic heatmap of complaint distribution (Leaflet.js)
- Permit pipeline funnel chart
- Top 5 most reported issues by category and location
- Date range filters and department-level drill-down
- CSV and PDF export for all data tables and charts

### Bonus Features
- **Dark Mode** — full dark token set with persistent preference
- **AI Request Categorization** — suggests department + category from description text
- **Map Integration** — interactive Leaflet.js location picker on ticket submission + complaint heatmap on analytics
- **PDF Export** — full dashboard capture to multi-page A4 PDF via jsPDF + html2canvas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI primitives |
| Server State | TanStack React Query v5 |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Maps | Leaflet.js + React Leaflet |
| Real-time | Socket.io client |
| HTTP Client | Axios |
| PDF Generation | jsPDF + html2canvas |
| QR Codes | qrcode |
| Animations | Framer Motion |
| Date Utilities | date-fns |

---

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── (public)/          # Landing, login, register, OTP, forgot password, permit verify
│       ├── (resident)/        # Dashboard, requests, permits, announcements, events, profile
│       ├── (staff)/           # Staff dashboard, ticket queue, ticket detail
│       ├── (admin)/           # Admin dashboard, tickets, permits, staff, analytics, SLA config
│       └── (superadmin)/      # System overview, departments, users, analytics, audit, broadcast
```

Each route group has its own layout with role-appropriate navigation and sidebar.

---

## User Roles

| Role | Access | Auth Method |
|---|---|---|
| **Resident** | Submit requests, track tickets, apply for permits, view events | Email + Password + OTP verification |
| **Staff** | View and process assigned department tickets | Staff ID + Password |
| **Department Admin** | Manage staff, review permits, configure SLAs, view analytics | Credentials + mandatory 2FA (TOTP) |
| **Super Admin** | Full system access, audit logs, emergency broadcasts | Credentials + IP restriction + audit logging |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or a compatible package manager

### Installation

```bash
cd frontend
npm install
```

### Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) for details.

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file uploads | `your_cloud_name` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token (used for map features) | `your_mapbox_token` |

All variables are prefixed with `NEXT_PUBLIC_` and are safe to expose to the browser. No secrets are stored in the frontend environment.

---

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Deployment

### Live URLs

- **Frontend**: [Deployed on Vercel](https://civicconnect-frontend.vercel.app) (or your deployment URL)
- **Backend API**: https://civicconnectai-ze4s.onrender.com/api/v1
- **API Documentation**: https://civicconnectai-ze4s.onrender.com/api/docs

### Frontend Deployment (Vercel)

The frontend is deployed on **Vercel**. The project includes a `.vercel/project.json` for automatic project linking.

To deploy manually:

```bash
npm run build
```

Then push to your connected Vercel project or run `vercel --prod`.

### Environment Configuration

Update the following environment variables in your Vercel deployment settings:

```
NEXT_PUBLIC_API_BASE_URL=https://civicconnectai-ze4s.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://civicconnectai-ze4s.onrender.com
```

### Backend Deployment

The backend is deployed on **Render** with:
- PostgreSQL database on Neon
- Cloudinary for file storage
- SendGrid for email notifications
- Socket.io for real-time updates

---

## Testing & Quality Assurance

### Build Status
- ✅ Production build: 0 errors, 34 routes
- ✅ First Load JS: 190 kB (under 200 kB target)
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors

### Accessibility
- ✅ WCAG 2.1 Level AA compliant
- ✅ Lighthouse Accessibility Score: 91.4/100 average
- ✅ Keyboard navigation fully functional
- ✅ Screen reader compatible

### Documentation
- **E2E Testing Guide**: `E2E_TESTING_GUIDE.md` — Comprehensive manual testing procedures
- **Accessibility Audit**: `ACCESSIBILITY_AUDIT.md` — WCAG 2.1 compliance report
- **Implementation Status**: `IMPLEMENTATION_STATUS.md` — Detailed project status
- **Demo Script**: `DEMO_SCRIPT.md` — Step-by-step demo guide for judges

---

## Test Credentials

Use these credentials to test different user roles:

```
Resident:
  Email: resident@test.com
  Password: Test@1234

Staff Member:
  Email: staff@test.com
  Password: Test@1234

Department Admin:
  Email: admin@test.com
  Password: Test@1234

SuperAdmin:
  Email: superadmin@test.com
  Password: Test@1234
```

---

## Architecture Overview

```
Client (Vercel CDN)
    │ HTTPS / REST / WebSocket
    ▼
Backend API — Node.js + Express  /api/v1/*
    │
    ├── PostgreSQL (Neon)
    ├── Cloudinary (file storage)
    ├── Email Service (SendGrid)
    ├── Socket.io (real-time events)
    └── SLA Cron Job (node-cron, every 5 min)
```

---

## Key Metrics

### Performance
- First Load JS: 190 kB
- Build Time: < 2 minutes
- Routes: 34 pre-rendered
- Lighthouse Accessibility: 91.4/100

### Code Quality
- TypeScript Errors: 0
- ESLint Errors: 0
- WCAG 2.1 Level AA: ✅ Compliant
- Test Coverage: Comprehensive E2E guide

### Features
- Core Modules: 4 (CRMS, Permits, Announcements, Analytics)
- Bonus Features: 4 (Dark Mode, AI Categorization, Maps, PDF Export)
- Components: 40+
- Custom Hooks: 8
- Zustand Stores: 4
- Routes: 34 across 5 layouts

---

## Support & Documentation

For detailed information, see:
- **Master Documentation**: `CivicConnect_Master_Documentation.md`
- **Backend PRD**: `CivicConnect_Backend_PRD.md`
- **Frontend PRD**: `CivicConnect_Frontend_PRD.md`
- **Demo Script**: `DEMO_SCRIPT.md`

---

*Built for AUREX AI 2026 — Bahria University, BSEAS*
