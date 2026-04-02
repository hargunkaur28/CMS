import { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import SystemSettings from '../models/SystemSettings.js';
import Session from '../models/Session.js';
import Student from '../models/Student.js';

const DEFAULT_STUDENT_PASSWORD = 'Student@123';
const STUDENT_LOCKOUT_MS = 15 * 1000;

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

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
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
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
