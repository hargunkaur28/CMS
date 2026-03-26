# NGCMS — UI Design Prompt for Google Stitch
## Next-Gen College Management System — Complete Interface Design

---

## PROJECT BRIEF

Design the complete user interface for **NGCMS (Next-Gen College Management System)** — a modern, AI-native college ERP platform built for Indian colleges and universities. The system serves 8 distinct user types across web (desktop/tablet) and mobile (iOS/Android) surfaces.

**Design philosophy:** Clean, data-dense but not overwhelming. Professional institutional software that feels modern — not a legacy ERP. Inspired by Linear, Notion, and Vercel dashboard aesthetics. Every screen must work on both a 14-inch laptop and a 6-inch Android phone.

**Color palette:**
- Primary: `#1A1A2E` (deep navy) — headers, primary actions
- Accent: `#4F46E5` (indigo) — active states, CTAs, highlights
- Success: `#10B981` (emerald) — positive metrics, present/paid states
- Warning: `#F59E0B` (amber) — alerts, overdue, at-risk
- Danger: `#EF4444` (red) — critical alerts, absent, defaulter
- Background: `#F8FAFC` (cool white) — page background
- Card: `#FFFFFF` — card surfaces
- Text primary: `#0F172A`, secondary: `#64748B`, tertiary: `#CBD5E1`

**Typography:** DM Sans (headings, labels) + Inter (body text, data tables)

**Design tokens:**
- Border radius: 8px (cards), 6px (buttons, inputs), 4px (badges), 16px (modals)
- Shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` (card shadow)
- Spacing unit: 4px base (use multiples: 8, 12, 16, 24, 32, 48)

---

## SCREEN 1: SHELL APP — NAVIGATION & LAYOUT

### 1.1 Global Shell Layout (Desktop)
Design a persistent sidebar navigation shell that wraps all modules.

**Left sidebar (240px wide, collapsible to 64px icon-only mode):**
- Top: Institution logo + name (truncated) + small chevron to collapse
- Below logo: Global search bar with `⌘K` shortcut hint — searches across students, books, exams, fees in real-time
- Navigation sections with section labels:
  - **Academic**: Dashboard, Admissions, Students, Timetable, Attendance, Exams, LMS
  - **Operations**: Fees & Finance, Library, Hostel, Training & Placement
  - **People**: Faculty & HR, Communication
  - **Intelligence**: Analytics, AI Assistant, NAAC Reports
  - **Settings**: System Settings, Roles & Permissions
- Each nav item: 20px icon + label + optional badge (unread counts, pending approvals)
- Active state: indigo background pill, white text
- Bottom: User avatar + name + role badge + logout

**Top bar (full width, 56px height):**
- Breadcrumb: Module > Section > Current page
- Right side: Notification bell (with count badge) + AI Assistant floating button (sparkle icon) + user avatar

**Main content area:** Full remaining width, `#F8FAFC` background, 24px padding

**Right panel (optional, slides in):** Contextual detail panel — student profile, book details, notification history. Appears as 360px overlay panel without full page navigation.

### 1.2 Mobile Bottom Navigation
5-tab bottom navigation bar for all mobile apps:
- Student app tabs: Home, Attendance, Timetable, Fees, More
- Faculty app tabs: Home, Mark Attendance, Classes, Marks, More
- Parent app tabs: Child, Attendance, Results, Fees, Messages
- Active tab: indigo icon + label, inactive: gray

---

## SCREEN 2: ROLE-SPECIFIC HOME DASHBOARDS

### 2.1 Principal / VC Executive Dashboard
Full-page dashboard showing institution health at a glance.

**Layout:** 3 rows

**Row 1 — Hero KPI cards (4 cards, equal width):**
Each card: large number, trend arrow, subtitle, sparkline (7-day mini chart)
- Total enrollment: `2,847` students, `↑ 12%` vs last year
- Today's attendance: `78.4%` overall, color-coded (green if >75%, amber if 70-75%, red if <70%)
- Fee collection: `₹ 1.24 Cr` this month, progress bar showing % of target
- Active at-risk students: `47` flagged by AI, red badge

