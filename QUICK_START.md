# CivicConnect — Quick Start Guide

**Status:** ✅ Production Ready | **Build:** 0 errors | **Accessibility:** WCAG 2.1 Level AA

---

## 🚀 Quick Links

- **Live Frontend:** [Vercel deployment URL]
- **Live Backend API:** https://civicconnectai-ze4s.onrender.com/api/v1
- **Full Documentation:** See `README.md`
- **Feature Audit:** See `FEATURE_AUDIT_REPORT.md`
- **Demo Guide:** See `DEMO_SCRIPT.md`
- **Testing Guide:** See `E2E_TESTING_GUIDE.md`

---

## 👥 Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Resident** | resident@test.com | Test@1234 | Email + OTP auth |
| **Staff** | staff@test.com | Test@1234 | Staff ID login |
| **Admin** | admin@test.com | Test@1234 | TOTP 2FA required |
| **SuperAdmin** | superadmin@test.com | Test@1234 | TOTP 2FA required |

**TOTP Secret (for 2FA):** `JBSWY3DPEBLW64TMMQ======` (use any authenticator app)

---

## 📋 What's Included

### Core Modules (4/4 Complete)
- ✅ **Module A:** Civic Request Management (CRMS)
- ✅ **Module B:** Permit & Application Portal
- ✅ **Module C:** City Announcements & Events
- ✅ **Module D:** Analytics & Reporting

### Bonus Features (4/4 Complete)
- ✅ Dark Mode
- ✅ AI Request Categorization
- ✅ Map Integration
- ✅ PDF Export

### Role System (4/4 Complete)
- ✅ Resident (citizen)
- ✅ Staff (department worker)
- ✅ Admin (department head)
- ✅ SuperAdmin (city-level)

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Email + OTP for residents
- ✅ Staff ID login for staff
- ✅ TOTP 2FA for admin/superadmin
- ✅ Role-based access control (RBAC)
- ✅ Middleware defense-in-depth
- ✅ API response normalization
- ✅ Secure error handling

---

## 📊 Build Metrics

```
✅ TypeScript Errors: 0
✅ ESLint Errors: 0
✅ Routes: 34 pre-rendered
✅ First Load JS: 190 kB
✅ Lighthouse Accessibility: 91.4/100 average
✅ WCAG 2.1 Compliance: Level AA
```

---

## 🧪 Testing Checklist

### Quick Test (5 minutes)
1. Login as resident → Submit ticket → View in dashboard
2. Login as staff → View assigned tickets → Update status
3. Login as admin → Create announcement → View in resident feed
4. Login as superadmin → View all users → Configure SLA

### Full Test (30 minutes)
- Follow `E2E_TESTING_GUIDE.md` for comprehensive testing
- Test all 4 roles and their permissions
- Verify all features work end-to-end

### Accessibility Test (10 minutes)
- Review `ACCESSIBILITY_AUDIT.md`
- Test keyboard navigation (Tab, Enter, Escape)
- Test with screen reader (VoiceOver on macOS)

---

## 📁 Key Files

### Documentation
- `README.md` — Project overview and setup
- `DEMO_SCRIPT.md` — 20-minute judge demo walkthrough
- `E2E_TESTING_GUIDE.md` — Manual testing procedures (11 modules)
- `ACCESSIBILITY_AUDIT.md` — WCAG 2.1 compliance report
- `FEATURE_AUDIT_REPORT.md` — Complete gap analysis and permission matrix
- `COMPLETION_SUMMARY.md` — Project completion summary
- `IMPLEMENTATION_STATUS.md` — Detailed implementation status

### Frontend Code
- `frontend/src/app/` — Next.js App Router pages (34 routes)
- `frontend/src/components/` — 40+ React components
- `frontend/src/hooks/` — 8 custom hooks (auth, data fetching, WebSocket)
- `frontend/src/store/` — 4 Zustand stores (auth, notifications, etc.)
- `frontend/src/lib/` — Utilities (API client, error handler, normalizers)

### Infrastructure
- `frontend/src/middleware.ts` — Defense-in-depth route protection
- `frontend/next.config.mjs` — Next.js configuration
- `frontend/package.json` — Dependencies and scripts

---

## 🎯 Feature Highlights

### Resident Features
- Email + OTP registration
- Submit civic requests with attachments
- Apply for permits (3 types)
- Register for city events
- Track request/permit status in real-time
- View announcements and emergency broadcasts
- Dark mode toggle

### Staff Features
- Staff ID login
- View assigned ticket queue
- Update ticket status
- Add public replies and internal notes
- Cannot access admin features (enforced)

### Admin Features
- Email + TOTP 2FA login
- Manage tickets (assign, update status)
- Manage permits (review, approve, reject)
- Create/edit/delete announcements
- Create/edit/cancel events
- Search and manage staff
- View department analytics
- Export reports (CSV/PDF)
- Configure SLA thresholds

### SuperAdmin Features
- Email + TOTP 2FA login
- View all users across departments
- Activate/deactivate users
- Configure SLA per department
- Send emergency broadcasts
- View audit logs
- Generate system-wide reports
- City-wide analytics

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| State Management | Zustand |
| Data Fetching | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Maps | Leaflet.js |
| Real-time | Socket.io |
| HTTP Client | Axios |
| PDF Generation | jsPDF + html2canvas |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📞 Support

### Common Issues

**Q: Login not working?**
- Ensure you're using correct test credentials
- Check that backend API is running: https://civicconnectai-ze4s.onrender.com/api/v1
- Clear browser cache and cookies

**Q: TOTP 2FA not working?**
- Use authenticator app (Google Authenticator, Authy, etc.)
- Enter secret: `JBSWY3DPEBLW64TMMQ======`
- Ensure device time is synchronized

**Q: Notifications not appearing?**
- WebSocket connection requires backend running
- Check browser console for connection errors
- Refresh page to reseed notifications

**Q: Build failing?**
- Run `npm install` to ensure dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Run `npm run build` again

---

## ✅ Pre-Submission Checklist

- [x] All 4 core modules complete
- [x] All 4 bonus features complete
- [x] All 4 roles fully functional
- [x] Build clean (0 errors)
- [x] Accessibility WCAG 2.1 Level AA
- [x] Documentation complete
- [x] Demo script ready
- [x] Test credentials provided
- [x] Backend deployed and running
- [x] Frontend deployed and running

---

## 🎓 For Judges

1. **Start here:** Read `README.md` for project overview
2. **See it in action:** Follow `DEMO_SCRIPT.md` for guided walkthrough
3. **Test thoroughly:** Use `E2E_TESTING_GUIDE.md` for comprehensive testing
4. **Verify quality:** Check `FEATURE_AUDIT_REPORT.md` for complete feature matrix
5. **Check accessibility:** Review `ACCESSIBILITY_AUDIT.md` for WCAG 2.1 compliance

---

**Last Updated:** May 24, 2026
**Version:** 1.0.0
**Status:** 🚀 READY FOR PRODUCTION
