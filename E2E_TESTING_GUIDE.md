# CivicConnect End-to-End Testing Guide

## Overview
This guide provides comprehensive manual E2E testing procedures for all user roles and critical workflows in CivicConnect.

**Backend API**: https://civicconnectai-ze4s.onrender.com/api/v1
**Frontend**: http://localhost:3000 (local dev) or deployed URL

---

## Test Credentials

### Test Users (Pre-created in Backend)
```
Resident:
  Email: resident@test.com
  Password: Test@1234

Staff Member:
  Email: staff@test.com
  Password: Test@1234

Admin (Department):
  Email: admin@test.com
  Password: Test@1234

SuperAdmin:
  Email: superadmin@test.com
  Password: Test@1234
```

---

## Module 1: Authentication & Authorization

### Test 1.1: Resident Registration
- [ ] Navigate to `/register`
- [ ] Fill form with valid data (email, password, name, phone)
- [ ] Submit form
- [ ] Verify OTP sent to email
- [ ] Enter OTP on `/verify-otp`
- [ ] Verify redirect to login
- [ ] Login with new credentials
- [ ] Verify redirect to resident dashboard

### Test 1.2: Login Flow
- [ ] Navigate to `/login`
- [ ] Enter valid credentials (resident@test.com / Test@1234)
- [ ] Verify redirect to appropriate dashboard based on role
- [ ] Verify session persists on page refresh
- [ ] Logout and verify redirect to login page

### Test 1.3: Forgot Password
- [ ] Navigate to `/forgot-password`
- [ ] Enter registered email
- [ ] Verify OTP sent
- [ ] Enter OTP and new password
- [ ] Verify redirect to login
- [ ] Login with new password

### Test 1.4: Role-Based Access Control
- [ ] Login as resident
- [ ] Verify cannot access `/admin/*` routes (should redirect)
- [ ] Verify cannot access `/staff/*` routes
- [ ] Verify cannot access `/superadmin/*` routes
- [ ] Logout and repeat for staff, admin, superadmin roles

---

## Module 2: Resident Dashboard & Permits

### Test 2.1: Resident Dashboard
- [ ] Login as resident
- [ ] Verify dashboard loads with:
  - [ ] Welcome message with resident name
  - [ ] Quick stats (Active Permits, Pending Requests, etc.)
  - [ ] Recent permits list
  - [ ] Recent requests list
  - [ ] Announcements section
- [ ] Verify responsive design on mobile/tablet

### Test 2.2: Apply for Permit
- [ ] Click "Apply for Permit" button
- [ ] Select permit type (e.g., "Building Permit")
- [ ] Fill form with valid data
- [ ] Upload required documents (PDF/image)
- [ ] Submit application
- [ ] Verify success message
- [ ] Verify permit appears in "My Permits" list
- [ ] Verify permit status is "Submitted"

### Test 2.3: View Permit Details
- [ ] Click on a permit in the list
- [ ] Verify details page shows:
  - [ ] Permit number
  - [ ] Application date
  - [ ] Current status
  - [ ] Uploaded documents
  - [ ] Status history timeline
  - [ ] Comments section
- [ ] Verify can download documents

### Test 2.4: Track Permit Status
- [ ] Navigate to `/permits`
- [ ] Verify list shows all permits with status badges
- [ ] Filter by status (Submitted, Under Review, Approved, Rejected)
- [ ] Verify search by permit number works
- [ ] Verify pagination works (if >10 permits)

### Test 2.5: Verify Permit (Public)
- [ ] Navigate to `/verify/[permitNumber]` (use actual permit number)
- [ ] Verify shows permit details without login
- [ ] Verify shows QR code
- [ ] Verify shows verification date

---

## Module 3: Citizen Requests (Tickets)

### Test 3.1: Create New Request
- [ ] Login as resident
- [ ] Navigate to `/requests/new`
- [ ] Select category (e.g., "Pothole Repair")
- [ ] Fill description and location
- [ ] Attach photo/document
- [ ] Submit request
- [ ] Verify success message
- [ ] Verify ticket appears in requests list

### Test 3.2: View Request Details
- [ ] Click on a request in the list
- [ ] Verify details page shows:
  - [ ] Ticket ID
  - [ ] Category
  - [ ] Description
  - [ ] Location (with map)
  - [ ] Current status
  - [ ] Assigned staff member (if applicable)
  - [ ] Comments/updates section
- [ ] Verify can add comments

### Test 3.3: Track Request Status
- [ ] Navigate to `/requests`
- [ ] Verify list shows all requests with status badges
- [ ] Filter by status (Open, In Progress, Resolved, Closed)
- [ ] Verify search by ticket ID works
- [ ] Verify can sort by date/priority

### Test 3.4: Add Comments to Request
- [ ] Open a request detail page
- [ ] Scroll to comments section
- [ ] Add a comment
- [ ] Verify comment appears immediately
- [ ] Verify timestamp is correct

---

## Module 4: Announcements & Events

### Test 4.1: View Announcements
- [ ] Navigate to `/announcements`
- [ ] Verify list shows all announcements
- [ ] Verify each announcement shows:
  - [ ] Title
  - [ ] Date
  - [ ] Department
  - [ ] Preview text