**Row 2 — Three panels side by side:**
- Enrollment funnel (horizontal bar chart): Enquiries 1,240 → Applications 892 → Admitted 634 → Enrolled 521
- Department attendance heatmap: grid of departments × days, color intensity = attendance %, click to drill down
- Recent activity feed: last 10 system events (admission approved, fee paid, result published, etc.)

**Row 3 — Two panels:**
- AI Early Warning: List of top 10 at-risk students with risk tier badges (CRITICAL/HIGH/MEDIUM), contributing factors as small tags (`Low attendance`, `Missed assignments`, `Fee overdue`). "View all 47" link.
- Placement snapshot: Placed: 312 (62%), Avg CTC: ₹4.2 LPA, Top recruiters: TCS, Infosys, Wipro

**Floating AI button (bottom-right):** Sparkle icon + "Ask anything" label. Opens a chat drawer where the principal can type: "Which departments have attendance below 70% this week?" and get instant answers.

---

### 2.2 Student Home Dashboard
Mobile-first card layout.

**Top section:**
- Greeting: "Good morning, Priya 👋"
- Quick stats row (3 small cards): Attendance `82%` | CGPA `7.4` | Fee due `₹ 12,000`

**Today's schedule card:**
Timeline of today's classes:
```
09:00 AM  Data Structures (CS-301)      Room 204    [Ongoing - tap to join notes]
11:00 AM  Engineering Maths             Room 106    [Upcoming]
02:00 PM  DBMS Lab                      Lab 3       [Upcoming]
```

**Quick action buttons row:** Mark Attendance | Pay Fees | View Results | Library | AI Assistant

**Recent notifications list:** Last 5 notifications with icons, titles, timestamps

**Assignment due soon:** Banner card if any assignment due in 48 hours: orange border, assignment name, course, "Submit now" button

---

### 2.3 Faculty Home Dashboard

**Top:** Today's teaching schedule (timeline view, same as student but from faculty perspective with student count per class)

**Pending actions:** Red-bordered section — unmarked attendance (2 classes), ungraded assignments (15 submissions), leave requests pending (1)

**My students at risk:** 3-4 student cards with risk score and primary risk factor. "Take action" button per student.

**Class performance snapshot:** Subject-wise average marks bar chart for their assigned subjects

---

### 2.4 Admin Operational Dashboard

**Layout:** 4 KPI cards at top + 2 panels below

KPI cards: Pending Admissions, Today's Fee Collections, Pending Approvals (leave, documents), Open Maintenance Requests

Bottom: Recent admissions pipeline status (Kanban mini-view) + System alerts (overdue books count, at-risk students, low stock alerts)

---

## SCREEN 3: ADMISSIONS MODULE

### 3.1 Enquiry CRM — Pipeline View
Kanban board with columns: New → Contacted → Qualified → Applied → Admitted → Enrolled → Dropped

Each enquiry card:
- Student name + program interest tag
- Source badge (WhatsApp icon / Website / Fair)
- Lead score pill (color-coded: green >70, amber 40-70, red <40)
- Assigned counselor avatar
- Days in current stage
- Quick action: call icon, WhatsApp icon

**Right panel on card click:** Full enquiry detail — interaction history (chat bubbles), documents, stage change button, assign counselor dropdown, add note

**Top bar:** Filters (program, source, counselor), date range, search, "Add Enquiry" button, "Import CSV" button

### 3.2 Application Portal (Student-facing PWA)
Multi-step form with progress stepper at top:
`Personal Info → Academic Info → Documents → Program Selection → Pay Fee → Review → Submit`

Each step: clean card, large input fields, clear labels, inline validation errors in red below each field

Document upload step: drag-and-drop upload zone per document type, show thumbnail on upload, AI verification status badge (`Verified ✓` in green or `Review needed ⚠` in amber)

Payment step: Razorpay embedded checkout, or UPI QR code option

Confirmation screen: success animation, application number prominently displayed, WhatsApp notification confirmation

### 3.3 Merit List Generator
Table view with columns: Rank | Student Name | Program | Board % | Entrance Score | Category | Merit Score | Status (Shortlisted/Waitlisted/Not Selected)

Filters: program, category, score range
Actions: Download Merit List (PDF/Excel), Promote Waitlist, Send Notifications

### 3.4 Counselling Management
Seat matrix table: Program × Category (General/SC/ST/OBC/EWS) showing Total Seats / Filled / Vacant

