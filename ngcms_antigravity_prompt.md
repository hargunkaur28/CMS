# NGCMS — Next-Gen College Management System
## Complete Step-by-Step Build Prompt for Antigravity / Claude

---

## PROJECT OVERVIEW

You are building the **Next-Gen College Management System (NGCMS)** — a full-stack, AI-native, multi-tenant SaaS platform for Indian colleges and universities. It combines a complete college ERP (admissions, attendance, exams, fees, HR, library, hostel, placements) with a deeply integrated AI layer (campus LLM, early warning system, agentic workflows). The system must comply with Indian regulatory requirements (NAAC, NBA, NEP 2020, DPDP Act 2023).

Target users: Super Admin, College Admin, Teacher/Faculty, Student, Parent, Librarian, Placement Officer, HR Manager, Finance Officer.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 + Next.js 14 (App Router), TypeScript, TailwindCSS |
| Mobile | React Native + Expo (iOS + Android) |
| API Gateway | Kong / AWS API Gateway |
| Backend (primary) | Node.js with NestJS (microservices) |
| Backend (AI/ML) | Python with FastAPI |
| Database | PostgreSQL 16 (per-service), PgBouncer |
| Cache | Redis Cluster (sessions, hot cache, BullMQ job queue) |
| Search | Elasticsearch (full-text + vector search) |
| Event Bus | Apache Kafka (async inter-service communication) |
| File Storage | AWS S3 / Azure Blob + CloudFront CDN |
| AI/LLM | OpenAI GPT-4o API + Llama 3.1 (on-prem fallback), LangChain/LangGraph |
| ML Models | XGBoost, Random Forest, MLflow, Feast feature store |
| Infrastructure | Kubernetes (EKS/AKS), Helm, Terraform, ArgoCD (GitOps) |
| Observability | OpenTelemetry + Grafana stack (Loki, Tempo, Prometheus), Sentry |
| CI/CD | GitHub Actions → ArgoCD, Playwright E2E tests |
| Auth | JWT + RBAC, MFA (OTP/TOTP), SAML/OAuth SSO |

---

## ARCHITECTURE PRINCIPLES

1. **Multi-tenant SaaS**: Each college is a tenant with isolated data but shared compute. Use row-level security in PostgreSQL with a `tenant_id` on every table.
2. **Microservices**: Each domain (student, admission, exam, finance, library, HR, AI) is a separate NestJS service with its own database. No direct cross-service DB calls.
3. **Event-driven**: All cross-service communication via Kafka events. Example: when attendance is marked, an `attendance.marked` event fires — the early warning service consumes it to update risk scores.
4. **API-first**: Every backend capability is a documented REST API. Frontend and mobile are pure API consumers.
5. **Micro-frontend**: Each module (Admissions, LMS, Exam, Library) is an independently deployable Next.js micro-app under a shell app using Module Federation.
6. **AI-native**: LLM and ML inference are first-class services, not add-ons. The AI layer sits across all modules.

---

## STEP 1: FOUNDATION & INFRASTRUCTURE

### 1.1 Monorepo Setup
```
/apps
  /web-shell         → Next.js shell app (auth, navigation, module host)
  /app-admissions    → Micro-frontend: Admissions module
  /app-academics     → Micro-frontend: Academics, timetable, attendance
  /app-exams         → Micro-frontend: Exam management
  /app-fees          → Micro-frontend: Fees & finance
  /app-library       → Micro-frontend: Library management
  /app-hr            → Micro-frontend: HR & payroll
  /app-placement     → Micro-frontend: Training & placement
  /app-hostel        → Micro-frontend: Hostel management
  /app-lms           → Micro-frontend: LMS & e-learning
  /app-mobile        → React Native app (student + faculty + parent)
  /app-admin-mobile  → React Native app (admin dashboards)
/services
  /auth-service      → JWT, RBAC, MFA, SSO
  /student-service   → Student profiles, SIS
  /admission-service → Enquiry CRM, applications, merit list
  /academic-service  → Courses, timetable, OBE/CBCS, NEP
  /attendance-service→ Multi-mode attendance, reports
  /exam-service      → Offline + online exams, proctoring
  /finance-service   → Fees, payments, accounts
  /library-service   → Books, inventory, issue/return, fines
  /hr-service        → Faculty HR, payroll, leave, appraisal
  /hostel-service    → Rooms, mess, visitors
  /placement-service → Student profiles, drives, offers
  /lms-service       → Courses, content, assignments
  /notification-service → SMS, email, WhatsApp, push
  /ai-service        → LLM orchestration, RAG, agents (Python FastAPI)
  /ml-service        → Predictive models, EWS scoring (Python FastAPI)
  /naac-service      → Compliance, reports, evidence vault
  /analytics-service → BI, dashboards, data warehouse
/packages
  /shared-types      → TypeScript types shared across services
  /shared-ui         → Common UI component library
  /shared-config     → ESLint, Prettier, Tailwind config
/infrastructure
  /terraform         → IaC for AWS/Azure
  /helm-charts       → Kubernetes deployment configs
  /kafka-schemas     → Avro schemas for all Kafka events
```

