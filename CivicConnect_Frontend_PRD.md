# CivicConnect — Frontend Product Requirements Document
### AUREX AI 2026 | Web Development Track | Bahria University, BSEAS

---

> **Document Type:** Phase 2 — Frontend PRD
> **Derived From:** CivicConnect Master Documentation v1.0
> **Version:** 1.0
> **Date:** 13 May 2026
> **Audience:** Frontend Engineering Team
> **Status:** Ready for Implementation

---

## Table of Contents

1. [UI/UX Goals](#1-uiux-goals)
2. [User Personas](#2-user-personas)
3. [User Journeys](#3-user-journeys)
4. [Pages & Screens List](#4-pages--screens-list)
5. [Component Breakdown](#5-component-breakdown)
6. [State Management Strategy](#6-state-management-strategy)
7. [API Integration Points](#7-api-integration-points)
8. [Validation Rules](#8-validation-rules)
9. [Error Handling](#9-error-handling)
10. [Responsive Design Requirements](#10-responsive-design-requirements)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Frontend Tech Stack Recommendation](#12-frontend-tech-stack-recommendation)
13. [Design System & Tokens](#13-design-system--tokens)
14. [Assumptions](#14-assumptions)

---

## 1. UI/UX Goals

### 1.1 Primary UX Principles

| Principle | Description | Measurable Target |
|---|---|---|
| **Clarity** | Every user — from a first-time resident to a Super Admin — must understand what to do next without instruction | 0 onboarding tooltips required for core flows |
| **Speed** | Users complete high-frequency tasks (submit request, check ticket status) in under 60 seconds | Core form submission ≤ 3 clicks after login |
| **Trust** | The platform looks and behaves like official government software — reliable, accessible, non-frivolous | Lighthouse accessibility ≥ 90 on Resident Dashboard |
| **Feedback** | Every action gets an immediate, unambiguous response — success, loading, or error | No silent failures; every API call has a visible state |
| **Role Isolation** | Each user role sees only what is relevant to them — no information leakage, no cognitive overload | Zero cross-role UI elements visible without authorization |

### 1.2 Design Language

**Aesthetic Direction: Civic Authority — Clean Governance**

CivicConnect is official software for a city government. The design should feel:
- **Authoritative but approachable** — not cold bureaucracy, not playful startup
- **Information-dense but legible** — admin dashboards need data density; resident views need breathing room
- **Systematically consistent** — every color, spacing unit, and typography choice is derived from a defined token system

**Visual Identity:**
- **Primary Color:** Deep Civic Blue (`#1B3A6B`) — authority, trust, government
- **Accent Color:** Action Amber (`#F59E0B`) — SLA urgency, CTAs, warnings
- **Success Green:** (`#16A34A`) — resolved states, approvals
- **Danger Red:** (`#DC2626`) — SLA breach, rejections, emergency
- **Surface:** Off-White (`#F8FAFC`) — primary background, non-harsh on long sessions
- **Typography:** `DM Sans` (headings) + `IBM Plex Sans` (body/data) — professional, readable, slightly technical
- **Border Radius:** 8px base, 12px cards, 4px inputs — refined, not childish
- **Shadow System:** Subtle elevation; cards use `0 1px 3px rgba(0,0,0,0.08)` — avoids floating-element excess

### 1.3 UX Anti-Patterns to Avoid

- No modal-on-modal stacking
- No inline page refresh for status updates (use optimistic UI + WebSocket sync)
- No generic "Something went wrong" errors — every error message is actionable
- No pagination where infinite scroll or load-more is more natural (notifications, comments)
- No full-page loaders — skeleton screens only
- No form that loses data on navigation — auto-save drafts for all multi-step flows

---

## 2. User Personas

### Persona 1 — Resident "Ayesha" 🏠
| Attribute | Detail |
|---|---|
| **Name** | Ayesha Tariq |
| **Age** | 34 |
| **Role** | Resident / Citizen |
| **Tech Comfort** | Moderate — uses WhatsApp, online banking, rarely uses government websites |
| **Primary Device** | Mobile (Android, mid-range) |
| **Goal** | Submit a complaint about a broken street light and know when it will be fixed |
| **Frustration** | Has emailed the city before and received no response for weeks |
| **Key Need** | Simplicity, confirmation that her request was received, real-time status updates |
| **Critical Screens** | Register, Submit Request, My Tickets, Ticket Detail, Event Board |

### Persona 2 — Department Staff "Khalid" 🔧
| Attribute | Detail |
|---|---|
| **Name** | Khalid Mahmood |
| **Age** | 41 |
| **Role** | Department Staff — Infrastructure |
| **Tech Comfort** | Low-moderate — uses desktop computer at work, prefers simple interfaces |
| **Primary Device** | Desktop (Windows, Chrome) |
| **Goal** | See his assigned tickets for the day, update statuses, add notes efficiently |
| **Frustration** | Currently updates spreadsheets manually and sends emails to residents one by one |
| **Key Need** | Quick status updates, efficient ticket list view, clear assignment visibility |
| **Critical Screens** | Staff Dashboard, Ticket Queue, Ticket Detail (staff view) |

### Persona 3 — Department Admin "Dr. Sara" 📊
| Attribute | Detail |
|---|---|
| **Name** | Dr. Sara Iqbal |
| **Age** | 47 |
| **Role** | Department Admin — Permits & Licensing |
| **Tech Comfort** | High — comfortable with data tools, Excel, government software |
| **Primary Device** | Desktop (Mac, Chrome/Safari) |
| **Goal** | Monitor department performance, manage SLA compliance, publish city notices |
| **Frustration** | Has no visibility into bottlenecks until a resident complaint escalates |
| **Key Need** | Analytics at a glance, ability to reassign and escalate, announcement publishing |
| **Critical Screens** | Admin Dashboard, Analytics, Staff Management, Announcement Creator |

### Persona 4 — Super Admin "Commissioner Raza" 🏛️
| Attribute | Detail |
|---|---|
| **Name** | Commissioner Raza Ahmed |
| **Age** | 55 |
| **Role** | Super Admin |
| **Tech Comfort** | Moderate — delegates technical tasks but reviews reports personally |
| **Primary Device** | Desktop, occasionally tablet |
| **Goal** | System-wide visibility, generate reports for city council, publish emergency broadcasts |
| **Frustration** | Currently relies on department heads emailing him summary spreadsheets |
| **Key Need** | High-level KPIs, drill-down capability, report export, emergency controls |
| **Critical Screens** | Super Admin Overview, System Reports, Department Config, Emergency Broadcast |

---

## 3. User Journeys

### Journey 1 — Resident: Register → Submit Request → Track Status

```
TRIGGER: Ayesha notices a broken street light outside her home.

STEP 1: Discovery / Landing
  → Visits civicconnect.city (or deployed URL)
  → Sees public landing page with "Report an Issue" CTA
  → Clicks "Get Started" → Register page

STEP 2: Registration
  → Fills: Full Name, Email, Password, Confirm Password
  → Uploads profile photo (optional, skippable)
  → Submits → OTP sent to email
  → Enters 6-digit OTP → Account verified
  → Redirected to Resident Dashboard

STEP 3: Submit Civic Request
  → Clicks "Report an Issue" (prominent CTA on dashboard)
  → Selects Department: Infrastructure
  → Fills: Title ("Broken street light on Canal Road")
  → Fills: Description (free text)
  → Selects: Category → Street Lighting
  → Enters: Location (text: "Canal Road, near Sector F-7")
    [BONUS: pins location on Leaflet.js map]
  → Sets: Priority → Medium
  → Uploads: 1 photo of the broken light
  → Clicks "Submit Request"
  → SUCCESS: Toast notification + Ticket card appears
    "Your request INF-2026-00047 has been submitted!"

STEP 4: Email Confirmation
  → Receives email: "Request Received — INF-2026-00047"
  → Email contains ticket summary and current status link

STEP 5: Status Tracking
  → Returns next day → Logs in → My Tickets
  → Sees ticket status changed to "Under Review" (amber badge)
  → Receives in-app notification badge on bell icon
  → Clicks notification → Ticket Detail page
  → Reads staff public note: "Assigned to maintenance team. Expected resolution: 48 hours."

STEP 6: Resolution
  → 2 days later → Notification: "Your ticket INF-2026-00047 has been Resolved"
  → Ticket Detail shows status: Resolved (green)
  → Full status history timeline visible
  → Optional: Ayesha leaves a follow-up comment "Thank you! Fixed."

OUTCOME: Ayesha feels heard, informed, and satisfied. Trust in city services improved.
```

---

### Journey 2 — Staff: Log In → Process Assigned Ticket

```
TRIGGER: Khalid starts his shift and opens CivicConnect on his desktop.

STEP 1: Login
  → Enters Staff ID + Password
  → Redirected to Staff Dashboard (different layout from Resident)

STEP 2: Ticket Queue
  → Sees list of tickets assigned to Infrastructure dept
  → Sorted by: SLA urgency (red > amber > green)
  → Scans ticket: INF-2026-00047 — Priority: Medium, SLA: 18 hours remaining (amber)

STEP 3: Ticket Detail
  → Clicks ticket → Opens Ticket Detail (staff view)
  → Reviews: description, photo, location, resident comments
  → Changes status: "Assigned" → "In Progress"
  → Adds Internal Note: "Dispatched Team B to Canal Road site"
  → Saves → Resident notified automatically (not visible to Khalid)

STEP 4: Resolution
  → Next day, Khalid returns → Finds ticket
  → Work completed → Changes status: "In Progress" → "Resolved"
  → Adds Public Note: "Street light replaced. Reference: WO-2026-1847"
  → Saves

OUTCOME: Khalid processed a ticket efficiently without emails or spreadsheets.
```

---

### Journey 3 — Department Admin: Monitor Dashboard → Handle SLA Breach Alert

```
TRIGGER: Dr. Sara receives an escalation alert notification.

STEP 1: Alert Receipt
  → Sees red badge on notification bell
  → Notification: "SLA BREACH IMMINENT — Ticket PER-2026-00089 
    expires in 1.5 hours. Action required."

STEP 2: Admin Dashboard
  → Navigates to Dashboard
  → KPI cards show: 3 tickets in SLA breach zone (red)
  → Clicks "View Breaching Tickets" filter shortcut

STEP 3: Ticket Reassignment
  → Opens PER-2026-00089
  → Current assigned staff is overloaded (sees their ticket queue)
  → Uses "Reassign" → Selects different staff member with lower load
  → Saves → Staff member notified

STEP 4: Analytics Review (end of day)
  → Opens Analytics tab
  → Reviews: Average resolution time chart (last 30 days)
  → Notes spike in resolution time on Wednesdays
  → Exports CSV report for weekly team meeting

OUTCOME: Dr. Sara proactively prevented an SLA breach and has data to improve staffing.
```

---

### Journey 4 — Resident: Apply for Event Permit

```
STEP 1: Navigate to Permit Portal
  → Resident Dashboard → "Apply for Permit" CTA

STEP 2: Select Permit Type
  → Sees three cards: Construction Permit | Event Permit | Business License Renewal
  → Selects: Event Permit

STEP 3: Multi-Step Form Wizard
  Step 1/4 — Basic Info: Event name, date, time, expected crowd size
  Step 2/4 — Location: Venue address, indoor/outdoor (conditional: if outdoor → show noise ordinance checkbox)
  Step 3/4 — Documents: Upload venue agreement, event plan (PDF, max 10 MB each)
  Step 4/4 — Review & Submit: Summary of all inputs, fee calculation displayed
    "Event Permit Fee: PKR 5,000"
  → Clicks "Submit Application"

STEP 4: Payment Stub
  → Simulated payment receipt shown: receipt number, amount, date, permit reference
  → PDF receipt downloadable

STEP 5: Track Application
  → Application appears in "My Applications" with status: "Document Verification"
  → Receives email at each stage transition

STEP 6: Approval
  → Notification: "Your Event Permit PER-2026-00089 has been Approved"
  → Digital certificate available for download (PDF with QR code)

OUTCOME: Permit obtained digitally in 1 interaction vs. multiple in-person visits.
```

---

## 4. Pages & Screens List

### 4.1 Public Pages (No Auth Required)

| ID | Page | Route | Description |
|---|---|---|---|
| PUB-01 | Landing Page | `/` | Hero, features overview, "Report an Issue" CTA, login/register links |
| PUB-02 | Login | `/login` | Unified login with role detection post-auth |
| PUB-03 | Register | `/register` | Resident-only registration with OTP verification flow |
| PUB-04 | OTP Verification | `/verify-otp` | 6-digit OTP input; resend link with 60s cooldown |
| PUB-05 | Forgot Password | `/forgot-password` | Email input → OTP → Reset password |
| PUB-06 | Permit Verification | `/verify/:permitNumber` | Public QR-landing page; shows permit validity, type, expiry (no login needed) |
| PUB-07 | 404 Not Found | `*` | Friendly error with navigation home |

### 4.2 Resident Pages (Role: `resident`)

| ID | Page | Route | Description |
|---|---|---|---|
| RES-01 | Resident Dashboard | `/dashboard` | Welcome, quick stats, recent tickets, unread notifications, upcoming events |
| RES-02 | Submit Request | `/requests/new` | Full ticket submission form with file upload and priority selector |
| RES-03 | My Tickets | `/requests` | Paginated list of resident's tickets with status filters and search |
| RES-04 | Ticket Detail | `/requests/:ticketId` | Full ticket view: status timeline, comments thread, SLA timer, attachments |
| RES-05 | Permit Portal | `/permits` | Three permit type cards + "My Applications" section below |
| RES-06 | Permit Application | `/permits/apply/:type` | Multi-step wizard (4 steps) per permit type |
| RES-07 | Permit Detail | `/permits/:applicationId` | Application status, documents, payment receipt, certificate download |
| RES-08 | Announcements | `/announcements` | Filterable announcement list with unread indicators |
| RES-09 | Event Board | `/events` | Event listings with filter by category and date; registration CTA |
| RES-10 | Event Detail | `/events/:eventId` | Full event info + registration button with capacity counter |
| RES-11 | Notifications | `/notifications` | Full notification history; mark all read |
| RES-12 | Profile | `/profile` | Edit name, password, profile photo; view OTP verification status |

### 4.3 Staff Pages (Role: `staff`)

| ID | Page | Route | Description |
|---|---|---|---|
| STF-01 | Staff Dashboard | `/staff/dashboard` | Assigned ticket queue sorted by SLA urgency; today's stats |
| STF-02 | Ticket Queue | `/staff/tickets` | Full assigned ticket list with status/priority filters |
| STF-03 | Ticket Detail (Staff) | `/staff/tickets/:ticketId` | Ticket view with status-update control, internal note editor, public reply |

### 4.4 Department Admin Pages (Role: `dept_admin`)

| ID | Page | Route | Description |
|---|---|---|---|
| ADM-01 | Admin Dashboard | `/admin/dashboard` | KPI cards, SLA breach alerts, recent activity feed, department summary |
| ADM-02 | All Department Tickets | `/admin/tickets` | All dept tickets: advanced filters (status, priority, staff, date range) |
| ADM-03 | Ticket Detail (Admin) | `/admin/tickets/:ticketId` | Full ticket with reassign controls + escalation log |
| ADM-04 | Permit Applications | `/admin/permits` | All permit applications for dept; review workflow controls |
| ADM-05 | Permit Review | `/admin/permits/:applicationId` | Full application review: approve/reject with reason |
| ADM-06 | Staff Management | `/admin/staff` | Staff list, add/deactivate staff, view individual workloads |
| ADM-07 | Analytics Dashboard | `/admin/analytics` | Charts, heatmap, filters, CSV/PDF export |
| ADM-08 | SLA Configuration | `/admin/sla-config` | Set SLA hours per priority level per department |
| ADM-09 | Announcements Manager | `/admin/announcements` | Create/edit/archive announcements and emergency broadcasts |
| ADM-10 | Events Manager | `/admin/events` | Create and manage events; view registration counts |

### 4.5 Super Admin Pages (Role: `super_admin`)

| ID | Page | Route | Description |
|---|---|---|---|
| SUP-01 | System Overview | `/superadmin/dashboard` | System-wide KPIs across all departments; health indicators |
| SUP-02 | Department Config | `/superadmin/departments` | View/edit department details, SLA defaults, department codes |
| SUP-03 | User Management | `/superadmin/users` | All users across all roles; activate/deactivate; role assignment |
| SUP-04 | System Analytics | `/superadmin/analytics` | System-wide analytics with full drill-down |
| SUP-05 | Reports | `/superadmin/reports` | Generate and export system-wide reports (date range, dept filter) |
| SUP-06 | Emergency Broadcast | `/superadmin/broadcast` | Compose and publish emergency announcements (full-screen resident banner) |
| SUP-07 | Audit Logs | `/superadmin/audit` | Paginated audit log of all super admin actions with IP and timestamp |

### 4.6 Special / Overlay Screens

| ID | Screen | Trigger | Description |
|---|---|---|---|
| OVL-01 | Emergency Banner | WebSocket `emergency` event | Full-screen pulsing red overlay; dismissible; shows announcement title + body |
| OVL-02 | 2FA Setup Modal | First Admin login | QR code for TOTP app scanning + 6-digit verify |
| OVL-03 | 2FA Verify Modal | Every Admin login | 6-digit TOTP input prompt |
| OVL-04 | Notification Dropdown | Bell icon click | Floating panel; last 10 notifications; "View All" link |
| OVL-05 | File Preview Modal | Attachment thumbnail click | In-app image/PDF preview without download |

---

## 5. Component Breakdown

### 5.1 Layout Components

#### `AppShell`
- **Purpose:** Root layout wrapper; renders navbar + sidebar + main content area
- **Variants:** `PublicShell` (no sidebar), `ResidentShell`, `StaffShell`, `AdminShell`, `SuperAdminShell`
- **Props:** `role`, `children`
- **Behavior:** Role is read from `AuthContext`; sidebar items rendered conditionally

#### `Navbar`
- **Elements:** Logo (left), Page title (center), Notification bell with badge count, User avatar + dropdown (right)
- **Notification Bell:** Shows unread count; clicking opens `NotificationDropdown`
- **User Dropdown:** Profile link, Settings (resident only), Logout
- **Mobile:** Collapses to hamburger; sidebar slides in as drawer

#### `Sidebar`
| Role | Navigation Items |
|---|---|
| Resident | Dashboard, Report Issue, My Tickets, Permits, Announcements, Events |
| Staff | Dashboard, My Queue |
| Dept Admin | Dashboard, Tickets, Permits, Staff, Analytics, Announcements, Events, SLA Config |
| Super Admin | Overview, Departments, Users, Analytics, Reports, Broadcast, Audit Logs |

#### `PageHeader`
- **Props:** `title`, `subtitle`, `breadcrumbs[]`, `actions[]` (CTA buttons rendered top-right)
- **Usage:** Every authenticated page renders this as the first child of main content

---

### 5.2 Core UI Primitives

#### `Button`
- **Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`
- **Sizes:** `sm`, `md`, `lg`
- **States:** `default`, `loading` (spinner replaces label), `disabled`
- **Rule:** All form submission buttons enter `loading` state on click; cannot be double-clicked

#### `Input`
- **Types:** `text`, `email`, `password`, `textarea`, `select`, `file`
- **Props:** `label`, `placeholder`, `helperText`, `error`, `required`
- **Error State:** Red border + error message below; no tooltip-only errors
- **Password:** Toggle show/hide icon inside field

#### `Badge`
- **Variants:** `status` (maps ticket statuses to colors), `priority`, `role`, `category`
- **Status Color Map:**

| Status | Color | Hex |
|---|---|---|
| Submitted | Blue | `#3B82F6` |
| Under Review | Indigo | `#6366F1` |
| Assigned | Purple | `#8B5CF6` |
| In Progress | Amber | `#F59E0B` |
| Resolved | Green | `#16A34A` |
| Closed | Gray | `#6B7280` |

#### `SLATimer`
- **Purpose:** Displays countdown to SLA deadline with color-coded urgency
- **Props:** `deadline: Date`, `size: 'compact' | 'full'`
- **States:**
  - Green: > 50% of SLA time remaining
  - Amber: 20–50% remaining
  - Red (pulsing): < 20% remaining or < 2 hours absolute
- **Display:** "4h 23m remaining" in compact mode; full progress bar in Ticket Detail

#### `SkeletonLoader`
- **Variants:** `card`, `table-row`, `text-line`, `avatar`, `chart`
- **Usage:** Replaces every async-loaded component while data fetches; matches exact dimensions of the loaded component

#### `Toast`
- **Position:** Bottom-right, stacked
- **Variants:** `success`, `error`, `warning`, `info`
- **Duration:** Success: 4s auto-dismiss; Error: persists until closed; Warning: 6s
- **Props:** `message`, `title` (optional), `action` (optional link/button)

#### `EmptyState`
- **Props:** `icon`, `title`, `description`, `ctaLabel`, `ctaAction`
- **Usage:** Every list view that can be empty (My Tickets, Staff Queue, etc.)
- **Example:** My Tickets empty → "No requests yet" + "Submit Your First Request" button

---

### 5.3 Ticket Components

#### `TicketCard`
- **Usage:** My Tickets list, Staff Queue, Admin ticket list
- **Displays:** Ticket ID (monospace chip), Title, Department badge, Priority badge, Status badge, SLATimer (compact), Created date
- **Interaction:** Full card is clickable → navigates to Ticket Detail
- **Variants:** `resident-view` (no staff fields), `staff-view` (shows assigned staff name)

#### `TicketForm`
- **Usage:** Submit Request page (RES-02)
- **Sections:**
  1. Department selector (3 radio cards with icons)
  2. Title (text input, max 150 chars, char counter shown)
  3. Description (textarea, min 20 chars, max 1000 chars)
  4. Category (dropdown, populated based on selected department)
  5. Location (text input + optional map pin button)
  6. Priority selector (4 radio cards: Low / Medium / High / Emergency with color indicators)
  7. File upload (drag-and-drop zone + click-to-browse; max 5 files; 10 MB each; shows preview thumbnails)
- **Submit:** Disabled until Title, Description, Department, and Category are filled

#### `StatusTimeline`
- **Usage:** Ticket Detail page
- **Displays:** Vertical timeline of all status transitions; each node shows: status name, actor name, timestamp, and any public note attached to that transition
- **Visual:** Filled circles for completed stages; hollow for pending; connecting vertical line

#### `CommentThread`
- **Usage:** Ticket Detail page (bottom section)
- **Resident View:** Sees all "Public" notes + their own comments; cannot see "Internal" notes
- **Staff View:** Sees all notes with "INTERNAL" chip on internal notes; compose area has Public/Internal toggle
- **Optimistic Update:** Comment appears immediately in thread; reverts on API error

#### `AttachmentGallery`
- **Usage:** Ticket Detail page
- **Displays:** Thumbnail grid; image files show preview; PDFs show document icon
- **Interaction:** Click → opens `FilePreviewModal`

---

### 5.4 Permit Components

#### `PermitTypeSelector`
- **Usage:** Permit Portal (RES-05)
- **Layout:** 3 cards in a row (responsive: stack on mobile)
- **Each Card:** Icon, permit name, brief description, estimated fee, "Apply Now" button
- **Permit Types:** Construction Permit, Event Permit, Business License Renewal

#### `PermitWizard`
- **Usage:** Permit Application (RES-06)
- **Container:** Step indicator (breadcrumb-style) at top; form content in center; "Back" / "Save Draft" / "Next" controls at bottom
- **Step Indicator:** Shows step number, step name, filled for completed, active for current, hollow for upcoming
- **Auto-Save:** Every 30 seconds, current step data is saved to backend as draft; "Draft saved" appears briefly in step indicator bar
- **Navigation Guard:** Clicking "Back" or navigating away shows a "Your progress is saved as a draft" confirmation — no data loss

#### `PermitWizard Steps` (Event Permit example)

| Step | Fields |
|---|---|
| Step 1: Basic Info | Event Name, Organizer Name, Contact Email, Expected Crowd Size |
| Step 2: Event Details | Event Date/Time, Venue Name, Venue Address, Indoor/Outdoor (conditional: if Outdoor → Noise Ordinance Acknowledgment checkbox) |
| Step 3: Documents | Venue Agreement Upload, Event Plan Upload, Additional Documents (optional) |
| Step 4: Review & Submit | Full summary of all fields (read-only); Fee Calculation display; Payment Stub section; Submit button |

#### `FeeCalculator`
- **Usage:** Permit Wizard Step 4
- **Logic (client-side display only, computed by backend):** Shows itemized fee breakdown: Base Fee + per-person crowd charge + any conditional fees
- **Display:** Table with fee items and amounts; **Total** bolded at bottom

#### `PermitCertificateCard`
- **Usage:** Permit Detail (RES-07), approved state
- **Displays:** Green "APPROVED" banner, Permit Number (large, monospace), Expiry Date, QR code image, "Download PDF Certificate" button

---

### 5.5 Announcement & Event Components

#### `AnnouncementCard`
- **Variants:** `normal`, `urgent` (amber left border), `emergency` (red left border + pulsing dot)
- **Displays:** Priority badge, Category badge, Title, Body preview (2 lines truncated), Author dept, Date, "Unread" dot (blue) if unread
- **Interaction:** Click → expands inline or navigates to detail (see assumption A-03)

#### `EmergencyBanner`
- **Trigger:** WebSocket event of type `EMERGENCY_BROADCAST`
- **Appearance:** Fixed overlay covering full viewport; dark semi-transparent backdrop; centered white card with red header "⚠️ Emergency Alert", announcement title, body, and "I Understand — Dismiss" button
- **Cannot be closed by pressing Escape** — requires explicit button click
- **Marks as read** automatically on dismiss (PATCH API call)

#### `EventCard`
- **Displays:** Category badge, Event title, Date/Time, Location, Capacity bar (registered / total), "Register" or "Registered ✓" button
- **Capacity:** Progress bar fills as registrations increase; turns red and button changes to "At Capacity" when full

---

### 5.6 Analytics Components

> **[ASSUMPTION A-01]:** Analytics charts use Recharts library (included in the React ecosystem, lightweight, responsive). Chart.js is the fallback if Recharts causes integration issues.

#### `KPICard`
- **Props:** `label`, `value`, `trend` (% vs previous period), `trendDirection`, `icon`, `color`
- **Used in:** Admin Dashboard (total tickets, avg resolution time, SLA breach rate, open permits)

#### `TicketStatusDonutChart`
- **Type:** Recharts `PieChart` with `innerRadius` (donut shape)
- **Data:** Count of tickets per status
- **Interactions:** Hover → tooltip showing count and percentage; click segment → filters ticket table to that status

#### `ResolutionTimeLineChart`
- **Type:** Recharts `LineChart`
- **Data:** Average resolution time in hours, plotted by day (default: last 30 days)
- **Axes:** X = date, Y = hours
- **Date Range Filter:** Connected to global `DateRangePicker` filter control

#### `SLABreachGauge`
- **Type:** Custom SVG semi-circle gauge (or Recharts `RadialBarChart`)
- **Data:** Breach rate as a percentage
- **Color:** Green < 10%, Amber 10–25%, Red > 25%

#### `ComplaintHeatmap`
- **[BONUS — ASSUMPTION A-02]:** If Leaflet.js is implemented, this renders a map with `leaflet.heat` plugin overlaid
- **Fallback (if no map):** A 5×5 grid table showing location name vs. complaint count, sorted descending

#### `PermitFunnelChart`
- **Type:** Recharts `FunnelChart` or custom horizontal bar chart approximating a funnel
- **Stages:** Submitted → Document Verification → Inspection Scheduled → Approved (with Rejected as a side branch)

#### `TopIssuesTable`
- **Type:** Ranked table; top 5 rows
- **Columns:** Rank, Issue Category, Department, Count (last 30 days), % of total

#### `DateRangePicker`
- **Usage:** Analytics Dashboard (global filter)
- **Options:** Last 7 days, Last 30 days, Last 90 days, Custom range (calendar picker)
- **Behavior:** All charts on the page re-fetch data when range changes

#### `ExportControls`
- **Buttons:** "Export CSV" + "Export PDF"
- **CSV:** Downloads current data table as `.csv`
- **PDF:** Calls backend `/api/v1/analytics/export-pdf` → downloads generated PDF report

---

### 5.7 Navigation & Notification Components

#### `NotificationDropdown`
- **Trigger:** Bell icon in Navbar
- **Displays:** Last 10 notifications; each shows: type icon, message, time ago, unread dot
- **Notification Types & Icons:** Status Change (ticket icon), SLA Alert (clock icon), Announcement (megaphone), Event (calendar), Permit Update (document)
- **Actions:** Click notification → navigates to relevant page + marks as read; "Mark All Read" link; "View All" link → `/notifications`

#### `BreadcrumbNav`
- **Usage:** All admin and staff pages; not shown on resident pages (simpler UX)
- **Example:** System Overview > Departments > Infrastructure > Tickets

---

## 6. State Management Strategy

### 6.1 Tool: React Query (TanStack Query) + Zustand

| Layer | Tool | Responsibility |
|---|---|---|
| **Server State** | React Query (`@tanstack/react-query`) | All API data: tickets, permits, announcements, analytics |
| **Global Client State** | Zustand | Auth session, notification count, WebSocket connection, emergency banner visibility, theme |
| **Local UI State** | `useState` / `useReducer` | Form inputs, modal open/close, step index in wizard, accordion expansion |

> **Rationale:** React Query eliminates manual loading/error/refetch boilerplate for server data. Zustand is minimal and TypeScript-friendly for the small amount of global UI state needed.

### 6.2 Zustand Stores

#### `useAuthStore`
```javascript
{
  user: { id, name, email, role, department_id, profile_photo_url } | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise<void>,
  logout: () => void,
  refreshToken: () => Promise<void>
}
```

#### `useNotificationStore`
```javascript
{
  unreadCount: number,
  notifications: Notification[],
  incrementUnread: () => void,
  decrementUnread: (count) => void,
  setNotifications: (notifications) => void,
  markAllRead: () => void
}
```

#### `useUIStore`
```javascript
{
  emergencyBanner: { visible: boolean, announcement: Announcement | null },
  sidebarOpen: boolean,  // mobile drawer state
  theme: 'light' | 'dark',
  showEmergencyBanner: (announcement) => void,
  dismissEmergencyBanner: () => void,
  toggleSidebar: () => void,
  toggleTheme: () => void
}
```

#### `useSocketStore`
```javascript
{
  socket: Socket | null,
  connected: boolean,
  initializeSocket: (token) => void,
  disconnectSocket: () => void
}
```

### 6.3 React Query Key Conventions

All query keys follow a structured array pattern for precise invalidation:

| Resource | Query Key |
|---|---|
| Current user | `['auth', 'me']` |
| All resident tickets | `['tickets', { userId }]` |
| Single ticket | `['tickets', ticketId]` |
| Staff queue | `['tickets', 'assigned', { staffId }]` |
| All dept tickets (admin) | `['tickets', 'department', { deptId, filters }]` |
| Permit applications | `['permits', { userId }]` |
| Single permit | `['permits', applicationId]` |
| Announcements | `['announcements', { filters }]` |
| Events | `['events', { filters }]` |
| Analytics (tickets) | `['analytics', 'tickets', { deptId, dateRange }]` |
| Notifications | `['notifications', { userId }]` |

### 6.4 Cache Invalidation Rules

| Trigger Action | Invalidates |
|---|---|
| Ticket status updated | `['tickets', ticketId]`, `['tickets', 'assigned', ...]`, `['analytics', 'tickets', ...]` |
| New ticket submitted | `['tickets', { userId }]`, `['analytics', 'tickets', ...]` |
| Comment added | `['tickets', ticketId]` |
| Permit status changed | `['permits', applicationId]`, `['permits', { userId }]` |
| New announcement published | `['announcements', ...]`, `['notifications', ...]` |
| Event registered | `['events', eventId]` |

### 6.5 WebSocket Event Handling

Socket events update client state without a full refetch where possible (optimistic sync):

| Event | Handler |
|---|---|
| `ticket:status_updated` | Invalidate `['tickets', ticketId]`; show toast notification |
| `notification:new` | Increment `unreadCount`; prepend to notification list |
| `announcement:emergency` | `showEmergencyBanner(announcement)` |
| `sla:breach_alert` | Show persistent toast; invalidate admin ticket queries |

---

## 7. API Integration Points

> Base URL: `https://api.civicconnect.city/api/v1`
> All requests include `Authorization: Bearer {accessToken}` header unless marked [PUBLIC]
> All responses follow: `{ success: boolean, data: any, error: { code, message } | null }`

### 7.1 Authentication Endpoints

| Method | Endpoint | Page | Request | Response |
|---|---|---|---|---|
| POST | `/auth/register` | PUB-03 | `{ name, email, password, profile_photo }` | `{ message: "OTP sent" }` |
| POST | `/auth/verify-otp` | PUB-04 | `{ email, otp }` | `{ accessToken, user }` |
| POST | `/auth/login` | PUB-02 | `{ identifier, password }` | `{ accessToken, user }` or `{ requires2FA: true }` |
| POST | `/auth/2fa/verify` | OVL-03 | `{ totp_code }` | `{ accessToken, user }` |
| POST | `/auth/logout` | Any | `{}` | `{ success: true }` |
| POST | `/auth/refresh` | Background | `{}` (cookie) | `{ accessToken }` |
| POST | `/auth/forgot-password` | PUB-05 | `{ email }` | `{ message: "OTP sent" }` |
| POST | `/auth/reset-password` | PUB-05 | `{ email, otp, newPassword }` | `{ success: true }` |
| POST | `/auth/resend-otp` | PUB-04 | `{ email }` | `{ message: "OTP resent" }` |

### 7.2 Ticket Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| POST | `/tickets` | RES-02 | Multipart form-data for file uploads |
| GET | `/tickets` | RES-03, STF-02 | Query params: `status`, `priority`, `department_id`, `page`, `limit` |
| GET | `/tickets/:id` | RES-04, STF-03, ADM-03 | Returns ticket + comments + attachments + status history |
| PATCH | `/tickets/:id/status` | STF-03, ADM-03 | Body: `{ status, public_note }` |
| POST | `/tickets/:id/comments` | RES-04, STF-03 | Body: `{ body, is_internal }` |
| PATCH | `/tickets/:id/assign` | ADM-03 | Body: `{ staff_id }` |
| GET | `/tickets/stats` | ADM-01, SUP-01 | Returns KPI summary for authenticated user's scope |

### 7.3 Permit Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| GET | `/permits/types` | RES-05 | Returns permit types with fee schedules |
| POST | `/permits` | RES-06 | Multipart; creates application (status: `DRAFT`) |
| PATCH | `/permits/:id/draft` | RES-06 | Auto-save; body: partial form_data |
| POST | `/permits/:id/submit` | RES-06 | Finalizes application; triggers document review |
| GET | `/permits` | RES-05, ADM-04 | Resident sees own; admin sees dept |
| GET | `/permits/:id` | RES-07, ADM-05 | Full application detail |
| PATCH | `/permits/:id/status` | ADM-05 | Body: `{ status, rejection_reason? }` |
| GET | `/permits/:id/certificate` | RES-07 | Returns PDF download URL |
| GET | `/permits/verify/:permitNumber` | PUB-06 | [PUBLIC] Returns permit validity |

### 7.4 Announcement & Event Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| GET | `/announcements` | RES-08 | Query: `category`, `priority`, `page` |
| GET | `/announcements/:id` | RES-08 | Single announcement |
| PATCH | `/announcements/:id/read` | RES-08, OVL-01 | Marks announcement read for current user |
| POST | `/announcements` | ADM-09, SUP-06 | Body: `{ title, body, category, priority, expiry_date }` |
| GET | `/events` | RES-09 | Query: `category`, `date_from`, `date_to`, `page` |
| GET | `/events/:id` | RES-10 | Single event with registration status for current user |
| POST | `/events/:id/register` | RES-10 | Register current user for event |
| DELETE | `/events/:id/register` | RES-10 | Cancel registration |
| POST | `/events` | ADM-10 | Create event |

### 7.5 Analytics Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| GET | `/analytics/tickets` | ADM-07, SUP-04 | Query: `dept_id`, `date_from`, `date_to` |
| GET | `/analytics/permits` | ADM-07 | Permit funnel data |
| GET | `/analytics/sla` | ADM-07 | SLA breach rate and breach history |
| GET | `/analytics/top-issues` | ADM-07 | Top 5 issues by category + count |
| GET | `/analytics/heatmap` | ADM-07 | Location + count data for heatmap |
| GET | `/analytics/export-csv` | ADM-07 | Triggers CSV download |
| GET | `/analytics/export-pdf` | ADM-07 | Returns PDF report binary |

### 7.6 User Management Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| GET | `/users/me` | Profile | Current authenticated user |
| PATCH | `/users/me` | RES-12 | Update name, profile photo |
| PATCH | `/users/me/password` | RES-12 | Body: `{ current_password, new_password }` |
| GET | `/users` | ADM-06, SUP-03 | Admin: dept users; Super: all users |
| POST | `/users/staff` | ADM-06 | Create staff account |
| PATCH | `/users/:id/status` | ADM-06, SUP-03 | Activate / deactivate |

### 7.7 Notification Endpoints

| Method | Endpoint | Page | Notes |
|---|---|---|---|
| GET | `/notifications` | RES-11, OVL-04 | Query: `page`, `limit`; returns unread count in headers |
| PATCH | `/notifications/:id/read` | OVL-04 | Mark single notification read |
| PATCH | `/notifications/read-all` | RES-11 | Mark all read |

---

## 8. Validation Rules

### 8.1 Authentication Forms

| Field | Rules |
|---|---|
| Name | Required; min 2 chars; max 80 chars; letters and spaces only |
| Email | Required; valid RFC 5321 email format; lowercase on submit |
| Password | Required; min 8 chars; must contain at least 1 uppercase, 1 number, 1 special character |
| Confirm Password | Must exactly match Password field |
| OTP | Required; exactly 6 digits; numeric only |
| Staff ID | Required; alphanumeric; 6–12 chars |
| TOTP Code | Required; exactly 6 digits; numeric only |

### 8.2 Ticket Submission Form

| Field | Rules |
|---|---|
| Title | Required; min 10 chars; max 150 chars; character counter shown at 100+ |
| Description | Required; min 20 chars; max 1000 chars; character counter shown |
| Department | Required; one of the 3 defined departments |
| Category | Required; must be from the list generated for selected department |
| Location | Required; min 5 chars; max 300 chars |
| Priority | Required; one of: Low, Medium, High, Emergency |
| Attachments | Optional; max 5 files; each max 10 MB; accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |

**Real-Time Validation:** Title and Description validate on blur (field loses focus), not on keystroke. File validation (size, type) triggers immediately on file selection.

### 8.3 Permit Wizard Forms

#### General Rules (all steps)
- "Next" button disabled until all required fields in current step are valid
- Backend validation error on submit overrides and highlights the relevant step

#### Step-Specific Rules

| Permit Type | Field | Rules |
|---|---|---|
| All | Organizer/Applicant Email | Valid email format |
| Event Permit | Expected Crowd Size | Required; integer; min 10; max 100,000 |
| Event Permit | Event Date | Required; must be at least 14 days in the future (assumption: city requires 2-week notice) |
| Construction | Start Date | Required; must be in the future |
| Construction | End Date | Required; must be after Start Date |
| Business License | Business Registration Number | Required; alphanumeric; 8–15 chars |
| All | Document Upload | At least 1 document required; each max 10 MB; PDF or image |

### 8.4 Comment / Note Forms

| Field | Rules |
|---|---|
| Comment body | Required; min 5 chars; max 2000 chars; character counter shown |
| Internal toggle (staff only) | Boolean; defaults to `false` (Public) |

### 8.5 Admin Forms

| Form | Field | Rules |
|---|---|---|
| Create Staff | All fields | Same as registration; email must not already exist |
| SLA Config | SLA Hours (Low) | Required; integer; min 24; max 720 |
| SLA Config | SLA Hours (Medium) | Required; integer; min 8; max 168 |
| SLA Config | SLA Hours (High) | Required; integer; min 2; max 48 |
| SLA Config | SLA Hours (Emergency) | Required; integer; min 1; max 4 |
| Announcement | Title | Required; min 5 chars; max 200 chars |
| Announcement | Body | Required; min 20 chars; max 5000 chars |
| Announcement | Expiry Date | Required for non-emergency; must be in the future |
| Event | Capacity | Required; integer; min 1; max 100,000 |
| Event | Event Date | Required; must be in the future |

### 8.6 Client-Side Validation Implementation

**Library:** `react-hook-form` with `zod` resolver

```javascript
// Example: Ticket form schema (Zod)
const ticketSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(150),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  department_id: z.string().uuid("Please select a department"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(5).max(300),
  priority: z.enum(["Low", "Medium", "High", "Emergency"]),
});
```

---

## 9. Error Handling

### 9.1 Error Categories & Responses

| Category | HTTP Status | User-Facing Behavior |
|---|---|---|
| Validation Error | 400 | Highlight specific field(s) with error message below; no toast |
| Unauthorized | 401 | Redirect to `/login`; clear auth store; show "Session expired. Please log in again." toast |
| Forbidden | 403 | Show "You don't have permission to do this" in-page error; do not redirect |
| Not Found | 404 | Render `<NotFoundState>` component in page content area |
| Rate Limited | 429 | Show "Too many attempts. Please wait X seconds." with countdown |
| Server Error | 500 | Show `<ServerErrorState>` with "Something went wrong on our end. Try again in a moment." + retry button |
| Network Error | — | Show "Unable to connect. Check your internet connection." persistent toast with retry button |

### 9.2 API Error Handling Wrapper

All API calls are wrapped in a centralized Axios instance (`src/services/api.js`):

```javascript
// Interceptor structure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt silent token refresh
      // If refresh fails → logout + redirect /login
    }
    if (error.response?.status === 429) {
      // Extract Retry-After header → display countdown toast
    }
    return Promise.reject(error);
  }
);
```

### 9.3 Form Submission Error Handling

1. Button enters `loading` state immediately on submit
2. If API returns 400 validation errors:
   - Map error fields to `react-hook-form` `setError` calls
   - Scroll to first error field
   - Button returns to normal state
3. If API returns 5xx:
   - Show error toast "Submission failed. Please try again."
   - Button returns to normal state; form data preserved

### 9.4 File Upload Error Handling

| Error | User Message |
|---|---|
| File too large (> 10 MB) | "File '[name]' is too large. Maximum size is 10 MB." |
| Invalid file type | "File '[name]' is not supported. Please upload PDF, JPG, PNG, or WEBP." |
| Too many files (> 5) | "You can attach up to 5 files. Please remove some." |
| Upload network failure | "Upload failed for '[name]'. Please try again." with retry button on that file |

### 9.5 WebSocket Error Handling

- Connection failure: Silent retry with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- After 5 failed reconnects: Show small persistent indicator "Live updates paused. Reconnecting..." in navbar
- On reconnect: Fetch missed notifications; invalidate relevant React Query caches

### 9.6 Error Boundaries

```
<RootErrorBoundary>          ← catches catastrophic crashes, shows full-page error
  <AppShell>
    <RouteErrorBoundary>     ← catches page-level errors, shows in-page error state
      <PageContent>
        <WidgetErrorBoundary> ← catches chart/widget failures, shows inline fallback
```

Each boundary renders an appropriate fallback without crashing sibling components.

---

## 10. Responsive Design Requirements

### 10.1 Breakpoints

| Name | Min Width | Target Device |
|---|---|---|
| `xs` | 320px | Small phones (minimum supported) |
| `sm` | 375px | Standard phones |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape) / small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops / external monitors |

### 10.2 Layout Behavior by Breakpoint

#### Sidebar
| Breakpoint | Behavior |
|---|---|
| xs–md | Hidden; accessible via hamburger icon → slides in as full-height drawer overlay |
| lg+ | Fixed left sidebar (240px wide); main content fills remaining space |

#### Navigation
| Breakpoint | Behavior |
|---|---|
| xs–md | Sticky top navbar only; sidebar accessed via hamburger |
| lg+ | Sticky top navbar + fixed left sidebar |

#### Dashboard Grids
| Element | xs | md | lg | xl |
|---|---|---|---|---|
| KPI Cards | 1 column | 2 columns | 3 columns | 4 columns |
| Ticket List | 1 column (card stack) | 1 column | Full-width table | Full-width table |
| Analytics Charts | 1 column | 2 columns | 2 columns | 3 columns |
| Permit Type Cards | 1 column (stacked) | 2 columns | 3 columns | 3 columns |

#### Forms
- All form inputs: full width on xs–md; max 640px centered on lg+
- Permit wizard: single column on mobile; two-column layout for wide screens on steps with many short fields

#### Tables
- On xs–md: tables collapse to card layout (each row becomes a card with label: value format)
- On lg+: standard horizontal scrollable table

### 10.3 Touch Targets
- All interactive elements: minimum 44px × 44px tap target (per WCAG 2.5.5)
- Buttons inside ticket cards: padding adjusted to ensure full-area clickability on mobile
- File upload zone: minimum 120px height on mobile for easy touch-and-upload

### 10.4 Mobile-Specific UX Rules
- Bottom navigation bar (optional enhancement) for resident role on mobile: Dashboard / Submit / My Tickets / Notifications
- All modals: full-screen on mobile (transform from bottom drawer)
- Date pickers: use native `<input type="date">` on mobile; custom calendar picker on desktop
- File upload: triggers native file browser on mobile (camera option included for JPEG capture)

---

## 11. Accessibility Requirements

### 11.1 WCAG 2.1 AA Compliance Targets

| Criterion | Requirement |
|---|---|
| Color Contrast | All text: minimum 4.5:1 ratio (normal text), 3:1 (large text / UI components) |
| Keyboard Navigation | Every interactive element reachable via Tab; logical focus order; no focus traps except modals |
| Focus Visibility | Visible focus ring on all focusable elements (2px solid `#1B3A6B` outline, 2px offset) |
| ARIA Labels | All icon-only buttons have `aria-label`; all form inputs have associated `<label>` |
| Error Identification | Form errors announced via `aria-describedby` linking input to error message |
| Skip Navigation | "Skip to main content" link as first focusable element on every page |
| Status Messages | Live regions (`aria-live="polite"`) for toast notifications and status updates |
| Images | All meaningful images have descriptive `alt` text; decorative images have `alt=""` |
| Headings | Logical heading hierarchy on every page (H1 → H2 → H3; never skipped) |
| Form Labels | Every input has an associated label; no placeholder-only labels |

### 11.2 Lighthouse Accessibility Target

**Target: 90+ on Resident Dashboard (RES-01)**

Key items verified before submission:
- `<html lang="en">` set on root
- All images have `alt` attributes
- All form controls labeled
- All color contrast ratios checked (use Figma contrast plugin or `axe` DevTools)
- Interactive elements have accessible names
- ARIA roles used correctly (no `role="button"` on `<div>` — use actual `<button>`)

### 11.3 Keyboard Interaction Patterns

| Component | Expected Keyboard Behavior |
|---|---|
| Sidebar navigation | Tab through links; Enter to navigate |
| Dropdown menus | Enter/Space to open; Arrow keys to navigate items; Escape to close; focus returns to trigger |
| Modals | Focus trapped inside; Escape closes (except Emergency Banner); Tab cycles through focusable elements |
| Data tables | Arrow keys navigate cells; Tab moves between rows |
| File upload zone | Enter/Space triggers file dialog; files announced after selection |
| SLA Timer | Read-only; announced correctly to screen readers as "X hours Y minutes remaining, [urgency level]" |
| Status Timeline | Navigable via keyboard; each node has descriptive `aria-label` |
| Toast notifications | Announced via `aria-live` region; close button keyboard accessible |

### 11.4 Screen Reader Considerations

- Ticket status badges use `aria-label` describing the full status: `aria-label="Status: In Progress"`
- SLA urgency communicated via text, not color alone: "2h 30m remaining (Urgent)" visible in DOM
- Charts include a visually-hidden data table as an alternative representation
- Loading skeletons have `aria-busy="true"` on their container; `aria-live="polite"` announces when loaded
- Notification count on bell icon: `aria-label="Notifications, 3 unread"`

---

## 12. Frontend Tech Stack Recommendation

### 12.1 Core Framework

**Recommendation: Next.js 14 (App Router)**

| Consideration | Rationale |
|---|---|
| **SSR/SSG** | Landing page (PUB-01) and Permit Verification (PUB-06) benefit from SSR for SEO and fast initial load |
| **File-based routing** | Maps cleanly to the defined page structure |
| **Built-in image optimization** | Profile photos and attachments served optimally |
| **API routes** | Optional: can proxy sensitive analytics calls server-side |
| **Deployment** | Vercel (Next.js authors) — zero-config deployment, mandatory for competition |

> **[ASSUMPTION A-03]:** If time pressure is extreme in the competition window, fall back to Vite + React (CRA replacement) deployed to Vercel. Same component architecture applies.

### 12.2 Full Stack Dependency List

#### Core
| Package | Version | Purpose |
|---|---|---|
| `next` | 14.x | Framework |
| `react` / `react-dom` | 18.x | UI library |
| `typescript` | 5.x | Type safety (strongly recommended) |

#### Styling
| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | 3.x | Utility-first CSS; responsive breakpoints |
| `clsx` | latest | Conditional className utility |
| `tailwind-merge` | latest | Merges conflicting Tailwind classes |

#### State & Data Fetching
| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | 5.x | Server state management, caching, background refetch |
| `zustand` | 4.x | Global client state (auth, UI, notifications) |
| `axios` | 1.x | HTTP client with interceptors |
| `socket.io-client` | 4.x | WebSocket connection for real-time features |

#### Forms & Validation
| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | 7.x | Form state management, minimizes re-renders |
| `zod` | 3.x | Schema-based validation; shared with backend (optional) |
| `@hookform/resolvers` | latest | Connects Zod to react-hook-form |

#### UI Components
| Package | Version | Purpose |
|---|---|---|
| `recharts` | 2.x | Analytics charts (BarChart, LineChart, PieChart, FunnelChart) |
| `react-hot-toast` | 2.x | Toast notification system |
| `@radix-ui/react-*` | latest | Headless accessible primitives (Dialog, Dropdown, Select, Tabs) |
| `lucide-react` | latest | Icon library (consistent, MIT licensed) |
| `react-dropzone` | latest | File upload drag-and-drop |
| `react-otp-input` | latest | OTP digit input with auto-advance |

#### Maps & Visualization (Bonus)
| Package | Version | Purpose |
|---|---|---|
| `leaflet` | 1.x | Interactive map for location pinning |
| `react-leaflet` | 4.x | React wrapper for Leaflet |
| `leaflet.heat` | latest | Heatmap overlay for complaint visualization |

#### Date & Utilities
| Package | Version | Purpose |
|---|---|---|
| `date-fns` | 3.x | Date formatting, relative time ("3 hours ago"), SLA calculation |
| `qrcode` | latest | Client-side QR code generation for certificate preview |

#### PDF Generation (Client-side)
| Package | Version | Purpose |
|---|---|---|
| `jspdf` | 2.x | Generate payment receipts client-side |
| `html2canvas` | 1.x | Capture rendered certificate component as PDF |

> **[ASSUMPTION A-04]:** Permit certificates (official PDFs) are generated server-side for security and official appearance. Client-side `jsPDF` handles only payment receipt stubs, which have no legal significance.

#### Development Tools
| Package | Version | Purpose |
|---|---|---|
| `eslint` | 8.x | Linting |
| `prettier` | 3.x | Code formatting |
| `@tanstack/react-query-devtools` | 5.x | Query cache inspector during development |

### 12.3 Folder Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── icons/            # PWA icons (if bonus implemented)
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (public)/     # Landing, login, register, verify-otp
│   │   ├── (resident)/   # Resident-authenticated pages
│   │   ├── (staff)/      # Staff-authenticated pages
│   │   ├── (admin)/      # Dept admin pages
│   │   ├── (superadmin)/ # Super admin pages
│   │   └── layout.tsx    # Root layout with providers
│   ├── components/
│   │   ├── common/       # Button, Input, Badge, Modal, Toast, SkeletonLoader, EmptyState
│   │   ├── layout/       # AppShell, Navbar, Sidebar, PageHeader, BreadcrumbNav
│   │   ├── tickets/      # TicketCard, TicketForm, StatusTimeline, CommentThread, SLATimer, AttachmentGallery
│   │   ├── permits/      # PermitTypeSelector, PermitWizard, FeeCalculator, PermitCertificateCard
│   │   ├── announcements/# AnnouncementCard, EmergencyBanner
│   │   ├── events/       # EventCard, EventRegistrationButton
│   │   ├── analytics/    # KPICard, TicketStatusDonutChart, ResolutionTimeLineChart, SLABreachGauge, TopIssuesTable, DateRangePicker, ExportControls
│   │   └── notifications/# NotificationDropdown, NotificationItem
│   ├── contexts/         # (Legacy: moved to Zustand; kept for React Query Provider)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTickets.ts
│   │   ├── usePermits.ts
│   │   ├── useAnnouncements.ts
│   │   ├── useAnalytics.ts
│   │   └── useWebSocket.ts
│   ├── lib/
│   │   ├── api.ts        # Axios instance with interceptors
│   │   ├── queryClient.ts# React Query client configuration
│   │   └── socket.ts     # Socket.io client initialization
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── ticket.ts
│   │   ├── permit.ts
│   │   ├── user.ts
│   │   └── announcement.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── slaUtils.ts   # SLA deadline calculation, color mapping
│   │   ├── ticketId.ts   # Ticket ID display formatting
│   │   └── validators.ts # Shared validation helpers
│   └── styles/
│       ├── globals.css   # Tailwind base + custom CSS variables
│       └── tokens.css    # Design token definitions
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### 12.4 Environment Variables (Frontend)

```bash
# .env.example (frontend)
NEXT_PUBLIC_API_BASE_URL=https://api.civicconnect.city/api/v1
NEXT_PUBLIC_SOCKET_URL=https://api.civicconnect.city
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token   # Only if Leaflet bonus implemented
```

---

## 13. Design System & Tokens

### 13.1 Color Tokens

```css
/* styles/tokens.css */
:root {
  /* Brand */
  --color-primary-900: #0F2447;
  --color-primary-700: #1B3A6B;  /* Civic Blue — primary action */
  --color-primary-500: #2563EB;
  --color-primary-100: #DBEAFE;
  --color-primary-50:  #EFF6FF;

  /* Accent */
  --color-amber-500:   #F59E0B;  /* Action Amber — urgency, SLA */
  --color-amber-100:   #FEF3C7;

  /* Semantic */
  --color-success:     #16A34A;
  --color-success-bg:  #DCFCE7;
  --color-warning:     #D97706;
  --color-warning-bg:  #FEF9C3;
  --color-danger:      #DC2626;
  --color-danger-bg:   #FEE2E2;
  --color-info:        #0284C7;
  --color-info-bg:     #E0F2FE;

  /* Neutral */
  --color-gray-900:    #111827;  /* Primary text */
  --color-gray-700:    #374151;  /* Secondary text */
  --color-gray-500:    #6B7280;  /* Tertiary text / labels */
  --color-gray-300:    #D1D5DB;  /* Borders */
  --color-gray-100:    #F3F4F6;  /* Subtle backgrounds */
  --color-surface:     #F8FAFC;  /* Page background */
  --color-white:       #FFFFFF;

  /* Status — Ticket */
  --status-submitted:  #3B82F6;
  --status-review:     #6366F1;
  --status-assigned:   #8B5CF6;
  --status-progress:   #F59E0B;
  --status-resolved:   #16A34A;
  --status-closed:     #6B7280;
}
```

### 13.2 Typography Scale

```css
/* DM Sans for headings; IBM Plex Sans for body */
--font-display:  'DM Sans', sans-serif;
--font-body:     'IBM Plex Sans', sans-serif;
--font-mono:     'IBM Plex Mono', monospace; /* Ticket IDs, permit numbers */

--text-xs:    0.75rem;  /* 12px — labels, captions */
--text-sm:    0.875rem; /* 14px — secondary body, table rows */
--text-base:  1rem;     /* 16px — primary body text */
--text-lg:    1.125rem; /* 18px — card titles */
--text-xl:    1.25rem;  /* 20px — section headers */
--text-2xl:   1.5rem;   /* 24px — page titles */
--text-3xl:   1.875rem; /* 30px — dashboard KPI numbers */
--text-4xl:   2.25rem;  /* 36px — landing hero */
```

### 13.3 Spacing System
Base unit: 4px. All spacing in multiples of 4.

```
4px (1)   — icon gap, tight inline spacing
8px (2)   — input padding vertical
12px (3)  — input padding horizontal, tag padding
16px (4)  — card internal padding, section gap
24px (6)  — between card sections
32px (8)  — between page sections
48px (12) — major section separation
64px (16) — hero section vertical padding
```

### 13.4 Shadow Tokens

```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.06);           /* Subtle lift (input focus) */
--shadow-md:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04); /* Cards */
--shadow-lg:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04); /* Modals, dropdowns */
--shadow-xl:   0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04); /* Emergency banner */
```

---

## 14. Assumptions

> All assumptions are clearly labeled and should be reviewed with the team at kickoff. If an assumption is incorrect, it may require a design change.

| ID | Assumption | Impact if Wrong |
|---|---|---|
| A-01 | Recharts is used for all analytics charts | If a different chart library is preferred (e.g., Chart.js), the analytics component APIs will differ but the data contracts remain the same |
| A-02 | Leaflet.js heatmap is a bonus feature; the fallback is a data table. The default build does not include Leaflet to keep bundle size manageable | If map is made mandatory, add `leaflet` + `react-leaflet` to base dependencies and dedicate ~1 hour of build time |
| A-03 | Announcement detail is inline-expanded (accordion) on the list page, not a separate detail route, to minimize navigation depth for residents | If a separate detail route is preferred, add `RES-08b: Announcement Detail` to the page list and create a corresponding route |
| A-04 | Official permit certificates are generated server-side (PDF); client-side `jsPDF` handles only payment receipt stubs | If certificate generation must be client-side, use `html2canvas` + `jsPDF` on the certificate card component |
| A-05 | The 2FA setup flow (QR code display) only occurs once — on first admin login after account creation. Subsequent logins show only the TOTP input prompt | If 2FA must be re-set up periodically, add a "Reset 2FA" option in the admin profile settings |
| A-06 | Profile photo upload stores to Cloudinary; the frontend receives back a secure URL and stores it in the user record | If Cloudinary is unavailable, Supabase Storage is the direct fallback; the upload interface remains identical |
| A-07 | The mobile bottom navigation bar (Dashboard / Submit / Tickets / Notifications) is optional enhancement; the sidebar drawer is the baseline mobile navigation | If bottom nav is implemented, it adds ~2 hours to the build; prioritize only if time permits after all 4 modules are complete |
| A-08 | Resident cannot delete their own submitted tickets — only Department Admin or Super Admin can archive/close tickets | If residents need deletion, add a "Withdraw Request" action available only when status is "Submitted" |
| A-09 | The "Emergency" priority on a civic request and an "Emergency" announcement are distinct features — Emergency priority tickets follow normal SLA rules but with shortest SLA hours; Emergency announcements trigger the full-screen banner | If these need to be linked (e.g., Emergency ticket auto-creates an Emergency announcement), add a checkbox on the ticket form visible only to Dept Admin |
| A-10 | Dark mode is a bonus feature; the default build ships light mode only with the design tokens structured to support dark mode via CSS variable overrides | If dark mode is required from day one, add `[data-theme="dark"]` overrides to `tokens.css` and the theme toggle to `useUIStore` — estimated ~30 min additional setup |

---

*Document prepared for AUREX AI 2026 — Web Development Track*
*Bahria University, BSEAS | 13 May 2026*
*Classification: Team Internal — Competition Use Only*
*Derived from: CivicConnect Master Documentation v1.0*
