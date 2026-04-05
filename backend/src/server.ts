import dotenv from 'dotenv';
dotenv.config();

console.log("--- SYSTEM BOOT DIAGNOSTICS ---");
console.log("PORT:", process.env.PORT);
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("-------------------------------");

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import admissionsRoutes from './routes/admissions.js';
import courseRoutes from './routes/courseRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import attendanceRoutes from './routes/attendance.js';
import studentRoutes from './routes/students.js';
import departmentRoutes from './routes/departments.js';
import subjectRoutes from './routes/subjectRoutes.js';
import examsRoutes from './routes/exams.js';
import teacherRoutes from './routes/teacher.js';
import adminRoutes from './routes/admin.routes.js';
import parentRoutes from './routes/parentRoutes.js';
import libraryRoutes from './routes/library.js';
import notificationsRoutes from './routes/notifications.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import publicSettingsRoutes from './routes/publicSettings.routes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import dashboardRoutes from './routes/dashboard.js';

// Connect to MongoDB
console.log("[DB] Attempting to connect to MongoDB...");
await connectDB();
console.log("[DB] MongoDB connection sequence completed.");

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/settings', publicSettingsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('AI-Powered College Management System API is running...');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("EXPRESS ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5005;

console.log(`[SERVER] Attempting to start server on port ${PORT}...`);
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Success! Server is running on port ${PORT}`);
});