### 1.2 Database Schema — Core Tables (PostgreSQL)
Every table must have: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `tenant_id UUID NOT NULL`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, `deleted_at TIMESTAMPTZ` (soft delete).

Enable Row Level Security (RLS) on all tables:
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON students
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### 1.3 Auth Service
- JWT access tokens (15 min expiry) + refresh tokens (7 days, stored in Redis)
- Roles: SUPER_ADMIN, COLLEGE_ADMIN, HOD, TEACHER, STUDENT, PARENT, LIBRARIAN, FINANCE_OFFICER, HR_MANAGER, PLACEMENT_OFFICER, EXAM_CONTROLLER
- Permissions: granular, per-module, per-role. Store in `roles_permissions` table.
- MFA: OTP via SMS/email for all admin roles; TOTP (Google Authenticator) for Super Admin
- SSO: SAML 2.0 + OAuth 2.0 (Google, Microsoft)
- Session management: Redis-backed, invalidation on logout from all devices

---

## STEP 2: ADMISSIONS & ENROLLMENT MODULE

### 2.1 Pre-Admission / Enquiry CRM
Build a full CRM for managing prospective student leads.

**Data model:**
```typescript
Enquiry {
  id, tenant_id,
  name, phone, email, whatsapp_number,
  program_interest: string[],
  source: 'WEBSITE' | 'WHATSAPP' | 'SOCIAL' | 'REFERRAL' | 'FAIR' | 'WALK_IN',
  lead_score: number,         // 0-100, AI-computed
  stage: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'APPLIED' | 'ADMITTED' | 'DROPPED',
  assigned_counselor_id,
  interactions: Interaction[], // calls, chats, emails, WhatsApp messages
  created_at, updated_at
}
```

**Features to build:**
- Multi-channel lead capture form (website embed, WhatsApp webhook, social API)
- Lead scoring engine: rule-based first (academic profile + engagement), ML-based later (Phase 3)
- Enquiry pipeline board (Kanban view by stage)
- Interaction log: every call/chat/email/WhatsApp unified under one enquiry
- Automated follow-up sequences: configurable SMS/email/WhatsApp drip campaigns triggered by stage changes
- Campaign ROI dashboard: cost-per-enquiry, cost-per-admission by channel
- Bulk enquiry import (CSV)

### 2.2 Online Application Portal
- Progressive Web App (PWA) — mobile-first
- Dynamic form builder: admin configures fields, eligibility criteria, required documents per program
- Save-and-resume: partial application saved to DB, resume link sent via SMS/email
- Document upload: Cloudinary/S3 for marksheets, identity proof, category certificates
- AI document verification (Phase 2): OCR extracts data, ML validates authenticity and cross-checks with declared data
- Application fee payment: Razorpay integration (UPI, cards, net banking)
- Real-time application status tracker (student-facing)

**Application workflow states:** DRAFT → SUBMITTED → DOCUMENTS_VERIFIED → MERIT_LISTED → COUNSELLING_SCHEDULED → SEAT_ALLOTTED → FEES_PAID → ENROLLED

### 2.3 Merit List & Counselling
- Configurable merit formula: weightages for entrance score, board marks, category, sports quota, NCC, etc.
- Auto-generate merit list with rank computation
- Seat matrix management: program-wise, category-wise seats (General/SC/ST/OBC/EWS)
- Counselling rounds: multiple rounds with waitlist promotion logic
- Document verification checklist at counselling
- Digital admission acceptance form

### 2.4 Enrollment & Onboarding
- Auto-generate Student ID (format configurable per institution)
- Digital ID card: QR code + photo, generated from profile
- Onboarding checklist: remaining documents with deadline alerts
- Auto-trigger welcome email/SMS/WhatsApp with orientation details
- Parent portal activation: link parent to student, set notification preferences
- Course/credit registration for the enrolled program

---

## STEP 3: STUDENT INFORMATION SYSTEM (SIS)

### 3.1 Student Profile (360-degree)
```typescript
Student {
  id, tenant_id, student_id (unique per institution),
  personal: { name, dob, gender, religion, category, aadhaar, apaar_id },
  contact: { phone, email, address, emergency_contact },
  guardian: { father_name, mother_name, guardian_phone, annual_income },
  academic: { program, department, batch, semester, section, roll_number },
  admission: { admission_date, admission_number, application_id },
  documents: Document[],
  academic_history: AcademicRecord[],  // all semesters
  financial_status: { fee_due, scholarships },
  risk_score: number,                  // EWS AI score
  risk_factors: string[],              // SHAP-explained factors
  created_at, updated_at
}
```

- Longitudinal academic timeline (admission to graduation)
- Document repository: upload, categorize, download, share
- UDISE+ / APAAR ID field (India national ID integration)
- Bulk import via CSV with validation
- Student lifecycle tracking: active, on leave, transferred, graduated, dropped
- DPDP Act 2023 compliance: consent management, data minimization, right to erasure

