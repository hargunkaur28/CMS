import { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import SystemSettings from '../models/SystemSettings.js';
import Session from '../models/Session.js';
import Student from '../models/Student.js';

const DEFAULT_STUDENT_PASSWORD = 'Student@123';
const STUDENT_LOCKOUT_MS = 15 * 1000;
const PASSWORD_CHANGE_ROLES = new Set(['STUDENT', 'TEACHER', 'PARENT', 'LIBRARIAN']);
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const loginUser = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const settings = await SystemSettings.findOne();
    const configuredAttempts = Number(settings?.rate_limiting?.max_failed_attempts || 3);
    const studentMaxFailedAttempts = Math.min(5, Math.max(3, configuredAttempts));
    const sessionTimeoutMinutes = settings?.session_timeout || 30;
    const normalizedIdentifier = String(identifier).trim();
    const emailRegex = new RegExp(`^${escapeRegExp(normalizedIdentifier)}$`, 'i');

    let user = await User.findOne({
      $or: [
        { email: emailRegex },
        { registrationId: normalizedIdentifier }
      ]
    });

    // Legacy fallback: bootstrap a missing login user from student profile email.
    if (!user) {
      const normalizedEmail = normalizedIdentifier.toLowerCase();
      const student = await Student.findOne({ 'personalInfo.email': new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') });
      if (student) {
        const fullName = `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim() || normalizedIdentifier;
        user = new User({
          name: fullName,
          email: normalizedEmail,
          password: DEFAULT_STUDENT_PASSWORD,
          role: 'STUDENT',
          collegeId: student.collegeId,
          isActive: true,
          mustChangePassword: true,
        });
        await user.save();

        if (!student.userId) {
          student.userId = user._id as any;
          await student.save();
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    const now = new Date();
    const isStudent = user.role === 'STUDENT';
    const lockedUntil = user.authentication?.account_locked_until;
    if (isStudent && lockedUntil && lockedUntil > now) {
      const secondsLeft = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
      return res.status(423).json({ message: `Student account locked. Try again in ${secondsLeft} second(s).` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      if (isStudent) {
        const failedAttempts = (user.authentication?.failed_login_attempts || 0) + 1;
        user.authentication.failed_login_attempts = failedAttempts;

        if (failedAttempts >= studentMaxFailedAttempts) {
          const lockUntil = new Date(now.getTime() + STUDENT_LOCKOUT_MS);
          user.authentication.account_locked_until = lockUntil;
          user.authentication.failed_login_attempts = 0;
          await user.save();
          return res.status(423).json({
            message: 'Too many failed attempts for student login. Account locked for 15 second(s).'
          });
        }

        await user.save();
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.authentication.failed_login_attempts = 0;
    user.authentication.account_locked_until = undefined;
    user.authentication.last_login = now;
    user.authentication.login_count = (user.authentication.login_count || 0) + 1;

    const normalizedRole = String(user.role || '').toUpperCase();
    if (!PASSWORD_CHANGE_ROLES.has(normalizedRole) && user.mustChangePassword) {
      user.mustChangePassword = false;
    }

    await user.save();

    const token = generateToken(user._id as any, user.role, `${sessionTimeoutMinutes}m`);
    await Session.create({
      userId: user._id,
      jwt_token: token,
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.get('user-agent') || 'unknown',
      login_timestamp: now,
      last_activity: now,
      expires_at: new Date(now.getTime() + sessionTimeoutMinutes * 60 * 1000),
      is_active: true
    });

    const shouldForcePasswordChange =
      (PASSWORD_CHANGE_ROLES.has(normalizedRole) && Boolean(user.mustChangePassword)) ||
      (normalizedRole === 'COLLEGE_ADMIN' && Boolean(user.isFirstLogin));

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      profilePicture: user.profilePicture || '',
      phone: user.phone || '',
      notificationPreferences: user.notificationPreferences || { email: true, sms: false, push: true },
      branding: user.branding || { collegeLogo: '', primaryColor: '#4f46e5', collegeDisplayName: '' },
      mustChangePassword: shouldForcePasswordChange,
      isFirstLogin: Boolean(user.isFirstLogin),
      token,
      session_timeout: sessionTimeoutMinutes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const normalizedRole = String(user.role || '').toUpperCase();
    const shouldForcePasswordChange =
      (PASSWORD_CHANGE_ROLES.has(normalizedRole) && Boolean(user.mustChangePassword)) ||
      (normalizedRole === 'COLLEGE_ADMIN' && Boolean(user.isFirstLogin));

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      profilePicture: user.profilePicture || '',
      phone: user.phone || '',
      notificationPreferences: user.notificationPreferences || { email: true, sms: false, push: true },
      branding: user.branding || { collegeLogo: '', primaryColor: '#4f46e5', collegeDisplayName: '' },
      mustChangePassword: shouldForcePasswordChange,
      isFirstLogin: Boolean(user.isFirstLogin),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }

    if (!STRONG_PASSWORD_REGEX.test(String(newPassword))) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and include an uppercase letter, a number, and a special character'
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isCurrentPasswordValid = await user.matchPassword(String(currentPassword));
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (String(currentPassword) === String(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    user.password = String(newPassword);
    user.mustChangePassword = false;
    user.isFirstLogin = false;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to change password' });
  }
};

export const logoutUser = async (req: any, res: Response) => {
  try {
    const token = req.token || String(req.headers.authorization || '').split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, message: 'No active session token found' });
    }

    await Session.updateOne(
      { jwt_token: token, is_active: true },
      { $set: { is_active: false, last_activity: new Date() } }
    );

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to logout' });
  }
};

export const updateUserProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      email,
      phone,
      profilePicture,
      notificationPreferences,
      branding,
    } = req.body || {};

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof email === 'string' && email.trim()) user.email = email.trim().toLowerCase();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof profilePicture === 'string') user.profilePicture = profilePicture;

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      user.notificationPreferences = {
        email: Boolean(notificationPreferences.email),
        sms: Boolean(notificationPreferences.sms),
        push: Boolean(notificationPreferences.push),
      };
    }

    if (branding && typeof branding === 'object') {
      user.branding = {
        collegeLogo: branding.collegeLogo || user.branding?.collegeLogo,
        primaryColor: branding.primaryColor || user.branding?.primaryColor || '#4f46e5',
        collegeDisplayName: branding.collegeDisplayName || user.branding?.collegeDisplayName,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture || '',
        notificationPreferences: user.notificationPreferences,
        branding: user.branding,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

export const getActiveSessions = async (req: any, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.user?._id, is_active: true, expires_at: { $gt: new Date() } })
      .sort({ last_activity: -1 })
      .select('_id ip_address user_agent login_timestamp last_activity expires_at');

    return res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load sessions' });
  }
};

export const revokeSession = async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const updated = await Session.findOneAndUpdate(
      { _id: sessionId, userId: req.user?._id, is_active: true },
      { $set: { is_active: false, last_activity: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.status(200).json({ success: true, message: 'Session revoked' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to revoke session' });
  }
};

export const logoutAllSessions = async (req: any, res: Response) => {
  try {
    await Session.updateMany(
      { userId: req.user?._id, is_active: true },
      { $set: { is_active: false, last_activity: new Date() } }
    );

    return res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to logout all sessions' });
  }
};

export const uploadUserAsset = async (req: any, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/profile-assets/${file.filename}`;
    return res.status(200).json({ success: true, data: { url: fileUrl, name: file.originalname, mime: file.mimetype } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};
