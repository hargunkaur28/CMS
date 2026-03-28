# NgCMS Project Handoff Document

This document summarizes the recent architectural upgrades and functional integrations performed on the College Management System.

## 🚀 Active Workspace Architecture
> [!IMPORTANT]  
> The project has been consolidated. The directory **`d:\cms_new\apps\web-shell`** is the single source of truth for the frontend. The old `\frontend` folder is deprecated and should only be used as a reference for legacy logic.

- **Frontend**: `apps/web-shell` (Next.js 15+, App Router, TailwindCSS)
- **Backend**: `backend` (Express, Node.js, MongoDB)
- **Shared UI**: `apps/web-shell/src/components/ui` (Reusable card and layout tokens)

## 🛠️ Key Modules & Functional Upgrades

### 1. Student Module (Slate UI)
- Migrated the **Student Directory** and **Profile View** to the vibrant Slate-50 design system.
- Standardized the `StudentProfileTabs` and `StudentStatusBadge` components.
- All student data is fetched dynamically from the `api/students` collection.

### 2. Academics Engine (Hybrid Routing)
- Located at `/academics`.
- **Relational Structure**: Successfully implemented the hierarchy: **Department → Course → Batch**.
- **Data Binding**: Form validation and API interceptors are wired to extract the active `token` and `collegeId` from local storage.

### 3. Attendance & Predictive Analysis
- Located at `/attendance`.
- **Live Roster Fetching**: Selecting a Batch triggers an automatic roster fetch of enrolled students from the database.
- **Bulk Submission**: Uses a high-performance MongoDB `bulkWrite` operation to mark entire classrooms in one transaction.
- **AI Recovery Metric**: Includes a logic engine that calculates how many consecutive classes a student needs to attend to recover to the 75% benchmark.

### 4. Backend Additions
- **Subject Model**: Added a new `Subject` collection to allow granular attendance tracking.
- **Relational Data**: Updated `Batch` controllers to use `.populate()` for seamless Course-to-Batch mapping in the UI.

## 🔑 Authentication Flow
- **Encryption**: Uses JWT-based authorization.
- **Interceptor**: Every frontend API call in `apps/web-shell/src/lib/api/` is programmed to append the `Bearer` token from `localStorage` automatically.

---

## 🚦 Running the Environment

### Backend
```bash
cd backend
npm run dev:watch
```
*Runs on Port 5000*

### Frontend (Web Shell)
```bash
cd apps/web-shell
npm run dev
```
*Runs on Port 3001*

---

## 📝 Pending Tasks
- [ ] **Exam Management**: Build the frontend UI for scheduling exams and recording marks.
- [ ] **Fee System**: The backend support exists but remains unmapped in the `web-shell`.
- [ ] **Library Inventory**: Modernize the legacy library UI to match the Slate-50 theme.

---
**Maintained by Antigravity (AI Coding Assistant)**