### 3.2 Academic Structure
Build the foundational academic hierarchy that all other modules depend on:
```
Institution → Department → Program → Batch → Semester → Section
                                          ↓
                                     Subject/Course
                                          ↓
                              Faculty Assignment (Teaching Load)
```

- Program and course catalog: create, version, retire
- Curriculum builder: credit structure, electives, mandatory courses per semester
- OBE (Outcome Based Education): define Course Outcomes (CO) and Program Outcomes (PO), map them
- CBCS (Choice Based Credit System): flexible credit management per UGC norms
- NEP 2020 support: multiple entry/exit, Academic Bank of Credits (ABC) integration, FYUP (4-year UG program)

---

## STEP 4: ATTENDANCE MANAGEMENT

### 4.1 Attendance Capture
Support multiple capture modes:
- **Manual**: Teacher marks present/absent per student on web/app
- **Mobile app**: Teacher marks attendance from phone, geotagged (lat/lng stored)
- **Biometric**: Integration API for biometric device push
- **RFID**: Webhook from RFID reader, maps card ID to student
- **Facial recognition**: Phase 3 (computer vision service)

```typescript
AttendanceRecord {
  id, tenant_id,
  student_id, subject_id, faculty_id,
  date, period_number,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY' | 'MEDICAL_LEAVE',
  capture_mode: 'MANUAL' | 'MOBILE' | 'BIOMETRIC' | 'RFID' | 'FACE',
  geo_lat, geo_lng,
  marked_at, marked_by
}
```

### 4.2 Attendance Analytics
- Per-student cumulative attendance % per subject
- Department/class dashboard: real-time view during lectures
- Shortage alerts: auto-notify student + parent (SMS/WhatsApp/push) when attendance drops below threshold (configurable, default 75%)
- Proxy detection: flag attendance patterns that look anomalous (AI Phase 2)
- Monthly/subject-wise reports exportable as Excel/PDF
- Automatic eligibility hold: if attendance < threshold, flag student as ineligible for exam (configurable)

### 4.3 Leave Management
- Student leave application workflow: apply → faculty approval → admin note
- Leave types: medical, personal, on-duty
- Leave reflected in attendance calculation
- Faculty attendance: separate tracking, linked to payroll (handled in HR service)

---

## STEP 5: TIMETABLE ENGINE

This is one of the most complex modules. Build it as a constraint-satisfaction problem solver.

### 5.1 Input Constraints
```typescript
TimetableConstraints {
  faculty_unavailability: { faculty_id, day, periods }[],
  room_capacity: { room_id, capacity, type: 'LECTURE' | 'LAB' | 'SEMINAR' }[],
  subject_requirements: { subject_id, lectures_per_week, lab_per_week, preferred_slot }[],
  working_days: DayOfWeek[],
  periods_per_day: number,
  period_duration_minutes: number,
  lunch_break: { after_period: number },
  consecutive_classes_max: number,    // max back-to-back classes per faculty
}
```

### 5.2 Algorithm
Use a backtracking constraint satisfaction algorithm (or integrate `timefold` / Google OR-Tools via Python service):
1. Sort subjects by constraint complexity (most constrained first)
2. For each subject-batch-faculty combination, find valid time slots
3. Check: room availability, faculty availability, no class overlap for same batch
4. Generate full conflict-free weekly timetable
5. Expose optimization endpoint: `POST /timetable/generate` returns generated timetable

### 5.3 Features
- Conflict detection: highlight any scheduling conflicts
- Substitution management: mark faculty absent → system suggests available substitutes → auto-notify
- Academic calendar: holidays, exam windows, events blocked from timetable
- Manual override: admin can drag-and-drop slots post-generation
- Export: PDF timetable cards per class and per faculty

---

## STEP 6: EXAMINATION & ASSESSMENT

### 6.1 Offline Exam Management
```typescript
Exam {
  id, tenant_id,
  name, type: 'INTERNAL' | 'EXTERNAL' | 'PRACTICAL' | 'VIVA',
  program_id, semester, subject_ids,
  schedule: ExamSlot[],  // date, time, room, invigilators
  hall_ticket_config: HallTicketConfig,
  max_marks, pass_marks, grace_marks_rules,
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'RESULTS_PUBLISHED'
}
```

- Exam schedule creation with academic calendar conflict check
- Question paper management: upload, approval workflow, encryption at rest
- Hall ticket generation: auto-generated PDF with student photo, exam center, QR code
- Seating arrangement engine: auto-assign seats by roll number / category mix
- Room allocation with invigilator assignment
- Barcode/QR tracking of answer sheets (distribution → collection → evaluation)
- Grace marks and ATKT (back-paper) rules engine
- Result processing: marks aggregation, grade calculation (configurable grading scale), credit computation
- Digitally signed marksheets and transcripts (PDF with PKI signature)

