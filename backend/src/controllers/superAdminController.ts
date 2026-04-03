import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import College from '../models/College.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Parent from '../models/Parent.js';
import AuditLog from '../models/AuditLog.js';
import SystemSettings from '../models/SystemSettings.js';
import Session from '../models/Session.js';

interface AuthRequest extends Request {
  user?: any;
}

// =====================
// COLLEGE MANAGEMENT
// =====================

export const createCollege = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, email, phone, website, location, adminId, affiliation, established_year, subscription, settings } = req.body;

    const existingCollege = await College.findOne({ $or: [{ code }, { name }] });
    if (existingCollege) {
      return res.status(400).json({ success: false, message: 'College code or name already exists' });
    }

    const college = new College({
      code,
      name,
      email,
      phone,
      website,
      location,
      adminId,
      affiliation,
      established_year,
      subscription: subscription || {
        plan: 'basic',
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        max_students: 500,
        max_teachers: 50,
        max_admins: 5
      },
      settings: settings || {
        academic_year: '2024-2025',
        semester_system: true,
        batch_size: 'default',
        grading_scale: '10.0'
      }
    });

    await college.save();

    // Log audit
    await logAudit(req.user?.id || 'unknown', 'CREATE', 'College', college._id.toString());

    res.status(201).json({ success: true, data: college, message: 'College created successfully' });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'CREATE', 'College', '', 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllColleges = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    let filter: any = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const colleges = await College.find(filter)
      .populate('adminId', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await College.countDocuments(filter);

    res.json({
      success: true,
      data: colleges,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeById = async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const college = await College.findById(collegeId).populate('adminId', 'name email');
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    res.json({ success: true, data: college });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCollege = async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { code, name, email, phone, website, location, adminId, subscription, settings, status, is_verified } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const oldData = college.toObject();

    if (code && code !== college.code) {
      const existing = await College.findOne({ code });
      if (existing) {
        return res.status(400).json({ success: false, message: 'College code already exists' });
      }
      college.code = code;
    }

    if (name) college.name = name;
    if (email) college.email = email;
    if (phone) college.phone = phone;
    if (website) college.website = website;
    if (location) college.location = { ...college.location, ...location };
    if (adminId) college.adminId = adminId;
    if (subscription) college.subscription = { ...college.subscription, ...subscription };
    if (settings) college.settings = { ...college.settings, ...settings };
    if (status) college.status = status;
    if (typeof is_verified === 'boolean') college.is_verified = is_verified;

    await college.save();

    // Log audit
    const changes = { before: oldData, after: college.toObject() };
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'College', college._id.toString(), 'success', undefined, changes);

    res.json({ success: true, data: college, message: 'College updated successfully' });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'College', (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id), 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCollege = async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const college = await College.findByIdAndDelete(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Log audit
    await logAudit(req.user?.id || 'unknown', 'DELETE', 'College', collegeId);

    res.json({ success: true, message: 'College deleted successfully' });
  } catch (error: any) {
    const collegeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await logAudit(req.user?.id || 'unknown', 'DELETE', 'College', collegeId, 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const collegeId = Array.isArray(req.params.collegeId) ? req.params.collegeId[0] : req.params.collegeId;

    const studentCount = await Student.countDocuments({ collegeId });
    const teacherCount = await Faculty.countDocuments({ collegeId });
    const adminCount = await User.countDocuments({ collegeId, role: 'COLLEGE_ADMIN' });

    const college = await College.findById(collegeId);

    res.json({
      success: true,
      data: {
        collegeId,
        collegeName: college?.name,
        students: studentCount,
        teachers: teacherCount,
        admins: adminCount,
        subscription: college?.subscription,
        modules: college?.modules_enabled,
        status: college?.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportCollegesCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const colleges = await College.find(filter)
      .select('code name email phone status is_verified createdAt subscription')
      .sort({ createdAt: -1 })
      .lean();

    const headers = ['Code', 'Name', 'Email', 'Phone', 'Status', 'Verified', 'Plan', 'CreatedAt'];
    const rows = colleges.map((college: any) => [
      escapeCsv(college.code),
      escapeCsv(college.name),
      escapeCsv(college.email),
      escapeCsv(college.phone),
      escapeCsv(college.status),
      college.is_verified ? 'Yes' : 'No',
      escapeCsv(college.subscription?.plan || 'basic'),
      escapeCsv(new Date(college.createdAt).toISOString())
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="colleges-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkImportColleges = async (req: AuthRequest, res: Response) => {
  try {
    const { colleges } = req.body;
    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({ success: false, message: 'colleges must be a non-empty array' });
    }

    let created = 0;
    let skipped = 0;
    const errors: Array<{ index: number; reason: string }> = [];

    for (let i = 0; i < colleges.length; i++) {
      const college = colleges[i];
      const { code, name, email, phone } = college || {};

      if (!code || !name || !email || !phone) {
        skipped++;
        errors.push({ index: i, reason: 'Missing required fields: code, name, email, phone' });
        continue;
      }

      const exists = await College.findOne({ $or: [{ code }, { name }] });
      if (exists) {
        skipped++;
        errors.push({ index: i, reason: 'Duplicate college code or name' });
        continue;
      }

      try {
        await College.create({
          code,
          name,
          email,
          phone,
          website: college.website,
          location: {
            address: college.location?.address || 'N/A',
            city: college.location?.city || 'N/A',
            state: college.location?.state || 'N/A',
            pin_code: college.location?.pin_code || '000000',
            country: college.location?.country || 'India'
          },
          affiliation: college.affiliation,
          established_year: college.established_year,
          status: college.status || 'active'
        });
        created++;
      } catch (err: any) {
        skipped++;
        errors.push({ index: i, reason: err.message || 'Failed to create college' });
      }
    }

    await logAudit(req.user?.id || 'unknown', 'CREATE', 'College', `bulk_import_${created}`);
    res.status(200).json({
      success: true,
      message: 'College bulk import completed',
      data: {
        total: colleges.length,
        created,
        skipped,
        errors
      }
    });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'CREATE', 'College', 'bulk_import_failure', 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// USER MANAGEMENT
// =====================

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, role, status, collegeId, search } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    let filter: any = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (collegeId) filter.collegeId = collegeId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('collegeId', 'name code')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('collegeId', 'name code email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, collegeId, phone, studentIds, relation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const normalizedRole = String(role || '').trim().toUpperCase();
    if (!name || !email || !password || !normalizedRole) {
      return res.status(400).json({ success: false, message: 'name, email, password and role are required' });
    }

    if (['STUDENT', 'TEACHER'].includes(normalizedRole) && !collegeId) {
      return res.status(400).json({ success: false, message: 'collegeId is required for Student and Teacher users' });
    }

    if (normalizedRole === 'PARENT') {
      const selectedStudents = Array.isArray(studentIds) ? studentIds.filter(Boolean) : [];
      if (!selectedStudents.length) {
        return res.status(400).json({ success: false, message: 'At least one student must be selected for a Parent account' });
      }
    }

    const user = new User({
      name,
      email,
      password,
      role: normalizedRole,
      collegeId: collegeId || undefined,
      phone,
      authentication: {
        two_factor_enabled: false,
        two_factor_method: 'email',
        login_count: 0,
        failed_login_attempts: 0
      }
    });

    await user.save();

    if (normalizedRole === 'PARENT') {
      const selectedStudents = Array.isArray(studentIds) ? studentIds.filter(Boolean) : [];
      await Parent.create({
        userId: user._id,
        students: selectedStudents,
        relation: relation || 'Guardian',
        phone: phone || '',
        isActive: true,
      });
    }

    // Log audit

    await logAudit(req.user?.id || 'unknown', 'CREATE', 'User', user._id.toString());
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse, message: 'User created successfully' });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'CREATE', 'User', '', 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, email, role, phone, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldData = user.toObject();

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    // Log audit
    const changes = { before: oldData, after: user.toObject() };
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'User', user._id.toString(), 'success', undefined, changes);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, data: userResponse, message: 'User updated successfully' });
  } catch (error: any) {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'User', userId, 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Log audit
    await logAudit(req.user?.id || 'unknown', 'DELETE', 'User', userId);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await logAudit(req.user?.id || 'unknown', 'DELETE', 'User', userId, 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Log audit
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'User_Password', user._id.toString());

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'User_Password', userId, 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportUsersCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, search } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email role isActive authentication collegeId createdAt')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const headers = ['Name', 'Email', 'Role', 'Status', 'College', 'LoginCount', 'LastLogin', 'CreatedAt'];
    const rows = users.map((user: any) => [
      escapeCsv(user.name),
      escapeCsv(user.email),
      escapeCsv(user.role),
      user.isActive ? 'Active' : 'Inactive',
      escapeCsv(user.collegeId?.name || ''),
      escapeCsv(String(user.authentication?.login_count || 0)),
      escapeCsv(user.authentication?.last_login ? new Date(user.authentication.last_login).toISOString() : ''),
      escapeCsv(new Date(user.createdAt).toISOString())
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkImportUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { users, defaultPassword } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'users must be a non-empty array' });
    }

    let created = 0;
    let skipped = 0;
    const errors: Array<{ index: number; reason: string }> = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const { name, email } = user || {};
      const password = user?.password || defaultPassword || 'ChangeMe123!';

      if (!name || !email) {
        skipped++;
        errors.push({ index: i, reason: 'Missing required fields: name, email' });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        skipped++;
        errors.push({ index: i, reason: 'Duplicate email' });
        continue;
      }

      try {
        await User.create({
          name,
          email,
          password,
          role: user.role || 'STUDENT',
          collegeId: user.collegeId,
          phone: user.phone,
          isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
          authentication: {
            two_factor_enabled: false,
            two_factor_method: 'email',
            login_count: 0,
            failed_login_attempts: 0
          }
        });
        created++;
      } catch (err: any) {
        skipped++;
        errors.push({ index: i, reason: err.message || 'Failed to create user' });
      }
    }

    await logAudit(req.user?.id || 'unknown', 'CREATE', 'User', `bulk_import_${created}`);
    res.status(200).json({
      success: true,
      message: 'User bulk import completed',
      data: {
        total: users.length,
        created,
        skipped,
        errors
      }
    });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'CREATE', 'User', 'bulk_import_failure', 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// ANALYTICS & REPORTING
// =====================

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalColleges = await College.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Faculty.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'COLLEGE_ADMIN' });
    const activeColleges = await College.countDocuments({ status: 'active' });
    const activeSessions = await Session.countDocuments({
      is_active: true,
      expires_at: { $gt: new Date() }
    });

    const collegesByStatus = await College.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalColleges,
          totalUsers,
          totalStudents,
          totalTeachers,
          totalAdmins,
          activeColleges,
          activeSessions,
          systemHealth: 99.5
        },
        collegesByStatus,
        usersByRole
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeAnalyticsComparison = async (req: AuthRequest, res: Response) => {
  try {
    const colleges = await College.find({ status: 'active' }).limit(10);

    const analyticsData = await Promise.all(
      colleges.map(async (college) => {
        const studentCount = await Student.countDocuments({ collegeId: college._id });
        const teacherCount = await Faculty.countDocuments({ collegeId: college._id });
        const adminCount = await User.countDocuments({ collegeId: college._id, role: 'COLLEGE_ADMIN' });

        return {
          collegeId: college._id,
          collegeName: college.name,
          students: studentCount,
          teachers: teacherCount,
          admins: adminCount
        };
      })
    );

    res.json({ success: true, data: analyticsData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const monthlyNewUsers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const usersByCollege = await User.aggregate([
      { $match: { role: { $ne: 'SUPER_ADMIN' } } },
      {
        $group: {
          _id: '$collegeId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'colleges',
          localField: '_id',
          foreignField: '_id',
          as: 'college'
        }
      },
      { $unwind: '$college' },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        monthlyNewUsers,
        usersByCollege
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// AUDIT LOG MANAGEMENT
// =====================

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, userId, action, resource_type, search } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    let filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource_type) filter.resource_type = resource_type;
    if (search) {
      filter.$or = [
        { resource_type: { $regex: search, $options: 'i' } },
        { resource_id: { $regex: search, $options: 'i' } },
        { error_message: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, action, resource_type, search } = req.query;

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resource_type) filter.resource_type = resource_type;
    if (search) {
      filter.$or = [
        { resource_type: { $regex: search, $options: 'i' } },
        { resource_id: { $regex: search, $options: 'i' } },
        { error_message: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .lean();

    const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Resource Type', 'Resource ID', 'Status', 'Error Message'];
    const rows = logs.map((log: any) => [
      escapeCsv(log.timestamp ? new Date(log.timestamp).toISOString() : ''),
      escapeCsv(log.userId?.name || ''),
      escapeCsv(log.userId?.email || ''),
      escapeCsv(log.userId?.role || ''),
      escapeCsv(log.action || ''),
      escapeCsv(log.resource_type || ''),
      escapeCsv(log.resource_id || ''),
      escapeCsv(log.status || ''),
      escapeCsv(log.error_message || ''),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const colleges = await College.find({ status: 'active' }).sort({ name: 1 }).lean();

    const comparisonRows = await Promise.all(colleges.map(async (college: any) => {
      const studentCount = await Student.countDocuments({ collegeId: college._id });
      const teacherCount = await Faculty.countDocuments({ collegeId: college._id });
      const adminCount = await User.countDocuments({ collegeId: college._id, role: 'COLLEGE_ADMIN' });

      return [
        escapeCsv(college.name || ''),
        escapeCsv(String(college.code || '')),
        String(studentCount),
        String(teacherCount),
        String(adminCount),
        String(studentCount + teacherCount + adminCount),
      ];
    }));

    const summaryHeaders = ['Metric', 'Value'];
    const totalColleges = await College.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Faculty.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'COLLEGE_ADMIN' });

    const summaryRows = [
      ['Total Colleges', String(totalColleges)],
      ['Total Users', String(totalUsers)],
      ['Total Students', String(totalStudents)],
      ['Total Teachers', String(totalTeachers)],
      ['Total College Admins', String(totalAdmins)],
    ];

    const collegeHeaders = ['College', 'Code', 'Students', 'Teachers', 'Admins', 'Total Users'];
    const csvSections = [
      summaryHeaders.join(','),
      ...summaryRows.map((row) => row.map(escapeCsv).join(',')),
      '',
      collegeHeaders.join(','),
      ...comparisonRows.map((row) => row.join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`);
    res.status(200).send(csvSections.join('\n'));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserActivityLog = async (req: AuthRequest, res: Response) => {
  try {
    const userActivityId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = ((Number(page) - 1) * Number(limit));

    const logs = await AuditLog.find({ userId: userActivityId })
      .skip(skip)
      .limit(Number(limit))
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments({ userId: userActivityId });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================
// HELPER FUNCTIONS
// =====================

async function logAudit(
  userId: string | undefined,
  action: string,
  resource_type: string,
  resource_id: string,
  status: 'success' | 'failure' = 'success',
  error_message?: string,
  change_details?: any
) {
  try {
    const safeUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;
    const log = new AuditLog({
      userId: safeUserId,
      action,
      resource_type,
      resource_id,
      status,
      error_message,
      change_details,
      ip_address: process.env.REQUEST_IP || 'unknown',
      user_agent: process.env.REQUEST_USER_AGENT || 'unknown',
      timestamp: new Date()
    });
    await log.save();
  } catch (err) {
    console.error('Error logging audit:', err);
  }
}

function escapeCsv(value: string) {
  const normalized = String(value ?? '');
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

// =====================
// SYSTEM SETTINGS
// =====================

export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await SystemSettings.findOne();
    const settings = existing || (await SystemSettings.create({}));
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'SystemSettings', 'global');

    res.json({ 
      success: true, 
      message: 'System settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    await logAudit(req.user?.id || 'unknown', 'UPDATE', 'SystemSettings', 'global', 'failure', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicSystemSettings = async (req: Request, res: Response) => {
  try {
    const existing = await SystemSettings.findOne();
    const settings = existing || (await SystemSettings.create({}));

    res.json({
      success: true,
      data: {
        timezone: settings.timezone,
        session_timeout: settings.session_timeout,
        password_policy: settings.password_policy,
        maintenance_mode: settings.maintenance_mode
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
  getCollegeAnalytics,
  exportCollegesCsv,
  bulkImportColleges,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  exportUsersCsv,
  bulkImportUsers,
  getDashboardAnalytics,
  getCollegeAnalyticsComparison,
  getUserAnalytics,
  getAuditLogs,
  exportAuditLogs,
  getUserActivityLog,
  exportAnalytics,
  getSystemSettings,
  updateSystemSettings,
  getPublicSystemSettings
};