Schedule counselling rounds with date, time, mode (online/offline)

---

## SCREEN 4: STUDENT MANAGEMENT (SIS)

### 4.1 Student List View
Full-page data table:
- Columns: Photo | Student ID | Name | Program | Batch | Semester | Attendance % | Fee Status | Risk Status
- Row-level color coding: red left border for CRITICAL risk, amber for HIGH risk
- Fee status badge: Paid (green), Partially Paid (amber), Overdue (red)
- Click row → opens student profile right panel (or full page)
- Top: Search bar + filters (department, batch, program, risk tier) + "Add Student" + "Bulk Import" buttons
- Bottom: Pagination + records per page

### 4.2 Student Profile — 360° View
Full-page layout with left sidebar tabs and right content area.

**Left sidebar tabs (with icons):**
Overview | Academic | Attendance | Fees | Library | Hostel | Placement | Documents | Activity Log

**Overview tab content:**
- Profile header: large photo, name, student ID, program badge, batch badge, enrollment status
- Contact info grid: phone, email, parent contact, address
- Risk score card (if at risk): large score number + gauge chart + contributing factors list as tags with percentage contribution (SHAP)
- Quick stats: Attendance %, Current CGPA, Fee outstanding, Books issued

**Academic tab:** Semester-wise marks table, GPA trend line chart, CO/PO attainment meters, backlogs list

**Attendance tab:** Monthly calendar heat-map (green = present, red = absent, amber = late), subject-wise attendance bar chart, leave history

**Fees tab:** Fee structure breakdown table, payment history timeline, outstanding amount with "Send Reminder" button, generate statement button

---

## SCREEN 5: ATTENDANCE MODULE

### 5.1 Teacher — Mark Attendance (Mobile-first)
Single screen: class selected at top (dropdown or auto-detected from timetable)

Below class info: date + period + subject

Main content: scrollable student list
- Each row: student photo (small) + name + roll number + toggle (Present/Absent/Late/On-Duty)
- Default: all Present (bulk mark default saves time)
- At the bottom: "Mark All Present" shortcut + Submit button
- After submit: confirmation with summary (28 present, 3 absent, 1 late) and notification sent confirmation

**Visual design note:** Make absent toggle red, present green, late amber — clear at a glance

### 5.2 Admin Attendance Dashboard
Main view: department × subject attendance grid (heatmap)
- Each cell: attendance percentage, color-coded
- Click cell → drill down to class-level list
- Shortage alerts section: list of students below threshold with days remaining before exam ineligibility
- Filter: date range, department, program, batch

---

## SCREEN 6: TIMETABLE

### 6.1 Timetable View (Student + Faculty)
Weekly grid view (Mon–Sat × periods)

Each cell shows: Subject name (truncated) + Room number, color-coded by subject (consistent color per subject)

**Toggle views:** Weekly / Daily / Monthly

**Faculty timetable extras:** Teaching load summary (total hours/week), substitution requests

### 6.2 Admin Timetable Generator
Split screen:
- Left: Configuration panel — select program, batch, semester; set constraints (faculty preferences, room availability)
- Right: Generated timetable grid (blank initially)

"Generate Timetable" button → progress animation → result appears in right panel
Conflict warnings shown as red cells with tooltip explanation
Manual drag-and-drop to adjust slots
"Publish" button makes it live to students and faculty

---

## SCREEN 7: EXAMINATION MODULE

### 7.1 Exam Schedule Management
Card grid of exams: each card shows exam name, program, date range, status badge (Scheduled/Ongoing/Completed)

Create exam: multi-step form: Exam details → Subject schedule → Room allocation → Invigilator assignment → Hall ticket config → Review

### 7.2 Hall Ticket (Student view)
Clean printable design:
- Institution header with logo
- Student photo (right-aligned)
- Student details: name, ID, program, semester, roll number
- Exam schedule table: Subject | Date | Time | Room | Seat Number
- QR code bottom-right for verification
- Important instructions
- Principal's digital signature

### 7.3 Seating Arrangement View
Grid of rooms, each room shows a seating chart (row × column) with student names/roll numbers assigned. Print-ready view.