### 6.2 Online Examination Engine
- Question bank: tagged by subject, topic, Bloom's taxonomy level, difficulty
- Automated paper generation: configure difficulty distribution (30/50/20), topic coverage, randomization → generate in <10 seconds
- Question types: MCQ, multiple-correct, true/false, match-the-following, fill-in-blank, descriptive (text), file-upload, coding (code execution sandbox)
- Exam delivery: React-based secure exam interface
- Secure browser mode: detect tab switch, copy-paste, screenshot attempts — log all violations
- Low-bandwidth mode: text-only fallback for 2G networks
- Scheduled activation: exam opens automatically at configured time
- Mock test mode: practice exams with instant self-scoring

### 6.3 AI Proctoring Suite (Phase 2)
Via dedicated Python/FastAPI AI service using computer vision:
- Facial recognition login: verify identity at start + random interval re-verification
- Eye gaze tracking: flag repeated off-screen gaze
- Multiple face detection: flag if another person enters frame
- Audio monitoring: ambient sound anomaly detection
- Composite suspicion score (0-100): weighted combination of all signals
- Live monitoring dashboard: invigilator sees all student screens, sorted by suspicion score
- Auto-termination on threshold breach with evidence log (screenshots)
- Post-exam incident report per student

### 6.4 Marks Entry & Results
- Double-entry verification: two faculty enter marks independently; system flags mismatches
- Marks validation: range check, outlier detection
- Grade calculation: configurable grading scale (absolute or relative)
- Result publication: admin publishes → student sees on portal
- Scrutiny/revaluation request workflow

---

## STEP 7: FEES & FINANCE MODULE

### 7.1 Fee Structure Configuration
```typescript
FeeStructure {
  id, tenant_id,
  program_id, academic_year, category,  // fee varies by program + category
  components: FeeComponent[],           // tuition, hostel, library, exam, misc
  installments: Installment[],          // due dates and amounts
  scholarships: ScholarshipRule[],      // eligibility and deduction rules
  late_fine_per_day: number
}
```

### 7.2 Payment Processing
- Razorpay integration: UPI, credit/debit cards, net banking, NEFT/RTGS, QR code
- Split payment and EMI support
- Auto-generated e-receipts (PDF, email, WhatsApp)
- Payment reconciliation: bank statement vs system records auto-matched
- Offline payment entry (cash/DD): manual entry with cashier ID

### 7.3 Financial Management
- Double-entry bookkeeping: journal entries auto-created on every payment
- Chart of accounts: configurable per institution
- Ledger, trial balance, P&L, balance sheet
- Budget allocation per department: track actuals vs budget
- GST-compliant invoicing
- Fee defaulter list: auto-generated with escalation workflow
- Audit trail: every transaction immutable, with user ID and timestamp

---

## STEP 8: LIBRARY MANAGEMENT MODULE

### 8.1 Catalog Management
```typescript
Book {
  id, tenant_id,
  title, author, isbn, publisher, edition, year,
  category_id, subcategory_id,
  total_copies, available_copies,
  cover_image_url,       // Cloudinary
  barcode, rfid_tag,
  location: { rack, shelf, row },
  status: 'ACTIVE' | 'LOST' | 'DAMAGED' | 'WITHDRAWN'
}
```

- Add/edit/delete books with full metadata
- Bulk import via CSV
- Category and subcategory management
- Barcode and RFID tag assignment
- Cover image upload (Cloudinary)
- Integration hooks for national databases: INFLIBNET, DELNET, Shodhganga (Phase 3)
- E-book and e-journal access management with digital rights (DRM)

### 8.2 Circulation System
```typescript
IssueRecord {
  id, tenant_id,
  book_id, member_id, member_type: 'STUDENT' | 'TEACHER',
  issue_date, due_date, return_date,
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST',
  fine_amount, fine_paid,
  issued_by    // librarian ID
}
```

- Issue and return flow with RFID/barcode scanner support
- Online renewal: member can renew from portal before due date (max 2 renewals)
- Hold/reservation queue: if book unavailable, student can place hold → notified when available
- Fine rules: configurable per-day fine; auto-calculate on return; collect via fees module
- Overdue alerts: daily automated notifications to overdue members

### 8.3 Member Portal
- Search by title, author, ISBN, category with full-text search (Elasticsearch)
- Availability status in real-time
- Issued books list with due dates
- Fine status and payment
- Request history
- Book recommendation engine (Phase 3): collaborative filtering based on borrowing history

### 8.4 Library Analytics
- Most borrowed books (trending)
- Usage by category, department, time period
- Member activity reports
- Overdue and fine collection reports
- NAAC-required: total books count, category-wise distribution, student usage data

---

## STEP 9: FACULTY HR & PAYROLL

### 9.1 Employee Profile
```typescript
Faculty {
  id, tenant_id, employee_id,
  personal: { name, dob, gender, aadhaar, pan },
  contact: { phone, email, address },
  academic_qualifications: Qualification[],
  experience: Experience[],
  designation, department, joining_date,
  employment_type: 'PERMANENT' | 'CONTRACT' | 'VISITING' | 'ADHOC',
  publications: Publication[],   // for NAAC: SCOPUS/WoS integration
  awards: Award[],
  service_book: ServiceEntry[]   // complete service history
}
```

