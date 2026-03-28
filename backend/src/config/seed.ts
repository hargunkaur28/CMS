import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Faculty from '../models/Faculty.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import connectDB from './db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data for a clean reset
    console.log('Cleaning existing data...');
    await Promise.all([
      User.deleteMany(),
      College.deleteMany(),
      Department.deleteMany(),
      Course.deleteMany(),
      Batch.deleteMany(),
      Subject.deleteMany(),
      Student.deleteMany(),
      Parent.deleteMany(),
      Faculty.deleteMany(),
      Attendance.deleteMany(),
      Exam.deleteMany(),
      Result.deleteMany()
    ]);

    // 1. Create Default College
    const college = await College.create({
      name: 'Global Institute of Technology',
      address: '123 Academic Way, Tech City',
      contactEmail: 'info@git.edu',
      contactPhone: '1234567890',
      status: 'active',
    });
    console.log('College Created');

    // 2. Create Departments & Courses
    const dept = await Department.create({
      name: 'Computer Science & Engineering',
      collegeId: college._id,
      hod: 'Dr. Alan Turing',
      courses: ['B.Tech Computer Science']
    });

    const course = await Course.create({
      name: 'B.Tech Computer Science',
      code: 'CS-BTECH',
      department: dept._id,
      collegeId: college._id,
      duration: 4,
      totalSeats: 60
    });
    console.log('Department & Course Created');

    // 3. Create Batch & Subjects
    const batch = await Batch.create({
      name: 'Batch 2022-26',
      courseId: course._id,
      collegeId: college._id,
      year: 2022,
      sections: ['A', 'B']
    });

    const subjects = await Subject.create([
      { name: 'Advanced Algorithms', code: 'CS601', creditHours: 4, courseId: course._id, collegeId: college._id },
      { name: 'Database Systems', code: 'CS602', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Software Engineering', code: 'CS603', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Applied Cyber Security', code: 'CS604', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Machine Learning', code: 'CS605', creditHours: 4, courseId: course._id, collegeId: college._id },
      { name: 'Data Structures', code: 'CS606', creditHours: 4, courseId: course._id, collegeId: college._id },
      { name: 'Computer Networks', code: 'CS607', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Operating Systems', code: 'CS608', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Distributed Systems', code: 'CS609', creditHours: 3, courseId: course._id, collegeId: college._id },
      { name: 'Quantum Computing', code: 'CS610', creditHours: 4, courseId: course._id, collegeId: college._id }
    ]);
    console.log('Batch & Subjects Created');

    // 4. Create Users (Roles)
    const usersData = [
      { name: 'Global Super Admin', email: 'superadmin@ngcms.edu', password: 'password123', role: 'SUPER_ADMIN' },
      { name: 'Dr. Rajesh Khanna', email: 'admin@git.edu', password: 'password123', role: 'COLLEGE_ADMIN', collegeId: college._id },
      { name: 'Prof. Alan Turing', email: 'teacher@git.edu', password: 'password123', role: 'TEACHER', collegeId: college._id },
      { name: 'Prof. Grace Hopper', email: 'hopper@git.edu', password: 'password123', role: 'TEACHER', collegeId: college._id },
      { name: 'Dr. Richard Feynman', email: 'feynman@git.edu', password: 'password123', role: 'TEACHER', collegeId: college._id },
      { name: 'Prof. Nikola Tesla', email: 'tesla@git.edu', password: 'password123', role: 'TEACHER', collegeId: college._id },
      { name: 'Harsh Kumar', email: 'student@git.edu', password: 'password123', role: 'STUDENT', collegeId: college._id, registrationId: 'STU2024001' },
      { name: 'Mr. Sharma', email: 'parent@git.edu', password: 'password123', role: 'PARENT', collegeId: college._id, registrationId: 'PAR2024001' }
    ];

    const users: any = {};
    for (const u of usersData) {
      users[u.email] = await User.create(u);
    }
    console.log('Users Created');

    // 5. Create Student Profile
    const student = await Student.create({
      uniqueStudentId: 'STU2024001',
      userId: users['student@git.edu']._id,
      collegeId: college._id,
      batchId: batch._id,  // Top-level batchId for efficient querying
      personalInfo: {
        firstName: 'Harsh',
        lastName: 'Kumar',
        dob: new Date('2004-05-15'),
        gender: 'male',
        phone: '9876543210',
        email: 'student@git.edu',
        address: '123 Student Housing, Tech City'
      },
      academicInfo: {
        course: 'B.Tech Computer Science',
        batch: 'Batch 2022-26',
        department: dept._id,
        status: 'active',
        semester: 6,
        rollNumber: 'CS22001'
      },
      parentInfo: {
        name: 'Mr. Sharma',
        phone: '9123456780',
        email: 'parent@git.edu',
        relation: 'Father'
      }
    });

    // Add student to batch
    batch.students.push(student._id);
    await batch.save();
    console.log('Student Profile Created & Linked to Batch');

    // 6. Create Parent Profile & Link
    await Parent.create({
      userId: users['parent@git.edu']._id,
      students: [student._id],
      relation: 'Father',
      phone: '9123456780',
      address: '456 Parent Estates, Greenway'
    });
    console.log('Parent Profile Created & Linked to Student');

    // 7. Create Faculty Profiles & Wire Assignments
    const facultyConfigs = [
      { email: 'teacher@git.edu', subjects: subjects.slice(0, 3) }, // 3 out of 10
      { email: 'hopper@git.edu', subjects: [subjects[4], subjects[5]] },
      { email: 'feynman@git.edu', subjects: [subjects[8], subjects[9]] },
      { email: 'tesla@git.edu', subjects: [subjects[6], subjects[7]] }
    ];

    for (const f of facultyConfigs) {
      await Faculty.create({
        userId: users[f.email]._id,
        collegeId: college._id,
        employeeId: `EMP-${f.email.split('@')[0].toUpperCase()}`,
        personalInfo: { 
          name: users[f.email].name, 
          email: f.email 
        },
        assignedSubjects: f.subjects.map(s => ({ subjectId: s._id, batchId: batch._id }))
      });
    }
    console.log('Multiple Faculty Profiles Created & Assignments Wired');

    // 7. Generate Mock Attendance (30 days)
    const attendanceRecords = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() === 0) continue;

      for (const sub of subjects) {
        attendanceRecords.push({
          classId: batch._id,
          subjectId: sub._id,
          teacherId: users['teacher@git.edu']._id,
          collegeId: college._id,
          date: date,
          records: [{
            studentId: student._id,
            status: Math.random() > 0.1 ? 'Present' : 'Absent'
          }]
        });
      }

    }
    await Attendance.insertMany(attendanceRecords);
    console.log('Mock Attendance Generated (30 Days)');
    
    // 8. Create Mock Exam & Result
    const exam = await Exam.create({
      collegeId: college._id,
      code: 'SEM-FIN-2024',
      name: 'Semester Final Examination - 2024',
      examType: 'EXTERNAL',
      scheduleDate: new Date(),
      duration: 180,
      courses: [course._id],
      subjects: subjects.map(s => s._id),
      totalMarks: 100,
      passingMarks: 40,
      gradingScheme: [
        { grade: 'A+', minMarks: 90, maxMarks: 100, gradePoint: 10 },
        { grade: 'A', minMarks: 80, maxMarks: 89, gradePoint: 9 },
        { grade: 'B+', minMarks: 70, maxMarks: 79, gradePoint: 8 },
        { grade: 'B', minMarks: 60, maxMarks: 69, gradePoint: 7 },
        { grade: 'C', minMarks: 50, maxMarks: 59, gradePoint: 6 },
        { grade: 'D', minMarks: 40, maxMarks: 49, gradePoint: 5 },
        { grade: 'F', minMarks: 0, maxMarks: 39, gradePoint: 0 }
      ],
      status: 'PUBLISHED',
      publishedDate: new Date(),
      createdBy: users['admin@git.edu']._id
    });

    await Result.create({
      examId: exam._id,
      studentId: student._id,
      courseId: course._id,
      batchId: batch._id,
      subjects: subjects.map(s => ({
        subjectId: s._id,
        subjectName: s.name,
        marks: 75 + Math.floor(Math.random() * 20),
        maxMarks: 100,
        grade: 'A',
        gradePoint: 9,
        status: 'PASS'
      })),
      totalMarksObtained: 255,
      totalMaxMarks: 300,
      percentage: 85,
      cgpa: 9.0,
      status: 'PASS',
      publishedDate: new Date(),
      publishedBy: users['admin@git.edu']._id
    });
    console.log('Mock Exam & Result Created');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

