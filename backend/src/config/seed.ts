import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import connectDB from './db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await College.deleteMany();

    // 1. Create Default College
    const defaultCollege = await College.create({
      name: 'Global Institute of Technology',
      address: '123 Academic Way, Tech City',
      contactEmail: 'info@git.edu',
      contactPhone: '1234567890',
      status: 'active',
    });

    console.log('Default College Created');

    // 2. Create All Roles
    const roles = [
      { name: 'Global Super Admin', email: 'superadmin@ngcms.edu', password: 'password123', role: 'SUPER_ADMIN' },
      { name: 'Dr. Rajesh Khanna', email: 'admin@git.edu', password: 'password123', role: 'COLLEGE_ADMIN', collegeId: defaultCollege._id },
      { name: 'Prof. Alan Turing', email: 'teacher@git.edu', password: 'password123', role: 'TEACHER', collegeId: defaultCollege._id },
      { name: 'Harsh Kumar', email: 'student@git.edu', password: 'password123', role: 'STUDENT', collegeId: defaultCollege._id },
      { name: 'Mr. Sharma', email: 'parent@git.edu', password: 'password123', role: 'PARENT', collegeId: defaultCollege._id }
    ];

    for (const r of roles) {
      const existingUser = await User.findOne({ email: r.email });
      if (existingUser) {
        existingUser.name = r.name;
        existingUser.password = r.password;
        existingUser.role = r.role as any;
        existingUser.collegeId = r.collegeId as any;
        await existingUser.save();
      } else {
        await User.create(r);
      }
    }

    console.log('All Roles Hashed and Created Successfully');
    
    // 3. Create Default Departments
    const depts = [
      { name: 'Computer Science & Engineering', hod: 'Dr. Alan Turing', courses: ['B.Tech CSE', 'M.Tech CSE'] },
      { name: 'Electronics & Communication', hod: 'Dr. Nikola Tesla', courses: ['B.Tech ECE', 'M.Tech ECE'] },
      { name: 'Mechanical Engineering', hod: 'Dr. James Watt', courses: ['B.Tech ME'] },
      { name: 'Business Administration', hod: 'Dr. Peter Drucker', courses: ['BBA', 'MBA'] }
    ];

    for (const dept of depts) {
      await Department.findOneAndUpdate(
        { name: dept.name },
        dept,
        { upsert: true, new: true }
      );
    }
    console.log('Default Departments Created');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