- Full HR workflow: job requisition → shortlisting → interview → offer → onboarding
- 360-degree appraisal: self-assessment, peer review, student feedback, HOD review
- API Score calculation (UGC norms for promotion)
- Research tracking: papers, patents, grants, conference presentations
- Training needs identification and CPD (Continuing Professional Development) tracking

### 9.2 Payroll Engine
- CTC components: basic, HRA, DA, TA, medical, special allowances
- Statutory deductions: PF, ESI, professional tax, TDS
- Auto-compute: salary slip from attendance + leave data
- 7th Pay Commission support for government-aided colleges
- Bank transfer file generation (NEFT format)
- Loan and advance management
- Arrear calculation
- MIS: payroll register, department cost, YTD summary

### 9.3 Leave Management
- Leave types: casual leave (CL), earned leave (EL), medical leave (ML), special leave, LWP
- Online application → HOD approval → HR confirmation
- Leave balance tracker, encashment calculation
- Half-day, OD (on-duty), compensatory off workflows
- Faculty attendance linked to payroll deductions

---

## STEP 10: HOSTEL MANAGEMENT

```typescript
HostelRoom {
  id, tenant_id, hostel_id, room_number,
  capacity, type: 'SINGLE' | 'DOUBLE' | 'TRIPLE',
  floor, block, amenities,
  allocated_students: StudentAllocation[]
}
```

- Room/bed allocation with student preferences (single/shared, floor preference)
- Hostel application → waitlist → allotment workflow
- Mess management: menu planning, attendance tracking, billing per head
- Visitor log: digital entry/exit management with purpose
- In-time/out-time tracking for residents
- Maintenance request workflow: raise → assign to warden → resolve
- Hostel fee billing integrated with main fees module
- Warden/proctor access with incident reporting

---

## STEP 11: LEARNING MANAGEMENT SYSTEM (LMS)

### 11.1 Course Content Management
- Rich content types: video (Cloudinary), PDF, slides, SCORM packages, H5P interactive
- Content versioning with rollback
- Live class integration: Zoom/Google Meet/Teams via API webhooks
- Recorded lecture library with auto-generated transcripts (Whisper API) and searchable chapters
- Course progress tracking: completion %, time spent, engagement score per student

### 11.2 Assignments & Collaboration
- Assignment creation: instructions, rubric, due date, file submission types
- Plagiarism check integration (Turnitin API or open-source alternative)
- AI-content detection: flag GPT/Claude-style writing
- Discussion forums, peer review, group projects, wiki pages
- Grade book: centralized marks aggregation across assignments + exams

### 11.3 AI-Powered Personalization (Phase 2+)
- Adaptive content recommendation based on performance gaps
- Concept gap identification: topics where student consistently underperforms
- Auto-quiz generation from lecture transcripts
- Gamification: badges, streaks, leaderboards, XP points
- AI tutoring chatbot: student asks course questions, bot answers using RAG on course materials

---

## STEP 12: TRAINING & PLACEMENT MODULE

### 12.1 Student Placement Profile
```typescript
PlacementProfile {
  student_id, cgpa, backlogs,
  skills: string[], certifications: string[],
  projects: Project[], internships: Internship[],
  resume_url, linkedin_url,
  placement_status: 'ELIGIBLE' | 'APPLIED' | 'PLACED' | 'OPTED_OUT',
  offers: PlacementOffer[]
}
```

- Student resume builder within portal
- Skills and project tracker
- Eligibility management: admin sets criteria per company drive

### 12.2 Campus Drive Management
- Company registration and job posting portal
- Drive scheduling: date, venue, eligible batches, eligibility criteria
- Student application tracking: applied → shortlisted → interviewed → selected
- Offer letter upload and placement confirmation
- Pre-placement talk scheduling

### 12.3 Analytics
- Placement rate by department, program, batch
- Average CTC, highest CTC, top recruiters
- Domain-wise distribution (IT, core, finance, etc.)
- NAAC/NIRF data: employment data for accreditation

### 12.4 Internship Management
- Internship application and placement workflow
- Faculty guide assignment
- Report submission and evaluation
- Internship certificate management

---

## STEP 13: NAAC / ACCREDITATION MODULE

This module aggregates data from all other modules to support NAAC, NBA, AISHE, and NIRF compliance.

### 13.1 NAAC Criterion Mapping
Map data sources to NAAC's 7 criteria:
- **Criterion 1** (Curriculum): OBE data from academic service
- **Criterion 2** (Teaching): Attendance, LMS engagement from attendance + LMS service
- **Criterion 3** (Research): Faculty publications, patents, grants from HR service
- **Criterion 4** (Infrastructure): Library stats from library service; hostel from hostel service
- **Criterion 5** (Student Support): Placements, scholarships, alumni from respective services
- **Criterion 6** (Governance): Admin reports, financial audits from finance service
- **Criterion 7** (Institutional Values): Events, committees from admin module