### 7.4 Online Exam Interface (Student)
Clean full-screen layout (no distractions):
- Left panel (280px): question navigator — numbered grid, color-coded (unattempted white, attempted green, marked-for-review amber)
- Center: question text (large, readable), answer options as large clickable cards
- Top bar: exam name, timer (countdown), question X of Y, pause indicator (if proctoring active: green dot "Proctoring Active")
- Bottom bar: Previous | Flag for Review | Next | Submit Exam

**Proctoring indicator:** small camera preview (bottom-left, 80×60px) with green border (ok) or amber pulsing border (anomaly detected)

### 7.5 Marks Entry (Faculty)
Spreadsheet-like table: students as rows, marks as editable cells
- Validation: marks cannot exceed max_marks, instant red highlight on invalid entry
- Dual-entry mode: show comparison column if another faculty has already entered marks
- Bulk import marks via CSV option
- Save progress (auto-save every 30 seconds)
- Submit button (final, with confirmation dialog)

---

## SCREEN 8: FEES & FINANCE MODULE

### 8.1 Fee Collection Dashboard (Finance Officer)
Top KPI row: Today's collection | This month | Pending dues | Defaulters count

Main table: student-wise fee status
Columns: Student | Program | Total Fee | Paid | Outstanding | Last Payment | Status badge

Quick actions per row: Send reminder (WhatsApp icon), View receipt, Collect cash

**Defaulter workflow panel:** Filter defaulters → select all or subset → "Send Bulk Reminder" → choose channel (WhatsApp/SMS/Email) → preview message → send

### 8.2 Student Fee Payment (Student-facing)
Fee summary card: Total fee | Paid | Outstanding | Due date
Outstanding breakdown: list of pending components (Tuition, Lab, Library, etc.) with amounts

Payment options: Pay Online (Razorpay embed) | Pay via UPI QR (show QR code) | Contact Cashier

Receipt history: downloadable PDFs, WhatsApp re-send option

---

## SCREEN 9: LIBRARY MODULE

### 9.1 Book Catalog (Librarian View)
Grid/List toggle view of books
- Grid: book cover cards with title, author, availability badge (Available: 3 / 5 copies)
- List: compact table view for bulk management
- Top: Search (full-text, by title/author/ISBN/category) + Category filter + Availability filter
- "Add Book" modal: form with all book fields + cover image upload
- "Bulk Import" CSV uploader with column mapping

### 9.2 Issue & Return (Librarian Interface)
Split panel design:
- Left: Barcode/ISBN scanner input (or manual search) to find book
- Right: Member ID scanner/search to find student or faculty

Below: Issue details — book info card + member info card + due date picker (auto-calculated) + "Issue Book" green button

Return tab: scan book barcode → system shows who has it, due date, days overdue, fine amount (if any) → "Complete Return" button

**Return confirmation:** if fine applicable, show fine amount prominently with "Collect Fine" button that integrates with fees module

### 9.3 Library Member Portal (Student view)
Search bar at top: full-text search across all books
Results: book cards with availability indicator (green dot = available, red = all copies issued, amber = 1 copy left)

Book detail modal:
- Cover, title, author, ISBN, category, publisher, edition
- Availability: "2 of 4 copies available" + location (Rack 3, Shelf B)
- Issue history (anonymized for privacy: "This book was borrowed 12 times this year")
- "Request Issue" button (sends request to librarian)

My Library tab:
- Issued books: cover grid with due date badges (green if >7 days, amber if 3-7 days, red if <3 days or overdue)
- Fine summary: total unpaid fines with "Pay Fine" button
- Request history: past requests and their status

---

## SCREEN 10: TRAINING & PLACEMENT MODULE

### 10.1 Placement Dashboard (Placement Officer)
Funnel chart: Eligible → Applied → Shortlisted → Interviewed → Placed
KPIs: Placement % | Average CTC | Highest CTC | Companies visited

### 10.2 Campus Drive Management
Drive cards: company logo, position title, date, eligible departments, application count, status badge
Click drive → detail page: eligibility criteria, schedule (pre-placement talk, aptitude test, interview), applied students list, status tracker per student

### 10.3 Student Placement Profile
Resume builder: sections for Education, Skills (tag input with proficiency), Projects (card form), Internships, Certifications, Achievements
Preview pane: live preview of resume as PDF
Export as PDF button

---

## SCREEN 11: HR & PAYROLL MODULE

