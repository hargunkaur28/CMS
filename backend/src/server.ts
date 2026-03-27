import dotenv from 'dotenv';
dotenv.config({ override: true });

console.log("--- SYSTEM BOOT DIAGNOSTICS ---");
console.log("PORT:", process.env.PORT);
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("-------------------------------");

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import admissionsRoutes from './routes/admissions.js';
import courseRoutes from './routes/courseRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import studentRoutes from './routes/students.js';
import departmentRoutes from './routes/departments.js';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/departments', departmentRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
