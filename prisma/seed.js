require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const crypto = require('crypto');

const prisma = new PrismaClient();
const ROUNDS = 12;

// AES encryption for TOTP (mirrors auth.controller.js)
const ALGO = 'aes-256-cbc';
function getKey() { return crypto.scryptSync(process.env.JWT_SECRET || 'seed-secret-key-32-chars-minimum!', 'civicconnect-salt', 32); }
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

async function main() {
  console.log('[seed] Seeding CivicConnect database...');

  // -- Departments ------------------------------------------
  const [infra, permits, safety] = await Promise.all([
    prisma.department.upsert({
      where: { code: 'INF' },
      update: {},
      create: { name: 'Infrastructure', code: 'INF', description: 'Roads, utilities, street lighting, and public works.', slaConfig: { low: 72, medium: 48, high: 24, emergency: 4 } },
    }),
    prisma.department.upsert({
      where: { code: 'PER' },
      update: {},
      create: { name: 'Permits & Licensing', code: 'PER', description: 'Construction permits, business licenses, and event approvals.', slaConfig: { low: 72, medium: 48, high: 24, emergency: 4 } },
    }),
    prisma.department.upsert({
      where: { code: 'SAF' },
      update: {},
      create: { name: 'Public Safety', code: 'SAF', description: 'Emergency response, law enforcement support, and public safety.', slaConfig: { low: 48, medium: 24, high: 8, emergency: 2 } },
    }),
  ]);
  console.log('[seed] Departments created');

  // -- Ticket sequences -------------------------------------
  for (const code of ['INF', 'PER', 'SAF']) {
    await prisma.ticketSequence.upsert({
      where: { departmentCode: code },
      update: {},
      create: { departmentCode: code, year: 2026, lastSeq: 0 },
    });
  }
  console.log('[seed] Ticket sequences initialized');

  // -- Super Admin -------------------------------------------
  const superAdminHash = await bcrypt.hash('SuperAdmin@2026', ROUNDS);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@civicconnect.city' },
    update: {},
    create: { fullName: 'Super Administrator', email: 'superadmin@civicconnect.city', passwordHash: superAdminHash, role: 'super_admin', otpVerified: true, isActive: true },
  });
  console.log('[seed] Super Admin: superadmin@civicconnect.city / SuperAdmin@2026');

  // -- Dept Admins -------------------------------------------
  const adminPass = await bcrypt.hash('Admin@2026', ROUNDS);
  const totpSecret = speakeasy.generateSecret({ length: 20 });
  const encryptedSecret = encrypt(totpSecret.base32);

  const [infraAdmin, permitsAdmin, safetyAdmin] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin.infra@civicconnect.city' },
      update: {},
      create: { fullName: 'Khalid Mahmood', email: 'admin.infra@civicconnect.city', passwordHash: adminPass, role: 'dept_admin', departmentId: infra.id, otpVerified: true, isActive: true, totpSecret: encryptedSecret, totpEnabled: true },
    }),
    prisma.user.upsert({
      where: { email: 'admin.permits@civicconnect.city' },
      update: {},
      create: { fullName: 'Sara Ahmed', email: 'admin.permits@civicconnect.city', passwordHash: adminPass, role: 'dept_admin', departmentId: permits.id, otpVerified: true, isActive: true, totpSecret: encryptedSecret, totpEnabled: true },
    }),
    prisma.user.upsert({
      where: { email: 'admin.safety@civicconnect.city' },
      update: {},
      create: { fullName: 'Omar Farooq', email: 'admin.safety@civicconnect.city', passwordHash: adminPass, role: 'dept_admin', departmentId: safety.id, otpVerified: true, isActive: true, totpSecret: encryptedSecret, totpEnabled: true },
    }),
  ]);
  console.log('[seed] Dept Admins created (password: Admin@2026)');
  console.log('[seed] TOTP Secret (all admins): ' + totpSecret.base32);
  console.log('[seed] TOTP OTPAuth URL: ' + totpSecret.otpauth_url);

  // -- Staff -------------------------------------------------
  const staffPass = await bcrypt.hash('Staff@2026', ROUNDS);
  const staffData = [
    { fullName: 'Bilal Hassan', email: 'staff1.infra@civicconnect.city', departmentId: infra.id },
    { fullName: 'Nadia Iqbal', email: 'staff2.infra@civicconnect.city', departmentId: infra.id },
    { fullName: 'Tariq Mehmood', email: 'staff1.permits@civicconnect.city', departmentId: permits.id },
    { fullName: 'Hina Baig', email: 'staff2.permits@civicconnect.city', departmentId: permits.id },
    { fullName: 'Asad Raza', email: 'staff1.safety@civicconnect.city', departmentId: safety.id },
    { fullName: 'Zara Khan', email: 'staff2.safety@civicconnect.city', departmentId: safety.id },
  ];

  const staffUsers = [];
  for (const s of staffData) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, passwordHash: staffPass, role: 'staff', otpVerified: true, isActive: true },
    });
    staffUsers.push(u);
  }
  console.log('[seed] Staff created (password: Staff@2026)');

  // -- Residents ---------------------------------------------
  const residentPass = await bcrypt.hash('Resident@2026', ROUNDS);
  const residentData = [
    { fullName: 'Ayesha Tariq', email: 'ayesha@example.com' },
    { fullName: 'Usman Ali', email: 'usman@example.com' },
    { fullName: 'Fatima Malik', email: 'fatima@example.com' },
    { fullName: 'Ahmed Siddiqui', email: 'ahmed@example.com' },
    { fullName: 'Sana Butt', email: 'sana@example.com' },
    { fullName: 'Hamza Sheikh', email: 'hamza@example.com' },
    { fullName: 'Mariam Qureshi', email: 'mariam@example.com' },
    { fullName: 'Faisal Nawaz', email: 'faisal@example.com' },
    { fullName: 'Rabia Hussain', email: 'rabia@example.com' },
    { fullName: 'Imran Chaudhry', email: 'imran@example.com' },
  ];

  const residents = [];
  for (const r of residentData) {
    const u = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { ...r, passwordHash: residentPass, role: 'resident', otpVerified: true, isActive: true },
    });
    residents.push(u);
  }
  console.log('[seed] Residents created (password: Resident@2026)');

  // -- Tickets -----------------------------------------------
  const ticketDefs = [
    { dept: infra, deptCode: 'INF', title: 'Broken street light on Canal Road', description: 'The street light near F-7 sector has been non-functional for 3 days causing safety hazards at night.', category: 'street_lighting', priority: 'medium', status: 'submitted', residentIdx: 0 },
    { dept: infra, deptCode: 'INF', title: 'Pothole on Main Boulevard', description: 'Large pothole near the main intersection causing vehicle damage and traffic slowdowns.', category: 'road_maintenance', priority: 'high', status: 'in_progress', residentIdx: 1, assigneeIdx: 0 },
    { dept: infra, deptCode: 'INF', title: 'Water pipe burst near G-9', description: 'Water pipe has burst and is flooding the street. Immediate repair needed.', category: 'water_supply', priority: 'emergency', status: 'assigned', residentIdx: 2, assigneeIdx: 1 },
    { dept: infra, deptCode: 'INF', title: 'Garbage not collected for 5 days', description: 'Garbage collection has been missed for the past 5 days in our sector.', category: 'sanitation', priority: 'medium', status: 'resolved', residentIdx: 3 },
    { dept: infra, deptCode: 'INF', title: 'Damaged footpath near school', description: 'The footpath near the primary school is severely damaged and poses a risk to children.', category: 'footpath', priority: 'low', status: 'under_review', residentIdx: 4 },
    { dept: infra, deptCode: 'INF', title: 'Sewage overflow in residential area', description: 'Sewage is overflowing onto the street creating health hazards for residents.', category: 'sewage', priority: 'high', status: 'closed', residentIdx: 5 },
    { dept: safety, deptCode: 'SAF', title: 'Stray dogs in park area', description: 'Multiple aggressive stray dogs have been spotted in the public park near Block C.', category: 'animal_control', priority: 'medium', status: 'submitted', residentIdx: 6 },
    { dept: safety, deptCode: 'SAF', title: 'Illegal parking blocking fire exit', description: 'Vehicles are regularly parked blocking the fire exit of the community center.', category: 'traffic_violation', priority: 'high', status: 'in_progress', residentIdx: 7, assigneeIdx: 4 },
    { dept: permits, deptCode: 'PER', title: 'Unauthorized construction next door', description: 'Neighbor has started construction without visible permits. Noise and dust affecting residents.', category: 'illegal_construction', priority: 'medium', status: 'under_review', residentIdx: 8 },
    { dept: permits, deptCode: 'PER', title: 'Business operating without license', description: 'A new restaurant opened without displaying any business license. Possible health code violations.', category: 'business_compliance', priority: 'low', status: 'submitted', residentIdx: 9 },
  ];

  const allStaff = [...staffUsers];
  for (let i = 0; i < ticketDefs.length; i++) {
    const def = ticketDefs[i];
    const seq = i + 1;
    const ticketNumber = `${def.deptCode}-2026-${String(seq).padStart(5, '0')}`;
    const slaHours = def.dept.slaConfig[def.priority] || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000 * (def.status === 'resolved' || def.status === 'closed' ? -2 : 1));

    await prisma.ticketSequence.update({ where: { departmentCode: def.deptCode }, data: { lastSeq: seq } });

    const ticket = await prisma.ticket.upsert({
      where: { ticketNumber },
      update: {},
      create: {
        ticketNumber, title: def.title, description: def.description, category: def.category,
        priority: def.priority, status: def.status, location: 'Islamabad, Pakistan',
        departmentId: def.dept.id, residentId: residents[def.residentIdx].id,
        assignedTo: def.assigneeIdx !== undefined ? allStaff[def.assigneeIdx].id : null,
        slaDeadline,
      },
    });

    await prisma.ticketStatusHistory.upsert({
      where: { id: ticket.id },
      update: {},
      create: { id: ticket.id, ticketId: ticket.id, toStatus: 'submitted', changedBy: residents[def.residentIdx].id, note: 'Ticket submitted' },
    }).catch(() => {});
  }
  console.log('[seed] 10 tickets created');

  // -- Permit Applications -----------------------------------
  const permitDefs = [
    { applicantIdx: 0, type: 'construction_permit', status: 'draft', formData: { area_sqft: 1200, project_type: 'residential' } },
    { applicantIdx: 1, type: 'event_permit', status: 'submitted', formData: { crowd_size_category: 'medium', event_name: 'Community Eid Gathering' } },
    { applicantIdx: 2, type: 'business_license_renewal', status: 'document_verification', formData: { business_name: 'Fatima Bakery', registration_number: 'BUS-2024-001' } },
    { applicantIdx: 3, type: 'construction_permit', status: 'field_inspection_scheduled', formData: { area_sqft: 800, project_type: 'commercial' } },
    { applicantIdx: 4, type: 'event_permit', status: 'rejected', formData: { crowd_size_category: 'large', event_name: 'Music Festival' } },
    { applicantIdx: 5, type: 'business_license_renewal', status: 'approved', formData: { business_name: 'Hamza Electronics', registration_number: 'BUS-2023-045' } },
  ];

  for (const def of permitDefs) {
    const fee = def.type === 'construction_permit' ? 5000 + Math.floor((def.formData.area_sqft || 0) / 100) * 500
              : def.type === 'event_permit' ? ({ small: 2000, medium: 5000, large: 10000 }[def.formData.crowd_size_category] || 5000)
              : 3500;

    await prisma.permitApplication.create({
      data: {
        applicantId: residents[def.applicantIdx].id,
        permitType: def.type,
        status: def.status,
        formData: def.formData,
        feeAmount: fee,
        submittedAt: def.status !== 'draft' ? new Date() : null,
        rejectionReason: def.status === 'rejected' ? 'Event size exceeds permitted limits for this zone.' : null,
      },
    });
  }
  console.log('[seed] 6 permit applications created');

  // -- Announcements -----------------------------------------
  const announcementDefs = [
    { authorId: infraAdmin.id, title: 'Scheduled Water Outage - Sector F-7', body: 'Water supply will be interrupted on May 15, 2026 from 8 AM to 2 PM for maintenance work. Please store water in advance.', category: 'infrastructure', priority: 'urgent', departmentId: infra.id },
    { authorId: safetyAdmin.id, title: 'Emergency: Gas Leak Reported in G-9', body: 'A gas leak has been reported in the G-9 sector. Residents are advised to evacuate immediately and call emergency services.', category: 'emergency', priority: 'emergency', isEmergency: true },
    { authorId: permitsAdmin.id, title: 'New Business License Renewal Process', body: 'Starting June 1, 2026, all business license renewals must be submitted through the CivicConnect portal. Physical submissions will no longer be accepted.', category: 'general', priority: 'normal', departmentId: permits.id },
    { authorId: superAdmin.id, title: 'City Cleanliness Drive - May 20', body: 'Join us for the annual city cleanliness drive on May 20, 2026. Volunteers are welcome. Meet at City Hall at 7 AM.', category: 'culture', priority: 'normal', isArchived: true },
  ];

  for (const def of announcementDefs) {
    await prisma.announcement.create({ data: { ...def, isEmergency: def.isEmergency || false, isArchived: def.isArchived || false } });
  }
  console.log('[seed] 4 announcements created');

  // -- Events ------------------------------------------------
  const eventDefs = [
    { createdBy: infraAdmin.id, departmentId: infra.id, title: 'Town Hall: Infrastructure Development Plan 2026', description: 'Join us to discuss the upcoming infrastructure projects and share your feedback.', category: 'infrastructure', eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), location: 'City Hall, Islamabad', capacity: 200 },
    { createdBy: safetyAdmin.id, departmentId: safety.id, title: 'Community Safety Workshop', description: 'Learn about emergency preparedness, fire safety, and first aid basics.', category: 'health', eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), location: 'Community Center, F-7', capacity: 50 },
    { createdBy: superAdmin.id, title: 'Annual Cultural Festival', description: 'Celebrate the diversity of our city with food, music, and art from all communities.', category: 'culture', eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), location: 'Fatima Jinnah Park', capacity: 1000 },
  ];

  const createdEvents = [];
  for (const def of eventDefs) {
    const ev = await prisma.event.create({ data: def });
    createdEvents.push(ev);
  }

  // Fill the safety workshop registrations
  const safetyWorkshop = createdEvents[1];
  for (let i = 0; i < Math.min(residents.length, safetyWorkshop.capacity); i++) {
    await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: safetyWorkshop.id, userId: residents[i].id } },
      update: {},
      create: { eventId: safetyWorkshop.id, userId: residents[i].id },
    });
  }
  console.log('[seed] 3 events created (1 upcoming, 1 full, 1 past)');

  console.log('\n[seed] Seed complete! Summary:');
  console.log('   Super Admin:  superadmin@civicconnect.city / SuperAdmin@2026');
  console.log('   Dept Admins:  admin.infra@civicconnect.city / Admin@2026  (2FA enabled)');
  console.log('                 admin.permits@civicconnect.city / Admin@2026  (2FA enabled)');
  console.log('                 admin.safety@civicconnect.city / Admin@2026  (2FA enabled)');
  console.log('   Staff:        staff1.infra@civicconnect.city / Staff@2026  (and 5 more)');
  console.log('   Residents:    ayesha@example.com / Resident@2026  (and 9 more)');
  console.log('   TOTP Secret:  ' + totpSecret.base32);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
