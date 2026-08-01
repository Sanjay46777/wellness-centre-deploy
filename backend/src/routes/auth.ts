import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { pool } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validate';
import { logger } from '../utils/logger';
import { sendEmail, getResetUrl } from '../services/email';
import { UserRole, UserStatus } from '../types';

const router: ReturnType<typeof Router> = Router();

const registerStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  student_id: z.string().min(1),
  phone: z.string().optional(),
});

const registerHeadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['student', 'head_counsellor', 'admin']),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  role: z.enum(['student', 'head_counsellor', 'admin']),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

function signToken(user: { id: number; email: string; role: UserRole }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}

router.post(
  '/register/student',
  validateBody(registerStudentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, full_name, student_id, phone } = req.body;
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        throw new AppError(409, 'Email already registered');
      }
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        `INSERT INTO users (email, password_hash, full_name, role, student_id, phone, email_verified, status)
         VALUES (?, ?, ?, ?, ?, ?, true, 'approved')`,
        [email, hash, full_name, 'student', student_id, phone || null]
      );
      const insertId = (result as any).insertId;
      logger.info(`Student registered: ${email}`);
      res.status(201).json({
        message: 'Registration successful. You can now sign in.',
        user_id: insertId,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/register/head-counsellor',
  validateBody(registerHeadSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, full_name, phone } = req.body;
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        throw new AppError(409, 'Email already registered');
      }
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        `INSERT INTO users (email, password_hash, full_name, role, phone, email_verified, status)
         VALUES (?, ?, ?, ?, ?, true, 'pending')`,
        [email, hash, full_name, 'head_counsellor', phone || null]
      );
      const insertId = (result as any).insertId;
      logger.info(`Head counsellor registered: ${email}`);
      res.status(201).json({
        message: 'Registration submitted. Please wait for admin approval.',
        user_id: insertId,
        status: 'pending',
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/login', validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, full_name, role, status, email_verified FROM users WHERE email = ? AND role = ?',
      [email, role]
    );
    const users = rows as any[];
    if (users.length === 0) {
      throw new AppError(401, 'Invalid email or password');
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }
    if (user.status === 'pending') {
      throw new AppError(403, 'Your account is pending approval');
    }
    if (user.status === 'rejected') {
      throw new AppError(403, 'Your registration was rejected');
    }
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    logger.info(`User logged in: ${email}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;
      const [rows] = await pool.execute(
        'SELECT id, email, full_name FROM users WHERE email = ? AND role = ?',
        [email, role]
      );
      const users = rows as any[];
      if (users.length === 0) {
        return res.json({
          message: 'If an account exists, a reset link has been sent to your email.',
        });
      }
      const user = users[0];
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await pool.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );
      const resetUrl = getResetUrl(token);
      await sendEmail({
        to: user.email,
        subject: 'Reset your Wellness Centre password',
        text: `Hi ${user.full_name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`,
        html: `<p>Hi ${user.full_name},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
      });
      logger.info(`Password reset requested: ${email}`);
      res.json({
        message: 'If an account exists, a reset link has been sent to your email.',
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const [rows] = await pool.execute(
        `SELECT t.id, t.user_id, t.expires_at, t.used_at
         FROM password_reset_tokens t
         WHERE t.token = ?`,
        [token]
      );
      const tokens = rows as any[];
      if (tokens.length === 0) {
        throw new AppError(400, 'Invalid or expired token');
      }
      const record = tokens[0];
      if (record.used_at) {
        throw new AppError(400, 'Token has already been used');
      }
      if (new Date(record.expires_at) < new Date()) {
        throw new AppError(400, 'Token has expired');
      }
      const hash = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, record.user_id]);
      await pool.execute('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [
        record.id,
      ]);
      logger.info(`Password reset completed: user ${record.user_id}`);
      res.json({ message: 'Password reset successfully. Please sign in.' });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: number;
      email: string;
      role: UserRole;
    };
    const [rows] = await pool.execute(
      'SELECT id, email, full_name, role, student_id, phone, status FROM users WHERE id = ?',
      [decoded.id]
    );
    const users = rows as any[];
    if (users.length === 0) {
      throw new AppError(404, 'User not found');
    }
    res.json({ user: users[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