### 13.2 Evidence Vault
- Document upload: upload evidence files (PDFs, images, Excel) linked to specific criteria/sub-criteria
- Version control: maintain evidence history per submission cycle
- Shareable links for external peer review

### 13.3 Automated Report Generation (AI — Phase 3)
- AI agent collects data from all services → maps to criterion format → drafts SSR (Self Study Report) narrative sections
- Gap analysis: highlights criteria with insufficient evidence
- AISHE data export: annual return filing format
- NIRF/QS/Times HE data compilation

---

## STEP 14: AI LAYER — THREE-TIER ARCHITECTURE

This is the core differentiator. Build as a separate Python/FastAPI service (`ai-service`).

### Tier 1: Campus Private LLM (RAG)
```python
# Architecture
1. Data ingestion pipeline:
   - Collect institution data: policies PDF, course catalog, timetable, FAQs, hostel rules
   - Chunk documents (512 token chunks, 50 token overlap)
   - Embed via OpenAI text-embedding-3-small (or Llama embedding for on-prem)
   - Store in pgvector extension of PostgreSQL (per-tenant vector namespace)

2. Query pipeline:
   - User sends query (via WhatsApp webhook or app chatbot)
   - Embed query → similarity search in pgvector (top-k=5 chunks)
   - Build prompt: system_context + retrieved_chunks + user_query
   - Call GPT-4o (or on-prem Llama 3.1 for data-sensitive institutions)
   - Return response; never include raw student PII in prompt

3. LangChain implementation:
   - Use ConversationalRetrievalChain
   - Maintain conversation memory (Redis-backed, per session)
   - Source citations in every response
```

### Tier 2: Predictive ML Pipeline (Early Warning System)
```python
# Feature engineering (50+ features per student, weekly computation)
Features:
- attendance_pct_last_4_weeks (per subject and overall)
- assignment_submission_rate_last_2_weeks
- lms_login_frequency_last_week
- grade_trajectory (current avg vs semester start avg vs cohort median)
- fee_payment_status (paid on time, overdue, partial)
- campus_card_swipes_per_week (IoT — Phase 4)
- days_since_last_lms_activity

Model: XGBoost + Random Forest ensemble
Training: 3+ years historical data, retrain each semester
Explainability: SHAP values → top 3 contributing factors per student
Output: risk_score (0-100), risk_tier (LOW/MEDIUM/HIGH/CRITICAL), factors[]

Pipeline:
- Apache Spark batch job runs weekly (Sunday midnight)
- Writes risk scores back to student_service DB
- Triggers Kafka event `student.risk_updated`
- Notification service consumes event → sends WhatsApp to high-risk student + advisor
```

### Tier 3: Agentic Task Automation
```python
# LangGraph agents (each is a stateful multi-step workflow)

Agent 1: Admission Agent
  Tools: [check_eligibility, extract_document_data, compute_merit_score, draft_offer_letter]
  Trigger: new application submitted
  Steps: receive → validate docs → check eligibility → merit score → draft offer → HUMAN_CHECKPOINT → send

Agent 2: Fee Collection Agent
  Tools: [get_defaulters, send_reminder, generate_installment_plan, escalate_to_parent]
  Trigger: fee due date passed + unpaid
  Steps: identify defaulters → day 1 reminder → day 7 follow-up → day 15 escalate to parent → day 30 hold services

Agent 3: Timetable Optimizer Agent
  Tools: [get_faculty_availability, get_room_availability, get_curriculum_requirements, generate_schedule, check_conflicts]
  Trigger: semester start / manual trigger by admin
  Natural language override: faculty can request slot changes via chat

Agent 4: NAAC Report Agent
  Tools: [fetch_criterion_data, map_to_naac_format, draft_narrative, flag_gaps]
  Trigger: admin clicks "Draft SSR"
  Output: review-ready SSR draft with gap flags

All agents: run on BullMQ async queue, all actions logged in audit_trail table, human-in-the-loop checkpoint before consequential actions
```

---

## STEP 15: NOTIFICATION & COMMUNICATION HUB

Build a unified notification service that all other services publish to via Kafka.

### 15.1 Channels
- **SMS**: Twilio / MSG91 integration
- **Email**: SendGrid / AWS SES (HTML templates)
- **WhatsApp**: WhatsApp Business API (Meta Cloud API)
- **Push notifications**: Firebase Cloud Messaging (FCM) for mobile apps
- **In-app**: real-time via WebSocket (Socket.io)

### 15.2 Template System
- Template library: pre-built templates for all notification types
- Personalization tokens: `{{student_name}}`, `{{due_date}}`, `{{amount}}`, etc.
- Multi-language: templates in English + Hindi + 8 regional languages
- Scheduled delivery: set send time for announcements
- Delivery tracking: sent/delivered/read status per notification

