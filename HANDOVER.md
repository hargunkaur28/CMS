# NgCMS — Next-Gen College Management System | Handoff Document
**Status**: 95% Core Functional (Admin & Teacher Portals Completed)
**Last Updated**: 2026-03-29

## 🚀 System Architecture

- **Frontend**: `apps/web-shell` (Next.js 15, App Router, Tailwind CSS, TypeScript)
- **Backend**: `backend` (Node.js, Express, MongoDB Atlas, Mongoose)
- **Ports**: Frontend `3001` | Backend `5005`
- **Auth**: JWT-based RBAC (Roles: `college_admin`, `super_admin`, `TEACHER`, `STUDENT`, `PARENT`)

---

## 🏗️ Completed Portals & Modules

### 1. Admin Portal (`/admin`)
Full institutional governance suite with monochrome institutional design:
- **Dashboard**: Dynamic "Operations Hub" with enrollment trends, revenue stats, and AI Early Warning System.
- **Admissions**: Kanban board lifecycle management (Applied → DocsVerified → Approved → Enrolled).
- **SIS**: Global student registry with academic and personal record control.
- **Faculty Management**: HRM suite with subject assignment and workload tracking.
- **Academics**: Multi-level hierarchy (Department → Course → Subject → Batch).
- **Attendance**: Global oversight with automated shortage detection (<75%).
- **Exams**: Centralized scheduling and result publication engine.
- **Fees**: Revenue tracking, payment logging, and structure definition.
- **Communication**: Campus-wide broadcasts and role-targeted announcements.
- **NAAC Compliance**: Criterion-based evidence vault (C1-C7).

### 2. Teacher Portal (`/teacher`)
Streamlined workflow for faculty:
- **My Schedule**: Dynamic timetable view.
- **Attendance**: Bulk marking with roster fetching and attendance recovery metrics.
- **Marks Entry**: Secure interface for term-wise grading and automatic calculation.
- **Upload Center**: Cloudinary-integrated repository for syllabus and study materials.
- **Students**: Targeted view of students assigned to the faculty's subjects.

---

## 🛠️ Technical Implementation Details

### API Layer (`apps/web-shell/src/lib/api/`)
- `admin.ts`: Unified utility for all administrative endpoints.
- `api.ts`: Shared instance with interceptors for JWT token injection.
- `exams.ts`: Specialized marks and result processing.

### Backend Controllers (`backend/src/controllers/`)
- `adminDashboardController.ts`: Real-time aggregation for institutional health.
- `examsController.ts`: Complex logic for result calculation and publication.
- `admissionController.ts`: Automation for student ID generation (`NGM-YYYY-XXXX`) and enrollment.

### Role-Based Access Control
- Enforced via `protect` and `authorize` middleware in `backend/src/middleware/auth.ts`.
- Routes registered under `/api/admin` and `/api/teacher`.

---

## 🚦 Running the Project

1. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *Note: Ensure .env has MONGO_URI and JWT_SECRET.*

2. **Frontend**:
   ```bash
   cd apps/web-shell
   npm run dev
   ```
   *Access at http://localhost:3001*

---

## 📝 Pending & Next Steps
- [ ] **Student/Parent Portals**: Build the frontend UI for `/student` and `/parent` (Backend logic largely exists).
- [ ] **Library Module**: Modernize the legacy inventory UI to match the new monochrome architecture.
- [ ] **Real-time Notifications**: Socket.io integration for instant campus-wide blasts.
- [ ] **Mobile Optimization**: Final responsive audit for field-use (Attendance marking on mobile).

---
**Maintained by Antigravity (AI Coding Assistant)**