- [ ] Click on announcement to view full content
- [ ] Verify can go back to list

### Test 4.2: View Events
- [ ] Navigate to `/events`
- [ ] Verify list shows all events with:
  - [ ] Event name
  - [ ] Date and time
  - [ ] Location
  - [ ] Organizer
  - [ ] Registration count
- [ ] Filter by date range
- [ ] Search by event name

### Test 4.3: Register for Event
- [ ] Click on an event
- [ ] Click "Register" button
- [ ] Verify success message
- [ ] Verify registration count increases
- [ ] Verify event appears in "My Events" section on dashboard

### Test 4.4: View Event Details
- [ ] Click on registered event
- [ ] Verify shows:
  - [ ] Full description
  - [ ] Date/time/location
  - [ ] Organizer info
  - [ ] Attendee count
  - [ ] "Unregister" button (if registered)

---

## Module 5: Staff Dashboard & Ticket Management

### Test 5.1: Staff Dashboard
- [ ] Login as staff (staff@test.com)
- [ ] Verify dashboard shows:
  - [ ] Assigned tickets count
  - [ ] Pending tickets list
  - [ ] Recent activity
  - [ ] Department info
- [ ] Verify responsive design

### Test 5.2: View Assigned Tickets
- [ ] Navigate to `/staff/tickets`
- [ ] Verify list shows all assigned tickets
- [ ] Filter by status
- [ ] Search by ticket ID or description

### Test 5.3: Update Ticket Status
- [ ] Click on a ticket
- [ ] Change status (e.g., "Open" → "In Progress")
- [ ] Add status update comment
- [ ] Save changes
- [ ] Verify status updated in list view
- [ ] Verify resident receives notification

### Test 5.4: Assign Ticket to Self
- [ ] Click on unassigned ticket
- [ ] Click "Assign to Me"
- [ ] Verify ticket now appears in "My Tickets"
- [ ] Verify can update status

---

## Module 6: Admin Dashboard & Department Management

### Test 6.1: Admin Dashboard
- [ ] Login as admin (admin@test.com)
- [ ] Verify dashboard shows:
  - [ ] Department stats
  - [ ] Ticket metrics
  - [ ] Staff performance
  - [ ] Recent permits
- [ ] Verify all charts render correctly

### Test 6.2: Manage Permits
- [ ] Navigate to `/admin/permits`
- [ ] Verify list shows all department permits
- [ ] Click on permit to review
- [ ] Approve/Reject permit with comment
- [ ] Verify status updated
- [ ] Verify resident receives notification

### Test 6.3: Manage Tickets
- [ ] Navigate to `/admin/tickets`
- [ ] Verify list shows all department tickets
- [ ] Assign ticket to staff member
- [ ] Update ticket status
- [ ] Add internal notes
- [ ] Verify changes reflected in list

### Test 6.4: Manage Staff
- [ ] Navigate to `/admin/staff`
- [ ] Verify list shows all department staff
- [ ] Add new staff member (if available)
- [ ] Edit staff member details
- [ ] Verify changes saved

### Test 6.5: Manage Announcements
- [ ] Navigate to `/admin/announcements`
- [ ] Create new announcement
- [ ] Fill title, content, date
- [ ] Publish announcement
- [ ] Verify appears in resident announcements list
- [ ] Edit announcement
- [ ] Delete announcement

### Test 6.6: Manage Events
- [ ] Navigate to `/admin/events`
- [ ] Create new event
- [ ] Fill event details (name, date, location, description)
- [ ] Publish event
- [ ] Verify appears in resident events list
- [ ] Edit event details
- [ ] Cancel event (if available)

### Test 6.7: Analytics Dashboard
- [ ] Navigate to `/admin/analytics`
- [ ] Verify all charts load:
  - [ ] Total Tickets metric
  - [ ] Resolved metric
  - [ ] Avg Resolution Time
  - [ ] SLA Breach Rate
  - [ ] Tickets by Status chart
  - [ ] Permit Funnel chart
- [ ] Change date range (7, 30, 90 days)
- [ ] Verify charts update
- [ ] Export CSV
- [ ] Verify file downloads

### Test 6.8: SLA Configuration
- [ ] Navigate to `/admin/sla-config`
- [ ] Verify shows current SLA settings
- [ ] Update SLA thresholds (if editable)
- [ ] Verify changes saved

---

## Module 7: SuperAdmin Dashboard & System Management

### Test 7.1: SuperAdmin Dashboard
- [ ] Login as superadmin (superadmin@test.com)
- [ ] Verify dashboard shows:
  - [ ] System-wide stats
  - [ ] All departments overview
  - [ ] System health metrics
- [ ] Verify all widgets render

### Test 7.2: System Analytics
- [ ] Navigate to `/superadmin/analytics`
- [ ] Verify shows city-wide metrics:
  - [ ] Total Tickets
  - [ ] Resolved count
  - [ ] Avg Resolution Time
  - [ ] SLA Breach Rate
  - [ ] Tickets by Status chart
  - [ ] Permit Funnel chart
  - [ ] Top Issues table