### 15.3 Key Notification Triggers
| Event | Channel | Recipients |
|---|---|---|
| Attendance below threshold | WhatsApp + Push | Student + Parent |
| Fee due in 3 days | WhatsApp + SMS | Student + Parent |
| Exam hall ticket ready | Push + Email | Student |
| Result published | Push + Email | Student + Parent |
| Book overdue | WhatsApp + Push | Student |
| At-risk flag (EWS) | Push + WhatsApp | Student + Advisor |
| New assignment posted | Push | Student |
| Leave approved/rejected | Push | Faculty |

---

## STEP 16: ANALYTICS & BI PLATFORM

### 16.1 Real-Time Executive Dashboard
Metrics visible to Principal/VC:
- Enrollment funnel (enquiries → applications → admitted → enrolled)
- Fee collection rate (collected vs expected)
- Attendance rate (today's, this week's average)
- At-risk student count (EWS)
- Placement rate (current batch)
- Faculty KPIs (teaching hours, research output)

### 16.2 Operational Dashboards (role-specific)
- HOD dashboard: department-wise attendance, results, faculty load
- Finance officer: fee collection, defaulters, cash flow
- Librarian: daily circulation, overdue, new additions
- Exam controller: upcoming exams, result processing status

### 16.3 Conversational Analytics (Phase 3)
Text-to-SQL engine: admin types natural language queries → system converts to SQL → returns formatted answer.
- Powered by fine-tuned model with schema context
- Example: "Which departments have attendance below 70% this month?" → executes SQL, returns table
- Drill-down: click on result to see underlying data

### 16.4 Data Infrastructure
- Data warehouse: PostgreSQL read replica with materialized views for analytics
- Embedded BI: Apache Superset / Metabase integration for power users
- All reports exportable: CSV, Excel, PDF
- Scheduled reports: configure and auto-email reports daily/weekly/monthly

---

## STEP 17: MOBILE APPLICATIONS

### 17.1 Student App (React Native)
Screens: Home dashboard, Attendance, Timetable, Marks/Results, Fees (with payment), LMS, Assignments, Library, Notifications, AI Chatbot
- Offline mode: timetable and recent marks cached locally, sync on reconnect
- Push notifications for all student events
- Biometric/Face ID login
- QR code scanner for library book check-in (Phase 3)

### 17.2 Faculty App (React Native)
Screens: Today's classes, 1-tap attendance marking, Marks entry, Leave application, Notifications, Student profiles (pre-class view)
- Offline attendance: mark offline, sync when connected
- GPS-tagged attendance marking

### 17.3 Parent App (React Native)
Screens: Child's attendance (real-time), Marks/results, Fee payment, Communication with faculty, Notifications
- WhatsApp-first design: WhatsApp bot handles most interactions without needing the app

### 17.4 Admin App (React Native)
Screens: Executive dashboard, Approvals queue, Key reports, Alert management

---

## STEP 18: INTEGRATION LAYER

### 18.1 REST API Standards
- Versioned: all endpoints under `/api/v1/`
- Documented: OpenAPI 3.0 spec, Swagger UI at `/api/docs`
- Rate-limited: per-tenant, per-endpoint via Kong
- Webhooks: push events to external systems on state changes (configurable endpoint + secret)

### 18.2 Pre-Built Integrations
| Integration | Purpose |
|---|---|
| Razorpay | Fee payments, application fees |
| WhatsApp Business API | Notifications, chatbot, 2-way messaging |
| Zoom / Google Meet / MS Teams | Live classes in LMS |
| Tally ERP | Finance/accounts export |
| DigiLocker | Student document fetch and issuance |
| Aadhaar / UIDAI | Identity verification |
| APAAR | National student ID integration |
| Shodhganga / INFLIBNET | Library national database |
| Whisper API | Audio transcription for LMS lectures |

### 18.3 SSO & Auth Federation
- SAML 2.0: integrate with Google Workspace, Microsoft 365, institution LDAP
- OAuth 2.0: Google, Microsoft login
- LTI 1.3: LMS interoperability with Moodle, Canvas, Blackboard

---

## STEP 19: SECURITY & COMPLIANCE

### 19.1 Security Controls
- RBAC: granular permissions, checked at API gateway + service level
- MFA: mandatory for all admin roles
- AES-256 encryption at rest for all PII
- TLS 1.3 for all data in transit
- Full immutable audit log: every action logged with user_id, tenant_id, ip_address, timestamp, before/after values
- Penetration testing (VAPT) before each major release
- OWASP Top 10 protection: input validation, parameterized queries, CSP headers

### 19.2 Data Privacy (DPDP Act 2023 — India)
- Consent management: explicit consent capture for sensitive data use
- Data minimization: only collect fields needed for specific purpose
- Right to erasure: student can request data deletion after graduation (with retention policy exceptions)
- Data breach notification: automated alert workflow, 72-hour notification SLA
- Grievance officer designation in system