### 11.1 Faculty Directory
Grid of faculty cards: photo + name + designation + department + employee ID + contact
Filters: department, designation, employment type
Click → full employee profile (similar 360° view to student profile: personal, qualifications, teaching load, leaves, payroll, performance, publications)

### 11.2 Payroll Processing
Monthly payroll cycle view:
Status: Not Started → In Progress → Processed → Approved → Disbursed
Payroll register table: employee × salary components (expandable rows)
"Process Payroll" triggers computation → shows summary → admin reviews → approves → bank file download

### 11.3 Leave Management
Calendar view showing all faculty leaves color-coded by leave type
Leave requests list with Approve/Reject actions
Leave balance meter per employee

---

## SCREEN 12: NAAC COMPLIANCE MODULE

### 12.1 Criterion Dashboard
7 criterion cards, each showing:
- Criterion number and name
- Completion status (% of data collected)
- Evidence uploaded / Required ratio
- Last updated date
- "View Details" button

### 12.2 Evidence Vault
Tree structure: Criterion → Sub-criterion → Evidence items
Upload panel: drag-and-drop upload, tag with criterion, add description, set year
Evidence list: file name, type, upload date, linked criterion, download/delete

### 12.3 AI Report Draft (Phase 3)
"Draft SSR" button → loading state ("AI is compiling data from 12 modules...") → result page
Result: section-by-section draft with editable rich text
Flag badges: criteria with insufficient data shown in amber/red
Export: Word document, PDF

---

## SCREEN 13: AI ASSISTANT INTERFACE

### 13.1 Campus AI Chatbot (All roles — in-app and WhatsApp)
**In-app:** Sliding drawer from right, 400px wide

Header: "NGCMS AI Assistant" + sparkle icon + "Powered by private campus data" subtitle (reassurance that data is safe)

Chat interface:
- Message bubbles: user right (indigo), AI left (white card)
- AI responses include: answer text + source citations as small pills ("Source: Student Handbook 2024") + suggested follow-up questions as gray chips
- Input: text field + microphone icon (voice input) + send button

**Example conversation to design:**
```
User: "What's my attendance percentage in Data Structures this month?"
AI: "Your attendance in CS-301 Data Structures for October 2026 is 71.4% (10 of 14 classes attended). This is below the 75% minimum requirement. You need to attend the next 3 classes without absence to avoid the shortage flag. [Source: Attendance Records]"
Suggested: "Show me my full attendance" | "When is the next DS class?" | "Apply for attendance condonation"
```

### 13.2 Admin Conversational Analytics
Larger chat interface (full panel):
- Query examples shown initially: "Which departments have attendance below 70%?" | "Show me fee defaulters above ₹50,000" | "How many students were placed this year?"
- After query: AI shows answer as formatted table/chart + natural language summary
- "Export this result" button on every answer

---

## SCREEN 14: NOTIFICATION CENTER

Bell icon → dropdown panel (360px wide):
Tabs: All | Urgent | Unread

Each notification: icon (color-coded by type) + title + description (2 lines) + timestamp + dismiss button

Notification types and icons:
- 🔴 Attendance alert: student below threshold
- 🟡 Fee reminder: payment due
- 🔵 Exam: hall ticket ready, result published
- 🟢 Admission: application approved, seat allotted
- 🟣 Library: book due in 2 days, overdue fine
- ⚪ System: maintenance, updates

"Notification Settings" link at bottom → full settings page with channel preferences per notification type

---

## SCREEN 15: SYSTEM SETTINGS (Admin)

### Settings Navigation (left panel tabs):
General | Academic Year | Roles & Permissions | Fee Configuration | Notification Templates | Integrations | NAAC Setup | AI Configuration | Audit Log

### 15.1 Roles & Permissions
Matrix view: Roles as columns, modules/actions as rows
Each cell: checkbox (granted) or dash (not applicable)
"Clone Role" button, "Create Custom Role" button

### 15.2 Notification Templates
Template list with preview
Edit template: rich text editor with available tokens listed on right (`{{student_name}}`, `{{due_date}}`, etc.)
Test send button: send preview notification to yourself

### 15.3 Audit Log
Full searchable log: timestamp | user | action | module | details
Filters: date range, user, module, action type
Export CSV for compliance