- [ ] Change date range
- [ ] Export CSV

### Test 7.3: Manage Departments
- [ ] Navigate to `/superadmin/departments`
- [ ] Verify list shows all departments
- [ ] Click on department to view details
- [ ] Edit department info (if available)
- [ ] View department staff

### Test 7.4: Manage Users
- [ ] Navigate to `/superadmin/users`
- [ ] Verify list shows all users
- [ ] Filter by role
- [ ] Search by email/name
- [ ] View user details
- [ ] Deactivate/activate user (if available)

### Test 7.5: Broadcast Announcements
- [ ] Navigate to `/superadmin/broadcast`
- [ ] Create system-wide announcement
- [ ] Select target audience (all residents, specific department, etc.)
- [ ] Publish announcement
- [ ] Verify appears in all resident announcements

### Test 7.6: Audit Logs
- [ ] Navigate to `/superadmin/audit`
- [ ] Verify shows system activity log
- [ ] Filter by action type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Verify can view details of each action

### Test 7.7: Reports
- [ ] Navigate to `/superadmin/reports`
- [ ] Generate different report types (if available)
- [ ] Verify reports display correctly
- [ ] Export reports

---

## Module 8: Bonus Features

### Test 8.1: Dark Mode
- [ ] Toggle dark mode in settings/profile
- [ ] Verify all pages render correctly in dark mode
- [ ] Verify text contrast is acceptable
- [ ] Verify charts are readable
- [ ] Toggle back to light mode

### Test 8.2: AI Categorization
- [ ] Create a new request with description
- [ ] Verify category is auto-suggested based on description
- [ ] Verify can override suggested category
- [ ] Verify categorization is accurate

### Test 8.3: Map Integration
- [ ] Navigate to request detail page
- [ ] Verify location map displays
- [ ] Verify can interact with map (zoom, pan)
- [ ] Verify location marker is accurate

### Test 8.4: PDF Export
- [ ] Navigate to permit or request detail
- [ ] Click "Export as PDF"
- [ ] Verify PDF downloads
- [ ] Verify PDF contains all relevant information
- [ ] Verify PDF is readable

---

## Module 9: Notifications & Real-time Updates

### Test 9.1: Notifications
- [ ] Login as resident
- [ ] Have staff member update a ticket assigned to resident
- [ ] Verify notification appears in notification center
- [ ] Click notification to navigate to ticket
- [ ] Verify notification marked as read

### Test 9.2: Real-time Updates
- [ ] Open ticket detail in two browser windows
- [ ] Update ticket in one window
- [ ] Verify update appears in other window (if WebSocket implemented)

---

## Module 10: Error Handling & Edge Cases

### Test 10.1: Network Errors
- [ ] Disable network (DevTools)
- [ ] Try to load page
- [ ] Verify error message displayed
- [ ] Re-enable network
- [ ] Verify page loads correctly

### Test 10.2: Invalid Data
- [ ] Try to submit form with invalid email
- [ ] Verify validation error shown
- [ ] Try to submit form with missing required fields
- [ ] Verify validation errors shown

### Test 10.3: Expired Session
- [ ] Login as resident
- [ ] Wait for session to expire (or manually clear token)
- [ ] Try to navigate to protected page
- [ ] Verify redirected to login

### Test 10.4: Concurrent Operations
- [ ] Open same permit in two browser windows
- [ ] Approve permit in one window
- [ ] Try to approve in other window
- [ ] Verify appropriate error handling

---

## Module 11: Performance & Accessibility

### Test 11.1: Page Load Performance
- [ ] Open DevTools Network tab
- [ ] Navigate to each major page
- [ ] Verify First Contentful Paint < 2s
- [ ] Verify Largest Contentful Paint < 3s
- [ ] Verify no console errors

### Test 11.2: Accessibility
- [ ] Use keyboard navigation (Tab, Enter, Escape)
- [ ] Verify all interactive elements are keyboard accessible
- [ ] Verify focus indicators are visible
- [ ] Use screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Verify page structure is logical
- [ ] Verify form labels are associated with inputs

### Test 11.3: Responsive Design
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify layout adapts correctly
- [ ] Verify touch targets are adequate (44px minimum)

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Backend is running and accessible
- [ ] Frontend is running locally or deployed
- [ ] Test user accounts are created
- [ ] Browser DevTools are open
- [ ] Network tab is monitoring requests

### During Testing
- [ ] Document any failures with screenshots
- [ ] Note error messages and stack traces
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on multiple devices (desktop, tablet, mobile)

### Post-Test
- [ ] Compile list of bugs found
- [ ] Prioritize bugs by severity
- [ ] Create GitHub issues for each bug
- [ ] Document any improvements needed

---

## Known Issues & Workarounds

(To be filled in as issues are discovered)

---

## Sign-Off

- [ ] All critical workflows tested
- [ ] All user roles tested
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Accessibility acceptable
- [ ] Ready for production deployment

**Tested By**: _______________
**Date**: _______________
**Notes**: _______________