### 19.3 Infrastructure Security
- Data residency: India cloud (AWS Mumbai / Azure India) by default
- VPC isolation: all services in private subnets, only API gateway public
- Automated backups: daily incremental, weekly full, 30-day retention, encrypted
- Secrets management: AWS Secrets Manager / HashiCorp Vault

---

## STEP 20: PHASED BUILD SEQUENCE

### Phase 1 — Core (Months 1–6)
**Build in this order:**
1. Monorepo setup, shared packages, CI/CD pipeline
2. Auth service (JWT, RBAC, MFA)
3. Student SIS (profile, batch, course structure)
4. Admissions module (enquiry CRM, application portal, enrollment)
5. Attendance management (manual + mobile modes)
6. Fees module (structure, payments, receipts)
7. Communication hub (notifications: email, SMS, WhatsApp)
8. Basic admin dashboard
9. Student mobile app (React Native) — attendance, timetable, fees, notifications
10. Faculty mobile app — attendance marking, marks entry

**AI features in Phase 1:**
- WhatsApp admission chatbot (basic FAQ + enquiry capture)
- OCR document verification for applications
- Basic risk score: attendance + grade trigger (rule-based, not ML yet)

---

### Phase 2 — Academics (Months 7–12)
1. Timetable engine (constraint solver)
2. Offline exam management (hall tickets, seating, marks entry, results)
3. Online exam engine (question bank, delivery, secure browser)
4. LMS (content, assignments, live class integration, plagiarism check)
5. Library module (catalog, circulation, fines, member portal)
6. Parent portal activation
7. OBE/CBCS module
8. NAAC basic compliance (data collection, initial reports)

**AI features in Phase 2:**
- AI proctoring suite (computer vision for online exams)
- Lecture auto-summarization + Q&A generation (Whisper + GPT-4o)
- Early Warning System v1 (attendance + grades ML model)
- AI timetable optimizer

---

### Phase 3 — Intelligence (Months 13–18)
1. Campus Private LLM (RAG pipeline, knowledge base ingestion, WhatsApp chatbot)
2. Full analytics platform (conversational BI, Text-to-SQL)
3. Advanced EWS (50-feature ML model, SHAP explainability)
4. Hostel management module
5. Full placement module (drives, analytics, alumni integration)
6. HR module (full payroll, appraisal, service book)
7. NAAC accreditation agent (AI-powered SSR draft generation)
8. Research management module

**AI features in Phase 3:**
- Predictive dropout model (XGBoost ensemble)
- AI-assisted descriptive answer evaluation
- Placement outcome prediction
- Conversational analytics for leadership
- Personalized study roadmap generator

---

### Phase 4 — Innovation (Months 19–24)
1. Agentic workflow automation (all 4 agents: admission, fee, timetable, NAAC)
2. Blockchain credentials (W3C Verifiable Credentials, NAD + DigiLocker integration)
3. IoT smart campus (BLE/UWB attendance, smart classroom controls)
4. Alumni portal (network, donations, mentorship, events)
5. API marketplace (third-party extensions, webhook marketplace)
6. AR/VR integration hooks (virtual lab embedding)
7. Advanced BI (Apache Superset embedded, power user analytics)

**AI features in Phase 4:**
- Autonomous admission, fee, and accreditation agents
- AI counselor with voice (multilingual: Hindi + 8 regional languages)
- Predictive faculty workload optimization
- AR campus tour for prospective students

---

## KEY SUCCESS METRICS (KPIs TO BUILD TRACKING FOR)

| Domain | Metric | Target |
|---|---|---|
| Admissions | Lead-to-enrollment conversion | 15–20% (from 8–12%) |
| Admissions | Application to offer letter time | < 2 days (from 7–14 days) |
| Student Success | At-risk students identified before mid-sem | > 85% (EWS AI) |
| Student Success | Dropout rate reduction | 10–15% |
| Examination | Exam to result publication | < 5 days (from 15–30 days) |
| Finance | Fee defaulter reduction | 30% |
| HR | Payroll processing time | < 4 hours (from 3–5 days) |
| Accreditation | NAAC prep time | < 50 hours (from 500+ hours) |
| Support | Enquiries resolved by AI chatbot | > 75% |
| Platform | System uptime | > 99.9% SLA |

---

## ETHICAL AI GUIDELINES TO IMPLEMENT

1. **Transparency**: every AI-generated flag must show contributing factors (SHAP values in EWS, source citations in chatbot)
2. **Human-in-the-loop**: no consequential AI action (offer letter, exam termination, scholarship eligibility) executes without human approval
3. **Fairness auditing**: run quarterly bias audits on ML models across gender, category (SC/ST/OBC), geography
4. **Data minimization**: student financial data never used to train academic performance models
5. **Privacy by design**: student PII never sent to external LLM APIs; all AI inference in institution's cloud tenant
6. **Right to explanation**: any student flagged by AI can request plain-language explanation + human review
7. **DPDP Act 2023**: consent management, grievance officer, 72-hour breach notification

---

*End of NGCMS Antigravity Build Prompt — Version 1.0 — March 2026*