---

## MOBILE APP SCREENS (React Native — Key Screens)

### M1: Onboarding / Login
Clean splash screen: NGCMS logo centered on `#1A1A2E` background with tagline
Login screen: institution domain input first → then email/phone + password
Face ID / fingerprint login option after first login
"Trouble logging in?" link

### M2: Student Home (Mobile)
Full-width today's attendance card at top (showing overall %, color-coded)
Today's timetable horizontal scrollable strip (current/next class highlighted)
Fee due amount card (if any, amber/red)
Quick action row: icons for key tasks
Recent notifications list

### M3: Faculty Attendance Marking (Mobile)
Class selection dropdown at top
Large prominent student list
Swipe right = Mark Present (green), swipe left = Mark Absent (red)
Bulk toggle at top
Submit button (always visible, fixed at bottom)

### M4: Parent View (Mobile)
Child selector at top (for parents with multiple children)
Last-seen attendance: today's status (came to college / absent)
This week attendance: 5-day calendar strip
Fee reminder card (if fee due)
Recent result: last exam score with subject name
Recent notification from college
One-tap: "Chat with advisor" opens WhatsApp

---

## RESPONSIVE & ACCESSIBILITY REQUIREMENTS

**Responsive breakpoints:**
- Mobile: < 768px (stack all columns, full-width cards)
- Tablet: 768px–1024px (2-column grid, collapsible sidebar)
- Desktop: > 1024px (full sidebar, 3+ column grids)

**Accessibility:**
- WCAG 2.1 AA compliance
- All interactive elements minimum 44×44px touch target
- Color is never the only indicator — always pair with icon or text label
- High contrast mode support
- Keyboard navigation for all desktop flows
- Screen reader labels on all icons and charts

**Performance:**
- Page skeleton loaders (show content structure before data loads)
- Progressive data loading: show KPI cards first, then tables
- Optimistic UI: show immediate response on user action, resolve in background
- Offline indicator banner when no internet connection

---

## COMPONENT LIBRARY REFERENCE

Design these reusable components to be used across all screens:

| Component | Usage |
|---|---|
| KPI Card | Metric + trend + sparkline — used in all dashboards |
| Status Badge | Colored pill labels for status fields (Paid/Overdue, Present/Absent, etc.) |
| Risk Tier Badge | Special badge: CRITICAL (red), HIGH (amber), MEDIUM (yellow), LOW (green) |
| Data Table | Sortable, filterable, with row actions — used in student list, fee list, etc. |
| Empty State | Illustration + message + CTA for empty screens |
| Skeleton Loader | Gray animated placeholder matching the shape of content loading |
| Confirmation Modal | Action confirmation with impact summary before destructive actions |
| Toast Notifications | In-app success/error/info toast (bottom-right, auto-dismiss 4s) |
| Timeline | Vertical timeline for activity logs, application workflow, payment history |
| Calendar Heatmap | Contribution graph style — used for attendance visualization |
| Progress Steps | Horizontal stepper for multi-step forms |
| Search Command Palette | ⌘K global search overlay with categories and recent items |

---

## WHATSAPP INTERFACE (Conversational UI)

Design message templates for key WhatsApp bot interactions:

**Attendance alert to parent:**
```
🔔 Attendance Alert | St. Xavier's College
Dear Mrs. Sharma,
Your ward Priya Singh (B.Tech CS, 3rd Sem) attended only 3 of 4 classes today.
Current attendance: 71.4% (below 75% required)
Reply with:
1️⃣ View full attendance
2️⃣ Apply for leave
3️⃣ Talk to advisor
```

**Fee reminder:**
```
💳 Fee Reminder | St. Xavier's College
Dear Priya,
Your semester fee of ₹18,500 is due by November 30, 2026.
Outstanding: ₹12,000
Pay now: [Payment Link]
Reply HELP for more options
```

**AI chatbot response style:**
```
Hi Priya! 👋
Your Data Structures class is on:
📅 Tomorrow, Nov 21 at 11:00 AM
📍 Room 204, CS Block
Faculty: Prof. Ramesh Kumar
Reply:
📋 Today's full timetable
📊 My attendance
```

---

*End of NGCMS Google Stitch UI Design Prompt — Version 1.0 — March 2026*
